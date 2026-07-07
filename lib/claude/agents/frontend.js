import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function frontendAgent(blueprint, tier) {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 8000,
    messages: [
      {
        role: 'system',
        content: `You are a senior React/Next.js frontend developer.
Generate ONLY frontend files for the app described.
Do NOT generate API routes, database code, auth logic, or test files.

Return a JSON object where keys are file paths and values are complete file contents.
Example format:
{
  "app/page.jsx": "full file content here",
  "components/Header.jsx": "full file content here",
  "components/Hero.jsx": "full file content here"
}

Rules:
- Use Next.js 14 App Router structure
- Use Tailwind CSS for all styling
- Make components clean and production-ready
- Include proper imports in every file
- For Tier 1: generate pure HTML/CSS/JS files instead
- Return ONLY the JSON object. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Generate frontend files for this app:
Project: ${blueprint.projectName}
Description: ${blueprint.description}
Pages: ${JSON.stringify(blueprint.pages)}
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
    return { 'app/page.jsx': raw }
  }
}
