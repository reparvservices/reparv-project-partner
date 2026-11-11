import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  isTrialPlan,
  getSubscriptionPath,
  getSubscriptionCancelPath,
  getSubscriptionTrialPath,
  getSubscriptionTrialStatusPath,
  fetchPartnerSubscription,
  fetchPartnerTrialStatus,
  activatePartnerTrial,
  cancelPartnerSubscription,
  isSubscriptionRoute,
} from "../src/lib/partnerSubscription.js";
import {
  buildSubscriptionCheckoutBody,
  createPartnerSubscriptionSession,
  confirmPartnerSubscription,
} from "../src/utils/subscriptionAutopay.js";
import {
  parsePlanFeatures,
  planIncludesFeature,
  collectFeatureNames,
  findPlanByRef,
} from "../src/lib/subscriptionPlans.js";

// partnerAuth reads localStorage at call time; provide an empty in-memory one.
globalThis.localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };

const project = { id: 7, role: "Project Partner" };
const sales = { id: 8, role: "Sales Partner" };
const territory = { id: 9, role: "Territory Partner" };

describe("isTrialPlan", () => {
  test("detects trial by flag, type, id and name (incl. 'Free Trail' typo)", () => {
    assert.equal(isTrialPlan({ isTrial: true }), true);
    assert.equal(isTrialPlan({ plan_type: "trial" }), true);
    assert.equal(isTrialPlan({ id: "free-trial" }), true);
    assert.equal(isTrialPlan({ planName: "Free Trail", totalPrice: 0 }), true);
  });
  test("paid plans and empty input are not trials", () => {
    assert.equal(isTrialPlan({ planName: "Basic Plan", totalPrice: 2998, plan_type: "paid" }), false);
    assert.equal(isTrialPlan(null), false);
    assert.equal(isTrialPlan(undefined), false);
  });
});

describe("subscription API paths per partner role", () => {
  test("user + cancel paths", () => {
    assert.equal(getSubscriptionPath(project), "/project-partner/subscription/user/7");
    assert.equal(getSubscriptionPath(sales), "/sales/subscription/user/8");
    assert.equal(getSubscriptionPath(territory), "/territory-partner/subscription/user/9");
    assert.equal(getSubscriptionCancelPath(project), "/project-partner/subscription/cancel/7");
  });
  test("trial paths", () => {
    assert.equal(getSubscriptionTrialPath(project), "/projectpartner/subscription/activate-trial/7");
    assert.equal(getSubscriptionTrialStatusPath(sales), "/sales/subscription/trial-status/8");
  });
  test("no user id -> no path", () => {
    assert.equal(getSubscriptionPath({ role: "Project Partner" }), null);
    assert.equal(getSubscriptionPath(null), null);
  });
  test("subscription routes are recognised", () => {
    assert.equal(isSubscriptionRoute("/app/subscription"), true);
    assert.equal(isSubscriptionRoute("/app/subscription/compare-plans"), true);
    assert.equal(isSubscriptionRoute("/app/properties"), false);
  });
});

describe("checkout body", () => {
  test("normalises role/ids/numbers and defaults to autopay", () => {
    assert.deepEqual(
      buildSubscriptionCheckoutBody({ role: "Project", userId: "7", planId: "4", discountAmount: "x", finalAmount: "2998" }),
      { role: "project", user_id: 7, plan_id: 4, payment_type: "auto", discount_amount: 0, final_amount: 2998 },
    );
    assert.equal(buildSubscriptionCheckoutBody({ role: "sales", userId: 1, planId: 1, paymentType: "manual" }).payment_type, "manual");
  });
});

describe("network helpers (fetch mocked)", () => {
  const realFetch = globalThis.fetch;
  let calls;
  const mock = (status, json) => {
    globalThis.fetch = async (url, opts) => {
      calls.push({ url, opts });
      return { ok: status >= 200 && status < 300, status, json: async () => json };
    };
  };
  beforeEach(() => { calls = []; });
  afterEach(() => { globalThis.fetch = realFetch; });

  test("fetchPartnerSubscription maps the response and tolerates failures", async () => {
    mock(200, { active: true, plan_name: "Pro Plan", features: ["CRM"], trialUsed: true });
    const sub = await fetchPartnerSubscription("http://api", project);
    assert.equal(sub.active, true);
    assert.equal(sub.trial_used, true);
    assert.deepEqual(sub.features, ["CRM"]);
    assert.equal(calls[0].url, "http://api/project-partner/subscription/user/7");

    mock(500, { message: "boom" });
    assert.deepEqual((await fetchPartnerSubscription("http://api", project)).failed, true);

    globalThis.fetch = async () => { throw new Error("offline"); };
    const offline = await fetchPartnerSubscription("http://api", project);
    assert.equal(offline.active, false);
    assert.equal(offline.failed, true);
  });

  test("trial status + activation", async () => {
    mock(200, { trial_used: true, trial_active: false, days_left: "3" });
    assert.deepEqual(await fetchPartnerTrialStatus("http://api", project), { trialUsed: true, trialActive: false, daysLeft: 3 });

    mock(200, { success: true, message: "ok" });
    assert.equal((await activatePartnerTrial("http://api", project, { planId: 2 })).success, true);
    assert.equal(JSON.parse(calls.at(-1).opts.body).plan_id, 2);
    assert.equal((await activatePartnerTrial("http://api", project, {})).success, false);

    mock(400, { message: "Trial already used" });
    assert.equal((await activatePartnerTrial("http://api", project, { planId: 2 })).message, "Trial already used");
  });

  test("cancel defaults to end-of-cycle", async () => {
    mock(200, { success: true });
    await cancelPartnerSubscription("http://api", project);
    assert.equal(JSON.parse(calls[0].opts.body).cancel_at_cycle_end, true);
    mock(500, { message: "nope" });
    assert.equal((await cancelPartnerSubscription("http://api", project)).success, false);
  });

  test("create session posts the body and validates the response", async () => {
    mock(200, { razorpay_subscription_id: "sub_1" });
    const data = await createPartnerSubscriptionSession({ api: "http://api", role: "project", userId: 7, planId: 4 });
    assert.equal(data.razorpay_subscription_id, "sub_1");
    assert.equal(calls[0].url, "http://api/api/subscription/payment/create-subscription");

    mock(200, {});
    await assert.rejects(createPartnerSubscriptionSession({ api: "http://api", role: "project", userId: 7, planId: 4 }), /Invalid response/);
    await assert.rejects(createPartnerSubscriptionSession({ api: "http://api", role: "", userId: 7, planId: 4 }), /Invalid subscription checkout/);

    mock(400, { message: "Plan not found" });
    await assert.rejects(createPartnerSubscriptionSession({ api: "http://api", role: "project", userId: 7, planId: 4 }), /Plan not found/);
  });

  test("confirm sends the Razorpay signature fields to verify-subscription", async () => {
    mock(200, { success: true });
    await confirmPartnerSubscription({
      api: "http://api", role: "project", userId: 7, planId: 4,
      paymentId: "pay_1", subscriptionId: "sub_1", signature: "sig", email: "a@b.c",
    });
    const body = JSON.parse(calls[0].opts.body);
    assert.equal(calls[0].url, "http://api/api/subscription/payment/verify-subscription");
    assert.equal(body.razorpay_payment_id, "pay_1");
    assert.equal(body.razorpay_subscription_id, "sub_1");
    assert.equal(body.razorpay_signature, "sig");
  });
});

describe("plan feature parsing", () => {
  test("handles feature_names, comma strings and arrays", () => {
    assert.deepEqual(parsePlanFeatures({ feature_names: ["CRM", " Leads "] }), ["CRM", "Leads"]);
    assert.deepEqual(parsePlanFeatures({ features: "CRM, Leads,," }), ["CRM", "Leads"]);
    assert.deepEqual(parsePlanFeatures({ features: ["A", "B"] }), ["A", "B"]);
    assert.deepEqual(parsePlanFeatures(null), []);
  });
  test("includes / collect / find", () => {
    const plans = [
      { id: 1, planName: "Basic", features: "CRM, Leads" },
      { id: 2, planName: "Pro", features: "crm, Community" },
    ];
    assert.equal(planIncludesFeature(plans[0], "crm"), true);
    assert.equal(planIncludesFeature(plans[0], "community"), false);
    assert.deepEqual(collectFeatureNames(plans), ["CRM", "Leads", "Community"]);
    assert.equal(findPlanByRef(plans, "pro").id, 2);
    assert.equal(findPlanByRef(plans, { id: 1 }).planName, "Basic");
    assert.equal(findPlanByRef(plans, null), null);
  });
});
