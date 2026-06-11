// Import prices the user typed into PRODUCT-MASTER.xlsx (sheet "ราคาที่ต้องเติม")
// back into the real data files, then regenerate public/catalogue-data.js.
//
//   src/data/products-raw.json   → price_300_thb + budget_tier (what the live site reads)
//   scripts/catalog-master.json  → price300                    (master record)
//
// Run from the website/ folder:  node scripts/import-prices-from-master.mjs
// After it succeeds: npm run build → push main (or tell Claude to deploy).
import ExcelJS from 'exceljs';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const XLSX = 'PRODUCT-MASTER.xlsx';
const SHEET = 'ราคาที่ต้องเติม';
// ช่วงงบเดียวกับ priceTier() ใน public/v2.html
const tierOf = (n) => (n <= 60 ? 'value' : n <= 150 ? 'smart' : n <= 300 ? 'premium' : 'executive');

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(XLSX);
const ws = wb.getWorksheet(SHEET);
if (!ws) { console.error(`ไม่พบชีต "${SHEET}" ใน ${XLSX} — รัน build-product-master-xlsx.mjs ก่อน`); process.exit(1); }

// เก็บ SKU → ราคาที่กรอก (ข้ามแถวหัวข้อหมวด/แถวว่าง)
const entered = {};
ws.eachRow((row) => {
  const sku = String(row.getCell(1).value || '').trim();
  if (!/^[A-Z]{2,3}\d{3}$/.test(sku)) return;
  const v = row.getCell(5).value;
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^\d.]/g, ''));
  if (Number.isFinite(n) && n > 0) entered[sku] = Math.round(n);
});

const skus = Object.keys(entered);
if (!skus.length) { console.log('ยังไม่มีราคาที่กรอกในชีต "' + SHEET + '" — ไม่มีอะไรต้อง import'); process.exit(0); }

// 1) products-raw.json (ไฟล์ที่เว็บใช้จริง)
const rawPath = 'src/data/products-raw.json';
const raw = JSON.parse(readFileSync(rawPath, 'utf8'));
let updRaw = 0;
raw.forEach((p) => {
  if (entered[p.sku] != null) {
    p.price_300_thb = entered[p.sku];
    p.budget_tier = tierOf(entered[p.sku]);
    updRaw++;
  }
});
writeFileSync(rawPath, JSON.stringify(raw, null, 2));

// 2) catalog-master.json (master record)
const cmPath = 'scripts/catalog-master.json';
const cm = JSON.parse(readFileSync(cmPath, 'utf8'));
let updCm = 0;
cm.forEach((p) => { if (entered[p.sku] != null) { p.price300 = String(entered[p.sku]); updCm++; } });
writeFileSync(cmPath, JSON.stringify(cm, null, 2));

// 3) regenerate catalogue-data.js + PRODUCT-MASTER.xlsx ให้สะท้อนราคาใหม่
execSync('node scripts/build-catalogue-data.mjs', { stdio: 'inherit' });
execSync('node scripts/build-product-master-xlsx.mjs', { stdio: 'inherit' });

console.log('\n=== IMPORT สำเร็จ ===');
skus.sort().forEach((s) => console.log(`  ${s} → ฿${entered[s]} (${tierOf(entered[s])})`));
console.log(`รวม ${skus.length} SKU · products-raw.json ${updRaw} · catalog-master.json ${updCm}`);
console.log('ขั้นต่อไป: npm run build แล้ว push main (หรือบอก Claude ให้ deploy)');
