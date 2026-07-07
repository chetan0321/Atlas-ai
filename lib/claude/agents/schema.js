import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function schemaAgent(blueprint, tier) {
  if (tier === 1) return {}

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4000,
    messages: [
      {
        role: 'system',
        content: `You are a senior database architect.
Generate ONLY database schema and migration files.
Do NOT generate frontend, backend API routes, or test files.

Return a JSON object where keys are file paths and values are complete file contents.
Example:
{
  "database/schema.sql": "full SQL schema",
  "database/seed.sql": "sample seed data"
}

Rules:
- Generate Supabase-compatible PostgreSQL SQL
- Include proper indexes, foreign keys, and RLS policies
- Generate a schema.sql with all CREATE TABLE statements
- Generate a seed.sql with sample data
- Return ONLY the JSON object. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Generate database schema for this app:
Project: ${blueprint.projectName}
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
    return { 'database/schema.sql': raw }
  }
}
