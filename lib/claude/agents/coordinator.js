/**
 * Atlas.AI — Coordinator Agent (Upgraded)
 *
 * 3-layer review process:
 * 1. AST guard  — structural checks (missing exports, broken contracts)
 * 2. LLM review — semantic checks (import mismatches, route inconsistencies)
 * 3. Retry loop — if issues found, ask LLM to fix and re-guard (max 2 retries)
 * 4. Fallback   — if all retries fail, apply design tokens to raw template
 */

import { createChatCompletion } from '../client.js'
import { runGuardChecks, summarizeGuardResults } from '../../template-engine/guard.js'

const MAX_RETRIES = 2

// ─── Main coordinator ─────────────────────────────────────────────────────────

/**
 * @param {object} agentOutputs  - { frontend, backend, schema, security, test }
 * @param {object} blueprint     - The project blueprint JSON
 * @param {object} templateMatch - Result from matchTemplate() — may be null
 * @param {Array}  templateSections - Flat array of { filename, content } from loader
 * @returns {Promise<{ files, summary, issues, guardIssues, retries, usedTemplate }>}
 */
export async function coordinatorAgent(agentOutputs, blueprint, templateMatch = null, templateSections = []) {
  // Merge all agent outputs
  let allFiles = {
    ...agentOutputs.frontend,
    ...agentOutputs.backend,
    ...agentOutputs.schema,
    ...agentOutputs.security,
    ...agentOutputs.test,
  }

  let retries    = 0
  let guardIssues = []
  let lastLLMResult = { issues: [], fixes: {}, summary: 'Code generation complete.' }

  while (retries <= MAX_RETRIES) {
    // ── Step 1: AST guard ─────────────────────────────────────────────────────
    guardIssues = runGuardChecks(templateMatch, allFiles, templateSections)
    const guardSummary = summarizeGuardResults(guardIssues)

    console.log(`[Coordinator] Retry ${retries} — Guard: ${guardSummary.summary.slice(0, 100)}`)

    // ── Step 2: LLM semantic review ───────────────────────────────────────────
    const filePreview = Object.entries(allFiles)
      .map(([path, content]) => `=== ${path} ===\n${String(content).slice(0, 250)}...`)
      .join('\n\n')
      .slice(0, 5000)

    const guardContext = guardSummary.hasCritical
      ? `\n\nCRITICAL STRUCTURAL ISSUES FOUND BY STATIC ANALYSIS:\n${guardSummary.summary}\n\nYou MUST fix ALL of the above issues in the "fixes" field.`
      : guardSummary.hasErrors
      ? `\n\nSTRUCTURAL WARNINGS:\n${guardSummary.summary}`
      : '\n\nAll structural checks passed.'

    const templateContext = templateMatch?.template
      ? `\nTemplate used: ${templateMatch.template.id} (${templateMatch.confidence}% confidence, strategy: ${templateMatch.strategy})`
      : '\nNo template — scratch generation.'

    const r = await createChatCompletion({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      messages: [
        {
          role: 'system',
          content: `You are a senior software architect doing a final code review.
Review generated files for consistency, correctness, and template fidelity.

Return ONLY valid JSON:
{
  "issues": ["brief description of each issue found"],
  "fixes": { "file/path.js": "corrected complete file content if needed" },
  "summary": "1-2 sentence summary of what was generated and any key decisions"
}

## Core Rules
- Only include a file in "fixes" if it genuinely needs correction
- Do NOT rewrite files that are fine — only fix what's broken
- Do NOT add placeholder "TODO" comments
- Fixes must be complete, working file content — not diffs or snippets

## GUARD 1 — Styling Consistency
If the TEMPLATE SECTIONS use inline style={{}} objects with CSS variables (var(--dash-primary), var(--shop-primary), etc.):
- Generated files MUST follow the same pattern
- Do NOT convert style={{}} to Tailwind classes or vice versa — stay consistent with the template
- CSS variables in style={{}} MUST use the correct var() syntax: style={{ color: 'var(--dash-primary, #7c3aed)' }}

## GUARD 2 — rgba() Bug Detection
NEVER generate: rgba(#hexcode, alpha) — this is INVALID CSS.
rgba() takes numbers: rgba(124, 58, 237, 0.1)
If you see rgba(#..., ...) in any generated file → it MUST be in "fixes" with the correct rgba(r,g,b,a) values.
Correct approach: pre-compute rgba values as string literals:
  { bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)', color: '#4ade80' }

## GUARD 3 — Test Alignment
If test files use getByTestId('metric-card-mrr') or getAllByTestId('metric-card'):
- The corresponding component MUST have data-testid="metric-card-mrr" on the correct element
- If data-testid is missing from components but referenced in tests → add it to the component fix
- data-testid values must be STABLE — based on props (id, label), not array index

## GUARD 4 — Page Completeness
Every page file (pages/*.jsx, app/*/page.jsx) MUST have minimum viable content:
- A proper default export function
- At least one <h1> with the page title
- At least the Layout wrapper if a Layout component is available
- NO completely empty files or files containing only "export default function() {}"

## GUARD 5 — Import Consistency
- Every import must resolve to an exported name from that file
- If frontend fetches /api/users, there must be a backend file at app/api/users/route.js
- If a component imports { StatusBadge } from './table', StatusBadge must be exported from table`,
        },
        {
          role: 'user',
          content: `Review files for "${blueprint.projectName}":${templateContext}${guardContext}${templateSections.length > 0 ? `\n\nTEMPLATE SECTIONS USED (match their style pattern in generated code):\n${templateSections.slice(0, 3).map(s => `• ${s.filename}`).join('\n')}` : ''}

Files:
${filePreview}

Check for:
1. rgba(#hex, alpha) bugs — must be rgba(r,g,b,a) with numbers
2. data-testid missing from components that tests query via getByTestId
3. Empty page files (no default export, no <h1>)
4. Import names that don't match actual exports
5. Frontend fetch paths that don't match backend route files`,
        },
      ],
    })

    // ── Parse LLM result ──────────────────────────────────────────────────────
    const raw = (r.choices[0].message.content || '')
      .trim()
      .replace(/^```json\n?/, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    try {
      lastLLMResult = JSON.parse(raw)
    } catch {
      // Parse failed — keep previous result, don't retry
      console.warn('[Coordinator] LLM result parse failed — using previous result')
      break
    }

    // Apply LLM fixes
    if (lastLLMResult.fixes && Object.keys(lastLLMResult.fixes).length > 0) {
      allFiles = { ...allFiles, ...lastLLMResult.fixes }
    }

    // ── Check if issues are resolved ──────────────────────────────────────────
    const stillHasCritical = guardSummary.hasCritical && retries < MAX_RETRIES
    if (!stillHasCritical) break

    retries++
    console.log(`[Coordinator] Critical issues remain — retry ${retries}/${MAX_RETRIES}`)
  }

  // ── Step 3: Design token fallback ─────────────────────────────────────────
  // If coordinator couldn't fix critical issues AND we used a template,
  // apply brand tokens to the raw template as a safe fallback
  const finalGuard = runGuardChecks(templateMatch, allFiles, templateSections)
  const stillCritical = finalGuard.some(i => i.severity === 'error')

  let usedTemplateFallback = false
  if (stillCritical && templateMatch?.template && templateSections.length > 0) {
    console.warn('[Coordinator] Critical issues unresolved — applying design token fallback to raw template')
    allFiles = applyDesignTokenFallback(allFiles, templateSections, blueprint)
    usedTemplateFallback = true
  }

  return {
    files:           allFiles,
    summary:         lastLLMResult.summary || 'Code generation complete.',
    issues:          lastLLMResult.issues  || [],
    guardIssues:     finalGuard,
    retries,
    usedTemplate:    !!templateMatch?.template,
    usedFallback:    usedTemplateFallback,
  }
}

// ─── Design token fallback ────────────────────────────────────────────────────

/**
 * Apply brand design tokens from the blueprint to raw template sections.
 * Used when coordinator retries are exhausted — gives user a styled output
 * even if AI customization failed.
 *
 * @param {Record<string, string>} currentFiles
 * @param {Array<{filename, content}>} templateSections
 * @param {object} blueprint
 * @returns {Record<string, string>}
 */
function applyDesignTokenFallback(currentFiles, templateSections, blueprint) {
  const tokens = extractDesignTokens(blueprint)
  const patched = { ...currentFiles }

  const stylesSection = templateSections.find(s => s.filename === 'styles.css')
  if (stylesSection) {
    let css = stylesSection.content
    // Apply brand tokens
    css = css.replace(/#7c3aed/g,             tokens.primary)
    css = css.replace(/#a78bfa/g,             tokens.secondary)
    css = css.replace(/rgba\(124,58,237/g,    `rgba(${hexToRgb(tokens.primary)}`)
    css = css.replace(/rgba\(139,92,246/g,    `rgba(${hexToRgb(tokens.secondary)}`)
    patched['styles/template-fallback.css']  = css
    patched['GENERATION_NOTE.md'] = `# Generation Note\n\nTemplate customization encountered issues after ${MAX_RETRIES} retries.\nDesign tokens applied from your blueprint: primary=${tokens.primary}.\nCore template structure is preserved and functional.`
  }

  return patched
}

function extractDesignTokens(blueprint) {
  return {
    primary:   blueprint.theme?.primaryColor   || '#7c3aed',
    secondary: blueprint.theme?.secondaryColor || '#a78bfa',
    brandName: blueprint.projectName           || 'YourBrand',
    tagline:   blueprint.tagline               || 'Built for builders.',
  }
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `${r},${g},${b}`
}
