// Merge all scripts/_picks/*.json (agent selections) into restyle-picklist.json,
// attaching slug + name, validating every picked raw file exists, skipping bad SKUs.
//   node scripts/merge-picks.mjs
import fs from 'fs';
import path from 'path';

const SKIP = new Set(['DW011', 'GS005']); // no clean product photos (promo banners / mixed scrape) -> need supplier photo
const imgmap = JSON.parse(fs.readFileSync('src/data/product-images.generated.json', 'utf8'));
const cat = JSON.parse(fs.readFileSync('scripts/catalog-master.json', 'utf8'));
const arr = Array.isArray(cat) ? cat : (cat.products || Object.values(cat).find(Array.isArray));
const bySku = {}; for (const p of arr) bySku[p.sku] = p;
const pl = JSON.parse(fs.readFileSync('scripts/restyle-picklist.json', 'utf8'));

const dir = 'scripts/_picks';
const merged = {};
for (const f of fs.readdirSync(dir)) Object.assign(merged, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

let added = 0, imgs = 0, skipped = [], missing = [];
for (const [sku, picks] of Object.entries(merged)) {
  if (SKIP.has(sku)) { skipped.push(sku); continue; }
  const valid = {};
  for (const [role, file] of Object.entries(picks)) {
    if (fs.existsSync(`scripts/raw-1688/${sku}/${file}`)) valid[role] = file;
    else missing.push(`${sku}:${file}`);
  }
  if (!Object.keys(valid).length) { skipped.push(sku + '(no valid files)'); continue; }
  const slug = (imgmap[sku] && imgmap[sku].base) || sku.toLowerCase();
  pl[sku] = { slug, model: 'gemini', note: (bySku[sku] && bySku[sku].name) || '', picks: valid };
  added++; imgs += Object.keys(valid).length;
}

fs.writeFileSync('scripts/restyle-picklist.json', JSON.stringify(pl, null, 2));
console.log(`merged ${added} SKU (${imgs} images) into picklist. total picklist SKU: ${Object.keys(pl).length}`);
console.log(`est gen cost: ฿${(imgs * 1.3).toFixed(0)}`);
if (skipped.length) console.log(`skipped (need supplier photo): ${skipped.join(', ')}`);
if (missing.length) console.log(`⚠️ missing raw files (dropped): ${missing.join(', ')}`);
