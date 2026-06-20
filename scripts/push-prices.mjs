/** Push AI benchmark prices into the Google Sheet: fill price column E of "ราคาที่ต้องเติม". */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(dir, '.sheet-config.json'), 'utf8'));
const post = (action, params) => fetch(cfg.url, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: cfg.token, action, ...params }), redirect: 'follow',
}).then(r => r.text()).then(t => { try { return JSON.parse(t); } catch { return { raw: t.slice(0, 300) }; } });

const result = JSON.parse(fs.readFileSync('_pricing/result.json', 'utf8'));
const tab = JSON.parse(fs.readFileSync('_pricing/pricetab.json', 'utf8')).values;
const priceBySku = Object.fromEntries(result.map(r => [r.sku, r.price]));

// build column E from row 4..N: SKU rows -> price, others keep existing
const firstRow = 4, lastRow = tab.length;
const colE = [];
for (let r = firstRow; r <= lastRow; r++) {
  const row = tab[r - 1] || [];
  const sku = (row[0] || '').toString().trim();
  colE.push([sku && priceBySku[sku] != null ? priceBySku[sku] : (row[4] ?? '')]);
}
const res = await post('write', { sheet: 'ราคาที่ต้องเติม', range: `E${firstRow}:E${lastRow}`, values: colE });
console.log('fill prices E' + firstRow + ':E' + lastRow, '→', JSON.stringify(res));
console.log('filled', result.length, 'SKU prices');
