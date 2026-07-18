/**
 * ecommerce-fresh / sections / cart.jsx
 *
 * Exports: CartProvider, useCart, CartSidebar, CartIcon, MiniCart
 *
 * TEMPLATE RULES (for AI customization):
 * - Change discount logic and shipping threshold to match business rules
 * - Change empty cart CTA to match your catalog page route
 * - Keep ALL exported names and prop signatures identical
 * - Do NOT remove the localStorage persistence logic — it's essential for UX
 */
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

// ─── Cart Context ─────────────────────────────────────────────────────────────

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [open,  setOpen]  = useState(false)

  // Persist cart to localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('atlas-cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('atlas-cart', JSON.stringify(items)) } catch {}
  }, [items])

  function addItem(product) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...product, qty: 1 }]
    })
    setOpen(true) // open cart sidebar on add
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function updateQty(id, qty) {
    if (qty < 1) { removeItem(id); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  function clearCart() {
    setItems([])
  }

  const itemCount    = items.reduce((sum, i) => sum + i.qty, 0)
  const subtotal     = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const FREE_SHIP    = 75 // Free shipping threshold ($)
  const shipping     = subtotal >= FREE_SHIP ? 0 : 9.99
  const total        = subtotal + shipping

  return (
    <CartContext.Provider value={{ items, itemCount, subtotal, shipping, total, FREE_SHIP, open, setOpen, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}

// ─── CartIcon ─────────────────────────────────────────────────────────────────

export function CartIcon({ onClick }) {
  const { itemCount } = useCart()
  return (
    <button
      id="cart-icon"
      onClick={onClick || (() => {})}
      style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '22px', transition: 'color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
      aria-label={`Cart (${itemCount} items)`}
    >
      🛒
      {itemCount > 0 && (
        <span style={{ position: 'absolute', top: '0', right: '0', background: 'var(--shop-primary, #7c3aed)', color: '#fff', fontSize: '9px', fontWeight: '800', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}

// ─── CartSidebar ──────────────────────────────────────────────────────────────

export function CartSidebar({ onCheckout }) {
  const { items, itemCount, subtotal, shipping, total, FREE_SHIP, open, setOpen, removeItem, updateQty, clearCart } = useCart()

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(2px)', animation: 'cart-fade 0.2s ease' }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
        width: 'min(420px, 100vw)', background: '#0d0d1a',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '-20px 0 60px rgba(0,0,0,0.5)' : 'none',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>Your Cart</h2>
            {itemCount > 0 && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</p>}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {items.length > 0 && (
              <button id="cart-clear" onClick={clearCart} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', fontSize: '12px', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.6)'}
              >Clear all</button>
            )}
            <button id="cart-close" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '22px', cursor: 'pointer', lineHeight: 1, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >×</button>
          </div>
        </div>

        {/* Free shipping progress */}
        {subtotal < FREE_SHIP && subtotal > 0 && (
          <div style={{ padding: '12px 24px', background: 'rgba(124,58,237,0.08)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 6px' }}>
              Add <strong style={{ color: '#a78bfa' }}>${(FREE_SHIP - subtotal).toFixed(2)}</strong> more for free shipping
            </p>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--shop-primary, #7c3aed)', width: `${(subtotal / FREE_SHIP) * 100}%`, transition: 'width 0.3s', borderRadius: '2px' }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛍️</div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginBottom: '20px' }}>Your cart is empty</p>
              <button onClick={() => setOpen(false)} style={{ background: 'var(--shop-primary, #7c3aed)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Continue Shopping</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '14px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Thumbnail */}
                <div style={{ width: '72px', height: '72px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', flexShrink: 0, overflow: 'hidden' }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h4>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: '0 0 8px' }}>${item.price.toFixed(2)} each</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '7px', padding: '3px' }}>
                      <button id={`cart-qty-dec-${item.id}`} onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 4px', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                      >−</button>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                      <button id={`cart-qty-inc-${item.id}`} onClick={() => updateQty(item.id, item.qty + 1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 4px', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                      >+</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>${(item.price * item.qty).toFixed(2)}</span>
                      <button id={`cart-remove-${item.id}`} onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', fontSize: '16px', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.5)'}
                      >🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '14px' }}>
              <span>Shipping</span><span style={{ color: shipping === 0 ? '#4ade80' : 'inherit' }}>{shipping === 0 ? '🎉 Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            <button
              id="cart-checkout"
              onClick={() => { setOpen(false); onCheckout?.() }}
              style={{ width: '100%', background: 'var(--shop-primary, #7c3aed)', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Checkout → ${total.toFixed(2)}</button>
          </div>
        )}
      </div>

      <style>{`@keyframes cart-fade { from{opacity:0} to{opacity:1} }`}</style>
    </>
  )
}

// ─── MiniCart (header summary) ────────────────────────────────────────────────

export function MiniCart({ onCheckout }) {
  const { setOpen } = useCart()
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <CartIcon onClick={() => setOpen(true)} />
      <CartSidebar onCheckout={onCheckout} />
    </div>
  )
}
