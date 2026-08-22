import {
  createPayment,
} from "../src/payments/provider.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

async function handleCreateCheckout(
  request,
  env
) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      { error: "Invalid JSON body" },
      400
    );
  }

  const orderId = Number(body.order_id);

  if (
    !Number.isInteger(orderId) ||
    orderId <= 0
  ) {
    return json(
      { error: "Valid order_id is required" },
      400
    );
  }

  const order = await env.DB
    .prepare(`
      SELECT
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        total_amount,
        payment_status,
        order_status
      FROM orders
      WHERE id = ?
    `)
    .bind(orderId)
    .first();

  if (!order) {
    return json(
      { error: "Order not found" },
      404
    );
  }

  if (order.payment_status === "paid") {
    return json(
      { error: "Order is already paid" },
      409
    );
  }

  if (order.order_status === "cancelled") {
    return json(
      { error: "Order has been cancelled" },
      409
    );
  }

  try {
    const payment = await createPayment(
      env,
      order
    );

    return json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      provider: payment.provider,
      payment_session_id:
        payment.payment_session_id,
    });
  } catch (error) {
    console.error(
      "Payment creation failed:",
      error
    );

    return json(
      {
        error:
          error.message ||
          "Unable to create payment",
      },
      502
    );
  }
}

export async function handleCheckout(
  request,
  env,
  url
) {
  if (
    url.pathname ===
    "/api/checkout/create"
  ) {
    if (request.method !== "POST") {
      return json(
        { error: "Method not allowed" },
        405
      );
    }

    return handleCreateCheckout(
      request,
      env
    );
  }

  return json(
    { error: "Checkout endpoint not found" },
    404
  );
}
