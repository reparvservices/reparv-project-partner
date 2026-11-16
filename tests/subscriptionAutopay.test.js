import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  isTransientError,
  retryTransient,
  PaymentUnconfirmedError,
} from "../src/utils/subscriptionAutopay.js";

const httpErr = (status, data = {}) => Object.assign(new Error(`HTTP ${status}`), { status, data });

describe("isTransientError", () => {
  test("network failures (no status) are transient", () => {
    assert.equal(isTransientError(new TypeError("Failed to fetch")), true);
  });
  test("5xx is transient", () => {
    assert.equal(isTransientError(httpErr(500)), true);
    assert.equal(isTransientError(httpErr(503)), true);
  });
  test("409 is transient only when the server says retry", () => {
    assert.equal(isTransientError(httpErr(409, { retry: true })), true);
    assert.equal(isTransientError(httpErr(409, { message: "already used" })), false);
  });
  test("other 4xx are final (bad signature, unauthorized...)", () => {
    for (const s of [400, 401, 403, 404]) assert.equal(isTransientError(httpErr(s)), false);
  });
});

describe("retryTransient", () => {
  const fast = { attempts: 4, baseDelayMs: 1 };

  test("returns the first success without retrying", async () => {
    let calls = 0;
    const out = await retryTransient(async () => (calls += 1, "ok"), fast);
    assert.equal(out, "ok");
    assert.equal(calls, 1);
  });

  test("retries a transient failure, then succeeds", async () => {
    let calls = 0;
    const out = await retryTransient(async () => {
      calls += 1;
      if (calls < 3) throw httpErr(502);
      return "activated";
    }, fast);
    assert.equal(out, "activated");
    assert.equal(calls, 3);
  });

  test("does not retry a final error", async () => {
    let calls = 0;
    await assert.rejects(
      retryTransient(async () => {
        calls += 1;
        throw httpErr(400);
      }, fast),
      /HTTP 400/,
    );
    assert.equal(calls, 1);
  });

  test("gives up after the last attempt and throws the transient error", async () => {
    let calls = 0;
    await assert.rejects(
      retryTransient(async () => {
        calls += 1;
        throw httpErr(500);
      }, fast),
      /HTTP 500/,
    );
    assert.equal(calls, 4);
  });
});

describe("PaymentUnconfirmedError", () => {
  test("tells the customer the payment was received and includes the payment id", () => {
    const err = new PaymentUnconfirmedError("pay_123");
    assert.equal(err.name, "PaymentUnconfirmedError");
    assert.match(err.message, /payment was received/i);
    assert.match(err.message, /pay_123/);
  });
});
