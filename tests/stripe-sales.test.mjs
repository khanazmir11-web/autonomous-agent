import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeSales } from "../scripts/stripe-sales.mjs";

const charge = (amount, extra = {}) => ({
  id: `ch_${Math.random().toString(36).slice(2)}`,
  amount, paid: true, refunded: false, status: "succeeded", currency: "usd", ...extra,
});

const json = (body, status = 200) => ({
  ok: status >= 200 && status < 300, status,
  json: async () => body, text: async () => JSON.stringify(body),
});

// Fake Stripe: routes by path, records requested URLs.
function fakeStripe({ pages = [{ has_more: false, data: [] }], balance, status = 200 } = {}) {
  const calls = [];
  let page = 0;
  const fetchImpl = async (url) => {
    calls.push(url);
    if (status !== 200) return json({ error: { message: "Invalid API Key" } }, status);
    if (url.includes("/v1/charges")) return json(pages[page++]);
    if (url.includes("/v1/balance")) return json(balance ?? { available: [], pending: [] });
    throw new Error("unexpected url " + url);
  };
  return { fetchImpl, calls };
}

test("no key returns ok:false with a clear message", async () => {
  const r = await summarizeSales({ key: undefined });
  assert.deepEqual(r, { ok: false, message: "STRIPE_READ_KEY not set" });
});

test("401 from Stripe returns ok:false mentioning 401", async () => {
  const { fetchImpl } = fakeStripe({ status: 401 });
  const r = await summarizeSales({ key: "rk_test", fetchImpl });
  assert.equal(r.ok, false);
  assert.match(r.message, /401/);
});

test("network error returns ok:false instead of throwing", async () => {
  const r = await summarizeSales({ key: "rk_test", fetchImpl: async () => { throw new Error("ECONNRESET"); } });
  assert.equal(r.ok, false);
  assert.match(r.message, /ECONNRESET/);
});

test("counts only paid, non-refunded, succeeded charges", async () => {
  const { fetchImpl } = fakeStripe({
    pages: [{ has_more: false, data: [
      charge(1000),
      charge(500, { refunded: true }),
      charge(700, { paid: false, status: "failed" }),
    ] }],
  });
  const r = await summarizeSales({ key: "rk_test", fetchImpl });
  assert.equal(r.ok, true);
  assert.equal(r.grossCents, 1000);
  assert.equal(r.count, 1);
  assert.equal(r.currency, "usd");
});

test("paginates with starting_after until has_more is false", async () => {
  const page1 = Array.from({ length: 100 }, (_, i) => charge(100, { id: `ch_${i + 1}` }));
  const { fetchImpl, calls } = fakeStripe({
    pages: [{ has_more: true, data: page1 }, { has_more: false, data: [charge(100)] }],
  });
  const r = await summarizeSales({ key: "rk_test", fetchImpl });
  assert.equal(r.count, 101);
  assert.equal(r.grossCents, 10100);
  const chargeCalls = calls.filter((u) => u.includes("/v1/charges"));
  assert.equal(chargeCalls.length, 2);
  assert.match(chargeCalls[1], /starting_after=ch_100/);
});

test("reads available and pending balance", async () => {
  const { fetchImpl } = fakeStripe({
    balance: { available: [{ amount: 900, currency: "usd" }], pending: [{ amount: 100, currency: "usd" }] },
  });
  const r = await summarizeSales({ key: "rk_test", fetchImpl });
  assert.equal(r.availableCents, 900);
  assert.equal(r.pendingCents, 100);
});

test("sends the key as a Bearer token and filters by sinceUnix", async () => {
  const seen = [];
  const fetchImpl = async (url, init) => {
    seen.push({ url, auth: init?.headers?.Authorization });
    return json(url.includes("/v1/charges") ? { has_more: false, data: [] } : { available: [], pending: [] });
  };
  await summarizeSales({ key: "rk_test_abc", fetchImpl, sinceUnix: 1700000000 });
  assert.ok(seen.every((s) => s.auth === "Bearer rk_test_abc"));
  assert.match(seen[0].url, /created%5Bgte%5D=1700000000|created\[gte\]=1700000000/);
});

test("partial refunds count net, disputed charges are excluded", async () => {
  const { fetchImpl } = fakeStripe({
    pages: [{ has_more: false, data: [
      charge(1500, { amount_refunded: 1400 }),
      charge(900, { disputed: true }),
      charge(1000),
    ] }],
  });
  const r = await summarizeSales({ key: "rk_test", fetchImpl });
  assert.equal(r.grossCents, 100 + 1000);
  assert.equal(r.count, 2);
});
