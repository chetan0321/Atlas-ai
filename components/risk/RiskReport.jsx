'use client'

import { useState } from 'react'

const SEVERITY_STYLES = {
  high:   { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', border: 'rgba(239,68,68,0.3)',  label: 'HIGH RISK' },
  medium: { bg: 'rgba(234,179,8,0.15)', color: '#facc15', border: 'rgba(234,179,8,0.3)', label: 'MEDIUM RISK' },
  low:    { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)', label: 'LOW RISK' }
}

export default function RiskReport({ report, onContinue, onBack }) {
  const [dismissed, setDismissed] = useState(new Set())

  function toggleDismiss(key) {
    setDismissed(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const highRiskCount = [
    ...(report.security_issues || []),
    ...(report.accessibility_issues || [])
  ].filter(i => i.severity === 'high').length

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <style>{`
        @keyframes rr-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes rr-card-in { from { opacity:0; transform:translateX(8px); } to { opacity:1; transform:translateX(0); } }
        .rr-card { animation: rr-card-in 0.25s cubic-bezier(0.4,0,0.2,1) both; }
        .rr-btn { transition: all 0.15s !important; }
        .rr-btn:hover { transform: translateY(-1px) !important; box-shadow: 0 4px 14px rgba(0,0,0,0.3) !important; }
        .rr-btn:active { transform: scale(0.97) !important; }
      `}</style>

      {/* Header banner */}
      <div style={{
        background: highRiskCount > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.1)',
        border: `1px solid ${highRiskCount > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
        borderRadius: '14px', padding: '18px 22px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <span style={{ fontSize: '22px' }}>{highRiskCount > 0 ? '⚠️' : '✅'}</span>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: '700', margin: 0, color: '#fff' }}>
            Risk Radar Report
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '3px 0 0' }}>
            {highRiskCount > 0
              ? `${highRiskCount} high-severity issue${highRiskCount > 1 ? 's' : ''} found. Review before generating code.`
              : 'No high-severity issues found. You can proceed safely.'}
          </p>
        </div>
      </div>

      {/* Cost estimate */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#15151f', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>💰</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Estimated Monthly Cost</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Based on tier + features</div>
          </div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: '800', color: '#fff' }}>
          ${report.cost_estimate_usd_per_month}
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>/mo</span>
        </div>
      </div>

      {/* Security Issues */}
      {report.security_issues?.length > 0 && (
        <RiskSection title="Security Issues" icon="🔒">
          {report.security_issues.map((item, i) => {
            const key = `security-${i}`
            return (
              <RiskCard
                key={key}
                style={SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.low}
                issue={item.issue} fix={item.fix}
                dismissed={dismissed.has(key)}
                onToggle={() => toggleDismiss(key)}
              />
            )
          })}
        </RiskSection>
      )}

      {/* Compliance Gaps */}
      {report.compliance_gaps?.length > 0 && (
        <RiskSection title="Compliance Gaps" icon="📋">
          {report.compliance_gaps.map((item, i) => {
            const key = `compliance-${i}`
            return (
              <RiskCard
                key={key}
                style={{ bg: 'rgba(234,179,8,0.15)', color: '#fbbf24', border: 'rgba(234,179,8,0.3)', label: item.regulation }}
                issue={item.gap} fix={item.fix}
                dismissed={dismissed.has(key)}
                onToggle={() => toggleDismiss(key)}
              />
            )
          })}
        </RiskSection>
      )}

      {/* Accessibility Issues */}
      {report.accessibility_issues?.length > 0 && (
        <RiskSection title="Accessibility Issues" icon="♿">
          {report.accessibility_issues.map((item, i) => {
            const key = `access-${i}`
            return (
              <RiskCard
                key={key}
                style={SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.low}
                issue={item.issue} fix={item.fix}
                dismissed={dismissed.has(key)}
                onToggle={() => toggleDismiss(key)}
              />
            )
          })}
        </RiskSection>
      )}

      {/* Action buttons */}
      <div style={{
        display: 'flex', gap: '10px', justifyContent: 'center',
        marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <button onClick={onBack} className="rr-btn" style={{
          background: 'transparent', color: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '11px 22px', borderRadius: '9px', fontSize: '13px',
          fontWeight: '500', cursor: 'pointer'
        }}
        >
          ← Back to Blueprint
        </button>
        <button onClick={onContinue} className="rr-btn" style={{
          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none',
          padding: '11px 28px', borderRadius: '9px', fontSize: '13px',
          fontWeight: '700', cursor: 'pointer',
          boxShadow: '0 4px 18px rgba(124,58,237,0.4)'
        }}
        >
          ⚡ Generate App →
        </button>
      </div>
    </div>
  )
}

function RiskSection({ title, icon, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '15px' }}>{icon}</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>
    </div>
  )
}

function RiskCard({ style, issue, fix, dismissed, onToggle }) {
  return (
    <div style={{
      background: dismissed ? 'rgba(255,255,255,0.02)' : '#15151f',
      border: `1px solid ${dismissed ? 'rgba(255,255,255,0.06)' : style.border}`,
      borderRadius: '10px', padding: '14px 16px',
      opacity: dismissed ? 0.45 : 1, transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <span style={{
            display: 'inline-block', fontSize: '10px', fontWeight: '700',
            padding: '2px 8px', borderRadius: '5px', marginBottom: '6px',
            background: style.bg, color: style.color, letterSpacing: '0.04em'
          }}>
            {style.label}
          </span>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '5px' }}>
            {issue}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.55' }}>
            <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Fix:</strong> {fix}
          </div>
        </div>
        <button onClick={onToggle} style={{
          flexShrink: 0, fontSize: '11px', fontWeight: '600',
          padding: '5px 10px', borderRadius: '6px', cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.12)',
          background: dismissed ? '#7c3aed' : 'rgba(255,255,255,0.06)',
          color: dismissed ? '#fff' : 'rgba(255,255,255,0.5)',
          transition: 'all 0.15s'
        }}>
          {dismissed ? '✓ Dismissed' : 'Dismiss'}
        </button>
      </div>
    </div>
  )
}