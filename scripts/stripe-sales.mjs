// Read-only Stripe sales summary. Uses only GET requests; never creates, refunds or transfers.
// CLI: node scripts/stripe-sales.mjs  (reads STRIPE_READ_KEY, prints JSON, always exits 0)
import { pathToFileURL } from "node:url";

const API = "https://api.stripe.com/v1";

async function get(path, key, fetchImpl) {
  const res = await fetchImpl(`${API}${path}`, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`Stripe ${res.status}: ${await res.text()}`);
  return res.json();
}

const sumCurrency = (entries = [], currency) =>
  entries.filter((e) => e.currency === currency).reduce((s, e) => s + e.amount, 0);

export async function summarizeSales({ key, fetchImpl = fetch, sinceUnix = 0 }) {
  if (!key) return { ok: false, message: "STRIPE_READ_KEY not set" };
  try {
    const charges = [];
    let startingAfter;
    do {
      const params = new URLSearchParams({ limit: "100", "created[gte]": String(sinceUnix) });
      if (startingAfter) params.set("starting_after", startingAfter);
      const page = await get(`/charges?${params}`, key, fetchImpl);
      charges.push(...page.data);
      startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
    } while (startingAfter);

    const sold = charges.filter((c) => c.paid && !c.refunded && !c.disputed && c.status === "succeeded");
    const currency = sold[0]?.currency ?? "usd";
    const balance = await get("/balance", key, fetchImpl);
    return {
      ok: true,
      currency,
      grossCents: sold
        .filter((c) => c.currency === currency)
        .reduce((s, c) => s + c.amount - (c.amount_refunded ?? 0), 0),
      count: sold.length,
      availableCents: sumCurrency(balance.available, currency),
      pendingCents: sumCurrency(balance.pending, currency),
    };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await summarizeSales({ key: process.env.STRIPE_READ_KEY }), null, 2));
}
