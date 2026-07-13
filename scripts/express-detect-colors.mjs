// Read the REAL colours from each SKU's multi-colour supplier photo (Gemini vision)
// to replace placeholder colour data ("12 สี") with actual Thai colour names, so the
// Product Detail + the multi-colour group shot line up. PAID (~$0.0008/img).
//   node scripts/express-detect-colors.mjs --plan
//   node scripts/express-detect-colors.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
for (const line of readFileSync(join(REPO, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const PLAN = process.argv.includes('--plan');
const db = JSON.parse(readFileSync(join(REPO, '../Demo/express-master-DB.json'), 'utf8'));
const picks = JSON.parse(readFileSync(join(REPO, '../Demo/_source-picks.json'), 'utf8'));
const isPh = (cols) => cols && cols.length === 1 && (/\d/.test(String(cols[0])) && /สี/.test(String(cols[0])) || /^\d+$/.test(String(cols[0]).trim()));

const work = [];
for (const p of db) {
  if (!isPh(p.colors)) continue;
  const multi = (picks[p.sku] || []).find(c => c.multicolor);
  if (!multi) continue;
  const path = normalize(join(REPO, multi.path));
  if (existsSync(path)) work.push({ sku: p.sku, name: p.name, stated: p.colors[0], path });
}
console.log(`\n  placeholder SKUs with a multi-colour source: ${work.length}`);
console.log(`  EST COST: ~$${(work.length * 0.0008).toFixed(2)} (~฿${(work.length * 0.0008 * 33.4).toFixed(1)})\n`);
if (PLAN) { console.log('  --plan only.'); process.exit(0); }
if (!process.env.GEMINI_API_KEY) { console.error('GEMINI_API_KEY missing'); process.exit(1); }

const { GoogleGenAI } = await import('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const prompt = (stated) => `This supplier photo shows the SAME product in several colours. List EVERY distinct product colour you can see, as short THAI colour names (e.g. ดำ, ขาว, กรม, แดง, เขียวมินต์, ชมพู). The master says "${stated}". Return STRICT JSON only: {"colors":["...","..."]}. Only real colours visible on the products; no duplicates; no extra words.`;

const out = {}; let spent = 0;
for (const w of work) {
  try {
    const b64 = readFileSync(w.path).toString('base64');
    const mime = /\.png$/i.test(w.path) ? 'image/png' : 'image/jpeg';
    const res = await ai.models.generateContent({ model: 'gemini-flash-latest',
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType: mime, data: b64 } }, { text: prompt(w.stated) }] }] });
    const t = (res?.candidates?.[0]?.content?.parts || []).map(x => x.text).join('');
    const m = t.match(/\{[\s\S]*\}/);
    const colors = m ? (JSON.parse(m[0]).colors || []) : [];
    out[w.sku] = { stated: w.stated, colors };
    console.log(`  ${w.sku}: "${w.stated}" -> ${colors.length} สี [${colors.join(', ')}]`);
  } catch (e) { out[w.sku] = { stated: w.stated, colors: [], error: e.message }; console.log(`  ${w.sku}: ERR ${e.message.slice(0, 50)}`); }
  spent += 0.0008;
}
writeFileSync(join(REPO, '../Demo/_detected-colors.json'), JSON.stringify(out, null, 1));
console.log(`\n  done. billed ~฿${(spent * 33.4).toFixed(1)} -> Demo/_detected-colors.json`);
