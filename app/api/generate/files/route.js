import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const generationRunId = searchParams.get('runId')

    if (!generationRunId) {
      return NextResponse.json({ error: 'Missing runId' }, { status: 400 })
    }

    // Use admin client to bypass RLS on generated_files
    const admin = createAdminClient()
    const { data: files, error } = await admin
      .from('generated_files')
      .select('file_path, content, agent')
      .eq('generation_id', generationRunId)
      .order('file_path')

    if (error) throw error

    return NextResponse.json({ files: files || [] })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
