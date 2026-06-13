// ============================================================
// GO PREMIUM — Home category + occasion cover images
// 7 category covers (cohesive "Studio bright" set) + 6 occasion scenes.
// Same studio set/light/backdrop verbatim across all 7 categories so the
// row reads as ONE theme; only the product changes.
// Output: public/images/home/cat-<slug>.jpg  (1000x820, ratio 1:.82)
//         public/images/home/occ-<slug>.jpg  (1024x640, ratio 16:10)
// All <=150KB, text-free, on CI palette (navy #13244a / gold #f4b223).
// Run: node scripts/gen-home-images.mjs            (skips existing)
//      node scripts/gen-home-images.mjs --force    (regenerate all)
//      node scripts/gen-home-images.mjs cat-fan occ-vip   (only these)
// ============================================================
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const OUT = join(REPO, 'public', 'images', 'home');
mkdirSync(OUT, { recursive: true });

// load .env
for (const line of readFileSync(join(REPO, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-2.5-flash-image';

// ---- THE SHARED STUDIO SET (verbatim in every category prompt = cohesion) ----
const SET =
  'Studio product photo on a clean, bright, seamless off-white backdrop with a subtle soft warm-grey gradient. ' +
  'Product rests on a thin matte navy-blue (#13244a) low riser/podium. A single small warm-gold (#f4b223) accent ' +
  'detail nearby (a slim ring, ribbon edge, or geometric prop). Soft diffused key light from the upper-left with ' +
  'gentle realistic soft shadows, shallow depth of field, slightly elevated three-quarter camera angle, calm negative space. ' +
  'High-end, minimal, editorial B2B corporate-gift aesthetic. Photorealistic. ' +
  'Absolutely NO text, NO letters, NO numbers, NO logos, NO brand marks, NO watermark anywhere on any surface (keep surfaces blank).';

// occasions share the same palette + lighting language but read as a scene
const OCC_BASE =
  'Cohesive premium palette of deep navy blue (#13244a) and warm gold (#f4b223) with clean white. ' +
  'Soft natural daylight from upper-left, gentle realistic shadows, shallow depth of field, editorial high-end ' +
  'B2B corporate-gift aesthetic, calm composition. Photorealistic, wide composition. ' +
  'Absolutely NO text, NO letters, NO logos, NO watermark anywhere (keep all surfaces blank).';

const CATS = [
  ['drinkware', 'A premium stainless-steel insulated tumbler beside a sleek glass water bottle, matte navy and brushed-steel finishes.'],
  ['bags', 'A premium natural-canvas tote bag standing next to a structured navy day-backpack, clean blank fabric panels.'],
  ['stationery', 'A hardcover PU-leather notebook closed flat, a slim metal pen resting on top, and one minimal desk accessory.'],
  ['fan', 'A sleek modern handheld portable mini fan standing upright beside a compact matte power-bank gadget.'],
  ['umbrella', 'A premium auto-open folding umbrella in deep navy, half-open to show clean ribs, standing elegantly.'],
  ['giftset', 'An elegant open premium gift box with a folded gold satin ribbon, holding a tumbler and a leather notebook nested in tidy packaging.'],
  ['lifestyle', 'A small group of premium everyday-carry lifestyle items: a slim leather card holder, a metal keychain, and a minimal zip pouch.'],
];

const OCCS = [
  ['newyear', 'A festive yet minimal New Year corporate gift arrangement: a premium gift box with a gold satin ribbon, a metal tumbler and a leather notebook, a few subtle gold ornaments and soft warm bokeh lights in the background.'],
  ['welcome', 'A fresh, friendly new-employee welcome kit neatly arranged: a branded-style tumbler, a folded canvas tote, a notebook and a small blank greeting card on a bright clean desk.'],
  ['vip', 'An exclusive executive VIP gift: a luxurious dark-navy presentation box opened to reveal premium leather goods and a tumbler with refined gold accents, rich premium lighting on a clean set.'],
  ['event', 'An elegant corporate event giveaway table: neat rows of identical premium tote bags and welcome gifts arranged for a seminar, blurred sophisticated venue background, warm inviting light.'],
  ['milestone', 'A refined anniversary milestone keepsake: a premium engraved-style metal tumbler and an award-like desk object, celebratory but understated arrangement with soft gold highlights.'],
  ['eco', 'A sustainable eco/ESG corporate gift arrangement: a bamboo travel tumbler, a recycled kraft-paper notebook, a cork-base item and a small fresh green plant on a natural light wooden surface.'],
];

// [key, prompt, w, h]
const JOBS = [
  ...CATS.map(([k, p]) => [`cat-${k}`, `${p} ${SET}`, 1000, 820]),
  ...OCCS.map(([k, p]) => [`occ-${k}`, `${p} ${OCC_BASE}`, 1024, 640]),
];

const argv = process.argv.slice(2);
const FORCE = argv.includes('--force');
const only = argv.filter((a) => !a.startsWith('--'));

async function gen([key, prompt, w, h]) {
  const out = join(OUT, `${key}.jpg`);
  if (!FORCE && existsSync(out)) { console.log(`skip ${key} (exists)`); return; }
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  const parts = res?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) { console.warn(`NO IMAGE ${key}`); return; }
  let q = 86, buf;
  do {
    buf = await sharp(Buffer.from(img.inlineData.data, 'base64'))
      .resize(w, h, { fit: 'cover' }).jpeg({ quality: q, mozjpeg: true }).toBuffer();
    if (buf.length <= 150 * 1024) break; q -= 5;
  } while (q >= 50);
  writeFileSync(out, buf);
  console.log(`OK ${key} -> ${(buf.length / 1024).toFixed(0)}KB q${q}`);
}

let n = 0;
for (const j of JOBS) {
  if (only.length && !only.includes(j[0])) continue;
  try { await gen(j); n++; } catch (e) { console.error(`ERR ${j[0]}:`, e.status || '', e.message?.slice(0, 200)); }
}
console.log(`DONE (${n} processed)`);
