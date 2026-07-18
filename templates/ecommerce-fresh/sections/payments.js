/**
 * ecommerce-fresh / sections / payments.js
 *
 * API route handler: POST /api/checkout/create-payment-intent
 *
 * TEMPLATE RULES (for AI customization):
 * - Change STRIPE_SECRET_KEY env var name if needed
 * - Add tax calculation logic in computeTotal()
 * - Add discount code validation before creating intent
 * - Keep the idempotency key pattern — prevents duplicate charges
 * - Do NOT remove the webhook handler export — it's required for order fulfillment
 */

import Stripe  from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient }      from '@/lib/supabase/server'
import { NextResponse }      from 'next/server'
import { headers }           from 'next/headers'

// ── Stripe client ─────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})

// ── Compute total server-side (never trust client total) ──────────────────────
async function computeTotal(items) {
  const admin = createAdminClient()

  // Fetch actual prices from DB — never use client-provided prices
  const productIds = items.map(i => i.id)
  const { data: products } = await admin
    .from('products')
    .select('id, price, stock_qty')
    .in('id', productIds)

  let subtotal = 0
  const lineItems = []

  for (const item of items) {
    const product = products?.find(p => p.id === item.id)
    if (!product) throw new Error(`Product ${item.id} not found`)
    if (product.stock_qty < item.qty) throw new Error(`${item.id} is out of stock`)
    subtotal += product.price * item.qty
    lineItems.push({ productId: item.id, qty: item.qty, unitPrice: product.price })
  }

  const FREE_SHIP_THRESHOLD = 7500 // in cents ($75)
  const shippingCents = subtotal * 100 >= FREE_SHIP_THRESHOLD ? 0 : 999 // $9.99
  const totalCents = Math.round(subtotal * 100) + shippingCents

  return { totalCents, subtotalCents: Math.round(subtotal * 100), shippingCents, lineItems }
}

// ── POST /api/checkout/create-payment-intent ──────────────────────────────────
export async function createPaymentIntentHandler(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items, shippingAddress } = await request.json()
    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

    // Compute total server-side
    const { totalCents, subtotalCents, shippingCents, lineItems } = await computeTotal(items)

    // Create order record first (pending)
    const admin = createAdminClient()
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        user_id:          user.id,
        status:           'pending',
        total_cents:      totalCents,
        subtotal_cents:   subtotalCents,
        shipping_cents:   shippingCents,
        shipping_address: shippingAddress,
        line_items:       lineItems,
      })
      .select()
      .single()

    if (orderErr) throw new Error(orderErr.message)

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   totalCents,
      currency: 'usd',
      metadata: {
        orderId:  order.id,
        userId:   user.id,
      },
      // Idempotency via order ID prevents duplicate charges on retry
    }, {
      idempotencyKey: `pi-${order.id}`,
    })

    // Store Stripe PI ID on the order
    await admin.from('orders').update({ stripe_payment_intent_id: paymentIntent.id }).eq('id', order.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId:      order.id,
      totalCents,
    })

  } catch (err) {
    console.error('[Payments] create-payment-intent error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── Stripe Webhook handler ─────────────────────────────────────────────────────
// Mount at: POST /api/checkout/webhook
// Add STRIPE_WEBHOOK_SECRET to .env.local
export async function stripeWebhookHandler(request) {
  const body = await request.text()
  const sig  = (await headers()).get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object
      const orderId = pi.metadata.orderId

      // Mark order as paid
      await admin.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', orderId)

      // Decrement stock
      const { data: order } = await admin.from('orders').select('line_items').eq('id', orderId).single()
      if (order?.line_items) {
        for (const item of order.line_items) {
          await admin.rpc('decrement_stock', { product_id: item.productId, amount: item.qty })
        }
      }
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object
      await admin.from('orders').update({ status: 'failed' }).eq('id', pi.metadata.orderId)
      break
    }
    case 'charge.refunded': {
      const charge = event.data.object
      if (charge.payment_intent) {
        const { data: order } = await admin.from('orders').select('id').eq('stripe_payment_intent_id', charge.payment_intent).single()
        if (order) await admin.from('orders').update({ status: 'refunded' }).eq('id', order.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
