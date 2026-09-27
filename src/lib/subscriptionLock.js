/** Routes that stay fully usable without an active subscription */
export const SUBSCRIPTION_UNLOCKED_PATHS = [
  "/app/subscription",
  "/app/profile",
  "/app/edit-profile",
  "/app/subscription/compare-plans",
];

export function isSubscriptionExemptPath(pathname = "") {
  return SUBSCRIPTION_UNLOCKED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

const ROUTE_FEATURE_TITLES = [
  { prefix: "/app/dashboard", title: "Dashboard" },
  { prefix: "/app/properties", title: "Properties" },
  { prefix: "/app/property", title: "Properties" },
  { prefix: "/app/enquir", title: "Enquiries" },
  { prefix: "/app/customers", title: "Customers" },
  { prefix: "/app/builders", title: "Builders" },
  { prefix: "/app/sales-partner", title: "Sales Partners" },
  { prefix: "/app/territory-partner", title: "Territory Partners" },
  { prefix: "/app/employees", title: "Employees" },
  { prefix: "/app/tickets", title: "Tickets" },
  { prefix: "/app/calendar", title: "Calendar" },
  { prefix: "/app/feed", title: "Feed" },
  { prefix: "/app/community", title: "Community" },
  { prefix: "/app/network", title: "Network" },
  { prefix: "/app/notifications", title: "Notifications" },
  { prefix: "/app/menu", title: "Menu" },
  { prefix: "/app/invite", title: "Referrals" },
];

export function getFeatureTitleForPath(pathname = "") {
  const hit = ROUTE_FEATURE_TITLES.find(({ prefix }) =>
    pathname.startsWith(prefix),
  );
  return hit?.title || "Partner tools";
}

/* ------------------------------------------------------------------ */
/* Feature locks: a plan unlocks panel areas by its features          */
/* ------------------------------------------------------------------ */

/**
 * subscription_features names (edit on a plan in admin → Subscription Pricing).
 * Keep in sync with reparv-server/src/portals/subscription/utils/partnerFeatures.js
 */
export const PARTNER_FEATURES = {
  PROPERTIES: "Unlimited Property Uploading",
  LEADS: "Lead Management System",
  CRM: "CRM Access",
  TEAM: "Team Development Support",
  SITE_VISITS: "Sites Visit",
  COMMUNITY: "Business community",
};

/** Panel pages -> feature the plan must include. Pages not listed stay open. */
const ROUTE_FEATURES = [
  { prefix: "/app/propert", feature: PARTNER_FEATURES.PROPERTIES },
  { prefix: "/app/enquir", feature: PARTNER_FEATURES.LEADS },
  { prefix: "/app/customers", feature: PARTNER_FEATURES.CRM },
  { prefix: "/app/builder", feature: PARTNER_FEATURES.CRM },
  { prefix: "/app/employee", feature: PARTNER_FEATURES.CRM },
  { prefix: "/app/sales-partner", feature: PARTNER_FEATURES.TEAM },
  { prefix: "/app/territory-partner", feature: PARTNER_FEATURES.TEAM },
  { prefix: "/app/calendar", feature: PARTNER_FEATURES.SITE_VISITS },
  { prefix: "/app/feed", feature: PARTNER_FEATURES.COMMUNITY },
  { prefix: "/app/community", feature: PARTNER_FEATURES.COMMUNITY },
  { prefix: "/app/network", feature: PARTNER_FEATURES.COMMUNITY },
];

export function getRequiredFeature(pathname = "") {
  return ROUTE_FEATURES.find(({ prefix }) => pathname.startsWith(prefix))?.feature || null;
}

export function hasFeature(subscription, feature) {
  if (!feature) return true;
  if (!subscription?.active) return false;
  if (subscription.all_features) return true;
  const unlocked = (subscription.features || []).map((f) => String(f).toLowerCase());
  return unlocked.includes(feature.toLowerCase());
}

/**
 * Lock state for a page. Feature locks apply to Project Partners (plans exist
 * for that role); other roles keep their previous behaviour.
 * @returns {{ locked: boolean, reason?: "subscribe" | "upgrade", feature?: string }}
 */
export function getLockState(subscription, pathname, role) {
  if (role !== "Project Partner") return { locked: false };
  if (isSubscriptionExemptPath(pathname)) return { locked: false };
  const feature = getRequiredFeature(pathname);
  if (!feature) return { locked: false };
  if (!subscription?.active) return { locked: true, reason: "subscribe", feature };
  if (!hasFeature(subscription, feature)) return { locked: true, reason: "upgrade", feature };
  return { locked: false };
}
