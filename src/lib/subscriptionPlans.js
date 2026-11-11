/** Parse feature list from partner-plans API row */
export function parsePlanFeatures(plan) {
  if (Array.isArray(plan?.feature_names) && plan.feature_names.length) {
    return plan.feature_names.map((f) => String(f).trim()).filter(Boolean);
  }
  if (typeof plan?.features === "string" && plan.features.trim()) {
    return plan.features.split(",").map((f) => f.trim()).filter(Boolean);
  }
  if (Array.isArray(plan?.features)) {
    return plan.features.map((f) => String(f).trim()).filter(Boolean);
  }
  return [];
}

export function planIncludesFeature(plan, featureName) {
  const needle = String(featureName || "").trim().toLowerCase();
  if (!needle) return false;
  return parsePlanFeatures(plan).some((f) => f.toLowerCase() === needle);
}

/** Unique feature names across all plans (preserve first-seen casing) */
export function collectFeatureNames(plans = []) {
  const map = new Map();
  for (const plan of plans) {
    for (const name of parsePlanFeatures(plan)) {
      const key = name.toLowerCase();
      if (!map.has(key)) map.set(key, name);
    }
  }
  return Array.from(map.values());
}

export function findPlanByRef(plans, ref) {
  if (!ref) return null;
  if (typeof ref === "object") {
    const id = ref.id ?? ref.planId;
    const name = ref.planName ?? ref.plan_name;
    if (id != null) {
      const hit = plans.find((p) => String(p.id) === String(id));
      if (hit) return hit;
    }
    if (name) {
      const hit = plans.find(
        (p) => String(p.planName).toLowerCase() === String(name).toLowerCase(),
      );
      if (hit) return hit;
    }
    return ref;
  }
  const byName = plans.find(
    (p) => String(p.planName).toLowerCase() === String(ref).toLowerCase(),
  );
  return byName || null;
}
