/**
 * landing-lead / sections / features.jsx
 *
 * Exports: FeatureGrid, PricingTable, TestimonialBlock, FAQSection
 *
 * TEMPLATE RULES (for AI customization):
 * - Change feature icons, titles, descriptions to match the product
 * - Change pricing tier names, prices, and feature lists
 * - Change testimonial quotes and names
 * - Preserve ALL component exports and their prop signatures
 * - Do NOT change the pricing tier structure (3 tiers: free/pro/enterprise)
 */
'use client'

import { useState } from 'react'

// ─── FeatureGrid ─────────────────────────────────────────────────────────────

export function FeatureGrid({
  heading = 'Everything you need to ship faster',
  subheading = 'Built for developers who care about quality and speed.',
  features = [
    { icon: '⚡', title: 'Lightning Fast', description: 'Optimized from the ground up. Your users get sub-second response times, always.' },
    { icon: '🔒', title: 'Secure by Default', description: 'Auth, RLS, and encryption baked in. Sleep well knowing your data is protected.' },
    { icon: '📊', title: 'Real-time Analytics', description: 'See exactly how users interact with your product as it happens.' },
    { icon: '🔧', title: 'Fully Customizable', description: 'Every component, every style, every flow — yours to own and extend.' },
    { icon: '🚀', title: 'One-click Deploy', description: 'From code to production in seconds. No DevOps degree required.' },
    { icon: '🤝', title: 'Team Collaboration', description: 'Invite your whole team. Built-in roles, permissions, and audit logs.' },
  ]
}) {
  return (
    <section id="features" style={{ padding: '96px 24px', background: '#0a0a12' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#fff', marginBottom: '14px', letterSpacing: '-1px' }}>{heading}</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>{subheading}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <div key={i} id={`feature-card-${i}`} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '28px',
              transition: 'border-color 0.2s, background 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'; e.currentTarget.style.background = 'rgba(124,58,237,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
            >
              <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.65' }}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── PricingTable ─────────────────────────────────────────────────────────────

const DEFAULT_TIERS = [
  {
    name: 'Free', price: '$0', period: '/month', badge: null,
    description: 'Perfect for side projects and indie hackers.',
    cta: { text: 'Get started free', href: '#signup' }, highlighted: false,
    features: ['Up to 3 projects', '1,000 API calls/month', 'Community support', 'Basic analytics'],
    notIncluded: ['Custom domain', 'Team members', 'Priority support'],
  },
  {
    name: 'Pro', price: '$29', period: '/month', badge: 'Most Popular',
    description: 'For teams shipping serious products.',
    cta: { text: 'Start free trial', href: '#signup' }, highlighted: true,
    features: ['Unlimited projects', '100K API calls/month', 'Priority support', 'Advanced analytics', 'Custom domain', 'Up to 10 team members'],
    notIncluded: ['SSO / SAML', 'SLA guarantee'],
  },
  {
    name: 'Enterprise', price: 'Custom', period: '', badge: null,
    description: 'For large teams with custom requirements.',
    cta: { text: 'Talk to sales', href: '#contact' }, highlighted: false,
    features: ['Everything in Pro', 'Unlimited team members', 'SSO / SAML', 'SLA guarantee', 'Dedicated support', 'Custom contracts'],
    notIncluded: [],
  },
]

export function PricingTable({ heading = 'Simple, transparent pricing', subheading = 'No hidden fees. No surprise bills. Cancel anytime.', tiers = DEFAULT_TIERS }) {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" style={{ padding: '96px 24px', background: '#080810' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#fff', marginBottom: '14px', letterSpacing: '-1px' }}>{heading}</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>{subheading}</p>

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 16px' }}>
            <span style={{ fontSize: '13px', color: annual ? 'rgba(255,255,255,0.4)' : '#fff', fontWeight: '600' }}>Monthly</span>
            <button id="billing-toggle" onClick={() => setAnnual(a => !a)} style={{
              width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
              background: annual ? 'var(--brand-primary, #7c3aed)' : 'rgba(255,255,255,0.15)',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <span style={{ position: 'absolute', top: '3px', left: annual ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </button>
            <span style={{ fontSize: '13px', color: annual ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
              Annual <span style={{ color: '#4ade80', fontSize: '11px' }}>Save 20%</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {tiers.map((tier, i) => (
            <div key={i} id={`pricing-tier-${tier.name.toLowerCase()}`} style={{
              background: tier.highlighted ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${tier.highlighted ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '16px', padding: '32px',
              transform: tier.highlighted ? 'scale(1.03)' : 'scale(1)',
              position: 'relative', overflow: 'hidden',
            }}>
              {tier.badge && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--brand-primary, #7c3aed)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px' }}>{tier.badge}</div>
              )}
              <div style={{ fontSize: '14px', fontWeight: '700', color: tier.highlighted ? 'var(--brand-primary, #a78bfa)' : 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tier.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                <span style={{ fontSize: '40px', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>{tier.price}</span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>{tier.period}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '24px', lineHeight: '1.6' }}>{tier.description}</p>

              <a href={tier.cta.href} id={`pricing-cta-${tier.name.toLowerCase()}`} style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                background: tier.highlighted ? 'var(--brand-primary, #7c3aed)' : 'rgba(255,255,255,0.08)',
                color: '#fff', padding: '11px', borderRadius: '9px',
                fontSize: '14px', fontWeight: '700', marginBottom: '24px',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >{tier.cta.text}</a>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
                {tier.features.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
                    <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
                {tier.notIncluded.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
                    <span style={{ flexShrink: 0 }}>–</span> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── TestimonialBlock ─────────────────────────────────────────────────────────

const DEFAULT_TESTIMONIALS = [
  { quote: 'This completely changed how our team ships features. We went from weeks to days.', name: 'Sarah Chen', role: 'CTO at Flowly', avatar: 'SC' },
  { quote: "I've tried every tool in this space. Nothing comes close to the speed and quality.", name: 'Marcus Webb', role: 'Founder at BuildFast', avatar: 'MW' },
  { quote: 'Our customers keep asking how we ship so fast. This is our secret weapon.', name: 'Priya Sharma', role: 'Head of Product at Nexus', avatar: 'PS' },
]

export function TestimonialBlock({ heading = 'Loved by builders worldwide', testimonials = DEFAULT_TESTIMONIALS }) {
  return (
    <section id="testimonials" style={{ padding: '96px 24px', background: '#0a0a12' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '800', color: '#fff', marginBottom: '52px', letterSpacing: '-1px' }}>{heading}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: '28px',
            }}>
              <div style={{ fontSize: '28px', color: 'var(--brand-primary, #7c3aed)', marginBottom: '16px', fontFamily: 'Georgia, serif', lineHeight: 1 }}>&ldquo;</div>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.7', marginBottom: '24px' }}>{t.quote}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--brand-primary, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQSection ───────────────────────────────────────────────────────────────

const DEFAULT_FAQS = [
  { q: 'How long does it take to get started?', a: 'You can be up and running in under 5 minutes. No installation required — just sign up and start building.' },
  { q: 'Can I cancel anytime?', a: 'Yes, absolutely. No contracts, no lock-in. Cancel from your account settings anytime and you\'ll keep access until your billing period ends.' },
  { q: 'Do you offer a free trial?', a: 'Our free tier gives you full access to core features with no time limit. Upgrade when you\'re ready to grow.' },
  { q: 'What happens to my data if I cancel?', a: 'You own your data. We\'ll give you 30 days to export everything before it\'s permanently deleted.' },
]

export function FAQSection({ heading = 'Frequently asked questions', faqs = DEFAULT_FAQS }) {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <section id="faq" style={{ padding: '80px 24px', background: '#080810' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '800', color: '#fff', marginBottom: '48px', letterSpacing: '-0.5px' }}>{heading}</h2>
        {faqs.map((faq, i) => (
          <div key={i} id={`faq-item-${i}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 0', textAlign: 'left',
            }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>{faq.q}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px', transform: openIdx === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: '16px' }}>+</span>
            </button>
            {openIdx === i && (
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', paddingBottom: '20px' }}>{faq.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
