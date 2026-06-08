// ============================================================
// GO PREMIUM — Generate sitemap.xml from products.json
// Usage: node generate-sitemap.js
// Run from website/ folder after updating catalog data.
// ============================================================
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { site } from './src/config.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const SITE_URL = site.siteUrl; // single source of truth — see src/config.js
const products = JSON.parse(readFileSync(join(__dir, 'src/data/products-raw.json'), 'utf8'));

const OCCASIONS = [
  'new-year','songkran','new-employee','vip','event',
  'milestone','esg','thank-you','executive','mass-staff',
];
const BUDGET_TIERS = ['value','smart','premium','executive'];
const BLOG_SLUGS = [
  'ของขวัญปีใหม่องค์กร-2026',
  'ของพรีเมียมพิมพ์โลโก้',
  'ของขวัญองค์กรตามงบประมาณ',
  'ของพรีเมียมรักษ์โลก',
  'ของชำร่วยงานอีเวนต์องค์กร',
];
const CATEGORIES = [...new Set(products.map((p) => p.category_slug).filter(Boolean))];
const VALID_PRODUCTS = products.filter((p) => p.name && p.name.trim() && p.slug);

const today = new Date().toISOString().split('T')[0];

function url(loc, priority = '0.7', changefreq = 'weekly') {
  return `  <url><loc>${SITE_URL}${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority><lastmod>${today}</lastmod></url>`;
}

const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  url('/', '1.0', 'weekly'),
  url('/products', '0.9', 'weekly'),
  url('/quote', '0.8', 'monthly'),
  url('/blog', '0.8', 'weekly'),
  '',
  '  <!-- Blog / Insights -->',
  ...BLOG_SLUGS.map((s) => url(`/blog/${encodeURIComponent(s)}`, '0.7', 'monthly')),
  '',
  '  <!-- Categories -->',
  ...CATEGORIES.map((slug) => url(`/category/${slug}`, '0.8')),
  '',
  '  <!-- Occasions -->',
  ...OCCASIONS.map((slug) => url(`/occasion/${slug}`, '0.8', 'monthly')),
  '',
  '  <!-- Budget tiers -->',
  ...BUDGET_TIERS.map((slug) => url(`/budget/${slug}`, '0.7', 'monthly')),
  '',
  `  <!-- Products (${VALID_PRODUCTS.length} items) -->`,
  ...VALID_PRODUCTS.map((p) => url(`/product/${p.slug}`, '0.7')),
  '</urlset>',
];

const xml = lines.join('\n');
writeFileSync(join(__dir, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml generated: ${VALID_PRODUCTS.length} products + categories/occasions/budgets`);

// robots.txt — kept in sync with the same SITE_URL single source
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
writeFileSync(join(__dir, 'public/robots.txt'), robots);
console.log(`robots.txt generated → ${SITE_URL}/sitemap.xml`);
