'use client'

import { useState } from 'react'

const SECTION_CONFIG = {
  pages: {
    label: 'Pages',
    icon: '📄',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    empty: { name: 'New Page', description: 'Describe this page' }
  },
  features: {
    label: 'Features',
    icon: '⚡',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    empty: { name: 'New Feature', description: 'Describe this feature', priority: 'could' }
  },
  apiRoutes: {
    label: 'API Routes',
    icon: '🔌',
    color: '#9333ea',
    bg: '#faf5ff',
    border: '#e9d5ff',
    empty: { method: 'GET', path: '/api/new', description: 'Describe this route' }
  },
  dbTables: {
    label: 'Database Tables',
    icon: '🗄️',
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    empty: { name: 'new_table', fields: [{ name: 'id', type: 'uuid' }, { name: 'created_at', type: 'timestamptz' }] }
  }
}

const PRIORITY_STYLES = {
  must:   { bg: '#dcfce7', color: '#15803d', label: 'MUST' },
  should: { bg: '#fef9c3', color: '#854d0e', label: 'SHOULD' },
  could:  { bg: '#f3f4f6', color: '#6b7280', label: 'COULD' }
}

const METHOD_STYLES = {
  GET:    { bg: '#dbeafe', color: '#1d4ed8' },
  POST:   { bg: '#dcfce7', color: '#15803d' },
  PUT:    { bg: '#fef9c3', color: '#854d0e' },
  DELETE: { bg: '#fee2e2', color: '#dc2626' }
}

const TIER_INFO = {
  1: { label: 'Basic', desc: 'Static site — HTML/CSS/JS', color: '#6b7280' },
  2: { label: 'Standard', desc: 'Full-stack — Next.js + DB + Auth', color: '#2563eb' },
  3: { label: 'Pro', desc: 'Advanced — Payments + Realtime', color: '#9333ea' }
}

export default function BlueprintEditor({ blueprint, onApprove }) {
  const [data, setData] = useState(blueprint)
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
    setData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  function addItem(section) {
    setData(prev => ({
      ...prev,
      [section]: [...prev[section], { ...SECTION_CONFIG[section].empty }]
    }))
  }

  function updateDbField(tableIndex, fieldIndex, key, value) {
    setData(prev => {
      const updated = { ...prev }
      updated.dbTables = updated.dbTables.map((t, ti) => {
        if (ti !== tableIndex) return t
        return {
          ...t,
          fields: t.fields.map((f, fi) =>
            fi === fieldIndex ? { ...f, [key]: value } : f
          )
        }
      })
      return updated
    })
  }

  function addDbField(tableIndex) {
    setData(prev => {
      const updated = { ...prev }
      updated.dbTables = updated.dbTables.map((t, ti) =>
        ti === tableIndex
          ? { ...t, fields: [...t.fields, { name: 'new_field', type: 'text' }] }
          : t
      )
      return updated
    })
  }

  function deleteDbField(tableIndex, fieldIndex) {
    setData(prev => {
      const updated = { ...prev }
      updated.dbTables = updated.dbTables.map((t, ti) =>
        ti === tableIndex
          ? { ...t, fields: t.fields.filter((_, fi) => fi !== fieldIndex) }
          : t
      )
      return updated
    })
  }

  const tier = TIER_INFO[data.tier] || TIER_INFO[1]

  return (
    <div style={{ fontFamily: 'inherit' }}>

      {/* Project Header Card */}
      <div style={{
        background: '#0a0a0a', borderRadius: '14px',
        padding: '24px 28px', marginBottom: '24px', color: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ flex: 1 }}>

            {/* Editable Project Name */}
            {editingName ? (
              <input
                autoFocus
                value={data.projectName}
                onChange={e => setData(p => ({ ...p, projectName: e.target.value }))}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                style={{
                  fontSize: '22px', fontWeight: '800', background: 'transparent',
                  border: 'none', borderBottom: '2px solid #fff', color: '#fff',
                  outline: 'none', width: '100%', marginBottom: '8px',
                  fontFamily: 'inherit', padding: '0 0 2px 0'
                }}
              />
            ) : (
              <div
                onClick={() => setEditingName(true)}
                style={{
                  fontSize: '22px', fontWeight: '800', color: '#fff',
                  marginBottom: '8px', cursor: 'text',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {data.projectName}
                <span style={{ fontSize: '12px', color: '#555', fontWeight: '400' }}>
                  ✏️ click to edit
                </span>
              </div>
            )}

            {/* Editable Description */}
            {editingDesc ? (
              <textarea
                autoFocus
                value={data.description}
                onChange={e => setData(p => ({ ...p, description: e.target.value }))}
                onBlur={() => setEditingDesc(false)}
                style={{
                  fontSize: '14px', background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)', color: '#ccc',
                  outline: 'none', width: '100%', borderRadius: '6px',
                  fontFamily: 'inherit', padding: '8px', resize: 'none',
                  lineHeight: '1.6', minHeight: '60px'
                }}
              />
            ) : (
              <div
                onClick={() => setEditingDesc(true)}
                style={{ fontSize: '14px', color: '#999', cursor: 'text', lineHeight: '1.6' }}
              >
                {data.description}
                <span style={{ fontSize: '11px', color: '#555', marginLeft: '6px' }}>✏️</span>
              </div>
            )}
          </div>

          {/* Tier selector */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '10px', color: '#555', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.08em' }}>
              COMPLEXITY TIER
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3].map(t => (
                <button
                  key={t}
                  onClick={() => setData(p => ({ ...p, tier: t }))}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                    fontWeight: '600', cursor: 'pointer', border: 'none',
                    background: data.tier === t ? TIER_INFO[t].color : '#1a1a1a',
                    color: data.tier === t ? '#fff' : '#555',
                    transition: 'all 0.15s'
                  }}
                >
                  {TIER_INFO[t].label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '5px' }}>
              {tier.desc}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '20px', marginTop: '20px',
          paddingTop: '16px', borderTop: '1px solid #1a1a1a'
        }}>
          {Object.entries(SECTION_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>
                {data[key]?.length || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#555' }}>{cfg.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Pages */}
        <Section
          config={SECTION_CONFIG.pages}
          count={data.pages.length}
          onAdd={() => addItem('pages')}
        >
          {data.pages.map((item, i) => (
            <ItemCard key={i} color={SECTION_CONFIG.pages.border} onDelete={() => deleteItem('pages', i)}>
              <Field label="Page name" value={item.name}
                onChange={v => updateField('pages', i, 'name', v)} />
              <Field label="Description" value={item.description}
                onChange={v => updateField('pages', i, 'description', v)} multiline />
            </ItemCard>
          ))}
        </Section>

        {/* Features */}
        <Section
          config={SECTION_CONFIG.features}
          count={data.features.length}
          onAdd={() => addItem('features')}
        >
          {data.features.map((item, i) => (
            <ItemCard key={i} color={SECTION_CONFIG.features.border} onDelete={() => deleteItem('features', i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: '700', padding: '3px 9px',
                  borderRadius: '6px', letterSpacing: '0.05em',
                  background: PRIORITY_STYLES[item.priority]?.bg || '#f3f4f6',
                  color: PRIORITY_STYLES[item.priority]?.color || '#666'
                }}>
                  {PRIORITY_STYLES[item.priority]?.label || item.priority?.toUpperCase()}
                </span>
                <select
                  value={item.priority}
                  onChange={e => updateField('features', i, 'priority', e.target.value)}
                  style={{
                    fontSize: '12px', border: '1px solid #e5e5e5', borderRadius: '6px',
                    padding: '3px 8px', background: '#fff', cursor: 'pointer'
                  }}
                >
                  <option value="must">Must have</option>
                  <option value="should">Should have</option>
                  <option value="could">Could have</option>
                </select>
              </div>
              <Field label="Feature name" value={item.name}
                onChange={v => updateField('features', i, 'name', v)} />
              <Field label="Description" value={item.description}
                onChange={v => updateField('features', i, 'description', v)} multiline />
            </ItemCard>
          ))}
        </Section>

        {/* API Routes */}
        <Section
          config={SECTION_CONFIG.apiRoutes}
          count={data.apiRoutes.length}
          onAdd={() => addItem('apiRoutes')}
        >
          {data.apiRoutes.map((item, i) => (
            <ItemCard key={i} color={SECTION_CONFIG.apiRoutes.border} onDelete={() => deleteItem('apiRoutes', i)}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: '700', padding: '4px 8px',
                  borderRadius: '6px', letterSpacing: '0.05em',
                  background: METHOD_STYLES[item.method]?.bg || '#f3f4f6',
                  color: METHOD_STYLES[item.method]?.color || '#666'
                }}>
                  {item.method}
                </span>
                <select
                  value={item.method}
                  onChange={e => updateField('apiRoutes', i, 'method', e.target.value)}
                  style={{
                    fontSize: '12px', border: '1px solid #e5e5e5', borderRadius: '6px',
                    padding: '3px 8px', background: '#fff', cursor: 'pointer'
                  }}
                >
                  {['GET', 'POST', 'PUT', 'DELETE'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <Field label="Path" value={item.path}
                onChange={v => updateField('apiRoutes', i, 'path', v)} mono />
              <Field label="Description" value={item.description}
                onChange={v => updateField('apiRoutes', i, 'description', v)} multiline />
            </ItemCard>
          ))}
        </Section>

        {/* Database Tables */}
        <Section
          config={SECTION_CONFIG.dbTables}
          count={data.dbTables.length}
          onAdd={() => addItem('dbTables')}
        >
          {data.dbTables.map((table, ti) => (
            <ItemCard key={ti} color={SECTION_CONFIG.dbTables.border} onDelete={() => deleteItem('dbTables', ti)} wide>
              <Field label="Table name" value={table.name}
                onChange={v => updateField('dbTables', ti, 'name', v)} mono />

              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', marginBottom: '6px' }}>
                  FIELDS
                </div>
                {table.fields.map((field, fi) => (
                  <div key={fi} style={{
                    display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '5px'
                  }}>
                    <input
                      value={field.name}
                      onChange={e => updateDbField(ti, fi, 'name', e.target.value)}
                      style={{
                        flex: 1, fontSize: '12px', fontFamily: 'monospace',
                        border: '1px solid #e5e5e5', borderRadius: '6px',
                        padding: '5px 8px', background: '#fafafa'
                      }}
                    />
                    <input
                      value={field.type}
                      onChange={e => updateDbField(ti, fi, 'type', e.target.value)}
                      style={{
                        width: '90px', fontSize: '12px', fontFamily: 'monospace',
                        border: '1px solid #e5e5e5', borderRadius: '6px',
                        padding: '5px 8px', background: '#fafafa', color: '#9333ea'
                      }}
                    />
                    <button
                      onClick={() => deleteDbField(ti, fi)}
                      title="Remove field"
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        border: '1px solid #e5e5e5', background: '#fff',
                        color: '#aaa', cursor: 'pointer', fontSize: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addDbField(ti)}
                  style={{
                    marginTop: '6px', fontSize: '12px', color: '#ea580c',
                    background: 'none', border: '1px dashed #fed7aa',
                    borderRadius: '6px', padding: '5px 12px', cursor: 'pointer',
                    fontWeight: '500', width: '100%'
                  }}
                >
                  + Add field
                </button>
              </div>
            </ItemCard>
          ))}
        </Section>
      </div>

      {/* Approve Button */}
      <div style={{
        marginTop: '32px', padding: '24px',
        background: '#f9fafb', border: '1px solid #e5e5e5',
        borderRadius: '14px', textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
          Happy with the plan? Approve it to proceed to Risk Radar → Code Generation.
        </p>
        <button
          onClick={() => onApprove(data)}
          style={{
            background: '#0a0a0a', color: '#fff', border: 'none',
            padding: '14px 40px', fontSize: '15px', fontWeight: '700',
            borderRadius: '10px', cursor: 'pointer', letterSpacing: '-0.2px'
          }}
        >
          Approve Blueprint → Continue
        </button>
      </div>

    </div>
  )
}

/* ── Reusable sub-components ── */

function Section({ config, count, onAdd, children }) {
  return (
    <div style={{
      border: `1px solid ${config.border}`,
      borderRadius: '14px', overflow: 'hidden'
    }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        background: config.bg,
        borderBottom: `1px solid ${config.border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{config.icon}</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a' }}>
            {config.label}
          </span>
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '2px 8px',
            borderRadius: '20px', background: config.color, color: '#fff'
          }}>
            {count}
          </span>
        </div>
        <button
          onClick={onAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: config.color, color: '#fff', border: 'none',
            borderRadius: '8px', padding: '7px 14px',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          + Add {config.label.slice(0, -1)}
        </button>
      </div>

      {/* Cards grid */}
      <div style={{
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '12px',
        background: '#fff'
      }}>
        {children}
      </div>
    </div>
  )
}

function ItemCard({ children, color, onDelete }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${color}`,
      borderRadius: '10px', padding: '14px',
      position: 'relative', transition: 'box-shadow 0.15s'
    }}>
      {/* Delete button — top right, clearly visible */}
      <button
        onClick={onDelete}
        title="Remove"
        style={{
          position: 'absolute', top: '10px', right: '10px',
          width: '22px', height: '22px', borderRadius: '50%',
          border: '1px solid #e5e5e5', background: '#fff',
          color: '#999', cursor: 'pointer', fontSize: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1, zIndex: 1
        }}
      >
        ×
      </button>
      {/* Content pushed right to not overlap delete btn */}
      <div style={{ paddingRight: '28px' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, multiline, mono }) {
  const base = {
    width: '100%', fontSize: '13px', border: '1px solid #e5e5e5',
    borderRadius: '6px', padding: '6px 9px', background: '#fafafa',
    fontFamily: mono ? 'monospace' : 'inherit',
    boxSizing: 'border-box', outline: 'none',
    transition: 'border-color 0.15s'
  }

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ fontSize: '10px', fontWeight: '600', color: '#aaa', marginBottom: '3px', letterSpacing: '0.06em' }}>
        {label.toUpperCase()}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={2}
          style={{ ...base, resize: 'vertical', lineHeight: '1.5' }}
          onFocus={e => e.target.style.borderColor = '#0a0a0a'}
          onBlur={e => e.target.style.borderColor = '#e5e5e5'}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          style={base}
          onFocus={e => e.target.style.borderColor = '#0a0a0a'}
          onBlur={e => e.target.style.borderColor = '#e5e5e5'}
        />
      )}
    </div>
  )
}