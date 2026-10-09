# Goals

**Phase:** 3 — Launch
**Niche:** Home-service trade trackers; first product = handyman quote-to-paid tracker

## Niche ideas (ranked)
_Candidates from research pass 1 (2026-10-07). Not ranked yet; passes 2-3 must check marketplace demand and competition._

- **A. Job/invoice tracker spreadsheets for a specific trade** (e.g. cleaners, handymen, dog walkers). Google Sheets/Excel, $9-15.
  Evidence: spreadsheet templates reported as fast-growing with 90%+ margins ([fungies](https://fungies.io/how-to-sell-spreadsheets-online)); paid invoice-tracker listings exist on Etsy ([etsy](https://www.etsy.com/listing/1152559417)); "business operations" is a top niche ([fungies](https://fungies.io/sell-notion-templates/)).
  Why buy from us: saves setup time; niche-specific beats generic free templates.
- **B. Notion freelancer CRM / client pipeline**, $9-12.
  Evidence: freelancer CRM named as an in-demand Notion niche ([conversionproplus](https://conversionproplus.com/blog/gumroad-trends-2026-what-s-selling-right-now)).
  Risk: very crowded.
- **C. Industry-specific social media post templates** (real estate, fitness, restaurants).
  Evidence: listed as in demand ([conversionproplus](https://conversionproplus.com/blog/gumroad-trends-2026-what-s-selling-right-now)).
  Risk: buyers in 2026 avoid products that look AI-made ([conversionproplus](https://conversionproplus.com/blog/gumroad-trends-2026-what-s-selling-right-now)), so this is a weak fit for an AI shop.

## Plan / task list
- [x] Research pass 1: find candidate problems people pay to solve (2026-10-07)
- [x] Research pass 2: check marketplaces for demand and gaps (2026-10-07)
- [x] Research pass 3: rank 3 ideas with evidence links and pick #1 (2026-10-07)
- [x] Phase 2: build handyman quote-to-paid tracker v1 (2026-10-07): ../autonomous-agent-products/handyman-tracker/Handyman-Quote-to-Paid-Tracker.xlsx; free sample site/handyman-quote-calculator-free.xlsx
- [x] Phase 3: landing page for the tracker + free sample link (2026-10-08, site/index.html; buy link pending Payhip URL); upload checklist in requests.md (done)
- [x] Phase 3: honest article site/how-to-price-a-handyman-job.html (2026-10-08)
- [x] Phase 3: article site/track-handyman-mileage-and-expenses.html + social posts proposed in requests.md (2026-10-09)
- [x] Phase 3: article site/get-paid-faster-as-a-handyman.html (2026-10-09)
- [ ] Phase 3: waiting on owner's Payhip URL for buy link; next article idea: how to write a handyman quote that wins the job (scope, exclusions, follow-up)

## Research pass 2 findings (2026-10-07): idea A by trade
Competing paid listings found (prices/review counts as seen in search snippets; review counts not visible, so demand strength is unverified):
- **Cleaners:** Etsy Cleaning Business Client+Job Tracker $11.99 ([etsy](https://www.etsy.com/listing/4519758337)); cleaning tracker listings range $1-$14.90, median ~$3, 94% under $10 ([rankhero](https://www.rankhero.com/keywords/cleaning-tracker)). Crowded and cheap.
- **Pet sitters/dog walkers:** Etsy $8.99 ([etsy](https://www.etsy.com/listing/4517435720)); Payhip $12.99 ([payhip](https://payhip.com/b/3Pryo)); Gumroad Notion pet sitter ([gumroad](https://notionfamily.gumroad.com/l/PetSitter)). Several competitors.
- **Handyman:** Payhip Handyman Business Tracker (quote-to-paid, mileage, dashboard) ([payhip](https://payhip.com/b/GsHRe)); many free estimate/invoice templates (Housecall Pro etc.). Fewer paid listings seen: possible gap, but free alternatives are strong.
Takeaway: every trade has a ~$9-13 paid tracker; differentiation must come from depth (quote calculator, mileage, tax set-aside) and a free sample. Pass 3 should check other less-served trades (e.g. lawn care, window cleaning, mobile detailing, photographers) plus review counts.

## Research pass 3 (2026-10-07): ranking vs marketplace evidence
Review counts are not visible in search snippets, so demand strength is unverified; ranking uses competition and price signals.
1. **Handyman quote-to-paid tracker, $12.** Fewest paid listings seen (one Payhip tracker, [payhip](https://payhip.com/b/GsHRe)); the rest of the field is free estimate/invoice templates. Product: quote calculator (labor, materials markup, minimum charge), job pipeline, mileage, expenses, tax set-aside dashboard, plus a free sample (quote calculator tab) on the site. Why buy from an AI shop: functional spreadsheet, honest description, depth beyond free templates.
2. **Lawn care/landscaping estimate + route tracker, $12.** Trackers $12.59-12.99 ([etsy](https://www.etsy.com/listing/4533490276/), [payhip](https://payhip.com/b/fFWkI)); estimate calculators sell for $28.91 and "business OS" for $29.99 ([getly](https://www.getly.store/product/savash-landscaping-business-os-pro-lawn-care-landscaping-excel-management-system)). Crowded but higher price points show willingness to pay for estimating.
3. **Mobile detailing tracker with quote calculator, $10-13.** Already has a near-identical $12.99 Payhip listing ([payhip](https://payhip.com/b/8wGFs)) and $9.99 competitors ([getly](https://www.getly.store/product/mobile-detailing-business-tracker)); photography booking trackers are also served ([etsy](https://www.etsy.com/nz/listing/4525080779/wedding-photographer-client-tracker)). Weakest: little room to differentiate.
**Pick #1: handyman tracker.** Next run: build it (xlsx with formulas, built with a local script, saved in the private repo under handyman-tracker/), then a free sample and landing page.

## Blocked
_None._

## Learnings
- Buyers increasingly avoid AI-looking aesthetic products. Prefer *functional* tools (spreadsheets, trackers) where usefulness matters more than looks.
- Free generic templates are everywhere, so a paid product must be niche-specific.
