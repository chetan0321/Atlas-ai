import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'

// Vercel Hobby = 60s max, Vercel Pro = up to 300s
// Increase to 300 if you're on Vercel Pro
export const maxDuration = 60

// ─── Shared Groq client ───────────────────────────────────────────────────────
function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

function parseJSON(raw, fallback) {
  const cleaned = raw
    .trim()
    .replace(/^```json\n?/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return fallback
  }
}

// ─── Agent runners (inline, reduced tokens for speed) ────────────────────────
async function runFrontend(blueprint, tier) {
  const groq = getGroq()
  const r = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4000,
    messages: [
      {
        role: 'system',
        content: `You are a senior React/Next.js frontend developer.
Generate ONLY frontend files. Return a JSON object: { "filepath": "content" }.
Use Next.js 14 App Router + Tailwind CSS. For Tier 1 use plain HTML/CSS/JS.
Return ONLY the JSON object. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Project: ${blueprint.projectName}\nDescription: ${blueprint.description}\nPages: ${JSON.stringify(blueprint.pages)}\nFeatures: ${JSON.stringify(blueprint.features)}\nTier: ${tier}`,
      },
    ],
  })
  return parseJSON(r.choices[0].message.content, { 'app/page.jsx': r.choices[0].message.content })
}

async function runBackend(blueprint, tier) {
  if (tier === 1) return {}
  const groq = getGroq()
  const r = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4000,
    messages: [
      {
        role: 'system',
        content: `You are a senior Next.js backend developer.
Generate ONLY API route files. Return a JSON object: { "filepath": "content" }.
Use Next.js 14 App Router API format. Use Supabase for DB.
Return ONLY the JSON object. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Project: ${blueprint.projectName}\nAPI Routes: ${JSON.stringify(blueprint.apiRoutes)}\nDB Tables: ${JSON.stringify(blueprint.dbTables)}\nFeatures: ${JSON.stringify(blueprint.features)}\nTier: ${tier}`,
      },
    ],
  })
  return parseJSON(r.choices[0].message.content, { 'app/api/example/route.js': r.choices[0].message.content })
}

async function runSchema(blueprint, tier) {
  if (tier === 1) return {}
  const groq = getGroq()
  const r = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: `You are a database architect. Generate SQL schema + seed files.
Return a JSON object: { "database/schema.sql": "...", "database/seed.sql": "..." }.
Use Supabase-compatible PostgreSQL with RLS policies.
Return ONLY the JSON object. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Project: ${blueprint.projectName}\nDB Tables: ${JSON.stringify(blueprint.dbTables)}\nTier: ${tier}`,
      },
    ],
  })
  return parseJSON(r.choices[0].message.content, { 'database/schema.sql': r.choices[0].message.content })
}

async function runSecurity(blueprint, tier) {
  if (tier === 1) return {}
  const groq = getGroq()
  const r = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: `You are a security engineer. Generate middleware + auth helpers.
Return a JSON object: { "middleware.js": "...", "lib/auth/validate.js": "..." }.
Return ONLY the JSON object. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Project: ${blueprint.projectName}\nAPI Routes: ${JSON.stringify(blueprint.apiRoutes)}\nTier: ${tier}`,
      },
    ],
  })
  return parseJSON(r.choices[0].message.content, { 'lib/auth/validate.js': r.choices[0].message.content })
}

async function runTests(blueprint, tier) {
  const groq = getGroq()
  const r = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: `You are a QA engineer. Generate Jest + React Testing Library test files.
Return a JSON object: { "__tests__/api.test.js": "..." }.
Return ONLY the JSON object. No markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Project: ${blueprint.projectName}\nFeatures: ${JSON.stringify(blueprint.features)}\nTier: ${tier}`,
      },
    ],
  })
  return parseJSON(r.choices[0].message.content, { '__tests__/app.test.js': r.choices[0].message.content })
}

async function runCoordinator(allFiles, blueprint) {
  const groq = getGroq()
  const preview = Object.entries(allFiles)
    .map(([p, c]) => `=== ${p} ===\n${String(c).slice(0, 200)}...`)
    .join('\n\n')
    .slice(0, 4000)

  const r = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: `You are a software architect reviewing generated code.
Return JSON: { "issues": [], "fixes": {}, "summary": "string" }.
Return ONLY valid JSON. No markdown.`,
      },
      {
        role: 'user',
        content: `Review files for "${blueprint.projectName}":\n${preview}`,
      },
    ],
  })
  const result = parseJSON(r.choices[0].message.content, { issues: [], fixes: {}, summary: 'Code generation complete.' })
  return {
    files: { ...allFiles, ...(result.fixes || {}) },
    summary: result.summary || 'Code generation complete.',
  }
}

function getAgent(filePath) {
  if (filePath.includes('__tests__') || filePath.includes('.test.')) return 'test'
  if (filePath.includes('database/') || filePath.includes('schema') || filePath.includes('migration')) return 'schema'
  if (filePath.includes('middleware') || filePath.includes('auth/') || filePath.includes('validate')) return 'security'
  if (filePath.includes('api/')) return 'backend'
  return 'frontend'
}

// ─── Main route ───────────────────────────────────────────────────────────────
export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { projectId, blueprintId } = await request.json()

  // Verify ownership + get blueprint
  const { data: project } = await supabase
    .from('projects').select('*').eq('id', projectId).eq('user_id', user.id).single()
  if (!project) return new Response('Project not found', { status: 404 })

  const { data: blueprint } = await supabase
    .from('blueprints').select('*').eq('id', blueprintId).single()
  if (!blueprint) return new Response('Blueprint not found', { status: 404 })

  const blueprintJson = blueprint.json
  const tier = blueprintJson?.tier || 1

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)) } catch {}
      }

      try {
        // ── Create generation_run record ──────────────────────────────────────
        const { data: run } = await supabase
          .from('generation_runs')
          .insert({
            project_id:   projectId,
            blueprint_id: blueprintId,
            status:       'running',
            tier,
            started_at:   new Date().toISOString(),
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

        // Mark project as generating
        await supabase.from('projects').update({ status: 'generating' }).eq('id', projectId)

        send({
          type:            'started',
          generationRunId: run.id,
          agentStatuses: {
            frontend:    'running',
            backend:     tier > 1 ? 'running' : 'skipped',
            schema:      tier > 1 ? 'running' : 'skipped',
            security:    tier > 1 ? 'running' : 'skipped',
            test:        'running',
            coordinator: 'waiting',
          },
          status: 'running',
        })

        // ── Run 5 agents in parallel ──────────────────────────────────────────
        const [frontend, backend, schema, security, test] = await Promise.allSettled([
          runFrontend(blueprintJson, tier),
          runBackend(blueprintJson, tier),
          runSchema(blueprintJson, tier),
          runSecurity(blueprintJson, tier),
          runTests(blueprintJson, tier),
        ])

        const afterAgents = {
          frontend:    frontend.status  === 'fulfilled' ? 'done' : 'error',
          backend:     backend.status   === 'fulfilled' ? 'done' : tier > 1 ? 'error' : 'skipped',
          schema:      schema.status    === 'fulfilled' ? 'done' : tier > 1 ? 'error' : 'skipped',
          security:    security.status  === 'fulfilled' ? 'done' : tier > 1 ? 'error' : 'skipped',
          test:        test.status      === 'fulfilled' ? 'done' : 'error',
          coordinator: 'running',
        }

        await supabase.from('generation_runs')
          .update({ agent_statuses: afterAgents })
          .eq('id', run.id)

        send({ type: 'progress', agentStatuses: afterAgents, status: 'running' })

        // ── Coordinator ───────────────────────────────────────────────────────
        const merged = {
          ...(frontend.status === 'fulfilled' ? frontend.value : {}),
          ...(backend.status  === 'fulfilled' ? backend.value  : {}),
          ...(schema.status   === 'fulfilled' ? schema.value   : {}),
          ...(security.status === 'fulfilled' ? security.value : {}),
          ...(test.status     === 'fulfilled' ? test.value     : {}),
        }

        const { files, summary } = await runCoordinator(merged, blueprintJson)

        const finalStatuses = { ...afterAgents, coordinator: 'done' }
        await supabase.from('generation_runs')
          .update({ agent_statuses: finalStatuses })
          .eq('id', run.id)

        send({ type: 'progress', agentStatuses: finalStatuses, status: 'running' })

        // ── Save files ────────────────────────────────────────────────────────
        const fileRows = Object.entries(files).map(([filePath, content]) => ({
          project_id:    projectId,
          generation_id: run.id,
          file_path:     filePath,
          content:       typeof content === 'string' ? content : JSON.stringify(content, null, 2),
          agent:         getAgent(filePath),
        }))

        if (fileRows.length > 0) {
          await supabase.from('generated_files').insert(fileRows)
        }

        // ── Mark complete ─────────────────────────────────────────────────────
        await supabase.from('generation_runs').update({
          status:            'completed',
          completed_at:      new Date().toISOString(),
          total_tokens_used: fileRows.length,
        }).eq('id', run.id)

        await supabase.from('projects').update({ status: 'generated' }).eq('id', projectId)

        send({ type: 'completed', fileCount: fileRows.length, generationRunId: run.id })

      } catch (err) {
        console.error('Inline generation error:', err)
        send({ type: 'error', message: err.message || 'Generation failed' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
