// Builds the GO PREMIUM Product Master deliverables:
//   1. A folder per product:  <Product Master>/<Category>/<SKU> - <name>/
//   2. A master Excel with full details + status + clickable 1688 link + folder path
// Reads catalog-master.json (from extract-catalog.mjs).
import ExcelJS from 'exceljs';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'C:\\Users\\Golf\\Gopremium-website';
const MASTER = 'C:\\Users\\Golf\\Desktop\\Gopremium new version\\Product Master';
const rows = JSON.parse(readFileSync(`${ROOT}\\scripts\\catalog-master.json`, 'utf8'));

// Windows-safe name fragment
const safe = (s) => (s || '').replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();

// ---- 1. create folders ----
let made = 0;
for (const p of rows) {
  const folderName = `${p.sku} - ${safe(p.name)}`.slice(0, 120);
  const dir = join(MASTER, safe(p.category) || 'Uncategorized', folderName);
  mkdirSync(dir, { recursive: true });
  p._folder = dir;
  made++;
}

// ---- 2. master Excel ----
const wb = new ExcelJS.Workbook();
wb.creator = 'GO PREMIUM — Product Director';

// status color
const statusFill = (s) =>
  s === 'ขึ้นเว็บแล้ว + มีรูป' ? 'FFC6EFCE'
  : s === 'ขึ้นเว็บแล้ว + ยังไม่มีรูป' ? 'FFFFEB9C'
  : 'FFFFC7CE'; // ยังไม่ขึ้นเว็บ
const statusFont = (s) =>
  s === 'ขึ้นเว็บแล้ว + มีรูป' ? 'FF006100'
  : s === 'ขึ้นเว็บแล้ว + ยังไม่มีรูป' ? 'FF9C6500'
  : 'FF9C0006';

// --- Summary tab ---
const sum = wb.addWorksheet('สรุป');
sum.columns = [{ width: 34 }, { width: 14 }];
const counts = {};
rows.forEach((p) => (counts[p.status] = (counts[p.status] || 0) + 1));
const withLink = rows.filter((p) => p.hasLink).length;
const needImgLink = rows.filter((p) => !p.hasImage && p.hasLink).length;
sum.addRow(['GO PREMIUM — Product Master', '']);
sum.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF1F4E79' } };
sum.addRow(['อัปเดต', '2026-06-04']);
sum.addRow([]);
sum.addRow(['สินค้าทั้งหมด (แคตตาล็อก)', rows.length]);
sum.addRow(['  • ขึ้นเว็บแล้ว + มีรูป', counts['ขึ้นเว็บแล้ว + มีรูป'] || 0]);
sum.addRow(['  • ขึ้นเว็บแล้ว + ยังไม่มีรูป', counts['ขึ้นเว็บแล้ว + ยังไม่มีรูป'] || 0]);
sum.addRow(['  • ยังไม่ขึ้นเว็บ', counts['ยังไม่ขึ้นเว็บ'] || 0]);
sum.addRow([]);
sum.addRow(['มีลิงก์ 1688', withLink]);
sum.addRow(['ต้องการรูป + มีลิงก์ 1688', needImgLink]);
sum.addRow(['ต้องการรูป + ไม่มีลิงก์', rows.filter((p) => !p.hasImage && !p.hasLink).length]);
sum.getColumn(1).font = sum.getColumn(1).font; // noop keep
for (let r = 4; r <= sum.rowCount; r++) sum.getRow(r).getCell(1).alignment = { wrapText: false };

// --- Master tab ---
const ws = wb.addWorksheet('Product Master', { views: [{ state: 'frozen', ySplit: 1 }] });
ws.columns = [
  { header: 'ลำดับ', key: 'no', width: 7 },
  { header: 'SKU', key: 'sku', width: 11 },
  { header: 'ชื่อสินค้า', key: 'name', width: 38 },
  { header: 'หมวดหมู่', key: 'category', width: 14 },
  { header: 'คุณสมบัติเด่น', key: 'features', width: 40 },
  { header: 'ขนาด/ความจุ', key: 'size', width: 16 },
  { header: 'วัสดุ', key: 'material', width: 24 },
  { header: 'สี', key: 'color', width: 8 },
  { header: 'ราคา 300', key: 'price300', width: 10 },
  { header: 'MOQ', key: 'moq', width: 8 },
  { header: 'เทคนิคโลโก้', key: 'logoTechniques', width: 22 },
  { header: 'ขนาดโลโก้', key: 'logoSize', width: 12 },
  { header: 'สถานะ', key: 'status', width: 24 },
  { header: 'ขึ้นเว็บ', key: 'onWeb', width: 9 },
  { header: 'มีรูป', key: 'hasImage', width: 8 },
  { header: '1688 Link', key: 'link1688', width: 30 },
  { header: 'โฟลเดอร์รูป', key: 'folder', width: 40 },
  { header: 'จำนวนรูปที่ดึงแล้ว', key: 'imgCount', width: 16 },
  { header: 'ผู้รับผิดชอบ', key: 'owner', width: 14 },
  { header: 'หมายเหตุ', key: 'note', width: 24 },
];

rows.forEach((p, i) => {
  const row = ws.addRow({
    no: i + 1, sku: p.sku, name: p.name, category: p.category, features: p.features,
    size: p.size, material: p.material, color: p.color, price300: p.price300, moq: p.moq,
    logoTechniques: p.logoTechniques, logoSize: p.logoSize, status: p.status,
    onWeb: p.onWeb ? 'ใช่' : 'ไม่', hasImage: p.hasImage ? 'ใช่' : 'ไม่',
    link1688: p.link1688 || '', folder: p._folder,
  });
  if (p.link1688) {
    const c = row.getCell('link1688');
    c.value = { text: 'เปิดลิงก์ 1688', hyperlink: p.link1688 };
    c.font = { color: { argb: 'FF0563C1' }, underline: true };
  }
  const sc = row.getCell('status');
  sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusFill(p.status) } };
  sc.font = { color: { argb: statusFont(p.status) }, bold: true };
});

const head = ws.getRow(1);
head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
head.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
head.height = 28;
head.eachCell((c) => (c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } }));
ws.autoFilter = { from: 'A1', to: 'T1' };

const out = `${MASTER}\\GO PREMIUM - Product Master.xlsx`;
await wb.xlsx.writeFile(out);

console.log('Folders created:', made, 'under', MASTER);
console.log('Excel written  :', out);
