/**
 * Razorpay Subscriptions (autopay) checkout for partner apps.
 * Canonical server routes (public, no JWT — uses body role + user_id):
 *   POST /api/subscription/payment/create-subscription
 *   POST /api/subscription/payment/verify-subscription
 */

const CHECKOUT_BASE = "/api/subscription/payment";

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

  const res = await fetch(`${api}${CHECKOUT_BASE}/verify-subscription`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return parseJsonResponse(res);
}
