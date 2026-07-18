import Groq from 'groq-sdk'
import { formatSectionsForPrompt } from '../../template-engine/loader.js'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function securityAgent(blueprint, tier, templateSections = []) {
  if (tier === 1) return {}

  const templateContext = templateSections.length > 0
    ? `\n\nTEMPLATE SECURITY PATTERNS TO FOLLOW:\n${formatSectionsForPrompt(templateSections)}\n\nFollow these middleware and auth patterns for the project.`
    : ''

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4000,
    messages: [
      {
        role: 'system',
        content: `You are a senior security engineer.
Generate ONLY security-related files: middleware, auth helpers, input validation, rate limiting.
Do NOT generate frontend components, business logic API routes, or test files.

Return a JSON object where keys are file paths and values are complete file contents.
Example:
{
  "middleware.js": "full middleware content",
  "lib/auth/validate.js": "validation helpers",
  "lib/auth/rateLimit.js": "rate limiting logic"
}

Rules:
- Use Next.js middleware patterns
- Include input sanitization helpers
- Add rate limiting logic using a simple in-memory store
- Generate RLS policy helpers for Supabase
- Return ONLY the JSON object. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Generate security files for this app:
Project: ${blueprint.projectName}
Features: ${JSON.stringify(blueprint.features)}
API Routes: ${JSON.stringify(blueprint.apiRoutes)}
Tier: ${tier}${templateContext}`,
      },
    ],
  })

  const raw = response.choices[0].message.content
    .trim()
    .replace(/^```json\n?/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim()

  try {
    return JSON.parse(raw)
  } catch {
    return { 'lib/auth/validate.js': raw }
  }
}
