# GO PREMIUM — Analytics Events (GA4)

All events fire through `track(event, params)` in `src/utils/analytics.js`,
which calls `window.gtag('event', …)` only when GA is loaded. GA loads only
when `gaId` is set in `src/config.js` (single source of truth) — while empty,
events safely no-op and the page never errors.

> **To activate:** paste your GA4 Measurement ID (`G-XXXXXXXXXX`) into
> `gaId` in `src/config.js`. No other change needed.

## Event catalogue

| Event | Fires when | Params | Source file |
|---|---|---|---|
| `generate_lead` | RFQ form submitted successfully (home) | `{ source: 'home_rfq', occasion, budget? }` | `src/components/RFQ.jsx` |
| `generate_lead` | Quote form submitted successfully | `{ source: 'quote_page', items }` | `src/pages/QuotePage.jsx` |
| `contact_line` | LINE button clicked (floating bar) | `{ source: 'floating' }` | `src/components/Floating.jsx` |
| `contact_line` | LINE link clicked (footer) | `{ source: 'footer' }` | `src/components/Footer.jsx` |
| `add_to_quote` | Product added to the quote cart | `{ sku }` | `src/hooks/useQuote.js` |
| `view_item` | Product detail page loaded / changed | `{ sku, category }` | `src/pages/ProductDetail.jsx` |
| `view_quote` | `/quote` opened with ≥1 item in the cart | `{ items }` | `src/pages/QuotePage.jsx` |
| `ai_concierge_run` | "ให้ AI ช่วยคิด" run (incl. example chips) | `{ brief }` | `src/components/AIConcierge.jsx` |
| `select_occasion` | `/occasion/:slug` landing viewed | `{ slug }` | `src/pages/OccasionPage.jsx` |
| `select_category` | `/category/:slug` landing viewed | `{ slug }` | `src/pages/CategoryPage.jsx` |
| `select_budget` | `/budget/:slug` landing viewed | `{ slug }` | `src/pages/BudgetPage.jsx` |

## Suggested funnel (for Looker Studio)

A reasonable lead funnel to chart once data accrues (~2–3 days):

1. **Discovery** — `select_occasion` / `select_category` / `select_budget` (which landing pages pull traffic)
2. **Interest** — `view_item` (product views), `ai_concierge_run` (AI engagement)
3. **Intent** — `add_to_quote`, `view_quote`
4. **Conversion** — `generate_lead` (split by `source`), `contact_line` (split by `source`)

Key metrics to build cards for:
- Leads per day (`generate_lead` count), split by `source` (home_rfq vs quote_page)
- LINE contacts per day (`contact_line`), split by `source`
- Top occasions/categories/budgets by landing views
- Add-to-quote → generate_lead conversion rate
- AI Concierge runs → lead correlation

> `generate_lead` and `contact_line` map naturally to GA4 **Key Events**
> (conversions). Mark them as Key Events in GA4 Admin → Events after data appears.
