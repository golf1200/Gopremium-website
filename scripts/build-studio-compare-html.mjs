// Build a self-contained side-by-side comparison HTML:
//   each product = one row: REAL | v1..v5 (free studio-look variants)
// All images embedded as base64 -> opens anywhere, no sibling files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STAGED = path.join(__dirname, 'image-pipeline', 'staged', 'free-studio-compare');

// SKU -> friendly Thai label
const LABELS = {
  DW001: 'DW001 · ขวดน้ำสุญญากาศ',
  DW018: 'DW018 · กระบอกสตีล',
  BG001: 'BG001 · กระเป๋าผ้า Classic',
  BG009: 'BG009 · กระเป๋าบักเก็ต',
  FN001: 'FN001 · พัดลมมินิ',
  UM002: 'UM002 · ร่ม Premium',
  ST003: 'ST003 · ปากกา Luxe',
  PB001: 'PB001 · พาวเวอร์แบงก์',
  LS001: 'LS001 · การ์ดโฮลเดอร์',
  GS001: 'GS001 · กิ๊ฟต์เซ็ตธุรกิจ',
  // ── สินค้าส่งด่วน (Express, รูปดิบจากซัพ) ──
  EX001: 'EX001 · เสื้อ (ส่งด่วน)',
  EX004: 'EX004 · แก้ว/ขวด (ส่งด่วน)',
  EX008: 'EX008 · หมวก (ส่งด่วน)',
  EX010: 'EX010 · ร่ม (ส่งด่วน)',
  EX020: 'EX020 · พาวเวอร์แบงก์ (ส่งด่วน)',
  EX022: 'EX022 · พัดลม (ส่งด่วน)',
  EX056: 'EX056 · กระเป๋า (ส่งด่วน)',
  EX082: 'EX082 · แก้ว/ขวด (ส่งด่วน)',
  EX095: 'EX095 · กระเป๋า (ส่งด่วน)',
  EX101: 'EX101 · ไลฟ์สไตล์ (ส่งด่วน)',
};

// pick which SKUs to render + output filename from CLI (default = express set)
const ARGV = process.argv.slice(2);
const EXPRESS = ['EX001','EX004','EX008','EX010','EX020','EX022','EX056','EX082','EX095','EX101'];
const CATALOG = ['DW001','DW018','BG001','BG009','FN001','UM002','ST003','PB001','LS001','GS001'];
const SET = ARGV[0] === 'catalog' ? CATALOG
          : ARGV[0] === 'express' ? EXPRESS
          : ARGV[0] === 'all' ? [...CATALOG, ...EXPRESS]
          : EXPRESS;
const OUTNAME = ARGV[0] === 'catalog' ? 'COMPARE-real-vs-studio.html'
              : ARGV[0] === 'all' ? 'COMPARE-all.html'
              : 'COMPARE-express-vs-studio.html';
const IS_EXPRESS = ARGV[0] !== 'catalog';
const COLS = [
  ['real.jpg',          'รูปจริง',        'ต้นฉบับจากซัพ/สตูดิโอ'],
  ['v1-bright.jpg',     'V1 · Studio Bright', 'off-white + เงาสัมผัส'],
  ['v2-podium.jpg',     'V2 · Navy Podium',   'แท่นวาง navy + วงแหวนทอง'],
  ['v3-reflection.jpg', 'V3 · Reflection',    'พื้นสว่าง + เงาสะท้อน'],
  ['v4-editorial.jpg',  'V4 · Navy Editorial','พื้น navy สปอตไลต์'],
  ['v5-warm.jpg',       'V5 · Warm Tone',     'ไล่เฉดเทาอุ่น'],
];

const order = SET;
const b64 = (p) => {
  const ext = path.extname(p).slice(1).replace('jpg', 'jpeg');
  return `data:image/${ext};base64,` + fs.readFileSync(p).toString('base64');
};
const kb = (p) => Math.round(fs.statSync(p).size / 1024);

let rows = '';
for (const sku of order) {
  const dir = path.join(STAGED, sku);
  if (!fs.existsSync(dir)) continue;
  let cells = '';
  for (const [file, title, sub] of COLS) {
    const fp = path.join(dir, file);
    if (!fs.existsSync(fp)) { cells += `<td class="cell empty">—</td>`; continue; }
    const isReal = file === 'real.jpg';
    cells += `<td class="cell${isReal ? ' real' : ''}">
      <div class="imgwrap"><img loading="lazy" src="${b64(fp)}" alt="${sku} ${title}"></div>
      <div class="cap"><b>${title}</b><span>${sub}</span><i>${kb(fp)} KB</i></div>
    </td>`;
  }
  rows += `<tr><th class="rowhead">${LABELS[sku]}</th>${cells}</tr>`;
}

const headCells = COLS.map(([, t]) =>
  `<th class="colhead${t === 'รูปจริง' ? ' realhead' : ''}">${t}</th>`).join('');

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM · เทียบรูปจริง vs AI Studio (ฟรี)${IS_EXPRESS ? ' — สินค้าส่งด่วน' : ''}</title>
<style>
  :root{--navy:#13244a;--gold:#f4b223;--off:#f8f6f1;}
  *{box-sizing:border-box}
  body{margin:0;background:#eceae4;color:var(--navy);
    font-family:"IBM Plex Sans Thai","Segoe UI",system-ui,sans-serif}
  header{background:var(--navy);color:#fff;padding:28px 32px}
  header h1{margin:0;font-size:22px;letter-spacing:.3px}
  header h1 b{color:var(--gold)}
  header p{margin:6px 0 0;opacity:.82;font-size:14px;max-width:880px;line-height:1.55}
  .legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;font-size:12.5px}
  .legend span{background:rgba(255,255,255,.08);padding:5px 11px;border-radius:20px}
  .scroll{overflow-x:auto;padding:22px}
  table{border-collapse:separate;border-spacing:14px;min-width:1180px;margin:0 auto}
  .colhead{font-size:13px;color:var(--navy);padding:0 0 4px;text-align:center;font-weight:700}
  .colhead.realhead{color:#0a7a3f}
  .rowhead{text-align:left;vertical-align:middle;font-size:15px;width:148px;
    padding-right:8px;line-height:1.45}
  .cell{background:#fff;border-radius:14px;padding:10px;width:208px;vertical-align:top;
    box-shadow:0 2px 10px rgba(19,36,74,.08)}
  .cell.real{outline:2px solid #0a7a3f;outline-offset:0}
  .imgwrap{aspect-ratio:1;border-radius:9px;overflow:hidden;background:var(--off)}
  .imgwrap img{width:100%;height:100%;object-fit:cover;display:block}
  .cap{margin-top:8px;display:flex;flex-direction:column;gap:1px;font-size:11.5px}
  .cap b{font-size:12.5px}
  .cap span{color:#5b647a}
  .cap i{color:#9aa1b2;font-style:normal;font-size:10.5px}
  footer{padding:20px 32px 40px;font-size:12.5px;color:#5b647a;text-align:center}
  .free{display:inline-block;background:var(--gold);color:var(--navy);font-weight:700;
    padding:3px 10px;border-radius:20px;font-size:12px}
</style></head><body>
<header>
  <h1>GO <b>PREMIUM</b> — เทียบรูปจริง vs AI Studio look <span class="free">ฟรี 100%</span>${IS_EXPRESS ? ' · สินค้าส่งด่วน' : ''}</h1>
  ${IS_EXPRESS ? `<p style="color:var(--gold);font-weight:600;margin-bottom:2px">โฟกัสที่สินค้าส่งด่วน — รูปจริงเป็นรูปดิบจากซัพ (พื้นรก/แสงไม่นิ่ง) จึงเห็น before→after ชัดที่สุด</p>` : ''}
  <p>แต่ละแถวคือสินค้า 1 ตัว · คอลัมน์แรก (กรอบเขียว) = <b>รูปจริง</b> · อีก 5 คอลัมน์ = เวอร์ชั่นที่
  สร้างฟรีด้วย <b>rembg</b> (ตัดพื้นด้วย neural net) แล้ว composite ลงฉากสตูดิโอที่สร้างจากโค้ดล้วน
  ไม่ใช้ API เสียเงิน · ตัวสินค้าเป็นของจริงทุกพิกเซล เปลี่ยนแค่ฉาก/แสง/เงา ให้เข้า mood & tone เว็บ
  (navy #13244a · gold #f4b223)</p>
  <div class="legend">
    <span>🟢 V1 Studio Bright — โทนสว่าง ใช้เป็นรูปการ์ดหลัก</span>
    <span>V2 Navy Podium — แท่นวาง+วงแหวนทอง</span>
    <span>V3 Reflection — เงาสะท้อนหรูๆ</span>
    <span>V4 Navy Editorial — พื้นเข้ม ใช้กับ section dark</span>
    <span>V5 Warm Tone — โทนอุ่น</span>
  </div>
</header>
<div class="scroll"><table>
  <tr><th></th>${headCells}</tr>
  ${rows}
</table></div>
<footer>
  ทั้งหมดสร้างแบบฟรี ไม่มีค่าใช้จ่าย · ถ้าชอบเวอร์ชั่นไหน บอกเลขเวอร์ชั่น แล้วผมจะรันให้ครบทุก SKU +
  ผลิตไฟล์ลง public/images ให้ใช้จริงบนเว็บ
</footer>
</body></html>`;

const outDir = STAGED;
const out = path.join(outDir, OUTNAME);
fs.writeFileSync(out, html);
console.log('wrote', out, '(' + Math.round(fs.statSync(out).size / 1024) + ' KB)');
