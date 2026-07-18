/**
 * calculator-scientific / sections / calculator.jsx
 *
 * Exports: Calculator, CalcDisplay, CalcKeypad, CalcMemory
 *
 * TEMPLATE RULES (for AI customization):
 * - Change brand colors via CSS variables: --calc-primary, --calc-bg, --calc-surface
 * - Change app title and description copy
 * - Preserve ALL exported component names and prop signatures
 * - Do NOT change the formula evaluation logic (eval is sandboxed)
 * - Do NOT remove keyboard event handlers — they're required for UX
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Safe math evaluator ──────────────────────────────────────────────────────

function safeEval(expr) {
  try {
    // Replace ^ with ** for exponentiation
    const cleaned = expr
      .replace(/\^/g, '**')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/π/g, 'Math.PI')
      .replace(/e(?!\d)/g, 'Math.E')
      .replace(/\|([^|]+)\|/g, 'Math.abs($1)')

    // Only allow safe characters
    if (/[^0-9+\-*/().,%^MathPIEsincotaglqrb\s]/.test(cleaned)) {
      throw new Error('Invalid expression')
    }

    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + cleaned + ')')()
    if (!isFinite(result)) return 'Error'
    // Format: max 10 significant digits, strip trailing zeros
    return parseFloat(result.toPrecision(10)).toString()
  } catch {
    return 'Error'
  }
}

// ─── CalcDisplay ──────────────────────────────────────────────────────────────

export function CalcDisplay({ expression, result, angleMode, onAngleModeToggle }) {
  return (
    <div style={{
      background: 'var(--calc-display, #0a0a14)', borderRadius: '12px',
      padding: '20px 24px', marginBottom: '16px',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Top bar: angle mode + memory */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button
          id="calc-angle-toggle"
          onClick={onAngleModeToggle}
          style={{
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
            color: '#a78bfa', padding: '3px 10px', borderRadius: '6px',
            fontSize: '11px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.05em',
          }}
        >
          {angleMode}
        </button>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--calc-font-mono, monospace)' }}>
          {expression.length > 0 ? `${expression.length} chars` : 'Ready'}
        </span>
      </div>

      {/* Expression */}
      <div style={{
        fontFamily: 'var(--calc-font-mono, monospace)',
        fontSize: '14px', color: 'rgba(255,255,255,0.4)',
        minHeight: '20px', wordBreak: 'break-all', lineHeight: '1.4',
        marginBottom: '8px',
      }}>
        {expression || '0'}
      </div>

      {/* Result preview */}
      <div style={{
        fontFamily: 'var(--calc-font-mono, monospace)',
        fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: '700',
        color: result === 'Error' ? '#f87171' : '#fff',
        letterSpacing: '-1px', wordBreak: 'break-all', lineHeight: '1.1',
      }}>
        {result || '0'}
      </div>
    </div>
  )
}

// ─── CalcKeypad ───────────────────────────────────────────────────────────────

const KEYPAD_ROWS = [
  ['sin(', 'cos(', 'tan(', 'log(', 'ln('],
  ['(', ')', '^', 'sqrt(', '%'],
  ['7', '8', '9', '÷', 'AC'],
  ['4', '5', '6', '×', '⌫'],
  ['1', '2', '3', '−', 'MR'],
  ['0', '.', 'π', '+', '='],
]

const KEY_TYPE = {
  '=': 'equals', 'AC': 'clear', '⌫': 'back',
  '÷': 'op', '×': 'op', '−': 'op', '+': 'op',
  'sin(': 'fn', 'cos(': 'fn', 'tan(': 'fn', 'log(': 'fn', 'ln(': 'fn',
  'sqrt(': 'fn', '^': 'fn', '%': 'fn', '(': 'fn', ')': 'fn',
  'π': 'const', 'MR': 'mem',
}

const KEY_STYLES = {
  equals: { background: 'var(--calc-primary, #7c3aed)', color: '#fff', fontSize: '20px' },
  clear:  { background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
  back:   { background: 'rgba(255,255,255,0.06)', color: '#fbbf24' },
  op:     { background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' },
  fn:     { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', fontSize: '12px' },
  const:  { background: 'rgba(255,255,255,0.04)', color: '#60a5fa' },
  mem:    { background: 'rgba(255,255,255,0.04)', color: '#4ade80' },
  default:{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '18px', fontWeight: '600' },
}

export function CalcKeypad({ onKey, pressedKey }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {KEYPAD_ROWS.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: '6px' }}>
          {row.map(key => {
            const type = KEY_TYPE[key] || 'default'
            const style = { ...KEY_STYLES.default, ...KEY_STYLES[type] }
            const isPressed = pressedKey === key
            return (
              <button
                key={key}
                id={`calc-key-${key.replace(/[^a-zA-Z0-9]/g, '')}`}
                onClick={() => onKey(key)}
                style={{
                  ...style,
                  height: '52px', borderRadius: '10px', border: style.border || '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer', fontFamily: 'var(--calc-font-mono, monospace)',
                  fontSize: style.fontSize || '14px', fontWeight: style.fontWeight || '500',
                  transition: 'all 0.08s',
                  transform: isPressed ? 'scale(0.94)' : 'scale(1)',
                  opacity: isPressed ? 0.7 : 1,
                  boxShadow: type === 'equals' ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.2)'; e.currentTarget.style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                {key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── CalcMemory ───────────────────────────────────────────────────────────────

export function CalcMemory({ memory, onStore, onRecall, onClear }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
      {[
        { label: 'MS', action: onStore,  tip: 'Memory Store' },
        { label: 'MR', action: onRecall, tip: 'Memory Recall' },
        { label: 'MC', action: onClear,  tip: 'Memory Clear' },
      ].map(({ label, action, tip }) => (
        <button
          key={label}
          id={`calc-mem-${label.toLowerCase()}`}
          onClick={action}
          title={tip}
          style={{
            flex: 1, padding: '7px', borderRadius: '8px',
            background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
            color: '#4ade80', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            fontFamily: 'var(--calc-font-mono, monospace)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.16)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.08)'}
        >
          {label}
        </button>
      ))}
      {memory !== null && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', borderRadius: '8px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
          <span style={{ fontSize: '11px', color: '#4ade80', fontFamily: 'var(--calc-font-mono, monospace)' }}>M: {memory}</span>
        </div>
      )}
    </div>
  )
}

// ─── Calculator (main) ────────────────────────────────────────────────────────

export function Calculator({
  title = 'Scientific Calculator',
  description = 'Precision computation at your fingertips.',
}) {
  const [expression, setExpression] = useState('')
  const [result, setResult]         = useState('')
  const [angleMode, setAngleMode]   = useState('DEG')
  const [memory, setMemory]         = useState(null)
  const [pressedKey, setPressedKey] = useState(null)
  const containerRef = useRef(null)

  // Live result as user types
  useEffect(() => {
    if (!expression) { setResult(''); return }
    const r = safeEval(expression)
    if (r !== 'Error') setResult('= ' + r)
    else setResult('')
  }, [expression])

  const handleKey = useCallback((key) => {
    // Flash animation
    setPressedKey(key)
    setTimeout(() => setPressedKey(null), 120)

    if (key === 'AC') { setExpression(''); setResult(''); return }
    if (key === '⌫') { setExpression(e => e.slice(0, -1)); return }
    if (key === '=') {
      const r = safeEval(expression)
      if (r !== 'Error') { setExpression(r); setResult('') }
      else setResult('Error')
      return
    }
    if (key === '÷') { setExpression(e => e + '/'); return }
    if (key === '×') { setExpression(e => e + '*'); return }
    if (key === '−') { setExpression(e => e + '-'); return }
    if (key === 'MR') {
      if (memory !== null) setExpression(e => e + memory)
      return
    }
    setExpression(e => e + key)
  }, [expression, memory])

  // Keyboard support
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Enter') { handleKey('='); return }
      if (e.key === 'Backspace') { handleKey('⌫'); return }
      if (e.key === 'Escape') { handleKey('AC'); return }
      if (e.key === '/' && !e.ctrlKey) { e.preventDefault(); handleKey('÷'); return }
      if (e.key === '*') { handleKey('×'); return }
      if ('0123456789.+-%()^'.includes(e.key)) { handleKey(e.key); return }
      if (e.key === 'p' || e.key === 'P') { handleKey('π'); return }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey])

  function toggleAngleMode() {
    setAngleMode(m => m === 'DEG' ? 'RAD' : 'DEG')
  }

  const currentResult = safeEval(expression)

  return (
    <div ref={containerRef} style={{
      maxWidth: '400px', margin: '0 auto', padding: '24px',
      background: 'var(--calc-bg, #0d0d18)', borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      fontFamily: 'var(--calc-font, Inter, system-ui, sans-serif)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: '0 0 4px', letterSpacing: '-0.2px' }}>
          <span style={{ color: 'var(--calc-primary, #7c3aed)' }}>✦</span> {title}
        </h1>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{description}</p>
      </div>

      {/* Display */}
      <CalcDisplay
        expression={expression}
        result={result || (currentResult !== 'Error' && expression ? '= ' + currentResult : '')}
        angleMode={angleMode}
        onAngleModeToggle={toggleAngleMode}
      />

      {/* Memory bar */}
      <CalcMemory
        memory={memory}
        onStore={() => { if (currentResult !== 'Error' && expression) setMemory(currentResult) }}
        onRecall={() => { if (memory !== null) setExpression(e => e + memory) }}
        onClear={() => setMemory(null)}
      />

      {/* Keypad */}
      <CalcKeypad onKey={handleKey} pressedKey={pressedKey} />

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.15)', marginTop: '16px', marginBottom: 0 }}>
        Keyboard supported · Press Enter to evaluate
      </p>
    </div>
  )
}
