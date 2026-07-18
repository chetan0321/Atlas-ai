import { Queue } from 'bullmq'
import Redis from 'ioredis'

// ─── Singleton Redis connection ───────────────────────────────────────────────
let connection

export function getRedisConnection() {
  if (!connection) {
    connection = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck:     false,
      // Reconnect on ECONNRESET / ETIMEDOUT (common on cloud Redis with idle timeouts)
      retryStrategy(times) {
        const delay = Math.min(times * 500, 5000) // cap at 5s
        console.warn(`[Redis] Reconnecting (attempt ${times})... next in ${delay}ms`)
        return delay
      },
      reconnectOnError(err) {
        // Reconnect on read errors and connection resets
        return err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT'
      },
    })

    connection.on('error', (err) => {
      // Log Redis errors but don't crash the worker process
      console.error('[Redis] Connection error:', err.message, `(code: ${err.code})`)
    })

    connection.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...')
    })

    connection.on('ready', () => {
      console.log('[Redis] Connection ready ✅')
    })
  }
  return connection
}

// ─── Generation queue ─────────────────────────────────────────────────────────
export const generationQueue = new Queue('generation', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
  },
})
