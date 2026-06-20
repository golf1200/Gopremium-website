/** Write AI benchmark prices into the LOCAL PRODUCT-MASTER.xlsx sheet "ราคาที่ต้องเติม" (col E),
 *  so the official import-prices-from-master.mjs can pick them up. */
import ExcelJS from 'exceljs';
import { readFileSync } from 'node:fs';
const result = JSON.parse(readFileSync('_pricing/result.json', 'utf8'));
const priceBySku = Object.fromEntries(result.map(r => [r.sku, r.price]));

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile('PRODUCT-MASTER.xlsx');
const ws = wb.getWorksheet('ราคาที่ต้องเติม');
if (!ws) { console.error('ไม่พบชีต ราคาที่ต้องเติม'); process.exit(1); }

let filled = 0;
ws.eachRow((row, n) => {
  const sku = String(row.getCell(1).value || '').trim();
  if (priceBySku[sku] != null) { row.getCell(5).value = priceBySku[sku]; filled++; }
});
await wb.xlsx.writeFile('PRODUCT-MASTER.xlsx');
console.log('filled', filled, 'prices into local PRODUCT-MASTER.xlsx');
