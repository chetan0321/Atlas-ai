import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function testAgent(blueprint, tier) {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4000,
    messages: [
      {
        role: 'system',
        content: `You are a senior QA engineer.
Generate ONLY test files for the app described.
Do NOT generate application code, API routes, or database files.

Return a JSON object where keys are file paths and values are complete file contents.
Example:
{
  "__tests__/api.test.js": "full test content",
  "__tests__/components.test.js": "full test content"
}

Rules:
- Use Jest + React Testing Library
- Write meaningful test descriptions
- Include happy path and error case tests
- Generate a jest.config.js if needed
- Return ONLY the JSON object. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Generate test files for this app:
Project: ${blueprint.projectName}
Features: ${JSON.stringify(blueprint.features)}
API Routes: ${JSON.stringify(blueprint.apiRoutes)}
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
    return { '__tests__/app.test.js': raw }
  }
}
