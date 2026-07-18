/**
 * Atlas.AI — Template Section Loader
 *
 * Loads template sections from disk for a specific agent.
 * Uses async fs.readFile (never blocks the BullMQ event loop).
 * In-memory Map cache ensures subsequent jobs read from RAM, not disk.
 */

import { readFile } from 'fs/promises'
import { join }     from 'path'

// ── In-memory section cache (lives for the life of the worker process) ────────
const sectionCache = new Map()

/**
 * Load the template sections relevant to a specific agent.
 * Returns [] if template is null or has no sections for this agent.
 *
 * @param {object|null} template - The matched template object (from TEMPLATES registry)
 * @param {string} agentName    - 'frontend' | 'backend' | 'schema' | 'security' | 'test'
 * @returns {Promise<Array<{filename: string, content: string}>>}
 */
export async function getSectionsForAgent(template, agentName) {
  if (!template) return []

  const sectionFiles = template.sections?.[agentName] || []
  if (sectionFiles.length === 0) return []

  const sections = await Promise.all(
    sectionFiles.map(async (file) => {
      const cacheKey = `${template.id}/${agentName}/${file}`

      if (sectionCache.has(cacheKey)) {
        return sectionCache.get(cacheKey)
      }

      try {
        const filePath = join(process.cwd(), 'templates', template.id, 'sections', file)
        const content  = await readFile(filePath, 'utf-8')
        const section  = { filename: file, content }
        sectionCache.set(cacheKey, section)
        return section
      } catch (err) {
        console.warn(`[Loader] Could not read section ${template.id}/${file}:`, err.message)
        return null
      }
    })
  )

  return sections.filter(Boolean) // Remove any nulls from failed reads
}

/**
 * Pre-warm the section cache at worker startup.
 * Prevents cold-start latency on the first generation job.
 *
 * @param {Array} templates - The full TEMPLATES array from the registry
 */
export async function preloadAllTemplates(templates) {
  const agentNames = ['frontend', 'backend', 'schema', 'security', 'test']

  await Promise.all(
    templates.flatMap(t =>
      agentNames.map(a => getSectionsForAgent(t, a))
    )
  )

  const cacheSize = sectionCache.size
  console.log(`[Loader] Cache warmed: ${cacheSize} section(s) loaded for ${templates.length} template(s)`)
}

/**
 * Clear the section cache (used in dev hot-reload).
 */
export function clearSectionCache() {
  sectionCache.clear()
  console.log('[Loader] Section cache cleared')
}

/**
 * Format template sections as a string for injection into agent prompts.
 * Truncates long files to stay within token limits.
 *
 * @param {Array<{filename: string, content: string}>} sections
 * @param {number} maxCharsPerSection - Default 3000 chars (~750 tokens)
 * @returns {string}
 */
export function formatSectionsForPrompt(sections, maxCharsPerSection = 3000) {
  if (!sections || sections.length === 0) return ''

  return sections
    .map(s => {
      const content = s.content.length > maxCharsPerSection
        ? s.content.slice(0, maxCharsPerSection) + '\n// ... [truncated for token limit]'
        : s.content
      return `=== TEMPLATE SECTION: ${s.filename} ===\n${content}`
    })
    .join('\n\n')
}
