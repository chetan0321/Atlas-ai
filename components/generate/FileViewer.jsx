'use client'

import { useState } from 'react'

const AGENT_COLORS = {
  frontend:    '#3b82f6',
  backend:     '#8b5cf6',
  schema:      '#f59e0b',
  security:    '#ef4444',
  test:        '#22c55e',
  coordinator: '#6b7280',
}

const AGENT_ORDER = ['frontend', 'backend', 'schema', 'security', 'test', 'coordinator']

function getFileIcon(path) {
  if (path.endsWith('.sql'))  return '🗄'
  if (path.endsWith('.test.js') || path.includes('__tests__')) return '🧪'
  if (path.endsWith('.jsx') || path.endsWith('.tsx')) return '⚛'
  if (path.endsWith('.json')) return '📋'
  if (path.endsWith('.md'))   return '📄'
  if (path.includes('middleware')) return '🔒'
  if (path.includes('api/'))  return '⚙️'
  return '📝'
}

export default function FileViewer({ files = [], onClose }) {
  const [selectedFile, setSelectedFile] = useState(files[0] || null)

  // Group by agent, sorted in display order
  const grouped = AGENT_ORDER.reduce((acc, agent) => {
    const agentFiles = files.filter((f) => f.agent === agent)
    if (agentFiles.length) acc[agent] = agentFiles
    return acc
  }, {})

  const agentLabel = {
    frontend:    'Frontend',
    backend:     'Backend',
    schema:      'Database',
    security:    'Security',
    test:        'Tests',
    coordinator: 'Coordinator',
  }

  return (
    <div style={{
      display: 'flex', height: '580px',
      background: '#0a0a14', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', overflow: 'hidden',
    }}>

      {/* ── File tree sidebar ─────────────────────────────────────────────── */}
      <div style={{
        width: '230px', borderRight: '1px solid rgba(255,255,255,0.06)',
        overflow: 'auto', flexShrink: 0, background: '#0d0d1a',
      }}>
        <div style={{
          padding: '11px 14px',
          fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>Files ({files.length})</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', fontSize: '16px', lineHeight: 1, padding: '0 2px',
            }}
          >×</button>
        </div>

        {Object.entries(grouped).map(([agent, agentFiles]) => (
          <div key={agent} style={{ marginBottom: '2px' }}>
            {/* Agent group header */}
            <div style={{
              padding: '8px 14px 4px',
              fontSize: '10px', fontWeight: '700', letterSpacing: '0.07em',
              color: AGENT_COLORS[agent] || '#6b7280', textTransform: 'uppercase',
            }}>
              {agentLabel[agent] || agent} ({agentFiles.length})
            </div>

            {agentFiles.map((file) => {
              const isActive = selectedFile?.file_path === file.file_path
              const baseName = file.file_path.split('/').pop()
              return (
                <div
                  key={file.file_path}
                  onClick={() => setSelectedFile(file)}
                  title={file.file_path}
                  style={{
                    padding: '5px 14px', fontSize: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color:      isActive ? '#c4b5fd' : 'rgba(255,255,255,0.42)',
                    background: isActive ? 'rgba(139,92,246,0.12)' : 'transparent',
                    borderLeft: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                    transition: 'all 0.1s',
                  }}
                >
                  <span style={{ flexShrink: 0, fontSize: '11px' }}>{getFileIcon(file.file_path)}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {baseName}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Code viewer ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedFile ? (
          <>
            {/* File path header */}
            <div style={{
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#0d0d1a', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px' }}>{getFileIcon(selectedFile.file_path)}</span>
                <span style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.55)',
                  fontFamily: 'monospace',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: '420px',
                }}>
                  {selectedFile.file_path}
                </span>
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px',
                  background: `${AGENT_COLORS[selectedFile.agent]}22`,
                  color: AGENT_COLORS[selectedFile.agent] || '#6b7280',
                  border: `1px solid ${AGENT_COLORS[selectedFile.agent]}44`,
                }}>
                  {agentLabel[selectedFile.agent] || selectedFile.agent}
                </span>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)', fontSize: '20px', lineHeight: 1,
                  padding: '0 4px', flexShrink: 0,
                }}
              >×</button>
            </div>

            {/* Code content */}
            <pre style={{
              flex: 1, overflow: 'auto', padding: '18px 20px', margin: 0,
              fontSize: '12px', lineHeight: '1.75',
              color: 'rgba(255,255,255,0.72)',
              fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", monospace',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              background: '#08080f',
            }}>
              {selectedFile.content}
            </pre>
          </>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: 'rgba(255,255,255,0.2)', fontSize: '14px',
          }}>
            Select a file to view its contents
          </div>
        )}
      </div>
    </div>
  )
}
