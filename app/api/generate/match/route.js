/**
 * POST /api/generate/match
 *
 * Runs template matching for a project description BEFORE generation starts.
 * Returns the match result so the UI can show TemplateMatchCard.
 *
 * This is a fast route (< 2s) — just an LLM call, no file generation.
 * The client shows the Preview UI while user is on the risk/blueprint step.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { matchTemplate } from '@/lib/template-engine/matcher'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { description } = await request.json()
    if (!description?.trim()) {
      return NextResponse.json({ match: null, strategy: 'generate' })
    }

    const result = await matchTemplate(description)

    return NextResponse.json({
      match: result.template ? {
        strategy:   result.strategy,
        confidence: result.confidence,
        reason:     result.reason,
        template: {
          id:          result.template.id,
          name:        result.template.name,
          description: result.template.description,
          features:    result.template.features,
          tier:        result.template.tier,
          hasAuth:     result.template.hasAuth,
          hasPayments: result.template.hasPayments,
          keywords:    result.template.keywords?.slice(0, 6),
        },
      } : null,
      strategy: result.strategy,
    })

  } catch (err) {
    console.error('[Match API] Error:', err)
    // Non-fatal — return no match so generation proceeds normally
    return NextResponse.json({ match: null, strategy: 'generate' })
  }
}
