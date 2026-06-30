'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleReset() {
    if (!email) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#fafafa', padding: '20px'
      }}>
        <div style={{
          background: '#fff', border: '1px solid #eee', borderRadius: '16px',
          padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
            Check your email
          </h2>
          <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
            We sent a password reset link to <strong>{email}</strong>.
          </p>
          <Link href="/login" style={{
            display: 'inline-block', marginTop: '20px',
            color: '#000', fontWeight: '500', fontSize: '14px'
          }}>
            ← Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#fafafa', padding: '20px'
    }}>
      <div style={{
        background: '#fff', border: '1px solid #eee', borderRadius: '16px',
        padding: '40px', width: '100%', maxWidth: '400px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>
          Reset your password
        </h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {error && (
          <div style={{
            background: '#fff5f5', border: '1px solid #fecaca',
            borderRadius: '8px', padding: '10px 14px',
            color: '#dc2626', fontSize: '13px', marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '5px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleReset()}
            placeholder="you@example.com"
            style={{
              width: '100%', padding: '10px 14px', fontSize: '14px',
              border: '1px solid #ddd', borderRadius: '8px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          style={{
            width: '100%', background: loading ? '#888' : '#000',
            color: '#fff', border: 'none', padding: '12px',
            fontSize: '15px', fontWeight: '500', borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px'
          }}
        >
          {loading ? 'Sending...' : 'Send Reset Link →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
          <Link href="/login" style={{ color: '#000', fontWeight: '500' }}>
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
