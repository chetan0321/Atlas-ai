import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const displayName = user.user_metadata?.full_name || user.email.split('@')[0]
  const deployed = projects?.filter(p => p.status === 'deployed' || p.status === 'saved').length || 0
  const inProgress = projects?.filter(p => p.status !== 'deployed' && p.status !== 'saved').length || 0

  return (
    <DashboardClient
      projects={projects || []}
      displayName={displayName}
      userEmail={user.email}
      deployed={deployed}
      inProgress={inProgress}
    />
  )
}