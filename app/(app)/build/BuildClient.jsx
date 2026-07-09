'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BlueprintEditor from '@/components/blueprint/BlueprintEditor'
import IntentGraph from '@/components/blueprint/IntentGraph'
import RiskReport from '@/components/risk/RiskReport'
import BuildSquad from '@/components/generate/BuildSquad'
import FileViewer from '@/components/generate/FileViewer'
import { bundleFilesToZip } from '@/lib/zip/bundler'
import { Search } from 'lucide-react'

// ─── Blueprint Loading Overlay ───────────────────────────────────────────────
const BP_STEPS = [
  { icon: '🔍', text: 'Analyzing your requirements…' },
  { icon: '⚡', text: 'Identifying core features…' },
  { icon: '🏗️', text: 'Architecting the system…' },
  { icon: '🧬', text: 'Defining tech stack…' },
  { icon: '✨', text: 'Generating your blueprint…' },
]

function BlueprintLoadingOverlay({ step }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(8,8,15,0.97)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'ol-in 0.35s ease both'
    }}>
      {/* Orbiting rings */}
      <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '48px' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: `${i * 16}px`,
            borderRadius: '50%',
            border: `1px solid rgba(139,92,246,${0.55 - i * 0.15})`,
            animation: `ring-spin ${2 + i * 0.7}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
          }} />
        ))}
        {/* Center icon */}
        <div style={{
          position: 'absolute', inset: '44px',
          background: 'rgba(124,58,237,0.2)', borderRadius: '50%',
          border: '1px solid rgba(124,58,237,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', animation: 'icon-pulse 1.5s ease-in-out infinite'
        }}>
          {BP_STEPS[step]?.icon ?? '✨'}
        </div>
        {/* Orbiting dot */}
        <div style={{
          position: 'absolute', top: '4px', left: '50%', marginLeft: '-4px',
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#a78bfa', boxShadow: '0 0 10px #a78bfa',
          transformOrigin: '4px 66px',
          animation: 'dot-orbit 1.8s linear infinite'
        }} />
      </div>

      {/* Steps */}
      <div style={{ textAlign: 'center', maxWidth: '300px' }}>
        <p style={{
          fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '10px',
          animation: 'step-in 0.4s ease both', key: step
        }}>
          {BP_STEPS[step]?.text ?? 'Working…'}
        </p>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '28px' }}>
          {BP_STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? '20px' : '6px', height: '6px', borderRadius: '3px',
              background: i <= step ? '#7c3aed' : 'rgba(255,255,255,0.12)',
              transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)'
            }} />
          ))}
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          This usually takes 5–15 seconds
        </p>
      </div>
    </div>
  )
}

// ─── Risk Radar Loading Overlay ───────────────────────────────────────────────
const RISK_STEPS = [
  'Scanning security surface…',
  'Checking compliance gaps…',
  'Auditing accessibility…',
  'Estimating infrastructure costs…',
  'Finalising risk report…',
]

function RiskLoadingOverlay({ step }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(8,8,15,0.97)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'ol-in 0.35s ease both'
    }}>
      {/* Radar */}
      <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '44px' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: `${i * 20}px`, borderRadius: '50%',
            border: `1px solid rgba(239,68,68,${0.5 - i * 0.12})`,
            animation: `radar-ring ${3 + i}s linear infinite`
          }} />
        ))}
        {/* Sweep */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'conic-gradient(from 0deg, rgba(239,68,68,0.25) 0deg, transparent 60deg)',
          animation: 'radar-sweep 2.4s linear infinite'
        }} />
        {/* Center */}
        <div style={{
          position: 'absolute', inset: '60px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px'
        }}>🛡️</div>
        {/* Blips */}
        {[[20,30],[60,15],[80,55]].map(([top,left],i) => (
          <div key={i} style={{
            position: 'absolute', top: `${top}%`, left: `${left}%`,
            width: '5px', height: '5px', borderRadius: '50%',
            background: '#f87171', boxShadow: '0 0 8px #f87171',
            animation: `blip-pulse 1.2s ease-in-out ${i * 0.4}s infinite`
          }} />
        ))}
      </div>

      <p style={{ fontSize: '17px', fontWeight: '700', color: '#fff', marginBottom: '10px', animation: 'step-in 0.4s ease both' }}>
        {RISK_STEPS[step] ?? 'Analysing risks…'}
      </p>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '24px' }}>
        {RISK_STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? '20px' : '6px', height: '6px', borderRadius: '3px',
            background: i <= step ? '#ef4444' : 'rgba(255,255,255,0.12)',
            transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)'
          }} />
        ))}
      </div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>Scanning for vulnerabilities & compliance gaps</p>
    </div>
  )
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes rotate3d    { 0%{transform:rotateX(0)rotateY(0)}100%{transform:rotateX(360deg)rotateY(360deg)} }
  @keyframes build-spin  { to{transform:rotate(360deg)} }
  @keyframes build-fadein{ from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
  @keyframes build-slidein{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)} }
  @keyframes build-pulse { 0%,100%{opacity:0.4}50%{opacity:0.85} }
  @keyframes cursor-blink{ 0%,100%{opacity:1}50%{opacity:0} }
  @keyframes ol-in       { from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)} }
  @keyframes step-in     { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
  @keyframes ring-spin   { to{transform:rotate(360deg)} }
  @keyframes dot-orbit   { to{transform:rotate(360deg)} }
  @keyframes icon-pulse  { 0%,100%{transform:scale(1)}50%{transform:scale(1.12)} }
  @keyframes radar-sweep { to{transform:rotate(360deg)} }
  @keyframes radar-ring  { 0%,100%{opacity:0.7;transform:scale(1)}50%{opacity:0.3;transform:scale(1.04)} }
  @keyframes blip-pulse  { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.2;transform:scale(0.5)} }
  @keyframes res-pulse   { 0%,100%{opacity:0.35}50%{opacity:0.75} }
  @keyframes res-spin    { to{transform:rotate(360deg)} }
  @keyframes saved-pop   { 0%{opacity:0;transform:scale(0.88)}60%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)} }

  .build-tmpl-card { transition:all 0.18s !important; }
  .build-tmpl-card:hover { background:rgba(139,92,246,0.14)!important; border-color:rgba(139,92,246,0.4)!important; transform:translateY(-3px)!important; box-shadow:0 8px 28px rgba(139,92,246,0.15)!important; }
  .build-tmpl-card:active { transform:scale(0.97)!important; }
  .build-step-pill { transition:all 0.18s !important; }
  .build-step-pill:hover { opacity:1!important; }
  .build-section-enter { animation:build-fadein 0.35s cubic-bezier(0.4,0,0.2,1) both; }
  .build-slide-enter   { animation:build-slidein 0.35s cubic-bezier(0.4,0,0.2,1) both; }
  .build-skeleton      { animation:build-pulse 1.4s ease-in-out infinite; }
  .streaming-cursor    { display:inline-block; width:2px; height:1.1em; background:#a78bfa; margin-left:2px; vertical-align:text-bottom; animation:cursor-blink 0.9s ease-in-out infinite; }
`

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BuildClient({ projectId: initialProjectId }) {
  const router = useRouter()

  const [projectId, setProjectId]   = useState(initialProjectId || null)
  const [blueprintId, setBlueprintId] = useState(null)

  const [inputValue, setInputValue]   = useState('')
  const [description, setDescription] = useState('')
  const [research, setResearch]       = useState('')
  const [blueprint, setBlueprint]     = useState(null)
  const [riskReport, setRiskReport]   = useState(null)

  const [stage, setStage]             = useState('idle')
  const [blueprintView, setBlueprintView] = useState('text')
  const [stageKey, setStageKey]       = useState(0) // forces animation re-trigger

  const [loading, setLoading]         = useState(false)
  const [blueprintLoading, setBlueprintLoading] = useState(false)
  const [bpStep, setBpStep]           = useState(0)
  const [riskLoading, setRiskLoading] = useState(false)
  const [riskStep, setRiskStep]       = useState(0)
  const [riskError, setRiskError]     = useState(false)
  const [researchError, setResearchError] = useState(false)
  const [resuming, setResuming]       = useState(!!initialProjectId)

  // ── Phase 1: Generation state ──
  const [generationRunId, setGenerationRunId]   = useState(null)
  const [agentStatuses, setAgentStatuses]       = useState({})
  const [generationStatus, setGenerationStatus] = useState(null)
  const [generationError, setGenerationError]   = useState(null)
  const [generatedFiles, setGeneratedFiles]     = useState([])
  const [fileCount, setFileCount]               = useState(0)
  const [showFileViewer, setShowFileViewer]     = useState(false)
  const [generationLoading, setGenerationLoading] = useState(false)

  // ── Cycle blueprint loading steps ──
  useEffect(() => {
    if (!blueprintLoading) { setBpStep(0); return }
    const id = setInterval(() => setBpStep(s => Math.min(s + 1, BP_STEPS.length - 1)), 2200)
    return () => clearInterval(id)
  }, [blueprintLoading])

  // ── Cycle risk loading steps ──
  useEffect(() => {
    if (!riskLoading) { setRiskStep(0); return }
    const id = setInterval(() => setRiskStep(s => Math.min(s + 1, RISK_STEPS.length - 1)), 2800)
    return () => clearInterval(id)
  }, [riskLoading])

  // ── Resume an existing project ──
  useEffect(() => {
    if (!initialProjectId) return
    async function load() {
      try {
        const res  = await fetch(`/api/project/${initialProjectId}`)
        const data = await res.json()
        if (data.project) {
          setProjectId(data.project.id)
          setDescription(data.project.description || '')
          setResearch(data.project.research_brief || '')
          if (data.blueprint) {
            setBlueprintId(data.blueprint.id)
            setBlueprint(data.blueprint.json)
          }
          if (data.generationRun) {
            setGenerationRunId(data.generationRun.id)
            setAgentStatuses(data.generationRun.agent_statuses || {})
            setGenerationStatus(data.generationRun.status)
            setFileCount(data.generationRun.total_tokens_used || 0)
            if (data.generationRun.status === 'completed') {
              loadGeneratedFiles(data.generationRun.id)
            }
            goStage('generating')
          } else if (data.project.status === 'blueprint') {
            goStage('saved')
          } else if (data.riskReport) {
            setRiskReport(data.riskReport.report)
            goStage('risk')
          } else if (data.blueprint) {
            goStage('blueprint'); setBlueprintView('text')
          } else if (data.project.research_brief) {
            goStage('research')
          }
        }
      } finally {
        setResuming(false)
      }
    }
    load()
  }, [initialProjectId])

  function goStage(s) { setStage(s); setStageKey(k => k + 1) }

  // ── Research ──
  async function handleResearch() {
    if (!inputValue.trim() || loading) return
    const submitted = inputValue
    setDescription(submitted); setInputValue(''); setResearch('')
    setBlueprint(null); setRiskReport(null); setResearchError(false)
    setLoading(true); goStage('research')
    try {
      const response = await fetch('/api/research', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: submitted }) })
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let fullText = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        fullText += decoder.decode(value); setResearch(fullText)
      }
      const saveRes  = await fetch('/api/project/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'research', projectId, description: submitted, research: fullText }) })
      const saveData = await saveRes.json()
      if (saveData.projectId) { setProjectId(saveData.projectId); router.replace(`/build?id=${saveData.projectId}`) }
    } catch { setResearchError(true) }
    finally { setLoading(false) }
  }

  // ── Blueprint ──
  async function handleGenerateBlueprint() {
    setBlueprintLoading(true)
    try {
      const res  = await fetch('/api/blueprint/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description, research }) })
      const data = await res.json()
      if (data.blueprint) {
        setBlueprint(data.blueprint); goStage('blueprint')
        const saveRes  = await fetch('/api/project/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'blueprint', projectId, blueprint: data.blueprint }) })
        const saveData = await saveRes.json()
        if (saveData.blueprintId) setBlueprintId(saveData.blueprintId)
      }
    } catch { alert('Blueprint generation failed. Try again.') }
    finally { setBlueprintLoading(false) }
  }

  // ── Approve blueprint → Risk ──
  async function handleApprove(finalBlueprint) {
    setBlueprint(finalBlueprint)
    const saveRes  = await fetch('/api/project/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'blueprint', projectId, blueprint: finalBlueprint }) })
    const saveData = await saveRes.json()
    const currentBlueprintId = saveData.blueprintId || blueprintId
    setBlueprintId(currentBlueprintId); goStage('risk')
    if (riskReport) return
    setRiskLoading(true); setRiskError(false)
    try {
      const res  = await fetch('/api/risk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blueprint: finalBlueprint }) })
      if (!res.ok) throw new Error('Risk analysis failed')
      const data = await res.json()
      if (data.riskReport) {
        setRiskReport(data.riskReport)
        await fetch('/api/project/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'risk', projectId, blueprintId: currentBlueprintId, riskReport: data.riskReport }) })
      } else throw new Error('No risk report returned')
    } catch (err) { console.error(err); setRiskError(true) }
    finally { setRiskLoading(false) }
  }

  async function handleSaveToDashboard() {
    await fetch('/api/project/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'finalize', projectId, blueprintId }) })
    goStage('saved')
  }

  // ── Phase 1: Start generation (chunked — bypasses Vercel 60s limit) ──────────
  async function handleStartGeneration() {
    setGenerationLoading(true)
    setGenerationError(null)
    goStage('generating')

    let currentStatuses = {
      frontend: 'running', backend: 'skipped', schema: 'skipped',
      security: 'skipped', test: 'running', coordinator: 'waiting',
    }
    const tier = blueprint?.tier || 1
    if (tier > 1) {
      currentStatuses.backend = 'running'
      currentStatuses.schema = 'running'
      currentStatuses.security = 'running'
    }

    setAgentStatuses({ ...currentStatuses })
    setGenerationStatus('running')

    try {
      // 1. Save project first
      await fetch('/api/project/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'finalize', projectId, blueprintId }),
      })

      // 2. Init generation run
      const initRes = await fetch('/api/generate/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, blueprintId }),
      })
      
      const initData = await initRes.json()
      if (!initRes.ok) throw new Error(initData.error || 'Failed to initialize generation')
      
      const { runId } = initData
      setGenerationRunId(runId)

      // 3. Run agents in parallel
      const agentsToRun = ['frontend', 'test']
      if (tier > 1) agentsToRun.push('backend', 'schema', 'security')

      // Use Promise.all to fire them simultaneously, each gets its own 60s Vercel timeout!
      const agentPromises = agentsToRun.map(async (agent) => {
        try {
          const res = await fetch('/api/generate/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ runId, agent }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || `${agent} failed`)
          
          // Update status as each finishes
          currentStatuses = { ...currentStatuses, [agent]: 'done' }
          setAgentStatuses({ ...currentStatuses })
          return { agent, success: true }
        } catch (err) {
          console.error(`Error in ${agent}:`, err)
          currentStatuses = { ...currentStatuses, [agent]: 'error' }
          setAgentStatuses({ ...currentStatuses })
          return { agent, success: false, error: err.message }
        }
      })

      const results = await Promise.all(agentPromises)
      
      const anyFailed = results.some(r => !r.success)
      if (anyFailed) {
        throw new Error('One or more agents failed. Check the status panel.')
      }

      // 4. Run coordinator
      currentStatuses = { ...currentStatuses, coordinator: 'running' }
      setAgentStatuses({ ...currentStatuses })

      const coordRes = await fetch('/api/generate/coordinator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId }),
      })
      const coordData = await coordRes.json()
      if (!coordRes.ok) throw new Error(coordData.error || 'Coordinator failed')

      // 5. Complete
      currentStatuses = { ...currentStatuses, coordinator: 'done' }
      setAgentStatuses({ ...currentStatuses })
      setGenerationStatus('completed')
      setFileCount(coordData.count || 0)
      
      await loadGeneratedFiles(runId)

    } catch (err) {
      console.error('Generation error:', err)
      setGenerationStatus('failed')
      setGenerationError(err.message || 'Generation failed.')
    } finally {
      setGenerationLoading(false)
    }
  }

  async function loadGeneratedFiles(runId) {
    const res  = await fetch(`/api/generate/files?runId=${runId}`)
    const data = await res.json()
    setGeneratedFiles(data.files || [])
  }

  async function handleDownloadZip() {
    if (!generatedFiles.length) return
    const blob = await bundleFilesToZip(generatedFiles, blueprint?.projectName || 'atlas-app')
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${(blueprint?.projectName || 'atlas-app').replace(/\s+/g, '-').toLowerCase()}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setProjectId(null); setBlueprintId(null); setInputValue(''); setDescription('')
    setResearch(''); setBlueprint(null); setRiskReport(null); goStage('idle')
    router.push('/build')
  }

  const STEPS = [
    { key: 'research',   label: 'Research'      },
    { key: 'blueprint',  label: 'Blueprint'     },
    { key: 'risk',       label: 'Risk Analysis' },
    { key: 'generating', label: 'Build'         },
  ]
  const stageIndex = { idle:-1, research:0, blueprint:1, risk:2, saved:2, generating:3 }[stage] ?? -1

  function goToStep(key) {
    if (key === 'research'  && research)   goStage('research')
    if (key === 'blueprint' && blueprint)  { goStage('blueprint'); setBlueprintView('text') }
    if (key === 'risk'      && riskReport) goStage('risk')
  }

  // ── Resuming skeleton ──────────────────────────────────────────────────────
  if (resuming) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#0d0d18' }}>
      <style>{`@keyframes res-pulse{0%,100%{opacity:0.35}50%{opacity:0.7}} @keyframes res-spin{to{transform:rotate(360deg)}} .res-sk{animation:res-pulse 1.4s ease-in-out infinite;background:rgba(255,255,255,0.07);border-radius:8px;}`}</style>
      <div style={{ height:'56px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', gap:'24px', flexShrink:0 }}>
        {[120,90,110,80].map((w,i) => <div key={i} className="res-sk" style={{ height:'28px', width:`${w}px`, animationDelay:`${i*0.12}s` }} />)}
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:'44px', height:'44px', margin:'0 auto 18px', border:'3px solid rgba(139,92,246,0.2)', borderTop:'3px solid #7c3aed', borderRadius:'50%', animation:'res-spin 0.75s linear infinite' }} />
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px', fontWeight:'500' }}>Loading project…</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
    <style>{GLOBAL_CSS}</style>

    {/* Full-screen Blueprint Loading Overlay */}
    {blueprintLoading && <BlueprintLoadingOverlay step={bpStep} />}

    {/* Full-screen Risk Loading Overlay */}
    {riskLoading && <RiskLoadingOverlay step={riskStep} />}

    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#0d0d18', position:'relative' }}>

      {/* ── Step bar ── */}
      <div style={{ padding:'0 32px', height:'56px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', gap:'0', flexShrink:0, background:'#0d0d18' }}>
        {STEPS.map((s,i) => {
          const done = stageIndex > i
          const active = stageIndex === i || (stageIndex === -1 && i === 0)
          const clickable = (s.key==='research'&&research)||(s.key==='blueprint'&&blueprint)||(s.key==='risk'&&riskReport)
          return (
            <div key={s.key} style={{ display:'flex', alignItems:'center' }}>
              {i>0 && <div style={{ width:'60px', height:'1px', background: done ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)', transition:'background 0.4s' }} />}
              <div className="build-step-pill" onClick={() => clickable && goToStep(s.key)} style={{
                display:'flex', alignItems:'center', gap:'7px', padding:'5px 14px 5px 6px', borderRadius:'20px',
                background: active ? 'rgba(139,92,246,0.2)' : 'transparent',
                border: active ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent',
                cursor: clickable ? 'pointer' : 'default',
                opacity: stageIndex >= i || active ? 1 : 0.4, transition:'all 0.2s'
              }}>
                <div style={{
                  width:'22px', height:'22px', borderRadius:'50%',
                  background: done ? '#7c3aed' : active ? '#7c3aed' : 'rgba(255,255,255,0.1)',
                  color:(done||active)?'#fff':'rgba(255,255,255,0.4)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'11px', fontWeight:'700', flexShrink:0, transition:'all 0.3s'
                }}>{done ? '✓' : i+1}</div>
                <span style={{ fontSize:'13px', fontWeight:active?'600':'400', color:active?'#fff':done?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.4)', transition:'color 0.2s' }}>{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Main content ── */}
      <div style={{ flex:1, overflow:'auto', padding:'28px 28px 220px', background:'#08080f' }}>

        {/* IDLE */}
        {stage==='idle' && (
          <div key={`idle-${stageKey}`} className="build-section-enter" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center', padding:'20px 20px 0' }}>
            <div style={{ marginBottom:'24px' }}>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ animation:'rotate3d 12s linear infinite', filter:'drop-shadow(0 0 20px rgba(139,92,246,0.45))' }}>
                <g stroke="rgba(139,92,246,0.7)" strokeWidth="0.8" fill="none">
                  {[[70,20],[120,50],[120,90],[70,120],[20,90],[20,50],[70,40],[100,55],[100,85],[70,100],[40,85],[40,55]].reduce((acc,[x1,y1],i,pts)=>{const next=pts[(i+1)%6];const inner=pts[i+6];if(!inner)return acc;return[...acc,{x1,y1,x2:next?.[0],y2:next?.[1],op:i<6?1:0.5},{x1,y1,x2:inner[0],y2:inner[1],op:0.6}]},[]).map((l,i)=>l.x2&&<line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeOpacity={l.op}/>)}
                  {[[70,40],[100,55],[100,85],[70,100],[40,85],[40,55]].map(([x,y],i,a)=>{const n=a[(i+1)%6];return<line key={`i${i}`} x1={x} y1={y} x2={n[0]} y2={n[1]} strokeOpacity="0.9"/>})}
                  {[[70,40],[100,85],[40,85],[70,40],[40,55],[100,85]].reduce((a,p,i,arr)=>i%2===0?[...a,{x1:p[0],y1:p[1],x2:arr[i+1][0],y2:arr[i+1][1]}]:a,[]).map((l,i)=><line key={`c${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeOpacity="0.3"/>)}
                  {[[70,20],[120,50],[120,90],[70,120],[20,90],[20,50],[70,40],[100,55],[100,85],[70,100],[40,85],[40,55]].map(([cx,cy],i)=><circle key={`d${i}`} cx={cx} cy={cy} r={i<6?2.5:1.8} fill="rgba(139,92,246,0.8)" stroke="none"/>)}
                </g>
              </svg>
            </div>
            <h2 style={{ fontSize:'clamp(28px,4vw,40px)', fontWeight:'800', color:'#fff', marginBottom:'12px', letterSpacing:'-0.5px', lineHeight:'1.15' }}>
              What are you building today?
            </h2>
            <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.4)', maxWidth:'440px', lineHeight:'1.65', marginBottom:'36px' }}>
              Describe your app idea and Atlas will research, plan, and build it for you.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(195px,1fr))', gap:'10px', maxWidth:'860px', width:'100%' }}>
              {[
                {icon:'📊',name:'SaaS Dashboard',desc:'Visualize data, manage users, and track metrics with charts.'},
                {icon:'🛒',name:'Marketplace',desc:'Connect buyers and sellers in a two-sided platform with payments.'},
                {icon:'🚀',name:'Landing Page',desc:'Capture leads and promote your product with a high-converting page.'},
                {icon:'🔧',name:'Internal Tool',desc:'Streamline operations and automate workflows for your team.'},
              ].map((t,idx)=>(
                <div key={t.name} className="build-tmpl-card" onClick={()=>setInputValue(`Build me a ${t.name.toLowerCase()}: ${t.desc}`)}
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'14px 16px', cursor:'pointer', textAlign:'left', animationDelay:`${idx*0.07}s` }}>
                  <span style={{ fontSize:'18px', marginRight:'6px' }}>{t.icon}</span>
                  <span style={{ fontSize:'13px', fontWeight:'700', color:'#fff' }}>{t.name}</span>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.38)', lineHeight:'1.5', marginTop:'6px' }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESEARCH */}
        {stage==='research' && (
          <div key={`research-${stageKey}`} className="build-slide-enter" style={{ maxWidth:'780px', margin:'0 auto' }}>
            <div style={{ marginBottom:'40px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'rgba(139,92,246,0.25)', border:'1px solid rgba(139,92,246,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}><Search size={13} color="#a78bfa"/></div>
                <span style={{ fontSize:'14px', fontWeight:'700', color:'rgba(255,255,255,0.85)' }}>Research Brief</span>
                {loading && <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', fontStyle:'italic' }}>researching…</span>}
              </div>
              {researchError && (
                <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'14px 18px', marginBottom:'16px', textAlign:'center' }}>
                  <p style={{ color:'#f87171', fontSize:'13px', fontWeight:'600', margin:0 }}>Something went wrong. Please try again.</p>
                  <button onClick={handleResearch} style={{ marginTop:'10px', background:'#7c3aed', color:'#fff', border:'none', padding:'7px 18px', borderRadius:'7px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>Try Again</button>
                </div>
              )}
              <div style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px 12px 4px 12px', padding:'12px 16px', marginBottom:'16px', fontSize:'14px', color:'rgba(255,255,255,0.85)', maxWidth:'80%', marginLeft:'auto', lineHeight:'1.6' }}>
                {description}
              </div>
              {/* Research skeleton or streaming text */}
              {loading && !research ? (
                <div style={{ background:'#15151f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'4px 12px 12px 12px', padding:'24px' }}>
                  {[100,85,90,70,80,60].map((w,i)=>(
                    <div key={i} className="build-skeleton" style={{ height:'13px', width:`${w}%`, background:'rgba(255,255,255,0.08)', borderRadius:'6px', marginBottom:i<5?'12px':0, animationDelay:`${i*0.12}s` }}/>
                  ))}
                </div>
              ) : (
                <div style={{ background:'#15151f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'4px 12px 12px 12px', padding:'20px 24px', fontSize:'14px', lineHeight:'1.85', color:'rgba(255,255,255,0.75)', whiteSpace:'pre-wrap', animation:'build-fadein 0.2s ease both' }}>
                  {research}
                  {/* Blinking cursor while streaming */}
                  {loading && <span className="streaming-cursor"/>}
                </div>
              )}
            </div>
            {!loading && (
              <div className="build-section-enter" style={{ display:'flex', justifyContent:'center', marginTop:'32px', marginBottom:'20px' }}>
                <button onClick={handleGenerateBlueprint} disabled={blueprintLoading}
                  style={{ background:'#7c3aed', color:'#fff', border:'none', padding:'13px 36px', fontSize:'14px', fontWeight:'700', borderRadius:'10px', cursor:'pointer', transition:'all 0.18s', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 4px 20px rgba(124,58,237,0.35)' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#6d28d9';e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 6px 24px rgba(124,58,237,0.45)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#7c3aed';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 20px rgba(124,58,237,0.35)'}}
                >
                  Generate Blueprint →
                </button>
              </div>
            )}
          </div>
        )}

        {/* BLUEPRINT */}
        {stage==='blueprint' && blueprint && (
          <div key={`blueprint-${stageKey}`} className="build-slide-enter" style={{ maxWidth:'900px', margin:'24px auto 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
              <button onClick={()=>goStage('research')} style={{ background:'transparent', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.1)', padding:'5px 13px', borderRadius:'7px', fontSize:'12px', fontWeight:'500', cursor:'pointer', transition:'all 0.15s', flexShrink:0 }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='#fff'}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.4)'}}
              >← Research</button>
              <div style={{ display:'flex', background:'rgba(255,255,255,0.06)', borderRadius:'9px', padding:'3px', marginLeft:'auto', border:'1px solid rgba(255,255,255,0.08)' }}>
                {[{key:'text',label:'📝 Blueprint',onClick:()=>setBlueprintView('text')},{key:'graph',label:'🔗 Graph',onClick:()=>setBlueprintView('graph')}].map(tab=>(
                  <button key={tab.key} onClick={tab.onClick} style={{ padding:'5px 14px', borderRadius:'7px', fontSize:'12px', fontWeight:'600', border:'none', cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap', background:blueprintView===tab.key?'rgba(139,92,246,0.35)':'transparent', color:blueprintView===tab.key?'#c4b5fd':'rgba(255,255,255,0.4)' }}>{tab.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display:blueprintView==='text'?'block':'none' }}>
              <BlueprintEditor blueprint={blueprint} onApprove={handleApprove}/>
            </div>
            <div style={{ display:blueprintView==='graph'?'block':'none' }}>
              <IntentGraph blueprint={blueprint} onConfirm={()=>setBlueprintView('text')}/>
            </div>
          </div>
        )}

        {/* RISK */}
        {stage==='risk' && (
          <div key={`risk-${stageKey}`} className="build-slide-enter" style={{ maxWidth:'900px', margin:'24px auto 0' }}>
            <div style={{ marginBottom:'20px' }}>
              <button onClick={()=>goStage('blueprint')} style={{ background:'transparent', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.1)', padding:'5px 13px', borderRadius:'7px', fontSize:'12px', fontWeight:'500', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='#fff'}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.4)'}}
              >← Blueprint</button>
            </div>
            {/* riskLoading is handled by the overlay — show nothing here while loading */}
            {!riskLoading && riskError && (
              <div style={{ textAlign:'center', padding:'60px 20px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'14px' }}>
                <div style={{ fontSize:'36px', marginBottom:'12px' }}>⚠️</div>
                <p style={{ color:'#f87171', fontSize:'15px', fontWeight:'700', marginBottom:'8px' }}>Risk analysis failed</p>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', marginBottom:'20px' }}>Something went wrong. Please try again.</p>
                <button onClick={()=>handleApprove(blueprint)} style={{ background:'#7c3aed', color:'#fff', border:'none', padding:'10px 24px', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>Retry Analysis</button>
              </div>
            )}
            {!riskLoading && !riskError && riskReport && (
              <RiskReport report={riskReport} onContinue={handleStartGeneration} onBack={()=>goStage('blueprint')}/>
            )}
          </div>
        )}

        {/* SAVED — blueprint approved, prompt to generate */}
        {stage==='saved' && (
          <div key={`saved-${stageKey}`} style={{ maxWidth:'500px', margin:'60px auto', textAlign:'center', background:'rgba(124,58,237,0.07)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:'20px', padding:'52px 36px', animation:'saved-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <div style={{ fontSize:'52px', marginBottom:'16px', animation:'icon-pulse 2s ease-in-out infinite' }}>🏗️</div>
            <h2 style={{ fontSize:'26px', fontWeight:'800', marginBottom:'10px', color:'#fff' }}>Blueprint Approved!</h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'14px', marginBottom:'10px', lineHeight:'1.65' }}>
              <strong style={{ color:'#fff' }}>{blueprint?.projectName}</strong> is saved and ready.
            </p>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'13px', marginBottom:'32px', lineHeight:'1.65' }}>
              Launch the Build Squad to generate all your code — 5 agents working in parallel.
            </p>
            <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
              <button
                onClick={handleStartGeneration}
                disabled={generationLoading}
                style={{ background: generationLoading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#fff', border:'none', padding:'12px 30px', borderRadius:'10px', fontSize:'14px', fontWeight:'700', cursor: generationLoading ? 'not-allowed' : 'pointer', boxShadow:'0 4px 20px rgba(124,58,237,0.35)', transition:'all 0.18s' }}
                onMouseEnter={e=>{if(!generationLoading){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(124,58,237,0.5)'}}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 20px rgba(124,58,237,0.35)'}}
              >
                {generationLoading ? '⏳ Starting…' : '⚡ Generate App →'}
              </button>
              <a href="/dashboard" style={{ background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.1)', padding:'12px 22px', borderRadius:'10px', fontSize:'14px', fontWeight:'500', textDecoration:'none', display:'inline-flex', alignItems:'center' }}>View Dashboard</a>
            </div>
            <button onClick={reset} style={{ marginTop:'20px', background:'transparent', color:'rgba(255,255,255,0.25)', border:'none', fontSize:'12px', cursor:'pointer' }}>Start a new project instead</button>
          </div>
        )}

        {/* GENERATING — live Build Squad panel */}
        {stage==='generating' && (
          <div key={`generating-${stageKey}`} className="build-slide-enter" style={{ maxWidth:'900px', margin:'24px auto 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'24px' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>⚡</div>
              <span style={{ fontSize:'15px', fontWeight:'700', color:'#fff' }}>Generating Your App</span>
              {generationStatus !== 'completed' && generationStatus !== 'failed' && (
                <svg style={{ marginLeft:'4px', animation:'build-spin 0.75s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg>
              )}
            </div>
            <BuildSquad
              agentStatuses={agentStatuses}
              overallStatus={generationStatus}
              errorMessage={generationError}
              fileCount={fileCount}
              onDownload={handleDownloadZip}
              onViewFiles={() => setShowFileViewer(true)}
            />
            {showFileViewer && generatedFiles.length > 0 && (
              <div style={{ marginTop:'24px', animation:'build-fadein 0.3s ease both' }}>
                <FileViewer files={generatedFiles} onClose={() => setShowFileViewer(false)} />
              </div>
            )}
            {generationStatus === 'completed' && (
              <div style={{ display:'flex', gap:'10px', marginTop:'24px', justifyContent:'center' }}>
                <button onClick={reset} style={{ background:'transparent', color:'rgba(255,255,255,0.35)', border:'1px solid rgba(255,255,255,0.1)', padding:'9px 20px', borderRadius:'8px', fontSize:'13px', cursor:'pointer' }}>Build another app</button>
                <a href="/dashboard" style={{ background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.55)', border:'1px solid rgba(255,255,255,0.1)', padding:'9px 20px', borderRadius:'8px', fontSize:'13px', textDecoration:'none' }}>View Dashboard</a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fixed bottom input bar ── */}
      {(stage==='idle'||stage==='research') && (
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'16px 32px 28px', background:'linear-gradient(to top, #0d0d18 70%, transparent)' }}>
          <div style={{ maxWidth:'840px', margin:'0 auto' }}>
            <textarea value={inputValue} onChange={e=>setInputValue(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleResearch()}}}
              placeholder="Describe your app idea… (e.g. A marketplace where farmers sell directly to consumers)"
              style={{ width:'100%', minHeight:'100px', maxHeight:'180px', padding:'16px 18px', fontSize:'14px', border:'1.5px solid rgba(139,92,246,0.45)', outline:'none', resize:'none', color:'#fff', background:'rgba(255,255,255,0.03)', boxSizing:'border-box', lineHeight:'1.6', borderRadius:'12px', transition:'border-color 0.2s, box-shadow 0.2s' }}
              onFocus={e=>{e.target.style.borderColor='rgba(139,92,246,0.8)';e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.1)'}}
              onBlur={e=>{e.target.style.borderColor='rgba(139,92,246,0.45)';e.target.style.boxShadow='none'}}
            />
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'10px' }}>
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)' }}>
                Press <kbd style={{ background:'rgba(255,255,255,0.1)', padding:'1px 5px', borderRadius:'4px', fontSize:'11px' }}>Enter</kbd> to research
                · <kbd style={{ background:'rgba(255,255,255,0.1)', padding:'1px 5px', borderRadius:'4px', fontSize:'11px' }}>Shift+Enter</kbd> for new line
              </span>
              <button onClick={handleResearch} disabled={loading||!inputValue.trim()}
                style={{ background:loading||!inputValue.trim()?'rgba(139,92,246,0.3)':'#7c3aed', color:'#fff', border:'none', padding:'10px 24px', fontSize:'13px', fontWeight:'700', borderRadius:'9px', cursor:loading||!inputValue.trim()?'not-allowed':'pointer', transition:'all 0.18s', display:'flex', alignItems:'center', gap:'6px', boxShadow: loading||!inputValue.trim()?'none':'0 3px 14px rgba(124,58,237,0.35)' }}
                onMouseEnter={e=>{if(!loading&&inputValue.trim()){e.currentTarget.style.background='#6d28d9';e.currentTarget.style.transform='translateY(-1px)'}}}
                onMouseLeave={e=>{e.currentTarget.style.background=loading||!inputValue.trim()?'rgba(139,92,246,0.3)':'#7c3aed';e.currentTarget.style.transform='translateY(0)'}}
              >
                {loading && <svg style={{ animation:'build-spin 0.75s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg>}
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
