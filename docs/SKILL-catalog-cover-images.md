# SKILL — Catalogue product cover images (รูปปกสินค้า Catalog)

> A reusable method for turning raw supplier product photos into a cohesive,
> premium set of studio "cover" images (gallery image #1) for the catalogue —
> one per product, all looking like they came from the same studio shoot.
> Distilled from the GO PREMIUM image rollout. Keep it as the standing playbook.

---

## 1. When to use

When products need a clean, premium **main/cover image** (the `<base>-square.jpg`
shown in the catalogue grid) and the only source material is raw supplier photos
(often with white backgrounds, Chinese text, banners, or size charts).

Scope rule: **only do products that actually have a real source photo.** A
product with no photo cannot get a faithful studio shot — it falls back to the
catalogue placeholder until a real photo exists.

---

## 2. Principles (LOCKED)

| Principle | Detail |
|---|---|
| **Edit-mode, never text-to-image** | Pass the real product photo as input to **Gemini 2.5 Flash Image** (`gemini-2.5-flash-image`). The product must stay faithful — same shape, proportions, colour, material, and any print/logo already on it. |
| **One shared STYLE ANCHOR** | A single fixed style description appended to every prompt → the whole grid reads as one studio shoot. |
| **Vary by category, not per product** | Each category gets its own scene (angle + prop). Consistency within a category is good for a catalogue; the 7 category scenes already give the grid enough variety. |
| **One cover image per product** | The catalogue main is a single hero. (Multiple angles per product is a different job — only do it when asked.) |
| **Brand icon in the CORNER only** | Composite the navy brand icon at the bottom-right **of the image**, never onto the product surface. |
| **Faithful = don't invent** | Never add a new logo, brand name, or text onto the product. Keep packaging that *is* the product (e.g. a gift box). |
| **Remove distractions** | Strip foreign/Chinese text, size charts, measurement numbers, banners, screenshots, reflections, stray hands, phones/tablets, and unrelated props. |
| **Output budget** | 1:1, 1000×1000, JPEG ≤ 170 KB. |
| **Never overwrite originals; stage first** | Generate into a staging dir, review, then publish. Originals are never touched. |

---

## 3. The studio look (shared STYLE ANCHOR)

> Seamless warm off-white / soft cream studio backdrop, bright high-key and airy,
> soft diffused daylight from the upper left, a soft natural contact shadow under
> the product, calm minimal-classic premium mood, warm-neutral colour grade, no
> harsh shadows, no coloured light. The product is the clear hero, sharp and
> well-lit, with clean negative space.

Faithfulness clause (append after the scene + anchor):

> Keep the PRODUCT ITSELF exactly faithful to the input photo: same shape,
> proportions, colours, material and finish, and keep ANY print/logo/design
> already on it unchanged. Do NOT invent or add any new logo, brand name, or text
> onto the product. Remove only distractions … Photorealistic, sharp focus.
> Square 1:1. No text or watermark baked in.

---

## 4. Scene per category

| Cat | Scene (angle + prop) |
|---|---|
| **BG** Bag | Standing upright at a gentle 3/4 angle, full so it holds shape, soft contact shadow. Keep any existing print. |
| **DW** Drinkware | Upright on a pale natural-wood ledge, near straight-on, a softly-blurred dried eucalyptus sprig far behind, warm light. |
| **ST** Stationery | At a gentle diagonal on a tidy light-wood desk beside a closed cream notebook + a tiny sprig of greenery, soft daylight from the left, shallow DOF. |
| **FN** Mini Fan | Upright at a slight angle on the plain studio surface, clean and bright, a faint summery freshness, minimal. |
| **UM** Umbrella | A flattering 3/4 angle on the backdrop with a soft shadow, fabric catching soft light. **Keep the pose (open/folded) as in the input.** |
| **GS** Giftset | Slight top-down angle, elegant and tidy. **The presentation box IS the product — keep it.** |
| **LS** Lifestyle / EDC | On a warm neutral surface, leaning at a gentle angle against a small neutral stone block, soft daylight, shallow DOF. |

---

## 5. Brand icon placement

- File: `Gopremium new version/Logo/GoPremium Icon logo - navy.png` (navy, crisp).
- Trim transparent padding → resize to ~**8.5%** of canvas (~85 px on 1000 px).
- Inset from the **bottom-right** corner by ~**3.8%** (~38 px). Composite over the
  finished 1000×1000 image, then JPEG-encode under budget.
- Navy reads well because the corner is always the light studio backdrop.

---

## 6. Pipeline & scripts

All under `scripts/image-pipeline/`. Output mirrors the public layout for an easy
publish: `staged/rollout/<base>/<base>-square.jpg`.

| Step | Tool | Notes |
|---|---|---|
| Generate one set (multi-angle, one product) | `05-studio-mockups.mjs <jobs.json>` | Shared anchor + per-shot scene; composites the icon. |
| **Full catalogue rollout** | `06-rollout.mjs all [--mains-only] [--force]` | One studio main (+ optional gallery cleans) per SKU from `product-images.generated.json`. **Resumable** (skips existing outputs; failures → `staged/rollout/_failures.json`, re-run to retry). |
| Gallery cleanup only (#2…#n) | **rembg first (free)**, Gemini only for hard cases | See cost note below. Strip text/banners/etc., keep the product; no icon. |

> **Cost note — don't pay Gemini for plain cleaning.** Gemini (~$0.04/img) is only
> worth it for the **covers** (which need a generated studio scene) and for the
> minority of gallery images where Chinese text / a logo is printed **ON or
> overlapping the product** (true inpainting). For the common case — junk in the
> **background** + want a white bg — use **`rembg`** (free, local AI cutout): cut
> the product out and composite on white; the background text/banner disappears at
> $0. So the right default is **rembg-first**, Gemini only for covers + overlaid-text
> cases. (The first GO PREMIUM clean pass ran everything through Gemini for one-tool
> consistency — ~$0.04 × ~282 ≈ $11; rembg-first would have cut most of that.)
| Build review (one folder) | `make-review.mjs <set-dir> "Title"` | Self-contained base64 HTML (`review-standalone.html`). |
| Build review (all mains, grouped) | `make-rollout-review.mjs` | Scans every `<base>-square.jpg`, groups by category → `review-mains.html`. |

Setup: `GEMINI_API_KEY` in a gitignored `.env` at repo root; `@google/genai` + `sharp` installed.

---

## 7. Review & deliver

After any batch: **build the self-contained HTML, open it, and hand over a link —
don't wait to be asked.**
1. Build the base64-embedded review HTML.
2. Open it: `Start-Process "<full path>"`.
3. Also give a clickable **`file:///`** URL (forward slashes, spaces → `%20`) —
   a raw Windows path with spaces/Thai chars can't be copy-pasted into a browser.

---

## 8. Publish (on owner approval)

1. Copy each staged `<base>-square.jpg` → `public/images/products/<base>/`
   (overwrites the main referenced by `catalogue-data.js`; galleries untouched
   unless explicitly included).
2. `npm run build` (vite copies `public/**` → `dist/`).
3. Verify: **P0 must pass** (`scripts/verify-p0.mjs`). P1 / SEO / v2-nav analytics
   failures are **pre-existing** (need GA in a real browser) — confirm by stashing
   the images and re-running; identical failures ⇒ not caused by the image swap.
4. Commit **only the image files** (`git add public/images/products`) — leave any
   unrelated working-tree changes (e.g. `v2.html`) out unless asked.
5. `git push origin main` → Vercel auto-deploys.
6. Confirm: the latest Vercel deployment is `state: READY, target: production`, and
   `curl` a few live images — byte size should equal the local file (proves the
   new bytes are live, not cached).

---

## 9. Gotchas

- **Immutable cache + unchanged filenames.** `/images/*` is served
  `Cache-Control: public, max-age=31536000, immutable`. Same filename → returning
  visitors keep the **old** image until a hard refresh (Ctrl+F5). For an instant
  refresh for everyone, add a cache-busting query (`?v=N`) to the image paths in
  `catalogue-data.js`.
- **Thai IDN domain ≠ this host.** Changes go live on `gopremium-website.vercel.app`.
  The Thai IDN domain points to a different (old nginx) host and will not reflect them.
- **Keep the faithfulness clause product-agnostic.** Don't hard-code one product
  type (e.g. "canvas tote") — it will fight other categories.
- **Light products blend with the studio bg.** Cream/white items on the warm
  off-white backdrop read as near-white at thumbnail size — by design; deepen the
  backdrop tone for those if more separation is wanted.
- **Image-less SKUs.** `catalogue-data.js` only carries `img`/`gallery` for SKUs
  with photos; the rest render the `mock()` placeholder tile. They are the real
  "remaining" work — they need real photos before they can get a studio cover.

---

## 10. One-line resume

> "อ่าน docs/SKILL-catalog-cover-images.md แล้วทำรูปปกสินค้า catalog ต่อ" — set
> `GEMINI_API_KEY`, run `06-rollout.mjs all --mains-only`, review, publish.
