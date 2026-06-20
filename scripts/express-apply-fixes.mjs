// Apply audit fixes: rebuild flagged express heroes from a clean single-product source.
// Reads audit/flags_A*.json + audit/packet_A*.json, builds a fix-manifest, backs up the
// current squares, then you run the python compositor on that manifest.
//   node scripts/express-apply-fixes.mjs           -> build manifest + backup, print plan
import fs from 'node:fs';
import path from 'node:path';

const BASE = path.resolve('express-realphoto-2026');
const AUD = path.join(BASE, 'audit');
const gen = JSON.parse(fs.readFileSync('src/data/product-images.generated.json', 'utf8'));

// merge packets (sku -> info incl source_dir_abs)
const pkt = {};
for (const g of ['A1','A2','A3','A4']) {
  const p = JSON.parse(fs.readFileSync(path.join(AUD, `packet_${g}.json`), 'utf8'));
  Object.assign(pkt, p);
}
// merge flags
let flags = [];
for (const g of ['A1','A2','A3','A4']) {
  const fp = path.join(AUD, `flags_${g}.json`);
  if (fs.existsSync(fp)) flags = flags.concat((JSON.parse(fs.readFileSync(fp,'utf8')).flags)||[]);
}
// crop coords from the coord agent: sku -> [x0,y0,x1,y1]
const cropMap = {};
const ccp = path.join(AUD, 'crop-coords.json');
if (fs.existsSync(ccp)) for (const c of (JSON.parse(fs.readFileSync(ccp,'utf8')).crops||[])) cropMap[c.sku] = c.crop_frac;
// EX018 audited as actually clean -> do not touch
const SKIP = new Set(['EX018']);

const manifest = [], needPhoto = [], manualCrop = [], skipped = [];
for (const f of flags) {
  if (SKIP.has(f.sku)) continue;
  const info = pkt[f.sku];
  if (!info) { skipped.push(`${f.sku} (no packet)`); continue; }
  const slug = gen[f.sku]?.base || info.live_square_abs.split(/[\\/]/).slice(-2)[0];
  if (f.fix === 'needs-new-photo') { needPhoto.push(f); continue; }
  if (!f.source_file || info.source_dir_abs == null) {
    if (f.fix === 'crop') manualCrop.push(f); else skipped.push(`${f.sku} (no source)`);
    continue;
  }
  const hero_abs = path.join(info.source_dir_abs, f.source_file);
  if (!fs.existsSync(hero_abs)) { skipped.push(`${f.sku} (src missing: ${f.source_file})`); continue; }
  const item = { sku: f.sku, slug, category: info.cat, name: info.name,
                 hero_abs, hero_is_group: false, gallery_abs: [] };
  let cf = cropMap[f.sku] || (Array.isArray(f.crop_frac) ? f.crop_frac : null);
  // full-frame sentinel = coord agent found no clean instance -> needs new photo
  if (Array.isArray(cf) && cf[0]===0 && cf[1]===0 && cf[2]===1 && cf[3]===1) { needPhoto.push(f); continue; }
  if (Array.isArray(cf) && cf.length === 4) item.crop = cf;
  else if (f.fix === 'crop') { manualCrop.push(f); continue; }   // crop needed but no coords yet
  manifest.push(item);
}

// backup current squares for everything we will overwrite
const bdir = path.join(BASE, '_backup-fixes'); fs.mkdirSync(bdir, { recursive: true });
for (const it of manifest) {
  const cur = path.resolve('public/images/products', it.slug, `${it.slug}-square.jpg`);
  if (fs.existsSync(cur)) fs.copyFileSync(cur, path.join(bdir, `${it.slug}-square.jpg`));
}
fs.writeFileSync(path.join(BASE, 'fix-manifest.json'), JSON.stringify(manifest, null, 1));

console.log(`flags total: ${flags.length}`);
console.log(`-> rebuild from clean source: ${manifest.length}`);
console.log(`-> needs NEW photo (no clean source): ${needPhoto.length}  [${needPhoto.map(f=>f.sku).join(', ')}]`);
console.log(`-> manual crop (no coords): ${manualCrop.length}  [${manualCrop.map(f=>f.sku).join(', ')}]`);
if (skipped.length) console.log(`-> skipped: ${skipped.join(' | ')}`);
console.log('\nfix-manifest.json written. Run:');
console.log('  python scripts/express-studio-compose.py --manifest express-realphoto-2026/fix-manifest.json');
