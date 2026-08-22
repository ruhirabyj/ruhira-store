import { json } from "../utils/response.js";

export async function handleShipping(
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
  const subtotal = Number(body.subtotal);

  if (
    !Number.isFinite(subtotal) ||
    subtotal < 0
  ) {
    return json(
      {
        error:
          "A valid subtotal is required",
      },
      400
    );
  }

  const { results: settings } = await env.DB
    .prepare(`
      SELECT key, value
      FROM settings
      WHERE key IN (
        'shipping_cost',
        'free_shipping_threshold'
      )
    `)
    .all();

  const config = {};

  for (const setting of settings) {
    config[setting.key] = Number(
      setting.value
    );
  }

  const shippingCost =
    config.shipping_cost ?? 0;

  const freeShippingThreshold =
    config.free_shipping_threshold ?? 0;

  let finalShippingCost = shippingCost;

  if (
    freeShippingThreshold > 0 &&
    subtotal >= freeShippingThreshold
  ) {
    finalShippingCost = 0;
  }

  return json({
    subtotal,
    shipping_cost: finalShippingCost,
    free_shipping_threshold:
      freeShippingThreshold,
    total:
      subtotal + finalShippingCost,
  });
}
