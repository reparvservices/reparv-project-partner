import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  PARTNER_FEATURES as F,
  getRequiredFeature,
  hasFeature,
  getLockState,
  isSubscriptionExemptPath,
} from "../src/lib/subscriptionLock.js";

const PP = "Project Partner";
const trial = { active: true, features: [F.PROPERTIES, F.LEADS, F.CRM, F.COMMUNITY].map((f) => f.toLowerCase()) };
const basic = { active: true, features: [...trial.features, F.TEAM.toLowerCase()] };
const enterprise = { active: true, all_features: true, features: [] };

describe("getRequiredFeature", () => {
  const cases = [
    ["/app/properties", F.PROPERTIES],
    ["/app/property/add", F.PROPERTIES],
    ["/app/enquiries", F.LEADS],
    ["/app/enquiry/add", F.LEADS],
    ["/app/customers", F.CRM],
    ["/app/builder/add", F.CRM],
    ["/app/employees", F.CRM],
    ["/app/sales-partners", F.TEAM],
    ["/app/territory-partner/add", F.TEAM],
    ["/app/calendar", F.SITE_VISITS],
    ["/app/calendar/event/add", F.SITE_VISITS],
    ["/app/feed", F.COMMUNITY],
    ["/app/community", F.COMMUNITY],
  ];
  for (const [path, feature] of cases) {
    test(`${path} → ${feature}`, () => assert.equal(getRequiredFeature(path), feature));
  }
  test("dashboard, tickets, profile need no feature", () => {
    for (const path of ["/app/dashboard", "/app/tickets", "/app/profile", "/app/menu"]) {
      assert.equal(getRequiredFeature(path), null, path);
    }
  });
});

describe("hasFeature", () => {
  test("matches case-insensitively", () => {
    assert.equal(hasFeature(trial, F.CRM), true);
    assert.equal(hasFeature(trial, F.TEAM), false);
  });
  test("enterprise unlocks everything", () => {
    for (const f of Object.values(F)) assert.equal(hasFeature(enterprise, f), true, f);
  });
  test("inactive plan unlocks nothing", () => {
    assert.equal(hasFeature({ ...basic, active: false }, F.CRM), false);
  });
});

describe("getLockState", () => {
  test("no plan → subscribe", () => {
    assert.deepEqual(getLockState({ active: false }, "/app/properties", PP), {
      locked: true, reason: "subscribe", feature: F.PROPERTIES,
    });
  });
  test("plan without the feature → upgrade", () => {
    assert.deepEqual(getLockState(trial, "/app/sales-partners", PP), {
      locked: true, reason: "upgrade", feature: F.TEAM,
    });
    assert.equal(getLockState(trial, "/app/calendar", PP).reason, "upgrade");
  });
  test("plan with the feature → open", () => {
    assert.equal(getLockState(basic, "/app/sales-partners", PP).locked, false);
    assert.equal(getLockState(trial, "/app/properties", PP).locked, false);
  });
  test("subscription and profile pages never lock", () => {
    for (const path of ["/app/subscription", "/app/subscription/compare-plans", "/app/profile", "/app/edit-profile"]) {
      assert.equal(isSubscriptionExemptPath(path), true, path);
      assert.equal(getLockState({ active: false }, path, PP).locked, false, path);
    }
  });
  test("sales and territory partners are not feature-locked", () => {
    assert.equal(getLockState({ active: false }, "/app/enquiries", "Sales Partner").locked, false);
    assert.equal(getLockState({ active: false }, "/app/enquiries", "Territory Partner").locked, false);
  });
});
