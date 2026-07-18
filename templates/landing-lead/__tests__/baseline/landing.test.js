/**
 * landing-lead — Baseline Integration Tests
 *
 * These tests verify the template works BEFORE any AI customization.
 * Run: npx jest templates/landing-lead/__tests__/baseline/
 *
 * DO NOT modify these tests — they are the ground truth.
 * AI-generated custom tests go in templates/landing-lead/__tests__/custom/
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ── Layout tests ─────────────────────────────────────────────────────────────

import { Navbar, HeroSection, Footer } from '../../sections/layout.jsx'

describe('Navbar', () => {
  it('renders brand name', () => {
    render(<Navbar brandName="TestBrand" />)
    expect(screen.getByText(/TestBrand/i)).toBeInTheDocument()
  })

  it('renders nav links', () => {
    const links = [{ href: '#features', label: 'Features' }, { href: '#pricing', label: 'Pricing' }]
    render(<Navbar links={links} />)
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
  })

  it('renders CTA button with correct href', () => {
    render(<Navbar ctaText="Sign up" ctaHref="#signup" />)
    const cta = screen.getByText('Sign up')
    expect(cta.closest('a')).toHaveAttribute('href', '#signup')
  })
})

describe('HeroSection', () => {
  it('renders headline', () => {
    render(<HeroSection headline="Build Something People Want" />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders primary CTA with correct href', () => {
    render(<HeroSection primaryCta={{ text: 'Get Started', href: '#signup' }} />)
    expect(screen.getByText('Get Started →').closest('a')).toHaveAttribute('href', '#signup')
  })

  it('renders secondary CTA', () => {
    render(<HeroSection secondaryCta={{ text: 'See how', href: '#features' }} />)
    expect(screen.getByText('See how').closest('a')).toHaveAttribute('href', '#features')
  })

  it('renders social proof text', () => {
    render(<HeroSection socialProof="1,000+ teams already building" />)
    expect(screen.getByText(/1,000\+ teams/i)).toBeInTheDocument()
  })

  it('renders badge', () => {
    render(<HeroSection badge="Now in Beta" />)
    expect(screen.getByText('Now in Beta')).toBeInTheDocument()
  })
})

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer brandName="TestBrand" />)
    expect(screen.getAllByText(/TestBrand/i).length).toBeGreaterThan(0)
  })

  it('renders newsletter form', () => {
    render(<Footer />)
    expect(screen.getByPlaceholderText(/company\.com/i)).toBeInTheDocument()
  })

  it('submits newsletter form', async () => {
    const user = userEvent.setup()
    render(<Footer />)
    await user.type(screen.getByPlaceholderText(/company\.com/i), 'test@example.com')
    await user.click(screen.getByText('→'))
    await waitFor(() => {
      expect(screen.getByText(/You're on the list/i)).toBeInTheDocument()
    })
  })

  it('renders copyright with year', () => {
    render(<Footer brandName="TestBrand" year={2026} />)
    expect(screen.getByText(/2026 TestBrand/i)).toBeInTheDocument()
  })
})

// ── Forms tests ───────────────────────────────────────────────────────────────

import { LeadCaptureForm, CTASection, ContactForm } from '../../sections/forms.jsx'

describe('LeadCaptureForm', () => {
  it('renders name and email fields', () => {
    render(<LeadCaptureForm />)
    expect(screen.getByPlaceholderText(/Your name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/company\.com/i)).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    render(<LeadCaptureForm />)
    await user.click(screen.getByRole('button', { name: /get early access/i }))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
  })

  it('shows email format error for invalid email', async () => {
    const user = userEvent.setup()
    render(<LeadCaptureForm />)
    await user.type(screen.getByPlaceholderText(/Your name/i), 'Test User')
    await user.type(screen.getByPlaceholderText(/company\.com/i), 'notanemail')
    await user.click(screen.getByRole('button'))
    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument()
  })

  it('shows success state after valid submission', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<LeadCaptureForm />)
    await user.type(screen.getByPlaceholderText(/Your name/i), 'Test User')
    await user.type(screen.getByPlaceholderText(/company\.com/i), 'test@example.com')
    await user.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText(/You're in/i)).toBeInTheDocument()
    })
  })

  it('submit button is disabled while loading', async () => {
    global.fetch = jest.fn(() => new Promise(() => {})) // never resolves
    const user = userEvent.setup()
    render(<LeadCaptureForm />)
    await user.type(screen.getByPlaceholderText(/Your name/i), 'Test User')
    await user.type(screen.getByPlaceholderText(/company\.com/i), 'test@example.com')
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

describe('ContactForm', () => {
  it('renders all fields', () => {
    render(<ContactForm />)
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/company\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/How can we help/i)).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(screen.getByText(/Send message/i))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(await screen.findByText('Message is required')).toBeInTheDocument()
  })

  it('shows success state after submission', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByPlaceholderText('Your name'), 'Alice')
    await user.type(screen.getByPlaceholderText(/company\.com/i), 'alice@example.com')
    await user.type(screen.getByPlaceholderText(/How can we help/i), 'I have a question about pricing.')
    await user.click(screen.getByText(/Send message/i))
    await waitFor(() => {
      expect(screen.getByText('Message sent!')).toBeInTheDocument()
    })
  })
})

// ── Features tests ────────────────────────────────────────────────────────────

import { FeatureGrid, PricingTable, FAQSection } from '../../sections/features.jsx'

describe('FeatureGrid', () => {
  it('renders heading', () => {
    render(<FeatureGrid heading="Our Features" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Our Features')
  })

  it('renders all feature cards', () => {
    const features = [
      { icon: '⚡', title: 'Fast', description: 'Very fast' },
      { icon: '🔒', title: 'Secure', description: 'Very secure' },
    ]
    render(<FeatureGrid features={features} />)
    expect(screen.getByText('Fast')).toBeInTheDocument()
    expect(screen.getByText('Secure')).toBeInTheDocument()
  })
})

describe('PricingTable', () => {
  it('renders 3 pricing tiers by default', () => {
    render(<PricingTable />)
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('toggles billing period', async () => {
    const user = userEvent.setup()
    render(<PricingTable />)
    const toggle = screen.getByRole('button', { name: '' }) // billing toggle button
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    await user.click(toggle)
    expect(screen.getByText('Annual')).toBeInTheDocument()
  })

  it('renders CTA links for each tier', () => {
    render(<PricingTable />)
    expect(screen.getById?.('pricing-cta-free') ?? screen.getByText('Get started free')).toBeInTheDocument()
    expect(screen.getByText('Start free trial')).toBeInTheDocument()
    expect(screen.getByText('Talk to sales')).toBeInTheDocument()
  })
})

describe('FAQSection', () => {
  it('renders FAQ heading', () => {
    render(<FAQSection heading="Got questions?" />)
    expect(screen.getByText('Got questions?')).toBeInTheDocument()
  })

  it('expands and collapses FAQ items on click', async () => {
    const user = userEvent.setup()
    const faqs = [{ q: 'What is this?', a: 'A great product.' }]
    render(<FAQSection faqs={faqs} />)
    expect(screen.queryByText('A great product.')).not.toBeInTheDocument()
    await user.click(screen.getByText('What is this?'))
    expect(screen.getByText('A great product.')).toBeInTheDocument()
    await user.click(screen.getByText('What is this?'))
    expect(screen.queryByText('A great product.')).not.toBeInTheDocument()
  })
})
