import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '4px' }}>
              Atlas.AI
            </h1>
            <p style={{ color: '#888', fontSize: '14px' }}>
              Welcome back, {user.email}
            </p>
          </div>
          <Link href="/build" style={{
            background: '#000', color: '#fff', padding: '10px 20px',
            borderRadius: '8px', fontSize: '14px', fontWeight: '500',
            textDecoration: 'none'
          }}>
            + New Project
          </Link>
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#333' }}>
          Your Projects ({projects?.length || 0})
        </h2>

        {(!projects || projects.length === 0) ? (
          <div style={{
            textAlign: 'center', padding: '60px', background: '#fff',
            border: '1px dashed #ddd', borderRadius: '12px'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
            <p style={{ color: '#888', fontSize: '15px', marginBottom: '16px' }}>
              No projects yet. Build your first app!
            </p>
            <Link href="/build" style={{
              background: '#000', color: '#fff', padding: '10px 24px',
              borderRadius: '8px', fontSize: '14px', textDecoration: 'none'
            }}>
              Start Building →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {projects.map(project => (
              <div key={project.id} style={{
                background: '#fff', border: '1px solid #eee', borderRadius: '12px',
                padding: '18px', cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600' }}>{project.name}</h3>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '8px',
                    background: project.status === 'draft' ? '#f3f4f6' : '#dcfce7',
                    color: project.status === 'draft' ? '#666' : '#16a34a'
                  }}>
                    {project.status}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '10px', lineHeight: '1.5' }}>
                  {project.description?.slice(0, 80)}...
                </p>
                <p style={{ fontSize: '11px', color: '#bbb' }}>
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}