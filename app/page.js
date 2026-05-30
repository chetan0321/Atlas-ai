'use client'

import { useState } from 'react'

export default function Home() {
  const [description, setDescription] = useState('')
  const [research, setResearch] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleResearch() {
    if (!description.trim()) return

    setLoading(true)
    setResearch('')

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      })

      if (!response.ok) throw new Error('Research failed')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        setResearch(prev => prev + text)
      }

    } catch (error) {
      setResearch('Something went wrong. Check your API key in .env.local')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>

      <h1 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '8px' }}>
        Atlas.AI
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Describe your app idea and Atlas will research it for you.
      </p>

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Example: A platform where freelancers can find short-term projects posted by small businesses..."
        style={{
          width: '100%',
          minHeight: '120px',
          padding: '12px',
          fontSize: '15px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          resize: 'vertical',
          marginBottom: '12px',
          fontFamily: 'inherit'
        }}
      />

      <button
        onClick={handleResearch}
        disabled={loading || !description.trim()}
        style={{
          background: loading ? '#999' : '#000',
          color: '#fff',
          border: 'none',
          padding: '12px 28px',
          fontSize: '15px',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '32px'
        }}
      >
        {loading ? 'Researching...' : 'Research My Idea →'}
      </button>

      {research && (
        <div style={{
          background: '#f9f9f9',
          border: '1px solid #eee',
          borderRadius: '8px',
          padding: '24px',
          whiteSpace: 'pre-wrap',
          fontSize: '14px',
          lineHeight: '1.7',
          color: '#333'
        }}>
          {research}
        </div>
      )}

    </main>
  )
}