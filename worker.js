const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const unauthorized = () => json({ error: "Unauthorized" }, 401);

function validateAdminToken(request, env) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) return false;

  const [scheme, token] = authorization.split(" ");

  return scheme === "Bearer" && token === env.ADMIN_TOKEN;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/admin/")) {
      if (!validateAdminToken(request, env)) {
        return unauthorized();
      }
    }

    if (path.startsWith("/api/products")) {
      return json({ message: "Products API not implemented yet" });
    }

    if (path.startsWith("/api/cart")) {
      return json({ message: "Cart API not implemented yet" });
    }

    if (path.startsWith("/api/orders")) {
      return json({ message: "Orders API not implemented yet" });
    }

    if (path.startsWith("/api/checkout")) {
      return json({ message: "Checkout API not implemented yet" });
    }

    if (path.startsWith("/api/admin")) {
      return json({ message: "Admin API authenticated successfully" });
    }

    if (path.startsWith("/api/webhooks")) {
      return json({ message: "Webhooks API not implemented yet" });
    }

    if (path.startsWith("/api/")) {
      return json({ error: "API endpoint not found" }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
