// GO PREMIUM — full-loop product-image restyle + publish.
// For each SKU in a pick-list: take the chosen raw supplier photos (scripts/raw-1688/<SKU>/),
// restyle each into a clean GoPremium catalogue studio shot (removes Chinese/branding/
// watermarks/collages via restyle-core), then (with --publish) drop them straight into the
// live product folder public/images/products/<slug>/ under the catalogue naming
// (<slug>-square/-02..-05.jpg), refresh the image map and flip hasImage=true.
//
// Pick 4-5 raws per SKU that best REPRESENT the product — different angles + the real
// colour options (e.g. one bag per colour) — skipping pure Chinese spec-sheets/factory shots.
//
// Usage:
//   node scripts/restyle-batch.mjs --skus BG017 --plan            # cost + what it will do
//   node scripts/restyle-batch.mjs --skus BG017                   # restyle -> scripts/image-pipeline/staged/restyle/<SKU>/
//   node scripts/restyle-batch.mjs --skus BG017 --publish         # + copy to web folder + update data
//   node scripts/restyle-batch.mjs --all --publish                # every SKU in the pick-list
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, PROMPT, FAL_MODELS, GEMINI_PRICE, loadIcon, finish, genGemini, genFal } from './restyle-core.mjs';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
loadEnv(REPO);
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const has = (k) => argv.includes(k);
const PLAN = has('--plan');
const PUBLISH = has('--publish');
const FORCE = has('--force');
const PICKLIST = JSON.parse(readFileSync(join(REPO, arg('--picklist', 'scripts/restyle-picklist.json')), 'utf8'));
const SKUS = has('--all') ? Object.keys(PICKLIST)
  : (arg('--skus', '') || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

const RAW = join(REPO, 'scripts', 'raw-1688');
const STAGE = join(REPO, 'scripts', 'image-pipeline', 'staged', 'restyle');
const WEB = join(REPO, 'public', 'images', 'products');
const IMGMAP_PATH = join(REPO, 'src', 'data', 'product-images.generated.json');
const CATALOG_PATH = join(REPO, 'scripts', 'catalog-master.json');
const FX = 33.4; // ฿/$ (same rate as fal-studio)

if (!SKUS.length) { console.error('Pass --skus BG017  (or --all)'); process.exit(1); }

// cost estimate
let planImgs = 0;
for (const sku of SKUS) { const e = PICKLIST[sku]; if (e) planImgs += Object.keys(e.picks).length; }
const priceOf = (model) => model === 'gemini' ? GEMINI_PRICE : (FAL_MODELS[model]?.price ?? GEMINI_PRICE);
let estCost = 0;
for (const sku of SKUS) { const e = PICKLIST[sku]; if (e) estCost += Object.keys(e.picks).length * priceOf(e.model || 'gemini'); }
console.log(`\n  SKUs:    ${SKUS.join(', ')}`);
console.log(`  images:  ${planImgs}`);
console.log(`  EST COST: ~$${estCost.toFixed(2)}  (~฿${(estCost * FX).toFixed(1)})`);
console.log(`  publish:  ${PUBLISH ? 'YES -> live product folders + data' : 'no (stage only)'}`);
if (PLAN) {
  for (const sku of SKUS) {
    const e = PICKLIST[sku]; if (!e) { console.log(`  ! ${sku} not in pick-list`); continue; }
    console.log(`\n  ${sku} [${e.model || 'gemini'}] -> ${e.slug}`);
    for (const [role, file] of Object.entries(e.picks)) console.log(`    ${role.padEnd(7)} <- ${file}`);
  }
  console.log('\n  --plan only: no API calls.'); process.exit(0);
}

const imgmap = JSON.parse(readFileSync(IMGMAP_PATH, 'utf8'));
const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
const catArr = Array.isArray(catalog) ? catalog : (catalog.products || Object.values(catalog).find(Array.isArray));

const iconBuf = await loadIcon();
let ok = 0, fail = 0, spent = 0;

for (const sku of SKUS) {
  const e = PICKLIST[sku];
  if (!e) { console.log(`SKIP ${sku} (not in pick-list)`); continue; }
  const model = e.model || 'gemini';
  const stageDir = join(STAGE, sku); mkdirSync(stageDir, { recursive: true });
  console.log(`\n=== ${sku} [${model}] -> ${e.slug} ===`);

  const roles = Object.entries(e.picks); // [role, rawFile]
  const staged = {};
  for (const [role, file] of roles) {
    const src = join(RAW, sku, file);
    if (!existsSync(src)) { console.log(`  ! missing raw ${file}`); fail++; continue; }
    const out = join(stageDir, `${role}.jpg`);
    if (!FORCE && existsSync(out)) { console.log(`  = ${role} already staged`); staged[role] = out; continue; }
    try {
      const raw = model === 'gemini' ? await genGemini(src) : await genFal(src, FAL_MODELS[model].id, 7001);
      await finish(raw, out, iconBuf);
      staged[role] = out; ok++; spent += priceOf(model);
      console.log(`  OK ${role.padEnd(7)} <- ${file}   (running ฿${(spent * FX).toFixed(1)})`);
    } catch (err) { fail++; console.log(`  FAIL ${role} <- ${file}: ${err.message}`); }
  }

  if (PUBLISH && Object.keys(staged).length) {
    const destDir = join(WEB, e.slug); mkdirSync(destDir, { recursive: true });
    const order = ['square', '02', '03', '04', '05', 'hero', 'landscape'];
    const present = order.filter(r => staged[r]);
    for (const role of present) copyFileSync(staged[role], join(destDir, `${e.slug}-${role}.jpg`));
    // refresh image map: square first, then numbered
    const galleryRoles = present.filter(r => r !== 'hero' && r !== 'landscape');
    imgmap[sku] = {
      base: e.slug,
      gallery: galleryRoles.map(r => `/images/products/${e.slug}/${e.slug}-${r}.jpg`),
    };
    // flip hasImage in catalog master
    const rec = catArr.find(p => (p.sku || '').toUpperCase() === sku);
    if (rec) { rec.hasImage = true; if (rec.status) rec.status = 'ขึ้นเว็บแล้ว + มีรูป'; }
    console.log(`  PUBLISHED ${present.length} files -> public/images/products/${e.slug}/`);
  }
}

if (PUBLISH) {
  writeFileSync(IMGMAP_PATH, JSON.stringify(imgmap, null, 2));
  writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  console.log('\n  updated product-images.generated.json + catalog-master.json');
}
console.log(`\n==== done: ${ok} ok, ${fail} fail. Billed ~$${spent.toFixed(2)} (~฿${(spent * FX).toFixed(1)}) ====`);
if (!PUBLISH) console.log('  staged only. Review, then re-run with --publish to push to the live product folder.');
