import Groq from 'groq-sdk'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function coordinatorAgent(agentOutputs, blueprint) {
  // Merge all agent outputs into one flat file map
  const allFiles = {
    ...agentOutputs.frontend,
    ...agentOutputs.backend,
    ...agentOutputs.schema,
    ...agentOutputs.security,
    ...agentOutputs.test,
  }

  const fileList = Object.entries(allFiles)
    .map(([path, content]) => `=== ${path} ===\n${String(content).slice(0, 300)}...`)
    .join('\n\n')
    .slice(0, 6000)

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 3000,
    messages: [
      {
        role: 'system',
        content: `You are a senior software architect reviewing generated code for consistency.
Review the file list and identify mismatches between frontend and backend.

Return a JSON object:
{
  "issues": ["issue 1", "issue 2"],
  "fixes": {
    "file/path.js": "corrected file content if needed"
  },
  "summary": "brief summary of what was generated"
}

Return ONLY valid JSON. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Review these generated files for the project "${blueprint.projectName}":

${fileList}

Identify any import mismatches, route name inconsistencies, or missing connections between frontend fetches and backend routes.`,
      },
    ],
  })

  const raw = response.choices[0].message.content
    .trim()
    .replace(/^```json\n?/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim()

  let coordinatorResult = { issues: [], fixes: {}, summary: 'Code generation complete.' }
  try {
    coordinatorResult = JSON.parse(raw)
  } catch {
    // Coordinator parse failed — still return the merged files untouched
  }

  // Apply any fixes from the coordinator
  const finalFiles = { ...allFiles, ...(coordinatorResult.fixes || {}) }

  return {
    files: finalFiles,
    summary: coordinatorResult.summary || 'Code generation complete.',
    issues: coordinatorResult.issues || [],
  }
}
