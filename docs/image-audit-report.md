# Image Audit Report — PILOT (3 SKUs)

Pilot of the standard in `IMAGE-AUDIT-PLAN.md`. Claude visually inspected source
photos at `C:\Users\Golf\Gopremium-website\Gopremium new version\รูปสินค้า\...`.

## Pattern found (consistent across all 3) — applies to all 71 SKUs

| Source file type | Looks like | Decision |
|---|---|---|
| `AW.../1.png, 2.png …` (numbered, in a Thai-named subfolder) | clean product, white/natural bg, **no foreign text** | ✅ use for gallery; best cutouts for the lifestyle main |
| `O1CN…cib.jpg` | raw 1688 shots, often **Chinese text / size overlays** | ⚠️ Gemini-clean (remove text) OR skip if an AW covers that colour/angle |
| `1748….png`, `Screenshot…` | banners / colour charts / size grids, **Chinese, multi-panel** | ❌ skip (or fully remake) |

---

## DW001 — Loopa stainless tumbler 500ml (Drinkware)
Product: bottle-shape tumbler, screw cap with silicone carry-loop, matte finish, many colours.

| File | Verdict |
|---|---|
| `AW/1.png` (orange) | ✅ clean, white bg, no text — gallery #2 / main cutout |
| `AW/2.png` (pink) | ✅ clean — gallery #3 |
| `AW/3..12.png` | ✅ likely more clean colour variants — gallery / colour row |
| `O1CN…ASMV` (light blue) | ❌ Chinese `500ml橡胶漆 浅蓝色-带手提` — clean text or skip |
| `O1CN…Ry6` (green) | ❌ Chinese — clean text or skip |

**Plan:** MAIN = orange `1.png` cutout → café/desk lifestyle. Gallery = clean AW colour shots (orange, pink, +2). Skip Chinese O1CN (AW already covers colours).

## ST001 — Oxygen gel pen (Stationery)
Product: slim click gel pen, matte barrel, many colours.

| File | Verdict |
|---|---|
| `1748351419702.png` | ❌ 37-colour chart w/ **Chinese names** (黑色…) — skip or remake as a clean colour graphic |
| `O1CN…Bt0t` (pink on linen frame) | ⚠️ product clear, but **irrelevant English love-quote frame** — crop/clean |
| `Screenshot…20.14.22` | ⚠️ good detail (refill/parts) but **low-res screenshot** |
| other `O1CN…` (×20) | likely single-colour pens — audit, pick 2–3 clean ones |

**Plan:** MAIN = a clean single pen → desk/notebook lifestyle. Gallery = 2–3 clean colour pens + 1 detail (refill) re-cleaned. Skip the Chinese colour chart.

## BG001 — Classic canvas tote (Bag)
Product: natural canvas tote, several sizes.

| File | Verdict |
|---|---|
| `กระเป๋าผ้า/1.png` (4 sizes, wood floor + plant) | ✅ clean, no text — strong main/gallery |
| `กระเป๋าผ้า/2..6.png` | ✅ likely more clean shots |
| `O1CN…UKJL` (wall hook + devices for scale) | ❌ Chinese `竖款手提袋25×20cm` — clean text |
| `1748338134538.png` (6-panel model grid) | ❌ Chinese 小号/中号/大号 — skip |

**Plan:** MAIN = tote cutout → bright minimal studio / in-use lifestyle. Gallery = clean AW shots (sizes, detail). Skip Chinese banners.

---

## Gemini prompts used for the pilot

**Main (lifestyle), edit-mode (input = clean product cutout):**
- DW001: "Place THIS exact tumbler (unchanged shape/colour/finish) on a clean light wooden café table by a window, a coffee cup softly blurred behind, warm morning light, realistic shadow, premium minimal, shallow depth of field. Square 1:1. No text, no watermark."
- ST001: "Place THIS exact pen on a tidy premium light-wood office desk beside an open notebook and a small plant, soft daylight, realistic shadow, premium minimal. Square 1:1. No text, no watermark."
- BG001: "Place THIS exact canvas tote in a bright minimal studio, hung or standing on a light neutral surface with soft daylight and a realistic shadow, premium lifestyle. Square 1:1. No text, no watermark."

**Gallery cleanup, edit-mode (input = O1CN raw):**
- "Remove all Chinese/foreign text, size labels, watermarks, and any objects unrelated to the product (phones, tablets, size boxes, quote frames). Keep the product exactly as-is on a clean white background. Square 1:1."

---

## Status
- [x] Audit pattern confirmed on 3 SKUs (Drinkware/Stationery/Bag)
- [x] Ran Gemini on the 3 pilots (6 calls ≈ $0.24) → `scripts/image-pipeline/staged/`
- [x] Result: 4/5 perfect first try; DW001 main had a hallucinated logo → fixed by adding "do NOT add any logo/text on the product surface" to the main prompt (now permanent in `04-gemini-enhance.mjs`). Re-ran → clean. **5/5 pass.**
- [ ] Owner approves pilot → publish 3 to live OR proceed to full rollout
- [ ] Roll out to remaining 68 SKUs by category (audit → select → generate → clean → review → publish)

### Lesson baked into the standard
AI must NEVER add/invent a logo, brand name, or embossed text on the product
surface (faithfulness). The main prompt now forbids it explicitly.
