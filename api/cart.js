import { json } from "../utils/response.js";

export async function handleCart(
  request,
  env
) {
  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      405
    );
  }

  const body = await request.json();

  if (
    !body.items ||
    !Array.isArray(body.items)
  ) {
    return json(
      {
        error: "items must be an array",
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

    if (
      variant.stock_quantity < quantity
    ) {
      return json(
        {
          error: "Insufficient stock",
          variant_id: variantId,
          available_stock:
            variant.stock_quantity,
        },
        400
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
        variant.stock_quantity,
    });
  }

  return json({
    valid: true,
    items: validatedItems,
    subtotal,
  });
}
