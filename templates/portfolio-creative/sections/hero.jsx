/**
 * portfolio-creative / sections / hero.jsx
 *
 * Exports: PortfolioNav, HeroSection, SkillsGrid, AboutSection
 *
 * TEMPLATE RULES (for AI customization):
 * - Change name, title, bio, skills to match the person
 * - Change brand colors via --port-primary, --port-accent CSS vars
 * - Keep ALL exported names and prop signatures identical
 * - Do NOT remove the scroll-based animation logic
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ─── PortfolioNav ─────────────────────────────────────────────────────────────

export function PortfolioNav({
  name = 'Alex Chen',
  links = [
    { href: '#work', label: 'Work' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ],
  resumeHref = '/resume.pdf',
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 32px', height: '58px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(8,8,15,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <Link href="/" style={{ fontSize: '16px', fontWeight: '800', color: '#fff', textDecoration: 'none', letterSpacing: '-0.2px' }}>
        {name.split(' ')[0]}<span style={{ color: 'var(--port-primary, #06b6d4)' }}>.</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.15s', fontWeight: '500' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
          >{l.label}</Link>
        ))}
        <a href={resumeHref} download style={{
          background: 'transparent', color: 'var(--port-primary, #06b6d4)',
          border: '1px solid var(--port-primary, #06b6d4)',
          padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
          textDecoration: 'none', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--port-primary, #06b6d4)'; e.currentTarget.style.color = '#000' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--port-primary, #06b6d4)' }}
        >Resume ↓</a>
      </div>
    </nav>
  )
}

// ─── HeroSection ─────────────────────────────────────────────────────────────

export function HeroSection({
  greeting = 'Hello, I\'m',
  name = 'Alex Chen',
  title = 'Product Designer & Frontend Developer',
  bio = 'I craft digital experiences that sit at the intersection of design and engineering. 5+ years helping startups and enterprises ship products people love.',
  primaryCta = { text: 'View my work', href: '#work' },
  secondaryCta = { text: 'Get in touch', href: '#contact' },
  socials = [
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Twitter', href: 'https://twitter.com' },
    { label: 'Dribbble', href: 'https://dribbble.com' },
  ],
  availableForWork = true,
}) {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '80px 32px 40px',
      maxWidth: '900px', margin: '0 auto',
    }}>
      {/* Available badge */}
      {availableForWork && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          marginBottom: '32px', animation: 'port-fade 0.5s ease both',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'port-pulse 2s infinite' }} />
          <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: '600' }}>Available for new projects</span>
        </div>
      )}

      {/* Greeting */}
      <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', animation: 'port-fade 0.5s 0.05s ease both', opacity: 0 }}>
        {greeting}
      </p>

      {/* Name */}
      <h1 style={{
        fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: '900', lineHeight: '1.0',
        letterSpacing: '-3px', color: '#fff', margin: '0 0 16px',
        animation: 'port-fade 0.5s 0.1s ease both', opacity: 0,
      }}>
        {name}
        <span style={{ color: 'var(--port-primary, #06b6d4)' }}>.</span>
      </h1>

      {/* Title */}
      <h2 style={{
        fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: '500',
        color: 'rgba(255,255,255,0.5)', marginBottom: '24px',
        letterSpacing: '-0.3px', animation: 'port-fade 0.5s 0.15s ease both', opacity: 0,
      }}>
        {title}
      </h2>

      {/* Bio */}
      <p style={{
        fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '560px',
        lineHeight: '1.8', marginBottom: '40px',
        animation: 'port-fade 0.5s 0.2s ease both', opacity: 0,
      }}>{bio}</p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', animation: 'port-fade 0.5s 0.25s ease both', opacity: 0, marginBottom: '48px' }}>
        <Link href={primaryCta.href} id="portfolio-hero-cta" style={{
          background: 'var(--port-primary, #06b6d4)', color: '#000',
          padding: '13px 28px', borderRadius: '10px', textDecoration: 'none',
          fontSize: '14px', fontWeight: '800', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,182,212,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
        >{primaryCta.text} →</Link>
        <Link href={secondaryCta.href} style={{
          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
          padding: '13px 24px', borderRadius: '10px', textDecoration: 'none',
          fontSize: '14px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
        >{secondaryCta.text}</Link>
      </div>

      {/* Socials */}
      <div style={{ display: 'flex', gap: '20px', animation: 'port-fade 0.5s 0.3s ease both', opacity: 0 }}>
        {socials.map(s => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.15s', fontWeight: '500' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--port-primary, #06b6d4)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >{s.label}</a>
        ))}
      </div>

      <style>{`
        @keyframes port-fade { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes port-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </section>
  )
}

// ─── SkillsGrid ───────────────────────────────────────────────────────────────

const DEFAULT_SKILLS = [
  { category: 'Design', skills: ['Figma', 'Framer', 'Principle', 'Adobe XD', 'Spline'] },
  { category: 'Frontend', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP'] },
  { category: 'Backend', skills: ['Node.js', 'Python', 'PostgreSQL', 'Supabase', 'Redis'] },
  { category: 'Tools', skills: ['Git', 'Docker', 'Figma', 'Linear', 'Vercel'] },
]

export function SkillsGrid({ heading = 'Skills & Tools', skills = DEFAULT_SKILLS }) {
  return (
    <section id="skills" style={{ padding: '80px 32px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', color: '#fff', marginBottom: '40px', letterSpacing: '-1px' }}>{heading}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        {skills.map(cat => (
          <div key={cat.category}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--port-primary, #06b6d4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>{cat.category}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cat.skills.map(skill => (
                <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--port-primary, #06b6d4)', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', fontWeight: '500' }}>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── AboutSection ─────────────────────────────────────────────────────────────

export function AboutSection({
  heading = 'About Me',
  paragraphs = [
    'I\'m a product designer and developer who loves bridging the gap between design and code. I believe great software is both beautiful and functional.',
    'When I\'m not pushing pixels or writing code, you\'ll find me hiking mountain trails, reading about cognitive psychology, or experimenting with generative art.',
  ],
  stats = [
    { value: '5+', label: 'Years experience' },
    { value: '40+', label: 'Projects shipped' },
    { value: '20+', label: 'Happy clients' },
    { value: '12', label: 'Open source repos' },
  ],
}) {
  return (
    <section id="about" style={{ padding: '80px 32px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', color: '#fff', marginBottom: '32px', letterSpacing: '-1px' }}>{heading}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
        <div>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', marginBottom: '16px' }}>{p}</p>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', letterSpacing: '-1px', marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: '500' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
