import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createChatCompletion } from '@/lib/claude/client'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { description } = await request.json()

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const stream = await createChatCompletion({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are a senior product researcher and CTO advisor. 
When given a project idea, research and return a clear structured brief.

Format your response with these exact sections:

## What This App Does
2-3 sentences on the core purpose and who it's for.

## Top Competitors
List 3 real competitors: name + what they do well + what they lack.

## Must-Have Features for MVP
List 6-8 specific features. Mark each as MUST or NICE-TO-HAVE.

## Recommended Tech Stack
Frontend, Backend, Database, Auth, Hosting — one line each with brief reason why.

## Common Pitfalls to Avoid
3-4 specific mistakes developers make building this type of app.

## Estimated Build Time
Realistic estimate for a solo developer using AI tools.

Be specific and practical. No generic advice.`
        },
        {
          role: 'user',
          content: `Research this project idea: ${description}`
        }
      ]
    })

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) {
            controller.enqueue(new TextEncoder().encode(text))
          }
        }
        controller.close()
      }
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      }
    })

  } catch (error) {
    console.error('Research API error:', error)
    return NextResponse.json(
      { error: error.message || 'Research failed' },
      { status: 500 }
    )
  }
}