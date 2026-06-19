'use client'

import { useState } from 'react'

const SEVERITY_STYLES = {
  high:   { bg: '#fee2e2', color: '#dc2626', label: 'HIGH RISK', border: '#fecaca' },
  medium: { bg: '#fef9c3', color: '#854d0e', label: 'MEDIUM RISK', border: '#fde68a' },
  low:    { bg: '#dcfce7', color: '#15803d', label: 'LOW RISK', border: '#bbf7d0' }
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

  const allHighRiskDismissed = [
    ...(report.security_issues || []).map((item, i) => `security-${i}`),
    ...(report.accessibility_issues || []).map((item, i) => `access-${i}`)
  ]
    .filter((key, idx) => {
      const allItems = [...(report.security_issues || []), ...(report.accessibility_issues || [])]
      return allItems[idx]?.severity === 'high'
    })
    .every(key => dismissed.has(key))

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        background: highRiskCount > 0 ? '#fef2f2' : '#f0fdf4',
        border: `1px solid ${highRiskCount > 0 ? '#fecaca' : '#bbf7d0'}`,
        borderRadius: '14px', padding: '20px 24px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '22px' }}>{highRiskCount > 0 ? '⚠️' : '✅'}</span>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0a0a0a' }}>
            Risk Radar Report
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
          {highRiskCount > 0
            ? `${highRiskCount} high-severity issue${highRiskCount > 1 ? 's' : ''} found. Review before generating code.`
            : 'No high-severity issues found. You can proceed safely.'}
        </p>
      </div>

      {/* Cost estimate */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px',
        padding: '16px 20px', marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>💰</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0a0a0a' }}>
              Estimated Monthly Cost
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>Based on tier + features</div>
          </div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: '#0a0a0a' }}>
          ${report.cost_estimate_usd_per_month}<span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>/mo</span>
        </div>
      </div>

      {/* Security Issues */}
      {report.security_issues?.length > 0 && (
        <RiskSection title="Security Issues" icon="🔒">
          {report.security_issues.map((item, i) => {
            const key = `security-${i}`
            const style = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.low
            const isDismissed = dismissed.has(key)
            return (
              <RiskCard
                key={key}
                style={style}
                issue={item.issue}
                fix={item.fix}
                dismissed={isDismissed}
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
            const isDismissed = dismissed.has(key)
            return (
              <RiskCard
                key={key}
                style={{ bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: item.regulation }}
                issue={item.gap}
                fix={item.fix}
                dismissed={isDismissed}
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
            const style = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.low
            const isDismissed = dismissed.has(key)
            return (
              <RiskCard
                key={key}
                style={style}
                issue={item.issue}
                fix={item.fix}
                dismissed={isDismissed}
                onToggle={() => toggleDismiss(key)}
              />
            )
          })}
        </RiskSection>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex', gap: '10px', justifyContent: 'center',
        marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0f0f0'
      }}>
        <button
          onClick={onBack}
          style={{
            background: '#fff', color: '#666', border: '1px solid #e5e5e5',
            padding: '11px 22px', borderRadius: '9px', fontSize: '13px',
            fontWeight: '500', cursor: 'pointer'
          }}
        >
          ← Back to Blueprint
        </button>
        <button
          onClick={onContinue}
          disabled={highRiskCount > 0 && !allHighRiskDismissed}
          style={{
            background: (highRiskCount > 0 && !allHighRiskDismissed) ? '#e5e5e5' : '#0a0a0a',
            color: (highRiskCount > 0 && !allHighRiskDismissed) ? '#999' : '#fff',
            border: 'none', padding: '11px 28px', borderRadius: '9px',
            fontSize: '13px', fontWeight: '700',
            cursor: (highRiskCount > 0 && !allHighRiskDismissed) ? 'not-allowed' : 'pointer'
          }}
        >
          {highRiskCount > 0 && !allHighRiskDismissed
            ? `Dismiss ${highRiskCount} high-risk item${highRiskCount > 1 ? 's' : ''} to continue`
            : 'Continue to Code Generation →'}
        </button>
      </div>

    </div>
  )
}

function RiskSection({ title, icon, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0a0a0a' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {children}
      </div>
    </div>
  )
}

function RiskCard({ style, issue, fix, dismissed, onToggle }) {
  return (
    <div style={{
      background: dismissed ? '#fafafa' : '#fff',
      border: `1px solid ${dismissed ? '#e5e5e5' : style.border}`,
      borderRadius: '10px', padding: '14px 16px',
      opacity: dismissed ? 0.5 : 1,
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <span style={{
            display: 'inline-block', fontSize: '10px', fontWeight: '700',
            padding: '2px 8px', borderRadius: '6px', marginBottom: '6px',
            background: style.bg, color: style.color, letterSpacing: '0.04em'
          }}>
            {style.label}
          </span>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0a0a0a', marginBottom: '4px' }}>
            {issue}
          </div>
          <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
            <strong>Fix:</strong> {fix}
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            flexShrink: 0, fontSize: '11px', fontWeight: '600',
            padding: '5px 10px', borderRadius: '6px', cursor: 'pointer',
            border: '1px solid #e5e5e5',
            background: dismissed ? '#0a0a0a' : '#fff',
            color: dismissed ? '#fff' : '#666'
          }}
        >
          {dismissed ? '✓ Dismissed' : 'Dismiss'}
        </button>
      </div>
    </div>
  )
}