CREATE TABLE IF NOT EXISTS cart_reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_token TEXT NOT NULL,
  variant_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cart_token, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_reservations_variant
ON cart_reservations(variant_id);

CREATE INDEX IF NOT EXISTS idx_cart_reservations_expiry
ON cart_reservations(expires_at);
