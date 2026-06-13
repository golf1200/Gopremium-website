// Take REAL product photos (express-assets/EX###/real/*) and restyle ONLY the
// background/lighting into the "Studio bright" Product Template — keeping the
// real product pixels faithful (image-to-image). Output -> EX###/styled/.
// Gemini 2.5 Flash Image, $0.039/image. Requires --go.
//
//   node scripts/express-restyle.mjs --plan                 # cost only
//   node scripts/express-restyle.mjs --go --sku EX019       # one sku
//   node scripts/express-restyle.mjs --go --sku EX019 --max 1
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const ASSETS = join(REPO, 'express-assets');
const PRICE = 0.039;

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };
const GO = has('--go');
const SKU = val('--sku', null);
const FILE = val('--file', null); // process only this exact filename in real/
const MAX = +val('--max', 99);   // max real images per SKU

for (const line of readFileSync(join(REPO, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const MODEL = 'gemini-2.5-flash-image';

// "Cream studio" — matches the live site product heroes (public/images/products/*)
// and the free composite backdrop, so all express shots are cohesive.
const MOOD =
  'a warm premium studio scene: a seamless cream / warm off-white backdrop with a soft diagonal gradient ' +
  '(lighter upper-left fading to deeper warm beige lower-right) and gentle soft-focus draped-cloth shadows in the ' +
  'upper-left. The product stands on a smooth matte cream tabletop with a soft realistic contact shadow under it. ' +
  'Warm diffused key light from the upper-left, shallow depth of field, calm negative space, slightly elevated ' +
  'three-quarter angle. High-end minimal editorial e-commerce catalogue hero aesthetic. Photorealistic.';

const PROMPT =
  `Keep the product in the image EXACTLY as it is — identical shape, colour, material, proportions and design. ` +
  `Do NOT redraw, restyle, or replace the product, and do NOT add any logo, brand name, text or watermark on it. ` +
  `Cleanly remove the original background and any text/labels, then place the SAME product into ${MOOD} ` +
  `The product stays the clear hero, centered, filling most of the frame. Absolutely NO text, letters, numbers, logos or watermark anywhere.`;

const skuDirs = readdirSync(ASSETS).filter((d) => /^EX\d+$/.test(d) && existsSync(join(ASSETS, d, 'real')));
const jobs = [];
for (const sku of skuDirs) {
  if (SKU && sku !== SKU) continue;
  let imgs = readdirSync(join(ASSETS, sku, 'real')).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  if (FILE) imgs = imgs.filter((f) => f === FILE);
  imgs = imgs.slice(0, MAX);
  imgs.forEach((f) => jobs.push({ sku, file: join(ASSETS, sku, 'real', f), name: f }));
}
console.log(`\n=== RESTYLE real photos -> Product Template ===`);
console.log(`images: ${jobs.length}  ·  cost @ $${PRICE}/img: $${(jobs.length * PRICE).toFixed(2)} (~ ฿${(jobs.length * PRICE * 36).toFixed(0)})`);
if (!GO) { console.log(`(plan only — add --go to call Gemini)\n`); process.exit(0); }

const mimeOf = (p) => ({ '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp' }[extname(p).toLowerCase()] || 'image/jpeg');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
let made = 0;
for (const j of jobs) {
  try {
    const res = await ai.models.generateContent({ model: MODEL, contents: [{ role: 'user', parts: [
      { inlineData: { mimeType: mimeOf(j.file), data: readFileSync(j.file).toString('base64') } },
      { text: PROMPT },
    ]}]});
    const img = (res?.candidates?.[0]?.content?.parts || []).find((x) => x.inlineData?.data);
    if (!img) { console.warn(`  NO IMAGE ${j.sku} ${j.name}`); continue; }
    const dir = join(ASSETS, j.sku, 'styled'); mkdirSync(dir, { recursive: true });
    const out = join(dir, j.name.replace(/\.(jpeg|png|webp)$/i, '.jpg'));
    let q = 88, buf;
    do { buf = await sharp(Buffer.from(img.inlineData.data, 'base64')).resize(1000, 1000, { fit: 'cover' }).jpeg({ quality: q, mozjpeg: true }).toBuffer();
      if (buf.length <= 170 * 1024) break; q -= 4; } while (q >= 58);
    writeFileSync(out, buf); made++;
    console.log(`  OK ${j.sku} ${j.name} -> ${(buf.length/1024).toFixed(0)}KB`);
  } catch (e) { console.error(`  ERR ${j.sku} ${j.name}:`, e.status || '', (e.message || '').slice(0, 120)); }
}
console.log(`\nDONE — ${made} restyled. Spend ~ $${(made * PRICE).toFixed(2)}. In express-assets/EX###/styled/`);
