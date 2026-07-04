'use client'

const statusColors = { draft: '#6b7280', blueprint: '#3b82f6', generated: '#22c55e', deployed: '#10b981' }

export default function ProjectCard({ project }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px', padding: '20px', cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'
        e.currentTarget.style.background = 'rgba(139,92,246,0.05)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
      }}
    >
      {/* Status bar */}
      <div style={{
        height: '3px', borderRadius: '2px', marginBottom: '16px',
        background: statusColors[project.status] || '#6b7280',
        width: project.status === 'deployed' ? '100%' : project.status === 'generated' ? '75%' : project.status === 'blueprint' ? '50%' : '25%'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{project.name}</h3>
        <span style={{
          fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '600',
          background: `${statusColors[project.status] || '#6b7280'}20`,
          color: statusColors[project.status] || '#6b7280',
          border: `1px solid ${statusColors[project.status] || '#6b7280'}40`,
          textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          {project.status}
        </span>
      </div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '14px', lineHeight: '1.5' }}>
        {project.description?.length > 80
          ? project.description.slice(0, 80) + '…'
          : project.description}
      </p>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
        Last edited {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  )
}
