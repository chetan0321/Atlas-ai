import { Queue } from 'bullmq'
import Redis from 'ioredis'

// ─── Singleton Redis connection ───────────────────────────────────────────────
let connection

export function getRedisConnection() {
  if (!connection) {
    connection = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
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
