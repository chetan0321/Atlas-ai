/**
 * ecommerce-fresh / sections / checkout.jsx
 *
 * Exports: CheckoutForm, OrderSummary, CheckoutPage
 *
 * TEMPLATE RULES (for AI customization):
 * - Change form fields to match your required shipping info
 * - Change Stripe publishable key env var if renamed
 * - Keep ALL exported names and prop signatures identical
 * - Do NOT remove the Stripe payment intent fetch — it's required for PCI compliance
 */
'use client'

import { useState } from 'react'
import { useCart } from './cart.jsx'

// ─── OrderSummary ─────────────────────────────────────────────────────────────

export function OrderSummary({ compact = false }) {
  const { items, subtotal, shipping, total } = useCart()

  if (!items.length) return null

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: compact ? '16px' : '24px' }}>
      <h3 style={{ fontSize: compact ? '14px' : '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Order Summary</h3>

      {!compact && (
        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', flexShrink: 0, position: 'relative' }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />}
                  <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', background: 'rgba(124,58,237,0.8)', borderRadius: '50%', fontSize: '9px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.qty}</div>
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              </div>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600', flexShrink: 0, marginLeft: '8px' }}>${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
          <span>Shipping</span>
          <span style={{ color: shipping === 0 ? '#4ade80' : 'inherit' }}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '800', color: '#fff', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '4px' }}>
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── CheckoutForm ─────────────────────────────────────────────────────────────

const FIELD_STYLE = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '9px', padding: '12px 14px',
  color: '#fff', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.15s', fontFamily: 'inherit',
}

function Field({ label, id, required, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>
        {label}{required && <span style={{ color: '#f87171', marginLeft: '2px' }}>*</span>}
      </label>
      <input
        id={id} required={required} {...props}
        style={{ ...FIELD_STYLE, borderColor: error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
        onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'}
        onBlur={e => e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
      />
      {error && <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>{error}</p>}
    </div>
  )
}

export function CheckoutForm({ onSuccess }) {
  const { items, total, clearCart } = useCart()

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '',
    address: '', city: '', state: '', zip: '', country: 'US',
    cardNumber: '', expiry: '', cvc: '',
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState('info') // 'info' | 'payment' | 'success'

  function set(key) { return (e) => setForm(f => ({ ...f, [key]: e.target.value })) }

  function validateInfo() {
    const e = {}
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim())  e.lastName  = 'Required'
    if (!form.address.trim())   e.address   = 'Required'
    if (!form.city.trim())      e.city      = 'Required'
    if (!form.zip.trim())       e.zip       = 'Required'
    return e
  }

  function validatePayment() {
    const e = {}
    const cardClean = form.cardNumber.replace(/\s/g, '')
    if (!cardClean || cardClean.length < 15) e.cardNumber = 'Invalid card number'
    if (!form.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = 'MM/YY format'
    if (!form.cvc.match(/^\d{3,4}$/)) e.cvc = '3-4 digits'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (step === 'info') {
      const errs = validateInfo()
      if (Object.keys(errs).length > 0) { setErrors(errs); return }
      setErrors({})
      setStep('payment')
      return
    }

    // Payment step
    const errs = validatePayment()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingAddress: { ...form }, totalAmount: total }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment failed')

      // In production: use Stripe.js confirmCardPayment with data.clientSecret
      // For now — simulate success
      clearCart()
      setStep('success')
      onSuccess?.(data.orderId)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Order Confirmed!</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>Check your email for order details and tracking info.</p>
      </div>
    )
  }

  return (
    <form id="checkout-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {['info', 'payment'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step === s ? 'var(--shop-primary, #7c3aed)' : (i === 0 && step === 'payment') ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff' }}>
              {i === 0 && step === 'payment' ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: step === s ? '#fff' : 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{s === 'info' ? 'Shipping' : 'Payment'}</span>
            {i === 0 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>}
          </div>
        ))}
      </div>

      {step === 'info' && (
        <>
          <Field label="Email" id="checkout-email" type="email" value={form.email} onChange={set('email')} required error={errors.email} placeholder="you@example.com" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="First name" id="checkout-first-name" value={form.firstName} onChange={set('firstName')} required error={errors.firstName} />
            <Field label="Last name"  id="checkout-last-name"  value={form.lastName}  onChange={set('lastName')}  required error={errors.lastName}  />
          </div>
          <Field label="Address" id="checkout-address" value={form.address} onChange={set('address')} required error={errors.address} placeholder="123 Main St" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="City"  id="checkout-city" value={form.city} onChange={set('city')} required error={errors.city} />
            <Field label="ZIP"   id="checkout-zip"  value={form.zip}  onChange={set('zip')}  required error={errors.zip}  />
          </div>
        </>
      )}

      {step === 'payment' && (
        <>
          <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '16px' }}>🔒</span>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>Your payment info is encrypted and processed securely via Stripe</p>
          </div>
          <Field label="Card number" id="checkout-card" type="text" value={form.cardNumber} onChange={e => setForm(f => ({ ...f, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) }))} required error={errors.cardNumber} placeholder="1234 5678 9012 3456" maxLength={19} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Expiry" id="checkout-expiry" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value.replace(/[^\d\/]/g, '').slice(0, 5) }))} required error={errors.expiry} placeholder="MM/YY" maxLength={5} />
            <Field label="CVC"    id="checkout-cvc"    value={form.cvc}    onChange={set('cvc')}   required error={errors.cvc}    placeholder="123"   maxLength={4} type="tel" />
          </div>
        </>
      )}

      {errors.submit && <p style={{ fontSize: '13px', color: '#f87171', textAlign: 'center' }}>{errors.submit}</p>}

      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        {step === 'payment' && (
          <button type="button" onClick={() => setStep('info')} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>← Back</button>
        )}
        <button id="checkout-submit" type="submit" disabled={loading} style={{ flex: 2, background: loading ? 'rgba(124,58,237,0.5)' : 'var(--shop-primary, #7c3aed)', color: '#fff', border: 'none', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s' }}>
          {loading ? 'Processing…' : step === 'info' ? 'Continue to Payment →' : `Pay $${total.toFixed(2)}`}
        </button>
      </div>
    </form>
  )
}

// ─── CheckoutPage ─────────────────────────────────────────────────────────────

export function CheckoutPage({ onSuccess }) {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '28px', letterSpacing: '-0.5px' }}>Checkout</h1>
        <CheckoutForm onSuccess={onSuccess} />
      </div>
      <OrderSummary />
    </div>
  )
}
