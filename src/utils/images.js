// ============================================================
// GO PREMIUM — Three-master image system
// ------------------------------------------------------------
// Every product photo is produced in three masters so a single
// file is never stretched across mismatched display ratios:
//
//   square    1:1   1000x1000  -> ProductCard, QuotePage thumb, ProductDetail
//   landscape 16:9  1280x720   -> Products, Occasion, Portfolio, Category
//   hero      7:8   1050x1200  -> Hero, HeroCarousel
//
// Masters live in /images/products/<base>/<base>-<variant>.jpg
// The pre-migration original (/images/<base>.jpg) is kept as a
// real-file fallback so the UI never shows a broken image while
// the masters are being produced. See docs/IMAGE-MIGRATION-CHECKLIST.md
// ============================================================

export const PLACEHOLDER = '/images/placeholder.svg';

// Descending fallback chain. A consumer enters the chain at its preferred
// variant and falls through to the end:
//   hero -> landscape -> square -> original -> placeholder.svg
const CHAIN = ['hero', 'landscape', 'square'];

/**
 * Build the variant path set for a base image name.
 * variantSet('drinkware-milo') -> {
 *   square:    '/images/products/drinkware-milo/drinkware-milo-square.jpg',
 *   landscape: '/images/products/drinkware-milo/drinkware-milo-landscape.jpg',
 *   hero:      '/images/products/drinkware-milo/drinkware-milo-hero.jpg',
 *   original:  '/images/drinkware-milo.jpg',
 * }
 * Returns null for an empty base (caller falls back to placeholder).
 */
export function variantSet(base) {
  if (!base) return null;
  const dir = `/images/products/${base}`;
  return {
    square:    `${dir}/${base}-square.jpg`,
    landscape: `${dir}/${base}-landscape.jpg`,
    hero:      `${dir}/${base}-hero.jpg`,
    original:  `/images/${base}.jpg`,
  };
}

/**
 * Ordered list of candidate URLs to try, best -> last resort.
 * Consumed by <GpImage>, which advances on each onError.
 */
export function imageCandidates(images, preferred = 'square') {
  if (!images) return [PLACEHOLDER];
  const start = Math.max(0, CHAIN.indexOf(preferred));
  const list = [];
  for (const v of CHAIN.slice(start)) {
    if (images[v]) list.push(images[v]);
  }
  if (images.original) list.push(images.original);
  list.push(PLACEHOLDER);
  // de-dupe while preserving order
  return [...new Set(list)];
}

/**
 * Best REAL url for SEO / OpenGraph / JSON-LD.
 * Prefers an existing file (original) over an as-yet-unbuilt master.
 */
export function seoImage(images) {
  if (!images) return PLACEHOLDER;
  return images.original || images.square || PLACEHOLDER;
}
