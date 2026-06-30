'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Plus, LayoutGrid } from 'lucide-react'

function SidebarInner() {
  const [projects, setProjects] = useState([])
  const [user, setUser] = useState(null)
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeProjectId = searchParams.get('id')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('projects')
          .select('id, name, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
        setProjects(data || [])
      }
    }

    load()

    // Listen for all project changes in real time (insert, update, delete)
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, () => {
        load()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [supabase])

  async function handleSignOut() {
    if (!confirmingSignOut) {
      setConfirmingSignOut(true)
      setTimeout(() => setConfirmingSignOut(false), 3000)
      return
    }
    await supabase.auth.signOut()
    router.push('/login')
  }

  const statusColors = {
    draft: '#d1d5db',
    blueprint: '#93c5fd',
    generated: '#86efac',
    deployed: '#6ee7b7'
  }

  return (
    <div style={{
      width: '260px', height: '100vh', background: '#0a0a0a',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      borderRight: '1px solid #1a1a1a'
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>
          Atlas.AI
        </div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
          AI App Builder
        </div>
      </div>

      {/* New Project Button */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a' }}>
        <Link href="/build" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#fff', color: '#000', borderRadius: '8px',
          padding: '9px 14px', fontSize: '13px', fontWeight: '600',
          textDecoration: 'none', transition: 'opacity 0.15s'
        }}>
          <Plus size={15} strokeWidth={2.5} />
          New Project
        </Link>
      </div>

      {/* Navigation */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a' }}>
        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: '9px',
          padding: '8px 10px', borderRadius: '7px', fontSize: '13px',
          color: pathname === '/dashboard' ? '#fff' : '#888',
          background: pathname === '/dashboard' ? '#1a1a1a' : 'transparent',
          textDecoration: 'none', fontWeight: '500'
        }}>
          <LayoutGrid size={14} /> Dashboard
        </Link>
      </div>

      {/* Project History */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px' }}>
        <div style={{
          fontSize: '10px', fontWeight: '600', color: '#444',
          letterSpacing: '0.1em', marginBottom: '8px', paddingLeft: '10px'
        }}>
          RECENT PROJECTS
        </div>

        {projects.length === 0 ? (
          <div style={{
            fontSize: '12px', color: '#444', padding: '10px',
            lineHeight: '1.5', textAlign: 'center'
          }}>
            No projects yet.<br />Start one above ↑
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {projects.map(p => {
              const isActive = p.id === activeProjectId
              return (
                <Link key={p.id} href={`/build?id=${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '8px 10px', borderRadius: '7px',
                    cursor: 'pointer', transition: 'background 0.15s',
                    background: isActive ? '#1a1a1a' : 'transparent'
                  }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#141414' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                        background: statusColors[p.status] || '#444'
                      }} />
                      <span style={{
                        fontSize: '13px', color: isActive ? '#fff' : '#ccc', fontWeight: isActive ? '600' : '500',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {p.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#555', marginTop: '2px', paddingLeft: '13px' }}>
                      {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* User + Sign Out */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #1a1a1a' }}>
        {user && (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', color: '#666', paddingLeft: '4px', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            background: confirmingSignOut ? '#dc2626' : 'none',
            border: confirmingSignOut ? '1px solid #dc2626' : '1px solid #222',
            color: confirmingSignOut ? '#fff' : '#666',
            padding: '8px', borderRadius: '7px',
            fontSize: '12px', cursor: 'pointer', textAlign: 'left',
            paddingLeft: '12px', transition: 'all 0.15s'
          }}
        >
          {confirmingSignOut ? 'Click again to confirm' : 'Sign out'}
        </button>
      </div>

    </div>
  )
}

export default function Sidebar() {
  return (
    <Suspense fallback={<div style={{ width: '260px', background: '#0a0a0a', height: '100vh' }} />}>
      <SidebarInner />
    </Suspense>
  )
}