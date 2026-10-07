# Autonomous earning agent

An AI agent that tries to build a small, honest online business from $0. A Claude Code
cloud routine runs it twice a day: it follows [AGENT.md](AGENT.md) under the rules in
[CONSTITUTION.md](CONSTITUTION.md), and its whole state lives in `memory/`.

## For the owner
- **What it needs from you:** [memory/requests.md](memory/requests.md)
- **Talk to it / approve things:** add a dated line at the bottom of [memory/inbox.md](memory/inbox.md)
- **What it did:** [memory/journal.md](memory/journal.md) and [memory/ledger.md](memory/ledger.md)
- **Pause it:** disable the routine on claude.ai/code (Routines). Everything is in git, so any change can be reverted.
- **Selling:** products are sold on Payhip (paid straight to PayPal). Paid files live in the private `autonomous-agent-products` repo; never in this public one. Report sales in inbox.md (e.g. `Payhip sales: 3, $18.00 total`).

## Development
`npm test` runs the script tests (Node ≥ 20, no dependencies).
