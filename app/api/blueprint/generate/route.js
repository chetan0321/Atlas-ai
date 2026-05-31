import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(request) {
  try {
    const { description, research } = await request.json()

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 3000,
      messages: [
        {
          role: 'system',
          content: `You are a senior software architect. 
Given a project description and research brief, return a structured app blueprint.

CRITICAL: Return ONLY a valid JSON object. No markdown, no code blocks, no explanation. Just raw JSON.

The JSON must follow this exact structure:
{
  "projectName": "string",
  "description": "string",
  "tier": 1,
  "pages": [
    { "name": "string", "description": "string" }
  ],
  "features": [
    { "name": "string", "description": "string", "priority": "must" }
  ],
  "apiRoutes": [
    { "method": "GET", "path": "/api/example", "description": "string" }
  ],
  "dbTables": [
    { "name": "string", "fields": [{ "name": "string", "type": "string" }] }
  ]
}

Rules:
- tier: 1 = static site, 2 = fullstack with auth + DB, 3 = advanced with payments/realtime
- features priority must be: "must", "should", or "could"
- apiRoutes method must be: "GET", "POST", "PUT", or "DELETE"
- Include 3-6 pages, 5-8 features, 3-6 API routes, 2-4 DB tables
- Be specific to the actual project, not generic`
        },
        {
          role: 'user',
          content: `Project: ${description}\n\nResearch: ${research}`
        }
      ]
    })

    const raw = response.choices[0].message.content.trim()

    // Clean up in case model adds markdown fences anyway
    const cleaned = raw
      .replace(/^```json\n?/, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    const blueprint = JSON.parse(cleaned)

    return NextResponse.json({ blueprint })

  } catch (error) {
    console.error('Blueprint generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate blueprint. Try again.' },
      { status: 500 }
    )
  }
}