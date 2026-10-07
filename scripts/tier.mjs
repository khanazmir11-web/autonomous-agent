// Survival tier from estimated credit left, run count, owner checks and today's date.
// CLI: node scripts/tier.mjs  (reads memory/ledger.md, prints JSON)
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const FINAL_DATE = "2026-11-04"; // credit expires 2026-11-05
const FRUGAL_MAX_CENTS = 3000;
const FINAL_BELOW_CENTS = 1000;
const OWNER_CHECK_MAX_DAYS = 7;
// Hard cap that doesn't depend on the agent's own cost estimates.
// Owner: recalibrate once real per-run cost is known (≈ $100 / cost per run, minus margin).
export const MAX_RUNS = 40;

const daysBetween = (from, to) => (Date.parse(to) - Date.parse(from)) / 86_400_000;

export function tierFor({ creditLeftCents, today, runCount = 0, ownerCheckDate }) {
  if (today >= FINAL_DATE) return "final";
  if (runCount >= MAX_RUNS) return "final";
  if (creditLeftCents == null) return "frugal";
  if (creditLeftCents < FINAL_BELOW_CENTS) return "final";
  if (creditLeftCents <= FRUGAL_MAX_CENTS) return "frugal";
  if (ownerCheckDate && daysBetween(ownerCheckDate, today) > OWNER_CHECK_MAX_DAYS) return "frugal";
  return "normal";
}

export function parseCreditLeft(ledgerText) {
  const m = /^\**Credit left \(est\):\**\s*(-?)\$(-?)(\d[\d,]*(?:\.\d{1,2})?)\s*$/m.exec(ledgerText);
  if (!m) return null;
  const cents = Math.round(Number(m[3].replaceAll(",", "")) * 100);
  return m[1] || m[2] ? -cents : cents;
}

export function parseLedger(ledgerText) {
  return {
    creditLeftCents: parseCreditLeft(ledgerText),
    runCount: (ledgerText.match(/^\| \d{4}-\d{2}-\d{2}/gm) ?? []).length,
    ownerCheckDate: /^Owner credit check: (\d{4}-\d{2}-\d{2})\s*$/m.exec(ledgerText)?.[1] ?? null,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let text = "";
  try { text = fs.readFileSync(new URL("../memory/ledger.md", import.meta.url), "utf8"); } catch {}
  const ledger = parseLedger(text);
  const today = new Date().toISOString().slice(0, 10);
  const out = { tier: tierFor({ ...ledger, today }), ...ledger, maxRuns: MAX_RUNS, today };
  if (ledger.creditLeftCents == null) out.warning = "credit unknown";
  console.log(JSON.stringify(out));
}
