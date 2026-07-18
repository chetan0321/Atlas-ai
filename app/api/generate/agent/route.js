import { createClient }       from '@/lib/supabase/server'
import { createAdminClient }  from '@/lib/supabase/admin'
import { NextResponse }       from 'next/server'
import { createChatCompletion, createOpenRouterCompletion, getContent } from '@/lib/claude/client'
import { getSectionsForAgent } from '@/lib/template-engine/loader'
import { getTemplate }         from '@/templates/index'
import { matchTemplate }       from '@/lib/template-engine/matcher'

export const maxDuration = 60 // Vercel hobby max

// ── JSON parser with markdown-fence cleanup ────────────────────────────────────
function parseJSON(raw, fallback) {
  const cleaned = raw
    .trim()
    .replace(/^```json\n?/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim()
  try { return JSON.parse(cleaned) } catch { return fallback }
}

// ── Build template context string for agent prompts ───────────────────────────
function buildTemplateContext(sections = []) {
  if (!sections.length) return ''
  return `\n\nTEMPLATE SECTIONS TO CUSTOMIZE (do NOT rewrite logic, only customize copy/colors/brand text):\n${
    sections.map(s => `=== ${s.filename} ===\n${s.content}`).join('\n\n')
  }`
}

// ── Agent runners ─────────────────────────────────────────────────────────────
async function runAgent(agentName, blueprint, tier, templateSections = []) {
  const model = 'llama-3.3-70b-versatile'
  const templateContext = buildTemplateContext(templateSections)

  if (agentName === 'frontend') {
    const r = await createChatCompletion({
      model, max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: `You are a senior Next.js developer. Generate ONLY frontend files.
Return a JSON object: { "filepath": "content" }. Return ONLY the JSON object, no markdown.${
  templateContext ? '\n\nIf TEMPLATE SECTIONS are provided, build on them instead of starting from scratch. Customize brand copy, colors, and features but preserve ALL exported component names, prop signatures, and logic.' : ''
}

## CRITICAL RULES — violations will be auto-rejected:
1. NEVER use rgba(#hex, alpha) — it is invalid CSS. Always use rgba(r,g,b,a) with integer values.
   BAD:  background: \`rgba(\${color}, 0.1)\` where color is '#4ade80'
   GOOD: background: 'rgba(74,222,128,0.1)'

2. Every component that a test might query MUST have data-testid attributes.
   Pattern: data-testid={\`component-name-\${id}\`}

3. Every page file (app/*/page.jsx) MUST have a real default export with at minimum:
   - A <main> or <section> wrapper
   - An <h1> with the page title
   - The Layout component if one is available in the project

4. When using CSS variables, ALWAYS include a fallback:
   style={{ color: 'var(--dash-primary, #7c3aed)' }}
   NOT: style={{ color: 'var(--dash-primary)' }}`,
        },
        {
          role: 'user',
          content: `Project: ${blueprint.projectName}\nDescription: ${blueprint.description || ''}\nPages: ${JSON.stringify(blueprint.pages)}\nFeatures: ${JSON.stringify(blueprint.features)}\nTier: ${tier}${templateContext}`,
        },
      ],
    })
    return parseJSON(r.choices[0].message.content, { 'app/page.jsx': r.choices[0].message.content })
  }

  if (agentName === 'backend') {
    if (tier === 1) return {}
    const r = await createChatCompletion({
      model, max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: `You are a Next.js backend developer. Generate ONLY API route files.
Return a JSON object: { "filepath": "content" }. Return ONLY the JSON object, no markdown.`,
        },
        {
          role: 'user',
          content: `Project: ${blueprint.projectName}\nAPI Routes: ${JSON.stringify(blueprint.apiRoutes)}\nDB Tables: ${JSON.stringify(blueprint.dbTables)}\nTier: ${tier}${templateContext}`,
        },
      ],
    })
    return parseJSON(r.choices[0].message.content, { 'app/api/example/route.js': r.choices[0].message.content })
  }

  if (agentName === 'schema') {
    if (tier === 1) return {}
    const r = await createChatCompletion({
      model, max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: `You are a DB architect. Generate SQL schema + seed files.
Return JSON: { "database/schema.sql": "..." }. Return ONLY JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Project: ${blueprint.projectName}\nDB Tables: ${JSON.stringify(blueprint.dbTables)}${templateContext}`,
        },
      ],
    })
    return parseJSON(r.choices[0].message.content, { 'database/schema.sql': r.choices[0].message.content })
  }

  if (agentName === 'security') {
    if (tier === 1) return {}
    // OpenRouter Qwen for better reasoning on security edge cases
    const r = await createOpenRouterCompletion({
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: `You are a security engineer. Generate middleware + auth helpers.
Return JSON: { "middleware.js": "..." }. Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Project: ${blueprint.projectName}\nAPI Routes: ${JSON.stringify(blueprint.apiRoutes)}${templateContext}`,
        },
      ],
    })
    const rawSec = getContent(r)
    return parseJSON(rawSec, { 'lib/auth/validate.js': rawSec })
  }

  if (agentName === 'test') {
    const r = await createChatCompletion({
      model, max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: `You are a QA engineer. Generate Jest + React Testing Library test files.
Return JSON: { "__tests__/app.test.js": "..." }. Return ONLY JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Project: ${blueprint.projectName}\nFeatures: ${JSON.stringify(blueprint.features)}${templateContext}`,
        },
      ],
    })
    return parseJSON(r.choices[0].message.content, { '__tests__/app.test.js': r.choices[0].message.content })
  }

  return {}
}

// ── POST /api/generate/agent ───────────────────────────────────────────────────
export async function POST(request) {
  let parsedBody = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    parsedBody = await request.json()
    const { runId, agent } = parsedBody
    const admin = createAdminClient()

    // ── Fetch run + verify ownership ─────────────────────────────────────────
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

    const blueprint = blueprintRow.json
    const tier      = run.tier || 1

    // ── Resolve template match ────────────────────────────────────────────────
    // Priority: stored match → force_strategy override → live match
    let templateSections = []

    const shouldUseScratch = run.force_strategy === 'generate'
    const storedTemplateId = run.template_id

    if (!shouldUseScratch) {
      let templateToLoad = null

      if (storedTemplateId && run.template_strategy !== 'generate') {
        // Already matched (e.g. from /api/generate/match pre-run)
        templateToLoad = getTemplate(storedTemplateId)
      } else if (!storedTemplateId) {
        // No match stored yet — run it now
        try {
          const description = blueprint.description || blueprint.projectName || ''
          const match = await matchTemplate(description)
          console.log(`[Agent/${agent}] Template match: ${match.template?.id || 'none'} (${match.confidence}%, ${match.strategy})`)
          if (match.strategy !== 'generate' && match.template) {
            templateToLoad = match.template
            // Persist match so coordinator and other agents share the same result
            await admin.from('generation_runs').update({
              template_id:         match.template.id,
              template_strategy:   match.strategy,
              template_confidence: match.confidence,
              template_reason:     match.reason,
            }).eq('id', runId)
          }
        } catch (matchErr) {
          console.warn(`[Agent/${agent}] Template matching failed, proceeding without template:`, matchErr.message)
        }
      }

      if (templateToLoad) {
        templateSections = await getSectionsForAgent(templateToLoad, agent)
        console.log(`[Agent/${agent}] Loaded ${templateSections.length} template section(s) from ${templateToLoad.id}`)
      }
    } else {
      console.log(`[Agent/${agent}] force_strategy=generate — skipping template`)
    }

    // ── Execute agent ────────────────────────────────────────────────────────
    const files = await runAgent(agent, blueprint, tier, templateSections)

    // ── Save generated files ─────────────────────────────────────────────────
    const fileRows = Object.entries(files).map(([filePath, content]) => ({
      project_id:    run.project_id,
      generation_id: run.id,
      file_path:     filePath,
      content:       typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      agent,
    }))

    if (fileRows.length > 0) {
      await admin.from('generated_files').insert(fileRows)
    }

    // ── Update agent status ───────────────────────────────────────────────────
    const newStatuses = { ...(run.agent_statuses || {}), [agent]: 'done' }
    await admin.from('generation_runs')
      .update({ agent_statuses: newStatuses })
      .eq('id', runId)

    return NextResponse.json({
      success: true,
      agent,
      count:        fileRows.length,
      agentStatuses: newStatuses,
      usedTemplate: templateSections.length > 0,
    })

  } catch (err) {
    console.error(`[Agent] Error:`, err)

    // Best-effort: mark the specific agent as error in DB
    try {
      const { runId, agent } = parsedBody || {}
      if (runId && agent) {
        const admin = createAdminClient()
        const { data: run } = await admin.from('generation_runs').select('agent_statuses').eq('id', runId).single()
        if (run) {
          await admin.from('generation_runs').update({
            agent_statuses: { ...run.agent_statuses, [agent]: 'error' },
          }).eq('id', runId)
        }
      }
    } catch {}

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
