'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import BlueprintEditor from '@/components/blueprint/BlueprintEditor'
import IntentGraph from '@/components/blueprint/IntentGraph'
import RiskReport from '@/components/risk/RiskReport'

function BuildPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const existingId = searchParams.get('id')

  const [projectId, setProjectId] = useState(null)
  const [blueprintId, setBlueprintId] = useState(null)

  const [inputValue, setInputValue] = useState('')      // bound to textarea
  const [description, setDescription] = useState('')    // submitted idea text
  const [research, setResearch] = useState('')
  const [blueprint, setBlueprint] = useState(null)
  const [riskReport, setRiskReport] = useState(null)

  const [stage, setStage] = useState('idle') // idle | research | blueprint | risk | saved
  const [blueprintView, setBlueprintView] = useState('text')

  const [loading, setLoading] = useState(false)
  const [blueprintLoading, setBlueprintLoading] = useState(false)
  const [riskLoading, setRiskLoading] = useState(false)
  const [riskError, setRiskError] = useState(false)
  const [resuming, setResuming] = useState(!!existingId)

  // ── Resume an existing project ──
  useEffect(() => {
    if (!existingId) return
    async function load() {
      const res = await fetch(`/api/project/${existingId}`)
      const data = await res.json()
      if (data.project) {
        setProjectId(data.project.id)
        setDescription(data.project.description || '')
        setResearch(data.project.research_brief || '')
        if (data.blueprint) {
          setBlueprintId(data.blueprint.id)
          setBlueprint(data.blueprint.json)
        }
        if (data.riskReport) {
          setRiskReport(data.riskReport.report)
          setStage('risk')
        } else if (data.blueprint) {
          setStage('blueprint')
        } else if (data.project.research_brief) {
          setStage('research')
        }
      }
      setResuming(false)
    }
    load()
  }, [existingId])

  async function handleResearch() {
    if (!inputValue.trim() || loading) return
    const submitted = inputValue
    setDescription(submitted)
    setInputValue('')   // ✅ clears the box immediately (Fix 1)
    setResearch('')
    setBlueprint(null)
    setRiskReport(null)
    setLoading(true)
    setStage('research')

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: submitted })
      })
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value)
        setResearch(fullText)
      }

      // Save research stage
      const saveRes = await fetch('/api/project/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'research', projectId, description: submitted, research: fullText })
      })
      const saveData = await saveRes.json()
      if (saveData.projectId) {
        setProjectId(saveData.projectId)
        router.replace(`/build?id=${saveData.projectId}`)
      }

    } catch {
      setResearch('Error connecting to AI. Check your GROQ_API_KEY.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateBlueprint() {
    setBlueprintLoading(true)
    try {
      const res = await fetch('/api/blueprint/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, research })
      })
      const data = await res.json()
      if (data.blueprint) {
        setBlueprint(data.blueprint)
        setStage('blueprint')

        const saveRes = await fetch('/api/project/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'blueprint', projectId, blueprint: data.blueprint })
        })
        const saveData = await saveRes.json()
        if (saveData.blueprintId) setBlueprintId(saveData.blueprintId)
      }
    } catch {
      alert('Blueprint generation failed. Try again.')
    } finally {
      setBlueprintLoading(false)
    }
  }

  async function handleApprove(finalBlueprint) {
    setBlueprint(finalBlueprint)

    const saveRes = await fetch('/api/project/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'blueprint', projectId, blueprint: finalBlueprint })
    })
    const saveData = await saveRes.json()
    const currentBlueprintId = saveData.blueprintId || blueprintId
    setBlueprintId(currentBlueprintId)

    setRiskLoading(true)
    setRiskError(false)
    setStage('risk')
    try {
      const res = await fetch('/api/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprint: finalBlueprint })
      })
      if (!res.ok) throw new Error('Risk analysis failed')
      const data = await res.json()
      if (data.riskReport) {
        setRiskReport(data.riskReport)
        await fetch('/api/project/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'risk', projectId, blueprintId: currentBlueprintId, riskReport: data.riskReport
          })
        })
      } else {
        throw new Error('No risk report returned')
      }
    } catch (err) {
      console.error(err)
      setRiskError(true)
    } finally {
      setRiskLoading(false)
    }
  }

  async function handleSaveToDashboard() {
    await fetch('/api/project/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'finalize', projectId, blueprintId })
    })
    setStage('saved')
  }

  function handleRiskBack() {
    setStage('blueprint')
  }

  function reset() {
    setProjectId(null)
    setBlueprintId(null)
    setInputValue('')
    setDescription('')
    setResearch('')
    setBlueprint(null)
    setRiskReport(null)
    setStage('idle')
    router.push('/build')
  }

  // ── Step indicator config ──
  const STEPS = [
    { key: 'research', label: 'Research' },
    { key: 'blueprint', label: 'Blueprint' },
    { key: 'generate', label: 'Generate' },
    { key: 'deploy', label: 'Deploy' }
  ]
  const stageIndex = { idle: -1, research: 0, blueprint: 1, risk: 2, saved: 2 }[stage]

  function goToStep(key) {
    if (key === 'research' && research) setStage('research')
    if (key === 'blueprint' && blueprint) setStage('blueprint')
    // generate/deploy not interactive yet
  }

  if (resuming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888' }}>
        Loading project...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff', position: 'relative' }}>

      {/* Top bar */}
      <div style={{
        padding: '16px 28px', borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, flexWrap: 'wrap'
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0a0a0a', margin: 0 }}>
          {blueprint?.projectName || 'New Project'}
        </h1>
        {STEPS.map((s, i) => {
          const done = stageIndex > i
          const active = stageIndex === i
          const clickable = (s.key === 'research' && research) || (s.key === 'blueprint' && blueprint)
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {i > 0 && <div style={{ width: '20px', height: '1px', background: '#e5e5e5' }} />}
              <div
                onClick={() => clickable && goToStep(s.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  opacity: stageIndex >= i ? 1 : 0.35,
                  cursor: clickable ? 'pointer' : 'default'
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: done ? '#16a34a' : active ? '#0a0a0a' : '#e5e5e5',
                  color: stageIndex >= i ? '#fff' : '#999',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: '700'
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: '12px', fontWeight: '500',
                  color: stageIndex >= i ? '#0a0a0a' : '#aaa',
                  textDecoration: clickable ? 'underline' : 'none',
                  textUnderlineOffset: '3px'
                }}>
                  {s.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main scrollable content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px 220px' }}>

        {stage === 'idle' && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0a0a0a', marginBottom: '10px' }}>
              What are you building today?
            </h2>
            <p style={{ fontSize: '16px', color: '#888', maxWidth: '440px', lineHeight: '1.6' }}>
              Describe your app idea below. Atlas will research it, create a plan, and build it for you.
            </p>
          </div>
        )}

        {(stage === 'research' || (research && stage !== 'idle')) && (
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#0a0a0a', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '14px'
                }}>🔍</div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a' }}>Research Brief</span>
                {loading && <span style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>researching...</span>}
              </div>

              <div style={{
                background: '#f5f5f5', borderRadius: '12px 12px 4px 12px',
                padding: '12px 16px', marginBottom: '16px',
                fontSize: '14px', color: '#333', maxWidth: '80%', marginLeft: 'auto'
              }}>
                {description}
              </div>

              <div style={{
                background: '#fafafa', border: '1px solid #f0f0f0',
                borderRadius: '4px 12px 12px 12px', padding: '20px 24px',
                fontSize: '14px', lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap'
              }}>
                {research}
              </div>
            </div>

            {stage === 'research' && !loading && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '20px' }}>
                <button
                  onClick={handleGenerateBlueprint}
                  disabled={blueprintLoading}
                  style={{
                    background: blueprintLoading ? '#888' : '#0a0a0a',
                    color: '#fff', border: 'none', padding: '12px 28px',
                    fontSize: '14px', fontWeight: '600', borderRadius: '10px',
                    cursor: blueprintLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {blueprintLoading ? 'Building Blueprint...' : 'Generate Blueprint →'}
                </button>
              </div>
            )}
          </div>
        )}

        {(stage === 'blueprint') && blueprint && (
          <div style={{ maxWidth: '900px', margin: '24px auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#0a0a0a', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '14px'
              }}>🗺️</div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a' }}>Your App Blueprint</span>

              <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '3px', marginLeft: 'auto' }}>
                <button onClick={() => setBlueprintView('text')} style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                  border: 'none', cursor: 'pointer',
                  background: blueprintView === 'text' ? '#fff' : 'transparent',
                  color: blueprintView === 'text' ? '#0a0a0a' : '#888',
                  boxShadow: blueprintView === 'text' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                }}>📝 Text View</button>
                <button onClick={() => setBlueprintView('graph')} style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                  border: 'none', cursor: 'pointer',
                  background: blueprintView === 'graph' ? '#fff' : 'transparent',
                  color: blueprintView === 'graph' ? '#0a0a0a' : '#888',
                  boxShadow: blueprintView === 'graph' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                }}>🔗 Graph View</button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setStage('research')}
                style={{
                  background: '#fff', color: '#666', border: '1px solid #e5e5e5',
                  padding: '8px 16px', borderRadius: '8px', fontSize: '12px',
                  fontWeight: '500', cursor: 'pointer'
                }}
              >
                ← Back to Research
              </button>
            </div>

            {blueprintView === 'text' ? (
              <BlueprintEditor blueprint={blueprint} onApprove={handleApprove} />
            ) : (
              <IntentGraph
                blueprint={blueprint}
                onConfirm={() => {
                  setBlueprintView('text')
                  alert('Graph saved! Switch back to Text View to approve and continue.')
                }}
              />
            )}
          </div>
        )}

        {stage === 'risk' && (
          <div style={{ maxWidth: '900px', margin: '24px auto 0' }}>
            {riskLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔎</div>
                <p style={{ color: '#888', fontSize: '14px' }}>Running Risk Radar analysis...</p>
              </div>
            ) : riskError ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
                <p style={{ color: '#dc2626', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Risk analysis failed
                </p>
                <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
                  Something went wrong reaching the AI service. Please try again.
                </p>
                <button
                  onClick={() => handleApprove(blueprint)}
                  style={{
                    background: '#0a0a0a', color: '#fff', border: 'none',
                    padding: '10px 24px', borderRadius: '9px',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Retry Analysis
                </button>
              </div>
            ) : riskReport ? (
              <RiskReport report={riskReport} onContinue={handleSaveToDashboard} onBack={handleRiskBack} />
            ) : null}
          </div>
        )}

        {stage === 'saved' && (
          <div style={{
            maxWidth: '500px', margin: '40px auto', textAlign: 'center',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '16px', padding: '48px 32px'
          }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#0a0a0a' }}>
              Saved to Dashboard!
            </h2>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' }}>
              <strong>{blueprint?.projectName}</strong> is saved. You can reopen it anytime from the sidebar or dashboard — exactly where you left off.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/dashboard" style={{
                background: '#0a0a0a', color: '#fff', border: 'none',
                padding: '10px 24px', borderRadius: '8px',
                fontSize: '14px', fontWeight: '600', textDecoration: 'none'
              }}>
                View all projects →
              </a>
              <button onClick={reset} style={{
                background: '#fff', color: '#333', border: '1px solid #e5e5e5',
                padding: '10px 24px', borderRadius: '8px',
                fontSize: '14px', fontWeight: '500', cursor: 'pointer'
              }}>
                Build another app
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom input bar — only on idle/research stage */}
      {(stage === 'idle' || stage === 'research') && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '20px 28px 28px',
          background: 'linear-gradient(to top, #fff 75%, transparent)',
        }}>
          <div style={{
            maxWidth: '780px', margin: '0 auto',
            background: '#fff', border: '1.5px solid #e5e5e5',
            borderRadius: '14px', overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}>
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleResearch()
                }
              }}
              placeholder="Describe your app idea... (e.g. A marketplace where farmers sell directly to consumers)"
              style={{
                width: '100%', minHeight: '80px', maxHeight: '180px',
                padding: '16px 18px 8px', fontSize: '15px',
                border: 'none', outline: 'none', resize: 'none',
                fontFamily: 'inherit', color: '#0a0a0a', background: 'transparent',
                boxSizing: 'border-box', lineHeight: '1.6'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 12px' }}>
              <span style={{ fontSize: '12px', color: '#bbb' }}>
                Press Enter to research · Shift+Enter for new line
              </span>
              <button
                onClick={handleResearch}
                disabled={loading || !inputValue.trim()}
                style={{
                  background: loading || !inputValue.trim() ? '#e5e5e5' : '#0a0a0a',
                  color: loading || !inputValue.trim() ? '#999' : '#fff',
                  border: 'none', padding: '9px 20px', fontSize: '13px',
                  fontWeight: '600', borderRadius: '9px',
                  cursor: loading || !inputValue.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Researching...' : 'Research →'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function BuildPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: '#888' }}>Loading...</div>}>
      <BuildPageInner />
    </Suspense>
  )
}