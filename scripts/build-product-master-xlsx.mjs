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
import { readFileSync } from 'node:fs';

const master = JSON.parse(readFileSync('scripts/catalog-master.json', 'utf8'));
const raw = JSON.parse(readFileSync('src/data/products-raw.json', 'utf8'));
const gen = JSON.parse(readFileSync('src/data/product-images.generated.json', 'utf8'));

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

const wb = new ExcelJS.Workbook();
wb.creator = 'GO PREMIUM';
wb.created = new Date();

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
    price: p.price ?? '—', status: p.status,
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
  // price
  const pc = row.getCell('price');
  if (typeof p.price === 'number') { pc.numFmt = '#,##0'; pc.alignment = { horizontal: 'right', vertical: 'top' }; }
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

const out = 'PRODUCT-MASTER.xlsx';
await wb.xlsx.writeFile(out);
console.log(`Wrote ${out}`);
console.log(`Total ${total} · live ${live} · withImage ${img} · complete ${complete}`);
