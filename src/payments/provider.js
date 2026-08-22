import * as cashfree from "./cashfree.js";

export function getPaymentProvider(env) {
  const provider = env.PAYMENT_PROVIDER || "cashfree";

  switch (provider) {
    case "cashfree":
      return cashfree;

    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
}

export async function createPayment(env, order) {
  const provider = getPaymentProvider(env);

  return provider.createPayment(env, order);
}

export async function getPaymentStatus(env, order) {
  const provider = getPaymentProvider(env);

  return provider.getPaymentStatus(env, order);
}

export async function verifyWebhook(env, request) {
  const provider = getPaymentProvider(env);

  return provider.verifyWebhook(env, request);
}
