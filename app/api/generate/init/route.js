import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { projectId, blueprintId, forceStrategy } = await request.json()

    // Verify ownership
    const { data: project } = await supabase
      .from('projects').select('*').eq('id', projectId).eq('user_id', user.id).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: blueprint } = await supabase
      .from('blueprints').select('*').eq('id', blueprintId).single()
    if (!blueprint) return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 })

    const blueprintJson = blueprint.json
    const tier = blueprintJson?.tier || 1

    const admin = createAdminClient()

    // Create the run
    const { data: run, error: runErr } = await admin
      .from('generation_runs')
      .insert({
        project_id:   projectId,
        blueprint_id: blueprintId,
        status:       'running',
        tier,
        started_at:   new Date().toISOString(),
        force_strategy: forceStrategy || null,
        agent_statuses: {
          frontend:    'running',
          backend:     tier > 1 ? 'running' : 'skipped',
          schema:      tier > 1 ? 'running' : 'skipped',
          security:    tier > 1 ? 'running' : 'skipped',
          test:        'running',
          coordinator: 'waiting',
        },
      })
      .select().single()

    if (runErr) throw new Error(runErr.message)

    await admin.from('projects').update({ status: 'generating' }).eq('id', projectId)

    return NextResponse.json({ runId: run.id, tier })
  } catch (err) {
    console.error('Init error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
