// Build a side-by-side A/B HTML: REAL | FREE(rembg) | Gemini | Flux Kontext.
// Columns auto-skip if an image is missing (e.g. Flux before FAL_KEY added).
import { readFileSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AB = join(__dirname, 'image-pipeline', 'staged', 'studio-ab');
const FREE = join(__dirname, 'image-pipeline', 'staged', 'free-studio-compare');

const SKUS = process.argv.slice(2);
const list = SKUS.length ? SKUS.map(s => s.toUpperCase()) : ['EX022', 'EX010'];
const LABELS = { EX022:'EX022 · พัดลม', EX010:'EX010 · ร่ม (ลายน้ำ)', EX001:'EX001 · เสื้อ (ป้าย+หุ่น)', EX004:'EX004 · ขวดใส', EX008:'EX008 · หมวก', EX020:'EX020 · พาวเวอร์แบงก์', EX056:'EX056 · กระเป๋า' };

const COLS = [
  { file: () => 'real', src: (sku) => join(AB, sku, 'real.jpg'),               title: 'รูปจริง',          sub: 'ต้นฉบับซัพ', cls: 'real' },
  { file: () => 'free', src: (sku) => join(FREE, sku, 'v1-bright.jpg'),         title: 'ฟรี · rembg',     sub: 'ตัด+ฉากสตูดิโอ', cls: 'free' },
  { file: () => 'gem',  src: (sku) => join(AB, sku, 'gemini-1.jpg'),            title: 'Gemini',          sub: '$0.039 · ฿1.3', cls: 'paid' },
  { file: () => 'flux', src: (sku) => join(AB, sku, 'kontext-pro-1.jpg'),       title: 'Flux Kontext pro', sub: '$0.04 · ฿1.34', cls: 'paid' },
];

const b64 = (p) => `data:image/${extname(p).slice(1).replace('jpg','jpeg')};base64,` + readFileSync(p).toString('base64');
const kb = (p) => Math.round(statSync(p).size / 1024);

// only keep columns that have at least one image present
const active = COLS.filter(c => list.some(sku => existsSync(c.src(sku))));

let rows = '';
for (const sku of list) {
  let cells = '';
  for (const c of active) {
    const p = c.src(sku);
    cells += existsSync(p)
      ? `<td class="cell ${c.cls}"><div class="imgwrap"><img src="${b64(p)}"></div><div class="cap"><b>${c.title}</b><span>${c.sub}</span><i>${kb(p)} KB</i></div></td>`
      : `<td class="cell empty"><div class="imgwrap none">ยังไม่มี<br><small>(ใส่ FAL_KEY แล้วยิง)</small></div><div class="cap"><b>${c.title}</b><span>${c.sub}</span></div></td>`;
  }
  rows += `<tr><th class="rowhead">${LABELS[sku] || sku}</th>${cells}</tr>`;
}
const head = active.map(c => `<th class="colhead ${c.cls}">${c.title}</th>`).join('');
const hasFlux = list.some(sku => existsSync(COLS[3].src(sku)));
const footerNote = hasFlux
  ? 'เชื่อม fal.ai แล้ว ✓ — Flux Kontext ยิงครบ (สีล็อกตรงรูปจริง)'
  : '(Flux ยังว่าง = ยังไม่ได้ใส่ FAL_KEY)';

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>GO PREMIUM · A/B จริง vs ฟรี vs Gemini vs Flux</title>
<style>
 :root{--navy:#13244a;--gold:#f4b223}
 *{box-sizing:border-box} body{margin:0;background:#eceae4;color:var(--navy);font-family:"IBM Plex Sans Thai","Segoe UI",system-ui,sans-serif}
 header{background:var(--navy);color:#fff;padding:26px 30px} header h1{margin:0;font-size:21px} header h1 b{color:var(--gold)}
 header p{margin:8px 0 0;opacity:.85;font-size:13.5px;line-height:1.6;max-width:900px}
 .scroll{overflow-x:auto;padding:22px} table{border-collapse:separate;border-spacing:14px;margin:0 auto}
 .colhead{font-size:13px;text-align:center;padding-bottom:2px} .colhead.real{color:#0a7a3f} .colhead.paid{color:#b9831a}
 .rowhead{text-align:left;font-size:15px;width:150px;line-height:1.4;padding-right:6px;vertical-align:middle}
 .cell{background:#fff;border-radius:14px;padding:10px;width:240px;vertical-align:top;box-shadow:0 2px 10px rgba(19,36,74,.08)}
 .cell.real{outline:2px solid #0a7a3f} .cell.paid{outline:2px solid var(--gold)}
 .imgwrap{aspect-ratio:1;border-radius:9px;overflow:hidden;background:#f4f1ea} .imgwrap img{width:100%;height:100%;object-fit:cover;display:block}
 .imgwrap.none{display:flex;align-items:center;justify-content:center;color:#9aa1b2;font-size:13px;text-align:center}
 .cap{margin-top:8px;display:flex;flex-direction:column;gap:1px;font-size:12px} .cap span{color:#5b647a} .cap i{color:#9aa1b2;font-style:normal;font-size:10.5px}
 .free{display:inline-block;background:var(--gold);color:var(--navy);font-weight:700;padding:2px 9px;border-radius:20px;font-size:12px}
 footer{padding:18px 30px 36px;font-size:12.5px;color:#5b647a;text-align:center}
</style></head><body>
<header><h1>GO <b>PREMIUM</b> — เทียบ 4 ทาง: รูปจริง · ฟรี(rembg) · Gemini · Flux Kontext</h1>
<p>คอลัมน์เขียว = รูปจริงจากซัพ · คอลัมน์ทอง = AI วาด (เสียเงิน) ใช้ <b>prompt เดียวกัน</b> เล็งโทนแคตตาล็อก GO PREMIUM (ครีมอุ่น + เงานุ่ม + ไอคอน navy มุมขวา) · ดูที่: <b>ลบลายน้ำได้ไหม</b> · <b>สินค้าเพี้ยนไหม</b> · <b>เข้าแคตตาล็อกไหม</b></p></header>
<div class="scroll"><table><tr><th></th>${head}</tr>${rows}</table></div>
<footer>ต่อรูป: Gemini ฿1.3 · Flux Kontext pro ฿1.34 · ${footerNote}</footer>
</body></html>`;

const out = join(AB, 'COMPARE-AB.html');
writeFileSync(out, html);
console.log('wrote', out, '(' + Math.round(statSync(out).size / 1024) + ' KB)');
