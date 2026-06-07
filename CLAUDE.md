# GO PREMIUM — project rules for Claude & sub agents

React 18 + Vite 5 site (brand: GO PREMIUM by PASSION GROW TRADING CO., LTD.). This repo root is `website/`. Production branch is `main` → Vercel auto-deploys on push.

## ⛔ RULE #1 — One writer per file (no concurrent edits)

**Never let two AI agents write or edit the same file at the same time.** Parallel runs on the same file cause silent overwrites / lost work.

Before fanning out work to multiple sub agents:
1. **Partition by file.** Group the work so each parallel agent touches a *disjoint* set of files.
2. **If file sets overlap → do NOT run them in parallel.** Run those agents **sequentially** (one finishes and its edits land before the next starts).
3. **If you genuinely must run overlapping work in parallel,** isolate each agent in its own git worktree (`isolation: "worktree"`) and merge afterward — never two agents editing the same working-tree file.
4. One file = one owner per task. If a change spans another agent's file, hand it off; don't reach into it concurrently.

This applies to the main loop too: don't launch parallel `Edit`/`Write` on the same path.

## File ownership map

| File / area | Owner agent | Notes for others |
|-------------|-------------|------------------|
| `src/components/**`, `src/pages/**`, `src/hooks/**`, `src/contexts/**`, `src/styles/**`, `src/App.jsx`, `src/main.jsx` | **frontend-react** | `copywriter-th` edits *text inside* these — but never at the same time as frontend-react. Sequence it. |
| `src/config.js` | **frontend-react** | `seo-performance` needs `siteUrl`/`gaId` — request the change, don't edit concurrently. |
| `src/data/products.js`, `products-raw.json`, `catalog-master.json`, `scripts/*1688*`, `scripts/build-*`, `extract-catalog.mjs` | **product-catalog** | |
| `src/data/categoryContent.js`, `occasionContent.js`, `budgetContent.js` | **shared: product-catalog (structure) + copywriter-th (text)** | HIGH overlap — only ONE may edit at a time. Never parallel. |
| `scripts/image-pipeline/**`, `src/data/product-images.generated.json`, `public/images/**`, `src/utils/images.js` | **image-pipeline** | |
| `docs/PRODUCTS-NO-IMAGE.md` | **shared: product-catalog + image-pipeline** | Coordinate; one writer at a time. |
| `index.html`, `generate-sitemap.js`, `sitemap.xml`, `robots.txt`, `src/utils/analytics.js`, `docs/ANALYTICS-EVENTS.md` | **seo-performance** | |
| build/verify/commit/push, `vercel.json` | **qa-deploy** | runs last, alone. |

## Ship workflow (standing request)
Finish code → `npm run build` → run applicable verifiers (`scripts/verify-p0/p1/seo.mjs`, Playwright mock Formspree so no real email) → only if all pass: `git add -A && git commit && git push origin main` → Vercel auto-deploys (re-aliases live domains: Thai IDN `xn--22ck4b1ansahhp4gvdtab7n8e.com` +www, and `gopremium-website.vercel.app`). If anything fails, stop and report — do not push.

## Brand & honesty
- Brand tokens: navy `#1F3A5F`, gold `#F4BD44`, navy-2 `#2C4F7C`, gold-2 `#F8D586`.
- 7 fixed categories: Drinkware, Bag, Stationery, Mini Fan, Umbrella, Giftset, Lifestyle.
- No fake claims / clients / invented prices. Images < 170 KB. AIConcierge is a local heuristic only (no paid API).
- Contact/CTAs read from `src/config.js` only — never hardcode.
