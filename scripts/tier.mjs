// Survival tier from estimated credit left and today's date.
// CLI: node scripts/tier.mjs  (reads memory/ledger.md, prints JSON)
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const FINAL_DATE = "2026-11-04"; // credit expires 2026-11-05
const FRUGAL_MAX_CENTS = 3000;
const FINAL_BELOW_CENTS = 1000;

export function tierFor({ creditLeftCents, today }) {
  if (today >= FINAL_DATE) return "final";
  if (creditLeftCents == null) return "frugal";
  if (creditLeftCents < FINAL_BELOW_CENTS) return "final";
  if (creditLeftCents <= FRUGAL_MAX_CENTS) return "frugal";
  return "normal";
}

export function parseCreditLeft(ledgerText) {
  const m = /^Credit left \(est\): \$(\d+(?:\.\d{1,2})?)\s*$/m.exec(ledgerText);
  return m ? Math.round(Number(m[1]) * 100) : null;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let text = "";
  try { text = fs.readFileSync("memory/ledger.md", "utf8"); } catch {}
  const creditLeftCents = parseCreditLeft(text);
  const today = new Date().toISOString().slice(0, 10);
  const out = { tier: tierFor({ creditLeftCents, today }), creditLeftCents, today };
  if (creditLeftCents == null) out.warning = "credit unknown";
  console.log(JSON.stringify(out));
}
