/**
 * portfolio-creative / sections / contact.jsx
 *
 * Exports: ContactSection
 *
 * TEMPLATE RULES (for AI customization):
 * - Change contact form endpoint and social links
 * - Change the email address and preferred contact method
 * - Keep ALL exported names and prop signatures identical
 * - Do NOT remove validation logic
 */
'use client'

import { useState } from 'react'

export function ContactSection({
  heading = 'Let\'s Work Together',
  subheading = 'I\'m always open to new projects, collaborations, and exciting opportunities.',
  email = 'hello@alexchen.design',
  socials = [
    { label: 'GitHub', href: 'https://github.com', icon: '⌥' },
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'in' },
    { label: 'Twitter', href: 'https://twitter.com', icon: '𝕏' },
    { label: 'Dribbble', href: 'https://dribbble.com', icon: '⊙' },
  ],
  apiEndpoint = '/api/contact',
}) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name required'
    if (!form.email.trim()) errs.email = 'Email required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (!form.message.trim()) errs.message = 'Message required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await fetch(apiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setSubmitted(true)
    } catch { setErrors({ submit: 'Something went wrong. Please try again.' }) }
    finally { setLoading(false) }
  }

  const inputStyle = (err) => ({
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${err ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '10px', padding: '13px 16px', color: '#fff',
    fontSize: '14px', outline: 'none', transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  })

  return (
    <section id="contact" style={{ padding: '80px 32px 120px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>

        {/* Left — info */}
        <div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', color: '#fff', marginBottom: '16px', letterSpacing: '-1px' }}>{heading}</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.75', marginBottom: '36px' }}>{subheading}</p>

          {/* Email */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Email</div>
            <a href={`mailto:${email}`} style={{ fontSize: '16px', color: 'var(--port-primary, #06b6d4)', textDecoration: 'none', fontWeight: '600', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >{email}</a>
          </div>

          {/* Socials */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Find me on</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {socials.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  id={`portfolio-social-${s.label.toLowerCase()}`}
                  style={{
                    width: '42px', height: '42px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
                    transition: 'all 0.15s', background: 'rgba(255,255,255,0.03)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--port-primary, #06b6d4)'; e.currentTarget.style.color = 'var(--port-primary, #06b6d4)'; e.currentTarget.style.background = 'rgba(6,182,212,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  title={s.label}
                >{s.icon}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🙌</div>
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Message sent!</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>I&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form id="portfolio-contact-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <input id="contact-name" type="text" placeholder="Your name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle(errors.name)}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = errors.name ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                />
                {errors.name && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }}>{errors.name}</p>}
              </div>
              <div>
                <input id="contact-email" type="email" placeholder="your@email.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle(errors.email)}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                />
                {errors.email && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }}>{errors.email}</p>}
              </div>
              <div>
                <textarea id="contact-message" placeholder="Tell me about your project…" rows={5} value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ ...inputStyle(errors.message), resize: 'vertical' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = errors.message ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                />
                {errors.message && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }}>{errors.message}</p>}
              </div>
              {errors.submit && <p style={{ fontSize: '13px', color: '#f87171', textAlign: 'center' }}>{errors.submit}</p>}
              <button id="contact-submit" type="submit" disabled={loading} style={{
                background: loading ? 'rgba(6,182,212,0.4)' : 'var(--port-primary, #06b6d4)',
                color: '#000', border: 'none', padding: '13px', borderRadius: '10px',
                fontSize: '14px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {loading ? 'Sending…' : 'Send message →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
