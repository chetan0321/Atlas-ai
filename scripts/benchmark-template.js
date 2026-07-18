#!/usr/bin/env node
/**
 * Atlas.AI — Template Performance Benchmark
 *
 * Measures template engine performance across all registered templates.
 * Run: node scripts/benchmark-template.js
 *
 * Output:
 *   - Matcher latency per template
 *   - Loader cache performance (cold vs warm)
 *   - Template registry size
 *   - Per-section load times
 *
 * Pass --verbose for per-section breakdown
 * Pass --template=landing-lead to benchmark one template only
 */

import { performance } from 'perf_hooks'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const args    = process.argv.slice(2)
const verbose = args.includes('--verbose')
const targetId = args.find(a => a.startsWith('--template='))?.split('=')[1]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`
  if (ms < 1000) return `${ms.toFixed(1)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function separator(label = '') {
  const line = '─'.repeat(60)
  if (label) console.log(`\n${line}\n  ${label}\n${line}`)
  else console.log(line)
}

async function time(label, fn) {
  const start = performance.now()
  const result = await fn()
  const elapsed = performance.now() - start
  return { result, elapsed, label }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏛️  Atlas.AI Template Benchmark\n')

  // 1. Registry load time
  separator('Template Registry')
  const { result: templates, elapsed: registryTime } = await time('Registry load', async () => {
    const { TEMPLATES } = await import('../templates/index.js')
    return TEMPLATES
  })

  const filtered = targetId ? templates.filter(t => t.id === targetId) : templates
  console.log(`  Templates registered: ${templates.length}`)
  console.log(`  Registry load time:   ${fmt(registryTime)}`)
  if (targetId) console.log(`  Filtering to:         ${targetId}`)
  console.log(`  Running benchmarks:   ${filtered.length} template(s)`)

  if (filtered.length === 0) {
    console.error(`\n❌ No templates found${targetId ? ` matching '${targetId}'` : ''}`)
    process.exit(1)
  }

  // 2. Loader benchmarks
  separator('Section Loader Performance')
  const { getSectionsForAgent, clearSectionCache } = await import('../lib/template-engine/loader.js')
  const agentNames = ['frontend', 'backend', 'schema', 'security', 'test']
  const results = []

  for (const template of filtered) {
    const templateResults = { id: template.id, cold: {}, warm: {} }

    // Cold load (cache empty)
    clearSectionCache()
    for (const agent of agentNames) {
      const sectionFiles = template.sections?.[agent] || []
      if (sectionFiles.length === 0) {
        templateResults.cold[agent] = { elapsed: 0, sections: 0, skipped: true }
        continue
      }
      const { elapsed, result } = await time(`${template.id}/${agent} cold`, () => getSectionsForAgent(template, agent))
      templateResults.cold[agent] = { elapsed, sections: result.length }
    }

    // Warm load (cache filled)
    for (const agent of agentNames) {
      if (templateResults.cold[agent]?.skipped) { templateResults.warm[agent] = { elapsed: 0, sections: 0, skipped: true }; continue }
      const { elapsed, result } = await time(`${template.id}/${agent} warm`, () => getSectionsForAgent(template, agent))
      templateResults.warm[agent] = { elapsed, sections: result.length }
    }

    results.push(templateResults)
  }

  // Print loader results
  for (const r of results) {
    console.log(`\n  📦 ${r.id}`)
    const relevant = agentNames.filter(a => !r.cold[a]?.skipped)
    for (const agent of relevant) {
      const cold = r.cold[agent]
      const warm = r.warm[agent]
      const speedup = cold.elapsed > 0 ? (cold.elapsed / warm.elapsed).toFixed(0) : '∞'
      console.log(`     ${agent.padEnd(10)} cold: ${fmt(cold.elapsed).padEnd(8)} warm: ${fmt(warm.elapsed).padEnd(8)} speedup: ${speedup}x  [${cold.sections} section(s)]`)
    }
  }

  // 3. Matcher benchmark (test against known descriptions)
  separator('Matcher Performance (LLM Latency)')
  const TEST_DESCRIPTIONS = [
    'A landing page for my new SaaS product with a waitlist form',
    'A scientific calculator with history and formula library',
    'A portfolio website to showcase my design work',
    'An admin dashboard with metrics, user table, and settings',
    'A recipe sharing app with user authentication and search', // should be scratch
  ]

  console.log('  Testing matcher (requires GROQ_API_KEY in environment)…\n')

  let matcherAvailable = true
  try {
    const { matchTemplate } = await import('../lib/template-engine/matcher.js')

    for (const desc of TEST_DESCRIPTIONS) {
      const { result, elapsed } = await time('match', () => matchTemplate(desc))
      const matchedId = result.template?.id || 'none (scratch)'
      console.log(`  "${desc.slice(0, 50)}…"`)
      console.log(`    → ${matchedId} [${result.confidence}% confidence, ${result.strategy}] — ${fmt(elapsed)}`)
    }
  } catch (err) {
    if (err.message?.includes('No GROQ_API_KEY')) {
      matcherAvailable = false
      console.log('  ⚠️  GROQ_API_KEY not set — skipping matcher benchmark')
    } else {
      console.error('  ❌ Matcher error:', err.message)
    }
  }

  // 4. Template health check
  separator('Template Health Report')
  const { readFile } = await import('fs/promises')
  const { join } = await import('path')

  let allHealthy = true
  for (const template of filtered) {
    const issues = []

    // Check manifest fields
    if (!template.keywords?.length) issues.push('missing keywords')
    if (!template.sections?.frontend?.length) issues.push('no frontend sections')
    if (template.performanceBaseline?.lighthouseScore === undefined) issues.push('no lighthouse baseline')
    if (!template.testStatus) issues.push('no testStatus')

    // Check sections exist on disk
    const allSections = Object.values(template.sections || {}).flat()
    for (const file of allSections) {
      const p = join(process.cwd(), 'templates', template.id, 'sections', file)
      try {
        await readFile(p, 'utf-8')
      } catch {
        issues.push(`missing section file: ${file}`)
        allHealthy = false
      }
    }

    const icon = issues.length === 0 ? '✅' : '⚠️'
    console.log(`  ${icon} ${template.id.padEnd(25)} v${template.version}  tier:${template.tier}  keywords:${template.keywords?.length}  sections:${allSections.length}`)
    if (verbose && issues.length > 0) {
      issues.forEach(i => console.log(`      ⚠️  ${i}`))
    }
  }

  separator()
  console.log('\n📊 Benchmark Summary\n')
  console.log(`  Templates checked:  ${filtered.length}`)
  console.log(`  Registry healthy:   ${allHealthy ? '✅' : '⚠️  issues found (run --verbose)'}`)
  console.log(`  Matcher available:  ${matcherAvailable ? '✅' : '⚠️  no API key'}`)
  console.log(`\n  💡 Tip: run with --verbose to see full section breakdown\n`)
}

main().catch(err => {
  console.error('\n❌ Benchmark failed:', err)
  process.exit(1)
})
