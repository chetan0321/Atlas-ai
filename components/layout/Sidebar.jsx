'use client'

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import AtlasLogo from '@/components/AtlasLogo'

const statusColors = {
  draft: '#6b7280', blueprint: '#3b82f6', risk: '#f59e0b',
  generated: '#22c55e', deployed: '#10b981', saved: '#10b981'
}

const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  signout: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  loader: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
  )
}

/* ── Spinner that rotates ── */
function Spinner({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      style={{ animation: 'sb-spin 0.8s linear infinite', flexShrink: 0 }}>
      <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/>
    </svg>
  )
}

function SidebarInner() {
  const [projects, setProjects] = useState([])
  const [user, setUser] = useState(null)
  const [navigatingTo, setNavigatingTo] = useState(null) // track which link is loading
  const supabase = useMemo(() => createClient(), [])
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeProjectId = searchParams.get('id')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('projects').select('id, name, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(20)
        setProjects(data || [])
      }
    }
    load()
    const channel = supabase.channel('projects-sidebar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [supabase])

  // Clear loading when route changes
  useEffect(() => {
    setNavigatingTo(null)
  }, [pathname, activeProjectId])

  const navigate = useCallback((href, key) => {
    setNavigatingTo(key)
    // For /build (new project): if already on the build page, router.push('/build') is a same-route
    // update and won't remount. Force a true navigation via window.location to guarantee fresh state.
    if (href === '/build' && pathname.startsWith('/build')) {
      window.location.href = '/build'
    } else {
      router.push(href)
    }
  }, [router, pathname])

  // Prefetch key routes for instant navigation
  useEffect(() => {
    router.prefetch('/dashboard')
    router.prefetch('/build')
  }, [router])

  async function handleSignOut() {
    setNavigatingTo('signout')
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const initials = displayName.slice(0, 1).toUpperCase()
  const isDashboard = pathname === '/dashboard'

  return (
    <>
      <style>{`
        @keyframes sb-spin { to { transform: rotate(360deg); } }
        @keyframes sb-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .sb-new-btn { transition: background 0.15s, box-shadow 0.15s, transform 0.12s !important; }
        .sb-new-btn:hover { background: #e8e8e8 !important; transform: translateY(-1px) !important; box-shadow: 0 4px 14px rgba(255,255,255,0.2) !important; }
        .sb-new-btn:active { transform: scale(0.97) !important; }
        .sb-nav-item { transition: all 0.15s !important; }
        .sb-nav-item:hover { background: rgba(255,255,255,0.07) !important; color: #fff !important; }
        .sb-proj-item { transition: all 0.12s !important; cursor: pointer; }
        .sb-proj-item:hover { background: rgba(255,255,255,0.06) !important; padding-left: 14px !important; }
        .sb-signout { transition: all 0.15s !important; }
        .sb-signout:hover { background: rgba(255,255,255,0.05) !important; color: rgba(255,255,255,0.7) !important; }
        .sb-proj-appear { animation: sb-fade-in 0.2s ease both; }
      `}</style>

      <div style={{
        width: '215px', height: '100vh', background: '#0d0d18',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.06)', position: 'relative'
      }}>

        {/* Top loading bar — shows when navigating */}
        {navigatingTo && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'rgba(139,92,246,0.2)', zIndex: 10, overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', background: '#7c3aed',
              animation: 'sb-progress 1.2s ease-in-out infinite',
              width: '40%'
            }} />
            <style>{`
              @keyframes sb-progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(350%); }
              }
            `}</style>
          </div>
        )}

        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <AtlasLogo size={20} textSize={15} />
        </div>

        {/* New Project */}
        <div style={{ padding: '14px 12px 8px' }}>
          <button
            className="sb-new-btn"
            onClick={() => navigate('/build', 'new')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              background: '#fff', color: '#000', borderRadius: '9px',
              padding: '10px 14px', fontSize: '13px', fontWeight: '700',
              width: '100%', border: 'none', cursor: 'pointer'
            }}
          >
            {navigatingTo === 'new' ? <Spinner size={14} /> : Icons.plus}
            {navigatingTo === 'new' ? 'Opening…' : 'New project'}
          </button>
        </div>

        {/* Dashboard nav */}
        <div style={{ padding: '4px 12px 4px' }}>
          <button
            className="sb-nav-item"
            onClick={() => navigate('/dashboard', 'dashboard')}
            onMouseEnter={() => router.prefetch('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              padding: '8px 10px', borderRadius: '8px', fontSize: '13px',
              color: isDashboard ? '#fff' : 'rgba(255,255,255,0.45)',
              background: isDashboard ? 'rgba(139,92,246,0.2)' : 'transparent',
              fontWeight: isDashboard ? '600' : '400',
              border: isDashboard ? '1px solid rgba(139,92,246,0.25)' : '1px solid transparent',
              width: '100%', cursor: 'pointer', textAlign: 'left'
            }}
          >
            {navigatingTo === 'dashboard' ? <Spinner size={15} /> : Icons.dashboard}
            {navigatingTo === 'dashboard' ? 'Loading…' : 'Dashboard'}
          </button>
        </div>

        {/* Recent projects */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px 0' }}>
          <div style={{
            fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.1em', marginBottom: '6px', paddingLeft: '10px', paddingTop: '6px'
          }}>
            RECENT PROJECTS
          </div>

          {projects.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', padding: '10px', textAlign: 'center' }}>
              No projects yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {projects.map((p, idx) => {
                const isActive = p.id === activeProjectId
                const isLoading = navigatingTo === p.id
                return (
                  <div
                    key={p.id}
                    className="sb-proj-item sb-proj-appear"
                    style={{
                      padding: '7px 10px', borderRadius: '8px',
                      background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
                      border: isActive ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
                      animationDelay: `${idx * 30}ms`
                    }}
                    onClick={() => navigate(`/build?id=${p.id}`, p.id)}
                    onMouseEnter={() => router.prefetch(`/build?id=${p.id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isLoading ? (
                        <span style={{ color: '#a78bfa' }}><Spinner size={11} /></span>
                      ) : (
                        <div style={{
                          width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                          background: statusColors[p.status] || '#6b7280',
                          transition: 'transform 0.15s',
                          ...(isActive ? { boxShadow: `0 0 5px ${statusColors[p.status] || '#6b7280'}` } : {})
                        }} />
                      )}
                      <span style={{
                        fontSize: '13px', fontWeight: isActive ? '600' : '400',
                        color: isActive ? '#c4b5fd' : isLoading ? '#a78bfa' : 'rgba(255,255,255,0.55)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        transition: 'color 0.15s'
                      }}>
                        {isLoading ? 'Loading…' : p.name}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* User bottom section */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '6px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'rgba(139,92,246,0.3)', border: '1px solid rgba(139,92,246,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', color: '#c4b5fd', flexShrink: 0
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button onClick={handleSignOut} className="sb-signout" style={{
            width: '100%', background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.35)', padding: '6px 8px', borderRadius: '6px',
            fontSize: '12px', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            {navigatingTo === 'signout' ? <Spinner size={13} /> : Icons.signout}
            {navigatingTo === 'signout' ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function Sidebar() {
  return (
    <Suspense fallback={
      <div style={{ width: '215px', background: '#0d0d18', height: '100vh', borderRight: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }} />
    }>
      <SidebarInner />
    </Suspense>
  )
}