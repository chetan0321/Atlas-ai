/**
 * saas-dashboard / sections / layout.jsx
 *
 * Exports: DashboardShell, Sidebar, Topbar, PageHeader
 *
 * TEMPLATE RULES (for AI customization):
 * - Change nav items, brand name, and user info to match the product
 * - Change colors via --dash-primary, --dash-sidebar-bg CSS vars
 * - Preserve ALL exported component names and prop signatures
 * - Do NOT remove the mobile responsive collapse logic from Sidebar
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const DEFAULT_NAV = [
  { href: '/dashboard',          icon: '⊞', label: 'Overview',     badge: null },
  { href: '/dashboard/analytics',icon: '📊', label: 'Analytics',    badge: null },
  { href: '/dashboard/users',    icon: '👥', label: 'Users',        badge: '3' },
  { href: '/dashboard/projects', icon: '📁', label: 'Projects',     badge: null },
  { href: '/dashboard/billing',  icon: '💳', label: 'Billing',      badge: null },
  { href: '/dashboard/settings', icon: '⚙',  label: 'Settings',     badge: null },
]

export function Sidebar({
  brandName = 'Atlas',
  nav = DEFAULT_NAV,
  activeHref = '/dashboard',
  user = { name: 'Jane Smith', email: 'jane@company.com', initials: 'JS' },
  collapsed = false,
  onToggle,
}) {
  const width = collapsed ? '64px' : '220px'

  return (
    <aside style={{
      width, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: 'var(--dash-sidebar-bg, #0d0d1a)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s ease', overflow: 'hidden',
    }}>
      {/* Brand */}
      <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && (
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '-0.2px' }}>
            <span style={{ color: 'var(--dash-primary, #7c3aed)' }}>✦</span> {brandName}
          </span>
        )}
        <button id="sidebar-toggle" onClick={onToggle} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '16px', padding: '4px', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        >{collapsed ? '›' : '‹'}</button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {nav.map(item => {
          const active = activeHref === item.href
          return (
            <Link key={item.href} href={item.href} id={`nav-${item.label.toLowerCase()}`} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 10px', borderRadius: '8px', marginBottom: '2px',
              textDecoration: 'none', transition: 'all 0.15s',
              background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
              border: active ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0, width: '22px', textAlign: 'center' }}>{item.icon}</span>
              {!collapsed && <>
                <span style={{ fontSize: '13px', fontWeight: active ? '700' : '500', color: active ? '#fff' : 'rgba(255,255,255,0.5)', flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ background: 'var(--dash-primary, #7c3aed)', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '999px' }}>{item.badge}</span>
                )}
              </>}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--dash-primary, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>{user.initials}</div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          </div>
        )}
      </div>
    </aside>
  )
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

export function Topbar({ title = 'Overview', searchPlaceholder = 'Search…', onSearch, notifications = 3 }) {
  const [query, setQuery] = useState('')

  return (
    <header style={{
      height: '56px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '0 24px', background: 'var(--dash-bg, #0a0a15)', flexShrink: 0,
    }}>
      <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff', flex: 1 }}>{title}</span>

      {/* Search */}
      <div style={{ position: 'relative', width: '220px' }}>
        <input
          id="topbar-search"
          type="text" value={query}
          onChange={e => { setQuery(e.target.value); onSearch?.(e.target.value) }}
          placeholder={searchPlaceholder}
          style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '7px 12px 7px 32px', color: '#fff', fontSize: '13px', outline: 'none' }}
        />
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>⌕</span>
      </div>

      {/* Notifications */}
      <button id="topbar-notifications" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '18px', padding: '4px' }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
      >
        🔔
        {notifications > 0 && (
          <span style={{ position: 'absolute', top: '0', right: '0', width: '16px', height: '16px', background: '#ef4444', borderRadius: '50%', fontSize: '9px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications}</span>
        )}
      </button>
    </header>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export function PageHeader({ title, description, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px' }}>{title}</h1>
        {description && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{description}</p>}
      </div>
      {action && (
        <button onClick={action.onClick} id={`page-action-${title?.toLowerCase().replace(/\s+/g, '-')}`} style={{
          background: 'var(--dash-primary, #7c3aed)', color: '#fff', border: 'none',
          padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
          cursor: 'pointer', transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >{action.label}</button>
      )}
    </div>
  )
}

// ─── DashboardShell ───────────────────────────────────────────────────────────

export function DashboardShell({ children, brandName, nav, activeHref, user, topbarTitle }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--dash-bg, #0a0a15)', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar
        brandName={brandName}
        nav={nav}
        activeHref={activeHref}
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title={topbarTitle} />
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
