const SANDBOX_URL = "https://sandbox.cashfree.com";
const PRODUCTION_URL = "https://api.cashfree.com";

function getBaseUrl(env) {
  return env.PAYMENT_ENV === "production"
    ? PRODUCTION_URL
    : SANDBOX_URL;
}

function getHeaders(env) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-client-id": env.CF_APP_ID,
    "x-client-secret": env.CF_SECRET_KEY,
    "x-api-version": "2025-01-01",
  };
}

export async function createPayment(env, order) {
  const baseUrl = getBaseUrl(env);

  const response = await fetch(
    `${baseUrl}/pg/orders`,
    {
      method: "POST",
      headers: getHeaders(env),
      body: JSON.stringify({
        order_id: order.order_number,

        order_amount: order.total_amount,

        order_currency: "INR",

        customer_details: {
          customer_id: `customer_${order.id}`,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_email: order.customer_email || undefined,
        },

        order_meta: {
          return_url:
            `${env.APP_URL}/payment-status?order_id={order_id}`,

          notify_url:
            `${env.APP_URL}/api/payments/webhook`,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Cashfree create payment failed:",
      data
    );

    throw new Error(
      data.message || "Unable to create payment"
    );
  }

  return {
    provider: "cashfree",
    provider_order_id: data.order_id,
    payment_session_id: data.payment_session_id,
    raw: data,
  };
}

export async function getPaymentStatus(env, order) {
  const baseUrl = getBaseUrl(env);

  const response = await fetch(
    `${baseUrl}/pg/orders/${encodeURIComponent(
      order.order_number
    )}/payments`,
    {
      method: "GET",
      headers: getHeaders(env),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to get payment status"
    );
  }

  const successfulPayment = data.find(
    (payment) =>
      payment.payment_status === "SUCCESS"
  );

  if (successfulPayment) {
    return {
      status: "paid",
      payment_id:
        successfulPayment.cf_payment_id?.toString() ||
        null,
      raw: data,
    };
  }

  const pendingPayment = data.find(
    (payment) =>
      payment.payment_status === "PENDING"
  );

  if (pendingPayment) {
    return {
      status: "pending",
      payment_id: null,
      raw: data,
    };
  }

  return {
    status: "failed",
    payment_id: null,
    raw: data,
  };
}

export async function verifyWebhook(
  env,
  request
) {
  const signature =
    request.headers.get(
      "x-webhook-signature"
    );

  const timestamp =
    request.headers.get(
      "x-webhook-timestamp"
    );

  if (!signature || !timestamp) {
    return {
      verified: false,
      error:
        "Missing webhook signature or timestamp",
    };
  }

  const rawBody = await request.text();

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(
      env.CF_SECRET_KEY
    ),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signatureBuffer =
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(
        timestamp + rawBody
      )
    );

  const generatedSignature =
    btoa(
      String.fromCharCode(
        ...new Uint8Array(signatureBuffer)
      )
    );

  if (generatedSignature !== signature) {
    return {
      verified: false,
      error: "Invalid webhook signature",
    };
  }

  try {
    return {
      verified: true,
      payload: JSON.parse(rawBody),
    };
  } catch {
    return {
      verified: false,
      error: "Invalid webhook JSON",
    };
  }
}
