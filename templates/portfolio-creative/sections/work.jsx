/**
 * portfolio-creative / sections / work.jsx
 *
 * Exports: WorkSection, ProjectCard, FeaturedProject
 *
 * TEMPLATE RULES (for AI customization):
 * - Change project titles, descriptions, tags, and links to match actual work
 * - Change featured project details to the most impressive piece of work
 * - Keep ALL exported component names and prop signatures identical
 * - Do NOT remove the hover/animation effects — they're core to the portfolio feel
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── ProjectCard ──────────────────────────────────────────────────────────────

export function ProjectCard({
  title = 'Project Title',
  description = 'A short description of the project, what it does, and the impact it had.',
  tags = ['React', 'Figma', 'TypeScript'],
  href = '#',
  year = '2024',
  index = 0,
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div id={`project-card-${index}`} style={{
        padding: '28px', borderRadius: '14px',
        background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all 0.2s', cursor: 'pointer',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}>
        {/* Year + arrow */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: '600', letterSpacing: '0.06em' }}>{year}</span>
          <span style={{ color: hovered ? 'var(--port-primary, #06b6d4)' : 'rgba(255,255,255,0.2)', fontSize: '18px', transition: 'all 0.2s', transform: hovered ? 'translate(3px,-3px)' : 'translate(0,0)' }}>↗</span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '10px', letterSpacing: '-0.3px' }}>{title}</h3>

        {/* Description */}
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.65', marginBottom: '20px' }}>{description}</p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px',
              background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
              color: 'rgba(6,182,212,0.8)',
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}

// ─── FeaturedProject ─────────────────────────────────────────────────────────

export function FeaturedProject({
  label = 'Featured Project',
  title = 'Atlas Design System',
  description = 'A comprehensive design system built for scale. 200+ components, 40+ page templates, and a full Figma library that reduced our team\'s design time by 60%.',
  impact = '60% faster design cycle across 12 product teams.',
  tags = ['Figma', 'React', 'Storybook', 'TypeScript'],
  href = '#',
  metrics = [
    { value: '200+', label: 'Components' },
    { value: '12', label: 'Teams using it' },
    { value: '60%', label: 'Faster design' },
  ],
}) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(139,92,246,0.06))',
      border: '1px solid rgba(6,182,212,0.2)', borderRadius: '20px', padding: '40px',
      marginBottom: '20px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--port-primary, #06b6d4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
        ✦ {label}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'start' }}>
        <div>
          <h3 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: '900', color: '#fff', marginBottom: '12px', letterSpacing: '-0.5px' }}>{title}</h3>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.75', marginBottom: '20px', maxWidth: '520px' }}>{description}</p>
          {impact && <p style={{ fontSize: '14px', color: '#4ade80', fontWeight: '600', marginBottom: '24px' }}>✓ {impact}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
            {tags.map(tag => (
              <span key={tag} style={{ fontSize: '12px', fontWeight: '600', padding: '5px 12px', borderRadius: '7px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', color: '#06b6d4' }}>{tag}</span>
            ))}
          </div>
          <a href={href} target="_blank" rel="noreferrer" id="featured-project-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--port-primary, #06b6d4)', fontSize: '14px', fontWeight: '700', textDecoration: 'none', transition: 'gap 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.gap = '12px'}
            onMouseLeave={e => e.currentTarget.style.gap = '8px'}
          >View case study ↗</a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {metrics.map(m => (
            <div key={m.label} style={{ textAlign: 'center', padding: '16px 24px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', minWidth: '100px' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-1px' }}>{m.value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: '500', marginTop: '2px' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── WorkSection ─────────────────────────────────────────────────────────────

const DEFAULT_PROJECTS = [
  { title: 'Fintech Dashboard', description: 'Real-time analytics platform for a fintech startup. Reduced time-to-insight from 3 days to 15 minutes.', tags: ['React', 'D3.js', 'Node.js'], href: '#', year: '2024' },
  { title: 'E-commerce Redesign', description: 'Full redesign of a $5M ARR e-commerce store. Improved conversion rate by 34% in 3 months post-launch.', tags: ['Figma', 'Next.js', 'Shopify'], href: '#', year: '2024' },
  { title: 'Mobile App — TrailFinder', description: 'GPS hiking app for iOS and Android. 50K downloads in first month, 4.8 App Store rating.', tags: ['React Native', 'Mapbox', 'Swift'], href: '#', year: '2023' },
  { title: 'SaaS Onboarding Flow', description: 'Redesigned onboarding for a B2B SaaS. Increased trial-to-paid conversion by 22%.', tags: ['Figma', 'Framer', 'Analytics'], href: '#', year: '2023' },
]

export function WorkSection({
  heading = 'Selected Work',
  subheading = 'A few projects I\'m proud of.',
  featuredProject = null,
  projects = DEFAULT_PROJECTS,
}) {
  const [filter, setFilter] = useState('All')
  const allTags = ['All', ...new Set(projects.flatMap(p => p.tags).slice(0, 6))]
  const filtered = filter === 'All' ? projects : projects.filter(p => p.tags.includes(filter))

  return (
    <section id="work" style={{ padding: '80px 32px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-1px' }}>{heading}</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{subheading}</p>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setFilter(tag)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
              border: '1px solid',
              background: filter === tag ? 'var(--port-primary, #06b6d4)' : 'transparent',
              borderColor: filter === tag ? 'var(--port-primary, #06b6d4)' : 'rgba(255,255,255,0.12)',
              color: filter === tag ? '#000' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{tag}</button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featuredProject && <FeaturedProject {...featuredProject} />}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {filtered.map((p, i) => <ProjectCard key={i} {...p} index={i} />)}
      </div>
    </section>
  )
}
