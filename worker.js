import { handleOrders } from "./handlers/orders.js";

import {
  json,
  unauthorized,
} from "./utils/response.js";

import {
  validateAdminToken,
} from "./utils/admin-auth.js";

import {
  handleProducts,
} from "./api/products.js";

import {
  handleCart,
} from "./api/cart.js";

import {
  handleShipping,
} from "./api/shipping.js";

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

      // Cart APIs
      if (
        url.pathname === "/api/cart" ||
        url.pathname === "/api/cart/" ||
        url.pathname.startsWith("/api/cart/")
      ) {
        return handleCart(
          request,
          env,
	  url
        );
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

      // order APIs
      if (
        url.pathname === "/api/orders" ||
        url.pathname === "/api/orders/" ||
        url.pathname.startsWith("/api/orders/")
      ) {
        return handleOrders(request, env, url);
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
          {
            error:
              "API endpoint not found",
          },
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
          error:
            "Internal server error",
          message: error.message,
        },
        500
      );
    }
  },
};
