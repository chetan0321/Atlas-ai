import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const generationRunId = searchParams.get('runId')

  if (!generationRunId) {
    return new Response('Missing runId', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Poll every 2 seconds, up to 5 minutes (150 polls)
      const MAX_POLLS = 150
      let polls = 0

      async function poll() {
        try {
          const supabase = await createClient()

          const { data: run, error } = await supabase
            .from('generation_runs')
            .select('*')
            .eq('id', generationRunId)
            .single()

          if (error || !run) {
            send({ type: 'error', message: 'Generation run not found' })
            controller.close()
            return
          }

          // Push current progress snapshot to client
          send({
            type:         'progress',
            status:       run.status,
            agentStatuses: run.agent_statuses,
            totalTokens:  run.total_tokens_used,
          })

          if (run.status === 'completed') {
            // Count files generated
            const { count } = await supabase
              .from('generated_files')
              .select('*', { count: 'exact', head: true })
              .eq('generation_id', generationRunId)

            send({ type: 'completed', fileCount: count ?? 0, generationRunId })
            controller.close()
            return
          }

          if (run.status === 'failed') {
            send({ type: 'error', message: run.error_message || 'Generation failed' })
            controller.close()
            return
          }

          polls++
          if (polls >= MAX_POLLS) {
            send({ type: 'error', message: 'Generation timed out after 5 minutes' })
            controller.close()
            return
          }

          setTimeout(poll, 2000)
        } catch (err) {
          send({ type: 'error', message: err.message })
          controller.close()
        }
      }

      // Kick off first poll immediately
      poll()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
