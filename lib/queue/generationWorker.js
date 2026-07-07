/**
 * Atlas.AI — Generation Worker
 *
 * Run in a separate terminal alongside `npm run dev`:
 *   npm run worker
 *
 * Uses --env-file=.env.local to load env vars before any imports execute.
 */

import { Worker } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

import { getRedisConnection } from './index.js'
import { frontendAgent }    from '../claude/agents/frontend.js'
import { backendAgent }     from '../claude/agents/backend.js'
import { schemaAgent }      from '../claude/agents/schema.js'
import { securityAgent }    from '../claude/agents/security.js'
import { testAgent }        from '../claude/agents/test.js'
import { coordinatorAgent } from '../claude/agents/coordinator.js'

// Use service role key — worker bypasses RLS (runs server-side only)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function getAgentForFile(filePath) {
  if (filePath.includes('__tests__') || filePath.includes('.test.')) return 'test'
  if (
    filePath.includes('database/') ||
    filePath.includes('schema') ||
    filePath.includes('migration')
  )
    return 'schema'
  if (
    filePath.includes('middleware') ||
    filePath.includes('auth/') ||
    filePath.includes('validate') ||
    filePath.includes('rateLimit')
  )
    return 'security'
  if (filePath.includes('api/')) return 'backend'
  return 'frontend'
}

// ─── Worker ──────────────────────────────────────────────────────────────────
const worker = new Worker(
  'generation',
  async (job) => {
    const { projectId, blueprintJson, tier, generationRunId } = job.data
    const supabase = getSupabase()

    // Mark as running
    await supabase
      .from('generation_runs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', generationRunId)

    // Set initial agent statuses
    await supabase
      .from('generation_runs')
      .update({
        agent_statuses: {
          frontend:    'running',
          backend:     tier > 1 ? 'running' : 'skipped',
          schema:      tier > 1 ? 'running' : 'skipped',
          security:    tier > 1 ? 'running' : 'skipped',
          test:        'running',
          coordinator: 'waiting',
        },
      })
      .eq('id', generationRunId)

    // ── Run 5 agents in parallel ──────────────────────────────────────────────
    const [frontend, backend, schema, security, test] = await Promise.allSettled([
      frontendAgent(blueprintJson, tier),
      backendAgent(blueprintJson, tier),
      schemaAgent(blueprintJson, tier),
      securityAgent(blueprintJson, tier),
      testAgent(blueprintJson, tier),
    ])

    // Update statuses after agents complete
    await supabase
      .from('generation_runs')
      .update({
        agent_statuses: {
          frontend:    frontend.status  === 'fulfilled' ? 'done' : 'error',
          backend:     backend.status   === 'fulfilled' ? 'done' : tier > 1 ? 'error' : 'skipped',
          schema:      schema.status    === 'fulfilled' ? 'done' : tier > 1 ? 'error' : 'skipped',
          security:    security.status  === 'fulfilled' ? 'done' : tier > 1 ? 'error' : 'skipped',
          test:        test.status      === 'fulfilled' ? 'done' : 'error',
          coordinator: 'running',
        },
      })
      .eq('id', generationRunId)

    // Collect outputs
    const agentOutputs = {
      frontend: frontend.status === 'fulfilled' ? frontend.value : {},
      backend:  backend.status  === 'fulfilled' ? backend.value  : {},
      schema:   schema.status   === 'fulfilled' ? schema.value   : {},
      security: security.status === 'fulfilled' ? security.value : {},
      test:     test.status     === 'fulfilled' ? test.value     : {},
    }

    // ── Run coordinator ───────────────────────────────────────────────────────
    const { files, summary, issues } = await coordinatorAgent(agentOutputs, blueprintJson)

    // Mark coordinator done
    await supabase
      .from('generation_runs')
      .update({
        agent_statuses: {
          frontend:    frontend.status  === 'fulfilled' ? 'done' : 'error',
          backend:     backend.status   === 'fulfilled' ? 'done' : tier > 1 ? 'error' : 'skipped',
          schema:      schema.status    === 'fulfilled' ? 'done' : tier > 1 ? 'error' : 'skipped',
          security:    security.status  === 'fulfilled' ? 'done' : tier > 1 ? 'error' : 'skipped',
          test:        test.status      === 'fulfilled' ? 'done' : 'error',
          coordinator: 'done',
        },
      })
      .eq('id', generationRunId)

    // ── Persist generated files ───────────────────────────────────────────────
    const fileRows = Object.entries(files).map(([filePath, content]) => ({
      project_id:    projectId,
      generation_id: generationRunId,
      file_path:     filePath,
      content:       typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      agent:         getAgentForFile(filePath),
    }))

    if (fileRows.length > 0) {
      await supabase.from('generated_files').insert(fileRows)
    }

    // ── Mark complete ─────────────────────────────────────────────────────────
    await supabase
      .from('generation_runs')
      .update({
        status:            'completed',
        completed_at:      new Date().toISOString(),
        total_tokens_used: fileRows.length,
      })
      .eq('id', generationRunId)

    await supabase
      .from('projects')
      .update({ status: 'generated' })
      .eq('id', projectId)

    console.log(`✅ Job ${job.id} complete — ${fileRows.length} files generated`)
    console.log(`   Summary: ${summary}`)
    if (issues?.length) console.log(`   Issues: ${issues.join(', ')}`)

    return { fileCount: fileRows.length, summary }
  },
  {
    connection: getRedisConnection(),
    concurrency: 2,
  }
)

worker.on('completed', (job) => {
  console.log(`✅ Generation job ${job.id} completed: ${job.returnvalue?.fileCount} files`)
})

worker.on('failed', async (job, err) => {
  console.error(`❌ Generation job ${job?.id} failed:`, err.message)
  if (job?.data?.generationRunId) {
    const supabase = getSupabase()
    await supabase
      .from('generation_runs')
      .update({ status: 'failed', error_message: err.message })
      .eq('id', job.data.generationRunId)
  }
})

console.log('🚀 Atlas.AI Generation Worker started — listening for jobs...')
