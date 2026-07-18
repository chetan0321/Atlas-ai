import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { coordinatorAgent } from '@/lib/claude/agents/coordinator'
import { getSectionsForAgent } from '@/lib/template-engine/loader'
import { getTemplate } from '@/templates/index'

export const maxDuration = 60

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { runId } = await request.json()
    const admin = createAdminClient()

    // ── Fetch run + blueprint ──────────────────────────────────────────────────
    const { data: run } = await admin
      .from('generation_runs')
      .select('*, projects(user_id)')
      .eq('id', runId)
      .single()

    if (!run || run.projects.user_id !== user.id)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: blueprintRow } = await admin
      .from('blueprints')
      .select('json')
      .eq('id', run.blueprint_id)
      .single()

    // ── Fetch all generated files from this run ────────────────────────────────
    const { data: existingFiles } = await admin
      .from('generated_files')
      .select('file_path, content, agent')
      .eq('generation_id', runId)

    // Reconstruct agent outputs map
    const agentOutputs = { frontend: {}, backend: {}, schema: {}, security: {}, test: {} }
    for (const f of (existingFiles || [])) {
      if (agentOutputs[f.agent]) {
        agentOutputs[f.agent][f.file_path] = f.content
      } else {
        agentOutputs.frontend[f.file_path] = f.content // fallback bucket
      }
    }

    // ── Reconstruct template match from stored data ────────────────────────────
    let templateMatch = null
    let templateSections = []

    if (run.template_id && run.template_strategy !== 'generate') {
      const template = getTemplate(run.template_id)
      if (template) {
        templateMatch = {
          strategy:   run.template_strategy,
          template,
          confidence: run.template_confidence,
          reason:     run.template_reason,
        }

        // Load all sections relevant to coordinator (all agents)
        const agentNames = ['frontend', 'backend', 'schema', 'security', 'test']
        const sectionArrays = await Promise.all(
          agentNames.map(a => getSectionsForAgent(template, a))
        )
        templateSections = sectionArrays.flat()
      }
    }

    // ── Run upgraded coordinator ───────────────────────────────────────────────
    const { files, summary, issues, guardIssues, retries, usedFallback } =
      await coordinatorAgent(agentOutputs, blueprintRow.json, templateMatch, templateSections)

    // ── Save coordinator fixes ────────────────────────────────────────────────
    // Only save files not already in generated_files (coordinator fixes + additions)
    const existingPaths = new Set((existingFiles || []).map(f => f.file_path))
    const newFiles = Object.entries(files).filter(([path]) => !existingPaths.has(path))

    const fixRows = newFiles.map(([filePath, content]) => ({
      project_id:    run.project_id,
      generation_id: run.id,
      file_path:     filePath,
      content:       typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      agent:         'coordinator',
    }))

    if (fixRows.length > 0) {
      await admin.from('generated_files').insert(fixRows)
    }

    // Update existing files that were fixed
    const fixedExisting = Object.entries(files).filter(([path]) => existingPaths.has(path))
    for (const [filePath, content] of fixedExisting) {
      await admin
        .from('generated_files')
        .update({ content: typeof content === 'string' ? content : JSON.stringify(content, null, 2) })
        .eq('generation_id', runId)
        .eq('file_path', filePath)
    }

    const totalCount = (existingFiles?.length || 0) + fixRows.length

    // ── Mark run complete ─────────────────────────────────────────────────────
    await admin.from('generation_runs').update({
      status:            'completed',
      completed_at:      new Date().toISOString(),
      total_tokens_used: totalCount,
      agent_statuses:    { ...run.agent_statuses, coordinator: 'done' },
    }).eq('id', run.id)

    await admin.from('projects').update({ status: 'generated' }).eq('id', run.project_id)

    // Log results
    console.log(`[Coordinator] Done — ${totalCount} files, ${retries} retries, ${guardIssues.length} guard issues`)
    if (usedFallback) console.warn('[Coordinator] Design token fallback was used')

    return NextResponse.json({
      success: true,
      count:   totalCount,
      summary,
      issues,
      guardIssues,
      retries,
      usedFallback,
    })

  } catch (err) {
    console.error('Coordinator route error:', err)
    try {
      const { runId } = await request.clone().json()
      if (runId) {
        const admin = createAdminClient()
        await admin.from('generation_runs').update({
          status:       'failed',
          completed_at: new Date().toISOString(),
        }).eq('id', runId)
      }
    } catch {}
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
