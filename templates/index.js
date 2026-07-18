/**
 * Atlas.AI — Template Registry
 *
 * Every template in this registry is a pre-built, tested, wired-up app section.
 * The AI customizes these — it does NOT generate code from scratch.
 *
 * To add a template:
 * 1. Create templates/{id}/ with manifest.json + sections/ + __tests__/baseline/
 * 2. Import the manifest below and add it to TEMPLATES
 */

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Load manifests via require() — works in both ESM and CJS, no import attributes needed
const landingLeadManifest          = require('./landing-lead/manifest.json')
const calculatorScientificManifest = require('./calculator-scientific/manifest.json')
const portfolioCreativeManifest    = require('./portfolio-creative/manifest.json')
const saasDashboardManifest        = require('./saas-dashboard/manifest.json')
const ecommerceFreshManifest       = require('./ecommerce-fresh/manifest.json')

export const TEMPLATES = [
  { ...landingLeadManifest,          id: 'landing-lead'          },
  { ...calculatorScientificManifest, id: 'calculator-scientific' },
  { ...portfolioCreativeManifest,    id: 'portfolio-creative'    },
  { ...saasDashboardManifest,        id: 'saas-dashboard'        },
  { ...ecommerceFreshManifest,       id: 'ecommerce-fresh'       },
]

/**
 * Get a template by ID. Returns null if not found.
 * @param {string} id
 * @returns {object|null}
 */
export function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id) || null
}

