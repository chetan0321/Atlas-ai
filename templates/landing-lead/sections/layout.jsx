/**
 * landing-lead / sections / layout.jsx
 *
 * Exports: Navbar, HeroSection, Footer
 *
 * TEMPLATE RULES (for AI customization):
 * - Change copy (headlines, CTAs, nav links) to match the brand
 * - Apply brand colors via CSS variables: --brand-primary, --brand-secondary, --brand-bg
 * - Preserve ALL component exports and their prop signatures
 * - Do NOT remove the newsletter form from Footer — it drives conversions
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Navbar ──────────────────────────────────────────────────────────────────

export function Navbar({ brandName = 'YourBrand', links = [], ctaText = 'Get Started', ctaHref = '#signup' }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '32px' }}>
        {/* Logo */}
        <Link href="/" style={{ fontSize: '18px', fontWeight: '800', color: '#fff', textDecoration: 'none', letterSpacing: '-0.3px' }}>
          <span style={{ color: 'var(--brand-primary, #7c3aed)' }}>✦</span> {brandName}
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: '28px', flex: 1 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >{l.label}</Link>
          ))}
        </div>

        {/* CTA */}
        <Link href={ctaHref} style={{
          background: 'var(--brand-primary, #7c3aed)', color: '#fff',
          padding: '8px 20px', borderRadius: '8px', fontSize: '13px',
          fontWeight: '700', textDecoration: 'none', transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >{ctaText}</Link>
      </div>
    </nav>
  )
}

// ─── HeroSection ─────────────────────────────────────────────────────────────

export function HeroSection({
  badge = 'Now in Beta',
  headline = 'Build Something People Want',
  subheadline = 'The fastest way to go from idea to launched product. Join thousands of teams already building with us.',
  primaryCta = { text: 'Start for free', href: '#signup' },
  secondaryCta = { text: 'See how it works', href: '#features' },
  socialProof = '2,400+ teams already building',
}) {
  return (
    <section style={{
      minHeight: '88vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '80px 24px 60px',
      background: 'radial-gradient(ellipse 80% 50% at 50% -10%, var(--brand-bg-glow, rgba(124,58,237,0.18)), transparent)',
    }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
        padding: '5px 14px', borderRadius: '999px', marginBottom: '28px',
        fontSize: '12px', fontWeight: '600', color: 'var(--brand-primary, #a78bfa)',
        animation: 'hero-fadein 0.6s ease both',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary, #7c3aed)', display: 'inline-block' }} />
        {badge}
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: '900', lineHeight: '1.08',
        letterSpacing: '-2px', color: '#fff', maxWidth: '760px',
        margin: '0 0 20px', animation: 'hero-fadein 0.6s 0.1s ease both', opacity: 0,
      }}>
        {headline.split(' ').map((word, i) =>
          i === Math.floor(headline.split(' ').length / 2) - 1
            ? <span key={i} style={{ color: 'var(--brand-primary, #a78bfa)' }}>{word} </span>
            : <span key={i}>{word} </span>
        )}
      </h1>

      {/* Subheadline */}
      <p style={{
        fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(255,255,255,0.5)',
        maxWidth: '540px', lineHeight: '1.7', margin: '0 0 40px',
        animation: 'hero-fadein 0.6s 0.2s ease both', opacity: 0,
      }}>{subheadline}</p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', animation: 'hero-fadein 0.6s 0.3s ease both', opacity: 0 }}>
        <Link href={primaryCta.href} id="hero-primary-cta" style={{
          background: 'var(--brand-primary, #7c3aed)', color: '#fff', textDecoration: 'none',
          padding: '14px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: '700',
          boxShadow: '0 4px 24px var(--brand-shadow, rgba(124,58,237,0.4))',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px var(--brand-shadow, rgba(124,58,237,0.5))' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px var(--brand-shadow, rgba(124,58,237,0.4))' }}
        >{primaryCta.text} →</Link>

        <Link href={secondaryCta.href} style={{
          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)',
          textDecoration: 'none', padding: '14px 28px', borderRadius: '10px',
          fontSize: '15px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)',
          transition: 'background 0.15s, color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
        >{secondaryCta.text}</Link>
      </div>

      {/* Social proof */}
      <p style={{ marginTop: '32px', fontSize: '13px', color: 'rgba(255,255,255,0.3)', animation: 'hero-fadein 0.6s 0.4s ease both', opacity: 0 }}>
        {socialProof}
      </p>

      <style>{`
        @keyframes hero-fadein { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

export function Footer({ brandName = 'YourBrand', tagline = 'Built for builders.', links = [], year = new Date().getFullYear() }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleNewsletter(e) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#080810', padding: '60px 24px 32px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px', marginBottom: '48px' }}>
          {/* Brand column */}
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
              <span style={{ color: 'var(--brand-primary, #7c3aed)' }}>✦</span> {brandName}
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.7', maxWidth: '240px' }}>{tagline}</p>
          </div>

          {/* Link columns */}
          {links.map(col => (
            <div key={col.heading}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>{col.heading}</div>
              {col.items.map(item => (
                <Link key={item.href} href={item.href} style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >{item.label}</Link>
              ))}
            </div>
          ))}

          {/* Newsletter — DO NOT REMOVE */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Stay Updated</div>
            {submitted ? (
              <p style={{ fontSize: '13px', color: '#4ade80' }}>✓ You&apos;re on the list!</p>
            ) : (
              <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: '8px' }}>
                <input
                  id="footer-newsletter-email"
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '9px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
                <button type="submit" style={{ background: 'var(--brand-primary, #7c3aed)', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  →
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>© {year} {brandName}. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy', 'Terms', 'Cookies'].map(label => (
              <Link key={label} href={`/${label.toLowerCase()}`} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
              >{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
