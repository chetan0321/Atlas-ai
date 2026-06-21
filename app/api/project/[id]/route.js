import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: project } = await supabase
      .from('projects').select('*').eq('id', id).single()

    const { data: blueprint } = await supabase
      .from('blueprints').select('*').eq('project_id', id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()

    let riskReport = null
    if (blueprint) {
      const { data } = await supabase
        .from('risk_reports').select('*').eq('blueprint_id', blueprint.id).maybeSingle()
      riskReport = data
    }

    return NextResponse.json({ project, blueprint, riskReport })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}