// ============================================================
// GO PREMIUM — Express product shots via Gemini 2.5 Flash Image
// Same "Studio bright" mood & tone as the home/category covers, but here the
// PRODUCT is the hero. Generates a hero + several COLOUR variants per SKU.
//
//  - reference photo exists (clean die-cut/source) -> image-to-image (faithful)
//  - no clean photo (flyer/screenshot only)        -> text-to-image from the
//    product spec (name/material/size), "as close to a real product photo as possible"
//
// Output (staging, for review — never straight to public/):
//   express-assets/EX###/gen/<sku>-<colorkey>.jpg   1000x1000 <=170KB
//   express-assets/EX###/gen/_review.json
//
// COST: each generated image = $0.039 (Gemini 2.5 Flash Image). This script
// PRINTS a cost estimate and REQUIRES --go to actually call the API.
//
// Usage:
//   node scripts/gen-express-products.mjs --plan                 # cost only, no API calls
//   node scripts/gen-express-products.mjs --go --sku EX004       # ONE sku (paid test ~ a few cents)
//   node scripts/gen-express-products.mjs --go --tier B          # full run for a tier
//   flags: --colors N (override per-sku colour count) --only express|all
// ============================================================
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const ASSETS = join(REPO, 'express-assets');
const PRICE_PER_IMAGE = 0.039;

// ---- args ----
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };
const GO = has('--go');
const ONLY = val('--only', 'all');          // all | express
const TIER = val('--tier', 'B');            // A(3) | B(4) | C(7) colours
const COLORS_OVERRIDE = val('--colors', null);
const SKU_FILTER = val('--sku', null);
const TIER_COLORS = { A: 3, B: 4, C: 7 };
const COLORS_N = COLORS_OVERRIDE ? +COLORS_OVERRIDE : (TIER_COLORS[TIER] ?? 4);

// ---- load .env ----
for (const line of readFileSync(join(REPO, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const MODEL = 'gemini-2.5-flash-image';

const products = JSON.parse(readFileSync(join(HERE, 'express-products.json'), 'utf8'));
const report = existsSync(join(ASSETS, 'express-process-report.json'))
  ? JSON.parse(readFileSync(join(ASSETS, 'express-process-report.json'), 'utf8')) : [];

// ---- THE SHARED STUDIO MOOD (verbatim from gen-home-images.mjs for cohesion) ----
const MOOD =
  'Studio product photo on a clean, bright, seamless off-white backdrop with a subtle soft warm-grey gradient. ' +
  'The product rests on a thin matte navy-blue (#13244a) low riser/podium with a single small warm-gold (#f4b223) ' +
  'accent detail nearby. Soft diffused key light from the upper-left, gentle realistic soft shadows, shallow depth ' +
  'of field, slightly elevated three-quarter camera angle, calm negative space. High-end, minimal, editorial B2B ' +
  'corporate-gift aesthetic. Photorealistic. The product is the clear hero, centered, filling most of the frame. ' +
  'Absolutely NO text, NO letters, NO numbers, NO logos, NO brand marks, NO watermark anywhere (keep all surfaces blank).';

// colour palettes per category (sliced to COLORS_N)
const PALETTES = {
  garment:  [['white','ขาว'],['black','ดำ'],['navy','กรมท่า'],['heather-grey','เทา'],['maroon','เลือดหมู'],['forest-green','เขียว'],['beige','ครีม']],
  drinkware:[['brushed stainless steel','สแตนเลส'],['matte black','ดำด้าน'],['matte white','ขาวด้าน'],['navy blue','กรมท่า'],['blush pink','ชมพู'],['sage green','เขียวสด'],['champagne gold','ทอง']],
  umbrella: [['deep navy','กรมท่า'],['black','ดำ'],['red','แดง'],['forest green','เขียว'],['transparent clear','ใส'],['royal blue','น้ำเงิน'],['burgundy','เลือดหมู']],
  hat:      [['black','ดำ'],['navy','กรมท่า'],['white','ขาว'],['khaki','กากี'],['red','แดง'],['cream','ครีม'],['grey','เทา']],
  powerbank:[['matte white','ขาว'],['matte black','ดำ'],['navy','กรมท่า'],['silver','เงิน']],
  fan:      [['white','ขาว'],['mint green','เขียวมิ้นต์'],['sky blue','ฟ้า'],['pink','ชมพู']],
  bags:     [['natural canvas','ผ้าดิบ'],['black','ดำ'],['navy','กรมท่า'],['khaki','กากี'],['off-white','ครีม']],
  lifestyle:[['black','ดำ'],['navy','กรมท่า'],['tan leather','หนังแทน'],['grey','เทา']],
};

// pick best reference image for a SKU (a confident, 'good' die-cut), else null
function refFor(sku, sup) {
  const recs = report.filter((r) => r.kind === 'photo' && r.verdict === 'good' && r.web &&
    (r.sku === sku || (!r.sku && r.sup === sup)));
  if (!recs.length) return null;
  return join(ASSETS, recs[0].web.replace(/\//g, '/'));
}

function productNoun(p) {
  // a short English-ish noun phrase for the prompt
  const n = p.name;
  const c = p.category_slug;
  if (c === 'drinkware') return `a premium ${/แก้ว/.test(n) ? 'insulated tumbler cup' : 'stainless-steel water bottle'}`;
  if (c === 'garment')   return /โปโล/.test(n) ? 'a premium polo shirt (neatly laid flat / ghost-mannequin)' :
                                  /แจ็คเก็ต/.test(n) ? 'a premium zip jacket' :
                                  /ผ้ากันเปื้อน/.test(n) ? 'a premium canvas apron' :
                                  /กางเกง/.test(n) ? 'a pair of premium work trousers' :
                                  /ช็อป/.test(n) ? 'a premium work shop-shirt' : 'a premium cotton t-shirt (ghost-mannequin)';
  if (c === 'hat')       return 'a premium baseball / structured cap';
  if (c === 'umbrella')  return /กอล์ฟ/.test(n) ? 'a large premium golf umbrella, half-open' : 'a premium folding umbrella, half-open to show clean ribs';
  if (c === 'powerbank') return 'a slim premium power bank gadget';
  if (c === 'fan')       return 'a sleek handheld portable mini fan';
  if (c === 'bags')      return 'a premium soft puffy tote/shoulder bag';
  return 'a premium corporate-gift product';
}

// build the per-SKU job list
const jobs = [];
for (const p of products) {
  if (ONLY === 'express' && p.lead_tier !== 'express') continue;
  if (SKU_FILTER && p.sku !== SKU_FILTER) continue;
  const pal = (PALETTES[p.category_slug] || PALETTES.lifestyle).slice(0, COLORS_N);
  const ref = refFor(p.sku, p.sup_code);
  jobs.push({ sku: p.sku, name: p.name, cat: p.category_slug, noun: productNoun(p),
    material: p.material, size: p.size, ref, colors: pal });
}
const totalImages = jobs.reduce((s, j) => s + j.colors.length, 0);
const estLow = totalImages * PRICE_PER_IMAGE;
const estHigh = estLow * 1.25; // retry buffer

console.log(`\n=== EXPRESS PRODUCT IMAGE GEN — plan ===`);
console.log(`scope: ${ONLY}  ·  SKUs: ${jobs.length}  ·  colours/SKU: ${COLORS_N}  (tier ${TIER})`);
console.log(`images to generate: ${totalImages}`);
console.log(`with reference (faithful i2i): ${jobs.filter((j) => j.ref).length} SKUs  ·  text-to-image: ${jobs.filter((j) => !j.ref).length} SKUs`);
console.log(`COST @ $${PRICE_PER_IMAGE}/img: $${estLow.toFixed(2)}  (+25% retry buffer ~ $${estHigh.toFixed(2)})  ≈ ฿${(estHigh*36).toFixed(0)}`);
if (!GO) { console.log(`\n(plan only — add --go to actually call Gemini)\n`); process.exit(0); }

// ---- generation ----
const mimeOf = (p) => ({ png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp' }[p.split('.').pop().toLowerCase()] || 'image/jpeg');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function genOne(job, colorEn, colorTh) {
  const dir = join(ASSETS, job.sku, 'gen');
  mkdirSync(dir, { recursive: true });
  const out = join(dir, `${job.sku}-${colorEn.replace(/[^a-z]/gi, '').slice(0, 10)}.jpg`);
  const spec = [job.material && `material: ${job.material}`, job.size && `size: ${job.size}`].filter(Boolean).join(', ');
  const parts = [];
  let prompt;
  if (job.ref && existsSync(job.ref)) {
    parts.push({ inlineData: { mimeType: mimeOf(job.ref), data: readFileSync(job.ref).toString('base64') } });
    prompt = `Re-photograph THIS exact product as ${job.noun} in ${colorEn} colour. Keep the exact shape, proportions, ` +
      `material and design of the product in the reference image — only restyle the scene and set the colour to ${colorEn}. ${MOOD}`;
  } else {
    prompt = `Create a realistic studio product photograph of ${job.noun} in ${colorEn} colour${spec ? ` (${spec})` : ''}, ` +
      `as close as possible to a real catalogue product photo. ${MOOD}`;
  }
  parts.push({ text: prompt });
  const res = await ai.models.generateContent({ model: MODEL, contents: [{ role: 'user', parts }] });
  const img = (res?.candidates?.[0]?.content?.parts || []).find((x) => x.inlineData?.data);
  if (!img) { console.warn(`  NO IMAGE ${job.sku} ${colorEn}`); return null; }
  let q = 88, buf;
  do {
    buf = await sharp(Buffer.from(img.inlineData.data, 'base64')).resize(1000, 1000, { fit: 'cover' })
      .jpeg({ quality: q, mozjpeg: true }).toBuffer();
    if (buf.length <= 170 * 1024) break; q -= 4;
  } while (q >= 58);
  writeFileSync(out, buf);
  console.log(`  OK ${job.sku} ${colorEn} -> ${(buf.length/1024).toFixed(0)}KB`);
  return { color_en: colorEn, color_th: colorTh, file: out, mode: job.ref ? 'i2i' : 't2i' };
}

let made = 0;
for (const job of jobs) {
  const reviewed = [];
  for (const [en, th] of job.colors) {
    try { const r = await genOne(job, en, th); if (r) { reviewed.push(r); made++; } }
    catch (e) { console.error(`  ERR ${job.sku} ${en}:`, e.status || '', (e.message || '').slice(0, 120)); }
  }
  writeFileSync(join(ASSETS, job.sku, 'gen', '_review.json'), JSON.stringify({ sku: job.sku, name: job.name, images: reviewed }, null, 2));
}
console.log(`\nDONE — generated ${made} images. Est spend ~ $${(made * PRICE_PER_IMAGE).toFixed(2)}. Review in express-assets/EX###/gen/`);
