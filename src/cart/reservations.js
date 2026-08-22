const RESERVATION_MINUTES = 10;

export async function cleanupExpiredReservations(env) {
  await env.DB
    .prepare(`
      DELETE FROM cart_reservations
      WHERE expires_at <= CURRENT_TIMESTAMP
    `)
    .run();
}

export async function getReservedQuantity(env, variantId) {
  const result = await env.DB
    .prepare(`
      SELECT COALESCE(SUM(quantity), 0) AS reserved_quantity
      FROM cart_reservations
      WHERE variant_id = ?
        AND expires_at > CURRENT_TIMESTAMP
    `)
    .bind(variantId)
    .first();

  return Number(result?.reserved_quantity || 0);
}

export async function getAvailableStock(env, variantId) {
  await cleanupExpiredReservations(env);

  const variant = await env.DB
    .prepare(`
      SELECT
        id,
        stock_quantity,
        is_active
      FROM product_variants
      WHERE id = ?
    `)
    .bind(variantId)
    .first();

  if (!variant || variant.is_active !== 1) {
    return null;
  }

  const reservedQuantity = await getReservedQuantity(
    env,
    variantId
  );

  return Math.max(
    0,
    Number(variant.stock_quantity) - reservedQuantity
  );
}

export async function reserveCartItem(
  env,
  cartToken,
  variantId,
  quantity
) {
  if (!cartToken) {
    return {
      success: false,
      error: "Cart token is required",
    };
  }

  quantity = Number(quantity);

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return {
      success: false,
      error: "Quantity must be at least 1",
    };
  }

  await cleanupExpiredReservations(env);

  const variant = await env.DB
    .prepare(`
      SELECT
        id,
        stock_quantity,
        is_active
      FROM product_variants
      WHERE id = ?
    `)
    .bind(variantId)
    .first();

  if (!variant || variant.is_active !== 1) {
    return {
      success: false,
      error: "Product variant not found",
    };
  }

  const existingReservation = await env.DB
    .prepare(`
      SELECT quantity
      FROM cart_reservations
      WHERE cart_token = ?
        AND variant_id = ?
        AND expires_at > CURRENT_TIMESTAMP
    `)
    .bind(cartToken, variantId)
    .first();

  const existingQuantity = Number(
    existingReservation?.quantity || 0
  );

  const otherReserved = await env.DB
    .prepare(`
      SELECT COALESCE(SUM(quantity), 0) AS reserved_quantity
      FROM cart_reservations
      WHERE variant_id = ?
        AND cart_token != ?
        AND expires_at > CURRENT_TIMESTAMP
    `)
    .bind(variantId, cartToken)
    .first();

  const reservedByOthers = Number(
    otherReserved?.reserved_quantity || 0
  );

  const availableForThisCart =
    Number(variant.stock_quantity) -
    reservedByOthers;

  if (quantity > availableForThisCart) {
    return {
      success: false,
      error: "Insufficient stock",
      available_stock: Math.max(
        0,
        availableForThisCart
      ),
    };
  }

  await env.DB
    .prepare(`
      INSERT INTO cart_reservations (
        cart_token,
        variant_id,
        quantity,
        expires_at,
        updated_at
      )
      VALUES (
        ?,
        ?,
        ?,
        datetime('now', '+10 minutes'),
        CURRENT_TIMESTAMP
      )
      ON CONFLICT(cart_token, variant_id)
      DO UPDATE SET
        quantity = excluded.quantity,
        expires_at = excluded.expires_at,
        updated_at = CURRENT_TIMESTAMP
    `)
    .bind(
      cartToken,
      variantId,
      quantity
    )
    .run();

  return {
    success: true,
    variant_id: Number(variantId),
    quantity,
    available_stock:
      Number(variant.stock_quantity) -
      reservedByOthers -
      quantity,
    expires_in_minutes: RESERVATION_MINUTES,
  };
}

export async function releaseCartReservations(
  env,
  cartToken
) {
  await env.DB
    .prepare(`
      DELETE FROM cart_reservations
      WHERE cart_token = ?
    `)
    .bind(cartToken)
    .run();
}

export async function releaseVariantReservation(
  env,
  cartToken,
  variantId
) {
  await env.DB
    .prepare(`
      DELETE FROM cart_reservations
      WHERE cart_token = ?
        AND variant_id = ?
    `)
    .bind(cartToken, variantId)
    .run();
}
