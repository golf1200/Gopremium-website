// GO PREMIUM — AI source selector for the express restyle re-do.
// Scores every pulled Google-Drive supplier photo per SKU and picks the best ~5
// as gen sources (a clean front hero + a multi-colour lineup + distinct angles),
// so the studio gen runs on the RIGHT source instead of a random embedded thumb.
// PAID (Gemini vision, ~$0.0008/img). --plan first.
//   node scripts/express-source-select.mjs --plan
//   node scripts/express-source-select.mjs
// Writes: ../Demo/_source-picks.json  { SKU: [{path, view, clarity, multicolor}] }
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
for (const line of readFileSync(join(REPO, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const PLAN = process.argv.includes('--plan');
const db = JSON.parse(readFileSync(join(REPO, '../Demo/express-master-DB.json'), 'utf8'));
const FOLDERS = join(REPO, 'express-realphoto-2026/drive-raw/_folders');
const RAW1688 = join(REPO, 'scripts/raw-1688');
const IMGEXT = /\.(jpg|jpeg|png|webp|jfif)$/i;

// gather EVERY real supplier source for a SKU: Drive folder(s) + 1688 scrape
const sourceImgs = (p) => {
  const out = [];
  for (const l of (p.img_link_drive || [])) {
    const id = l.replace(/\/$/, '').split('/').pop().split('?')[0];
    const d = join(FOLDERS, id);
    if (existsSync(d)) for (const f of readdirSync(d).sort()) if (IMGEXT.test(f)) out.push(join(d, f));
  }
  const d1688 = join(RAW1688, p.sku);
  if (existsSync(d1688)) for (const f of readdirSync(d1688).sort()) if (IMGEXT.test(f)) out.push(join(d1688, f));
  return out;
};

const work = db.map(p => ({ sku: p.sku, name: p.name, imgs: sourceImgs(p) })).filter(w => w.imgs.length);
const totalImgs = work.reduce((n, w) => n + w.imgs.length, 0);
console.log(`\n  SKUs with Drive photos: ${work.length}`);
console.log(`  images to score: ${totalImgs}`);
console.log(`  EST COST: ~$${(totalImgs * 0.0008).toFixed(2)} (~฿${(totalImgs * 0.0008 * 33.4).toFixed(1)})\n`);
if (PLAN) { console.log('  --plan only.'); process.exit(0); }
if (!process.env.GEMINI_API_KEY) { console.error('GEMINI_API_KEY missing'); process.exit(1); }

const PROMPT = `Rate this supplier product photo as a SOURCE for a clean studio re-shoot. STRICT JSON only:
{
 "usable": true|false,           // true if it clearly shows the physical product (NOT a spec sheet, size chart, pure text, packaging box, blurry or tiny thumbnail)
 "view": "front"|"angle"|"back"|"detail"|"lifestyle"|"other",
 "multicolor": true|false,       // shows the SAME product in 3+ colours together (a colour lineup/family)
 "clarity": 1-10,                // sharpness + how well the whole product is shown, well-lit, uncluttered
 "note": ""                      // <=8 words
}`;

const { GoogleGenAI } = await import('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function score(path) {
  const b64 = readFileSync(path).toString('base64');
  const mime = /\.png$/i.test(path) ? 'image/png' : 'image/jpeg';
  const res = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: [{ role: 'user', parts: [{ inlineData: { mimeType: mime, data: b64 } }, { text: PROMPT }] }],
  });
  const t = (res?.candidates?.[0]?.content?.parts || []).map(p => p.text).join('');
  const m = t.match(/\{[\s\S]*\}/); if (!m) throw new Error('no json');
  return JSON.parse(m[0]);
}

const picks = {};
let done = 0, spent = 0;
for (const w of work) {
  const scored = [];
  for (const img of w.imgs) {
    try { const s = await score(img); scored.push({ path: img.replace(REPO + '\\', '').replace(/\\/g, '/'), ...s }); }
    catch (e) { scored.push({ path: img, usable: false, clarity: 0, note: 'err' }); }
    spent += 0.0008; done++;
  }
  // choose best 5: usable only; prefer 1 best front, 1 multicolor, then top clarity, distinct views
  const usable = scored.filter(s => s.usable).sort((a, b) => b.clarity - a.clarity);
  const chosen = [];
  const front = usable.find(s => s.view === 'front'); if (front) chosen.push(front);
  const multi = usable.find(s => s.multicolor && !chosen.includes(s)); if (multi) chosen.push(multi);
  for (const s of usable) { if (chosen.length >= 5) break; if (!chosen.includes(s)) chosen.push(s); }
  picks[w.sku] = chosen;
  console.log(`  ${w.sku}: ${w.imgs.length} imgs -> pick ${chosen.length}  (฿${(spent * 33.4).toFixed(1)})`);
}
writeFileSync(join(REPO, '../Demo/_source-picks.json'), JSON.stringify(picks, null, 1));
console.log(`\n  done. scored ${done}, billed ~฿${(spent * 33.4).toFixed(1)} -> Demo/_source-picks.json`);
