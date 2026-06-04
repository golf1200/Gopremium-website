# GO PREMIUM — Image Migration Checklist

Tracks production of the **three-master image system** (square / landscape / hero).
The code already consumes the masters with automatic fallback, so the site works
**today** on the original files — producing the masters below progressively
upgrades quality with zero code changes.

- **Status:** system live ✅ · masters produced **0 / 25** ⬜
- **Photo source:** `C:\Users\Golf\Desktop\Gopremium new version\รูปสินค้า\`
- **Output location:** `public/images/products/<base>/<base>-<variant>.jpg`
- **Fallback chain:** `hero → landscape → square → original → placeholder.svg`
  (a missing master silently drops to the next real file)

---

## Master specs

| Variant | Ratio | Export size | Consumed by |
|---|---|---|---|
| `square` | 1:1 | **1000×1000** | ProductCard, QuotePage thumb, ProductDetail (box now 1:1) |
| `landscape` | 16:9 | **1280×720** | Products, Occasion (box now 16:9), Portfolio, Category |
| `hero` | 7:8 | **1050×1200** | Hero, HeroCarousel |

File naming, e.g. for base `drinkware-milo`:
```
public/images/products/drinkware-milo/
  drinkware-milo-square.jpg      1000×1000
  drinkware-milo-landscape.jpg   1280×720
  drinkware-milo-hero.jpg        1050×1200   (only if used by Hero)
```

---

## Catalog coverage

| | Count |
|---|---|
| Valid products in catalog | **240** |
| Products mapped to a photo (32 SKUs → 14 base images) | **32** |
| Products with **no photo** (render `placeholder.svg`) | **208** |

> The 208 unmapped products are a separate content task — assign each a base
> photo in `IMAGE_MAP` (`src/data/products.js`) or shoot new product photography.
> They are out of scope for this ratio migration but listed here for visibility.

---

## Per-image master checklist

Legend: ⬜ to produce · ✅ done · — not used in that placement (fallback covers it).
"Native" = current original file ratio (why cropping happened before).

| Base image | Native | square (1:1) | landscape (16:9) | hero (7:8) | Used in |
|---|---|:--:|:--:|:--:|---|
| `bag-moov` | 0.76 ▮ portrait | — | ⬜ | — | Category, Products |
| `bag-snap` | 1.00 ◻ square | ⬜ | ⬜ | — | ProductCard (BG001/011/012), Occasion, Portfolio |
| `drinkware-brewy` | 0.54 ▮ tall | ⬜ | — | ⬜ | ProductCard (DW001/002), HeroCarousel |
| `drinkware-chill` | 0.99 ◻ square | ⬜ | ⬜ | — | ProductCard (DW003/007), Occasion, Portfolio |
| `drinkware-milo` | 1.00 ◻ square | ⬜ | ⬜ | — | ProductCard (DW005/006), Category, Products, Occasion, Portfolio |
| `giftset-aroma` | 1.00 ◻ square | — | ⬜ | ⬜ | Category, Occasion, Portfolio, Hero, HeroCarousel |
| `giftset-executive` | 1.34 ▭ landscape | ⬜ | ⬜ | ⬜ | ProductCard (GS001–003), Products, Occasion, Portfolio, HeroCarousel |
| `lifestyle-grip` | 1.01 ◻ square | ⬜ | — | — | ProductCard (LS012/013) |
| `lifestyle-lunchbox` | 0.92 ◻ square | ⬜ | — | — | ProductCard (KC003/004) |
| `lifestyle-towel` | 1.00 ◻ square | ⬜ | ⬜ | — | ProductCard (LS016), Category, Occasion, Portfolio |
| `minifan-haru` | 1.00 ◻ square | ⬜ | ⬜ | — | ProductCard (FN001/002/005/008), Category |
| `stationery-notebook` | 0.66 ▮ portrait | ⬜ | ⬜ | — | ProductCard (ST006–008), Category, Products |
| `stationery-pen-oxygen` | 1.00 ◻ square | ⬜ | — | — | ProductCard (ST001–005) |
| `umbrella-classic` | 1.17 ▭ landscape | ⬜ | ⬜ | — | ProductCard (UM001–003), Category |

**Totals to produce:** square **12** · landscape **10** · hero **3** = **25 master files**.

---

## Priority order (highest crop pain first)

1. ⬜ **`drinkware-brewy`** square + hero — native 0.54, was catastrophically cropped everywhere.
2. ⬜ **`stationery-notebook`** square + landscape — native 0.66.
3. ⬜ **`bag-moov`** landscape — native 0.76.
4. ⬜ **`giftset-executive`** all three — most widely reused (5 sections, every box ratio).
5. ⬜ **`giftset-aroma`** landscape + hero — Hero + 3 sections.
6. ⬜ Remaining squares (`bag-snap`, `drinkware-chill`, `drinkware-milo`, `lifestyle-*`, `minifan-haru`, `stationery-pen-oxygen`, `umbrella-classic`).

---

## Done when

- [ ] All 25 masters exported to `public/images/products/<base>/`.
- [ ] Spot-check Hero, a category card, an occasion card, a product page, and the quote drawer — no letterboxing or hard crops.
- [ ] (Optional) once square masters exist, flip `image:` in `products.js` from
      `seoImage(images)` (original) to `images.square` for sharper OG/JSON-LD previews.
- [ ] (Optional) assign photos to the 208 placeholder products.
- [ ] Once a base's masters are confirmed live, the legacy `/images/<base>.jpg`
      original may be removed (it is only a fallback). **Do not remove before then.**

---

## What changed in code (for reference)

| File | Change |
|---|---|
| `src/utils/images.js` | **new** — `variantSet()`, `imageCandidates()`, `seoImage()`, `PLACEHOLDER` |
| `src/components/shared/GpImage.jsx` | **new** — `<img>` with auto fallback chain |
| `src/data/products.js` | `IMAGE_MAP` now base names; products emit `images:{square,landscape,hero,original}` + `image` (SEO) |
| `ProductCard.jsx` | → `GpImage` square |
| `ProductDetail.jsx` | → `GpImage` square; image box **4:3 → 1:1**; JSON-LD/meta use `seoImage()` |
| `QuotePage.jsx` | → `GpImage` square |
| `Products.jsx` | → `GpImage` landscape |
| `Occasion.jsx` | → `GpImage` landscape; image box **fixed 150px → 16:9** |
| `Portfolio.jsx` | → `GpImage` landscape |
| `Category.jsx` | → `GpImage` landscape *(not in original spec list; migrated for consistency — revert if undesired)* |
| `Hero.jsx`, `HeroCarousel.jsx` | → `GpImage` hero |
| `public/images/placeholder.jpg` | **deleted** (corrupt 11-byte file) |
