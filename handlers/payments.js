import {
  verifyWebhook,
} from "../src/payments/provider.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

async function handleWebhook(
  request,
  env
) {
  const result =
    await verifyWebhook(env, request);

  if (!result.verified) {
    return json(
      {
        error:
          result.error ||
          "Webhook verification failed",
      },
      400
    );
  }

  const payload = result.payload;

  const orderNumber =
    payload?.data?.order?.order_id;

  const paymentStatus =
    payload?.data?.payment?.payment_status;

  const paymentAmount = Number(
    payload?.data?.payment?.payment_amount
  );

  if (!orderNumber || !paymentStatus) {
    return json(
      {
        error:
          "Invalid webhook payload",
      },
      400
    );
  }

  const order = await env.DB
    .prepare(`
      SELECT
        id,
        order_number,
        total_amount,
        payment_status
      FROM orders
      WHERE order_number = ?
    `)
    .bind(orderNumber)
    .first();

  if (!order) {
    return json(
      { error: "Order not found" },
      404
    );
  }

  /*
   * Extra safety check.
   *
   * Even though the webhook signature is valid,
   * make sure the payment amount matches our order.
   */
  if (
    Number(order.total_amount) !==
    paymentAmount
  ) {
    return json(
      {
        error: "Payment amount mismatch",
      },
      400
    );
  }

  if (paymentStatus === "SUCCESS") {
    await env.DB
      .prepare(`
        UPDATE orders
        SET payment_status = 'paid'
        WHERE order_number = ?
      `)
      .bind(orderNumber)
      .run();
  }

  if (paymentStatus === "FAILED") {
    await env.DB
      .prepare(`
        UPDATE orders
        SET payment_status = 'failed'
        WHERE order_number = ?
          AND payment_status != 'paid'
      `)
      .bind(orderNumber)
      .run();
  }

  /*
   * Return 200 so Cashfree knows
   * we successfully processed the webhook.
   */
  return json({
    success: true,
    order_number: orderNumber,
    payment_status: paymentStatus,
  });
}

export async function handlePayments(
  request,
  env,
  url
) {
  if (
    url.pathname ===
    "/api/payments/webhook"
  ) {
    if (request.method !== "POST") {
      return json(
        { error: "Method not allowed" },
        405
      );
    }

    return handleWebhook(
      request,
      env
    );
  }

  return json(
    { error: "Payment endpoint not found" },
    404
  );
}
