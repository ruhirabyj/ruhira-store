const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const unauthorized = () =>
  json({ error: "Unauthorized" }, 401);

function validateAdminToken(request, env) {
  const auth = request.headers.get("Authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    return false;
  }

  const token = auth.substring(7);

  return token === env.ADMIN_TOKEN;
}

async function getAllProducts(env) {
  const { results: products } = await env.DB
    .prepare(`
      SELECT
        id,
        product_code,
        name,
        slug,
        description,
        price,
        image_url
      FROM products
      WHERE is_active = 1
      ORDER BY id
    `)
    .all();

  const productIds = products.map((product) => product.id);

  if (productIds.length === 0) {
    return [];
  }

  const placeholders = productIds.map(() => "?").join(",");

  const { results: images } = await env.DB
    .prepare(`
      SELECT
        product_id,
        image_url AS url,
        is_primary,
        sort_order
      FROM product_images
      WHERE product_id IN (${placeholders})
      ORDER BY product_id, sort_order
    `)
    .bind(...productIds)
    .all();

  const { results: variants } = await env.DB
    .prepare(`
      SELECT
        id,
        product_id,
        size,
        stock_quantity AS stock
      FROM product_variants
      WHERE product_id IN (${placeholders})
        AND is_active = 1
      ORDER BY product_id, id
    `)
    .bind(...productIds)
    .all();

  return products.map((product) => ({
    ...product,
    images: images.filter(
      (image) => image.product_id === product.id
    ),
    variants: variants.filter(
      (variant) => variant.product_id === product.id
    ),
  }));
}

async function getProductByField(env, field, value) {
  const product = await env.DB
    .prepare(`
      SELECT
        id,
        product_code,
        name,
        slug,
        description,
        price,
        image_url
      FROM products
      WHERE ${field} = ?
        AND is_active = 1
    `)
    .bind(value)
    .first();

  if (!product) {
    return null;
  }

  const { results: images } = await env.DB
    .prepare(`
      SELECT
        image_url AS url,
        is_primary,
        sort_order
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order
    `)
    .bind(product.id)
    .all();

  const { results: variants } = await env.DB
    .prepare(`
      SELECT
        id,
        size,
        stock_quantity AS stock
      FROM product_variants
      WHERE product_id = ?
        AND is_active = 1
      ORDER BY id
    `)
    .bind(product.id)
    .all();

  const { results: options } = await env.DB
    .prepare(`
      SELECT
        po.id,
        po.name,
        po.display_order
      FROM product_options po
      WHERE po.product_id = ?
      ORDER BY po.display_order
    `)
    .bind(product.id)
    .all();

  for (const option of options) {
    const { results: values } = await env.DB
      .prepare(`
        SELECT
          value
        FROM product_option_values
        WHERE option_id = ?
        ORDER BY display_order
      `)
      .bind(option.id)
      .all();

    option.values = values.map((item) => item.value);

    delete option.display_order;
  }

  return {
    ...product,
    images,
    variants,
    options,
  };
}

async function handleProducts(request, env, url) {
  const path = url.pathname;

  if (request.method !== "GET") {
    return json(
      { error: "Method not allowed" },
      405
    );
  }

  // GET /api/products
  if (
    path === "/api/products" ||
    path === "/api/products/"
  ) {
    const products = await getAllProducts(env);

    return json(products);
  }

  // GET /api/products/slug/:slug
  const slugMatch = path.match(
    /^\/api\/products\/slug\/([^/]+)$/
  );

  if (slugMatch) {
    const slug = decodeURIComponent(slugMatch[1]);

    const product = await getProductByField(
      env,
      "slug",
      slug
    );

    if (!product) {
      return json(
        { error: "Product not found" },
        404
      );
    }

    return json(product);
  }

  // GET /api/products/:id
  const idMatch = path.match(
    /^\/api\/products\/(\d+)$/
  );

  if (idMatch) {
    const productId = Number(idMatch[1]);

    const product = await getProductByField(
      env,
      "id",
      productId
    );

    if (!product) {
      return json(
        { error: "Product not found" },
        404
      );
    }

    return json(product);
  }

  return json(
    { error: "Product endpoint not found" },
    404
  );
}

async function handleShipping(request, env) {
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
      { error: "A valid subtotal is required" },
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
    config[setting.key] = Number(setting.value);
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
    total: subtotal + finalShippingCost,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // Admin authentication
      if (
        url.pathname.startsWith("/api/admin/")
      ) {
        if (
          !validateAdminToken(request, env)
        ) {
          return unauthorized();
        }
      }

      // Product APIs
      if (
        url.pathname.startsWith("/api/products")
      ) {
        return handleProducts(
          request,
          env,
          url
        );
      }

      // Cart validation API
      if (
        url.pathname === "/api/cart/validate"
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

        const validatedItems = [];
        let subtotal = 0;

        for (const item of body.items) {
          const variantId =
            Number(item.variant_id);

          const quantity =
            Number(item.quantity);

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
            product_id:
              variant.product_id,
            variant_id:
              variant.variant_id,
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

      // Shipping API
      if (
        url.pathname ===
        "/api/shipping/calculate"
      ) {
        return handleShipping(
          request,
          env
        );
      }

      // Future order APIs
      if (
        url.pathname.startsWith("/api/orders/")
      ) {
        return json({
          message:
            "Orders API not implemented yet",
        });
      }

      // Future checkout APIs
      if (
        url.pathname.startsWith("/api/checkout/")
      ) {
        return json({
          message:
            "Checkout API not implemented yet",
        });
      }

      // Future admin APIs
      if (
        url.pathname.startsWith("/api/admin/")
      ) {
        return json({
          message:
            "Admin API not implemented yet",
        });
      }

      // Unknown API
      if (
        url.pathname.startsWith("/api/")
      ) {
        return json(
          { error: "API endpoint not found" },
          404
        );
      }

      // Static frontend files
      return env.ASSETS.fetch(request);

    } catch (error) {
      console.error(
        "Worker error:",
        error
      );

      return json(
        {
          error: "Internal server error",
          message: error.message,
        },
        500
      );
    }
  },
};