import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { action, projectId, description, research, blueprint, riskReport, blueprintId } = body

    // ── Save research stage ──
    if (action === 'research') {
      if (projectId) {
        await supabase.from('projects').update({
          description, research_brief: research, current_step: 'research'
        }).eq('id', projectId)
        return NextResponse.json({ projectId })
      } else {
        const { data, error } = await supabase.from('projects').insert({
          user_id: user.id,
          name: description.slice(0, 60),
          description,
          research_brief: research,
          status: 'draft',
          current_step: 'research'
        }).select().single()
        if (error) throw error
        return NextResponse.json({ projectId: data.id })
      }
    }

    // ── Save blueprint stage ──
    if (action === 'blueprint') {
      await supabase.from('projects').update({
        name: blueprint.projectName,
        tier: blueprint.tier,
        current_step: 'blueprint'
      }).eq('id', projectId)

      const { data: existing } = await supabase
        .from('blueprints')
        .select('id')
        .eq('project_id', projectId)
        .eq('approved', false)
        .maybeSingle()

      if (existing) {
        await supabase.from('blueprints').update({ json: blueprint }).eq('id', existing.id)
        return NextResponse.json({ blueprintId: existing.id })
      } else {
        const { data, error } = await supabase.from('blueprints').insert({
          project_id: projectId, json: blueprint, approved: false
        }).select().single()
        if (error) throw error
        return NextResponse.json({ blueprintId: data.id })
      }
    }

    // ── Save risk stage ──
    if (action === 'risk') {
      await supabase.from('projects').update({ current_step: 'risk' }).eq('id', projectId)

      const { data: existing } = await supabase
        .from('risk_reports')
        .select('id')
        .eq('blueprint_id', blueprintId)
        .maybeSingle()

      if (existing) {
        await supabase.from('risk_reports').update({ report: riskReport }).eq('id', existing.id)
        return NextResponse.json({ riskReportId: existing.id })
      } else {
        const { data, error } = await supabase.from('risk_reports').insert({
          project_id: projectId, blueprint_id: blueprintId, report: riskReport
        }).select().single()
        if (error) throw error
        return NextResponse.json({ riskReportId: data.id })
      }
    }

    // ── Finalize (Save to Dashboard) ──
    if (action === 'finalize') {
      await supabase.from('blueprints').update({
        approved: true, approved_at: new Date().toISOString()
      }).eq('id', blueprintId)

      await supabase.from('projects').update({
        status: 'blueprint', current_step: 'saved'
      }).eq('id', projectId)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}