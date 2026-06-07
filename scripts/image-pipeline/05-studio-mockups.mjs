// ============================================================
// GO PREMIUM — Image pipeline · Step 5: Studio mockup set
// Generates a COHESIVE set of studio product mockups for ONE product
// (default: BG001 classic canvas tote) using Gemini 2.5 Flash Image.
//
// Goal: every image feels shot in the SAME minimal-classic studio (one
// shared STYLE ANCHOR), but each uses a different camera angle / prop so
// the gallery doesn't get boring. Product stays faithful (edit-mode:
// real photo is the input). A crisp navy brand ICON is composited into
// the bottom-right CORNER of the image (never on the product itself).
//
// Output -> scripts/image-pipeline/staged/<set>/studio-NN.jpg
//           (1:1 1000x1000, <=170 KB) for human review before publish.
//
// Run:
//   node scripts/image-pipeline/05-studio-mockups.mjs scripts/image-pipeline/studio-jobs.json
//
// jobs file = {
//   set: "BG001-studio",
//   logo: "<abs path to icon png>",   // optional; omit to skip watermark
//   anchor: "<shared style anchor text>",
//   shots: [ { name:"01", input:"<abs path>", scene:"<per-shot angle+props>" }, ... ]
// }
// ============================================================
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..');
const STAGE = join(HERE, 'staged');

// --- load .env (simple, no dependency) ---
(() => {
  const envPath = join(REPO, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('✗ GEMINI_API_KEY not set (put it in .env at repo root). Aborting.'); process.exit(1); }

const ai = new GoogleGenAI({ apiKey: KEY });
const MODEL = 'gemini-2.5-flash-image';

const mimeOf = (p) => ({ '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp' }[extname(p).toLowerCase()] || 'image/png');

// Build the bottom-right navy icon overlay once (trimmed + sized).
// Returns { buf, width, height } so we can inset it precisely from the corner.
async function buildLogoOverlay(logoPath, canvas = 1000) {
  if (!logoPath || !existsSync(logoPath)) return null;
  const target = Math.round(canvas * 0.085);          // ~85px icon on a 1000px canvas
  const buf = await sharp(logoPath)
    .trim()                                            // strip transparent padding
    .resize({ width: target, height: target, fit: 'inside' })
    .png()
    .toBuffer();
  const { width, height } = await sharp(buf).metadata();
  return { buf, width, height };
}

async function makeShot({ set, name, input, scene, anchor, logoBuf }) {
  if (!existsSync(input)) { console.warn(`SKIP ${set}/${name}: input not found -> ${input}`); return null; }

  const prompt =
    `${scene}\n\n${anchor}\n\n` +
    `Keep the PRODUCT ITSELF exactly faithful to the input photo: same shape, ` +
    `proportions, colours, material and finish, and keep ANY print, logo or design that ` +
    `is already on the product unchanged. Do NOT invent or add any new logo, brand name, ` +
    `or text onto the product. Remove only the distractions: size charts, measurement ` +
    `numbers, foreign/Chinese text, reflections, stray hands, phones, tablets and ` +
    `unrelated background props (do NOT remove a gift box or packaging that IS the ` +
    `product). Photorealistic, sharp focus on the product. Square 1:1 framing. ` +
    `No text or watermark baked into the image.`;

  const b64 = readFileSync(input).toString('base64');
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [
      { inlineData: { mimeType: mimeOf(input), data: b64 } },
      { text: prompt },
    ]}],
  });

  const parts = res?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData?.data);
  if (!imgPart) { console.warn(`SKIP ${set}/${name}: model returned no image`); return null; }

  const dir = join(STAGE, set);
  mkdirSync(dir, { recursive: true });
  const outFile = join(dir, `studio-${name}.jpg`);

  // normalize -> 1:1 1000x1000 base
  let base = await sharp(Buffer.from(imgPart.inlineData.data, 'base64'))
    .resize(1000, 1000, { fit: 'cover' })
    .toBuffer();

  // composite navy icon, inset from the bottom-right corner (margin ~3.8% of canvas)
  if (logoBuf) {
    const margin = Math.round(1000 * 0.038);
    const top = 1000 - logoBuf.height - margin;
    const left = 1000 - logoBuf.width - margin;
    base = await sharp(base)
      .composite([{ input: logoBuf.buf, top, left }])
      .toBuffer();
  }

  // re-encode to <=170 KB
  let q = 90, buf;
  do {
    buf = await sharp(base).jpeg({ quality: q, mozjpeg: true }).toBuffer();
    if (buf.length <= 170 * 1024) break;
    q -= 4;
  } while (q >= 58);

  writeFileSync(outFile, buf);
  console.log(`OK ${set}/studio-${name} -> ${(buf.length/1024).toFixed(0)}KB q${q}`);
  return outFile;
}

// ---- CLI ----
const jobsPath = process.argv[2];
if (!jobsPath) { console.log('usage: node 05-studio-mockups.mjs <studio-jobs.json>'); process.exit(0); }
const cfg = JSON.parse(readFileSync(jobsPath, 'utf8'));
const logoBuf = await buildLogoOverlay(cfg.logo);
for (const s of cfg.shots) {
  try { await makeShot({ set: cfg.set, anchor: cfg.anchor, logoBuf, ...s }); }
  catch (e) { console.error(`ERR ${cfg.set}/${s.name}:`, e.message); }
}
