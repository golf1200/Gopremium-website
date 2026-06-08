// ============================================================
// GO PREMIUM — Blog/Insights header images (FREE: Gemini free-tier)
// Generates exactly 7 on-brand, photorealistic, text-free headers.
// Output: content/blog/images/<slug>.jpg  (1280x720, <=200KB)
// Run: node scripts/gen-blog-images.mjs
// ============================================================
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const OUT = join(REPO, 'content', 'blog', 'images');
mkdirSync(OUT, { recursive: true });

// load .env
for (const line of readFileSync(join(REPO, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-2.5-flash-image';

const BRAND = 'Cohesive premium brand palette of deep navy blue (#1F3A5F) and warm gold (#F4BD44) with clean white. ' +
  'Editorial, minimal, high-end B2B corporate-gift aesthetic. Soft natural light, realistic soft shadows, shallow depth of field. ' +
  'Absolutely NO text, NO letters, NO logos, NO watermark anywhere. Photorealistic. Wide 16:9 composition with calm negative space.';

const JOBS = [
  { slug: 'newyear-2026',
    prompt: 'An elegant New Year corporate gift set arranged on a clean light desk: a premium gift box with a satin gold ribbon, a metal tumbler, a leather notebook and a pen, a few subtle gold ornaments and soft bokeh lights in the background.' },
  { slug: 'logo-printing',
    prompt: 'A neat top-down flat lay of premium corporate giveaway items on a soft white surface: a matte metal water bottle, a hardcover notebook, a sleek pen and a canvas tote, each with a plain blank surface area where a logo could go (keep surfaces blank).' },
  { slug: 'by-budget',
    prompt: 'A tidy studio still life showing three small groups of corporate gifts arranged left-to-right from simple to more premium: a single pen, then a notebook with a tumbler, then a full gift box set — suggesting good / better / best tiers on a clean background.' },
  { slug: 'eco-gift',
    prompt: 'A sustainable eco corporate gift arrangement: a bamboo travel tumbler, a recycled-paper kraft notebook, a cork-base item and a small green plant, on a natural light wooden surface with soft daylight.' },
  { slug: 'event-souvenir',
    prompt: 'An elegant corporate event giveaway table: rows of identical premium welcome gifts and tote bags neatly arranged for a seminar or anniversary event, blurred elegant venue background, warm inviting light.' },
  { slug: 'insights-hero',
    prompt: 'A sophisticated editorial hero scene of a curated collection of premium corporate gifts beautifully styled on a navy and white tabletop with gold accents, a designer at a desk reviewing a mockup just out of frame, magazine-quality lighting.' },
  { slug: 'unboxing',
    prompt: 'A premium unboxing moment: elegant hands gently opening a high-end navy gift box revealing a tumbler and accessories nestled in tidy packaging, gold tissue paper, soft cinematic light, sense of delight.' },
];

async function gen({ slug, prompt }) {
  const out = join(OUT, `${slug}.jpg`);
  if (existsSync(out)) { console.log(`skip ${slug} (exists)`); return; }
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: `${prompt} ${BRAND}` }] }],
  });
  const parts = res?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) { console.warn(`NO IMAGE ${slug}`); return; }
  let q = 86, buf;
  do {
    buf = await sharp(Buffer.from(img.inlineData.data, 'base64'))
      .resize(1280, 720, { fit: 'cover' }).jpeg({ quality: q, mozjpeg: true }).toBuffer();
    if (buf.length <= 200 * 1024) break; q -= 5;
  } while (q >= 55);
  writeFileSync(out, buf);
  console.log(`OK ${slug} -> ${out} (${(buf.length / 1024).toFixed(0)}KB, q${q})`);
}

for (const j of JOBS) {
  try { await gen(j); } catch (e) { console.error(`ERR ${j.slug}:`, e.status || '', e.message?.slice(0, 200)); }
}
console.log('DONE');
