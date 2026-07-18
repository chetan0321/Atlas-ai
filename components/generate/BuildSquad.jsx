'use client'

// ─── Agent definitions ────────────────────────────────────────────────────────
const AGENTS = [
  { key: 'frontend',    label: 'Frontend',    icon: '🖥️', desc: 'Pages & components' },
  { key: 'backend',     label: 'Backend',     icon: '⚙️', desc: 'API routes' },
  { key: 'schema',      label: 'Database',    icon: '🗄️', desc: 'SQL schema & seed' },
  { key: 'security',    label: 'Security',    icon: '🔒', desc: 'Auth & middleware' },
  { key: 'test',        label: 'Tests',       icon: '🧪', desc: 'Jest test suite' },
  { key: 'coordinator', label: 'Coordinator', icon: '🎯', desc: 'Reconciles all output' },
]

const STATUS = {
  queued:   { bg: 'rgba(255,255,255,0.05)',  color: 'rgba(255,255,255,0.3)',  border: 'rgba(255,255,255,0.08)', label: 'Queued'     },
  running:  { bg: 'rgba(139,92,246,0.15)',   color: '#a78bfa',                border: 'rgba(139,92,246,0.3)',   label: 'Running…', pulse: true },
  waiting:  { bg: 'rgba(234,179,8,0.1)',     color: '#fbbf24',                border: 'rgba(234,179,8,0.2)',    label: 'Waiting'    },
  done:     { bg: 'rgba(34,197,94,0.1)',     color: '#4ade80',                border: 'rgba(34,197,94,0.2)',    label: 'Done ✓'     },
  skipped:  { bg: 'rgba(255,255,255,0.03)',  color: 'rgba(255,255,255,0.2)',  border: 'rgba(255,255,255,0.05)', label: 'Skipped'    },
  error:    { bg: 'rgba(239,68,68,0.1)',     color: '#f87171',                border: 'rgba(239,68,68,0.2)',    label: 'Error'      },
}

export default function BuildSquad({
  agentStatuses = {},
  overallStatus,
  errorMessage,
  fileCount,
  onDownload,
  onViewFiles,
}) {
  const doneCount   = Object.values(agentStatuses).filter((s) => s === 'done').length
  const totalActive = Object.values(agentStatuses).filter((s) => s !== 'skipped').length
  const progress    = totalActive > 0 ? Math.round((doneCount / totalActive) * 100) : 0
  const isComplete  = overallStatus === 'completed'
  const isFailed    = overallStatus === 'failed'

  // When generation is complete, force any 'running'/'waiting' agents to 'done'
  // (DB parallel writes can leave stale 'running' statuses)
  const displayStatuses = isComplete
    ? Object.fromEntries(
        Object.entries(agentStatuses).map(([k, v]) => [
          k,
          (v === 'running' || v === 'waiting') ? 'done' : v
        ])
      )
    : agentStatuses

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
        }}>⚡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
            Multi-Agent Build Squad
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
            {isComplete
              ? `${fileCount} files generated across all layers`
              : isFailed
              ? 'Generation failed — see error below'
              : '5 AI agents generating your app in parallel…'}
          </div>
        </div>
        <div style={{
          fontSize: '15px', fontWeight: '800',
          color: isComplete ? '#4ade80' : '#a78bfa',
          minWidth: '40px', textAlign: 'right',
        }}>
          {isComplete ? '100%' : `${progress}%`}
        </div>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <div style={{
        height: '5px', background: 'rgba(255,255,255,0.06)',
        borderRadius: '3px', marginBottom: '22px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          background: isComplete
            ? 'linear-gradient(90deg,#22c55e,#4ade80)'
            : 'linear-gradient(90deg,#7c3aed,#a78bfa)',
          width:      `${isComplete ? 100 : progress}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* ── Agent cards ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
        gap: '10px', marginBottom: '24px',
      }}>
        {AGENTS.map((agent) => {
          const st    = STATUS[displayStatuses[agent.key] || 'queued'] || STATUS.queued
          const pulse = st.pulse

          return (
            <div key={agent.key} style={{
              background:    st.bg,
              border:        `1px solid ${st.border}`,
              borderRadius:  '12px', padding: '15px 16px',
              transition:    'all 0.3s ease',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '8px',
              }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{agent.icon}</span>
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '2px 8px',
                  borderRadius: '6px', color: st.color, border: `1px solid ${st.border}`,
                  background: 'transparent',
                  animation: pulse ? 'squad-pulse 1.5s ease-in-out infinite' : 'none',
                }}>
                  {st.label}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '3px' }}>
                {agent.label}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.4' }}>
                {agent.desc}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Completed CTA ──────────────────────────────────────────────────── */}
      {isComplete && (
        <div style={{
          background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '14px', padding: '24px', textAlign: 'center',
          animation: 'squad-fadein 0.4s ease both',
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎉</div>
          <div style={{ fontSize: '17px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
            Generation Complete!
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
            {fileCount} files generated across all layers
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onDownload}
              style={{
                background: '#fff', color: '#000', border: 'none',
                padding: '10px 26px', borderRadius: '9px',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
            >
              ⬇ Download ZIP
            </button>
            <button
              onClick={onViewFiles}
              style={{
                background: 'rgba(255,255,255,0.07)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '10px 26px', borderRadius: '9px',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
            >
              📁 View Files
            </button>
          </div>
        </div>
      )}

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {isFailed && (
        <div style={{
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '14px', padding: '24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '13px', color: '#f87171', marginBottom: '14px', lineHeight: '1.6' }}>
            ⚠️ The build agents encountered an error.<br />
            {errorMessage ? (
              <span style={{ fontWeight: 'bold', color: '#fca5a5', display: 'inline-block', marginTop: '8px' }}>{errorMessage}</span>
            ) : (
              'You can try regenerating — your blueprint is saved.'
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'rgba(255,255,255,0.07)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '9px 20px', borderRadius: '8px',
              fontSize: '13px', cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes squad-pulse  { 0%,100%{opacity:1}50%{opacity:0.45} }
        @keyframes squad-fadein { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
