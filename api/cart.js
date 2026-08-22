import { json } from "../utils/response.js";

import {
  reserveCartItem,
  releaseCartReservations,
  releaseVariantReservation,
  getAvailableStock,
  cleanupExpiredReservations,
} from "../src/cart/reservations.js";

function getCartToken(request) {
  return request.headers.get("X-Cart-Token");
}

export async function handleCart(
  request,
  env
) {
  const url = new URL(request.url);
  const path = url.pathname;
  const cartToken = getCartToken(request);

  /*
   * POST /api/cart/validate
   *
   * Validates the current cart and calculates subtotal.
   * It does NOT create reservations.
   */
  if (path === "/api/cart/validate") {
    if (request.method !== "POST") {
      return json(
        { error: "Method not allowed" },
        405
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return json(
        { error: "Invalid JSON body" },
        400
      );
    }

    if (
      !body.items ||
      !Array.isArray(body.items)
    ) {
      return json(
        {
          error:
            "items must be an array",
        },
        400
      );
    }

    if (body.items.length === 0) {
      return json({
        valid: true,
        items: [],
        subtotal: 0,
      });
    }

    await cleanupExpiredReservations(env);

    const validatedItems = [];
    let subtotal = 0;

    for (const item of body.items) {
      const variantId = Number(
        item.variant_id
      );

      const quantity = Number(
        item.quantity
      );

      if (
        !Number.isInteger(variantId) ||
        variantId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return json(
          {
            error:
              "Each item must have a valid variant_id and quantity",
          },
          400
        );
      }

      const variant = await env.DB
        .prepare(`
          SELECT
            pv.id AS variant_id,
            pv.size,
            pv.stock_quantity,
            p.id AS product_id,
            p.name,
            p.price,
            p.is_active,
            pv.is_active AS variant_active
          FROM product_variants pv
          JOIN products p
            ON p.id = pv.product_id
          WHERE pv.id = ?
        `)
        .bind(variantId)
        .first();

      if (
        !variant ||
        variant.is_active !== 1 ||
        variant.variant_active !== 1
      ) {
        return json(
          {
            error:
              "Product is no longer available",
            variant_id: variantId,
          },
          400
        );
      }

      let availableStock;

      if (cartToken) {
        const ownReservation = await env.DB
          .prepare(`
            SELECT quantity
            FROM cart_reservations
            WHERE cart_token = ?
              AND variant_id = ?
              AND expires_at > CURRENT_TIMESTAMP
          `)
          .bind(
            cartToken,
            variantId
          )
          .first();

        const ownReservedQuantity = Number(
          ownReservation?.quantity || 0
        );

        const availableForNewReservation =
          await getAvailableStock(
            env,
            variantId
          );

        availableStock =
          availableForNewReservation +
          ownReservedQuantity;
      } else {
        availableStock =
          await getAvailableStock(
            env,
            variantId
          );
      }

      if (
        availableStock === null ||
        availableStock < quantity
      ) {
        return json(
          {
            error: "Insufficient stock",
            variant_id: variantId,
            available_stock:
              availableStock || 0,
          },
          409
        );
      }

      const itemTotal =
        variant.price * quantity;

      subtotal += itemTotal;

      validatedItems.push({
        product_id: variant.product_id,
        variant_id: variant.variant_id,
        name: variant.name,
        size: variant.size,
        price: variant.price,
        quantity,
        item_total: itemTotal,
        available_stock:
          availableStock,
      });
    }

    return json({
      valid: true,
      items: validatedItems,
      subtotal,
    });
  }

  /*
   * POST /api/cart/reserve
   *
   * Creates or updates a 10-minute
   * reservation for one variant.
   */
  if (path === "/api/cart/reserve") {
    if (request.method !== "POST") {
      return json(
        { error: "Method not allowed" },
        405
      );
    }

    if (!cartToken) {
      return json(
        {
          error:
            "Cart token is required",
        },
        400
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return json(
        { error: "Invalid JSON body" },
        400
      );
    }

    const result =
      await reserveCartItem(
        env,
        cartToken,
        body.variant_id,
        body.quantity
      );

    if (!result.success) {
      return json(
        result,
        result.error ===
          "Insufficient stock"
          ? 409
          : 400
      );
    }

    return json(result);
  }

  /*
   * DELETE /api/cart/item/:variantId
   *
   * Removes one reserved item.
   */
  const itemMatch = path.match(
    /^\/api\/cart\/item\/(\d+)$/
  );

  if (itemMatch) {
    if (request.method !== "DELETE") {
      return json(
        { error: "Method not allowed" },
        405
      );
    }

    if (!cartToken) {
      return json(
        {
          error:
            "Cart token is required",
        },
        400
      );
    }

    const variantId = Number(
      itemMatch[1]
    );

    await releaseVariantReservation(
      env,
      cartToken,
      variantId
    );

    return json({
      success: true,
      variant_id: variantId,
    });
  }

  /*
   * DELETE /api/cart
   *
   * Releases all reservations
   * belonging to this cart.
   */
  if (
    path === "/api/cart" ||
    path === "/api/cart/"
  ) {
    if (request.method !== "DELETE") {
      return json(
        { error: "Method not allowed" },
        405
      );
    }

    if (!cartToken) {
      return json(
        {
          error:
            "Cart token is required",
        },
        400
      );
    }

    await releaseCartReservations(
      env,
      cartToken
    );

    return json({
      success: true,
    });
  }

  return json(
    {
      error:
        "Cart endpoint not found",
    },
    404
  );
}