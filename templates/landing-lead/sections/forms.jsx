/**
 * landing-lead / sections / forms.jsx
 *
 * Exports: LeadCaptureForm, CTASection, ContactForm
 *
 * TEMPLATE RULES (for AI customization):
 * - Change form heading, field labels, and button text to match the brand
 * - Change CTA background image or gradient to match brand colors
 * - Preserve ALL validation logic (required fields, email format check)
 * - Do NOT remove the success state — it's critical for user feedback
 * - Do NOT change the form submission pattern (prevent default + state update)
 */
'use client'

import { useState } from 'react'

// ─── LeadCaptureForm ──────────────────────────────────────────────────────────

export function LeadCaptureForm({
  heading = 'Start building today',
  subheading = 'Join 2,400+ teams already on the platform. No credit card required.',
  ctaText = 'Get early access →',
  placeholderEmail = 'you@company.com',
  placeholderName = 'Your name',
  successMessage = "You're on the list! We'll be in touch soon.",
  apiEndpoint = '/api/leads',
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function validate() {
    const errs = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setErrors({})
    setLoading(true)
    try {
      await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      setSubmitted(true)
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section id="signup" style={{ padding: '80px 24px', background: '#0a0a12' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 20px' }}>✓</div>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>You&apos;re in!</h3>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.65' }}>{successMessage}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="signup" style={{ padding: '80px 24px', background: '#0a0a12' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '800', color: '#fff', marginBottom: '12px', letterSpacing: '-0.5px' }}>{heading}</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.65' }}>{subheading}</p>
        </div>

        <form id="lead-capture-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name field */}
          <div>
            <input
              id="lead-name"
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={placeholderName}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.name ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '10px', padding: '13px 16px', color: '#fff', fontSize: '15px',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)'}
              onBlur={e => e.currentTarget.style.borderColor = errors.name ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}
            />
            {errors.name && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }}>{errors.name}</p>}
          </div>

          {/* Email field */}
          <div>
            <input
              id="lead-email"
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={placeholderEmail}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.email ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '10px', padding: '13px 16px', color: '#fff', fontSize: '15px',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)'}
              onBlur={e => e.currentTarget.style.borderColor = errors.email ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}
            />
            {errors.email && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }}>{errors.email}</p>}
          </div>

          {errors.submit && (
            <p style={{ fontSize: '13px', color: '#f87171', textAlign: 'center' }}>{errors.submit}</p>
          )}

          <button
            id="lead-submit-btn"
            type="submit" disabled={loading}
            style={{
              background: loading ? 'rgba(124,58,237,0.5)' : 'var(--brand-primary, #7c3aed)',
              color: '#fff', border: 'none', padding: '14px',
              borderRadius: '10px', fontSize: '15px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {loading ? 'Submitting…' : ctaText}
          </button>
        </form>
      </div>
    </section>
  )
}

// ─── CTASection ───────────────────────────────────────────────────────────────

export function CTASection({
  heading = 'Ready to build something great?',
  subheading = 'Start free today. No credit card required.',
  primaryCta = { text: 'Get started →', href: '#signup' },
  secondaryCta = { text: 'Talk to sales', href: '#contact' },
}) {
  return (
    <section style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '20px', padding: '64px 40px' }}>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: '800', color: '#fff', marginBottom: '14px', letterSpacing: '-1px' }}>{heading}</h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '36px', lineHeight: '1.65' }}>{subheading}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={primaryCta.href} id="cta-primary" style={{
            background: 'var(--brand-primary, #7c3aed)', color: '#fff', textDecoration: 'none',
            padding: '13px 30px', borderRadius: '10px', fontSize: '15px', fontWeight: '700',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)', transition: 'transform 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >{primaryCta.text}</a>
          <a href={secondaryCta.href} id="cta-secondary" style={{
            color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
            padding: '13px 24px', fontSize: '15px', fontWeight: '600',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
          >{secondaryCta.text}</a>
        </div>
      </div>
    </section>
  )
}

// ─── ContactForm ──────────────────────────────────────────────────────────────

export function ContactForm({
  heading = 'Get in touch',
  subheading = "We'd love to hear from you. We'll get back within 24 hours.",
  apiEndpoint = '/api/contact',
}) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.message.trim()) errs.message = 'Message is required'
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
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = (err) => ({
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)', border: `1px solid ${err ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '10px', padding: '13px 16px', color: '#fff', fontSize: '14px', outline: 'none',
  })

  if (submitted) return (
    <section id="contact" style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '16px' }}>✉️</div>
        <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Message sent!</h3>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>We&apos;ll get back to you within 24 hours.</p>
      </div>
    </section>
  )

  return (
    <section id="contact" style={{ padding: '80px 24px', background: '#0a0a12' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '10px', letterSpacing: '-0.5px' }}>{heading}</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>{subheading}</p>
        </div>
        <form id="contact-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <input id="contact-name" type="text" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={fieldStyle(errors.name)} />
            {errors.name && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }}>{errors.name}</p>}
          </div>
          <div>
            <input id="contact-email" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={fieldStyle(errors.email)} />
            {errors.email && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }}>{errors.email}</p>}
          </div>
          <div>
            <textarea id="contact-message" placeholder="How can we help?" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} style={{ ...fieldStyle(errors.message), resize: 'vertical' }} />
            {errors.message && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '5px' }}>{errors.message}</p>}
          </div>
          {errors.submit && <p style={{ fontSize: '13px', color: '#f87171', textAlign: 'center' }}>{errors.submit}</p>}
          <button id="contact-submit" type="submit" disabled={loading} style={{ background: loading ? 'rgba(124,58,237,0.5)' : 'var(--brand-primary, #7c3aed)', color: '#fff', border: 'none', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Sending…' : 'Send message →'}
          </button>
        </form>
      </div>
    </section>
  )
}
