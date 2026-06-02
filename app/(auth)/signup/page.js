'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup() {
    if (!email || !password || !name) {
      setError('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
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
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account then sign in.
          </p>
          <Link href="/login" style={{
            display: 'inline-block', marginTop: '20px',
            color: '#000', fontWeight: '500', fontSize: '14px'
          }}>
            Go to login →
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
          Create your account
        </h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>
          Start building with Atlas.AI — free forever.
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
            Full name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            style={{
              width: '100%', padding: '10px 14px', fontSize: '14px',
              border: '1px solid #ddd', borderRadius: '8px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '5px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            onKeyDown={e => e.key === 'Enter' && handleSignup()}
            placeholder="Min. 6 characters"
            style={{
              width: '100%', padding: '10px 14px', fontSize: '14px',
              border: '1px solid #ddd', borderRadius: '8px',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: '100%', background: loading ? '#888' : '#000',
            color: '#fff', border: 'none', padding: '12px',
            fontSize: '15px', fontWeight: '500', borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px'
          }}
        >
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#000', fontWeight: '500' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}