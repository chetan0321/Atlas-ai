'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
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
          Welcome back
        </h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>
          Sign in to your Atlas.AI account
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

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '5px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="you@example.com"
            style={{
              width: '100%', padding: '10px 14px', fontSize: '14px',
              border: '1px solid #ddd', borderRadius: '8px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '5px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '10px 14px', fontSize: '14px',
              border: '1px solid #ddd', borderRadius: '8px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', background: loading ? '#888' : '#000',
            color: '#fff', border: 'none', padding: '12px',
            fontSize: '15px', fontWeight: '500', borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px'
          }}
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
          No account?{' '}
          <Link href="/signup" style={{ color: '#000', fontWeight: '500' }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}