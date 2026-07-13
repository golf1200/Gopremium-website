// Verify the freshly-generated studio variants (gemini-*.jpg) for given SKUs and
// pick the best clean+upright+well-scaled one as the hero. Flags SKUs with NO
// good variant. -> ../Demo/_regen-hero-picks.json  { SKU: {file, ...flags} }
//   node scripts/verify-variants-pick.mjs EX113 EX120 ...
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
for (const line of readFileSync(join(REPO, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const SKUS = process.argv.slice(2).map(s => s.toUpperCase());
const STUDIO = join(REPO, 'scripts/image-pipeline/staged/studio-ab');
const PROMPT = `Strict catalogue QA for a blank promo product on a cream studio backdrop. JSON only:
{"clean":true|false,  // no supplier brand/logo/URL/spec text/printed words on the product (GO PREMIUM corner gift icon does NOT count)
 "upright":true|false, // bottles/cups/tumblers stand vertical; lying/tipped => false
 "well_scaled":true|false, // product fully in frame, sensible catalogue scale, not cut off/tiny
 "color_natural":true|false, "studio_ok":true|false, "issue":""}`;
const { GoogleGenAI } = await import('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function chk(p) {
  const b64 = readFileSync(p).toString('base64');
  const r = await ai.models.generateContent({ model: 'gemini-flash-latest',
    contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'image/jpeg', data: b64 } }, { text: PROMPT }] }] });
  const t = (r?.candidates?.[0]?.content?.parts || []).map(x => x.text).join(''); const m = t.match(/\{[\s\S]*\}/);
  return m ? JSON.parse(m[0]) : null;
}
const picks = {}; let spent = 0;
for (const sku of SKUS) {
  const d = join(STUDIO, sku); if (!existsSync(d)) { console.log(`${sku}: no dir`); continue; }
  const vs = readdirSync(d).filter(f => /^gemini-\d+\.jpg$/.test(f)).sort();
  let best = null, bestScore = -1;
  const rows = [];
  for (const v of vs) {
    let s; try { s = await chk(join(d, v)); } catch { s = null; } spent += 0.0008;
    if (!s) continue;
    const score = (s.clean ? 4 : 0) + (s.upright ? 3 : 0) + (s.well_scaled ? 2 : 0) + (s.studio_ok ? 1 : 0) + (s.color_natural ? 1 : 0);
    rows.push(`${v}:${score}${s.clean ? '' : ' dirty'}${s.upright ? '' : ' lying'}${s.well_scaled ? '' : ' scale'}`);
    if (score > bestScore) { bestScore = score; best = { file: v, ...s, score }; }
  }
  picks[sku] = best;
  const perfect = best && best.clean && best.upright && best.well_scaled;
  console.log(`${sku}: best ${best?.file} score ${bestScore} ${perfect ? '✅' : '⚠️ ' + (best?.issue || '')}  [${rows.join(' | ')}]`);
}
writeFileSync(join(REPO, '../Demo/_regen-hero-picks.json'), JSON.stringify(picks, null, 1));
console.log(`\nbilled ~฿${(spent * 33.4).toFixed(1)} -> Demo/_regen-hero-picks.json`);
