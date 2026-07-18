/**
 * Atlas.AI — Template Matcher
 *
 * Uses the existing Groq LLM to match user intent to a pre-built template.
 * Falls back to scratch generation on any error (never crashes the pipeline).
 *
 * Zod validation guards against:
 * - Hallucinated template IDs
 * - Malformed JSON (unquoted keys, plain text responses)
 * - Out-of-range confidence scores
 */

import { z } from 'zod'
import { createChatCompletion } from '../claude/client.js'
import { TEMPLATES } from '../../templates/index.js'

// ─── Confidence tiers ─────────────────────────────────────────────────────────

export const CONFIDENCE = {
  FULL:       { min: 85, strategy: 'customize'  }, // Template + AI customization
  STRUCTURAL: { min: 60, strategy: 'hybrid'     }, // Template architecture only
  SCRATCH:    { min: 0,  strategy: 'generate'   }, // Full scratch generation
}

const SCRATCH_FALLBACK = { strategy: 'generate', template: null, confidence: 0, reason: 'Fallback' }

// ─── Zod schema ───────────────────────────────────────────────────────────────

const MatchSchema = z.object({
  templateId: z.string().max(60),
  confidence: z.number().min(0).max(100),
  reason:     z.string().max(300),
})

// ─── Main matcher ─────────────────────────────────────────────────────────────

/**
 * Match a user's project description to the best available template.
 *
 * @param {string} userIdea - The user's project description
 * @returns {Promise<{strategy: string, template: object|null, confidence: number, reason: string}>}
 */
export async function matchTemplate(userIdea) {
  if (!userIdea?.trim()) return SCRATCH_FALLBACK
  if (TEMPLATES.length === 0) return SCRATCH_FALLBACK

  const templateList = TEMPLATES
    .map(t => `${t.id}: ${t.name} — keywords: ${t.keywords.slice(0, 8).join(', ')}`)
    .join('\n')

  // ── LLM call ──
  let parsed
  try {
    const r = await createChatCompletion({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: `You match project ideas to pre-built templates. Return ONLY valid JSON.

Available templates:
${templateList}

Rules:
- If no template is a good fit (< 60% match), use templateId "none"
- confidence is 0-100 (how well the template fits the idea)
- reason is one sentence explaining the match

Return ONLY: {"templateId": "id-or-none", "confidence": 0-100, "reason": "one sentence"}`
        },
        { role: 'user', content: `Match this project: ${userIdea}` }
      ]
    })

    const raw   = r.choices[0].message.content || ''
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim()
    parsed = JSON.parse(clean)
  } catch (err) {
    console.warn('[Matcher] LLM or parse failed, using scratch fallback:', err.message)
    return SCRATCH_FALLBACK
  }

  // ── Zod validation ──
  const validated = MatchSchema.safeParse(parsed)
  if (!validated.success) {
    console.warn('[Matcher] Schema validation failed:', validated.error.format())
    return SCRATCH_FALLBACK
  }

  const { templateId, confidence, reason } = validated.data

  // Explicit "none" or unknown ID → scratch
  if (templateId === 'none') {
    return { ...SCRATCH_FALLBACK, confidence, reason }
  }

  const template = TEMPLATES.find(t => t.id === templateId)
  if (!template) {
    console.warn('[Matcher] Unknown template ID returned by LLM:', templateId)
    return { ...SCRATCH_FALLBACK, confidence, reason }
  }

  // ── Classify by confidence tier ──
  console.log(`[Matcher] Matched: ${templateId} (${confidence}% confidence) — ${reason}`)

  if (confidence >= CONFIDENCE.FULL.min)
    return { strategy: 'customize', template, confidence, reason }

  if (confidence >= CONFIDENCE.STRUCTURAL.min)
    return { strategy: 'hybrid', template, confidence, reason }

  return { strategy: 'generate', template: null, confidence, reason }
}
