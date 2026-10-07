import { test } from "node:test";
import assert from "node:assert/strict";
import { tierFor, parseCreditLeft } from "../scripts/tier.mjs";

const today = "2026-10-07";

test("more than $30 left is normal", () => {
  assert.equal(tierFor({ creditLeftCents: 3001, today }), "normal");
});

test("exactly $30 and exactly $10 are frugal", () => {
  assert.equal(tierFor({ creditLeftCents: 3000, today }), "frugal");
  assert.equal(tierFor({ creditLeftCents: 1000, today }), "frugal");
});

test("under $10 is final", () => {
  assert.equal(tierFor({ creditLeftCents: 999, today }), "final");
});

test("on or after 2026-11-04 is final regardless of credit", () => {
  assert.equal(tierFor({ creditLeftCents: 9000, today: "2026-11-04" }), "final");
  assert.equal(tierFor({ creditLeftCents: 9000, today: "2026-11-20" }), "final");
  assert.equal(tierFor({ creditLeftCents: 9000, today: "2026-11-03" }), "normal");
});

test("unknown credit is frugal", () => {
  assert.equal(tierFor({ creditLeftCents: null, today }), "frugal");
});

test("parseCreditLeft reads the ledger line in cents", () => {
  assert.equal(parseCreditLeft("Starting credit: $100.00\nCredit left (est): $42.50\n"), 4250);
  assert.equal(parseCreditLeft("Credit left (est): $100.00"), 10000);
});

test("parseCreditLeft returns null for missing or malformed lines", () => {
  assert.equal(parseCreditLeft("garbage"), null);
  assert.equal(parseCreditLeft("Credit left (est): $abc"), null);
  assert.equal(parseCreditLeft(""), null);
});
