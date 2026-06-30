// Generate ADDITIONAL studio angles for an express SKU from its clean hero square,
// to build out a 4-6 image GoPremium gallery. Gemini re-photographs the SAME product
// from a new viewpoint (Flux Kontext tends to keep the original composition, so we use
// Gemini here). Keeps all brand-safe + upright + no-text rules; composites the navy icon.
//   node scripts/express-gen-angles.mjs --skus EX045,EX026 --angles front,back,detail --plan
//   node scripts/express-gen-angles.mjs --skus EX045 --angles front,back,detail --go
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
for (const line of readFileSync(join(REPO, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes(k);
const SKUS = (arg('--skus', '') || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
const ANGLES = (arg('--angles', 'front,back,detail') || '').split(',').map(s => s.trim()).filter(Boolean);
const GO = has('--go');
const PRICE = 0.039, RATE = 33.4;
const ICON = 'C:/Users/Golf/Gopremium-website/Gopremium new version/Logo/GoPremium Icon logo - navy.png';
const OUT = join(REPO, 'scripts', 'image-pipeline', 'staged', 'studio-ab');
const IMGMAP = JSON.parse(readFileSync(join(REPO, 'src', 'data', 'product-images.generated.json'), 'utf8'));

const ANGLE_TEXT = {
  front:  'CAMERA VIEWPOINT: a STRAIGHT-ON FRONT view at eye level — the product faces the camera directly and symmetrically (not the three-quarter hero angle).',
  back:   'CAMERA VIEWPOINT: the REAR / BACK view of the SAME product, rotated to show its back side, eye level.',
  side:   'CAMERA VIEWPOINT: a clean SIDE PROFILE view of the product, eye level.',
  top:    'CAMERA VIEWPOINT: a TOP-DOWN / slightly-above view looking onto the product from above.',
  detail: 'CAMERA VIEWPOINT: a tight CLOSE-UP macro detail of the product’s main feature (lid / handle / fabric weave / surface finish) filling most of the frame, shallow depth of field.',
};
const BASE =
  'Re-photograph this EXACT product as a high-end GO PREMIUM catalogue studio shot on a seamless warm off-white / soft cream backdrop, bright high-key, soft diffused daylight from upper-left, soft contact shadow, neutral accurate white balance (reproduce the product’s ORIGINAL colours exactly; warm tone only on the background, never on the product), product centered filling most of the frame, square 1:1. ' +
  'It is the SAME product — identical shape, proportions, base colour, material and finish. UPRIGHT: bottles/tumblers/cups/flasks stand vertical, never lying down. ' +
  'BLANK = truly blank: no logo, text, letters, numbers, watermark, sticker or invented pattern anywhere on or around the product. Remove any supplier logo/watermark/price/size text. Photorealistic, sharp.';

async function loadIcon() {
  const t = Math.round(1000 * 0.085);
  const buf = await sharp(ICON).trim().resize({ width: t, height: t, fit: 'inside' }).png().toBuffer();
  const meta = await sharp(buf).metadata(); return { buf, w: meta.width, h: meta.height };
}
async function finish(raw, outPath, icon) {
  let base = await sharp(raw).resize(1000, 1000, { fit: 'cover' }).toBuffer();
  const m = Math.round(1000 * 0.038);
  base = await sharp(base).composite([{ input: icon.buf, top: 1000 - icon.h - m, left: 1000 - icon.w - m }]).toBuffer();
  await sharp(base).jpeg({ quality: 88, progressive: true }).toFile(outPath);
}
async function genGemini(srcPath, prompt) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const b64 = readFileSync(srcPath).toString('base64');
  const res = await ai.models.generateContent({ model: 'gemini-2.5-flash-image',
    contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'image/jpeg', data: b64 } }, { text: prompt }] }] });
  const part = (res?.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data);
  if (!part) throw new Error('gemini no image'); return Buffer.from(part.inlineData.data, 'base64');
}
const heroOf = (s) => { const r = IMGMAP[s]; if (!r) return null;
  return join(REPO, 'public', 'images', 'products', r.base, `${r.base}-square.jpg`); };

async function main() {
  if (!SKUS.length) { console.error('--skus required'); process.exit(1); }
  const total = SKUS.length * ANGLES.length;
  console.log(`\n  skus: ${SKUS.join(', ')}`);
  console.log(`  angles: ${ANGLES.join(', ')}`);
  console.log(`  images: ${SKUS.length} x ${ANGLES.length} = ${total}`);
  console.log(`  EST COST: ~$${(total * PRICE).toFixed(2)} (~฿${(total * PRICE * RATE).toFixed(1)})\n`);
  if (!GO) { console.log('  --plan/no --go: no API calls.'); return; }
  const icon = await loadIcon();
  let ok = 0, fail = 0, spent = 0;
  for (const sku of SKUS) {
    const src = heroOf(sku);
    if (!src || !existsSync(src)) { console.log(`SKIP ${sku} (no hero)`); continue; }
    const dir = OUT + '/' + sku; mkdirSync(dir, { recursive: true });
    for (const a of ANGLES) {
      const prompt = `${BASE}\n\n${ANGLE_TEXT[a] || ('CAMERA VIEWPOINT: ' + a)}`;
      try {
        const raw = await genGemini(src, prompt);
        await finish(raw, join(dir, `angle-${a}.jpg`), icon);
        ok++; spent += PRICE;
        console.log(`  OK ${sku} angle-${a}  (฿${(spent * RATE).toFixed(1)})`);
      } catch (e) { fail++; console.log(`  FAIL ${sku} angle-${a}: ${e.message}`); }
    }
  }
  console.log(`\n  done: ${ok} ok, ${fail} fail. ~$${spent.toFixed(2)} (~฿${(spent * RATE).toFixed(1)}) -> ${OUT}`);
}
main();
