import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generationQueue } from '@/lib/queue/index'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { projectId, blueprintId } = await request.json()

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Get blueprint JSON
    const { data: blueprint } = await supabase
      .from('blueprints')
      .select('*')
      .eq('id', blueprintId)
      .single()
    if (!blueprint) return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 })

    // Create generation run record
    const { data: run, error: runError } = await supabase
      .from('generation_runs')
      .insert({
        project_id:   projectId,
        blueprint_id: blueprintId,
        status:       'queued',
        tier:         blueprint.json?.tier || 1,
        agent_statuses: {
          frontend:    'queued',
          backend:     'queued',
          schema:      'queued',
          security:    'queued',
          test:        'queued',
          coordinator: 'queued',
        },
      })
      .select()
      .single()

    if (runError) throw runError

    // Mark project as generating
    await supabase.from('projects').update({ status: 'generating' }).eq('id', projectId)

    // Enqueue BullMQ job
    const job = await generationQueue.add('generate', {
      projectId,
      blueprintJson:   blueprint.json,
      tier:            blueprint.json?.tier || 1,
      generationRunId: run.id,
    })

    return NextResponse.json({
      success:         true,
      generationRunId: run.id,
      jobId:           job.id,
    })
  } catch (error) {
    console.error('Start generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
