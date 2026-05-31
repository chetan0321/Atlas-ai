'use client'

import { useState } from 'react'
import BlueprintEditor from '@/components/blueprint/BlueprintEditor'

export default function Home() {
  const [description, setDescription] = useState('')
  const [research, setResearch] = useState('')
  const [blueprint, setBlueprint] = useState(null)
  const [loading, setLoading] = useState(false)
  const [blueprintLoading, setBlueprintLoading] = useState(false)
  const [approved, setApproved] = useState(false)

  async function handleResearch() {
    if (!description.trim()) return
    setLoading(true)
    setResearch('')
    setBlueprint(null)
    setApproved(false)

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      })
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setResearch(prev => prev + decoder.decode(value))
      }
    } catch (error) {
      setResearch('Error: Check your GROQ_API_KEY in .env.local')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateBlueprint() {
    setBlueprintLoading(true)
    try {
      const response = await fetch('/api/blueprint/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, research })
      })
      const data = await response.json()
      if (data.blueprint) {
        setBlueprint(data.blueprint)
      } else {
        alert('Blueprint generation failed. Try again.')
      }
    } catch (error) {
      alert('Something went wrong. Check the console.')
      console.error(error)
    } finally {
      setBlueprintLoading(false)
    }
  }

  function handleApprove(finalBlueprint) {
    setBlueprint(finalBlueprint)
    setApproved(true)
    console.log('Approved blueprint:', finalBlueprint)
    alert('Blueprint approved! 🎉 Next step: saving to database and generating code.')
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <h1 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '4px' }}>Atlas.AI 🌍</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Describe your app — Atlas researches it, plans it, and builds it.
      </p>

      {/* Step 1: Describe */}
      {!approved && (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#333', display: 'block', marginBottom: '6px' }}>
            Step 1 — Describe your app idea
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Example: A platform where freelancers find short-term projects posted by small businesses..."
            style={{
              width: '100%', minHeight: '100px', padding: '12px',
              fontSize: '14px', border: '1px solid #ddd', borderRadius: '8px',
              resize: 'vertical', marginBottom: '10px', fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={handleResearch}
            disabled={loading || !description.trim()}
            style={{
              background: loading ? '#999' : '#000', color: '#fff',
              border: 'none', padding: '11px 24px', fontSize: '14px',
              borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Researching...' : 'Research My Idea →'}
          </button>
        </div>
      )}

      {/* Step 2: Research output */}
      {research && !approved && (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#333', display: 'block', marginBottom: '6px' }}>
            Step 2 — Research Brief
          </label>
          <div style={{
            background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px',
            padding: '20px', whiteSpace: 'pre-wrap', fontSize: '13px',
            lineHeight: '1.7', color: '#333', marginBottom: '14px',
            maxHeight: '320px', overflowY: 'auto'
          }}>
            {research}
          </div>

          {!blueprint && (
            <button
              onClick={handleGenerateBlueprint}
              disabled={blueprintLoading || loading}
              style={{
                background: blueprintLoading ? '#999' : '#1a1a1a', color: '#fff',
                border: 'none', padding: '11px 24px', fontSize: '14px',
                borderRadius: '8px', cursor: blueprintLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {blueprintLoading ? 'Building Blueprint...' : 'Generate Blueprint →'}
            </button>
          )}
        </div>
      )}

      {/* Step 3: Blueprint Editor */}
      {blueprint && !approved && (
        <div>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#333', display: 'block', marginBottom: '10px' }}>
            Step 3 — Edit your Blueprint
          </label>
          <BlueprintEditor blueprint={blueprint} onApprove={handleApprove} />
        </div>
      )}

      {/* Approved state */}
      {approved && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>Blueprint Approved!</h2>
          <p style={{ color: '#555', marginBottom: '24px' }}>
            Your app plan is locked in. Next: Risk Radar analysis, then code generation.
          </p>
          <button
            onClick={() => { setApproved(false); setBlueprint(null); setResearch(''); setDescription('') }}
            style={{
              background: 'none', border: '1px solid #ccc', padding: '8px 20px',
              borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
            }}
          >
            Start a new project
          </button>
        </div>
      )}

    </main>
  )
}