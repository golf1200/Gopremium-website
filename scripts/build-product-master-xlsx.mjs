// Generates PRODUCT-MASTER.xlsx — a colour-coded master of every product:
//   SKU, name, description, price, website category, website status,
//   + flags: data-complete? has-image? live-on-site?
//
// Sources (cross-checked for accuracy):
//   scripts/catalog-master.json          → master record incl. onWeb / status / 1688 link
//   src/data/products-raw.json           → category_slug (for the Thai website label)
//   src/data/product-images.generated.json → the ACTUAL published photos (truth for "has image")
//
// Run from the website/ folder:  node scripts/build-product-master-xlsx.mjs
import ExcelJS from 'exceljs';
import { readFileSync, existsSync } from 'node:fs';

const master = JSON.parse(readFileSync('scripts/catalog-master.json', 'utf8'));
const raw = JSON.parse(readFileSync('src/data/products-raw.json', 'utf8'));
const gen = JSON.parse(readFileSync('src/data/product-images.generated.json', 'utf8'));
const express = existsSync('scripts/express-products.json')
  ? JSON.parse(readFileSync('scripts/express-products.json', 'utf8'))
  : [];

const rawBy = {};
raw.forEach((p) => (rawBy[p.sku] = p));
const hasPhoto = (sku) => Object.prototype.hasOwnProperty.call(gen, sku); // actual published image

// Thai website category labels (mirrors build-catalogue-data.mjs)
const catLabels = {
  drinkware: 'แก้ว & กระบอกน้ำ', bags: 'กระเป๋า', luggage: 'กระเป๋าเดินทาง',
  stationery: 'เครื่องเขียน', fan: 'พัดลมพกพา', powerbank: 'พาวเวอร์แบงก์',
  gadget: 'แกดเจ็ต', lifestyle: 'ไลฟ์สไตล์', kitchen: 'ครัว & กล่องอาหาร',
  scent: 'กลิ่น & สมุนไพร', garment: 'เสื้อผ้า', hat: 'หมวก', pet: 'สัตว์เลี้ยง',
  'baby-kid': 'เด็ก & เบบี๋', giftset: 'กิฟต์เซ็ต', packaging: 'บรรจุภัณฑ์',
  souvenir: 'ของชำร่วย', umbrella: 'ร่ม',
};

// Build enriched rows
const rows = master.map((p) => {
  const r = rawBy[p.sku] || {};
  const hasName = !!(p.name && String(p.name).trim());
  const live = p.onWeb !== false && hasName;
  const img = hasPhoto(p.sku);
  const price = parseFloat(String(p.price300 || '').replace(/[^\d.]/g, '')) || null;
  const features = (p.features || r.features || '').trim();
  const size = (p.size || r.size || '').trim();
  const material = (p.material || r.material || '').trim();
  const complete = live && img && !!price && !!features && !!size && !!material;
  const catTh = catLabels[r.category_slug] || p.category || '—';
  const status = !live ? 'ยังไม่ขึ้นเว็บ' : img ? 'ขึ้นเว็บแล้ว + มีรูป' : 'ขึ้นเว็บแล้ว + ยังไม่มีรูป';
  return { sku: p.sku, name: p.name || '(ยังไม่มีชื่อ)', features, catTh, price, status,
    complete, img, live, moq: p.moq || '', size, material, link: p.link1688 || '' };
});
rows.sort((a, b) => a.catTh.localeCompare(b.catTh, 'th') || a.sku.localeCompare(b.sku));

// ---- colours ----
const NAVY = 'FF1F3A5F', GOLD = 'FFF4BD44';
const GREEN_BG = 'FFE3F4E8', GREEN_TX = 'FF1B7A3D';
const AMBER_BG = 'FFFDF3D6', AMBER_TX = 'FF9A6B00';
const RED_BG = 'FFFBE0E0', RED_TX = 'FFC0162C';
const ZEBRA = 'FFF6F8FB';
const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });

const YELLOW_IN = 'FFFFF2B8';          // ช่องกรอกราคา
const today = new Date().toISOString().slice(0, 10);

const wb = new ExcelJS.Workbook();
wb.creator = 'GO PREMIUM';
wb.created = new Date();

const needPrice = rows.filter((p) => p.live && !p.price);
const execCount = rows.filter((p) => (p.price || 0) > 300).length;

/* ============ Sheet 0: TO-DO (เปิดไฟล์มาเจอชีตนี้ก่อน) ============ */
const td = wb.addWorksheet('📋 TO-DO', { views: [{ state: 'frozen', ySplit: 3 }] });
td.columns = [{ width: 6 }, { width: 52 }, { width: 16 }, { width: 12 }, { width: 13 }, { width: 78 }];
const tdTitle = td.addRow(['GO PREMIUM — TO-DO ต่อจากงาน SEO/Tracking Overhaul (11 มิ.ย. 2026)']);
tdTitle.font = { bold: true, size: 15, color: { argb: NAVY } }; tdTitle.height = 26;
td.mergeCells('A1:F1');
const tdWarn = td.addRow([`อัปเดตล่าสุด: ${today} · ⚠️ ไฟล์นี้สร้างใหม่อัตโนมัติทุกครั้งที่รัน node scripts/build-product-master-xlsx.mjs — เครื่องหมายที่ติ๊กในชีตนี้จะหายเมื่อสร้างใหม่ แต่ "ราคาที่กรอกในชีตถัดไป" จะถูกเก็บถาวรเมื่อสั่ง import แล้ว`]);
tdWarn.font = { italic: true, size: 10, color: { argb: RED_TX } }; td.mergeCells('A2:F2'); tdWarn.height = 30;
tdWarn.alignment = { wrapText: true, vertical: 'middle' };
const tdHead = td.addRow(['#', 'งาน', 'เหลือ / เป้า', 'ความสำคัญ', 'สถานะ (ติ๊กเอง)', 'วิธีทำ']);
tdHead.font = { bold: true, color: { argb: 'FFFFFFFF' } };
tdHead.eachCell((c) => { c.fill = fill(NAVY); c.alignment = { vertical: 'middle', horizontal: 'center' }; });
const TODO = [
  ['เติมราคาสินค้า', `${needPrice.length} SKU`, '🔴 สูงมาก',
   'ไปที่ชีต "ราคาที่ต้องเติม" → กรอกราคาในช่องสีเหลือง → เซฟไฟล์ → บอก Claude ว่า "import ราคา" (รัน node scripts/import-prices-from-master.mjs แล้ว deploy ให้) — ราคาที่กรอกจะปลดล็อก filter งบ + AI search + ราคาขึ้น Google'],
  ['ตั้ง Key Events ใน GA4 (ทำเองครั้งเดียว ~10 นาที)', '2 events', '🔴 สูงมาก',
   'เปิด GA4 (G-JTMVQM245Y) → Admin → Events → เปิดสวิตช์ "Mark as key event" ให้ generate_lead และ contact_line — จำเป็นก่อนยิงโฆษณา ไม่งั้นวัด conversion ไม่ได้'],
  ['Submit sitemap ใน Google Search Console', '2 โดเมน', '🔴 สูง',
   'search.google.com/search-console → เพิ่ม property ทั้งโดเมนไทยและ vercel.app → Sitemaps → submit "sitemap.xml"'],
  ['หารูปจริงให้สินค้าที่ยังใช้ภาพ mockup', `${rows.length - rows.filter((p) => p.img).length} SKU`, '🟠 สูง',
   'ดูชีต Master คอลัมน์ "มีรูปภาพ" = ✗ ไม่มี — ถ่าย/หารูปแล้วส่งให้ Claude เข้า image pipeline ตามเดิม'],
  ['เติมสินค้า/ราคาช่วง Executive (มากกว่า ฿300)', `ตอนนี้มี ${execCount} ตัว`, '🟠 กลาง',
   'กลุ่ม VIP/ผู้บริหารแทบไม่มีของเสนอ — เลือกสินค้าหรู ๆ จากแคตตาล็อกที่ยังไม่มีราคา แล้วตั้งราคา 300+ หรือเพิ่ม SKU ใหม่'],
  ['ตั้งชื่อ + ข้อมูลให้ 5 SKU ที่ยังไม่มีชื่อ (หรือตัดทิ้ง)', 'BG043 DW030 DW031 LS025 LS027', '🟡 กลาง',
   'ตอนนี้ถูกซ่อนจากเว็บแล้ว (ไม่โชว์การ์ดเปล่า) — ถ้าจะขายให้ตั้งชื่อ/ราคา/รูป แล้วแจ้ง Claude ปลดล็อก'],
  ['เลือก SKU สำหรับหน้า "สินค้าส่งด่วน" (#/express)', 'EXPRESS_SKUS ยังว่าง', '🟡 กลาง',
   'เลือกรุ่นที่ผลิต/ส่งทัน 7–14 วันจริง แล้วส่งรายการ SKU ให้ Claude เติมใน v2.html'],
  ['ตัดสินใจชะตา catalogue.html / corporate.html', '2 ไฟล์ orphan', '🟡 กลาง',
   'ตอนนี้ไม่มีลิงก์เข้า-ไม่อยู่ใน sitemap — ใช้เป็น landing โฆษณา (แนะนำ) หรือลบทิ้ง'],
  ['เขียน blog SEO ต่อเนื่อง', 'เดือนละ 2 บทความ', '🟡 กลาง',
   'มี 5 บทความแล้ว ลิงก์ครบจากหน้าแรกแล้ว — หัวข้อถัดไปดู docs/SEO-CONTENT-PLAN.md'],
  ['ระยะยาว: pre-render หน้าสินค้า + rebrand CI เป็น Master Final', '—', '⚪ ต่ำ',
   'pre-render ดัน SEO 78→90+ · เว็บยังใช้พาเลตเก่า #1F3A5F/Kanit — rebrand เป็น #13244a/#f4b223/Anuphan เป็นงานดีไซน์แยก'],
];
TODO.forEach((t, i) => {
  const r = td.addRow([i + 1, t[0], t[1], t[2], '☐', t[3]]);
  r.alignment = { vertical: 'top', wrapText: true };
  r.height = 42;
  if (i % 2 === 1) r.eachCell((c) => (c.fill = fill(ZEBRA)));
  r.getCell(1).alignment = { horizontal: 'center', vertical: 'top' };
  r.getCell(2).font = { bold: true, color: { argb: NAVY } };
  r.getCell(5).alignment = { horizontal: 'center', vertical: 'top' };
  r.getCell(6).font = { size: 10, color: { argb: 'FF444C58' } };
});

/* ============ Sheet 0.5: ราคาที่ต้องเติม (ช่องกรอก) ============ */
const pr = wb.addWorksheet('ราคาที่ต้องเติม', { views: [{ state: 'frozen', ySplit: 3 }] });
pr.columns = [
  { header: 'SKU', key: 'sku', width: 11 },
  { header: 'ชื่อสินค้า', key: 'name', width: 44 },
  { header: 'หมวดหมู่', key: 'catTh', width: 20 },
  { header: 'MOQ', key: 'moq', width: 8 },
  { header: 'ราคา/ชิ้น ฿ ← กรอกตรงนี้', key: 'price', width: 22 },
  { header: 'ลิงก์ 1688 (ไว้เช็คต้นทุน)', key: 'link', width: 30 },
];
pr.spliceRows(1, 0, [], []); // เลื่อน header ไปแถว 3 เพื่อใส่ title + คำอธิบาย
pr.getCell('A1').value = `ราคาที่ต้องเติม — ${needPrice.length} SKU (เฉพาะที่ขึ้นเว็บแล้วแต่ยังไม่มีราคา) · ราคาอ้างอิงที่ 300 ชิ้น พิมพ์โลโก้`;
pr.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY } };
pr.mergeCells('A1:F1'); pr.getRow(1).height = 24;
pr.getCell('A2').value = 'กรอกเฉพาะช่องสีเหลือง → เซฟไฟล์ → บอก Claude ว่า "import ราคา" — ระบบจะอัปเดตเข้าเว็บ (products-raw.json + catalog-master.json) แล้ว deploy ให้ · กรอกไม่ครบก็ import ได้ ทำทีละหมวดได้';
pr.getCell('A2').font = { italic: true, size: 10, color: { argb: AMBER_TX } };
pr.mergeCells('A2:F2'); pr.getRow(2).height = 28;
pr.getRow(2).alignment = { wrapText: true, vertical: 'middle' };
const prHead = pr.getRow(3);
prHead.font = { bold: true, color: { argb: 'FFFFFFFF' } };
prHead.eachCell((c) => { c.fill = fill(NAVY); c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; });
prHead.height = 24;
// จัดกลุ่มตามหมวด เรียงหมวดที่ค้างเยอะสุดก่อน
const npByCat = {};
needPrice.forEach((p) => { (npByCat[p.catTh] ??= []).push(p); });
Object.keys(npByCat).sort((a, b) => npByCat[b].length - npByCat[a].length).forEach((cat) => {
  const hr = pr.addRow([`${cat} — ค้าง ${npByCat[cat].length} รายการ`]);
  pr.mergeCells(`A${hr.number}:F${hr.number}`);
  hr.getCell(1).fill = fill(GOLD);
  hr.getCell(1).font = { bold: true, color: { argb: NAVY } };
  hr.height = 20;
  npByCat[cat].forEach((p) => {
    const r = pr.addRow({ sku: p.sku, name: p.name, catTh: p.catTh, moq: p.moq, price: '', link: p.link || '—' });
    r.alignment = { vertical: 'middle', wrapText: true };
    r.height = 22;
    r.getCell('sku').font = { bold: true, color: { argb: NAVY } };
    const cell = r.getCell('price');
    cell.fill = fill(YELLOW_IN);
    cell.numFmt = '#,##0';
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });
});

/* ============ Sheet 1: master list ============ */
const ws = wb.addWorksheet('รายการสินค้า (Master)', { views: [{ state: 'frozen', ySplit: 1 }] });
ws.columns = [
  { header: 'ลำดับ', key: 'no', width: 7 },
  { header: 'SKU', key: 'sku', width: 11 },
  { header: 'ชื่อสินค้า', key: 'name', width: 40 },
  { header: 'รายละเอียดสินค้า', key: 'features', width: 50 },
  { header: 'หมวดหมู่ (เว็บไซต์)', key: 'catTh', width: 20 },
  { header: 'ราคา/ชิ้น (฿)', key: 'price', width: 13 },
  { header: 'สถานะบนเว็บไซต์', key: 'status', width: 26 },
  { header: 'ข้อมูลครบ', key: 'complete', width: 12 },
  { header: 'มีรูปภาพ', key: 'img', width: 11 },
  { header: 'ขึ้น Live', key: 'live', width: 11 },
  { header: 'MOQ', key: 'moq', width: 8 },
  { header: 'ขนาด', key: 'size', width: 16 },
  { header: 'วัสดุ', key: 'material', width: 22 },
  { header: 'ลิงก์ 1688', key: 'link', width: 24 },
];

rows.forEach((p, i) => {
  ws.addRow({
    no: i + 1, sku: p.sku, name: p.name, features: p.features || '—', catTh: p.catTh,
    price: p.price ?? (p.live ? '⚠ ใส่ราคา' : '—'), status: p.status,
    complete: p.complete ? '✓ ครบ' : '✗ ไม่ครบ',
    img: p.img ? '✓ มี' : '✗ ไม่มี',
    live: p.live ? '✓ ขึ้นแล้ว' : '✗ ยังไม่ขึ้น',
    moq: p.moq, size: p.size || '—', material: p.material || '—',
    link: p.link || '—',
  });
});

// header style
const head = ws.getRow(1);
head.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
head.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
head.height = 26;
head.eachCell((c) => { c.fill = fill(NAVY); c.border = { bottom: { style: 'medium', color: { argb: GOLD } } }; });

// body styling
for (let r = 2; r <= ws.rowCount; r++) {
  const row = ws.getRow(r);
  const p = rows[r - 2];
  row.alignment = { vertical: 'top', wrapText: true };
  row.height = 30;
  if (r % 2 === 0) row.eachCell((c) => (c.fill = fill(ZEBRA)));
  // SKU bold
  row.getCell('sku').font = { bold: true, color: { argb: NAVY } };
  // price — ถ้าขึ้นเว็บแล้วแต่ไม่มีราคา = ไฮไลต์แดง (ไปกรอกที่ชีต "ราคาที่ต้องเติม")
  const pc = row.getCell('price');
  if (typeof p.price === 'number') { pc.numFmt = '#,##0'; pc.alignment = { horizontal: 'right', vertical: 'top' }; }
  else if (p.live) { pc.fill = fill(RED_BG); pc.font = { bold: true, color: { argb: RED_TX } }; pc.alignment = { horizontal: 'center', vertical: 'middle' }; }
  else { pc.font = { color: { argb: RED_TX } }; pc.alignment = { horizontal: 'center', vertical: 'top' }; }
  // status — colour by state
  const sc = row.getCell('status');
  sc.alignment = { vertical: 'middle', wrapText: true };
  if (!p.live) { sc.fill = fill(RED_BG); sc.font = { bold: true, color: { argb: RED_TX } }; }
  else if (p.img) { sc.fill = fill(GREEN_BG); sc.font = { color: { argb: GREEN_TX } }; }
  else { sc.fill = fill(AMBER_BG); sc.font = { color: { argb: AMBER_TX } }; }
  // complete
  const cc = row.getCell('complete');
  cc.alignment = { horizontal: 'center', vertical: 'middle' };
  cc.fill = fill(p.complete ? GREEN_BG : AMBER_BG);
  cc.font = { bold: true, color: { argb: p.complete ? GREEN_TX : AMBER_TX } };
  // has image
  const ic = row.getCell('img');
  ic.alignment = { horizontal: 'center', vertical: 'middle' };
  ic.font = { bold: true, color: { argb: p.img ? GREEN_TX : RED_TX } };
  // live
  const lc = row.getCell('live');
  lc.alignment = { horizontal: 'center', vertical: 'middle' };
  lc.font = { bold: true, color: { argb: p.live ? GREEN_TX : RED_TX } };
}
ws.autoFilter = { from: 'A1', to: 'N1' };

/* ============ Sheet 2: summary ============ */
const total = rows.length;
const live = rows.filter((p) => p.live).length;
const img = rows.filter((p) => p.img).length;
const complete = rows.filter((p) => p.complete).length;
const sm = wb.addWorksheet('สรุป (Summary)');
sm.columns = [{ width: 34 }, { width: 14 }, { width: 50 }];
const title = sm.addRow(['GO PREMIUM — สรุปสถานะสินค้า', '', '']);
title.font = { bold: true, size: 15, color: { argb: NAVY } };
sm.mergeCells('A1:C1'); title.height = 26;
sm.addRow([`สร้างเมื่อ: ${new Date().toISOString().slice(0, 10)}`, '', '']).font = { italic: true, color: { argb: 'FF666666' } };
sm.addRow([]);
const metric = (label, val, note, bg, tx) => {
  const row = sm.addRow([label, val, note]);
  row.getCell(1).font = { bold: true, color: { argb: NAVY } };
  row.getCell(2).alignment = { horizontal: 'center' };
  row.getCell(2).font = { bold: true, color: { argb: tx || NAVY } };
  if (bg) row.getCell(2).fill = fill(bg);
  row.getCell(3).font = { color: { argb: 'FF666666' }, size: 10 };
  row.height = 20;
};
metric('สินค้าทั้งหมด', total, 'ทุก SKU ในมาสเตอร์', null, NAVY);
metric('ขึ้น Live แล้ว', live, 'แสดงบนเว็บไซต์จริง', GREEN_BG, GREEN_TX);
metric('ยังไม่ขึ้น Live', total - live, 'ยังไม่พร้อม/ไม่มีชื่อ — ต้องจัดการ', RED_BG, RED_TX);
metric('มีรูปภาพจริง', img, 'รูปที่ publish แล้ว', GREEN_BG, GREEN_TX);
metric('ยังไม่มีรูปภาพ', total - img, 'ใช้ mockup ชั่วคราว — ต้องหา/ถ่ายรูป', AMBER_BG, AMBER_TX);
metric('ข้อมูลครบทุกช่อง', complete, 'live + รูป + ราคา + รายละเอียด + ขนาด + วัสดุ', GREEN_BG, GREEN_TX);
metric('ข้อมูลยังไม่ครบ', total - complete, 'ขาดอย่างน้อย 1 ช่อง', AMBER_BG, AMBER_TX);
metric('ยังไม่มีราคา (ขึ้นเว็บแล้ว)', needPrice.length, 'กรอกที่ชีต "ราคาที่ต้องเติม" → สั่ง import', RED_BG, RED_TX);
sm.addRow([]);
const bh = sm.addRow(['แยกตามหมวดหมู่ (เว็บไซต์)', 'จำนวน', 'มีรูป / ขึ้น live']);
bh.font = { bold: true, color: { argb: 'FFFFFFFF' } };
bh.eachCell((c) => (c.fill = fill(NAVY)));
const byCat = {};
rows.forEach((p) => { (byCat[p.catTh] ??= []).push(p); });
Object.keys(byCat).sort((a, b) => a.localeCompare(b, 'th')).forEach((cat) => {
  const g = byCat[cat];
  sm.addRow([cat, g.length, `${g.filter((x) => x.img).length} มีรูป / ${g.filter((x) => x.live).length} ขึ้น live`]);
});
sm.views = [{ state: 'frozen', ySplit: 0 }];

/* ============ Sheet 3: สินค้าส่งด่วน (Express) ============ */
if (express.length) {
  const catLabel = (s) => catLabels[s] || s || '—';
  const TIER = {
    express:        { label: '🟢 ส่งด่วน (≤14 วัน)', bg: GREEN_BG, tx: GREEN_TX },
    fast:           { label: '🟡 เร็ว (~2-3 สัปดาห์)', bg: AMBER_BG, tx: AMBER_TX },
    'made-to-order':{ label: '🟠 สั่งผลิต (30-60 วัน)', bg: AMBER_BG, tx: AMBER_TX },
    unknown:        { label: '⚪ ยังไม่ระบุ', bg: ZEBRA, tx: 'FF666666' },
  };
  const ex = wb.addWorksheet('สินค้าส่งด่วน (Express)', { views: [{ state: 'frozen', ySplit: 3 }] });
  ex.columns = [
    { header: 'SKU', key: 'sku', width: 9 },
    { header: 'ชื่อสินค้า', key: 'name', width: 40 },
    { header: 'หมวดหมู่', key: 'cat', width: 16 },
    { header: 'Supplier', key: 'sup', width: 22 },
    { header: 'ต้นทุน/ชิ้น (฿)', key: 'cost', width: 14 },
    { header: 'MOQ', key: 'moq', width: 8 },
    { header: 'ระยะเวลาผลิต', key: 'lead', width: 26 },
    { header: 'ระดับส่งด่วน', key: 'tier', width: 20 },
    { header: 'วัสดุ', key: 'material', width: 18 },
    { header: 'ขนาด', key: 'size', width: 16 },
    { header: 'วิธีพิมพ์โลโก้', key: 'method', width: 16 },
    { header: 'ค่าโลโก้/ชิ้น', key: 'logo', width: 14 },
    { header: 'Packaging', key: 'pkg', width: 18 },
    { header: 'ค่าส่ง', key: 'ship', width: 18 },
    { header: 'สถานะรูป', key: 'imgst', width: 14 },
    { header: 'Drive โฟลเดอร์', key: 'drive', width: 16 },
    { header: 'หมายเหตุ', key: 'note', width: 40 },
  ];
  // title + caption on rows 1-2, header on row 3
  ex.spliceRows(1, 0, [], []);
  const nExpress = express.filter((p) => p.is_express).length;
  ex.getCell('A1').value = `สินค้าส่งด่วน — ${express.length} รายการจาก ${new Set(express.map((p) => p.sup_code)).size} ซัพพลายเออร์ (ที่ส่งได้ภายใน 14 วันจริง ${nExpress} รายการ) · ต้นทุนยังไม่รวมพิมพ์โลโก้`;
  ex.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY } };
  ex.mergeCells('A1:Q1'); ex.getRow(1).height = 24;
  ex.getCell('A2').value = 'ดึงจากชีต "TH Product" (Supplier Master) · ต้นทุน = ราคาต่ำสุด-สูงสุดตามขั้นบันได MOQ · "ระดับส่งด่วน" คัดจากระยะเวลาผลิตจริง — เฉพาะ 🟢 เท่านั้นที่ควรขึ้นหน้า #/express';
  ex.getCell('A2').font = { italic: true, size: 10, color: { argb: AMBER_TX } };
  ex.mergeCells('A2:Q2'); ex.getRow(2).height = 26;
  ex.getRow(2).alignment = { wrapText: true, vertical: 'middle' };
  const exHead = ex.getRow(3);
  exHead.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  exHead.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  exHead.height = 26;
  exHead.eachCell((c) => { c.fill = fill(NAVY); c.border = { bottom: { style: 'medium', color: { argb: GOLD } } }; });

  const costStr = (p) => {
    if (p.cost_min_thb == null) return '—';
    return p.cost_min_thb === p.cost_max_thb ? `${p.cost_min_thb}` : `${p.cost_min_thb}–${p.cost_max_thb}`;
  };
  express.forEach((p) => {
    const t = TIER[p.lead_tier] || TIER.unknown;
    const r = ex.addRow({
      sku: p.sku, name: p.name, cat: catLabel(p.category_slug), sup: p.sup_name,
      cost: costStr(p), moq: p.moq ?? '—', lead: p.lead_time_raw || '—', tier: t.label,
      material: p.material || '—', size: p.size || '—', method: p.custom_method || '—',
      logo: p.logo_cost || '—', pkg: p.packaging || '—', ship: p.shipping_detail || '—',
      imgst: p.image_status || 'pending', drive: p.drive_folder_id ? 'มี' : '✗',
      note: [p.data_warning, p.note || p.limit].filter(Boolean).join(' · ') || '—',
    });
    r.alignment = { vertical: 'top', wrapText: true };
    r.height = 30;
    r.getCell('sku').font = { bold: true, color: { argb: NAVY } };
    const tc = r.getCell('tier');
    tc.fill = fill(t.bg); tc.font = { bold: true, color: { argb: t.tx } };
    tc.alignment = { vertical: 'middle', wrapText: true };
    r.getCell('cost').alignment = { horizontal: 'right', vertical: 'top' };
    r.getCell('moq').alignment = { horizontal: 'center', vertical: 'top' };
    const dc = r.getCell('drive');
    dc.alignment = { horizontal: 'center', vertical: 'middle' };
    dc.font = { bold: true, color: { argb: p.drive_folder_id ? GREEN_TX : RED_TX } };
  });
  ex.autoFilter = { from: 'A3', to: 'Q3' };
  // zebra
  for (let rr = 4; rr <= ex.rowCount; rr++) {
    if (rr % 2 === 1) ex.getRow(rr).eachCell((c) => { if (!c.fill || c.fill.type !== 'pattern') c.fill = fill(ZEBRA); });
  }
}

const out = process.env.OUT_XLSX || 'PRODUCT-MASTER.xlsx';
await wb.xlsx.writeFile(out);
console.log(`Wrote ${out}`);
console.log(`Total ${total} · live ${live} · withImage ${img} · complete ${complete}`);
console.log(`Express sheet: ${express.length} SKUs (${express.filter((p) => p.is_express).length} true express)`);
