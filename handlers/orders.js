const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

function generateOrderNumber() {
  const random = crypto.randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

  return `RHR-${Date.now()}-${random}`;
}

async function getShippingSettings(env) {
  const { results } = await env.DB
    .prepare(`
      SELECT key, value
      FROM settings
      WHERE key IN (
        'shipping_cost',
        'free_shipping_threshold'
      )
    `)
    .all();

  const settings = Object.fromEntries(
    results.map((item) => [item.key, item.value])
  );

  return {
    shippingCost: Number(settings.shipping_cost ?? 99),
    freeShippingThreshold: Number(
      settings.free_shipping_threshold ?? 0
    ),
  };
}

async function handleCreateOrder(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json(
      { error: "Invalid JSON body" },
      400
    );
  }

  const customer = body.customer;
  const items = body.items;

  if (!customer || typeof customer !== "object") {
    return json(
      { error: "Customer details are required" },
      400
    );
  }

  const requiredCustomerFields = [
    "name",
    "phone",
    "address_line1",
    "city",
    "state",
    "pincode",
  ];

  for (const field of requiredCustomerFields) {
    if (
      !customer[field] ||
      String(customer[field]).trim() === ""
    ) {
      return json(
        {
          error: `Customer ${field} is required`,
        },
        400
      );
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return json(
      { error: "At least one item is required" },
      400
    );
  }

  /*
   * Combine duplicate variant IDs.
   *
   * Example:
   * variant 3 quantity 1
   * variant 3 quantity 2
   *
   * becomes:
   * variant 3 quantity 3
   */
  const itemMap = new Map();

  for (const item of items) {
    const productId = Number(item.product_id);
    const variantId = Number(item.variant_id);
    const quantity = Number(item.quantity);

    if (
      !Number.isInteger(productId) ||
      productId <= 0 ||
      !Number.isInteger(variantId) ||
      variantId <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return json(
        {
          error:
            "Each item requires valid product_id, variant_id and quantity",
        },
        400
      );
    }

    const existing = itemMap.get(variantId);

    if (existing) {
      if (existing.product_id !== productId) {
        return json(
          {
            error:
              "Variant does not match the supplied product",
          },
          400
        );
      }

      existing.quantity += quantity;
    } else {
      itemMap.set(variantId, {
        product_id: productId,
        variant_id: variantId,
        quantity,
      });
    }
  }

  const normalizedItems = Array.from(itemMap.values());

  /*
   * Fetch the real product, variant, price and stock from D1.
   *
   * We never trust the frontend price.
   */
  const variantIds = normalizedItems.map(
    (item) => item.variant_id
  );

  const placeholders = variantIds
    .map(() => "?")
    .join(",");

  const { results: dbItems } = await env.DB
    .prepare(`
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.price AS product_price,
        v.id AS variant_id,
        v.product_id AS variant_product_id,
        v.size,
        v.color,
        v.price AS variant_price,
        v.stock_quantity
      FROM product_variants v
      JOIN products p
        ON p.id = v.product_id
      WHERE v.id IN (${placeholders})
        AND v.is_active = 1
        AND p.is_active = 1
    `)
    .bind(...variantIds)
    .all();

  if (dbItems.length !== normalizedItems.length) {
    return json(
      {
        error:
          "One or more products or variants are no longer available",
      },
      400
    );
  }

  const validatedItems = [];

  for (const item of normalizedItems) {
    const dbItem = dbItems.find(
      (row) => row.variant_id === item.variant_id
    );

    if (
      !dbItem ||
      dbItem.product_id !== item.product_id
    ) {
      return json(
        {
          error:
            "Product and variant combination is invalid",
          variant_id: item.variant_id,
        },
        400
      );
    }

    if (dbItem.stock_quantity < item.quantity) {
      return json(
        {
          error: "Insufficient stock",
          variant_id: item.variant_id,
          available_stock: dbItem.stock_quantity,
        },
        409
      );
    }

    const unitPrice = Number(
      dbItem.variant_price ??
      dbItem.product_price
    );

    const variantDetails = [
      dbItem.size,
      dbItem.color,
    ]
      .filter(Boolean)
      .join(" / ") || null;

    validatedItems.push({
      product_id: dbItem.product_id,
      variant_id: dbItem.variant_id,
      product_name: dbItem.product_name,
      variant_details: variantDetails,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price:
        unitPrice * item.quantity,
    });
  }

  const subtotal = validatedItems.reduce(
    (sum, item) =>
      sum + item.total_price,
    0
  );

  const {
    shippingCost,
    freeShippingThreshold,
  } = await getShippingSettings(env);

  const shippingAmount =
    freeShippingThreshold > 0 &&
    subtotal >= freeShippingThreshold
      ? 0
      : shippingCost;

  const discountAmount = 0;

  const totalAmount =
    subtotal +
    shippingAmount -
    discountAmount;

  const orderNumber =
    generateOrderNumber();

  /*
   * Stock reservation and order creation happen together.
   *
   * The stock condition is checked again inside D1 so that
   * another customer cannot buy stock that was already taken
   * between our earlier validation and this operation.
   */
  const stockConditions = validatedItems
    .map(
      () =>
        "(id = ? AND stock_quantity >= ?)"
    )
    .join(" OR ");

  const stockConditionBindings =
    validatedItems.flatMap((item) => [
      item.variant_id,
      item.quantity,
    ]);

  const stockUpdateCase = validatedItems
    .map(() => "WHEN ? THEN ?")
    .join(" ");

  const stockUpdateBindings =
    validatedItems.flatMap((item) => [
      item.variant_id,
      item.quantity,
    ]);

  /*
   * First statement creates the order only if every variant
   * still has enough stock.
   */
  const createOrderStatement = env.DB
    .prepare(`
      INSERT INTO orders (
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        subtotal,
        shipping_amount,
        discount_amount,
        total_amount,
        payment_status,
        order_status
      )
      SELECT
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'pending',
        'pending'
      WHERE (
        SELECT COUNT(*)
        FROM product_variants
        WHERE ${stockConditions}
      ) = ?
    `)
    .bind(
      orderNumber,
      String(customer.name).trim(),
      customer.email
        ? String(customer.email).trim()
        : null,
      String(customer.phone).trim(),
      String(customer.address_line1).trim(),
      customer.address_line2
        ? String(customer.address_line2).trim()
        : null,
      String(customer.city).trim(),
      String(customer.state).trim(),
      String(customer.pincode).trim(),
      subtotal,
      shippingAmount,
      discountAmount,
      totalAmount,
      ...stockConditionBindings,
      validatedItems.length
    );

  /*
   * Add order items only when the order was successfully created.
   */
  const orderItemStatements =
    validatedItems.map((item) =>
      env.DB
        .prepare(`
          INSERT INTO order_items (
            order_id,
            product_id,
            variant_id,
            product_name,
            variant_details,
            quantity,
            unit_price,
            total_price
          )
          SELECT
            id,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          FROM orders
          WHERE order_number = ?
        `)
        .bind(
          item.product_id,
          item.variant_id,
          item.product_name,
          item.variant_details,
          item.quantity,
          item.unit_price,
          item.total_price,
          orderNumber
        )
    );

  /*
   * Reduce stock only when the order exists.
   */
  const reduceStockStatement = env.DB
    .prepare(`
      UPDATE product_variants
      SET stock_quantity =
        stock_quantity -
        CASE id
          ${stockUpdateCase}
        END
      WHERE id IN (${placeholders})
        AND EXISTS (
          SELECT 1
          FROM orders
          WHERE order_number = ?
        )
    `)
    .bind(
      ...stockUpdateBindings,
      ...variantIds,
      orderNumber
    );

  await env.DB.batch([
    createOrderStatement,
    ...orderItemStatements,
    reduceStockStatement,
  ]);

  /*
   * If no order was created, stock was insufficient when the
   * final D1 operation happened.
   */
  const order = await env.DB
    .prepare(`
      SELECT
        id,
        order_number,
        subtotal,
        shipping_amount,
        discount_amount,
        total_amount,
        payment_status,
        order_status,
        created_at
      FROM orders
      WHERE order_number = ?
    `)
    .bind(orderNumber)
    .first();

  if (!order) {
    return json(
      {
        error:
          "One or more items are no longer available",
      },
      409
    );
  }

  return json(
    {
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        subtotal: order.subtotal,
        shipping_amount:
          order.shipping_amount,
        discount_amount:
          order.discount_amount,
        total_amount:
          order.total_amount,
        payment_status:
          order.payment_status,
        order_status:
          order.order_status,
        created_at:
          order.created_at,
      },
    },
    201
  );
}

export async function handleOrders(
  request,
  env,
  url
) {
  const path = url.pathname;

  if (
    path === "/api/orders" ||
    path === "/api/orders/"
  ) {
    if (request.method === "POST") {
      return handleCreateOrder(
        request,
        env
      );
    }

    return json(
      { error: "Method not allowed" },
      405
    );
  }

  return json(
    { error: "Order endpoint not found" },
    404
  );
}
