// สร้างหน้ารีวิวงาน feedback รอบ 2026-07-30 ให้ Golf ตรวจทีเดียวจบ
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(REPO, '../20-AI-OUTPUT/REVIEW-express-feedback-2026-07-30.html');
const P = JSON.parse(readFileSync(path.join(REPO, 'src/data/products-raw.json'), 'utf8'));
const IM = JSON.parse(readFileSync(path.join(REPO, 'src/data/product-images.generated.json'), 'utf8'));
const LIVE = 'https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com';

const ROWS = [
  ['EX004', 'รูป', 'ลบฝาที่หลุดมุมซ้ายล่างออกจากรูปแรก (inpaint ฟรี) · ลบรูป 2–3'],
  ['EX009', 'สเปก+รูป', 'วัสดุ Cotton → ผ้าลีวาย · ลบรูปที่ 2'],
  ['EX010', 'สี+รูป', '20 สี (ผิด) → 12 สีจริง · เพิ่มรูปสีจริงเป็นรูปที่ 2'],
  ['EX011', 'สี+รูป', '7 สี → 9 สีจริง ชื่อสีใหม่ · ลบรูปที่ 2 · เพิ่มรูปสีจริง'],
  ['EX015', 'รูป', 'รูปร่มไม้เท้าจริงจาก Drive เป็นรูปหลัก'],
  ['EX017', 'รูป', 'รูปร่มกอล์ฟจริงจาก Drive เป็นรูปหลัก'],
  ['EX026', 'สี+รูป', '18 → 16 สี (ตัดฟ้าเทอร์ควอยซ์ + เงิน) · ลบรูปที่ 2 สัดส่วนเพี้ยน'],
  ['EX028', 'รูป ⚠', 'รูปเดิม 2 ใบเป็นรุ่นผิดทั้งคู่ → hero สตูดิโอใหม่ (Gemini) + รูปรวมสีทั้งกอง'],
  ['EX032', 'สเปก', 'ขนาด 380 ml → "380 ml / 510 ml"'],
  ['EX038', 'สเปก', 'ขนาด 40oz → 12 oz'],
  ['EX039', 'สี+รูป', '13 → 6 สีจริง · เพิ่มรูปสีจริง 6 สีเป็นรูปที่ 2'],
  ['EX079', 'สเปก+รูป', 'วัสดุ กำมะหยี่ → ผ้าคอตตอน 100% · ลบรูปที่ 3 (โลโก้ซ้อน)'],
  ['EX099', 'สเปก', 'ขนาดขึ้นบรรทัด ไซส์ S / ไซส์ L · Gemini ลบลายพิมพ์บนกระเป๋าออก เหลือผ้าแคนวาสเปล่าพร้อมสกรีนโลโก้ลูกค้า'],
  ['EX100', 'สเปก', 'typo ผ้าคอตตอม → ผ้าคอตตอน'],
  ['EX115', 'หมวด+รูป', 'ย้ายเข้าหมวด "หมวก" · ลบรูปแรก เอารูปที่ 3 เป็นรูปหลัก'],
  ['EX116', 'หมวด+สี+รูป', 'ย้ายเข้าหมวด "หมวก" · รูปเดิมเป็นทรง bucket ผิดรุ่น → รูปจริง 4 ใบจาก Drive · ชื่อสีจริง 6 สี'],
  ['EX117', 'หมวด+รูป', 'ย้ายเข้าหมวด "หมวก" · รับรูปสตูดิโอ bucket ที่ย้ายมาจาก EX116'],
  ['EX118', 'หมวด+รูป', 'ย้ายเข้าหมวด "หมวก" · ลบรูปที่ 2'],
  ['EX124', 'รูป', 'เพิ่มรูปสีจริง 8 สีเป็นรูปที่ 2'],
  ['EX126', 'สี+รูป', 'ตัดสีเงิน/แดง → เพิ่มชมพู/เขียว · ตัดรูป 2–3 · เพิ่มรูปรวมสีจริง'],
  ['EX127', 'รูป', 'ลบรูป 1 กับ 3 ใช้รูปที่ 2 เป็นรูปหลัก'],
  ['EX128', 'ชื่อ+รูป', 'typo "มีนิมอล" → "มินิมอล" · ตัดรูปที่ 2 (ฝาผิด)'],
  ['EX135', 'รูป', 'ลบรูปแรก ใช้รูปที่ 2'],
  ['EX136', 'รูป', 'ลบรูปแรก ใช้รูปที่ 2'],
  ['EX137', 'รูป', 'ลบรูปแรก ใช้รูปที่ 2'],
  ['EX141', 'ชื่อ', 'ยึดเป็นตัวหลักแทน EX005 · เปลี่ยนชื่อเป็น "กระบอกน้ำสแตนเลส รุ่น Sento"'],
  ['EX142', 'รูป', 'ลบรูปที่ 3'],
  ['EX151', 'ชื่อ', 'ตัด "ผิวบาง" → "แก้วเก็บความเย็น 40 oz รุ่นฝาใส"'],
  ['EX153', 'ชื่อ+รูป', 'ชื่อขึ้นบรรทัดกลางชื่อ → เว้นวรรคปกติ · ลบรูปแรก'],
  ['EX155', 'รูป', 'ลบรูป 1 กับ 3 ใช้รูปที่ 2'],
  ['EX160', 'MOQ', 'ขั้นต่ำ 1,000 → 100 ชิ้น'],
  ['EX161', 'MOQ', 'ขั้นต่ำ 1,000 → 100 ชิ้น'],
  ['EX162', 'MOQ', 'ขั้นต่ำ 1,000 → 100 ชิ้น'],
  ['EX173', 'รูป', 'ลบรูป 2–3'],
  ['EX175', 'รูป', 'ใช้ mockup แบรนด์ GO PREMIUM 4 ใบจาก Drive'],
  ['EX176', 'รูป', 'ใช้ mockup แบรนด์ GO PREMIUM 4 ใบจาก Drive'],
  ['EX177', 'รูป', 'เพิ่มรูปที่ 2 ให้เห็นกางขาตั้ง'],
  ['EX001', 'สเปก+รูป', 'ขนาด S–2XL ขึ้นบรรทัดละไซส์ · ลบรูปที่ 2'],
  ['EX031', 'รวม SKU ✦', 'รวม EX034 เข้ามา → "รุ่นหูเหลี่ยม 20/30 oz" · 600 ml (20 oz) ฿142 / 890 ml (30 oz) ฿150 · 12 สี · hero สตูดิโอใหม่จากรูป EX034 ที่มีหูเหลี่ยมถูกรุ่น (EX034 ถูกลบ + redirect)'],
];

const bySku = (s) => P.find((p) => p.sku === s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const imgTag = (p) => (IM[p]?.gallery || []).slice(0, 4)
  .map((g) => `<img src="../website/public${g}" alt="">`).join('');

const cards = ROWS.map(([sku, kind, note]) => {
  const p = bySku(sku);
  if (!p) return '';
  return `<tr>
    <td class="sku"><a href="${LIVE}/product/${p.slug}" target="_blank">${sku}</a><span class="kind">${esc(kind)}</span></td>
    <td class="shots">${imgTag(sku)}</td>
    <td><div class="nm">${esc(p.name)}</div><div class="note">${esc(note)}</div>
      <div class="meta">${esc(p.size || '-')} · ${esc(p.material || '-')} · MOQ ${p.moq} · ${(p.colors || []).length} สี · หมวด ${esc(p.category)}</div></td>
  </tr>`;
}).join('');

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>REVIEW — Express feedback 2026-07-30</title>
<style>
:root{--navy:#1F3A5F;--gold:#F4BD44;--line:#e7e3db;--grey:#6b7280}
*{box-sizing:border-box}
body{margin:0;font-family:"Segoe UI",Tahoma,sans-serif;color:#1b2330;background:#faf8f4;line-height:1.6}
header{background:var(--navy);color:#fff;padding:26px 22px}
h1{margin:0;font-size:21px}
header p{margin:6px 0 0;opacity:.85;font-size:14px}
.wrap{max-width:1180px;margin:0 auto;padding:22px}
.box{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-bottom:18px}
.box h2{margin:0 0 8px;font-size:16px;color:var(--navy)}
.box ul{margin:6px 0 0;padding-left:20px;font-size:14px}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden}
td{border-top:1px solid var(--line);padding:12px;vertical-align:top}
tr:first-child td{border-top:none}
.sku{width:96px;font-weight:700;color:var(--navy);font-size:14px}
.sku a{color:var(--navy)}
.kind{display:block;font-weight:400;font-size:11px;color:var(--grey);margin-top:3px}
.shots{width:340px;white-space:nowrap}
.shots img{width:76px;height:76px;object-fit:cover;border:1px solid var(--line);border-radius:8px;margin-right:5px;background:#fff}
.nm{font-weight:600;font-size:15px}
.note{font-size:13.5px;margin-top:3px}
.meta{font-size:12px;color:var(--grey);margin-top:6px}
.warn{background:#fff8e6;border-color:#f0d99a}
</style></head><body>
<header><div class="wrap" style="padding:0">
<h1>สินค้าส่งด่วน — feedback รอบ 2026-07-30 · ทำแล้ว 44/45 · ขึ้น production แล้ว</h1>
<p>รูปที่เห็นคือแกลเลอรีจริงหลังแก้ (สูงสุด 4 ใบแรก) · กด SKU เพื่อเปิดหน้าจริงบนเว็บ</p>
</div></header>
<div class="wrap">
<div class="box warn"><h2>⏳ เหลือเรื่องเดียว — ต้องขอจากซัพ</h2><ul>
<li><b>EX131 แก้วชุดเซต</b> — ยังไม่มีรูปที่ถูกรุ่น (ลิงก์ 1688 ที่ทีมให้มาโดน anti-bot ดึงไม่ได้)
<br>ตัดสินใจ: <b>พัก EX131 ออกจากเว็บชั่วคราว</b> ดีกว่าโชว์รูปผิดรุ่น — ใส่กลับได้ทันทีที่ได้รูปจริง</li>
</ul></div>
<div class="box"><h2>✅ ปิดไปแล้ว 3 เรื่องที่เคยค้าง (31 ก.ค.)</h2><ul>
<li><b>merge EX031 + EX034</b> — ไม่ต้องรอรูปซัพ เพราะ hero ของ EX034 มี "หูเหลี่ยม" ถูกรุ่นอยู่แล้ว → restyle เป็นสตูดิโอ แล้วรวมเป็น SKU เดียว 2 ขนาด</li>
<li><b>EX099 กระเป๋า Coco</b> — ไม่ต้องขอรูปเปล่าจากซัพ เพราะรูปในเว็บเป็น mockup ของเราเอง → Gemini ลบลายพิมพ์ออก เหลือผ้าแคนวาสเปล่าพร้อมสกรีนโลโก้ลูกค้า</li>
<li><b>EX028 รูปหลัก</b> — restyle เป็นสตูดิโอแล้ว (แก้วดำ) + รูปรวมสีทั้งกอง</li>
</ul></div>
<div class="box"><h2>🖼 รูปสตูดิโอใหม่จาก Gemini · ยิง 15 ใบ ผ่าน QA 10 ใบ · ฿19.5</h2><ul>
<li>ใช้: EX028 (hero + รวมสี) · EX031 · EX099 · EX116 · EX010 / EX039 / EX126 (รวมสี) · EX015 / EX017 (hero)</li>
<li>ตกรอบ 2 ใบ: <b>EX011</b> (สีกรมท่าเพี้ยนเป็นน้ำตาล) · <b>EX124</b> (สีแดงเพี้ยน) → คงรูปซัพจริงไว้ เพราะโจทย์ของสองตัวนี้คือ "สีต้องตรงของจริง"</li>
</ul></div>
<div class="box"><h2>✅ หน้าเว็บ (ไม่ผูกกับ SKU)</h2><ul>
<li>กันเบราว์เซอร์ตัดคำไทยกลางคำ (เช่น "ทุกออเด|อร์", "หลาก|หลาย") ทั้งเว็บ</li>
<li>ช่อง "ขนาด" ที่มีหลายบรรทัดแสดงเป็นบรรทัดจริงแล้ว (EX001 S–2XL, EX099 S/L, EX100)</li>
<li>ฟอร์ม /quote แยกช่อง <b>ชื่อผู้ติดต่อ | บริษัท</b> และ <b>อีเมล | เบอร์โทร</b></li>
<li>กด "ขอใบเสนอราคาสินค้านี้" จากหน้า SKU → ฟอร์มเติมช่อง "สินค้าที่สนใจ" ให้อัตโนมัติ และส่งไปกับอีเมล</li>
<li>ลบ SKU ซ้ำ EX005 (→EX141) และ EX130 (→EX006) พร้อม redirect 308 กัน 404</li>
</ul></div>
<table>${cards}</table>
<p style="font-size:12.5px;color:var(--grey);margin-top:18px">
สร้างโดย scripts/build-express-feedback-review.mjs · deploy ขึ้น production แล้ว 2026-07-31 (commit 61efdd8 · 16e0bf7 · 53ac040 · 8f4dc1a) · verify บน production จริง 42/42</p>
</div></body></html>`;

writeFileSync(OUT, html);
console.log('->', path.resolve(OUT));
