# GO PREMIUM — Product Image AI Audit & Enhancement (HANDOFF / RESUME DOC)

> **Read this file first** when continuing the image project in a new session.
> It is the single source of truth: goal, decisions, paths, the standard, the
> pipeline, the Gemini integration spec, and a live progress tracker.
> Status as of handoff: **PLANNING DONE — ready to execute. Nothing generated yet.**

---

## 0. Goal (from the owner)

For every product that has real photos (currently **71 of 245 SKUs**), make the
gallery look premium:

1. **Image #1 (main):** AI-generate a NEW main image — the real product placed in a
   nice, usable **lifestyle environment** (NOT plain white background).
2. **Images #2–#5:** clean, beautiful product shots — **remove all Chinese text**,
   remove anything unrelated to the product. If a source folder contains several
   product variants/colours, use those as #2/#3/#4.

---

## 1. Decisions (LOCKED)

| Decision | Choice |
|---|---|
| Image-gen / edit model | **Google Gemini 2.5 Flash Image** ("Nano Banana"), model id `gemini-2.5-flash-image` |
| Mode | **Image EDITING** (pass the real product photo as input) — never pure text-to-image. Product must stay faithful (shape/colour/logo). |
| Review gate | **Yes** — build a before/after HTML sheet; owner approves per batch BEFORE publish. |
| Lifestyle style default | Premium & clean, brand-aligned (navy `#1F3A5F` / gold `#F4BD44` accents), context per category (see §5). Adjustable. |
| Output budget | Every published image **≤ 170 KB**, square 1:1 **1000×1000** (matches existing pipeline). |
| Originals | NEVER overwrite source photos. Keep all originals. |

⚠️ **Why faithful editing matters:** this is a live shop. AI must not invent a
product that differs from what ships (wrong logo/material/shape = customer gets
the wrong thing). Edit the real photo; change only background/text.

---

## 2. Paths (VERIFIED — watch the gotchas)

| What | Path |
|---|---|
| **Live git repo (work HERE)** | `C:\Users\Golf\Documents\Claude\Projects\Gopremium Website LIVE\website` — branch `main` → Vercel auto-deploy |
| **Source product photos** | `C:\Users\Golf\Gopremium-website\Gopremium new version\รูปสินค้า\<category>\<SKU - name>\` |
| Output (publish to) | `<repo>\public\images\products\<base>\` |
| Data map (71 SKUs) | `<repo>\src\data\product-images.generated.json` — `{ SKU: { base, gallery:[...] } }` |
| Existing pipeline | `<repo>\scripts\image-pipeline\` (00-autopicks, 01-inventory, 02-process, 03-merge, inventory.json, manifest.json, picks/) |

🚩 **GOTCHAS to fix before running pipeline scripts:**
- `01-inventory.mjs` hardcodes source as `C:\Users\Golf\Desktop\...\รูปสินค้า` → **STALE.**
  Real source is now `C:\Users\Golf\Gopremium-website\Gopremium new version\รูปสินค้า`.
- `02-process.mjs` / `00-autopicks.mjs` hardcode `C:\Users\Golf\Gopremium-website\...`
  (a *separate* working copy) for output + data. **Re-point them to THIS repo**
  (`Documents\...\website`) so output lands where git/Vercel deploy from.
- Filenames in source: `O1CN…cib.jpg` = real product shots (often Chinese text);
  `1748…png` = supplier banners; `Screenshot…` = screenshots. Many per folder (≤14).

---

## 3. The Standard ("มาตรฐานรูปภาพ GO PREMIUM")

**Image #1 — main / lifestyle**
- Real product in a believable environment fitting its category (see §5).
- Product faithful to reality (colour/logo/shape). No foreign text, no watermark.
- 1:1, 1000×1000, ≤170 KB.

**Images #2–#5 — clean product / detail / variants**
- Product shown clearly; angles/details/real colours. **No Chinese text, no
  unrelated content** (no supplier banners, screenshots, size charts in CN, etc.).
- If folder has multiple variants/colours → use as #2/#3/#4.
- Clean background (white / soft neutral / light context). 1:1, ≤170 KB.

**Per product:** minimum **3** images (main + 2), target 4–5.

---

## 4. Pipeline — 5 phases (the "skill")

| Phase | What | Who | Output |
|---|---|---|---|
| **1. Audit** | Claude opens every gallery image of the 71 SKUs → per-image verdict: has-Chinese-text? banner/screenshot? multi-product? sharp enough? main is white-bg? | **Claude (vision)** | `docs/image-audit-report.md` (or .csv) |
| **2. Select** | From audit, pick best source as cover + best variants/details as #2–#4 | Claude | updated `picks/<SKU>.json` |
| **3. Generate main** | Cut out product → Gemini places it in category lifestyle scene | **Gemini API** | `<base>-square.jpg` (new main) |
| **4. Clean gallery** | Gemini removes Chinese text / irrelevant elements from #2–#5 | **Gemini API** | `<base>-02..05.jpg` |
| **5. Review → Publish** | before/after HTML sheet → owner approves → optimize ≤170KB → write `generated.json` → `npm run build` → verify → commit → push `main` (Vercel deploys) | Claude | live site |

Run in batches (e.g. by category, ~10 SKUs at a time) so review stays manageable.
Orchestrate phases 1/4 with a Workflow (fan-out) if desired.

---

## 5. Lifestyle scene prompts by category (starting templates)

Edit-mode prompt skeleton (input = product cutout):
> "Place THIS exact product (keep its shape, colours, and any logo unchanged) into
> a [SCENE]. Soft natural lighting, realistic shadow, premium minimal style,
> shallow depth of field. Square 1:1. No text, no watermark, no extra objects."

| Category | [SCENE] |
|---|---|
| Drinkware | clean modern wooden desk / café counter, morning light |
| Bag | styled flat-lay on linen / hung in a bright minimal studio |
| Stationery | tidy premium office desk, notebook + plant |
| Mini Fan | summer outdoor / desk by a window |
| Umbrella | held outdoors, soft rainy bokeh |
| Giftset | elegant gift table, neutral premium backdrop, ribbon accents |
| Lifestyle | in-use context matching the item |

Gallery cleanup prompt:
> "Remove all Chinese/foreign text, logos of other brands, watermarks, and any
> elements unrelated to the product. Keep the product exactly as-is on a clean
> white/neutral background. Square 1:1."

---

## 6. Gemini integration (to build in phase 3/4)

- **SDK:** `npm i @google/genai` (or REST). Model: `gemini-2.5-flash-image`.
- **Auth:** env var **`GEMINI_API_KEY`** — get from Google AI Studio
  (https://aistudio.google.com/apikey). Put in a **gitignored** `.env` at repo root
  (`GEMINI_API_KEY=...`) or set in the shell. **Never commit the key.**
- **Call shape:** `generateContent` with parts = [ {inlineData: <product image>}, {text: <prompt>} ]; response returns image bytes → save → re-encode JPG ≤170KB with sharp (already a dependency).
- **New script:** `scripts/image-pipeline/04-gemini-enhance.mjs`
  - args: `<SKU>` and mode (`main` | `clean`).
  - reads picks, calls Gemini, writes to a **staging** dir first (e.g.
    `scripts/image-pipeline/staged/<base>/`) — NOT straight to public — so review happens before publish.
- **Cost:** ~$0.04/image → full 71-SKU run (~71 main + ~210 cleanups + iteration)
  ≈ **$15–40 one-time.**

---

## 7. Constraints to respect (from CLAUDE.md)

- No fake claims; product images must represent the real product.
- Images < 170 KB. Brand: navy `#1F3A5F`, gold `#F4BD44`.
- Ship workflow: build → verify (`scripts/verify-v2-nav.mjs` etc.) → commit → push `main` → Vercel.
- Rule #1: one writer per file (don't run parallel agents editing the same file).

---

## 8. Progress tracker  ← update this as you go

- [x] Source-path remap found: real source = `C:\Users\Golf\Gopremium-website\Gopremium new version\รูปสินค้า` (inventory.json paths are stale Desktop paths — remap prefix when reading). Still TODO: fix the hardcoded paths inside `01/02/00-*.mjs` before re-running those steps.
- [~] Phase 1 Audit — **pilot done on 3 SKUs** (DW001/ST001/BG001) → `docs/image-audit-report.md`. Remaining 68 SKUs pending.
- [x] `npm i @google/genai` (v2.8) installed; sharp already present.
- [x] Built `scripts/image-pipeline/04-gemini-enhance.mjs` (edit-mode, staging output, 1:1 1000px ≤170KB). `.env` + `staged/` gitignored.
- [x] Pilot jobs ready: `scripts/image-pipeline/jobs.json` (3 mains + 2 cleans).
- [x] Ran `04-gemini-enhance.mjs jobs ...` → staging: 3 mains (DW001/BG001/ST001) + 2 cleans (DW001/BG001 #02). All ≤63KB, 1:1. Verified faithful vs source originals (colour/strap/clip/shape preserved).
- [x] Built before/after review sheet → `scripts/image-pipeline/staged/review.html` (1.9MB, base64 embedded). ⏳ **AWAITING OWNER APPROVAL** before publish.
- [ ] Roll out to remaining 68 SKUs by category (Drinkware → Bag → Stationery → Mini Fan → Umbrella → Giftset → Lifestyle)
- [ ] Publish approved batches: optimize → `generated.json` → build → verify → push `main`
- [ ] Final pass: every SKU has ≥3 clean images, no Chinese text, main = lifestyle

---

## 9. How to resume in a NEW session

1. `cd` into the live repo and start Claude Code there.
2. Set the key once: create `.env` with `GEMINI_API_KEY=...` (gitignored).
3. First message: **"อ่าน docs/IMAGE-AUDIT-PLAN.md แล้วทำงานต่อจาก Progress tracker"**
   (or: "continue the product-image AI audit per docs/IMAGE-AUDIT-PLAN.md").
4. Claude's auto-memory (MEMORY.md) also points here, so even a fresh session finds it.
