/**
 * saas-dashboard / sections / table.jsx
 *
 * Exports: DataTable, TablePagination, StatusBadge
 *
 * TEMPLATE RULES (for AI customization):
 * - Change column definitions and row data to match the entity (users, orders, etc.)
 * - Change status values and their colors in StatusBadge
 * - Preserve ALL exported names and prop signatures
 * - Do NOT remove the sort logic or pagination handlers
 */
'use client'

import { useState, useMemo } from 'react'

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  active:    { bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)',   color: '#4ade80'  },
  inactive:  { bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)',    color: '#f87171'  },
  pending:   { bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.3)',   color: '#fbbf24'  },
  cancelled: { bg: 'rgba(107,114,128,0.1)',  border: 'rgba(107,114,128,0.3)', color: '#9ca3af'  },
  trial:     { bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.3)',   color: '#a78bfa'  },
}

export function StatusBadge({ status = 'active' }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.active
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: s.bg, border: `1px solid ${s.border}`,
      padding: '3px 9px', borderRadius: '999px',
      fontSize: '11px', fontWeight: '700', color: s.color,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.color }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ─── TablePagination ──────────────────────────────────────────────────────────

export function TablePagination({ page, total, pageSize, onPage }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', padding: '0 4px' }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          id="table-prev-page"
          onClick={() => onPage(page - 1)} disabled={page === 1}
          style={{ padding: '6px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: page === 1 ? 'default' : 'pointer', transition: 'all 0.15s' }}
        >← Prev</button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPage(p)} style={{
            padding: '6px 10px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s',
            background: page === p ? 'var(--dash-primary, #7c3aed)' : 'rgba(255,255,255,0.05)',
            border: '1px solid',
            borderColor: page === p ? 'var(--dash-primary, #7c3aed)' : 'rgba(255,255,255,0.1)',
            color: page === p ? '#fff' : 'rgba(255,255,255,0.5)',
            fontWeight: page === p ? '700' : '400',
          }}>{p}</button>
        ))}
        <button
          id="table-next-page"
          onClick={() => onPage(page + 1)} disabled={page === totalPages}
          style={{ padding: '6px 12px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: page === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: page === totalPages ? 'default' : 'pointer', transition: 'all 0.15s' }}
        >Next →</button>
      </div>
    </div>
  )
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable({
  columns = [
    { key: 'name',    label: 'Name',    sortable: true  },
    { key: 'email',   label: 'Email',   sortable: true  },
    { key: 'plan',    label: 'Plan',    sortable: false },
    { key: 'status',  label: 'Status',  sortable: true,  render: (v) => <StatusBadge status={v} /> },
    { key: 'joined',  label: 'Joined',  sortable: true  },
    { key: 'mrr',     label: 'MRR',     sortable: true  },
  ],
  data = [],
  pageSize = 10,
  onRowClick,
  loading = false,
  emptyMessage = 'No data found.',
  title = 'Users',
  onExport,
}) {
  const [sortKey, setSortKey]   = useState(null)
  const [sortDir, setSortDir]   = useState('asc')
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')

  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    )
  }, [data, search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  return (
    <div data-testid="data-table" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
      {/* Table header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{title}</span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              id="table-search"
              type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search…"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', padding: '7px 12px 7px 28px', color: '#fff', fontSize: '12px', outline: 'none', width: '160px' }}
            />
            <span style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>⌕</span>
          </div>
          {/* Export */}
          {onExport && (
            <button id="table-export" onClick={onExport} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '7px 12px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >Export CSV ↓</button>
          )}
        </div>
      </div>

      {/* Scrollable table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable && handleSort(col.key)}
                  style={{
                    padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700',
                    color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none', whiteSpace: 'nowrap',
                  }}>
                  {col.label} {col.sortable && sortKey === col.key && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} style={{ padding: '12px 16px' }}>
                      <div style={{ height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', width: `${60 + Math.random() * 30}%`, animation: 'dash-shimmer 1.5s infinite' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>{emptyMessage}</td></tr>
            ) : (
              paginated.map((row, ri) => (
                <tr key={ri}
                  data-testid="data-table-row"
                  onClick={() => onRowClick?.(row)}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.1s' }}
                  onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '12px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ padding: '12px 20px', borderTop: paginated.length > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <TablePagination page={page} total={sorted.length} pageSize={pageSize} onPage={setPage} />
      </div>

      <style>{`@keyframes dash-shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
    </div>
  )
}
