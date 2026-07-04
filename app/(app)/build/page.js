'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import BlueprintEditor from '@/components/blueprint/BlueprintEditor'
import IntentGraph from '@/components/blueprint/IntentGraph'
import RiskReport from '@/components/risk/RiskReport'
import { Globe, Search, Map } from 'lucide-react'

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
  const [researchError, setResearchError] = useState(false)
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
          setStage('risk')           // ✅ dedicated risk stage
        } else if (data.blueprint) {
          setStage('blueprint')
          setBlueprintView('text')
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
    setResearchError(false)
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
      setResearchError(true)
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

    // Save the blueprint first
    const saveRes = await fetch('/api/project/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'blueprint', projectId, blueprint: finalBlueprint })
    })
    const saveData = await saveRes.json()
    const currentBlueprintId = saveData.blueprintId || blueprintId
    setBlueprintId(currentBlueprintId)

    // Move to the dedicated Risk Analysis stage
    setStage('risk')

    // If risk already exists, just show it — don't re-run
    if (riskReport) return

    setRiskLoading(true)
    setRiskError(false)
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
        // Auto-save risk report immediately
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
    { key: 'research',  label: 'Research' },
    { key: 'blueprint', label: 'Blueprint' },
    { key: 'risk',      label: 'Risk Analysis' },
    { key: 'saved',     label: 'Done' }
  ]
  const stageIndex = { idle: -1, research: 0, blueprint: 1, risk: 2, saved: 3 }[stage] ?? -1

  function goToStep(key) {
    if (key === 'research'  && research)   setStage('research')
    if (key === 'blueprint' && blueprint)  { setStage('blueprint'); setBlueprintView('text') }
    if (key === 'risk'      && riskReport) setStage('risk')
  }


  if (resuming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888' }}>
        Loading project...
      </div>
    )
  }

  return (
    <>
    <style>{`
      @keyframes rotate3d { 0% { transform: rotateX(0deg) rotateY(0deg); } 100% { transform: rotateX(360deg) rotateY(360deg); } }
      @keyframes build-spin    { to { transform: rotate(360deg); } }
      @keyframes build-fadein  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes build-slidein { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
      @keyframes build-pulse   { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
      .build-tmpl-card { transition: all 0.18s !important; }
      .build-tmpl-card:hover { background: rgba(139,92,246,0.12) !important; border-color: rgba(139,92,246,0.35) !important; transform: translateY(-2px) !important; }
      .build-step-pill { transition: all 0.15s !important; }
      .build-step-pill:hover { opacity: 1 !important; }
      .build-section-enter { animation: build-fadein 0.3s cubic-bezier(0.4,0,0.2,1) both; }
      .build-slide-enter  { animation: build-slidein 0.3s cubic-bezier(0.4,0,0.2,1) both; }
      .build-skeleton { animation: build-pulse 1.4s ease-in-out infinite; }
    `}</style>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0d0d18', position: 'relative' }}>

      {/* Top step bar */}
      <div style={{
        padding: '0 32px', height: '56px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', flexShrink: 0,
        background: '#0d0d18'
      }}>
        {STEPS.map((s, i) => {
          const done = stageIndex > i
          const active = stageIndex === i || (stageIndex === -1 && i === 0)
          const clickable = (
            (s.key === 'research'  && research) ||
            (s.key === 'blueprint' && blueprint) ||
            (s.key === 'risk'      && riskReport)
          )
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div style={{
                  width: '60px', height: '1px',
                  background: done ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)'
                }} />
              )}
              <div
                className="build-step-pill"
                onClick={() => clickable && goToStep(s.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '5px 14px 5px 6px',
                  borderRadius: '20px',
                  background: active ? 'rgba(139,92,246,0.2)' : 'transparent',
                  border: active ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent',
                  cursor: clickable ? 'pointer' : 'default',
                  opacity: stageIndex >= i || active ? 1 : 0.4,
                  transition: 'all 0.15s'
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: done ? '#7c3aed' : active ? '#7c3aed' : 'rgba(255,255,255,0.1)',
                  color: (done || active) ? '#fff' : 'rgba(255,255,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700', flexShrink: 0
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: '13px', fontWeight: active ? '600' : '400',
                  color: active ? '#fff' : done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)'
                }}>
                  {s.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main scrollable content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px 220px', background: '#08080f' }}>

        {stage === 'idle' && (
          <div className="build-section-enter" style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', textAlign: 'center', padding: '20px 20px 0'
          }}>
            {/* Animated polyhedron */}
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ animation: 'rotate3d 12s linear infinite', filter: 'drop-shadow(0 0 18px rgba(139,92,246,0.4))' }}>
                <g stroke="rgba(139,92,246,0.7)" strokeWidth="0.8" fill="none">
                  {/* Outer vertices: top, bottom, left, right, front, back */}
                  {[
                    [70,20],[120,50],[120,90],[70,120],[20,90],[20,50],
                    [70,40],[100,55],[100,85],[70,100],[40,85],[40,55]
                  ].reduce((acc, [x1,y1], i, pts) => {
                    const next = pts[(i + 1) % 6]
                    const inner = pts[i + 6]
                    if (!inner) return acc
                    const nextInner = pts[((i) % 6) + 6]
                    return [...acc,
                      { x1, y1, x2: next?.[0], y2: next?.[1], op: i < 6 ? 1 : 0.5 },
                      { x1, y1, x2: inner[0], y2: inner[1], op: 0.6 },
                    ]
                  }, []).map((l, i) =>
                    l.x2 && <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeOpacity={l.op} />
                  )}
                  {/* Inner hexagon */}
                  {[[70,40],[100,55],[100,85],[70,100],[40,85],[40,55]].map(([x,y],i,a) => {
                    const n = a[(i+1)%6]
                    return <line key={`i${i}`} x1={x} y1={y} x2={n[0]} y2={n[1]} strokeOpacity="0.9" />
                  })}
                  {/* Center cross-lines */}
                  {[[70,40],[100,85],[40,85],[70,40],[40,55],[100,85]].reduce((a,p,i,arr)=> i%2===0?[...a,{x1:p[0],y1:p[1],x2:arr[i+1][0],y2:arr[i+1][1]}]:a,[]).map((l,i)=>
                    <line key={`c${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeOpacity="0.3" />
                  )}
                  {/* Dots at vertices */}
                  {[[70,20],[120,50],[120,90],[70,120],[20,90],[20,50],[70,40],[100,55],[100,85],[70,100],[40,85],[40,55]].map(([cx,cy],i)=>
                    <circle key={`d${i}`} cx={cx} cy={cy} r={i<6?2.5:1.8} fill="rgba(139,92,246,0.8)" stroke="none" />
                  )}
                </g>
              </svg>
            </div>

            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700', color: '#fff',
              marginBottom: '12px', letterSpacing: '-0.5px', lineHeight: '1.15'
            }}>
              What are you building today?
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', maxWidth: '440px', lineHeight: '1.65', marginBottom: '36px' }}>
              Describe your app idea and Atlas will research, plan, and build it for you.
            </p>

            {/* Template cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '10px', maxWidth: '860px', width: '100%' }}>
              {[
                { icon: '📊', name: 'SaaS Dashboard', desc: 'Visualize data, manage users, and track metrics with charts.' },
                { icon: '🛒', name: 'Marketplace', desc: 'Connect buyers and sellers in a two-sided platform with payments.' },
                { icon: '🚀', name: 'Landing Page', desc: 'Capture leads and promote your product with a high-converting page.' },
                { icon: '🔧', name: 'Internal Tool', desc: 'Streamline operations and automate workflows for your team.' },
              ].map(t => (
                <div
                  key={t.name}
                  className="build-tmpl-card"
                  onClick={() => setInputValue(`Build me a ${t.name.toLowerCase()}: ${t.desc}`)}
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '18px', marginRight: '6px' }}>{t.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{t.name}</span>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: '1.5', marginTop: '6px' }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === 'research' && (
          <div className="build-slide-enter" style={{ maxWidth: '780px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>

              {/* Section label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}><Search size={13} color="#a78bfa" /></div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.85)' }}>Research Brief</span>
                {loading && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>researching…</span>}
              </div>

              {/* Research error */}
              {researchError && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px', padding: '14px 18px', marginBottom: '16px', textAlign: 'center'
                }}>
                  <p style={{ color: '#f87171', fontSize: '13px', fontWeight: '600', margin: 0 }}>
                    Something went wrong researching your idea. Please try again.
                  </p>
                  <button onClick={handleResearch} style={{
                    marginTop: '10px', background: '#7c3aed', color: '#fff', border: 'none',
                    padding: '7px 18px', borderRadius: '7px', fontSize: '12px',
                    fontWeight: '600', cursor: 'pointer'
                  }}>Try Again</button>
                </div>
              )}

              {/* User message bubble — dark */}
              <div style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px 12px 4px 12px',
                padding: '12px 16px', marginBottom: '16px',
                fontSize: '14px', color: 'rgba(255,255,255,0.85)',
                maxWidth: '80%', marginLeft: 'auto', lineHeight: '1.6'
              }}>
                {description}
              </div>

              {/* AI research response — dark card, or skeleton if still loading */}
              {loading && !research ? (
                <div style={{
                  background: '#15151f', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '4px 12px 12px 12px', padding: '24px'
                }}>
                  {[100, 85, 90, 70, 80, 60].map((w, i) => (
                    <div key={i} className="build-skeleton" style={{
                      height: '13px', width: `${w}%`, background: 'rgba(255,255,255,0.08)',
                      borderRadius: '6px', marginBottom: i < 5 ? '12px' : 0,
                      animationDelay: `${i * 0.1}s`
                    }} />
                  ))}
                </div>
              ) : (
                <div style={{
                  background: '#15151f', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '4px 12px 12px 12px', padding: '20px 24px',
                  fontSize: '14px', lineHeight: '1.85', color: 'rgba(255,255,255,0.75)',
                  whiteSpace: 'pre-wrap', animation: research ? 'build-fadein 0.2s ease both' : 'none'
                }}>
                  {research}
                </div>
              )}
            </div>

            {stage === 'research' && !loading && (
              <div className="build-section-enter" style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '20px' }}>
                <button
                  onClick={handleGenerateBlueprint}
                  disabled={blueprintLoading}
                  style={{
                    background: blueprintLoading ? 'rgba(139,92,246,0.3)' : '#7c3aed',
                    color: '#fff', border: 'none', padding: '12px 32px',
                    fontSize: '14px', fontWeight: '600', borderRadius: '10px',
                    cursor: blueprintLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={e => { if (!blueprintLoading) e.currentTarget.style.background = '#6d28d9' }}
                  onMouseLeave={e => { if (!blueprintLoading) e.currentTarget.style.background = '#7c3aed' }}
                >
                  {blueprintLoading && <svg style={{ animation: 'build-spin 0.8s linear infinite' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg>}
                  {blueprintLoading ? 'Building Blueprint…' : 'Generate Blueprint →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── BLUEPRINT STAGE ── */}
        {stage === 'blueprint' && blueprint && (
          <div className="build-slide-enter" style={{ maxWidth: '900px', margin: '24px auto 0' }}>

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button onClick={() => setStage('research')} style={{
                background: 'transparent', color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '5px 13px', borderRadius: '7px', fontSize: '12px',
                fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
              >← Research</button>

              {/* 2 tabs only — no Risk tab here */}
              <div style={{
                display: 'flex', background: 'rgba(255,255,255,0.06)',
                borderRadius: '9px', padding: '3px', marginLeft: 'auto',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                {[
                  { key: 'text',  label: '📝 Blueprint', onClick: () => setBlueprintView('text') },
                  { key: 'graph', label: '🔗 Graph',     onClick: () => setBlueprintView('graph') }
                ].map(tab => (
                  <button key={tab.key} onClick={tab.onClick} style={{
                    padding: '5px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '600',
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                    background: blueprintView === tab.key ? 'rgba(139,92,246,0.35)' : 'transparent',
                    color: blueprintView === tab.key ? '#c4b5fd' : 'rgba(255,255,255,0.4)'
                  }}>{tab.label}</button>
                ))}
              </div>
            </div>

            {/* Blueprint editor — always mounted, toggled by CSS */}
            <div style={{ display: blueprintView === 'text' ? 'block' : 'none' }}>
              <BlueprintEditor blueprint={blueprint} onApprove={handleApprove} />
            </div>

            {/* Graph view — always mounted to prevent React Flow #002 warning */}
            <div style={{ display: blueprintView === 'graph' ? 'block' : 'none' }}>
              <IntentGraph blueprint={blueprint} onConfirm={() => setBlueprintView('text')} />
            </div>
          </div>
        )}

        {/* ── RISK STAGE ── */}
        {stage === 'risk' && (
          <div className="build-slide-enter" style={{ maxWidth: '900px', margin: '24px auto 0' }}>

            {/* Back to Blueprint */}
            <div style={{ marginBottom: '20px' }}>
              <button onClick={() => setStage('blueprint')} style={{
                background: 'transparent', color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '5px 13px', borderRadius: '7px', fontSize: '12px',
                fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
              >← Blueprint</button>
            </div>

            {riskLoading ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{
                  width: '52px', height: '52px', margin: '0 auto 20px',
                  border: '3px solid rgba(139,92,246,0.2)',
                  borderTop: '3px solid #7c3aed',
                  borderRadius: '50%', animation: 'build-spin 0.9s linear infinite'
                }} />
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '6px', fontWeight: '600' }}>Running Risk Radar…</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>Analysing security, compliance & accessibility</p>
              </div>
            ) : riskError ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '14px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
                <p style={{ color: '#f87171', fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Risk analysis failed</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>Something went wrong. Please try again.</p>
                <button onClick={() => handleApprove(blueprint)} style={{
                  background: '#7c3aed', color: '#fff', border: 'none',
                  padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                }}>Retry Analysis</button>
              </div>
            ) : riskReport ? (
              <RiskReport report={riskReport} onContinue={handleSaveToDashboard} onBack={() => setStage('blueprint')} />
            ) : null}
          </div>
        )}

        {/* Risk stage is now embedded as a tab inside blueprint view above */}

        {stage === 'saved' && (
          <div style={{
            maxWidth: '500px', margin: '40px auto', textAlign: 'center',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '16px', padding: '48px 32px'
          }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
              Saved to Dashboard!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' }}>
              <strong style={{ color: '#fff' }}>{blueprint?.projectName}</strong> is saved. You can reopen it anytime from the sidebar or dashboard — exactly where you left off.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/dashboard" style={{
                background: '#fff', color: '#000', border: 'none',
                padding: '10px 24px', borderRadius: '8px',
                fontSize: '14px', fontWeight: '700', textDecoration: 'none'
              }}>View all projects →</a>
              <button onClick={reset} style={{
                background: 'transparent', color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '10px 24px', borderRadius: '8px',
                fontSize: '14px', fontWeight: '500', cursor: 'pointer'
              }}>Build another app</button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom input bar — only on idle/research stage */}
      {(stage === 'idle' || stage === 'research') && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '16px 32px 24px',
          background: 'linear-gradient(to top, #0d0d18 65%, transparent)',
        }}>
          <div style={{ maxWidth: '840px', margin: '0 auto' }}>
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleResearch() }
              }}
              placeholder="Describe your app idea... (e.g. A marketplace where farmers sell directly to consumers)"
              style={{
                width: '100%', minHeight: '100px', maxHeight: '180px',
                padding: '16px 18px', fontSize: '14px',
                border: '1.5px solid rgba(139,92,246,0.45)', outline: 'none', resize: 'none',
                color: '#fff', background: 'rgba(255,255,255,0.03)',
                boxSizing: 'border-box', lineHeight: '1.6', borderRadius: '12px',
                transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.8)'}
              onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.45)'}
            />
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginTop: '10px'
            }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>Enter</kbd> to research
                · <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>Shift+Enter</kbd> for new line
              </span>
              <button
                onClick={handleResearch}
                disabled={loading || !inputValue.trim()}
                style={{
                  background: loading || !inputValue.trim() ? 'rgba(139,92,246,0.3)' : '#7c3aed',
                  color: '#fff', border: 'none', padding: '9px 22px', fontSize: '13px',
                  fontWeight: '600', borderRadius: '8px',
                  cursor: loading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {loading ? 'Researching…' : 'Research →'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  )
}

export default function BuildPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: '#888' }}>Loading...</div>}>
      <BuildPageInner />
    </Suspense>
  )
}