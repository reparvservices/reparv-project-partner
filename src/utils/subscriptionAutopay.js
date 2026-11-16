/**
 * Razorpay Subscriptions (autopay) checkout for partner apps.
 * Server routes (login cookie required; body user_id/role must be the logged-in partner):
 *   POST /api/subscription/payment/create-subscription
 *   POST /api/subscription/payment/verify-subscription
 */

const CHECKOUT_BASE = "/api/subscription/payment";

/**
 * Thrown when the customer was charged but the server could not confirm it right now
 * (network drop, 5xx). The charge is safe: the server activates it from Razorpay's webhook.
 */
export class PaymentUnconfirmedError extends Error {
  constructor(paymentId) {
    super(
      "Your payment was received, but we couldn't confirm it yet. Your plan will activate " +
        "automatically in a few minutes. If it doesn't, contact support" +
        (paymentId ? ` with payment ID ${paymentId}.` : "."),
    );
    this.name = "PaymentUnconfirmedError";
    this.paymentId = paymentId;
  }
}

/** Network failure, 5xx, or the server asking us to retry (409 + retry flag). */
export function isTransientError(err) {
  if (!err) return false;
  if (!err.status) return true; // fetch rejected (offline / DNS / aborted)
  return err.status >= 500 || (err.status === 409 && err.data?.retry === true);
}

/** Retry `fn` on transient errors with a growing delay; other errors are thrown immediately. */
export async function retryTransient(fn, { attempts = 4, baseDelayMs = 1500 } = {}) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isTransientError(err) || i === attempts - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * (i + 1)));
    }
  }
  throw lastError;
}

export function buildSubscriptionCheckoutBody({
  role,
  userId,
  planId,
  discountAmount = 0,
  finalAmount = 0,
  paymentType = "auto",
}) {
  return {
    role: String(role || "").toLowerCase(),
    user_id: Number(userId),
    plan_id: Number(planId),
    payment_type: paymentType === "manual" ? "manual" : "auto",
    discount_amount: Number(discountAmount) || 0,
    final_amount: Number(finalAmount) || 0,
  };
}

async function parseJsonResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data?.message ||
      data?.error?.description ||
      `Subscription request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Start Razorpay Subscriptions (recurring autopay) checkout.
 */
export async function createPartnerSubscriptionSession({
  api,
  role,
  userId,
  planId,
  discountAmount = 0,
  finalAmount = 0,
}) {
  const body = buildSubscriptionCheckoutBody({
    role,
    userId,
    planId,
    discountAmount,
    finalAmount,
    paymentType: "auto",
  });

  if (!body.role || !body.user_id || !body.plan_id) {
    throw new Error("Invalid subscription checkout: role, user, and plan are required.");
  }

  const res = await fetch(`${api}${CHECKOUT_BASE}/create-subscription`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await parseJsonResponse(res);

  if (!data.razorpay_subscription_id) {
    throw new Error(data.message || "Invalid response from subscription server");
  }

  return data;
}

/**
 * Opens Razorpay Checkout in subscription mode (autopay mandate).
 */
export function openRazorpaySubscriptionCheckout({
  keyId,
  subscriptionId,
  name,
  description,
  email,
  contact,
}) {
  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      subscription_id: subscriptionId,
      name: name || "Reparv",
      description: description || "Partner subscription",
      handler(response) {
        resolve(response);
      },
      modal: {
        ondismiss() {
          reject(new Error("Checkout closed"));
        },
      },
      prefill: {
        email: email || "",
        contact: contact || "",
      },
      theme: { color: "#5E23DC" },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (err) => {
      reject(err || new Error("Payment failed"));
    });
    rzp.open();
  });
}

export async function confirmPartnerSubscription({
  api,
  role,
  userId,
  planId,
  paymentId,
  subscriptionId,
  signature,
  email,
  discountAmount = 0,
  finalAmount = 0,
}) {
  const body = {
    ...buildSubscriptionCheckoutBody({
      role,
      userId,
      planId,
      discountAmount,
      finalAmount,
    }),
    razorpay_payment_id: paymentId,
    razorpay_subscription_id: subscriptionId,
    razorpay_signature: signature,
    email: email || "",
  };

  try {
    return await retryTransient(async () => {
      const res = await fetch(`${api}${CHECKOUT_BASE}/verify-subscription`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return parseJsonResponse(res);
    });
  } catch (err) {
    // The customer has already paid: don't report a plain "payment failed".
    if (isTransientError(err)) throw new PaymentUnconfirmedError(paymentId);
    throw err;
  }
}
