import {
  reserveCartItem,
  releaseCartReservations,
  releaseVariantReservation,
  cleanupExpiredReservations,
} from "../cart/reservations.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

function getCartToken(request) {
  return request.headers.get("X-Cart-Token");
}

export async function handleCart(request, env, url) {
  const path = url.pathname;
  const cartToken = getCartToken(request);

  // POST /api/cart/reserve
  if (path === "/api/cart/reserve") {
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

    const result = await reserveCartItem(
      env,
      cartToken,
      body.variant_id,
      body.quantity
    );

    if (!result.success) {
      return json(
        result,
        result.error === "Insufficient stock"
          ? 409
          : 400
      );
    }

    return json(result);
  }

  // DELETE /api/cart/item/:variantId
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
        { error: "Cart token is required" },
        400
      );
    }

    const variantId = Number(itemMatch[1]);

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

  // DELETE /api/cart
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
        { error: "Cart token is required" },
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

  // POST /api/cart/cleanup
  if (path === "/api/cart/cleanup") {
    if (request.method !== "POST") {
      return json(
        { error: "Method not allowed" },
        405
      );
    }

    await cleanupExpiredReservations(env);

    return json({
      success: true,
    });
  }

  return json(
    { error: "Cart endpoint not found" },
    404
  );
}
