/**
 * calculator-scientific / sections / history.jsx
 *
 * Exports: CalculationHistory, HistoryItem, FormulaLibrary
 *
 * TEMPLATE RULES (for AI customization):
 * - Change the formula library entries to match the domain (physics, finance, etc.)
 * - Change color tokens to match brand
 * - Preserve ALL exported component names and prop signatures
 * - Do NOT remove the copy-to-clipboard functionality
 */
'use client'

import { useState } from 'react'

// ─── HistoryItem ──────────────────────────────────────────────────────────────

export function HistoryItem({ entry, onReuse, onCopy }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard?.writeText(entry.result).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
    onCopy?.(entry.result)
  }

  return (
    <div style={{
      padding: '12px 14px', borderRadius: '10px',
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      marginBottom: '8px', cursor: 'pointer', transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--calc-font-mono, monospace)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.expression}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', fontFamily: 'var(--calc-font-mono, monospace)', letterSpacing: '-0.3px' }}>
            = {entry.result}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={() => onReuse?.(entry.expression)}
            title="Reuse expression"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.12)'}
          >↩</button>
          <button
            onClick={handleCopy}
            title="Copy result"
            style={{ background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`, color: copied ? '#4ade80' : 'rgba(255,255,255,0.4)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', transition: 'all 0.15s' }}
          >{copied ? '✓' : '⎘'}</button>
        </div>
      </div>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', marginTop: '6px', fontFamily: 'var(--calc-font-mono, monospace)' }}>
        {new Date(entry.timestamp).toLocaleTimeString()}
      </div>
    </div>
  )
}

// ─── CalculationHistory ───────────────────────────────────────────────────────

export function CalculationHistory({ history = [], onReuse, onClearAll }) {
  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          No calculations yet.<br />Your history will appear here.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          History ({history.length})
        </span>
        <button
          id="calc-history-clear"
          onClick={onClearAll}
          style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', fontSize: '11px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.6)'}
        >Clear all</button>
      </div>
      {[...history].reverse().map((entry, i) => (
        <HistoryItem key={i} entry={entry} onReuse={onReuse} />
      ))}
    </div>
  )
}

// ─── FormulaLibrary ───────────────────────────────────────────────────────────

const DEFAULT_FORMULAS = [
  { category: 'Geometry', items: [
    { name: 'Circle Area', formula: 'π*r^2', vars: 'r = radius' },
    { name: 'Sphere Volume', formula: '(4/3)*π*r^3', vars: 'r = radius' },
    { name: 'Pythagorean', formula: 'sqrt(a^2+b^2)', vars: 'a, b = legs' },
  ]},
  { category: 'Physics', items: [
    { name: 'Kinetic Energy', formula: '0.5*m*v^2', vars: 'm = mass, v = velocity' },
    { name: 'Free Fall', formula: '0.5*9.81*t^2', vars: 't = time (s)' },
    { name: 'Ohm\'s Law', formula: 'V/R', vars: 'V = voltage, R = resistance' },
  ]},
  { category: 'Finance', items: [
    { name: 'Compound Interest', formula: 'P*(1+r)^n', vars: 'P = principal, r = rate, n = periods' },
    { name: 'Simple Interest', formula: 'P*r*t', vars: 'P = principal, r = rate, t = time' },
  ]},
]

export function FormulaLibrary({ formulas = DEFAULT_FORMULAS, onInsert }) {
  const [openCategory, setOpenCategory] = useState(null)

  return (
    <div>
      <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        Formula Library
      </div>
      {formulas.map((cat) => (
        <div key={cat.category} style={{ marginBottom: '6px' }}>
          <button
            onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px', padding: '10px 14px', color: '#fff', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '13px', fontWeight: '600', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            {cat.category}
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', transform: openCategory === cat.category ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
          </button>

          {openCategory === cat.category && (
            <div style={{ padding: '6px 0 0 0' }}>
              {cat.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => onInsert?.(item.formula)}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                    textAlign: 'left', transition: 'background 0.15s',
                    marginBottom: '4px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '2px' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--calc-font-mono, monospace)', color: '#a78bfa', marginBottom: '2px' }}>{item.formula}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{item.vars}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
