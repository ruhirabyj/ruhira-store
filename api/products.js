import { json } from "../utils/response.js";

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

    option.values = values.map(
      (item) => item.value
    );

    delete option.display_order;
  }

  return {
    ...product,
    images,
    variants,
    options,
  };
}

export async function handleProducts(
  request,
  env,
  url
) {
  const path = url.pathname;

  if (request.method !== "GET") {
    return json(
      { error: "Method not allowed" },
      405
    );
  }

  if (
    path === "/api/products" ||
    path === "/api/products/"
  ) {
    const products = await getAllProducts(env);

    return json(products);
  }

  const slugMatch = path.match(
    /^\/api\/products\/slug\/([^/]+)$/
  );

  if (slugMatch) {
    const slug = decodeURIComponent(
      slugMatch[1]
    );

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
