// GO PREMIUM — studio restyle A/B: Gemini vs Flux (fal.ai), SAME prompt.
// Turns a REAL product photo into a catalogue-matching studio shot AND removes
// baked-in watermarks/text/swatch-cards/mannequins in ONE edit pass.
// Target look = the EXISTING finished catalogue (warm cream backdrop, high-key,
// soft daylight, navy gift icon bottom-right) — anchor copied from the live
// image-pipeline studio anchor so new shots blend into the current catalogue.
//
// PAID. Gemini bills GEMINI_API_KEY; Flux bills FAL_KEY. Add keys to .env.
//
// Usage:
//   node scripts/fal-studio.mjs --skus EX010,EX022 --provider fal    --model kontext-pro --n 1 --plan
//   node scripts/fal-studio.mjs --skus EX010,EX022 --provider gemini --n 1
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');

for (const f of ['.env']) {
  try {
    for (const line of readFileSync(join(REPO, f), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
}

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const has = (k) => argv.includes(k);
const SKUS = (arg('--skus', '') || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
const PROVIDER = arg('--provider', 'fal');
const MODEL = arg('--model', 'kontext-pro');
const N = parseInt(arg('--n', '1'), 10);
const PLAN = has('--plan');
const NOICON = has('--no-icon');

const FAL_MODELS = {
  'kontext-pro': { id: 'fal-ai/flux-pro/kontext',     price: 0.04 },
  'kontext-max': { id: 'fal-ai/flux-pro/kontext/max', price: 0.08 },
  'flux2-pro':   { id: 'fal-ai/flux-2-pro',           price: 0.03 },
};
const GEMINI_PRICE = 0.039;
const ICON = 'C:/Users/Golf/Gopremium-website/Gopremium new version/Logo/GoPremium Icon logo - navy.png';

// ---- THE prompt: matches the live catalogue anchor + faithful edit ----
const PROMPT =
  `Re-photograph this exact product as a high-end GO PREMIUM catalogue studio shot. ` +
  `STUDIO STYLE (match it precisely so the photo blends into the existing catalogue): ` +
  `a seamless warm off-white / soft cream studio backdrop, bright high-key and airy, ` +
  `soft diffused daylight from the upper-left, a soft natural contact shadow under the ` +
  `product, calm minimal-classic premium mood, no harsh ` +
  `shadows, no coloured light, generous negative space, slightly elevated three-quarter ` +
  `camera angle, square 1:1 framing, product centered and filling most of the frame.\n\n` +
  `CRITICAL COLOUR RULE: use neutral, accurate, true-to-life white balance. Reproduce the ` +
  `product's ORIGINAL colours EXACTLY as in the input photo — do NOT add any warm, yellow, ` +
  `amber or sepia tint to the product. The soft warm-cream tone is ONLY for the background ` +
  `backdrop, never on the product itself; the product must keep its real hue and saturation.\n\n` +
  `Keep the PRODUCT ITSELF faithful to the input: same shape, proportions, base ` +
  `COLOUR (identical hue/saturation), material and finish.\n\n` +
  `BRAND-SAFE RULES (anti-plagiarism — these are blank promo products):\n` +
  `• SINGLE UNIT: if the input shows the SAME product repeated (a colour montage, size ` +
  `line-up, wreath/collage, or supplier spec sheet), output ONLY ONE single clean ` +
  `representative unit as the hero — NEVER a collage, grid or multiple copies. ` +
  `(Exception: a product genuinely sold as a set/pair stays together.)\n` +
  `• WORN GARMENTS: if it is a wearable garment (apron/polo/shirt/jacket/cap) shown ON a ` +
  `person, KEEP it worn — but COMPLETELY REPLACE the person with a DIFFERENT, brand-new ` +
  `realistic THAI model. This must look like a totally different individual photographed in ` +
  `a separate session: change the FACE SHAPE, the HAIRSTYLE and hair length/colour, the ` +
  `apparent age, the body build, and the POSE so there is NO resemblance to the original ` +
  `person. Do NOT copy or lightly retouch the original face — regenerate it from scratch. ` +
  `The new model must be clearly recognisable as a different person side-by-side with the ` +
  `input. Do NOT strip the garment off and show it empty. Show it worn naturally.\n` +
  `• CLIENT ARTWORK: if the product carries a CUSTOMER's printed logo/graphic/branded ` +
  `pattern (printed umbrella canopy, logo cushion), do NOT reproduce it. Replace with a ` +
  `SUBTLE NEUTRAL generic pattern (soft abstract/geometric, no real brand), keeping the ` +
  `BASE COLOUR EXACTLY the same. (Base colour = fabric/canopy/body colour; artwork = ` +
  `graphics on top — change only the artwork, never the colour.)\n` +
  `• BLANK = TRULY BLANK: if the product has no customer print, keep it COMPLETELY plain — ` +
  `absolutely NO logo, emblem, monogram, motif, pattern, text, letters or numbers anywhere ` +
  `on it. NEVER invent or add a logo/brand/design of your own.\n\n` +
  `REMOVE every distraction AND all text on/around the product: supplier logos/brand ` +
  `names/watermarks, contact info (LINE id, phone, QR), promo buttons, colour-swatch cards, ` +
  `printed/embossed words on the product itself (incl. generic words like "thank you", ` +
  `"Size S/L", size codes, measurements), foreign/Chinese/Thai overlay text, price tags, ` +
  `stickers, mannequins, stands, stray hands, background clutter — keep ONLY the bare ` +
  `product. Photorealistic, sharp focus, absolutely no text or watermark anywhere.`;

const OUT = join(REPO, 'scripts', 'image-pipeline', 'staged', 'studio-ab');
const IMGMAP = JSON.parse(readFileSync(join(REPO, 'src', 'data', 'product-images.generated.json'), 'utf8'));
const FROM_CURATE = has('--from-curate');   // source = curated Drive hero in staged-curate/<SKU>/
const CURATE_DIR = join(REPO, 'express-realphoto-2026', 'staged-curate');
const realSquare = (sku) => {
  if (FROM_CURATE) {
    const d = join(CURATE_DIR, sku);
    if (!existsSync(d)) return null;
    const files = readdirSync(d).filter(x => /\.jpg$/i.test(x));
    // pick the real product HERO, never a colour-chart/size-chart/detail file
    const f = files.find(x => /hero/i.test(x))
           || files.filter(x => !/chart|size|detail/i.test(x)).sort()[0]
           || files.sort()[0];
    return f ? join(d, f) : null;
  }
  const rec = IMGMAP[sku]; if (!rec) return null;
  return join(REPO, 'public', 'images', 'products',
    rec.gallery[0].replace(/^\//, '').replace('images/products/', ''));
};
const mk = (d) => { mkdirSync(d, { recursive: true }); return d; };

let iconBuf = null;
async function loadIcon() {
  if (NOICON || !existsSync(ICON)) return null;
  const target = Math.round(1000 * 0.085);
  const buf = await sharp(ICON).trim().resize({ width: target, height: target, fit: 'inside' }).png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, width: meta.width, height: meta.height };
}
async function finish(rawBuf, outPath) {
  let base = await sharp(rawBuf).resize(1000, 1000, { fit: 'cover' }).toBuffer();
  if (iconBuf) {
    const margin = Math.round(1000 * 0.038);
    base = await sharp(base).composite([{ input: iconBuf.buf,
      top: 1000 - iconBuf.height - margin, left: 1000 - iconBuf.width - margin }]).toBuffer();
  }
  await sharp(base).jpeg({ quality: 88, progressive: true }).toFile(outPath);
}

async function genGemini(srcPath) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const b64 = readFileSync(srcPath).toString('base64');
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ role: 'user', parts: [
      { inlineData: { mimeType: 'image/jpeg', data: b64 } }, { text: PROMPT }] }],
  });
  const part = (res?.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data);
  if (!part) throw new Error('gemini returned no image');
  return Buffer.from(part.inlineData.data, 'base64');
}

let falMod = null, falImageUrlCache = {};
async function genFal(srcPath, modelId, seed) {
  if (!falMod) { falMod = (await import('@fal-ai/client')).fal; falMod.config({ credentials: process.env.FAL_KEY }); }
  if (!falImageUrlCache[srcPath]) {
    falImageUrlCache[srcPath] = await falMod.storage.upload(new Blob([readFileSync(srcPath)], { type: 'image/jpeg' }));
  }
  const res = await falMod.subscribe(modelId, {
    input: { prompt: PROMPT, image_url: falImageUrlCache[srcPath], seed, num_images: 1, output_format: 'jpeg' },
    logs: false,
  });
  const url = res?.data?.images?.[0]?.url;
  if (!url) throw new Error('fal returned no image');
  return Buffer.from(await (await fetch(url)).arrayBuffer());
}

async function main() {
  if (!SKUS.length) { console.error('Pass --skus EX010,EX022'); process.exit(1); }
  const isGem = PROVIDER === 'gemini';
  const fal = FAL_MODELS[MODEL];
  if (!isGem && !fal) { console.error('Unknown --model:', Object.keys(FAL_MODELS).join(', ')); process.exit(1); }
  const price = isGem ? GEMINI_PRICE : fal.price;
  const tag = isGem ? 'gemini' : MODEL;
  const total = SKUS.length * N;
  console.log(`\n  provider: ${PROVIDER}${isGem ? '' : ' / ' + MODEL}`);
  console.log(`  skus:     ${SKUS.join(', ')}`);
  console.log(`  images:   ${SKUS.length} x ${N} = ${total}`);
  console.log(`  EST COST: ~$${(total * price).toFixed(2)}  (~฿${(total * price * 33.4).toFixed(1)})  @ $${price}/img\n`);
  if (PLAN) { console.log('  --plan only: no API calls.'); return; }

  const need = isGem ? 'GEMINI_API_KEY' : 'FAL_KEY';
  if (!process.env[need]) { console.error(`  ✗ ${need} not set in .env`); process.exit(1); }
  iconBuf = await loadIcon();

  let ok = 0, fail = 0, spent = 0;
  for (const sku of SKUS) {
    const src = realSquare(sku);
    if (!src || !existsSync(src)) { console.log(`SKIP ${sku} (no source)`); continue; }
    const dir = mk(join(OUT, sku));
    if (!existsSync(join(dir, 'real.jpg'))) writeFileSync(join(dir, 'real.jpg'), readFileSync(src));
    for (let i = 1; i <= N; i++) {
      try {
        const raw = isGem ? await genGemini(src) : await genFal(src, fal.id, i * 1000 + 7);
        await finish(raw, join(dir, `${tag}-${i}.jpg`));
        ok++; spent += price;
        console.log(`  OK ${sku} ${tag} #${i}  (running ฿${(spent * 33.4).toFixed(1)})`);
      } catch (e) { fail++; console.log(`  FAIL ${sku} ${tag} #${i}:`, e.message); }
    }
  }
  console.log(`\n  done: ${ok} ok, ${fail} fail. Billed ~$${spent.toFixed(2)} (~฿${(spent * 33.4).toFixed(1)}) -> ${OUT}`);
}
main();
