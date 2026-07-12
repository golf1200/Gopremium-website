// GO PREMIUM — AI image QA for Express products (reusable safety net).
// Uses Gemini vision to check every DEPLOYED express image + every generated GROUP
// shot, so nothing ships with supplier branding / wrong colour / and no good
// multi-colour "family" shot is left un-deployed (the exact miss we want to prevent).
//
// PAID (Gemini vision, ~$0.0008/img). Always --plan first, confirm ฿, then run.
//   node scripts/verify-express-images.mjs --plan
//   node scripts/verify-express-images.mjs               # verify all
//   node scripts/verify-express-images.mjs --skus EX026,EX114
//
// Writes: ../Demo/express-verify-report.json  (+ console summary)
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
for (const line of readFileSync(join(REPO, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const PLAN = argv.includes('--plan');
const ONLY = (arg('--skus', '') || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
const PRICE = 0.0008; // ~ per vision call

const gen = JSON.parse(readFileSync(join(REPO, 'src/data/product-images.generated.json'), 'utf8'));
const v2 = readFileSync(join(REPO, 'public/v2.html'), 'utf8');
const EXPRESS = JSON.parse(v2.match(/const EXPRESS_SKUS=(\[[^\]]*\]);/)[1]);
const STUDIO = join(REPO, 'scripts/image-pipeline/staged/studio-ab');

// Build the work list: deployed hero + deployed gallery-2 (if any) + generated group shot.
const jobs = [];
for (const sku of EXPRESS) {
  if (ONLY.length && !ONLY.includes(sku)) continue;
  const g = gen[sku]; if (!g) continue;
  const hero = g.gallery?.[0];
  if (hero) jobs.push({ sku, kind: 'hero', path: join(REPO, 'public', hero.split('?')[0].replace(/^\//, '')) });
  const gdir = join(STUDIO, sku);
  if (existsSync(gdir)) {
    const grp = readdirSync(gdir).filter(f => /^group-\d+\.jpg$/i.test(f)).sort()[0];
    if (grp) jobs.push({ sku, kind: 'group', path: join(gdir, grp) });
  }
}

console.log(`\n  Express SKUs: ${EXPRESS.length}${ONLY.length ? ' (filtered ' + ONLY.length + ')' : ''}`);
console.log(`  images to verify: ${jobs.length}  (hero + group)`);
console.log(`  EST COST: ~$${(jobs.length * PRICE).toFixed(2)}  (~฿${(jobs.length * PRICE * 33.4).toFixed(1)})\n`);
if (PLAN) { console.log('  --plan only.'); process.exit(0); }
if (!process.env.GEMINI_API_KEY) { console.error('  GEMINI_API_KEY missing'); process.exit(1); }

const PROMPT = `You are a strict e-commerce catalogue QA reviewer for a Thai premium-gifts brand (GO PREMIUM).
IMPORTANT: A small dark-navy GIFT-BOX / ribbon icon in the BOTTOM-RIGHT corner is GO PREMIUM's OWN
brand mark. It is EXPECTED on every image — IGNORE it completely. It does NOT count as a watermark,
logo, branding, text, or clutter, and must NOT lower any score.
Look at this ONE product photo and answer STRICT JSON only, no prose:
{
 "clean": true|false,            // TRUE if the PRODUCT ITSELF carries NO supplier/other brand name, logo, printed spec text, URL/website (e.g. www.xxx.com), QR, phone, or a placeholder "LOGO"/text, AND there is NO translucent watermark text overlaid across the image. Molded/printed brand words like "REMAX" => false. (The GO PREMIUM corner gift icon does NOT count.)
 "color_natural": true|false,    // product colours look natural/true, NOT heavily tinted yellow/amber/sepia
 "upright": true|false,          // bottles/cups/tumblers/mugs stand vertical on base; non-standing items => true
 "studio_ok": true|false,        // TRUE only if the background is a plain seamless CREAM / off-white / light-grey studio backdrop. Any textured or real-world surface — fur/shag rug, wood, fabric, marble, table, floor, outdoor, coloured or busy background — => FALSE. NOTE: a wearable garment (shirt/cap/apron/polo) worn ON A HUMAN MODEL against a clean studio backdrop is EXPECTED and CORRECT => studio_ok true, clean true (judge only the garment itself for branding).
 "is_multicolor_group": true|false, // TRUE only if the frame shows the SAME product in 3+ DIFFERENT colours together as a family/lineup
 "issue": "" // <=12 words describing the worst REAL problem (ignore the corner gift icon), else empty
}`;

async function verify(ai, path) {
  const b64 = readFileSync(path).toString('base64');
  const mime = path.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const res = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: [{ role: 'user', parts: [{ inlineData: { mimeType: mime, data: b64 } }, { text: PROMPT }] }],
  });
  const txt = (res?.candidates?.[0]?.content?.parts || []).map(p => p.text).join('');
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('no json: ' + txt.slice(0, 80));
  return JSON.parse(m[0]);
}

const { GoogleGenAI } = await import('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const results = [];
let done = 0, spent = 0;
const POOL = 5;
async function worker(queue) {
  while (queue.length) {
    const job = queue.shift();
    try {
      const v = await verify(ai, job.path);
      results.push({ ...job, ...v });
    } catch (e) {
      results.push({ ...job, error: e.message });
    }
    spent += PRICE; done++;
    if (done % 20 === 0) console.log(`  ...${done}/${jobs.length} (฿${(spent * 33.4).toFixed(1)})`);
  }
}
const queue = [...jobs];
await Promise.all(Array.from({ length: POOL }, () => worker(queue)));

// ---- analyse ----
const fails = results.filter(r => r.kind === 'hero' && (r.clean === false || r.color_natural === false || r.upright === false || r.studio_ok === false));
const goodGroups = results.filter(r => r.kind === 'group' && r.is_multicolor_group === true && r.clean !== false && r.studio_ok !== false && r.color_natural !== false);
const weakGroups = results.filter(r => r.kind === 'group' && !(r.is_multicolor_group === true && r.clean !== false && r.studio_ok !== false && r.color_natural !== false));
const errored = results.filter(r => r.error);

const report = {
  generatedAt: null, express: EXPRESS.length, imagesChecked: jobs.length,
  heroFails: fails.map(f => ({ sku: f.sku, issue: f.issue, clean: f.clean, color_natural: f.color_natural, upright: f.upright, studio_ok: f.studio_ok })),
  goodMulticolorGroups: goodGroups.map(g => g.sku),
  weakGroups: weakGroups.map(g => g.sku),
  errors: errored.map(e => ({ sku: e.sku, kind: e.kind, error: e.error })),
  all: results.map(r => ({ sku: r.sku, kind: r.kind, clean: r.clean, color_natural: r.color_natural, upright: r.upright, studio_ok: r.studio_ok, is_multicolor_group: r.is_multicolor_group, issue: r.issue || '', error: r.error || '' })),
};
writeFileSync(join(REPO, '../Demo/express-verify-report.json'), JSON.stringify(report, null, 1));

console.log(`\n  ===== EXPRESS IMAGE QA =====`);
console.log(`  checked ${jobs.length} imgs · billed ~฿${(spent * 33.4).toFixed(1)}`);
console.log(`  HERO problems:            ${fails.length}  ${fails.map(f => f.sku).join(', ')}`);
console.log(`  GOOD multicolour groups:  ${goodGroups.length} (→ add to gallery)`);
console.log(`  weak/single groups:       ${weakGroups.length} (skip)`);
console.log(`  errors:                   ${errored.length}`);
console.log(`  report -> Demo/express-verify-report.json`);
