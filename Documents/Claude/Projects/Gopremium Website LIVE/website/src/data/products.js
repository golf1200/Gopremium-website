// ============================================================
// GO PREMIUM — Catalog data layer
// Source: phase2/products.json (245 products, public fields only)
// Private columns (ต้นทุน, Supplier, ลิงก์ 1688) are NEVER imported.
// ============================================================

import rawProducts from '@data/products.json';

// ---------------------------------------------------------------------------
// Occasion taxonomy (10 tags)
// ---------------------------------------------------------------------------
export const OCCASIONS = [
  { slug: 'new-year',      label: 'ปีใหม่' },
  { slug: 'songkran',      label: 'สงกรานต์' },
  { slug: 'new-employee',  label: 'ต้อนรับพนักงานใหม่' },
  { slug: 'vip',           label: 'ลูกค้า VIP' },
  { slug: 'event',         label: 'อีเวนต์/บูธ/สัมมนา' },
  { slug: 'milestone',     label: 'ครบรอบ/Milestone' },
  { slug: 'esg',           label: 'รักษ์โลก/ESG' },
  { slug: 'thank-you',     label: 'ขอบคุณลูกค้า/คู่ค้า' },
  { slug: 'executive',     label: 'ของผู้บริหาร' },
  { slug: 'mass-staff',    label: 'แจกพนักงานจำนวนมาก' },
];

// Occasion slug -> label lookup
export const OCCASION_LABEL = Object.fromEntries(OCCASIONS.map((o) => [o.slug, o.label]));

// ---------------------------------------------------------------------------
// Budget tiers
// ---------------------------------------------------------------------------
export const BUDGET_TIERS = [
  { slug: 'value',     label: 'Value (ไม่เกิน ฿60)',    min: 0,   max: 60  },
  { slug: 'smart',     label: 'Smart (฿61–150)',          min: 61,  max: 150 },
  { slug: 'premium',   label: 'Premium (฿151–300)',       min: 151, max: 300 },
  { slug: 'executive', label: 'Executive (฿300+)',        min: 301, max: Infinity },
];

export const BUDGET_LABEL = Object.fromEntries(BUDGET_TIERS.map((b) => [b.slug, b.label]));

// ---------------------------------------------------------------------------
// Category groupings for mega-menu
// ---------------------------------------------------------------------------
export const CATEGORY_GROUPS = [
  {
    group: 'เครื่องดื่ม',
    icon: '🥤',
    categories: [{ slug: 'drinkware', label: 'Drinkware' }],
  },
  {
    group: 'กระเป๋า & เดินทาง',
    icon: '👜',
    categories: [
      { slug: 'bags',    label: 'Bag' },
      { slug: 'luggage', label: 'Luggage' },
    ],
  },
  {
    group: 'ออฟฟิศ & เครื่องเขียน',
    icon: '📝',
    categories: [{ slug: 'stationery', label: 'Stationery' }],
  },
  {
    group: 'เทคโนโลยี & แกดเจ็ต',
    icon: '⚡',
    categories: [
      { slug: 'fan',       label: 'Fan' },
      { slug: 'powerbank', label: 'Powerbank' },
      { slug: 'gadget',    label: 'Gadget' },
    ],
  },
  {
    group: 'ไลฟ์สไตล์ & ของใช้',
    icon: '✨',
    categories: [
      { slug: 'lifestyle', label: 'Lifestyle' },
      { slug: 'kitchen',   label: 'Kitchen' },
      { slug: 'scent',     label: 'Scent' },
      { slug: 'garment',   label: 'Garment' },
      { slug: 'hat',       label: 'Hat' },
      { slug: 'pet',       label: 'Pet' },
      { slug: 'baby-kid',  label: 'Baby & kid' },
    ],
  },
  {
    group: 'ของขวัญ & บรรจุภัณฑ์',
    icon: '🎁',
    categories: [
      { slug: 'giftset',   label: 'Giftset' },
      { slug: 'packaging', label: 'Packaging' },
      { slug: 'souvenir',  label: 'Souvenir' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Image map: SKU -> path in /images/
// Phase 1 curated photos; rest fall back to placeholder
// ---------------------------------------------------------------------------
const IMAGE_MAP = {
  // Drinkware
  DW002: '/images/drinkware-brewy.jpg',
  DW006: '/images/drinkware-milo.jpg',
  DW007: '/images/drinkware-chill.jpg',
  DW001: '/images/drinkware-brewy.jpg',  // Loopa — similar silhouette
  DW003: '/images/drinkware-chill.jpg',  // Peak — similar
  DW005: '/images/drinkware-milo.jpg',   // Sip — similar
  // Bags
  BG012: '/images/bag-snap.jpg',
  BG011: '/images/bag-snap.jpg',  // Uno — similar foldable
  BG001: '/images/bag-snap.jpg',  // Classic tote
  // Stationery
  ST001: '/images/stationery-pen-oxygen.jpg',
  ST002: '/images/stationery-pen-oxygen.jpg',
  ST003: '/images/stationery-pen-oxygen.jpg',
  ST004: '/images/stationery-pen-oxygen.jpg',
  ST005: '/images/stationery-pen-oxygen.jpg',
  ST006: '/images/stationery-notebook.jpg',
  ST007: '/images/stationery-notebook.jpg',
  ST008: '/images/stationery-notebook.jpg',
  // Kitchen / Lunch
  KC003: '/images/lifestyle-lunchbox.jpg',
  KC004: '/images/lifestyle-lunchbox.jpg',
  // Lifestyle
  LS012: '/images/lifestyle-grip.jpg',
  LS013: '/images/lifestyle-grip.jpg',
  LS016: '/images/lifestyle-towel.jpg',
  // Giftset
  GS001: '/images/giftset-executive.jpg',
  GS002: '/images/giftset-executive.jpg',
  GS003: '/images/giftset-executive.jpg',
  // Umbrella
  UM001: '/images/umbrella-classic.jpg',
  UM002: '/images/umbrella-classic.jpg',
  UM003: '/images/umbrella-classic.jpg',
  // Fan
  FN008: '/images/minifan-haru.jpg',
  FN001: '/images/minifan-haru.jpg',
  FN002: '/images/minifan-haru.jpg',
  FN005: '/images/minifan-haru.jpg',
};

// ---------------------------------------------------------------------------
// Occasion auto-assignment rules
// ---------------------------------------------------------------------------
function autoOccasions(product) {
  const { category, budget_tier, features = '', name = '' } = product;
  const text = (features + ' ' + name).toLowerCase();
  const tags = new Set();

  // Category-based base tags
  const categoryMap = {
    Drinkware: ['new-employee', 'event', 'mass-staff'],
    Bag:       ['event', 'mass-staff'],
    Stationery:['new-employee', 'event', 'mass-staff'],
    Fan:       ['songkran', 'event', 'mass-staff'],
    Umbrella:  ['thank-you', 'vip'],
    Lifestyle: ['new-employee', 'thank-you'],
    Kitchen:   ['new-employee', 'mass-staff'],
    Scent:     ['new-year', 'songkran', 'vip', 'thank-you'],
    Gadget:    ['new-employee', 'event', 'vip'],
    Powerbank: ['event', 'vip', 'new-employee'],
    Garment:   ['event', 'mass-staff'],
    Souvenir:  ['new-year', 'songkran', 'event'],
    Packaging: ['new-year', 'songkran', 'milestone'],
    'Baby & kid': ['thank-you', 'new-year'],
    Pet:       ['thank-you', 'new-year'],
    Hat:       ['event', 'mass-staff'],
    Luggage:   ['vip', 'executive', 'milestone'],
    Giftset:   ['new-year', 'vip', 'milestone', 'executive', 'thank-you'],
  };

  const base = categoryMap[category] || ['event'];
  base.forEach((t) => tags.add(t));

  // Eco / ESG keywords
  if (text.match(/รักษ์โลก|eco|kraft|recycle|คราฟท์|กระดาษ|cotton|ลินิน|ผ้าผสม|ยั่งยืน|bamboo|ไม้/)) {
    tags.add('esg');
  }

  // Executive tier or premium giftset or executive keyword
  if (budget_tier === 'executive' || text.match(/executive|luxury|signature|vip|premium set|ผู้บริหาร/)) {
    tags.add('executive');
    tags.add('vip');
  }

  // Songkran — fans, cool items
  if (category === 'Fan' || text.match(/เย็น|cooling|น้ำ|summer/)) {
    tags.add('songkran');
  }

  // New year — anything gift-like
  if (category === 'Giftset' || budget_tier === 'executive' || text.match(/ปีใหม่|กิฟต์|เซต|set|gift/)) {
    tags.add('new-year');
  }

  return Array.from(tags);
}

// ---------------------------------------------------------------------------
// Build the processed catalog
// ---------------------------------------------------------------------------
function buildCatalog(raw) {
  return raw
    .filter((p) => p.name && p.name.trim() && p.sku)   // remove blank rows
    .map((p) => ({
      ...p,
      image:    IMAGE_MAP[p.sku] || '/images/placeholder.svg',
      occasions: p.occasions && p.occasions.length > 0
        ? p.occasions   // honour pre-tagged data if present
        : autoOccasions(p),
    }));
}

export const products = buildCatalog(rawProducts);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function getProduct(sku) {
  return products.find((p) => p.sku === sku || p.slug === sku);
}

export function getByCategory(slug) {
  return products.filter((p) => p.category_slug === slug);
}

export function getByOccasion(slug) {
  return products.filter((p) => p.occasions.includes(slug));
}

export function getByBudget(slug) {
  return products.filter((p) => p.budget_tier === slug);
}

export function getRelated(product, limit = 6) {
  return products
    .filter((p) => p.sku !== product.sku && p.category_slug === product.category_slug)
    .slice(0, limit);
}

// Unique sorted categories in catalog
export const CATEGORIES = [...new Set(products.map((p) => p.category))]
  .sort()
  .map((cat) => ({
    label: cat,
    slug:  products.find((p) => p.category === cat)?.category_slug ?? cat.toLowerCase(),
    count: products.filter((p) => p.category === cat).length,
  }));

// Price range where prices exist
export const PRICED_COUNT = products.filter((p) => p.price_300_thb != null).length;
export const MIN_PRICE = Math.min(...products.filter((p) => p.price_300_thb).map((p) => p.price_300_thb));
export const MAX_PRICE = Math.max(...products.filter((p) => p.price_300_thb).map((p) => p.price_300_thb));
