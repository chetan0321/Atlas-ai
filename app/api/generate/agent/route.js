import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createChatCompletion } from '@/lib/claude/client'

export const maxDuration = 60 // Vercel hobby max

function parseJSON(raw, fallback) {
  const cleaned = raw.trim().replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
  try { return JSON.parse(cleaned) } catch { return fallback }
}

async function runAgent(agentName, blueprint, tier) {
  const model = 'llama-3.3-70b-versatile'

  if (agentName === 'frontend') {
    const r = await createChatCompletion({
      model, max_tokens: 4000,
      messages: [
        { role: 'system', content: `You are a senior Next.js developer. Generate ONLY frontend files. Return a JSON object: { "filepath": "content" }. Return ONLY the JSON object.` },
        { role: 'user', content: `Project: ${blueprint.projectName}\nPages: ${JSON.stringify(blueprint.pages)}\nFeatures: ${JSON.stringify(blueprint.features)}\nTier: ${tier}` }
      ]
    })
    return parseJSON(r.choices[0].message.content, { 'app/page.jsx': r.choices[0].message.content })
  }

  if (agentName === 'backend') {
    if (tier === 1) return {}
    const r = await createChatCompletion({
      model, max_tokens: 4000,
      messages: [
        { role: 'system', content: `You are a Next.js backend developer. Generate ONLY API route files. Return a JSON object: { "filepath": "content" }. Return ONLY the JSON object.` },
        { role: 'user', content: `Project: ${blueprint.projectName}\nAPI Routes: ${JSON.stringify(blueprint.apiRoutes)}\nDB Tables: ${JSON.stringify(blueprint.dbTables)}\nTier: ${tier}` }
      ]
    })
    return parseJSON(r.choices[0].message.content, { 'app/api/example/route.js': r.choices[0].message.content })
  }

  if (agentName === 'schema') {
    if (tier === 1) return {}
    const r = await createChatCompletion({
      model, max_tokens: 2000,
      messages: [
        { role: 'system', content: `You are a DB architect. Generate SQL schema + seed files. Return JSON: { "database/schema.sql": "..." }. Return ONLY JSON.` },
        { role: 'user', content: `Project: ${blueprint.projectName}\nDB Tables: ${JSON.stringify(blueprint.dbTables)}` }
      ]
    })
    return parseJSON(r.choices[0].message.content, { 'database/schema.sql': r.choices[0].message.content })
  }

  if (agentName === 'security') {
    if (tier === 1) return {}
    const r = await createChatCompletion({
      model, max_tokens: 2000,
      messages: [
        { role: 'system', content: `You are a security engineer. Generate middleware + auth helpers. Return JSON: { "middleware.js": "..." }. Return ONLY JSON.` },
        { role: 'user', content: `Project: ${blueprint.projectName}\nAPI Routes: ${JSON.stringify(blueprint.apiRoutes)}` }
      ]
    })
    return parseJSON(r.choices[0].message.content, { 'lib/auth/validate.js': r.choices[0].message.content })
  }

  if (agentName === 'test') {
    const r = await createChatCompletion({
      model, max_tokens: 2000,
      messages: [
        { role: 'system', content: `You are a QA engineer. Generate Jest test files. Return JSON: { "__tests__/app.test.js": "..." }. Return ONLY JSON.` },
        { role: 'user', content: `Project: ${blueprint.projectName}\nFeatures: ${JSON.stringify(blueprint.features)}` }
      ]
    })
    return parseJSON(r.choices[0].message.content, { '__tests__/app.test.js': r.choices[0].message.content })
  }

  return {}
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { runId, agent } = await request.json()
    const admin = createAdminClient()

    // Get run and blueprint
    const { data: run } = await admin.from('generation_runs').select('*, projects(user_id)').eq('id', runId).single()
    if (!run || run.projects.user_id !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: blueprint } = await admin.from('blueprints').select('json').eq('id', run.blueprint_id).single()

    // Execute agent
    const files = await runAgent(agent, blueprint.json, run.tier)
    
    // Save generated files to DB
    const fileRows = Object.entries(files).map(([filePath, content]) => ({
      project_id:    run.project_id,
      generation_id: run.id,
      file_path:     filePath,
      content:       typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      agent:         agent,
    }))

    if (fileRows.length > 0) {
      await admin.from('generated_files').insert(fileRows)
    }

    // Update agent status in generation_runs
    const newStatuses = { ...run.agent_statuses, [agent]: 'done' }
    await admin.from('generation_runs').update({ agent_statuses: newStatuses }).eq('id', runId)

    return NextResponse.json({ success: true, agent, count: fileRows.length, agentStatuses: newStatuses })
  } catch (err) {
    console.error(`Agent ${request.body?.agent} error:`, err)
    
    // Update status to error
    try {
      const { runId, agent } = await request.clone().json()
      if (runId && agent) {
        const admin = createAdminClient()
        const { data: run } = await admin.from('generation_runs').select('agent_statuses').eq('id', runId).single()
        if (run) {
          await admin.from('generation_runs').update({
            agent_statuses: { ...run.agent_statuses, [agent]: 'error' }
          }).eq('id', runId)
        }
      }
    } catch {}

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
