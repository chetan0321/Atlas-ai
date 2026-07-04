'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AtlasLogo from '@/components/AtlasLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleReset() {
    if (!email) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSent(true)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a14', padding: '20px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '500px', pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(100,40,220,0.28) 0%, transparent 65%)'
      }} />

      <div style={{
        background: '#18181f', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '18px', padding: '40px 36px', width: '100%', maxWidth: '400px',
        position: 'relative', zIndex: 1
      }}>
        {/* Shared logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <AtlasLogo size={24} textSize={17} />
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Check your email</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: '1.6' }}>
              Reset link sent to <strong style={{ color: '#fff' }}>{email}</strong>
            </p>
            <Link href="/login" style={{ display: 'inline-block', marginTop: '20px', color: '#818cf8', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
              ← Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '30px', fontWeight: '700', textAlign: 'center', marginBottom: '6px', color: '#fff' }}>
              Reset your password
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center', marginBottom: '28px' }}>
              Enter your email and we'll send you a reset link
            </p>

            {error && (
              <div style={{
                background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
                borderRadius: '8px', padding: '10px 14px', color: '#fca5a5',
                fontSize: '13px', marginBottom: '16px'
              }}>{error}</div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
                placeholder="example@email.com"
                style={{
                  width: '100%', padding: '11px 14px', fontSize: '14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(139,92,246,0.5)',
                  borderRadius: '8px', outline: 'none', color: '#fff', boxSizing: 'border-box',
                  transition: 'border-color 0.15s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.8)'}
                onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'}
              />
            </div>

            <button onClick={handleReset} disabled={loading} style={{
              width: '100%', background: '#fff', color: '#000', border: 'none', padding: '12px',
              fontSize: '15px', fontWeight: '700', borderRadius: '9px',
              cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '18px', opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Sending…' : 'Send reset link →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
              <Link href="/login" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
                ← Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}