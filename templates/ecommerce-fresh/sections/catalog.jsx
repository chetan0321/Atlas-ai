/**
 * ecommerce-fresh / sections / catalog.jsx
 *
 * Exports: ProductCard, ProductGrid, ProductFilters, ProductSearch,
 *          ProductDetail, CategoryNav
 *
 * TEMPLATE RULES (for AI customization):
 * - Change product fields to match your catalog (name, price, image, category)
 * - Change category list and filter labels
 * - Change brand colors via --shop-primary, --shop-accent CSS vars
 * - Preserve ALL exported component names and prop signatures
 * - Do NOT remove the cart integration callbacks (onAddToCart, onQuickView)
 */
'use client'

import { useState } from 'react'
import Image from 'next/image'

// ─── ProductCard ──────────────────────────────────────────────────────────────

export function ProductCard({
  id,
  name = 'Product Name',
  price = 29.99,
  originalPrice = null,
  image = '/placeholder-product.jpg',
  category = 'General',
  inStock = true,
  rating = 4.5,
  reviewCount = 0,
  badge = null, // 'New' | 'Sale' | 'Hot' | null
  onAddToCart,
  onQuickView,
  index = 0,
}) {
  const [hovered, setHovered] = useState(false)
  const [adding, setAdding] = useState(false)
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : null

  async function handleAddToCart() {
    if (!inStock || adding) return
    setAdding(true)
    await onAddToCart?.({ id, name, price, image, category })
    setTimeout(() => setAdding(false), 800)
  }

  return (
    <div
      id={`product-card-${id || index}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '14px', overflow: 'hidden',
        transition: 'all 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/3', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <Image src={image} alt={name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover', transition: 'transform 0.3s' }} />

        {/* Badge */}
        {badge && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: badge === 'Sale' ? '#ef4444' : badge === 'New' ? '#7c3aed' : '#f59e0b',
            color: '#fff', fontSize: '10px', fontWeight: '800', padding: '3px 8px',
            borderRadius: '999px', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>{badge}{discount ? ` −${discount}%` : ''}</div>
        )}

        {/* Quick view */}
        {hovered && (
          <button
            onClick={() => onQuickView?.({ id, name, price, image, category, inStock, rating })}
            style={{
              position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
              padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
          >Quick View</button>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700', background: 'rgba(239,68,68,0.8)', padding: '5px 12px', borderRadius: '8px' }}>Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{category}</div>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '8px', lineHeight: '1.3', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{name}</h3>

        {/* Rating */}
        {reviewCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
            <div style={{ color: '#fbbf24', fontSize: '11px' }}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>({reviewCount})</span>
          </div>
        )}

        {/* Price row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>${price.toFixed(2)}</span>
            {originalPrice && (
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through', marginLeft: '8px' }}>${originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button
            id={`add-to-cart-${id || index}`}
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            style={{
              background: adding ? 'rgba(74,222,128,0.3)' : inStock ? 'var(--shop-primary, #7c3aed)' : 'rgba(255,255,255,0.08)',
              color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px',
              fontSize: '12px', fontWeight: '700', cursor: inStock && !adding ? 'pointer' : 'default',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >{adding ? '✓ Added' : inStock ? '+ Cart' : 'Sold Out'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── ProductSearch ────────────────────────────────────────────────────────────

export function ProductSearch({ onSearch, placeholder = 'Search products…' }) {
  const [query, setQuery] = useState('')
  function handleChange(e) {
    setQuery(e.target.value)
    onSearch?.(e.target.value)
  }
  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
      <input
        id="product-search"
        type="text" value={query} onChange={handleChange}
        placeholder={placeholder}
        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 16px 11px 36px', color: '#fff', fontSize: '14px', outline: 'none' }}
        onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'}
        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>⌕</span>
      {query && (
        <button onClick={() => { setQuery(''); onSearch?.('') }} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '16px' }}>×</button>
      )}
    </div>
  )
}

// ─── ProductFilters ───────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = ['All', 'Electronics', 'Clothing', 'Home', 'Books', 'Sports']
const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest' },
  { value: 'rating',     label: 'Top Rated' },
]

export function ProductFilters({
  categories = DEFAULT_CATEGORIES,
  activeCategory = 'All',
  onCategory,
  sortBy = 'featured',
  onSort,
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
      {/* Category chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} id={`filter-${cat.toLowerCase()}`} onClick={() => onCategory?.(cat)} style={{
            padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
            border: '1px solid',
            background: activeCategory === cat ? 'var(--shop-primary, #7c3aed)' : 'transparent',
            borderColor: activeCategory === cat ? 'var(--shop-primary, #7c3aed)' : 'rgba(255,255,255,0.12)',
            color: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{cat}</button>
        ))}
      </div>

      {/* Sort */}
      <select
        id="product-sort"
        value={sortBy} onChange={e => onSort?.(e.target.value)}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
      >
        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#1a1a2e' }}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ─── ProductGrid ──────────────────────────────────────────────────────────────

export function ProductGrid({
  products = [],
  onAddToCart,
  onQuickView,
  loading = false,
  emptyMessage = 'No products found.',
}) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.05)', animation: 'shop-shimmer 1.5s infinite' }} />
            <div style={{ padding: '14px' }}>
              <div style={{ height: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', width: '40%', marginBottom: '8px' }} />
              <div style={{ height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', width: '80%', marginBottom: '12px' }} />
              <div style={{ height: '20px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', width: '30%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛍️</div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '15px' }}>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {products.map((p, i) => (
          <ProductCard key={p.id || i} {...p} index={i} onAddToCart={onAddToCart} onQuickView={onQuickView} />
        ))}
      </div>
      <style>{`@keyframes shop-shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
    </>
  )
}

// ─── CategoryNav ─────────────────────────────────────────────────────────────

export function CategoryNav({
  categories = [
    { label: 'Electronics', icon: '⚡', href: '/shop/electronics' },
    { label: 'Clothing',    icon: '👕', href: '/shop/clothing'    },
    { label: 'Home',        icon: '🏡', href: '/shop/home'        },
    { label: 'Books',       icon: '📚', href: '/shop/books'       },
    { label: 'Sports',      icon: '⚽', href: '/shop/sports'      },
  ],
}) {
  return (
    <nav style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 0', scrollbarWidth: 'none' }}>
      {categories.map(cat => (
        <a key={cat.label} href={cat.href} id={`category-nav-${cat.label.toLowerCase()}`} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          padding: '16px 20px', borderRadius: '12px', textDecoration: 'none',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          minWidth: '90px', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
        >
          <span style={{ fontSize: '24px' }}>{cat.icon}</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>{cat.label}</span>
        </a>
      ))}
    </nav>
  )
}
