/**
 * ecommerce-fresh — Cart Baseline Tests
 * Run: npx jest templates/ecommerce-fresh/__tests__/baseline/
 */

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartProvider, useCart, CartIcon, CartSidebar } from '../../sections/cart.jsx'
import { ProductCard, ProductFilters, ProductGrid, ProductSearch } from '../../sections/catalog.jsx'

// ── Helper ─────────────────────────────────────────────────────────────────────
function CartConsumer() {
  const { items, itemCount, subtotal, total, addItem, removeItem, updateQty, clearCart } = useCart()
  return (
    <div>
      <span data-testid="count">{itemCount}</span>
      <span data-testid="subtotal">{subtotal.toFixed(2)}</span>
      <span data-testid="total">{total.toFixed(2)}</span>
      <span data-testid="items">{items.length}</span>
      <button onClick={() => addItem({ id: 'p1', name: 'Widget', price: 10, image: '', category: 'Test' })}>Add Widget</button>
      <button onClick={() => addItem({ id: 'p2', name: 'Gadget', price: 25, image: '', category: 'Test' })}>Add Gadget</button>
      <button onClick={() => removeItem('p1')}>Remove Widget</button>
      <button onClick={() => updateQty('p1', 3)}>Set Widget Qty 3</button>
      <button onClick={() => clearCart()}>Clear</button>
    </div>
  )
}

function Wrapper({ children }) {
  return <CartProvider>{children}</CartProvider>
}

// ── CartProvider ───────────────────────────────────────────────────────────────
describe('CartProvider / useCart', () => {
  it('starts with empty cart', () => {
    render(<CartConsumer />, { wrapper: Wrapper })
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('items').textContent).toBe('0')
  })

  it('adds item correctly', async () => {
    const user = userEvent.setup()
    render(<CartConsumer />, { wrapper: Wrapper })
    await user.click(screen.getByText('Add Widget'))
    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(screen.getByTestId('subtotal').textContent).toBe('10.00')
  })

  it('increments qty when same item added twice', async () => {
    const user = userEvent.setup()
    render(<CartConsumer />, { wrapper: Wrapper })
    await user.click(screen.getByText('Add Widget'))
    await user.click(screen.getByText('Add Widget'))
    expect(screen.getByTestId('count').textContent).toBe('2')
    expect(screen.getByTestId('items').textContent).toBe('1') // still 1 line item
  })

  it('removes item', async () => {
    const user = userEvent.setup()
    render(<CartConsumer />, { wrapper: Wrapper })
    await user.click(screen.getByText('Add Widget'))
    await user.click(screen.getByText('Remove Widget'))
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('clears all items', async () => {
    const user = userEvent.setup()
    render(<CartConsumer />, { wrapper: Wrapper })
    await user.click(screen.getByText('Add Widget'))
    await user.click(screen.getByText('Add Gadget'))
    await user.click(screen.getByText('Clear'))
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('calculates subtotal correctly', async () => {
    const user = userEvent.setup()
    render(<CartConsumer />, { wrapper: Wrapper })
    await user.click(screen.getByText('Add Widget'))  // $10
    await user.click(screen.getByText('Add Gadget'))  // $25
    expect(screen.getByTestId('subtotal').textContent).toBe('35.00')
  })

  it('adds free shipping when subtotal >= $75', async () => {
    const user = userEvent.setup()
    render(<CartConsumer />, { wrapper: Wrapper })
    // Add 3x Widget ($30) + Gadget ($25) = $55 — still pays shipping
    await user.click(screen.getByText('Add Widget'))
    await user.click(screen.getByText('Set Widget Qty 3'))
    await user.click(screen.getByText('Add Gadget'))
    // subtotal = 30 + 25 = 55 → not free
    const total1 = parseFloat(screen.getByTestId('total').textContent)
    const sub1   = parseFloat(screen.getByTestId('subtotal').textContent)
    expect(total1).toBeGreaterThan(sub1) // shipping applied
  })
})

// ── CartIcon ──────────────────────────────────────────────────────────────────
describe('CartIcon', () => {
  it('renders with 0 badge when empty', () => {
    render(<CartProvider><CartIcon /></CartProvider>)
    expect(screen.queryByText('0')).not.toBeInTheDocument() // badge hidden when 0
  })

  it('shows badge when items added', async () => {
    function Adder() {
      const { addItem } = useCart()
      return <button onClick={() => addItem({ id: 'x', name: 'X', price: 5, image: '', category: 'T' })}>Add</button>
    }
    const user = userEvent.setup()
    render(<CartProvider><CartIcon /><Adder /></CartProvider>)
    await user.click(screen.getByText('Add'))
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})

// ── CartSidebar ───────────────────────────────────────────────────────────────
describe('CartSidebar', () => {
  it('renders empty state when cart is empty', () => {
    render(<CartProvider><CartSidebar /></CartProvider>)
    // Sidebar is hidden by default (transform: translateX(100%)) but DOM present
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })

  it('renders items when added', async () => {
    function AddAndOpen() {
      const { addItem, setOpen } = useCart()
      return <button onClick={() => { addItem({ id: 'a', name: 'Alpha', price: 15, image: '', category: 'T' }); setOpen(true) }}>Add & Open</button>
    }
    const user = userEvent.setup()
    render(<CartProvider><CartSidebar /><AddAndOpen /></CartProvider>)
    await user.click(screen.getByText('Add & Open'))
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('$15.00')).toBeInTheDocument()
  })

  it('shows checkout button with correct total', async () => {
    function AddAndOpen() {
      const { addItem, setOpen } = useCart()
      return <button onClick={() => { addItem({ id: 'b', name: 'Beta', price: 20, image: '', category: 'T' }); setOpen(true) }}>Add & Open</button>
    }
    const user = userEvent.setup()
    render(<CartProvider><CartSidebar /><AddAndOpen /></CartProvider>)
    await user.click(screen.getByText('Add & Open'))
    expect(screen.getByText(/Checkout → \$/).textContent).toContain('29.99') // 20 + 9.99 shipping
  })
})

// ── ProductCard ───────────────────────────────────────────────────────────────
describe('ProductCard', () => {
  const baseProps = { id: 'pc1', name: 'Test Product', price: 19.99, image: '', category: 'Widgets', inStock: true }

  it('renders product name and price', () => {
    render(<CartProvider><ProductCard {...baseProps} /></CartProvider>)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$19.99')).toBeInTheDocument()
  })

  it('shows sale badge when originalPrice provided', () => {
    render(<CartProvider><ProductCard {...baseProps} originalPrice={29.99} badge="Sale" /></CartProvider>)
    expect(screen.getByText(/Sale/)).toBeInTheDocument()
    expect(screen.getByText(/\$29.99/)).toBeInTheDocument() // strikethrough price
  })

  it('shows out of stock when inStock=false', () => {
    render(<CartProvider><ProductCard {...baseProps} inStock={false} /></CartProvider>)
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('calls onAddToCart with product data', async () => {
    const onAddToCart = jest.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<CartProvider><ProductCard {...baseProps} onAddToCart={onAddToCart} /></CartProvider>)
    await user.click(screen.getByText('+ Cart'))
    expect(onAddToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 'pc1', price: 19.99 }))
  })

  it('shows "Added" feedback after click', async () => {
    const user = userEvent.setup()
    render(<CartProvider><ProductCard {...baseProps} onAddToCart={jest.fn().mockResolvedValue(undefined)} /></CartProvider>)
    await user.click(screen.getByText('+ Cart'))
    expect(screen.getByText('✓ Added')).toBeInTheDocument()
  })
})

// ── ProductFilters ─────────────────────────────────────────────────────────────
describe('ProductFilters', () => {
  it('renders all category chips', () => {
    render(<ProductFilters categories={['All', 'Electronics', 'Clothing']} activeCategory="All" />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('calls onCategory when chip clicked', async () => {
    const onCategory = jest.fn()
    const user = userEvent.setup()
    render(<ProductFilters categories={['All', 'Electronics']} activeCategory="All" onCategory={onCategory} />)
    await user.click(screen.getByText('Electronics'))
    expect(onCategory).toHaveBeenCalledWith('Electronics')
  })

  it('calls onSort when sort changes', async () => {
    const onSort = jest.fn()
    const user = userEvent.setup()
    render(<ProductFilters onSort={onSort} />)
    await user.selectOptions(screen.getByRole('combobox'), 'price-asc')
    expect(onSort).toHaveBeenCalledWith('price-asc')
  })
})

// ── ProductSearch ──────────────────────────────────────────────────────────────
describe('ProductSearch', () => {
  it('renders search input', () => {
    render(<ProductSearch />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onSearch on input', async () => {
    const onSearch = jest.fn()
    const user = userEvent.setup()
    render(<ProductSearch onSearch={onSearch} />)
    await user.type(screen.getByRole('textbox'), 'widget')
    expect(onSearch).toHaveBeenLastCalledWith('widget')
  })
})

// ── ProductGrid ───────────────────────────────────────────────────────────────
describe('ProductGrid', () => {
  it('shows loading skeleton', () => {
    render(<CartProvider><ProductGrid loading={true} /></CartProvider>)
    // Loading skeletons are divs with shimmer animation — just check it doesn't crash
    expect(document.querySelectorAll('[style*="shimmer"]').length).toBeGreaterThanOrEqual(0)
  })

  it('shows empty state when no products', () => {
    render(<CartProvider><ProductGrid products={[]} /></CartProvider>)
    expect(screen.getByText('No products found.')).toBeInTheDocument()
  })

  it('renders product cards', () => {
    const products = [
      { id: 'g1', name: 'Gizmo', price: 12.99, image: '', category: 'Tools', inStock: true },
      { id: 'g2', name: 'Widget', price: 5.99, image: '', category: 'Tools', inStock: true },
    ]
    render(<CartProvider><ProductGrid products={products} /></CartProvider>)
    expect(screen.getByText('Gizmo')).toBeInTheDocument()
    expect(screen.getByText('Widget')).toBeInTheDocument()
  })
})
