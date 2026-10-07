# Autonomous Earning Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repo that a scheduled Claude Code cloud routine runs twice a day to autonomously research, build, and sell a small digital product, starting at $0.

**Architecture:** The repo holds rules (`CONSTITUTION.md`), the run procedure (`AGENT.md`), plain-markdown memory, a static site for GitHub Pages, and two tiny dependency-free Node scripts (Stripe read-only sales summary; survival tier). A Claude Code routine executes `AGENT.md` each run and commits the results.

**Tech Stack:** Node ≥ 20 (ESM, built-in `fetch`, `node:test`), plain HTML/CSS, Markdown, GitHub Pages, Claude Code routines.

**Spec:** `docs/superpowers/specs/2026-10-07-autonomous-agent-design.md`

## Global Constraints

- No npm dependencies; scripts use only Node built-ins.
- Stripe access is read-only (`STRIPE_READ_KEY`); no code path may create, refund, or transfer.
- Survival tiers: normal > $30 credit left; frugal $10–30; final < $10 **or** date ≥ 2026-11-04.
- Starting credit: $100 (10000 cents); expires 2026-11-05.
- Schedule: 09:00 and 21:00 GMT+12, twice daily in the normal tier.
- Per run: at most ~30 minutes of work and at most 1 product/page/post.
- The agent never edits `CONSTITUTION.md`, never creates accounts, never handles secrets or payment details.
- The site and all public text disclose the shop is AI-run.

## Review Focus

- More than 100 Stripe charges → must paginate (`has_more` / `starting_after`), not undercount. Test in Task 1.
- Refunded, failed, or unpaid charges → excluded from earnings. Test in Task 1.
- Missing key or Stripe 401 → script exits 0 with a clear message, so the run never crashes. Test in Task 1.
- Tier boundaries: exactly $30.00 → frugal, exactly $10.00 → frugal, $9.99 → final, 2026-11-04 → final at any credit. Test in Task 2.
- A malformed or missing `ledger.md` credit line → credit treated as unknown → tier `frugal`, with a warning. Test in Task 2.

---

### Task 1: Stripe read-only sales summary

**Files:**
- Create: `scripts/stripe-sales.mjs`
- Test: `tests/stripe-sales.test.mjs`
- Create: `package.json` (`{"type":"module","scripts":{"test":"node --test tests/"}}`, no deps)

**Interfaces:**
- Produces: `export async function summarizeSales({ key, fetchImpl = fetch, sinceUnix = 0 }) -> { ok: boolean, message?: string, currency?: string, grossCents?: number, count?: number, availableCents?: number, pendingCents?: number }`
- CLI: `node scripts/stripe-sales.mjs` reads `STRIPE_READ_KEY`, prints the result as JSON, and always exits 0.

- [ ] **Step 1: Write failing tests** in `tests/stripe-sales.test.mjs`, using a fake `fetchImpl` that routes by URL:
  - `no key → {ok:false, message:"STRIPE_READ_KEY not set"}`
  - `401 → ok:false, message contains "401"`
  - `counts only paid, non-refunded, succeeded charges`: charges `[{amount:1000,paid:true,refunded:false,status:"succeeded",currency:"usd"},{amount:500,paid:true,refunded:true,...},{amount:700,paid:false,status:"failed",...}]` → `grossCents === 1000`, `count === 1`
  - `paginates`: page 1 `{has_more:true,data:[100 charges of 100 cents, last id "ch_100"]}`, page 2 is requested with `starting_after=ch_100` and returns `{has_more:false,data:[1 charge of 100]}` → `count === 101`, `grossCents === 10100`
  - `reads balance`: `/v1/balance` returns `{available:[{amount:900,currency:"usd"}],pending:[{amount:100,currency:"usd"}]}` → `availableCents === 900`, `pendingCents === 100`
- [ ] **Step 2:** Run `node --test tests/` → FAIL (module not found).
- [ ] **Step 3: Implement `summarizeSales`.** `GET https://api.stripe.com/v1/charges?limit=100&created[gte]=<sinceUnix>` with `Authorization: Bearer <key>`, looping while `has_more`. Then `GET /v1/balance`, summing the entries whose currency matches the first charge's currency (default `usd`). Network errors return `ok:false`.
- [ ] **Step 4:** Run `node --test tests/` → all PASS.
- [ ] **Step 5:** Commit: `feat: read-only Stripe sales summary`.

### Task 2: Survival tier

**Files:**
- Create: `scripts/tier.mjs`
- Test: `tests/tier.test.mjs`

**Interfaces:**
- Produces: `export function tierFor({ creditLeftCents, today }) -> "normal" | "frugal" | "final"`; `export function parseCreditLeft(ledgerText) -> number | null` (reads the line `Credit left (est): $NN.NN`).
- CLI: `node scripts/tier.mjs` reads `memory/ledger.md` and prints `{"tier":..., "creditLeftCents":..., "warning"?:...}`.

- [ ] **Step 1: Write failing tests:** `tierFor` → `{3001,"2026-10-07"}→normal`, `{3000}→frugal`, `{1000}→frugal`, `{999}→final`, `{9000,"2026-11-04"}→final`, `{null,"2026-10-07"}→frugal`. `parseCreditLeft("Credit left (est): $42.50") === 4250`, and `parseCreditLeft("garbage") === null`.
- [ ] **Step 2:** Run `node --test tests/` → the tier tests FAIL.
- [ ] **Step 3:** Implement both functions in `scripts/tier.mjs`. `today` is an ISO date string; compare it to `"2026-11-04"` lexically. The CLI adds `warning: "credit unknown"` when parsing returns null.
- [ ] **Step 4:** Run `node --test tests/` → all PASS.
- [ ] **Step 5:** Commit: `feat: survival tier calculation`.

### Task 3: Rules, run procedure, memory, and site skeleton

**Files:**
- Create: `CONSTITUTION.md` (the 8 rules from spec §6, full sentences)
- Create: `AGENT.md` (the run procedure from spec §3 plus phases §4. It must say to run `node scripts/tier.mjs` and `node scripts/stripe-sales.mjs`, the per-run caps, the journal entry format, and "never edit CONSTITUTION.md")
- Create: `memory/goals.md` (Phase: 1 Validate; empty ideas list), `memory/journal.md` (header only), `memory/ledger.md` (`Starting credit: $100.00`, `Credit left (est): $100.00`, `Earnings: $0.00`, an empty run log table), `memory/inbox.md` (instructions for the owner on how to write approvals), `memory/requests.md` (header only)
- Create: `site/index.html` (a placeholder landing page that states it is an AI-run shop, coming soon; no build step), `site/style.css`
- Create: `README.md` (what this is, how to pause it, where to answer requests)
- Test: `tests/structure.test.mjs`

- [ ] **Step 1: Write a failing test** in `tests/structure.test.mjs` that checks: every file above exists; `CONSTITUTION.md` contains 8 numbered rules; `AGENT.md` mentions `scripts/tier.mjs`, `scripts/stripe-sales.mjs`, `CONSTITUTION.md`, and `requests.md`; `parseCreditLeft(ledger)` returns `10000`; `site/index.html` contains "AI".
- [ ] **Step 2:** Run `node --test tests/` → FAIL.
- [ ] **Step 3:** Write the files.
- [ ] **Step 4:** Run `node --test tests/` → all PASS.
- [ ] **Step 5:** Commit: `feat: constitution, run procedure, memory and site skeleton`.

### Task 4: Dry run (manual, in session)

- [ ] **Step 1:** Execute `AGENT.md` exactly once, by hand (no Stripe key, so Phase 1 research).
- [ ] **Step 2: Verify:** `journal.md` has 1 entry; `ledger.md` has a run row; `goals.md` has progress toward 3 evidence-linked ideas; `requests.md` lists the owner's setup needs (Stripe, Pages); no edits to `CONSTITUTION.md` (`git diff --stat HEAD~1 -- CONSTITUTION.md` is empty).
- [ ] **Step 3:** Commit: `run: dry run 1`. Show the owner the journal and requests, and **wait for the owner's OK**.

### Task 5: Publish to GitHub

- [ ] **Step 1:** With the owner's approval, create a private repo `autonomous-agent` on the owner's GitHub (the owner creates it in the browser, or with `gh` if it's authenticated and the owner approves), then `git remote add origin … && git push -u origin main`.
- [ ] **Step 2:** Add `.github/workflows/pages.yml` (on push to `main`: `actions/upload-pages-artifact` with `path: site`, then `actions/deploy-pages`). Commit and push. The owner sets Settings → Pages → Source to "GitHub Actions".
- [ ] **Step 3: Verify:** the Pages URL serves `site/index.html` (HTTP 200, contains "AI").

Note: GitHub Pages on a **private** repo needs a paid plan. If the owner is on GitHub Free, make the repo **public** (no secrets live in the repo; keys live only in the routine environment), or keep it private and defer Pages. Ask the owner.

### Task 6: Create the routine

- [ ] **Step 1:** Using the `schedule` skill, create a Claude Code cloud routine on repo `autonomous-agent`, cron `0 9,21 * * *` in fixed GMT+12 (`Etc/GMT-12`, i.e. `0 21,9 * * *` UTC; the owner's screen shows GMT+12), prompt: "Follow AGENT.md exactly. Then stop."
- [ ] **Step 2:** The owner adds `STRIPE_READ_KEY` to the routine environment when ready (optional during Phase 1).
- [ ] **Step 3: Verify:** after the first scheduled run, there's a new commit with a journal entry on GitHub.
