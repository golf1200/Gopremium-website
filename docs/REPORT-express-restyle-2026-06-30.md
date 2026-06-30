# REPORT — Express studio-restyle batch (2026-06-30)

## ✅ Shipped to live (commit `d9d57c9`, push `main`, IMG_VER 11→12)
74 express SKU `-square` heroes regenerated via the studio-restyle skill and published:
- **Flux Kontext pro** — product-only (drinkware, umbrellas, bags, hats, soft goods, flat garments).
- **Gemini** — worn garments (new Thai models) + text/spec-heavy items.
- Removed supplier logos/watermarks (PMK, MPKJ GROUP, LONDON CLUBS, โฮมสกรีน, .com, 22.5W/REMAX), spec/price text, mannequins; collapsed colour-montages to a single hero.
- Verified live: catalogue-data.js = `?v=12`, sample images byte-match local.
- Total spend this task: **~฿163** (Gemini + Flux).

## 🔧 Follow-up in progress — UPRIGHT orientation fix
Rule added (user, 2026-06-30): bottles/tumblers/cups/flasks/jars must stand VERTICAL, never lying down. Added to `scripts/fal-studio.mjs` PROMPT + skill SKILL.md.
Re-generating upright (Gemini): **EX005, EX037, EX082, EX085** (were lying on their side / tipped). Will re-publish with IMG_VER bump.

## ⛔ Pending — needs real supplier photos (cannot fix with AI)
- **EX050, EX090** (PMK work shirt / coverall) — supplier watermark **"POLO MAKER"** is baked across the product; neither AI (Gemini ×6 seeds, Flux) nor free cv2 inpaint could remove it. Supplier source files are full promo flyers (worse). **Left on their current live image; excluded from publish.** → Action: request clean (watermark-free) photos from supplier PMK.

## 🖼️ Pending — full 4–6 angle galleries (not done)
Only the main `-square` hero was regenerated. Other gallery angles are still the old images. Proper flow (per prior session): AI selects 4–6 best real angle photos → skill restyles each to GoPremium look. Not yet run for this batch.

## ⚠️ Repo backlog — 110 uncommitted files from PRIOR sessions (NOT touched)
My commit was surgical (77 files = 74 squares + catalogue-data.js + build-catalogue-data.mjs + publish script). The following pre-existing uncommitted work was left as-is and is NOT live:
- **Modified (15):** `.gitignore`, `CLAUDE.md`, `PRODUCT-MASTER-FINAL.xlsx`, `docs/MARKETING-STRATEGY.md`, `generate-sitemap.js`, `package.json`, `package-lock.json`, `public/blog/index.html`, `public/sitemap.xml`, `public/v2.html`, `scripts/gen-blog-images.mjs`, `scripts/sheet-sync.gs`, `vercel.json` (+ `scripts/fal-studio.mjs` = mine, this batch).
- **Deleted (6):** `project/uploads/` brand book PDF + marketing/UI-kit HTMLs (4), and a prior express gallery image.
- **Untracked (89):** `api/`, `content/blog/06-express-gift.*`, `docs/CONTENT-CALENDAR.md`, and the whole `express-realphoto-2026/` audit tree (review HTMLs, JSON, fullscan).
→ Action: these belong to earlier work (blog/content engine, express audit, marketing). Review & commit (or discard) separately — do NOT sweep into an image commit.
