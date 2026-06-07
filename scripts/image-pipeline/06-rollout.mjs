// ============================================================
// GO PREMIUM — Image pipeline · Step 6: FULL ROLLOUT (all SKUs w/ images)
// For every SKU in product-images.generated.json:
//   • main (#1)  -> studio mockup (category scene) + navy icon bottom-right
//   • #2..#n     -> CLEAN only (strip Chinese/foreign text, banners,
//                   screenshots, size charts, unrelated props) — product kept
//
// Output mirrors public/ layout for easy publish:
//   staged/rollout/<base>/<base>-square.jpg   (new studio main, with logo)
//   staged/rollout/<base>/<base>-02.jpg ...   (cleaned gallery)
//
// RESUMABLE: skips any output that already exists (re-run to fill gaps).
// Nothing is published — review staged output, then copy into public/.
//
// Run:
//   node scripts/image-pipeline/06-rollout.mjs all            # every SKU
//   node scripts/image-pipeline/06-rollout.mjs BG001 DW001    # subset
//   node scripts/image-pipeline/06-rollout.mjs all --force    # re-do existing
// ============================================================
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..');
const PUBLIC = join(REPO, 'public');
const OUT = join(HERE, 'staged', 'rollout');
const DATA = JSON.parse(readFileSync(join(REPO, 'src', 'data', 'product-images.generated.json'), 'utf8'));
const LOGO = 'C:/Users/Golf/Gopremium-website/Gopremium new version/Logo/GoPremium Icon logo - navy.png';

(() => { const p = join(REPO, '.env'); if (!existsSync(p)) return;
  for (const l of readFileSync(p, 'utf8').split(/\r?\n/)) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); } })();
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('✗ GEMINI_API_KEY not set'); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: KEY });
const MODEL = 'gemini-2.5-flash-image';

const ANCHOR = 'STUDIO STYLE — keep this IDENTICAL across every product so the whole catalogue looks like ONE studio shoot: a seamless warm off-white / soft cream studio backdrop, bright high-key and airy, soft diffused daylight from the upper left, a soft natural contact shadow under the product, calm minimal-classic premium mood, warm-neutral colour grade, no harsh shadows, no coloured light. The product is the clear hero, sharp and well-lit, with clean negative space.';

const SCENES = {
  BG: 'Product: a bag/tote. Display it standing upright at a gentle 3/4 angle on the seamless studio backdrop, full so it holds a clean shape, soft contact shadow. Keep any existing printed design on it exactly. Clean catalogue hero.',
  DW: 'Product: a drinkware item (bottle/tumbler/cup). Stand it upright on a pale natural-wood ledge photographed nearly straight-on, a single softly-blurred dried eucalyptus sprig far in the background, warm light.',
  ST: 'Product: a stationery item (pen/notebook/desk piece). Place it at a gentle diagonal on a tidy light-wood desk beside a closed cream notebook and a tiny sprig of greenery, soft daylight from the left, shallow depth of field.',
  FN: 'Product: a small handheld/portable fan. Stand it upright at a slight angle on the plain studio surface, clean and bright with a faint summery freshness, minimal.',
  UM: 'Product: an umbrella. Display it at a flattering 3/4 angle resting cleanly on the warm off-white backdrop with a soft shadow, the fabric catching soft studio light. Keep its pose (open or folded) as in the input. Premium minimal.',
  GS: 'Product: a premium gift set in its presentation box (the box/packaging IS part of the product — keep it). Shown from a slight top-down angle on the warm studio backdrop, soft daylight, elegant and tidy.',
  LS: 'Product: a small lifestyle/EDC item. Place it cleanly on a warm neutral surface, leaning at a gentle angle against a small neutral stone block, soft daylight, shallow depth of field, minimal and premium.',
};
const FAITHFUL = ' Keep the PRODUCT ITSELF exactly faithful to the input photo: same shape, proportions, colours, material and finish, and keep ANY print/logo/design already on it unchanged. Do NOT invent or add any new logo, brand name, or text onto the product. Remove only distractions: size charts, measurement numbers, foreign/Chinese text, reflections, stray hands, phones, tablets and unrelated background props (do NOT remove packaging that IS the product). Photorealistic, sharp focus. Square 1:1. No text or watermark baked in.';
const CLEAN = 'Remove all Chinese/foreign text, size labels, measurement numbers, watermarks, supplier banners, screenshots, mirror reflections, and any objects unrelated to the product (phones, tablets, size boxes, decorative quote frames, extra inset photos). Keep the product EXACTLY as-is — same shape, colour, material, and any print/logo on it. Place it on a clean soft-white studio background with a subtle realistic shadow. Square 1:1. No text, no watermark.';

const mimeOf = (p) => ({ '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp' }[extname(p).toLowerCase()] || 'image/png');

let LOGO_OV = null;
async function logoOverlay() {
  if (LOGO_OV !== null) return LOGO_OV;
  if (!existsSync(LOGO)) { LOGO_OV = false; return false; }
  const buf = await sharp(LOGO).trim().resize({ width: 85, height: 85, fit: 'inside' }).png().toBuffer();
  const { width, height } = await sharp(buf).metadata();
  LOGO_OV = { buf, width, height }; return LOGO_OV;
}

async function gen(input, prompt, withLogo) {
  const b64 = readFileSync(input).toString('base64');
  const res = await ai.models.generateContent({ model: MODEL, contents: [{ role: 'user', parts: [
    { inlineData: { mimeType: mimeOf(input), data: b64 } }, { text: prompt } ] }] });
  const part = (res?.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData?.data);
  if (!part) throw new Error('no image returned');
  let base = await sharp(Buffer.from(part.inlineData.data, 'base64')).resize(1000, 1000, { fit: 'cover' }).toBuffer();
  if (withLogo) { const lo = await logoOverlay(); if (lo) {
    const m = 38; base = await sharp(base).composite([{ input: lo.buf, top: 1000 - lo.height - m, left: 1000 - lo.width - m }]).toBuffer(); } }
  let q = 90, out;
  do { out = await sharp(base).jpeg({ quality: q, mozjpeg: true }).toBuffer(); if (out.length <= 170 * 1024) break; q -= 4; } while (q >= 56);
  return out;
}

function pubPath(webPath) { return join(PUBLIC, ...webPath.replace(/^\//, '').split('/')); }

const args = process.argv.slice(2);
const force = args.includes('--force');
const mainsOnly = args.includes('--mains-only');
let skus = args.filter((a) => !a.startsWith('--'));
if (skus.length === 1 && skus[0].toLowerCase() === 'all') skus = Object.keys(DATA);
if (!skus.length) { console.log('usage: node 06-rollout.mjs all | <SKU...> [--force]'); process.exit(0); }

let okM = 0, okC = 0, skip = 0, fail = 0; const fails = [];
for (const sku of skus) {
  const e = DATA[sku]; if (!e) { console.warn(`?? ${sku}: not in data`); continue; }
  const cat = sku.replace(/[0-9]+$/, '');
  const base = e.base; const gal = e.gallery || [];
  const dir = join(OUT, base); mkdirSync(dir, { recursive: true });

  // ---- main (#1) ----
  const mainIn = pubPath(gal[0]);
  const mainOut = join(dir, `${base}-square.jpg`);
  if (!force && existsSync(mainOut)) { skip++; }
  else if (!existsSync(mainIn)) { console.warn(`SKIP ${sku} main: input missing ${mainIn}`); fail++; fails.push(`${sku}:main:input`); }
  else { try {
    const scene = SCENES[cat] || SCENES.LS;
    const buf = await gen(mainIn, `${scene}\n\n${ANCHOR}\n\n${FAITHFUL}`, true);
    writeFileSync(mainOut, buf); okM++; console.log(`OK ${sku} main (${(buf.length/1024).toFixed(0)}KB)`);
  } catch (err) { fail++; fails.push(`${sku}:main:${err.message}`); console.error(`ERR ${sku} main: ${err.message}`); } }

  // ---- cleans (#2..#n) ----
  for (let i = 1; !mainsOnly && i < gal.length; i++) {
    const idx = String(i + 1).padStart(2, '0');
    const cIn = pubPath(gal[i]);
    const cOut = join(dir, `${base}-${idx}.jpg`);
    if (!force && existsSync(cOut)) { skip++; continue; }
    if (!existsSync(cIn)) { console.warn(`SKIP ${sku} ${idx}: input missing`); fail++; fails.push(`${sku}:${idx}:input`); continue; }
    try { const buf = await gen(cIn, CLEAN, false); writeFileSync(cOut, buf); okC++; console.log(`OK ${sku} ${idx} (${(buf.length/1024).toFixed(0)}KB)`); }
    catch (err) { fail++; fails.push(`${sku}:${idx}:${err.message}`); console.error(`ERR ${sku} ${idx}: ${err.message}`); }
  }
}
console.log(`\n==== DONE  mains:${okM} cleans:${okC} skipped(exists):${skip} failed:${fail} ====`);
if (fails.length) { writeFileSync(join(OUT, '_failures.json'), JSON.stringify(fails, null, 2)); console.log('failures -> staged/rollout/_failures.json (re-run same command to retry; existing outputs are skipped)'); }
