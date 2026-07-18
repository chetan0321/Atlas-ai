'use client'

/**
 * TemplateMatchCard — Sprint 2 Preview UI
 *
 * Shown before generation starts when a template is matched.
 * Gives user agency: accept the template, override to scratch, or dismiss.
 *
 * Props:
 *   templateMatch  — { strategy, template, confidence, reason }
 *   onAccept(strategy)  — user accepts (passes chosen strategy to worker)
 *   onScratch()         — user overrides to scratch generation
 *   onDismiss()         — user closes without choosing (defaults to template)
 */

import { useState } from 'react'

// ─── Confidence badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }) {
  const color = confidence >= 85
    ? { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.35)', text: '#4ade80' }
    : confidence >= 60
    ? { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)', text: '#fbbf24' }
    : { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  text: '#f87171' }

  const label = confidence >= 85 ? 'Strong match' : confidence >= 60 ? 'Partial match' : 'Weak match'

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      background: color.bg, border: `1px solid ${color.border}`,
      padding: '4px 12px', borderRadius: '999px',
    }}>
      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color.text }} />
      <span style={{ fontSize: '12px', fontWeight: '700', color: color.text }}>
        {confidence}% — {label}
      </span>
    </div>
  )
}

// ─── Strategy description ─────────────────────────────────────────────────────

const STRATEGY_INFO = {
  customize: {
    icon: '⚡',
    label: 'Full template',
    description: 'AI customizes copy, colors, and brand — logic is preserved from template.',
    benefit: 'Faster generation, higher quality, less hallucination risk.',
  },
  hybrid: {
    icon: '🔀',
    label: 'Structural hint',
    description: 'AI uses the template architecture as a guide, fills in the gaps.',
    benefit: 'Better structure than scratch, more flexibility for unique features.',
  },
}

// ─── Feature chip ─────────────────────────────────────────────────────────────

function FeatureChip({ label }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '6px',
      background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
      fontSize: '11px', fontWeight: '600', color: '#a78bfa',
    }}>{label}</span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TemplateMatchCard({ templateMatch, onAccept, onScratch, onDismiss }) {
  const [hover, setHover] = useState(null)
  const [accepted, setAccepted] = useState(false)

  if (!templateMatch?.template) return null

  const { template, confidence, reason, strategy } = templateMatch
  const info = STRATEGY_INFO[strategy] || STRATEGY_INFO.customize

  function handleAccept() {
    setAccepted(true)
    setTimeout(() => onAccept?.(strategy), 350)
  }

  function handleScratch() {
    onScratch?.()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(8,8,15,0.92)', backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      animation: 'tmpl-fadein 0.3s ease both',
    }}>
      <style>{`
        @keyframes tmpl-fadein { from { opacity:0; transform:scale(0.97) } to { opacity:1; transform:scale(1) } }
        @keyframes tmpl-accepted { 0%{transform:scale(1)} 50%{transform:scale(1.02)} 100%{transform:scale(1)} }
        .tmpl-btn-hover:hover { opacity: 0.85 !important; transform: translateY(-1px) !important; }
      `}</style>

      <div style={{
        background: 'rgba(20,20,35,0.98)', border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: '20px', padding: '36px', maxWidth: '520px', width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        animation: accepted ? 'tmpl-accepted 0.35s ease' : 'none',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(167,139,250,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
              Template Match Found
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-0.4px', margin: 0 }}>
              {info.icon} {template.name}
            </h2>
          </div>
          <button
            id="template-match-dismiss"
            onClick={onDismiss}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '20px', padding: '4px', lineHeight: 1 }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >×</button>
        </div>

        {/* Confidence badge */}
        <div style={{ marginBottom: '16px' }}>
          <ConfidenceBadge confidence={confidence} />
        </div>

        {/* Reason from LLM */}
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.65', marginBottom: '20px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', borderLeft: '3px solid rgba(139,92,246,0.4)' }}>
          {reason}
        </p>

        {/* Template features */}
        {template.features?.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              Includes
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {template.features.slice(0, 8).map(f => <FeatureChip key={f} label={f} />)}
            </div>
          </div>
        )}

        {/* Strategy info */}
        <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#a78bfa', marginBottom: '4px' }}>{info.label}</div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 6px', lineHeight: '1.55' }}>{info.description}</p>
          <p style={{ fontSize: '12px', color: 'rgba(74,222,128,0.8)', margin: 0 }}>✓ {info.benefit}</p>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            id="template-accept-btn"
            onClick={handleAccept}
            style={{
              background: accepted ? '#4ade80' : 'var(--brand-primary, #7c3aed)',
              color: '#fff', border: 'none', padding: '13px 24px', borderRadius: '10px',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {accepted ? '✓ Using template…' : `Use ${template.name} template →`}
          </button>

          <button
            id="template-scratch-btn"
            onClick={handleScratch}
            style={{
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.1)', padding: '11px 24px',
              borderRadius: '10px', fontSize: '13px', fontWeight: '500',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >
            Generate from scratch instead
          </button>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '16px', marginBottom: 0 }}>
          Tier {template.tier} · {template.hasAuth ? 'Auth' : 'No auth'} · {template.hasPayments ? 'Payments' : 'No payments'}
        </p>
      </div>
    </div>
  )
}
