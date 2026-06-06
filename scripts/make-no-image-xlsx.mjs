// Generates docs/PRODUCTS-NO-IMAGE.xlsx — list of catalog SKUs with no photo,
// plus blank columns for staff to fill in while sourcing images.
import ExcelJS from 'exceljs';
import { readFileSync } from 'node:fs';

const ROOT = 'C:\\Users\\Golf\\Gopremium-website';
const raw = JSON.parse(readFileSync(`${ROOT}\\src\\data\\products-raw.json`, 'utf8'));
const gen = JSON.parse(readFileSync(`${ROOT}\\src\\data\\product-images.generated.json`, 'utf8'));
const src = readFileSync(`${ROOT}\\src\\data\\products.js`, 'utf8');

// IMAGE_MAP keys (legacy fallback photos)
const block = src.slice(src.indexOf('const IMAGE_MAP'), src.indexOf('};', src.indexOf('const IMAGE_MAP')));
const mapKeys = new Set([...block.matchAll(/^\s*([A-Z]{2}\d{3})\s*:/gm)].map((m) => m[1]));
const genKeys = new Set(Object.keys(gen));

const valid = raw.filter((p) => p.name && p.name.trim() && p.sku);
const noImg = valid
  .filter((p) => !genKeys.has(p.sku) && !mapKeys.has(p.sku))
  .sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.sku.localeCompare(b.sku));

const wb = new ExcelJS.Workbook();
wb.creator = 'GO PREMIUM';
const ws = wb.addWorksheet('สินค้าที่ยังไม่มีรูป', {
  views: [{ state: 'frozen', ySplit: 1 }],
});

ws.columns = [
  { header: 'ลำดับ', key: 'no', width: 8 },
  { header: 'SKU', key: 'sku', width: 12 },
  { header: 'ชื่อสินค้า', key: 'name', width: 45 },
  { header: 'หมวดหมู่', key: 'category', width: 16 },
  { header: 'สถานะรูป', key: 'status', width: 16 },
  { header: 'ลิงก์/แหล่งรูป', key: 'link', width: 30 },
  { header: 'ผู้รับผิดชอบ', key: 'owner', width: 16 },
  { header: 'หมายเหตุ', key: 'note', width: 30 },
];

noImg.forEach((p, i) =>
  ws.addRow({ no: i + 1, sku: p.sku, name: p.name, category: p.category, status: 'ยังไม่มีรูป' })
);

// style header
const head = ws.getRow(1);
head.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
head.alignment = { vertical: 'middle', horizontal: 'center' };
head.height = 22;
head.eachCell((c) => {
  c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  c.border = { bottom: { style: 'thin', color: { argb: 'FF999999' } } };
});

// borders + zebra for body
for (let r = 2; r <= ws.rowCount; r++) {
  const row = ws.getRow(r);
  if (r % 2 === 0) row.eachCell((c) => (c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F6FB' } }));
  row.getCell('status').font = { color: { argb: 'FFC00000' } };
}

ws.autoFilter = { from: 'A1', to: 'H1' };

const out = `${ROOT}\\PRODUCTS-NO-IMAGE.xlsx`;
await wb.xlsx.writeFile(out);
console.log(`Wrote ${out}`);
console.log(`Rows: ${noImg.length}`);
