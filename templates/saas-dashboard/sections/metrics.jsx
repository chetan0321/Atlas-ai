/**
 * saas-dashboard / sections / metrics.jsx
 *
 * Exports: MetricCard, MetricsRow, MiniChart
 *
 * TEMPLATE RULES (for AI customization):
 * - Change metric labels, values, and trend data to match the product
 * - Change icon for each metric card
 * - Keep ALL exported names and prop signatures identical
 * - Do NOT remove the trend indicator logic — it's critical for UX
 */
'use client'

// ─── MiniChart ────────────────────────────────────────────────────────────────

export function MiniChart({ data = [], color = '#7c3aed', height = 48 }) {
  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 120
  const h = height

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 8) - 4
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill */}
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#grad-${color.replace('#','')})`}
      />
      {/* Line */}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

export function MetricCard({
  id,
  label = 'Total Users',
  value = '12,840',
  change = '+12.5%',
  changeType = 'positive', // 'positive' | 'negative' | 'neutral'
  icon = '👥',
  sparkData = [40, 55, 48, 62, 58, 71, 68, 80, 75, 88],
  color = '#7c3aed',
}) {
  const changeColor = changeType === 'positive' ? '#4ade80' : changeType === 'negative' ? '#f87171' : 'rgba(255,255,255,0.4)'
  const changePrefix = changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : ''

  return (
    <div
      id={`metric-card-${id || label.toLowerCase().replace(/\s+/g, '-')}`}
      data-testid={`metric-card-${id || label.toLowerCase().replace(/\s+/g, '-')}`}
      style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column',
        gap: '12px', transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
    >
      {/* Label + Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontSize: '20px' }}>{icon}</span>
      </div>

      {/* Value + Change */}
      <div>
        <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: changeColor, marginTop: '6px' }}>
          {changePrefix} {change} <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: '400' }}>vs last period</span>
        </div>
      </div>

      {/* Spark chart */}
      <MiniChart data={sparkData} color={color} />
    </div>
  )
}

// ─── MetricsRow ───────────────────────────────────────────────────────────────

const DEFAULT_METRICS = [
  {
    id: 'mrr', label: 'Monthly Revenue', value: '$48,290', change: '+18.2%', changeType: 'positive',
    icon: '💰', color: '#7c3aed', sparkData: [30,38,35,42,40,50,48,56,52,62],
  },
  {
    id: 'users', label: 'Active Users', value: '12,840', change: '+12.5%', changeType: 'positive',
    icon: '👥', color: '#06b6d4', sparkData: [200,240,220,260,250,280,270,300,290,320],
  },
  {
    id: 'churn', label: 'Churn Rate', value: '2.4%', change: '-0.8%', changeType: 'positive',
    icon: '📉', color: '#4ade80', sparkData: [4,3.8,3.5,3.2,3.0,2.8,2.6,2.5,2.4,2.4],
  },
  {
    id: 'nps', label: 'NPS Score', value: '72', change: '+4', changeType: 'positive',
    icon: '⭐', color: '#fbbf24', sparkData: [60,62,65,64,68,67,70,69,71,72],
  },
]

export function MetricsRow({ metrics = DEFAULT_METRICS }) {
  return (
    <div data-testid="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {metrics.map(m => <MetricCard key={m.id || m.label} {...m} />)}
    </div>
  )
}
