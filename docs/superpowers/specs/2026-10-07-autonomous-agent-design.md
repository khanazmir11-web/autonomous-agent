# Autonomous Earning Agent — Design

Date: 2026-10-07
Status: Approved in conversation; awaiting written-spec review

## 1. Goal

A fully autonomous AI agent that chooses and runs a small online business with the
aim of making a profit, starting from **$0 of new spending**.

- **Success (month 1):** the first real Stripe sale before 2026-11-05.
- **Upgrade rule:** paid services (e.g. Claude API) are bought only after the agent
  has earnings, only with the owner's written approval, and the owner makes the purchase.
- **Expectation:** month 1 is mostly building assets (site, 1–3 products, content).
  Realistic month-1 revenue is $0–$50.

### Context

Replaces Conway Automaton, whose API-key provisioning (SIWE "Invalid or expired
nonce") is broken with no maintainer response. Conway's design ideas (survival tiers,
constitution, ledger, journal) are kept; its infrastructure is not.

## 2. Architecture

Three parts:

1. **Repo** `autonomous-agent` (private, owner's GitHub): the agent's body and memory.
2. **Routine:** a scheduled Claude Code cloud routine that runs against the repo. It is
   paid from the owner's existing $100 "cloud session credits" (expires 2026-11-05).
3. **Owner:** the approval desk, via `memory/inbox.md`.

### Repo layout

```
CONSTITUTION.md        immutable rules (agent must never edit)
AGENT.md               the run procedure the routine follows
memory/
  goals.md             current niche, plan, ranked ideas
  journal.md           one entry per run (append-only)
  ledger.md            earnings, estimated credit use, credit left
  inbox.md             owner -> agent: approvals, answers, instructions
  requests.md          agent -> owner: needs, approvals, proposals
site/                  public website (GitHub Pages)
products/              digital products the agent makes
scripts/
  stripe-sales.mjs     read-only Stripe summary (Node, no dependencies)
docs/superpowers/      specs and plans
```

## 3. Run procedure (each routine run)

1. Read `CONSTITUTION.md`, `goals.md`, the last 5 entries of `journal.md`, all of
   `inbox.md`, and `ledger.md`.
2. Run `scripts/stripe-sales.mjs` if `STRIPE_READ_KEY` is set, and update `ledger.md`.
3. Determine the survival tier (Section 5). If the tier is "final", write the report and stop.
4. Act on any new owner instructions in `inbox.md` first.
5. Pick **one** highest-value task for the current phase (Section 4) and do it.
   - Cap: about 30 minutes of work and at most 1 product/page/post per run.
6. Commit the work. Append to the journal (date, task, result, next idea, estimated
   credit used). Add needs to `requests.md`. Push.
7. Stop.

Schedule: twice a day (09:00 and 21:00 owner local time, GMT+12) in the normal tier.

## 4. Business strategy (phases)

- **Phase 1, Validate (week 1):** research only. Find problems people already pay to
  solve, using evidence such as Reddit/forum questions, marketplace bestsellers and gaps,
  and search interest. Output: 3 ranked niche ideas in `goals.md`, each with evidence
  links. Pick #1 and move on.
- **Phase 2, Build:** one small digital product ($5–15: template, toolkit or guide),
  plus a free sample/lead magnet and a landing page on `site/`.
- **Phase 3, Launch:** request a payment link (Section 5), publish the product page,
  publish honest content (site articles; social posts only via owner-created accounts).
- **Phase 4, Learn:** read sales and traffic signals, improve, and add a product or pivot.

The owner's YouTube channel is **not** used unless the owner opts in via `inbox.md`.

## 5. Money and survival

### Ledger
- **Earnings:** from Stripe via a **restricted, read-only** key (`STRIPE_READ_KEY`,
  set by the owner in the routine environment). Lists charges and balance only.
- **Credit:** each run records an estimate. The owner may write the real figure from
  the Usage page into `inbox.md`, and the agent then corrects the ledger.

### Survival tiers (by estimated credit left of $100)
| Credit left | Tier | Behavior |
|---|---|---|
| > $30 | normal | 2 runs/day, full tasks |
| $10–30 | frugal | asks the owner to reduce to 1 run/day; small tasks only |
| < $10, or date ≥ 2026-11-04 | final | writes `REPORT.md` (what worked, what didn't, next steps), asks the owner to disable the routine, then stops |

The agent must never cause usage beyond the included credit (the owner's Pro limits).

### Spending and payment links
- The agent may **propose** a purchase in `requests.md`. A proposal must show earnings
  to date and may not exceed **50% of earnings**. The owner approves and buys.
- Live payment links: the owner creates them, or adds a second restricted key
  (`STRIPE_LINKS_KEY`, products + payment links only) **after approving the first
  product**. The agent never holds secret keys with money-moving permissions.

## 6. Constitution (summary; full text in CONSTITUTION.md)

1. Honesty: disclose that the shop is AI-run; no fake reviews, fake scarcity or false claims.
2. No spam: no cold outreach, no mass posting; follow platform rules.
3. No money moves without the owner's written approval in `inbox.md`.
4. Never create accounts, enter passwords, or handle payment details; ask the owner.
5. No illegal, adult, gambling, crypto-trading, financial-advice or get-rich-quick products.
6. Respect copyright: only original work or properly licensed material.
7. When unsure, stop and ask in `requests.md`.
8. Never edit `CONSTITUTION.md` or remove the survival rules from `AGENT.md`.

## 7. Error handling

- Stripe script fails or the key is missing: log it, continue without earnings data,
  and add a request.
- Push conflict (the owner edited files): pull and rebase. Owner edits win on
  `inbox.md`/`goals.md`.
- The same task fails twice: mark it blocked in `goals.md` and pick another.
- Ambiguous or risky action: do not act; write a request.

## 8. Testing and launch

1. **Unit test** `scripts/stripe-sales.mjs` against a mocked Stripe response (no key
   needed; `node --test`).
2. **Dry run:** run the `AGENT.md` procedure once manually in this session and check
   that the journal, ledger and requests are created correctly and nothing is out of scope.
3. The owner reviews the dry-run output.
4. Create the routine (twice daily). After the first scheduled run, verify the commit
   and journal entry on GitHub.
5. **Week-1 check:** the owner reviews `requests.md` and the journal; adjust `AGENT.md`
   and `goals.md` if needed.

## 9. Owner setup (all free)

- Private GitHub repo `autonomous-agent` (created by the owner, or by Claude with approval).
- GitHub Pages on `site/`. The owner enables it in repo settings.
- Stripe account and restricted read-only key, entered by the owner into the routine
  environment. Optional; the agent runs without it during Phase 1.

## 10. Out of scope (for now)

- Always-on processes, crypto wallets, self-replication, self-modifying runtime code.
- Paid APIs or hosting (until earnings and approval).
- Automatic posting to social accounts (until the owner creates and connects accounts).

## Amendment 2026-10-07: Payhip + PayPal replaces Stripe

Approved by the owner after launch:
- **Repo is public** (owner decision), so paid product files must never be committed
  here. They live in a **private repo `autonomous-agent-products`**, which the routine
  checks out alongside this one. Only free samples and landing pages go in `site/`.
- **Selling:** Payhip, with payouts straight to the owner's PayPal. Payhip delivers
  files to buyers automatically. Stripe is dropped: it is likely unavailable in the
  owner's country and doesn't deliver files.
- **Owner per product:** upload the file to Payhip using the agent's checklist (about
  5 minutes), then paste the `https://payhip.com/` link into the inbox.
- **Earnings:** the agent can't read Payhip or PayPal; the owner reports sales in the inbox.
- `scripts/stripe-sales.mjs` and `STRIPE_*` keys are removed.
