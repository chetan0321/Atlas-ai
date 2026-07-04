'use client'

import { useState } from 'react'
import { nanoid } from 'nanoid'

/* ── Dark theme color tokens ── */
const C = {
  bg:        '#0d0d18',
  card:      '#15151f',
  cardHover: '#1c1c2e',
  border:    'rgba(255,255,255,0.08)',
  borderFoc: 'rgba(139,92,246,0.5)',
  text:      '#fff',
  muted:     'rgba(255,255,255,0.4)',
  subtle:    'rgba(255,255,255,0.2)',
  input:     'rgba(255,255,255,0.05)',
}

const SECTION_CONFIG = {
  pages: {
    label: 'Pages', icon: '📄',
    accentColor: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.12)',
    accentBorder: 'rgba(59,130,246,0.3)',
    empty: { name: 'New Page', description: 'Describe this page' }
  },
  features: {
    label: 'Features', icon: '⚡',
    accentColor: '#22c55e',
    accentBg: 'rgba(34,197,94,0.12)',
    accentBorder: 'rgba(34,197,94,0.3)',
    empty: { name: 'New Feature', description: 'Describe this feature', priority: 'could' }
  },
  apiRoutes: {
    label: 'API Routes', icon: '🔌',
    accentColor: '#a855f7',
    accentBg: 'rgba(168,85,247,0.12)',
    accentBorder: 'rgba(168,85,247,0.3)',
    empty: { method: 'GET', path: '/api/new', description: 'Describe this route' }
  },
  dbTables: {
    label: 'Database Tables', icon: '🗄️',
    accentColor: '#f97316',
    accentBg: 'rgba(249,115,22,0.12)',
    accentBorder: 'rgba(249,115,22,0.3)',
    empty: { name: 'new_table', fields: [{ name: 'id', type: 'uuid' }, { name: 'created_at', type: 'timestamptz' }] }
  }
}

const PRIORITY_STYLES = {
  must:   { bg: 'rgba(34,197,94,0.2)',  color: '#4ade80', label: 'MUST' },
  should: { bg: 'rgba(234,179,8,0.2)',  color: '#facc15', label: 'SHOULD' },
  could:  { bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', label: 'COULD' }
}

const METHOD_STYLES = {
  GET:    { bg: 'rgba(59,130,246,0.2)',  color: '#60a5fa' },
  POST:   { bg: 'rgba(34,197,94,0.2)',  color: '#4ade80' },
  PUT:    { bg: 'rgba(234,179,8,0.2)',  color: '#facc15' },
  DELETE: { bg: 'rgba(239,68,68,0.2)',  color: '#f87171' }
}

const TIER_INFO = {
  1: { label: 'Basic',    desc: 'Static site — HTML/CSS/JS',           color: '#6b7280' },
  2: { label: 'Standard', desc: 'Full-stack — Next.js + DB + Auth',    color: '#3b82f6' },
  3: { label: 'Pro',      desc: 'Advanced — Payments + Realtime',      color: '#a855f7' }
}

export default function BlueprintEditor({ blueprint, onApprove }) {
  const [data, setData] = useState(() => {
    const withIds = { ...blueprint }
    for (const section of Object.keys(SECTION_CONFIG)) {
      withIds[section] = (blueprint[section] || []).map(item => ({
        ...item, id: item.id || nanoid()
      }))
    }
    return withIds
  })
  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)

  function updateField(section, index, field, value) {
    setData(prev => {
      const updated = { ...prev }
      updated[section] = [...updated[section]]
      updated[section][index] = { ...updated[section][index], [field]: value }
      return updated
    })
  }
  function deleteItem(section, index) {
    setData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }))
  }
  function addItem(section) {
    setData(prev => ({ ...prev, [section]: [...prev[section], { ...SECTION_CONFIG[section].empty, id: nanoid() }] }))
  }
  function updateDbField(ti, fi, key, value) {
    setData(prev => {
      const updated = { ...prev }
      updated.dbTables = updated.dbTables.map((t, tidx) =>
        tidx !== ti ? t : { ...t, fields: t.fields.map((f, fidx) => fidx === fi ? { ...f, [key]: value } : f) }
      )
      return updated
    })
  }
  function addDbField(ti) {
    setData(prev => ({
      ...prev,
      dbTables: prev.dbTables.map((t, tidx) => tidx === ti ? { ...t, fields: [...t.fields, { name: 'new_field', type: 'text' }] } : t)
    }))
  }
  function deleteDbField(ti, fi) {
    setData(prev => ({
      ...prev,
      dbTables: prev.dbTables.map((t, tidx) => tidx === ti ? { ...t, fields: t.fields.filter((_, fidx) => fidx !== fi) } : t)
    }))
  }

  const tier = TIER_INFO[data.tier] || TIER_INFO[1]

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <style>{`
        .bp-input { transition: border-color 0.15s !important; }
        .bp-input:focus { border-color: rgba(139,92,246,0.6) !important; outline: none !important; }
        .bp-card:hover { background: #1c1c2e !important; }
        .bp-select { background: #1a1a2e !important; color: rgba(255,255,255,0.8) !important; border-color: rgba(255,255,255,0.12) !important; }
        .bp-del-btn:hover { background: rgba(239,68,68,0.2) !important; border-color: rgba(239,68,68,0.4) !important; color: #f87171 !important; }
        .bp-add-btn:hover { opacity: 0.85 !important; }
      `}</style>

      {/* Project Header */}
      <div style={{
        background: '#15151f', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px', padding: '24px 28px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            {editingName ? (
              <input
                autoFocus
                value={data.projectName}
                onChange={e => setData(p => ({ ...p, projectName: e.target.value }))}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                style={{
                  fontSize: '20px', fontWeight: '700', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(139,92,246,0.5)', color: '#fff',
                  outline: 'none', width: '100%', marginBottom: '8px',
                  fontFamily: 'inherit', padding: '6px 10px', borderRadius: '8px'
                }}
              />
            ) : (
              <div onClick={() => setEditingName(true)} style={{
                fontSize: '20px', fontWeight: '700', color: '#fff',
                marginBottom: '8px', cursor: 'text', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                {data.projectName}
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: '400' }}>✏️ edit</span>
              </div>
            )}
            {editingDesc ? (
              <textarea
                autoFocus
                value={data.description}
                onChange={e => setData(p => ({ ...p, description: e.target.value }))}
                onBlur={() => setEditingDesc(false)}
                style={{
                  fontSize: '13px', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(139,92,246,0.4)', color: 'rgba(255,255,255,0.7)',
                  outline: 'none', width: '100%', borderRadius: '8px',
                  fontFamily: 'inherit', padding: '8px 10px', resize: 'none',
                  lineHeight: '1.6', minHeight: '60px', boxSizing: 'border-box'
                }}
              />
            ) : (
              <div onClick={() => setEditingDesc(true)} style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.45)', cursor: 'text', lineHeight: '1.6',
                display: 'flex', alignItems: 'flex-start', gap: '6px'
              }}>
                {data.description || 'Click to add description'}
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>✏️</span>
              </div>
            )}
          </div>

          {/* Tier selector */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.08em' }}>
              COMPLEXITY TIER
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[1, 2, 3].map(t => (
                <button key={t} onClick={() => setData(p => ({ ...p, tier: t }))} style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                  cursor: 'pointer', border: '1px solid',
                  background: data.tier === t ? TIER_INFO[t].color : 'rgba(255,255,255,0.05)',
                  borderColor: data.tier === t ? TIER_INFO[t].color : 'rgba(255,255,255,0.1)',
                  color: data.tier === t ? '#fff' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.15s'
                }}>
                  {TIER_INFO[t].label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>{tier.desc}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {Object.entries(SECTION_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px' }}>{cfg.icon}</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{data[key]?.length || 0}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Pages */}
        <Section config={SECTION_CONFIG.pages} count={data.pages.length} onAdd={() => addItem('pages')}>
          {data.pages.map((item, i) => (
            <ItemCard key={item.id} accentBorder={SECTION_CONFIG.pages.accentBorder} onDelete={() => deleteItem('pages', i)}>
              <Field label="Page name" value={item.name} onChange={v => updateField('pages', i, 'name', v)} />
              <Field label="Description" value={item.description} onChange={v => updateField('pages', i, 'description', v)} multiline />
            </ItemCard>
          ))}
        </Section>

        {/* Features */}
        <Section config={SECTION_CONFIG.features} count={data.features.length} onAdd={() => addItem('features')}>
          {data.features.map((item, i) => (
            <ItemCard key={item.id} accentBorder={SECTION_CONFIG.features.accentBorder} onDelete={() => deleteItem('features', i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '5px', letterSpacing: '0.05em',
                  background: PRIORITY_STYLES[item.priority]?.bg || 'rgba(255,255,255,0.1)',
                  color: PRIORITY_STYLES[item.priority]?.color || 'rgba(255,255,255,0.5)'
                }}>
                  {PRIORITY_STYLES[item.priority]?.label || item.priority?.toUpperCase()}
                </span>
                <select value={item.priority} onChange={e => updateField('features', i, 'priority', e.target.value)}
                  className="bp-select" style={{
                    fontSize: '12px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px',
                    padding: '3px 8px', cursor: 'pointer', outline: 'none'
                  }}>
                  <option value="must">Must have</option>
                  <option value="should">Should have</option>
                  <option value="could">Could have</option>
                </select>
              </div>
              <Field label="Feature name" value={item.name} onChange={v => updateField('features', i, 'name', v)} />
              <Field label="Description" value={item.description} onChange={v => updateField('features', i, 'description', v)} multiline />
            </ItemCard>
          ))}
        </Section>

        {/* API Routes */}
        <Section config={SECTION_CONFIG.apiRoutes} count={data.apiRoutes.length} onAdd={() => addItem('apiRoutes')}>
          {data.apiRoutes.map((item, i) => (
            <ItemCard key={item.id} accentBorder={SECTION_CONFIG.apiRoutes.accentBorder} onDelete={() => deleteItem('apiRoutes', i)}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '3px 7px', borderRadius: '5px', letterSpacing: '0.05em',
                  background: METHOD_STYLES[item.method]?.bg || 'rgba(255,255,255,0.1)',
                  color: METHOD_STYLES[item.method]?.color || '#fff'
                }}>{item.method}</span>
                <select value={item.method} onChange={e => updateField('apiRoutes', i, 'method', e.target.value)}
                  className="bp-select" style={{
                    fontSize: '12px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px',
                    padding: '3px 8px', cursor: 'pointer', outline: 'none'
                  }}>
                  {['GET', 'POST', 'PUT', 'DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <Field label="Path" value={item.path} onChange={v => updateField('apiRoutes', i, 'path', v)} mono />
              <Field label="Description" value={item.description} onChange={v => updateField('apiRoutes', i, 'description', v)} multiline />
            </ItemCard>
          ))}
        </Section>

        {/* Database Tables */}
        <Section config={SECTION_CONFIG.dbTables} count={data.dbTables.length} onAdd={() => addItem('dbTables')}>
          {data.dbTables.map((table, ti) => (
            <ItemCard key={table.id} accentBorder={SECTION_CONFIG.dbTables.accentBorder} onDelete={() => deleteItem('dbTables', ti)} wide>
              <Field label="Table name" value={table.name} onChange={v => updateField('dbTables', ti, 'name', v)} mono />
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '600', marginBottom: '6px', letterSpacing: '0.06em' }}>FIELDS</div>
                {table.fields.map((field, fi) => (
                  <div key={fi} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '5px' }}>
                    <input value={field.name} onChange={e => updateDbField(ti, fi, 'name', e.target.value)}
                      className="bp-input"
                      style={{
                        flex: 1, fontSize: '12px', fontFamily: 'monospace',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
                        padding: '5px 8px', background: 'rgba(255,255,255,0.04)', color: '#fff'
                      }} />
                    <input value={field.type} onChange={e => updateDbField(ti, fi, 'type', e.target.value)}
                      className="bp-input"
                      style={{
                        width: '90px', fontSize: '12px', fontFamily: 'monospace',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
                        padding: '5px 8px', background: 'rgba(255,255,255,0.04)', color: '#a855f7'
                      }} />
                    <button onClick={() => deleteDbField(ti, fi)} className="bp-del-btn" style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                      color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      transition: 'all 0.15s'
                    }}>×</button>
                  </div>
                ))}
                <button onClick={() => addDbField(ti)} style={{
                  marginTop: '6px', fontSize: '12px', color: '#f97316', background: 'none',
                  border: '1px dashed rgba(249,115,22,0.35)', borderRadius: '6px',
                  padding: '5px 12px', cursor: 'pointer', fontWeight: '500', width: '100%',
                  transition: 'all 0.15s'
                }}>+ Add field</button>
              </div>
            </ItemCard>
          ))}
        </Section>
      </div>

      {/* Approve button */}
      <div style={{
        marginTop: '28px', padding: '22px 24px',
        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: '14px', textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', marginBottom: '16px' }}>
          Happy with the plan? Approve it to proceed to Risk Radar → Code Generation.
        </p>
        <button onClick={() => onApprove(data)} style={{
          background: '#7c3aed', color: '#fff', border: 'none',
          padding: '12px 36px', fontSize: '14px', fontWeight: '700',
          borderRadius: '10px', cursor: 'pointer', letterSpacing: '-0.2px',
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
          onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
        >
          Approve Blueprint → Continue
        </button>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function Section({ config, count, onAdd, children }) {
  return (
    <div style={{
      border: `1px solid ${config.accentBorder}`,
      borderRadius: '14px', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 18px',
        background: config.accentBg,
        borderBottom: `1px solid ${config.accentBorder}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{config.icon}</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{config.label}</span>
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '2px 7px',
            borderRadius: '20px', background: config.accentColor, color: '#fff'
          }}>{count}</span>
        </div>
        <button className="bp-add-btn" onClick={onAdd} style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: config.accentColor, color: '#fff', border: 'none',
          borderRadius: '7px', padding: '6px 12px',
          fontSize: '12px', fontWeight: '600', cursor: 'pointer',
          transition: 'opacity 0.15s'
        }}>
          + Add {config.label.replace(/s$/, '')}
        </button>
      </div>
      {/* Cards grid */}
      <div style={{
        padding: '14px', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '10px', background: '#0d0d18'
      }}>
        {children}
      </div>
    </div>
  )
}

function ItemCard({ children, accentBorder, onDelete }) {
  return (
    <div className="bp-card" style={{
      background: '#15151f', border: `1px solid ${accentBorder}`,
      borderRadius: '10px', padding: '13px', position: 'relative',
      transition: 'background 0.15s'
    }}>
      <button onClick={onDelete} className="bp-del-btn" style={{
        position: 'absolute', top: '9px', right: '9px',
        width: '20px', height: '20px', borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
        color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '13px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        lineHeight: 1, zIndex: 1, transition: 'all 0.15s'
      }}>×</button>
      <div style={{ paddingRight: '26px' }}>{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, multiline, mono }) {
  const base = {
    width: '100%', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px', padding: '6px 9px', background: 'rgba(255,255,255,0.04)',
    fontFamily: mono ? 'monospace' : 'inherit',
    boxSizing: 'border-box', outline: 'none', color: '#fff',
    transition: 'border-color 0.15s'
  }
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', letterSpacing: '0.07em' }}>
        {label.toUpperCase()}
      </div>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={2}
          className="bp-input" style={{ ...base, resize: 'vertical', lineHeight: '1.5' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)}
          className="bp-input" style={base} />
      )}
    </div>
  )
}