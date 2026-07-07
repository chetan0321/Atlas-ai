import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function backendAgent(blueprint, tier) {
  if (tier === 1) return {}

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 8000,
    messages: [
      {
        role: 'system',
        content: `You are a senior Node.js/Next.js backend developer.
Generate ONLY API route files for the app described.
Do NOT generate frontend components, database schema files, or test files.

Return a JSON object where keys are file paths and values are complete file contents.
Example:
{
  "app/api/users/route.js": "full file content",
  "app/api/projects/route.js": "full file content"
}

Rules:
- Use Next.js 14 App Router API route format (export async function GET/POST)
- Include proper error handling in every route
- Use Supabase for database operations
- Import createClient from @/lib/supabase/server
- Return ONLY the JSON object. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Generate backend API routes for this app:
Project: ${blueprint.projectName}
Description: ${blueprint.description}
API Routes needed: ${JSON.stringify(blueprint.apiRoutes)}
DB Tables: ${JSON.stringify(blueprint.dbTables)}
Features: ${JSON.stringify(blueprint.features)}
Tier: ${tier}`,
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
    return { 'app/api/example/route.js': raw }
  }
}
