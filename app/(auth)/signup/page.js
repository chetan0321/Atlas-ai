'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AtlasLogo from '@/components/AtlasLogo'

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()

  async function handleSignup() {
    if (!name || !email || !password) { setError('Please fill in all fields'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', fontSize: '14px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', outline: 'none', color: '#fff', boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s'
  }
  const wrapStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#0a0a14', padding: '20px', position: 'relative', overflow: 'hidden'
  }
  const glowStyle = {
    position: 'fixed', top: '5%', left: '50%',
    width: '700px', height: '500px', pointerEvents: 'none',
    background: 'radial-gradient(ellipse at 50% 40%, rgba(100,40,220,0.32) 0%, transparent 65%)',
    animation: 'auth-glow-pulse 4s ease-in-out infinite'
  }
  const cardStyle = {
    background: '#18181f', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '18px', padding: '40px 36px', width: '100%', maxWidth: '400px',
    position: 'relative', zIndex: 1,
    animation: 'auth-card-in 0.4s cubic-bezier(0.4,0,0.2,1) both'
  }
  const animCSS = `
    @keyframes auth-glow-pulse { 0%,100% { opacity:0.55; transform:translateX(-50%) scale(1); } 50% { opacity:0.85; transform:translateX(-50%) scale(1.08); } }
    @keyframes auth-card-in    { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes auth-spin       { to { transform: rotate(360deg); } }
    .auth-input:focus { border-color: rgba(139,92,246,0.65) !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.12) !important; outline: none !important; }
    .auth-btn-primary { transition: all 0.15s !important; }
    .auth-btn-primary:not(:disabled):hover { transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.4) !important; }
    .auth-btn-primary:not(:disabled):active { transform: scale(0.97) !important; }
    .auth-btn-social { transition: all 0.15s !important; }
    .auth-btn-social:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.25) !important; transform: translateY(-1px) !important; }
  `

  if (done) return (
    <div style={wrapStyle}>
      <style>{animCSS}</style>
      <div style={glowStyle} />
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <AtlasLogo size={24} textSize={17} />
        </div>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Check your email</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: '1.6' }}>
          We sent a confirmation link to <strong style={{ color: '#fff' }}>{email}</strong>
        </p>
        <Link href="/login" style={{ display: 'inline-block', marginTop: '20px', color: '#818cf8', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
          ← Back to login
        </Link>
      </div>
    </div>
  )

  return (
    <div style={wrapStyle}>
      <style>{animCSS}</style>
      <div style={glowStyle} />
      <div style={cardStyle}>
        {/* Shared logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <AtlasLogo size={24} textSize={17} />
        </div>

        <h1 style={{ fontSize: '30px', fontWeight: '700', textAlign: 'center', marginBottom: '6px', color: '#fff' }}>
          Create your account
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center', marginBottom: '28px' }}>
          Start building with Atlas.AI — free forever
        </p>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: '8px', padding: '10px 14px', color: '#fca5a5',
            fontSize: '13px', marginBottom: '16px'
          }}>{error}</div>
        )}

        {[
          { label: 'Full name', value: name, setter: setName, type: 'text', placeholder: 'e.g., Jane Doe' },
          { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'name@company.com' },
          { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '••••••••', hint: 'Must be at least 8 characters' }
        ].map(f => (
          <div key={f.label} style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: '6px' }}>{f.label}</label>
            <input className="auth-input" type={f.type} value={f.value}
              onChange={e => f.setter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSignup()}
              placeholder={f.placeholder} style={inputStyle}
            />
            {f.hint && <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', marginTop: '4px' }}>{f.hint}</p>}
          </div>
        ))}

        <button onClick={handleSignup} disabled={loading} className="auth-btn-primary" style={{
          width: '100%', background: loading ? 'rgba(255,255,255,0.2)' : '#fff',
          color: '#000', border: 'none', padding: '12px', fontSize: '15px', fontWeight: '700',
          borderRadius: '9px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '20px', marginTop: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          {loading && <svg style={{ animation: 'auth-spin 0.8s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg>}
          {loading ? 'Creating account…' : 'Create account →'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>or sign up with</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '22px' }}>
          {[
            { label: 'Google', icon: <GoogleIcon />, provider: 'google' },
            { label: 'GitHub', icon: <GitHubIcon />, provider: 'github' }
          ].map(p => (
            <button key={p.provider} className="auth-btn-social" onClick={async () => {
              await supabase.auth.signInWithOAuth({ provider: p.provider, options: { redirectTo: `${window.location.origin}/auth/callback` } })
            }} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}