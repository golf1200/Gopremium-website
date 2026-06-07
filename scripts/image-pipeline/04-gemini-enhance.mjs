// ============================================================
// GO PREMIUM — Image pipeline · Step 4: Gemini enhance
// Uses Gemini 2.5 Flash Image ("Nano Banana") to EDIT real product
// photos: (a) place the product in a lifestyle environment (main), or
// (b) clean a raw shot (remove Chinese/foreign text + irrelevant stuff).
//
// IMPORTANT: edit-mode only — the real product photo is the input, so the
// product stays faithful. Output goes to a STAGING dir for human review,
// never straight to public/. Re-encoded to 1:1 1000x1000, <=170 KB.
//
// Setup:
//   1) npm i @google/genai sharp        (both already installed)
//   2) put GEMINI_API_KEY in a gitignored .env at repo root, or export it
//
// Run (single):
//   node scripts/image-pipeline/04-gemini-enhance.mjs main  <SKU> "<inputImg>" "<scene prompt>"
//   node scripts/image-pipeline/04-gemini-enhance.mjs clean <SKU> "<inputImg>"
// Run (batch from a jobs file):
//   node scripts/image-pipeline/04-gemini-enhance.mjs jobs scripts/image-pipeline/jobs.json
//
// jobs.json = [ { sku, mode:"main"|"clean", input:"<abs path>", prompt?, out?:"01" } ]
// ============================================================
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..');                 // .../website
const STAGE = join(HERE, 'staged');                  // review staging area

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

const CLEAN_PROMPT =
  'Remove all Chinese/foreign text, size labels, watermarks, and any objects ' +
  'unrelated to the product (phones, tablets, size boxes, decorative quote frames). ' +
  'Keep the product EXACTLY as-is — same shape, colour, material, and any logo. ' +
  'Place it on a clean soft-white studio background with a subtle realistic shadow. ' +
  'Square 1:1 composition. No text, no watermark.';

const mimeOf = (p) => ({ '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp' }[extname(p).toLowerCase()] || 'image/png');

async function enhance({ sku, mode, input, prompt, out }) {
  if (!existsSync(input)) { console.warn(`SKIP ${sku}: input not found -> ${input}`); return null; }
  const finalPrompt = mode === 'main'
    ? `${prompt} Keep the product EXACTLY as-is: same shape, colour, and finish. Do NOT add, invent, or change any logo, brand name, label, or engraved/embossed text on the product — the product surface must stay plain, exactly like the input. Photorealistic, soft natural light, realistic shadow, premium minimal, shallow depth of field. Square 1:1. No text anywhere, no watermark.`
    : CLEAN_PROMPT;

  const b64 = readFileSync(input).toString('base64');
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [
      { inlineData: { mimeType: mimeOf(input), data: b64 } },
      { text: finalPrompt },
    ]}],
  });

  const parts = res?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData?.data);
  if (!imgPart) { console.warn(`SKIP ${sku}: model returned no image`); return null; }

  const dir = join(STAGE, sku);
  mkdirSync(dir, { recursive: true });
  const name = mode === 'main' ? 'main' : `clean-${out || '02'}`;
  const outFile = join(dir, `${name}.jpg`);

  // normalize -> 1:1 1000x1000, <=170 KB
  let q = 88, buf;
  do {
    buf = await sharp(Buffer.from(imgPart.inlineData.data, 'base64'))
      .resize(1000, 1000, { fit: 'cover' })
      .jpeg({ quality: q, mozjpeg: true }).toBuffer();
    if (buf.length <= 170 * 1024) break;
    q -= 4;
  } while (q >= 58);
  writeFileSync(outFile, buf);
  console.log(`OK ${sku} ${mode} -> ${outFile} (${(buf.length/1024).toFixed(0)}KB, q${q})`);
  return outFile;
}

// ---- CLI ----
const [, , a0, a1, a2, a3] = process.argv;
if (a0 === 'jobs') {
  const jobs = JSON.parse(readFileSync(a1, 'utf8'));
  for (const j of jobs) { try { await enhance(j); } catch (e) { console.error(`ERR ${j.sku}:`, e.message); } }
} else if (a0 === 'main' || a0 === 'clean') {
  await enhance({ mode: a0, sku: a1, input: a2, prompt: a3 || '', out: '02' });
} else {
  console.log('usage:\n  node 04-gemini-enhance.mjs main  <SKU> "<input>" "<scene prompt>"\n  node 04-gemini-enhance.mjs clean <SKU> "<input>"\n  node 04-gemini-enhance.mjs jobs <jobs.json>');
}
