'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleUpdate() {
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 1500)
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
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
              Password updated!
            </h2>
            <p style={{ color: '#666', fontSize: '14px' }}>Redirecting you to your dashboard...</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>
              Set a new password
            </h1>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>
              Choose a strong password for your account.
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
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUpdate()}
                placeholder="Min. 6 characters"
                style={{
                  width: '100%', padding: '10px 14px', fontSize: '14px',
                  border: '1px solid #ddd', borderRadius: '8px',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              onClick={handleUpdate}
              disabled={loading}
              style={{
                width: '100%', background: loading ? '#888' : '#000',
                color: '#fff', border: 'none', padding: '12px',
                fontSize: '15px', fontWeight: '500', borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Updating...' : 'Update Password →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
