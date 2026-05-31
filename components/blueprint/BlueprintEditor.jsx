'use client'

import { useState } from 'react'

export default function BlueprintEditor({ blueprint, onApprove }) {
  const [data, setData] = useState(blueprint)

  // Generic update for simple string fields
  function updateItem(section, index, field, value) {
    const updated = { ...data }
    updated[section][index][field] = value
    setData(updated)
  }

  function deleteItem(section, index) {
    const updated = { ...data }
    updated[section] = updated[section].filter((_, i) => i !== index)
    setData(updated)
  }

  function addItem(section) {
    const updated = { ...data }
    const templates = {
      pages:     { name: 'New Page', description: 'Page description' },
      features:  { name: 'New Feature', description: 'Feature description', priority: 'could' },
      apiRoutes: { method: 'GET', path: '/api/new', description: 'Route description' },
      dbTables:  { name: 'new_table', fields: [{ name: 'id', type: 'uuid' }] }
    }
    updated[section] = [...updated[section], templates[section]]
    setData(updated)
  }

  const tierLabels = { 1: 'Basic — Static site', 2: 'Standard — Fullstack + Auth', 3: 'Pro — Payments + Realtime' }
  const priorityColors = { must: '#16a34a', should: '#ca8a04', could: '#9ca3af' }
  const methodColors = { GET: '#2563eb', POST: '#16a34a', PUT: '#ca8a04', DELETE: '#dc2626' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{
        background: '#f9f9f9', border: '1px solid #eee',
        borderRadius: '10px', padding: '16px 20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0' }}>{data.projectName}</h2>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>{data.description}</p>
          </div>
          <span style={{
            background: '#000', color: '#fff', fontSize: '12px',
            padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap'
          }}>
            {tierLabels[data.tier]}
          </span>
        </div>
      </div>

      {/* Pages */}
      <Section
        title="Pages" emoji="📄"
        items={data.pages}
        onAdd={() => addItem('pages')}
        renderItem={(item, i) => (
          <EditableCard key={i}>
            <EditableField
              label="Page name"
              value={item.name}
              onChange={v => updateItem('pages', i, 'name', v)}
            />
            <EditableField
              label="Description"
              value={item.description}
              onChange={v => updateItem('pages', i, 'description', v)}
            />
            <DeleteBtn onClick={() => deleteItem('pages', i)} />
          </EditableCard>
        )}
      />

      {/* Features */}
      <Section
        title="Features" emoji="⚡"
        items={data.features}
        onAdd={() => addItem('features')}
        renderItem={(item, i) => (
          <EditableCard key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{
                fontSize: '11px', fontWeight: '600', padding: '2px 8px',
                borderRadius: '8px', background: priorityColors[item.priority] + '20',
                color: priorityColors[item.priority], textTransform: 'uppercase'
              }}>
                {item.priority}
              </span>
              <select
                value={item.priority}
                onChange={e => updateItem('features', i, 'priority', e.target.value)}
                style={{ fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px', padding: '2px 6px' }}
              >
                <option value="must">Must</option>
                <option value="should">Should</option>
                <option value="could">Could</option>
              </select>
            </div>
            <EditableField
              label="Feature name"
              value={item.name}
              onChange={v => updateItem('features', i, 'name', v)}
            />
            <EditableField
              label="Description"
              value={item.description}
              onChange={v => updateItem('features', i, 'description', v)}
            />
            <DeleteBtn onClick={() => deleteItem('features', i)} />
          </EditableCard>
        )}
      />

      {/* API Routes */}
      <Section
        title="API Routes" emoji="🔌"
        items={data.apiRoutes}
        onAdd={() => addItem('apiRoutes')}
        renderItem={(item, i) => (
          <EditableCard key={i}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <select
                value={item.method}
                onChange={e => updateItem('apiRoutes', i, 'method', e.target.value)}
                style={{
                  fontSize: '12px', fontWeight: '600', border: '1px solid #ddd',
                  borderRadius: '4px', padding: '3px 6px',
                  color: methodColors[item.method]
                }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input
                value={item.path}
                onChange={e => updateItem('apiRoutes', i, 'path', e.target.value)}
                style={{
                  flex: 1, fontSize: '13px', fontFamily: 'monospace',
                  border: '1px solid #ddd', borderRadius: '4px',
                  padding: '4px 8px'
                }}
              />
            </div>
            <EditableField
              label="Description"
              value={item.description}
              onChange={v => updateItem('apiRoutes', i, 'description', v)}
            />
            <DeleteBtn onClick={() => deleteItem('apiRoutes', i)} />
          </EditableCard>
        )}
      />

      {/* DB Tables */}
      <Section
        title="Database Tables" emoji="🗄️"
        items={data.dbTables}
        onAdd={() => addItem('dbTables')}
        renderItem={(item, i) => (
          <EditableCard key={i}>
            <EditableField
              label="Table name"
              value={item.name}
              onChange={v => updateItem('dbTables', i, 'name', v)}
            />
            <div style={{ marginTop: '6px' }}>
              <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px 0' }}>Fields</p>
              {item.fields.map((field, fi) => (
                <div key={fi} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                  <input
                    value={field.name}
                    onChange={e => {
                      const updated = { ...data }
                      updated.dbTables[i].fields[fi].name = e.target.value
                      setData(updated)
                    }}
                    placeholder="field name"
                    style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace', border: '1px solid #ddd', borderRadius: '4px', padding: '3px 7px' }}
                  />
                  <input
                    value={field.type}
                    onChange={e => {
                      const updated = { ...data }
                      updated.dbTables[i].fields[fi].type = e.target.value
                      setData(updated)
                    }}
                    placeholder="type"
                    style={{ width: '80px', fontSize: '12px', fontFamily: 'monospace', border: '1px solid #ddd', borderRadius: '4px', padding: '3px 7px' }}
                  />
                </div>
              ))}
            </div>
            <DeleteBtn onClick={() => deleteItem('dbTables', i)} />
          </EditableCard>
        )}
      />

      {/* Approve Button */}
      <button
        onClick={() => onApprove(data)}
        style={{
          width: '100%', background: '#000', color: '#fff',
          border: 'none', padding: '14px', fontSize: '15px',
          fontWeight: '500', borderRadius: '8px', cursor: 'pointer',
          marginTop: '8px'
        }}
      >
        Approve Blueprint → Generate App
      </button>

    </div>
  )
}

// Small reusable components
function Section({ title, emoji, items, onAdd, renderItem }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>{emoji} {title} ({items.length})</h3>
        <button
          onClick={onAdd}
          style={{
            background: 'none', border: '1px solid #ddd', borderRadius: '6px',
            padding: '4px 12px', fontSize: '12px', cursor: 'pointer', color: '#555'
          }}
        >
          + Add
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
        {items.map((item, i) => renderItem(item, i))}
      </div>
    </div>
  )
}

function EditableCard({ children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e5e5',
      borderRadius: '8px', padding: '12px', position: 'relative'
    }}>
      {children}
    </div>
  )
}

function EditableField({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: '6px' }}>
      <p style={{ fontSize: '11px', color: '#999', margin: '0 0 2px 0' }}>{label}</p>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', fontSize: '13px', border: '1px solid #eee',
          borderRadius: '4px', padding: '5px 8px',
          boxSizing: 'border-box', fontFamily: 'inherit'
        }}
      />
    </div>
  )
}

function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute', top: '8px', right: '8px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#ccc', fontSize: '16px', lineHeight: 1,
        padding: '2px'
      }}
    >
      ×
    </button>
  )
}