import Groq from 'groq-sdk'

// ── Groq client (Llama 3.3 70B — fast coding agents) ─────────────────────────
const groqKeys = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean)

let groqKeyIndex = 0

/**
 * Groq chat completion with automatic key rotation on 429.
 * Use for: Frontend, Backend, Schema, Test, Coordinator agents.
 */
export async function createChatCompletion(options) {
  if (groqKeys.length === 0) {
    throw new Error('No GROQ_API_KEY found in environment variables.')
  }

  let attempts = 0
  while (attempts < groqKeys.length) {
    try {
      const groq = new Groq({ apiKey: groqKeys[groqKeyIndex] })
      return await groq.chat.completions.create(options)
    } catch (error) {
      if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
        console.warn(`[Groq] Rate limit on key ${groqKeyIndex}. Rotating...`)
        groqKeyIndex = (groqKeyIndex + 1) % groqKeys.length
        attempts++
      } else {
        throw error
      }
    }
  }
  throw new Error('All Groq API keys have hit rate limits. Please wait and try again.')
}

// ── OpenRouter client (Qwen 3.6 Plus — reasoning agents) ─────────────────────
const openRouterKeys = [
  process.env.OPENROUTER_API_KEY,
  process.env.OPENROUTER_API_KEY_2,
].filter(Boolean)

let orKeyIndex = 0

/**
 * OpenRouter chat completion with automatic key rotation on 429.
 * Use for: Research, Blueprint, Risk Analysis, Security agents.
 *
 * Model priority order (first available wins):
 *   1. qwen/qwen3-235b-a22b       (paid — best reasoning, 1M context)
 *   2. qwen/qwen3-30b-a3b         (paid — faster)
 *   3. meta-llama/llama-3.3-70b-instruct:free (free — reliable fallback)
 *
 * NOTE: The :free variants of Qwen 3 are no longer available on OpenRouter.
 *       Use the paid slugs (no :free suffix). Falls back to Groq if all fail.
 */
const OR_MODELS = [
  'qwen/qwen3-235b-a22b',
  'qwen/qwen3-30b-a3b',
  'meta-llama/llama-3.3-70b-instruct:free',
]

export async function createOpenRouterCompletion(options) {
  if (openRouterKeys.length === 0) {
    // No OpenRouter key — fall through to Groq below
    return _groqFallback(options)
  }

  // Try each model in priority order
  for (const model of OR_MODELS) {
    let attempts = 0
    while (attempts < openRouterKeys.length) {
      const apiKey = openRouterKeys[orKeyIndex]
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://atlas-ai.app',
            'X-Title': 'Atlas.AI',
          },
          body: JSON.stringify({ model, ...options }),
        })

        if (res.status === 429) {
          console.warn(`[OpenRouter] Rate limit on key ${orKeyIndex} (model: ${model}). Rotating...`)
          orKeyIndex = (orKeyIndex + 1) % openRouterKeys.length
          attempts++
          continue
        }

        if (res.status === 404 || res.status === 400) {
          // Model doesn't exist or bad request — try next model
          const errBody = await res.json().catch(() => ({}))
          console.warn(`[OpenRouter] Model ${model} unavailable: ${errBody?.error?.message}. Trying next model...`)
          break // break inner while, move to next model
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          console.error(`[OpenRouter] Error ${res.status}:`, err?.error?.message)
          break // try next model
        }

        return await res.json()
      } catch (error) {
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          orKeyIndex = (orKeyIndex + 1) % openRouterKeys.length
          attempts++
        } else {
          console.warn(`[OpenRouter] Network error with model ${model}:`, error.message)
          break // try next model
        }
      }
    }
  }

  // All OpenRouter models exhausted — fall back to Groq
  console.warn('[OpenRouter] All models failed. Falling back to Groq...')
  return _groqFallback(options)
}

/** Groq fallback when OpenRouter is unavailable */
async function _groqFallback(options) {
  const { model: _ignored, ...rest } = options // strip OR model
  return createChatCompletion({ model: 'llama-3.3-70b-versatile', ...rest })
}

/**
 * Helper to extract message content from OpenRouter response.
 * Automatically strips Qwen's <think>...</think> reasoning blocks
 * so callers always get clean text/JSON.
 */
export function getContent(response) {
  const raw = response?.choices?.[0]?.message?.content || ''
  // Strip thinking blocks (Qwen 3.6 and similar models output these)
  return raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}