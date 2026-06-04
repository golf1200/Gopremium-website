# GO PREMIUM — Image Spec & Re-crop Shopping List

> Generated for the website image audit. All photographic images render with
> `object-fit: cover`, so any difference between the **source ratio** and the
> **display-box ratio** is cropped away. This file lists every image, where it is
> used, what it currently is, and the exact target it should be exported to.
>
> Layout math is at desktop: `.gp-wrap` max-width **1200px** (~1072px content),
> grid gaps as defined in each component.

---

## 1. Display boxes (the ratios the UI actually needs)

| Section / component | File(s) | Box size (≈desktop) | Display ratio | `object-fit` |
|---|---|---|---|---|
| Hero / HeroCarousel | `Hero.jsx`, `HeroCarousel.jsx` | ~484×560 | **0.86** (portrait ~7:8) | cover |
| Category cards | `Category.jsx` | ~202×150 | **1.34** (4:3) | cover |
| Occasion cards | `Occasion.jsx` | ~345×150 | **2.30** (ultrawide) | cover |
| Products (PRIME) | `Products.jsx` | ~275×150 | **1.83** (~16:9) | cover |
| Portfolio cases | `Portfolio.jsx` | ~344×236 | **1.46** (~3:2) | cover |
| ProductCard (catalog) | `ProductCard.jsx` | ~253×200 | **1.27** (~5:4) | cover |
| ProductCard (related, compact) | `ProductCard.jsx` | ~253×160 | **1.58** (~16:10) | cover |
| ProductDetail main | `ProductDetail.jsx` | ~482×361 | **1.33** (4:3, hard-coded) | cover |
| QuotePage thumbnail | `QuotePage.jsx` | 70×70 | **1.00** (1:1) | cover |
| Trust client logos | `Trust.jsx` | auto×38 | n/a | **contain** ✅ |

---

## 2. Recommended target masters (the proper fix)

Produce **two masters per product photo**, both from a clean center-weighted crop:

| Master | Ratio | Export size | Used by |
|---|---|---|---|
| **Square** | 1:1 | **1000×1000** | ProductCard, QuotePage thumb, ProductDetail* |
| **Landscape** | 16:9 | **1280×720** | Hero/Occasion/Products/Portfolio feature boxes |

\* ProductDetail currently hard-codes `aspectRatio:'4/3'`. Either change it to
`1/1` to consume the square master, or add a **4:3 / 1200×900** master.

Client logos stay as **transparent PNG, height-normalized to 132px** (already done ✓).

---

## 3. Per-file shopping list

Legend — **Crop severity** when the file is placed in a wide/landscape box:
🟢 fine · 🟡 mild · 🟠 heavy · 🔴 severe (>40% lost)

### Squares (native ~1:1) — fine in square boxes, cropped in wide boxes

| File | Current px | Native | Used in | Severity in widest box | Action |
|---|---|---|---|---|---|
| `bag-snap.jpg` | 800×800 | 1.00 | Occasion (2.30), Portfolio, ProductCard | 🔴 Occasion | export 16:9 master (1280×720) |
| `drinkware-milo.jpg` | 800×800 | 1.00 | Category, Occasion, Products, Portfolio, ProductCard | 🔴 Occasion/Products | export 16:9 + keep square |
| `giftset-aroma.jpg` | 800×800 | 1.00 | Hero, Category, Occasion, Portfolio | 🔴 Occasion · 🟠 Hero | export 16:9 + 4:5 (Hero) |
| `lifestyle-towel.jpg` | 800×800 | 1.00 | Category, Occasion, Portfolio | 🔴 Occasion | export 16:9 master |
| `minifan-haru.jpg` | 1000×1000 | 1.00 | Category | 🟡 Category | export 4:3 (or keep, mild) |
| `stationery-pen-oxygen.jpg` | 950×950 | 1.00 | ProductCard (ST001–005) | 🟢 catalog · 🟡 compact | upscale OK, keep square |
| `drinkware-chill.jpg` | 1100×1106 | 0.99 | Occasion, Portfolio | 🔴 Occasion | export 16:9 master |
| `lifestyle-grip.jpg` | 950×940 | 1.01 | ProductCard (LS012/013) | 🟢 catalog | keep square |
| `lifestyle-lunchbox.jpg` | 434×470 | 0.92 | ProductCard (KC003/004) | 🟡 small src | re-export ≥1000px square |

### Landscape (native >1) — best matches the card boxes

| File | Current px | Native | Used in | Severity | Action |
|---|---|---|---|---|---|
| `giftset-executive.jpg` | 800×596 | 1.34 | Hero, Occasion, Products, Portfolio, ProductCard, Detail | 🔴 Hero (portrait box) · 🟠 Occasion | export 4:5 (Hero) + 16:9 (Occasion) + keep 4:3 |
| `umbrella-classic.jpg` | 743×637 | 1.17 | Category (UM001–003) | 🟡 Category | re-crop to clean 4:3, ≥800px |

### Portrait (native <1) — ⚠️ cropped in EVERY landscape box

| File | Current px | Native | Used in | Severity | Action — **priority re-crop** |
|---|---|---|---|---|---|
| `bag-moov.jpg` | 415×545 | **0.76** | Category, Products, ProductCard (BG…) | 🟠 Category · 🔴 Products | **re-shoot/crop to landscape; ≥1000px** |
| `stationery-notebook.jpg` | 527×795 | **0.66** | Category, Products, ProductCard (ST006–008) | 🔴 everywhere | **re-crop landscape; loses ~45% now** |
| `drinkware-brewy.jpg` | 397×735 | **0.54** | Hero, ProductCard (DW001/002) | 🔴 catastrophic in Detail/Hero | **re-crop; lowest-res file, ≥1000px** |

### Fallback / housekeeping

| File | Current | Issue | Action |
|---|---|---|---|
| `placeholder.svg` | 600×450 (4:3) | OK — real fallback | keep |
| `placeholder.jpg` | **11 bytes** | ⚠️ **corrupt/empty file** | **delete** (code already falls back to `.svg`) |

### Client logos — ✅ no action

`clients/c1.png … c20.png` — height-normalized to 132px, rendered with
`object-fit: contain` (never cropped). Keep transparent backgrounds.

---

## 4. The core conflict (why one file can't be "correct" everywhere)

`giftset-executive.jpg`, `giftset-aroma.jpg`, and `drinkware-milo.jpg` are each
reused across boxes ranging from **0.86 (Hero portrait)** to **2.30 (Occasion
ultrawide)**. No single crop serves all of them — this is the reason for the
two-master (square + 16:9) approach in §2.

## 5. Quickest win without re-exporting art

If re-cropping every file isn't feasible now, standardize the **boxes** instead so
the cropping is at least uniform and gentle:

- `Category.jsx`, `Products.jsx`, `Occasion.jsx`: replace fixed `height:150` image
  boxes with `aspect-ratio: 4/3` (matches the most common native landscape).
- `Occasion.jsx`: this is the worst box (2.30) — either give it `aspect-ratio: 16/9`
  or increase its height so squares aren't gutted.
- `ProductDetail.jsx`: change `aspectRatio:'4/3'` → `'1/1'` to match the mostly
  square product masters.
- Delete the corrupt `placeholder.jpg`.

---

## 6. Priority order

1. 🔴 **Delete** `placeholder.jpg` (11-byte corrupt file).
2. 🔴 **Re-crop the 3 portraits** (`drinkware-brewy`, `stationery-notebook`, `bag-moov`) to landscape — they are cropped badly in every box they appear in.
3. 🟠 **Fix the Occasion box** (2.30 ultrawide) or give its images 16:9 masters.
4. 🟡 Generate square + 16:9 masters for the high-traffic squares (`giftset-*`, `drinkware-milo`, `lifestyle-towel`, `bag-snap`).
5. 🟢 Standardize remaining card boxes to a single `aspect-ratio`.
