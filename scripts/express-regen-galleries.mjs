// Rebuild gallery arrays in src/data/product-images.generated.json from whatever
// jpg files currently exist in each express SKU's public folder. Run this AFTER
// deleting any QA-rejected gallery photos, so the JSON reflects the files on disk.
// Square first, then -N files sorted numerically. Only touches express SKUs that
// have a folder. Run from website/ root, then node scripts/build-catalogue-data.mjs
import fs from 'node:fs';
import path from 'node:path';

const GEN = 'src/data/product-images.generated.json';
const PUB = 'public/images/products';
const gen = JSON.parse(fs.readFileSync(GEN, 'utf8'));

const html = fs.readFileSync('public/v2.html', 'utf8');
const express = new Set(JSON.parse(html.match(/EXPRESS_SKUS\s*=\s*(\[[\s\S]*?\]);/)[1]));

const numKey = (f) => {
  const m = f.match(/-(\d+)\.jpg$/i);
  return m ? parseInt(m[1], 10) : 0;
};

let changed = 0;
for (const sku of express) {
  const gi = gen[sku];
  if (!gi || !gi.base) continue;
  const dir = path.join(PUB, gi.base);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => /\.jpg$/i.test(f));
  const sq = files.filter(f => f.includes('-square'));
  const rest = files.filter(f => !f.includes('-square')).sort((a, b) => numKey(a) - numKey(b) || a.localeCompare(b));
  const gallery = [...sq, ...rest].map(f => `/images/products/${gi.base}/${f}`);
  const before = JSON.stringify(gi.gallery || []);
  if (JSON.stringify(gallery) !== before) { gi.gallery = gallery; changed++; }
}

fs.writeFileSync(GEN, JSON.stringify(gen, null, 1));
console.log(`galleries rebuilt from disk. SKUs changed: ${changed}`);
