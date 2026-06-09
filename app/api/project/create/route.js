import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { description, blueprint } = await request.json()

    // 1. Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: blueprint.projectName,
        description: description,
        status: 'blueprint',
        tier: blueprint.tier
      })
      .select()
      .single()

    if (projectError) throw projectError

    // 2. Save the blueprint
    const { data: savedBlueprint, error: blueprintError } = await supabase
      .from('blueprints')
      .insert({
        project_id: project.id,
        json: blueprint,
        approved: true,
        approved_at: new Date().toISOString()
      })
      .select()
      .single()

    if (blueprintError) throw blueprintError

    return NextResponse.json({
      success: true,
      projectId: project.id,
      blueprintId: savedBlueprint.id
    })

  } catch (error) {
    console.error('Save project error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}