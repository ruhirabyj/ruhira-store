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
  if (path === "/api/products" || path === "/api/products/") {
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // Admin authentication
      if (url.pathname.startsWith("/api/admin/")) {
        if (!validateAdminToken(request, env)) {
          return unauthorized();
        }
      }

      // Product APIs
      if (url.pathname.startsWith("/api/products")) {
        return handleProducts(request, env, url);
      }

      // Temporary placeholders for future phases
      if (url.pathname.startsWith("/api/cart/")) {
        return json({
          message: "Cart API not implemented yet",
        });
      }

      if (url.pathname.startsWith("/api/orders/")) {
        return json({
          message: "Orders API not implemented yet",
        });
      }

      if (url.pathname.startsWith("/api/checkout/")) {
        return json({
          message: "Checkout API not implemented yet",
        });
      }

      if (url.pathname.startsWith("/api/admin/")) {
        return json({
          message: "Admin API not implemented yet",
        });
      }

      if (url.pathname.startsWith("/api/")) {
        return json(
          { error: "API endpoint not found" },
          404
        );
      }

      return env.ASSETS.fetch(request);

    } catch (error) {
      console.error("Worker error:", error);

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