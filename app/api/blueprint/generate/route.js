import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOpenRouterCompletion, getContent } from '@/lib/claude/client'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { description, research } = await request.json()

    const response = await createOpenRouterCompletion({
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

    const raw = getContent(response).trim()

    // Clean up in case model adds markdown fences anyway
    const cleaned = raw
      .replace(/^```json\n?/, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    let blueprint
    try {
      blueprint = JSON.parse(cleaned)
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No valid JSON found in blueprint response')
      blueprint = JSON.parse(match[0])
    }

    return NextResponse.json({ blueprint })

  } catch (error) {
    console.error('Blueprint generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate blueprint. Try again.' },
      { status: 500 }
    )
  }
}