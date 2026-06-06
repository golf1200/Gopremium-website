// Extract the "ข้อมูลแคตตาล็อก" tab into clean JSON + cross-reference with the
// deployed site to compute per-product status. Writes catalog-master.json.
import ExcelJS from 'exceljs';
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'C:\\Users\\Golf\\Desktop\\Gopremium new version\\ข้อมูลสินค้า.xlsx';
const ROOT = 'C:\\Users\\Golf\\Gopremium-website';

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(SRC);
const ws = wb.worksheets.find((w) => /แคตตาล็อก|แคตตาล็อค|catalog/i.test(w.name));

// header is row 2, data from row 3
const C = {
  sku: 4, name: 5, category: 6, features: 7, size: 8, material: 9, color: 10,
  price300: 11, moq: 12,
  laser: 13, screen: 14, uv: 15, uvdtf: 16, printlogo: 17, dtf: 18, other: 19,
  logoSize: 20, link: 23,
};

function cellText(cell) {
  let v = cell.value;
  if (v == null) return '';
  if (typeof v === 'object') v = v.text ?? v.hyperlink ?? v.result ?? '';
  return String(v).trim();
}
function cellLink(cell) {
  const v = cell.value;
  if (v && typeof v === 'object' && v.hyperlink) return v.hyperlink;
  const t = cellText(cell);
  return /^https?:\/\//i.test(t) ? t : '';
}

const rows = [];
for (let r = 3; r <= ws.rowCount; r++) {
  const row = ws.getRow(r);
  const sku = cellText(row.getCell(C.sku));
  if (!/^[A-Z]{2,3}\d{3}$/.test(sku)) continue; // valid SKU only
  const techniques = [];
  for (const [label, col] of [
    ['เลเซอร์', C.laser], ['สกรีน', C.screen], ['UV', C.uv],
    ['UV DTF', C.uvdtf], ['พิมพ์โลโก้', C.printlogo], ['DTF', C.dtf],
  ]) {
    if (cellText(row.getCell(col)).toLowerCase() === 'true') techniques.push(label);
  }
  rows.push({
    sku,
    name: cellText(row.getCell(C.name)),
    category: cellText(row.getCell(C.category)),
    features: cellText(row.getCell(C.features)),
    size: cellText(row.getCell(C.size)),
    material: cellText(row.getCell(C.material)),
    color: cellText(row.getCell(C.color)),
    price300: cellText(row.getCell(C.price300)),
    moq: cellText(row.getCell(C.moq)),
    logoTechniques: techniques.join(', '),
    logoSize: cellText(row.getCell(C.logoSize)),
    link1688: cellLink(row.getCell(C.link)),
  });
}

// ---- cross-reference with deployed site ----
const raw = JSON.parse(readFileSync(`${ROOT}\\src\\data\\products-raw.json`, 'utf8'));
const gen = JSON.parse(readFileSync(`${ROOT}\\src\\data\\product-images.generated.json`, 'utf8'));
const srcJs = readFileSync(`${ROOT}\\src\\data\\products.js`, 'utf8');
const block = srcJs.slice(srcJs.indexOf('const IMAGE_MAP'), srcJs.indexOf('};', srcJs.indexOf('const IMAGE_MAP')));
const mapKeys = new Set([...block.matchAll(/^\s*([A-Z]{2}\d{3})\s*:/gm)].map((m) => m[1]));
const genKeys = new Set(Object.keys(gen));
const onWeb = new Set(raw.filter((p) => p.name && p.name.trim() && p.sku).map((p) => p.sku));

for (const p of rows) {
  p.onWeb = onWeb.has(p.sku);
  p.hasImage = genKeys.has(p.sku) || mapKeys.has(p.sku);
  p.hasLink = !!p.link1688;
  p.status = !p.onWeb
    ? 'ยังไม่ขึ้นเว็บ'
    : p.hasImage
    ? 'ขึ้นเว็บแล้ว + มีรูป'
    : 'ขึ้นเว็บแล้ว + ยังไม่มีรูป';
}

writeFileSync(`${ROOT}\\scripts\\catalog-master.json`, JSON.stringify(rows, null, 2), 'utf8');

// ---- stats ----
const n = rows.length;
const withLink = rows.filter((p) => p.hasLink).length;
const st = {};
rows.forEach((p) => (st[p.status] = (st[p.status] || 0) + 1));
console.log('Catalog rows (valid SKU):', n);
console.log('With 1688 link          :', withLink, `(${n - withLink} missing)`);
console.log('\nStatus breakdown:');
Object.entries(st).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log('\nNeed image AND have link (fetch candidates):',
  rows.filter((p) => !p.hasImage && p.hasLink).length);
console.log('Need image but NO link  :',
  rows.filter((p) => !p.hasImage && !p.hasLink).length);
