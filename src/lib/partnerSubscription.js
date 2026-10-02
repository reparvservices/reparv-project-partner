import { getSubscriptionSlugForUser } from "./partnerAuth";

function resolveSubscriptionSlug(user) {
  return getSubscriptionSlugForUser(user);
}

const SUBSCRIPTION_USER_PATH = {
  project: "/project-partner/subscription/user",
  sales: "/sales/subscription/user",
  territory: "/territory-partner/subscription/user",
};

const SUBSCRIPTION_CANCEL_PATH = {
  project: "/project-partner/subscription/cancel",
  sales: "/sales/subscription/cancel",
  territory: "/territory-partner/subscription/cancel",
};

/** Registration / legacy app mount paths */
const SUBSCRIPTION_TRIAL_PATH = {
  project: "/projectpartner/subscription/activate-trial",
  sales: "/sales/subscription/activate-trial",
  territory: "/territory-partner/subscription/activate-trial",
};

const SUBSCRIPTION_TRIAL_STATUS_PATH = {
  project: "/projectpartner/subscription/trial-status",
  sales: "/sales/subscription/trial-status",
  territory: "/territory-partner/subscription/trial-status",
};

export function isTrialPlan(plan) {
  if (!plan) return false;
  const type = String(plan.plan_type || plan.planType || "").toLowerCase();
  const name = String(
    plan.planName || plan.plan_name || plan.name || "",
  ).toLowerCase();
  const price = Number(plan.totalPrice ?? plan.price ?? NaN);

  return (
    plan.isTrial === true ||
    type === "trial" ||
    String(plan.id) === "free-trial" ||
    /trial|trail/.test(name) ||
    (Number.isFinite(price) &&
      price <= 0 &&
      /free|trial|trail/.test(name))
  );
}

export function getSubscriptionTrialPath(user) {
  const slug = resolveSubscriptionSlug(user);
  if (!slug || !user?.id) return null;
  const base = SUBSCRIPTION_TRIAL_PATH[slug];
  return base ? `${base}/${user.id}` : null;
}

export function getSubscriptionTrialStatusPath(user) {
  const slug = resolveSubscriptionSlug(user);
  if (!slug || !user?.id) return null;
  const base = SUBSCRIPTION_TRIAL_STATUS_PATH[slug];
  return base ? `${base}/${user.id}` : null;
}

/** @returns {Promise<{ trialUsed: boolean, trialActive: boolean, daysLeft: number }>} */
export async function fetchPartnerTrialStatus(apiBase, user) {
  const path = getSubscriptionTrialStatusPath(user);
  if (!path) {
    return { trialUsed: false, trialActive: false, daysLeft: 0 };
  }

  try {
    const res = await fetch(`${apiBase}${path}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { trialUsed: false, trialActive: false, daysLeft: 0 };
    }
    return {
      trialUsed: Boolean(data.trialUsed ?? data.trial_used),
      trialActive: Boolean(data.trialActive ?? data.trial_active),
      daysLeft: Number(data.daysLeft ?? data.days_left) || 0,
    };
  } catch {
    return { trialUsed: false, trialActive: false, daysLeft: 0 };
  }
}

export async function activatePartnerTrial(apiBase, user, { planId }) {
  const path = getSubscriptionTrialPath(user);
  if (!path || !planId) {
    return { success: false, message: "Invalid trial plan or partner" };
  }

  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan_id: Number(planId) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    return {
      success: false,
      message: data?.message || "Failed to start free trial",
    };
  }
  return { success: true, ...data };
}

export function getSubscriptionPath(user) {
  const slug = resolveSubscriptionSlug(user);
  if (!slug || !user?.id) return null;
  const base = SUBSCRIPTION_USER_PATH[slug];
  return base ? `${base}/${user.id}` : null;
}

export function getSubscriptionCancelPath(user) {
  const slug = resolveSubscriptionSlug(user);
  if (!slug || !user?.id) return null;
  const base = SUBSCRIPTION_CANCEL_PATH[slug];
  return base ? `${base}/${user.id}` : null;
}

/**
 * Cancel partner subscription via Razorpay.
 * @param {boolean} cancelAtCycleEnd — default true (access until period end)
 */
export async function cancelPartnerSubscription(apiBase, user, { cancelAtCycleEnd = true } = {}) {
  const path = getSubscriptionCancelPath(user);
  if (!path) {
    return { success: false, message: "Unsupported partner role" };
  }

  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Failed to cancel subscription" };
  }
  return data;
}

/**
 * @returns {Promise<{ active: boolean, plan_name?: string, start_date?: string, end_date?: string, next_billing_date?: string, status?: string, raw?: object }>}
 */
export async function fetchPartnerSubscription(apiBase, user) {
  const path = getSubscriptionPath(user);
  if (!path) {
    return { active: false };
  }

  try {
    const res = await fetch(`${apiBase}${path}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { active: false, raw: data };
    }
    return {
      active: Boolean(data?.active),
      trial_used: Boolean(data?.trial_used ?? data?.trialUsed),
      plan_name: data?.plan_name || data?.planName,
      planDuration: data?.planDuration,
      amount: data?.amount,
      start_date: data?.start_date,
      end_date: data?.end_date,
      next_billing_date: data?.next_billing_date,
      status: data?.status,
      plan_id: data?.plan_id,
      plan_type: data?.plan_type,
      features: Array.isArray(data?.features) ? data.features : [],
      all_features: Boolean(data?.all_features),
      raw: data,
    };
  } catch {
    return { active: false };
  }
}

export const SUBSCRIPTION_ROUTES = [
  "/app/subscription",
  "/app/subscription/compare-plans",
];

export function isSubscriptionRoute(pathname) {
  return SUBSCRIPTION_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
