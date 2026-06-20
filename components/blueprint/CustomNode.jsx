import { Handle, Position } from 'reactflow'

const CATEGORY_STYLES = {
  root:     { bg: '#0a0a0a', color: '#fff', border: '#0a0a0a', icon: '🌍' },
  screen:   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: '📄' },
  feature:  { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: '⚡' },
  database: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', icon: '🗄️' }
}

export default function CustomNode({ data }) {
  const style = CATEGORY_STYLES[data.category] || CATEGORY_STYLES.screen

  return (
    <div style={{
      background: style.bg, border: `1.5px solid ${style.border}`,
      borderRadius: '10px', padding: '10px 14px',
      minWidth: '170px', maxWidth: '200px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: style.border, width: 6, height: 6 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
        <span style={{ fontSize: '13px' }}>{style.icon}</span>
        <span style={{
          fontSize: '13px', fontWeight: '700',
          color: data.category === 'root' ? '#fff' : style.color
        }}>
          {data.label}
        </span>
      </div>

      {data.description && (
        <div style={{
          fontSize: '11px',
          color: data.category === 'root' ? '#999' : '#888',
          lineHeight: '1.4'
        }}>
          {data.description.slice(0, 50)}{data.description.length > 50 ? '...' : ''}
        </div>
      )}

      {data.priority && (
        <span style={{
          display: 'inline-block', marginTop: '4px', fontSize: '9px',
          fontWeight: '700', padding: '1px 6px', borderRadius: '6px',
          background: style.color, color: '#fff', letterSpacing: '0.05em'
        }}>
          {data.priority.toUpperCase()}
        </span>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: style.border, width: 6, height: 6 }} />
    </div>
  )
}