import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseCreditLeft } from "../scripts/tier.mjs";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

const FILES = [
  "CONSTITUTION.md", "AGENT.md", "README.md",
  "memory/goals.md", "memory/journal.md", "memory/ledger.md", "memory/inbox.md", "memory/requests.md",
  "site/index.html", "site/style.css",
];

test("all required files exist", () => {
  for (const f of FILES) assert.ok(fs.existsSync(new URL(`../${f}`, import.meta.url)), `missing ${f}`);
});

test("constitution has 8 numbered rules", () => {
  const rules = read("CONSTITUTION.md").match(/^\d+\. /gm) ?? [];
  assert.equal(rules.length, 8);
});

test("AGENT.md references the scripts, the constitution and requests", () => {
  const agent = read("AGENT.md");
  for (const s of ["scripts/tier.mjs", "scripts/stripe-sales.mjs", "CONSTITUTION.md", "requests.md"]) {
    assert.ok(agent.includes(s), `AGENT.md must mention ${s}`);
  }
});

// The ledger changes every run; guard the format the tier script depends on, not a value.
test("ledger has a parseable credit line between $0 and $100", () => {
  const cents = parseCreditLeft(read("memory/ledger.md"));
  assert.notEqual(cents, null, "missing or malformed 'Credit left (est): $NN.NN' line");
  assert.ok(cents >= 0 && cents <= 10000, `credit out of range: ${cents}`);
});

test("site discloses it is AI-run", () => {
  assert.match(read("site/index.html"), /AI/);
});
