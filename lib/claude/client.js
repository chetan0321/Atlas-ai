import Groq from 'groq-sdk'

// Load all available Groq API keys from env
const keys = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean)

let currentKeyIndex = 0

/**
 * Wrapper for Groq chat completions that automatically rotates to the next API key 
 * if a rate limit (429) error is encountered.
 */
export async function createChatCompletion(options) {
  if (keys.length === 0) {
    throw new Error('No GROQ_API_KEY found in environment variables.')
  }

  let attempts = 0
  
  while (attempts < keys.length) {
    try {
      const groq = new Groq({ apiKey: keys[currentKeyIndex] })
      const response = await groq.chat.completions.create(options)
      return response
    } catch (error) {
      // If it's a rate limit error (429) and we have more keys to try
      if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
        console.warn(`[Groq] Rate limit hit on key index ${currentKeyIndex}. Switching keys...`)
        // Move to the next key
        currentKeyIndex = (currentKeyIndex + 1) % keys.length
        attempts++
      } else {
        // If it's some other error (like a bad request or 500), throw it immediately
        throw error
      }
    }
  }

  throw new Error('All Groq API keys have exhausted their rate limits. Please wait and try again later.')
}