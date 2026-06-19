'use client'

import { useState } from 'react'
import BlueprintEditor from '@/components/blueprint/BlueprintEditor'
import RiskReport from '@/components/risk/RiskReport'

export default function BuildPage() {
  const [description, setDescription] = useState('')
  const [research, setResearch] = useState('')
  const [blueprint, setBlueprint] = useState(null)
  const [loading, setLoading] = useState(false)
  const [blueprintLoading, setBlueprintLoading] = useState(false)
  const [approved, setApproved] = useState(false)
  const [savedProjectId, setSavedProjectId] = useState(null)
  const [step, setStep] = useState(0)
  const [riskReport, setRiskReport] = useState(null)
  const [riskLoading, setRiskLoading] = useState(false)
  const [showRisk, setShowRisk] = useState(false)
  // 0 = idle, 1 = researching/done, 2 = blueprint

  async function handleResearch() {
    if (!description.trim() || loading) return
    setLoading(true)
    setResearch('')
    setBlueprint(null)
    setApproved(false)
    setStep(1)

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
        setStep(2)
      }
    } catch {
      alert('Blueprint generation failed. Try again.')
    } finally {
      setBlueprintLoading(false)
    }
  }

  async function handleApprove(finalBlueprint) {
    setBlueprint(finalBlueprint)
    setRiskLoading(true)
    setShowRisk(true)

    try {
      const res = await fetch('/api/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprint: finalBlueprint })
      })
      const data = await res.json()
      if (data.riskReport) {
        setRiskReport(data.riskReport)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setRiskLoading(false)
    }
  }

  async function handleRiskContinue() {
    try {
      const res = await fetch('/api/project/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, blueprint })
      })
      const data = await res.json()
      if (data.success) {
        setSavedProjectId(data.projectId)
        setApproved(true)
        setShowRisk(false)
      } else {
        alert('Failed to save project: ' + data.error)
      }
    } catch (error) {
      alert('Something went wrong saving the project.')
    }
  }

  function handleRiskBack() {
    setShowRisk(false)
    setRiskReport(null)
  }

  function reset() {
    setDescription('')
    setResearch('')
    setBlueprint(null)
    setApproved(false)
    setStep(0)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: '#fff', position: 'relative'
    }}>

      {/* Top bar */}
      <div style={{
        padding: '16px 28px', borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0a0a0a', margin: 0 }}>
          New Project
        </h1>
        {/* Step indicators */}
        {[
          { num: 1, label: 'Research' },
          { num: 2, label: 'Blueprint' },
          { num: 3, label: 'Generate' },
          { num: 4, label: 'Deploy' }
        ].map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {i > 0 && <div style={{ width: '20px', height: '1px', background: '#e5e5e5' }} />}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              opacity: step >= i ? 1 : 0.35
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: step > i ? '#16a34a' : step === i ? '#0a0a0a' : '#e5e5e5',
                color: step >= i ? '#fff' : '#999',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: '700'
              }}>
                {step > i ? '✓' : s.num}
              </div>
              <span style={{ fontSize: '12px', fontWeight: '500', color: step >= i ? '#0a0a0a' : '#aaa' }}>
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main scrollable content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px 160px' }}>

        {/* Idle state - centered welcome */}
        {step === 0 && (
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
              Describe your app idea below. Atlas will research it,
              create a plan, and build it for you.
            </p>
          </div>
        )}

        {/* Research output */}
        {step >= 1 && research && (
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#0a0a0a', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '14px'
                }}>🔍</div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a' }}>
                  Research Brief
                </span>
                {loading && (
                  <span style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                    researching...
                  </span>
                )}
              </div>

              {/* User message bubble */}
              <div style={{
                background: '#f5f5f5', borderRadius: '12px 12px 4px 12px',
                padding: '12px 16px', marginBottom: '16px',
                fontSize: '14px', color: '#333', maxWidth: '80%', marginLeft: 'auto'
              }}>
                {description}
              </div>

              {/* Research result */}
              <div style={{
                background: '#fafafa', border: '1px solid #f0f0f0',
                borderRadius: '4px 12px 12px 12px', padding: '20px 24px',
                fontSize: '14px', lineHeight: '1.8', color: '#333',
                whiteSpace: 'pre-wrap'
              }}>
                {research}
              </div>
            </div>

            {/* Generate Blueprint button */}
            {!loading && !blueprint && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <button
                  onClick={handleGenerateBlueprint}
                  disabled={blueprintLoading}
                  style={{
                    background: blueprintLoading ? '#888' : '#0a0a0a',
                    color: '#fff', border: 'none', padding: '12px 28px',
                    fontSize: '14px', fontWeight: '600', borderRadius: '10px',
                    cursor: blueprintLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  {blueprintLoading ? (
                    <>
                      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                      Building Blueprint...
                    </>
                  ) : (
                    'Generate Blueprint →'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Risk Radar */}
        {showRisk && (
          <div style={{ maxWidth: '900px', margin: '24px auto 0' }}>
            {riskLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔎</div>
                <p style={{ color: '#888', fontSize: '14px' }}>Running Risk Radar analysis...</p>
              </div>
            ) : riskReport ? (
              <RiskReport
                report={riskReport}
                onContinue={handleRiskContinue}
                onBack={handleRiskBack}
              />
            ) : null}
          </div>
        )}

        {/* Blueprint editor */}
        {step === 2 && blueprint && !approved && !showRisk && (
          <div style={{ maxWidth: '900px', margin: '24px auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#0a0a0a', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '14px'
              }}>🗺️</div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#0a0a0a' }}>
                Your App Blueprint
              </span>
              <span style={{ fontSize: '12px', color: '#888' }}>
                Edit anything before approving
              </span>
            </div>
            <BlueprintEditor blueprint={blueprint} onApprove={handleApprove} />
          </div>
        )}

        {/* Approved */}
        {approved && (
          <div style={{
            maxWidth: '500px', margin: '40px auto', textAlign: 'center',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '16px', padding: '48px 32px'
          }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#0a0a0a' }}>
              Project Saved!
            </h2>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' }}>
              <strong>{blueprint?.projectName}</strong> has been saved to your projects.
              Check the sidebar — it appears there now.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/dashboard"
                style={{
                  background: '#0a0a0a', color: '#fff', border: 'none',
                  padding: '10px 24px', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                View all projects →
              </a>
              <button
                onClick={reset}
                style={{
                  background: '#fff', color: '#333',
                  border: '1px solid #e5e5e5',
                  padding: '10px 24px', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '500', cursor: 'pointer'
                }}
              >
                Build another app
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom input bar */}
      {!approved && step < 2 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '16px 28px 24px',
          background: 'linear-gradient(to top, #fff 70%, transparent)',
        }}>
          <div style={{
            maxWidth: '780px', margin: '0 auto',
            background: '#fff', border: '1.5px solid #e5e5e5',
            borderRadius: '14px', overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
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
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '8px 14px 12px'
            }}>
              <span style={{ fontSize: '12px', color: '#bbb' }}>
                Press Enter to research · Shift+Enter for new line
              </span>
              <button
                onClick={handleResearch}
                disabled={loading || !description.trim()}
                style={{
                  background: loading || !description.trim() ? '#e5e5e5' : '#0a0a0a',
                  color: loading || !description.trim() ? '#999' : '#fff',
                  border: 'none', padding: '9px 20px', fontSize: '13px',
                  fontWeight: '600', borderRadius: '9px',
                  cursor: loading || !description.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s'
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