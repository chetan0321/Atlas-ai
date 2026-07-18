/**
 * Atlas.AI — Template Guard
 *
 * AST-based structural validator for template-generated code.
 * Catches deterministic problems (missing exports, renamed functions)
 * BEFORE they reach the coordinator LLM.
 *
 * Why AST instead of LLM for this?
 * - Structural checks are binary: export exists or it doesn't.
 * - LLMs guess. AST parsers don't.
 * - The coordinator LLM handles semantic issues (did the logic change?).
 *   The guard handles structural issues (did exports disappear?).
 */

import { parse }    from '@babel/parser'
import _traverse    from '@babel/traverse'

// @babel/traverse uses CommonJS default export — handle both ESM and CJS
const traverse = _traverse.default || _traverse

// ─── AST helpers ─────────────────────────────────────────────────────────────

/**
 * Extract all exported identifiers from a JSX/JS source file.
 *
 * @param {string} sourceCode - File content
 * @returns {{ named: string[], hasDefault: boolean }}
 */
export function extractExports(sourceCode) {
  const named      = []
  let   hasDefault = false

  try {
    const ast = parse(sourceCode, {
      sourceType:  'module',
      errorRecovery: true,           // Don't throw on minor syntax errors
      plugins: ['jsx', 'typescript'],
    })

    traverse(ast, {
      // export function Foo() {} or export const Foo = ...
      ExportNamedDeclaration(path) {
        const decl = path.node.declaration
        if (decl?.type === 'FunctionDeclaration' && decl.id?.name) {
          named.push(decl.id.name)
        }
        if (decl?.type === 'VariableDeclaration') {
          for (const declarator of decl.declarations) {
            if (declarator.id?.name) named.push(declarator.id.name)
          }
        }
        // export { Foo, Bar }
        for (const specifier of (path.node.specifiers || [])) {
          if (specifier.exported?.name) named.push(specifier.exported.name)
        }
      },
      // export default function() {} or export default Foo
      ExportDefaultDeclaration() {
        hasDefault = true
      },
    })
  } catch (err) {
    // Unparseable file — return empty (guard will skip, not crash)
    console.warn('[Guard] AST parse error (non-fatal):', err.message?.slice(0, 80))
  }

  return { named: [...new Set(named)], hasDefault }
}

// ─── Main guard ───────────────────────────────────────────────────────────────

/**
 * Run structural checks against AI-generated files for a template match.
 *
 * @param {object} templateMatch - Result from matchTemplate()
 * @param {Record<string, string>} generatedFiles - { filepath: content }
 * @param {Array<{filename, content}>} templateSections - Original sections loaded by loader.js
 * @returns {Array<{ severity: 'error'|'warning', file: string, message: string, autoFixable: boolean }>}
 */
export function runGuardChecks(templateMatch, generatedFiles, templateSections = []) {
  const issues = []

  if (!templateMatch?.template || !templateSections.length) return issues

  for (const section of templateSections) {
    // Find the corresponding generated file (match by filename fragment)
    const generated = Object.entries(generatedFiles).find(([path]) =>
      path.includes(section.filename.replace('.jsx', '').replace('.js', ''))
    )

    if (!generated) continue
    const [generatedPath, generatedContent] = generated

    // Extract exports from template baseline
    const { named: templateExports } = extractExports(section.content)
    if (templateExports.length === 0) continue // No exports to check

    // Extract exports from AI-generated version
    const { named: generatedExports } = extractExports(generatedContent)

    // Find missing exports
    const missing = templateExports.filter(e => !generatedExports.includes(e))

    for (const exportName of missing) {
      issues.push({
        severity:    'error',
        file:        generatedPath,
        message:     `Missing export: "${exportName}" (defined in template ${section.filename})`,
        autoFixable: false,
        hint:        `Re-add: export function ${exportName}(...) { ... }`,
      })
    }

    // Warn about unexpected new exports (may indicate the AI rewrote instead of customized)
    const unexpected = generatedExports.filter(e => !templateExports.includes(e))
    if (unexpected.length > 3) {
      issues.push({
        severity:    'warning',
        file:        generatedPath,
        message:     `${unexpected.length} new exports added (${unexpected.slice(0, 3).join(', ')}...) — verify AI customized instead of rewrote`,
        autoFixable: false,
        hint:        'Check if template structure was preserved',
      })
    }
  }

  return issues
}

/**
 * Summarize guard results for logging and coordinator prompt injection.
 *
 * @param {Array} issues - Output from runGuardChecks()
 * @returns {{ hasErrors: boolean, hasCritical: boolean, summary: string }}
 */
export function summarizeGuardResults(issues) {
  const errors   = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  if (issues.length === 0) {
    return { hasErrors: false, hasCritical: false, summary: '✅ All structural checks passed.' }
  }

  const lines = [
    errors.length   > 0 ? `❌ ${errors.length} structural error(s):` : null,
    ...errors.map(e   => `  • ${e.file}: ${e.message}`),
    warnings.length > 0 ? `⚠️  ${warnings.length} warning(s):` : null,
    ...warnings.map(w => `  • ${w.file}: ${w.message}`),
  ].filter(Boolean)

  return {
    hasErrors:   errors.length > 0,
    hasCritical: errors.length > 0,
    summary:     lines.join('\n'),
  }
}
