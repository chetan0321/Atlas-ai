-- ecommerce-fresh / sections / schema.sql
--
-- TEMPLATE RULES (for AI customization):
-- - Rename product fields to match your catalog (e.g. add 'color', 'size', 'sku')
-- - Add/remove order status values in the CHECK constraint
-- - Keep the RLS policies pattern — users can only see their own orders
-- - Keep the decrement_stock function — it's called by the webhook handler
--
-- Run via: Supabase SQL Editor or `supabase db push`

-- ── Products ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  compare_price NUMERIC(10,2),                        -- original price for sale badge
  image_url    TEXT,
  category     TEXT NOT NULL DEFAULT 'General',
  stock_qty    INT  NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  is_active    BOOLEAN NOT NULL DEFAULT true,
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products are public (read-only)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = true);

-- Only service role can insert/update/delete products
-- (handled by admin client in the backend — no user policy needed)

-- ── Orders ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status                     TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'failed', 'refunded')),
  total_cents                INT  NOT NULL CHECK (total_cents >= 0),
  subtotal_cents             INT  NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents             INT  NOT NULL DEFAULT 0,
  line_items                 JSONB NOT NULL DEFAULT '[]', -- [{ productId, qty, unitPrice }]
  shipping_address           JSONB,
  stripe_payment_intent_id   TEXT,
  paid_at                    TIMESTAMPTZ,
  shipped_at                 TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can see their own orders
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (auth.uid() = user_id);
-- Only service role can insert/update orders (via webhook + API)
-- Users cannot write orders directly — they go through /api/checkout

-- ── Auto-update updated_at ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_products ON products;
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_orders ON orders;
CREATE TRIGGER set_updated_at_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Stock decrement (called by webhook, atomic) ───────────────────────────────────
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_qty = GREATEST(0, stock_qty - amount)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Indexes ───────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS products_category_idx   ON products(category);
CREATE INDEX IF NOT EXISTS products_is_active_idx  ON products(is_active);
CREATE INDEX IF NOT EXISTS orders_user_id_idx      ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx       ON orders(status);
CREATE INDEX IF NOT EXISTS orders_stripe_pi_idx    ON orders(stripe_payment_intent_id);
