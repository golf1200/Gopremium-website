// ============================================================
// GripPop — phone-grip (PopSocket-style) product photos
// 12 designs = the 12 items in shop.html. Lifestyle: each grip
// popped out on the CENTER-BACK of a phone, same phone angle +
// same soft pastel studio backdrop verbatim across all 12 so the
// shop grid reads as ONE cohesive set; only the grip design changes.
// Output: <GripPop>/assets/products/<slug>.jpg  (1000x1000 square, <=180KB)
// Run from the Gopremium website dir (has node_modules + .env):
//   node scripts/gen-grippop-products.mjs            (skips existing)
//   node scripts/gen-grippop-products.mjs --force    (regen all)
//   node scripts/gen-grippop-products.mjs y2k-heart  (only these)
// ============================================================
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'C:/Users/Golf/Documents/Claude/Projects/Griptok Website/website/assets/products';
mkdirSync(OUT, { recursive: true });

// load .env from the Gopremium website dir (cwd when run)
for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-2.5-flash-image';

// ---- SHARED SCENE (verbatim in every prompt = cohesion) ----
const SET =
  'Photorealistic lifestyle product photo of a modern smartphone seen FROM THE BACK at a consistent ' +
  'slightly-tilted three-quarter angle, standing/floating centered against a soft seamless pastel pink-and-lilac ' +
  'studio backdrop with a gentle soft drop shadow and a few subtle out-of-focus pastel bokeh dots. ' +
  'A round expandable pop-out phone grip (PopSocket style, with the accordion concertina base) is mounted on the ' +
  'CENTER of the phone back and popped OUT toward the camera, so the round printed top disc of the grip is the ' +
  'clear hero of the shot, large and crisp in the frame. The phone body is a clean minimal matte color. ' +
  'Bright cheerful Gen-Z aesthetic, soft diffused studio lighting, shallow depth of field. ' +
  'Square composition with calm negative space. The phone SCREEN is not visible (back view only). ' +
  'NO watermark, NO store text, NO extra logos anywhere except the grip\'s own printed design described below.';

// [slug, design-of-the-round-grip-disc]
const JOBS = [
  ['goodvibes-daisy', 'The grip disc shows a cute white daisy flower with a sunny-yellow center on a hot-pink (#FF4D8D) background, playful and fresh.'],
  ['stay-creative',   'The grip disc is lilac-to-purple (#B49CFF to #7B5CFF) with a small playful retro hand-lettered wordmark reading "STAY CREATIVE" in white.'],
  ['midnight-wave',   'The grip disc is deep midnight navy (#0B1D3A) with elegant abstract flowing purple-and-blue wavy lines, calm and dreamy.'],
  ['lucky-smile',     'The grip disc is bright sunny yellow (#FFD36E) with one big cute simple black smiley face, cheerful.'],
  ['bloom-bloom',     'The grip disc is soft pastel pink with a pretty cluster of small blooming flowers in pink, lilac and mint, delicate and sweet.'],
  ['cosmic-pop',      'The grip disc is a purple-to-pink cosmic gradient (#7B5CFF to #FF4D8D) scattered with tiny white sparkles and stars, with a small "POP" wordmark.'],
  ['paws-love',       'The grip disc is soft baby-pink with scattered white cat/dog paw prints and a few tiny red hearts, cute and playful.'],
  ['pastel-dream',    'The grip disc is a dreamy soft swirl of pastel pink, lilac and mint blended like cotton candy, airy and gentle.'],
  ['cool-kid',        'The grip disc is bold blue (#2D6BFF) with a chunky retro white "COOL" wordmark, confident streetwear vibe.'],
  ['sunny-day',       'The grip disc is warm yellow-orange with a cute smiling sun with rays, happy and warm.'],
  ['y2k-heart',       'The grip disc is glossy Y2K hot-pink with a shiny chrome/metallic heart in the center, early-2000s aesthetic.'],
  ['mono-line',       'The grip disc is minimal off-white with a single clean black continuous line-art drawing of an abstract smiling face, modern and minimalist.'],
];

const argv = process.argv.slice(2);
const FORCE = argv.includes('--force');
const only = argv.filter((a) => !a.startsWith('--'));

async function gen([slug, design]) {
  const out = join(OUT, `${slug}.jpg`);
  if (!FORCE && existsSync(out)) { console.log(`skip ${slug} (exists)`); return; }
  const prompt = `${design} ${SET}`;
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  const parts = res?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) { console.warn(`NO IMAGE ${slug}`); return; }
  let q = 86, buf;
  do {
    buf = await sharp(Buffer.from(img.inlineData.data, 'base64'))
      .resize(1000, 1000, { fit: 'cover' }).jpeg({ quality: q, mozjpeg: true }).toBuffer();
    if (buf.length <= 180 * 1024) break; q -= 5;
  } while (q >= 50);
  writeFileSync(out, buf);
  console.log(`OK ${slug} -> ${(buf.length / 1024).toFixed(0)}KB q${q}`);
}

let n = 0;
for (const j of JOBS) {
  if (only.length && !only.includes(j[0])) continue;
  try { await gen(j); n++; } catch (e) { console.error(`ERR ${j[0]}:`, e.status || '', e.message?.slice(0, 200)); }
}
console.log(`DONE (${n} processed)`);
