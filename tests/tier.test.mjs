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

// Final-review fixes: hard caps the agent cannot misjudge.
import { parseLedger, MAX_RUNS } from "../scripts/tier.mjs";

test("negative credit (either sign position) is final", () => {
  assert.equal(parseCreditLeft("Credit left (est): -$0.75"), -75);
  assert.equal(parseCreditLeft("Credit left (est): $-1.50"), -150);
  assert.equal(tierFor({ creditLeftCents: -75, today }), "final");
});

test("bold label and thousands separator still parse", () => {
  assert.equal(parseCreditLeft("**Credit left (est):** $5.00"), 500);
  assert.equal(parseCreditLeft("Credit left (est): $1,000.00"), 100000);
});

test("reaching MAX_RUNS is final even with credit left", () => {
  assert.equal(tierFor({ creditLeftCents: 9000, today, runCount: MAX_RUNS }), "final");
  assert.equal(tierFor({ creditLeftCents: 9000, today, runCount: MAX_RUNS - 1 }), "normal");
});

test("no owner credit check for more than 7 days caps the tier at frugal", () => {
  assert.equal(tierFor({ creditLeftCents: 9000, today: "2026-10-15", ownerCheckDate: "2026-10-07" }), "frugal");
  assert.equal(tierFor({ creditLeftCents: 9000, today: "2026-10-14", ownerCheckDate: "2026-10-07" }), "normal");
  assert.equal(tierFor({ creditLeftCents: 500, today: "2026-10-15", ownerCheckDate: "2026-10-07" }), "final");
});

test("parseLedger counts run rows and reads the owner check date", () => {
  const text = [
    "Credit left (est): $97.00",
    "Owner credit check: 2026-10-09",
    "| Date (UTC) | Tier | Task | Credit used (est) | Credit left (est) |",
    "|---|---|---|---|---|",
    "| 2026-10-07 02:30 | normal | a | $1.50 | $98.50 |",
    "| 2026-10-07 21:00 | normal | b | $1.50 | $97.00 |",
  ].join("\n");
  assert.deepEqual(parseLedger(text), { creditLeftCents: 9700, runCount: 2, ownerCheckDate: "2026-10-09" });
});
