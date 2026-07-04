'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const statusColors = {
  draft: '#6b7280',
  blueprint: '#3b82f6',
  risk: '#f59e0b',
  generated: '#22c55e',
  deployed: '#10b981',
  saved: '#10b981'
}

const statusBadge = {
  draft:     { label: 'Draft',     bg: 'rgba(107,114,128,0.15)', color: '#9ca3af',  border: 'rgba(107,114,128,0.25)' },
  blueprint: { label: 'Blueprint', bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa',  border: 'rgba(59,130,246,0.25)' },
  risk:      { label: '🛡️ Risk',   bg: 'rgba(245,158,11,0.15)', color: '#fbbf24',  border: 'rgba(245,158,11,0.3)' },
  generated: { label: 'Generated', bg: 'rgba(34,197,94,0.15)',   color: '#4ade80',  border: 'rgba(34,197,94,0.25)' },
  deployed:  { label: '🟢 Live',   bg: 'rgba(16,185,129,0.15)', color: '#34d399',  border: 'rgba(16,185,129,0.3)' },
  saved:     { label: '🟢 Live',   bg: 'rgba(16,185,129,0.15)', color: '#34d399',  border: 'rgba(16,185,129,0.3)' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${mins}m ago`
}

function ProjectThumbnail({ name, status }) {
  const palettes = {
    deployed: ['#0f2d1a', '#1a4a2a', '#16a34a'],
    saved:    ['#0f2d1a', '#1a4a2a', '#16a34a'],
    risk:     ['#2d1f0a', '#4a3414', '#d97706'],
    blueprint:['#0f1f3d', '#1a3460', '#3b82f6'],
    generated:['#0d2020', '#163030', '#22c55e'],
    draft:    ['#1a1a2e', '#2a2a4a', '#6b7280'],
  }
  const [bg1, bg2, accent] = palettes[status] || palettes.draft
  return (
    <div style={{
      width: '100%', height: '140px', borderRadius: '10px 10px 0 0',
      background: `linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            position: 'absolute', left: `${8 + i * 20}%`, top: '15%',
            width: '1px', height: '70%', background: accent, opacity: 0.25
          }} />
        ))}
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: 'absolute', top: `${20 + i * 28}%`, left: '8%',
            height: '1px', width: '84%', background: accent, opacity: 0.15
          }} />
        ))}
      </div>
      <div style={{
        width: '44px', height: '44px', borderRadius: '10px',
        background: accent + '25', border: `1px solid ${accent}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', fontWeight: '800', color: accent, zIndex: 1,
        backdropFilter: 'blur(4px)'
      }}>
        {name?.slice(0, 1).toUpperCase() || '?'}
      </div>
    </div>
  )
}

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div style={{
      background: '#15151f', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px', overflow: 'hidden'
    }}>
      <div style={{ height: '140px', background: 'rgba(255,255,255,0.04)', animation: 'dash-pulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ height: '14px', width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', marginBottom: '8px', animation: 'dash-pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '11px', width: '40%', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', animation: 'dash-pulse 1.5s ease-in-out 0.2s infinite' }} />
      </div>
    </div>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

export default function DashboardClient({ projects, displayName, userEmail, deployed, inProgress }) {
  const [search, setSearch] = useState('')
  const [hoveredCard, setHoveredCard] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const filtered = projects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <style>{`
        @keyframes dash-slide-down { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dash-slide-up   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dash-fade-in    { from { opacity:0; } to { opacity:1; } }
        @keyframes dash-pulse      { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        @keyframes dash-pop        { from { opacity:0; transform:scale(0.94) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }

        .dash-header  { animation: dash-slide-down 0.35s cubic-bezier(0.4,0,0.2,1) both; }
        .dash-welcome { animation: dash-slide-up 0.4s cubic-bezier(0.4,0,0.2,1) 0.05s both; }
        .dash-stats   { animation: dash-slide-up 0.4s cubic-bezier(0.4,0,0.2,1) 0.12s both; }
        .dash-grid    { animation: dash-fade-in  0.35s ease 0.18s both; }

        .dash-stat-pill { transition: all 0.15s !important; }
        .dash-stat-pill:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.18) !important; transform: translateY(-1px) !important; }
        .dash-card { transition: all 0.2s cubic-bezier(0.4,0,0.2,1) !important; }
        .dash-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 36px rgba(0,0,0,0.5) !important; border-color: rgba(139,92,246,0.35) !important; }
        .dash-search:focus { border-color: rgba(139,92,246,0.5) !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.1) !important; outline: none !important; }
        .dash-bell:hover { color: #fff !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0d0d18', color: '#fff', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div className="dash-header" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '52px', flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(13,13,24,0.95)', backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>Home</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="dash-bell" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '6px', display: 'flex', transition: 'color 0.15s' }}>
              <BellIcon />
            </button>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: '10px', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                <SearchIcon />
              </div>
              <input
                className="dash-search"
                type="text"
                placeholder="Search projects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '7px 14px 7px 32px', fontSize: '13px',
                  color: '#fff', width: '200px', transition: 'all 0.15s'
                }}
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '36px 36px 60px', overflow: 'auto' }}>

          {/* Welcome header */}
          <div className="dash-welcome" style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: 'clamp(26px,3vw,36px)', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Welcome back, <span style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{displayName}</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '14px' }}>
              Here's what you've been building
            </p>
          </div>

          {/* Stats pills */}
          <div className="dash-stats" style={{ display: 'flex', gap: '10px', marginBottom: '36px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total projects', value: projects.length, icon: '📁' },
              { label: 'Risk analysed',  value: projects.filter(p => p.status === 'risk' || p.current_step === 'risk').length, icon: '🛡️' },
              { label: 'Live',           value: deployed, icon: '🟢' },
              { label: 'In progress',    value: inProgress, icon: '⚙️' }
            ].map((s, i) => (
              <div key={s.label} className="dash-stat-pill" style={{
                padding: '10px 18px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'default', animationDelay: `${i * 60}ms`
              }}>
                <span style={{ fontSize: '15px' }}>{s.icon}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>{s.label}</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Projects section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>
              Your projects <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: '400' }}>({filtered.length})</span>
            </h2>
            <Link href="/build" style={{
              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
              color: '#c4b5fd', padding: '6px 14px', borderRadius: '8px',
              fontSize: '12px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.15s'
            }}>+ New project</Link>
          </div>

          {projects.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)',
              borderRadius: '16px', animation: 'dash-fade-in 0.4s ease both'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '14px' }}>🚀</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '20px' }}>
                No projects yet. Build your first app!
              </p>
              <Link href="/build" style={{
                background: '#7c3aed', color: '#fff', padding: '11px 26px',
                borderRadius: '9px', fontSize: '14px', fontWeight: '700', textDecoration: 'none'
              }}>
                Start Building →
              </Link>
            </div>
          ) : (
            <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filtered.map((project, idx) => {
                const badge = statusBadge[project.status] || statusBadge.draft
                return (
                  <Link key={project.id} href={`/build?id=${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div
                      className="dash-card"
                      style={{
                        background: '#15151f',
                        border: `1px solid ${hoveredCard === project.id ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                        animation: `dash-pop 0.35s cubic-bezier(0.4,0,0.2,1) ${idx * 55}ms both`
                      }}
                      onMouseEnter={() => setHoveredCard(project.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <ProjectThumbnail name={project.name} status={project.status} />

                      <div style={{ padding: '14px 16px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', lineHeight: '1.3', flex: 1 }}>{project.name}</h3>
                          <span style={{
                            fontSize: '11px', fontWeight: '600', flexShrink: 0,
                            background: badge.bg, color: badge.color,
                            border: `1px solid ${badge.border}`,
                            padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap'
                          }}>{badge.label}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', marginTop: '2px' }}>
                          {timeAgo(project.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
