import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createChatCompletion } from '@/lib/claude/client'

export const maxDuration = 60

function parseJSON(raw, fallback) {
  const cleaned = raw.trim().replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
  try { return JSON.parse(cleaned) } catch { return fallback }
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { runId } = await request.json()
    const admin = createAdminClient()

    const { data: run } = await admin.from('generation_runs').select('*, projects(user_id)').eq('id', runId).single()
    if (!run || run.projects.user_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: blueprint } = await admin.from('blueprints').select('json').eq('id', run.blueprint_id).single()
    const { data: existingFiles } = await admin.from('generated_files').select('file_path, content').eq('generation_id', runId)

    // Run coordinator
    const preview = existingFiles.map(f => `=== ${f.file_path} ===\n${String(f.content).slice(0, 200)}...`).join('\n\n').slice(0, 4000)

    const r = await createChatCompletion({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      messages: [
        { role: 'system', content: `You are a software architect reviewing code. Return JSON: { "fixes": { "filepath": "content" }, "summary": "string" }. Return ONLY valid JSON.` },
        { role: 'user', content: `Review files for "${blueprint.json.projectName}":\n${preview}` }
      ]
    })

    const result = parseJSON(r.choices[0].message.content, { fixes: {}, summary: 'Code generation complete.' })
    
    // Save fixes
    const fixRows = Object.entries(result.fixes || {}).map(([filePath, content]) => ({
      project_id:    run.project_id,
      generation_id: run.id,
      file_path:     filePath,
      content:       typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      agent:         'coordinator',
    }))

    if (fixRows.length > 0) {
      await admin.from('generated_files').insert(fixRows)
    }

    const totalTokens = (existingFiles?.length || 0) + fixRows.length

    // Mark complete
    await admin.from('generation_runs').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      total_tokens_used: totalTokens,
      agent_statuses: { ...run.agent_statuses, coordinator: 'done' }
    }).eq('id', run.id)

    await admin.from('projects').update({ status: 'generated' }).eq('id', run.project_id)

    return NextResponse.json({ success: true, count: totalTokens })

  } catch (err) {
    console.error('Coordinator error:', err)
    try {
      const { runId } = await request.clone().json()
      if (runId) {
        const admin = createAdminClient()
        await admin.from('generation_runs').update({
          status: 'failed',
          completed_at: new Date().toISOString()
        }).eq('id', runId)
      }
    } catch {}
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
