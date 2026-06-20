/** Create/refresh the "💰 ราคา AI (Benchmark)" tab in the Google Sheet with the full pricing report. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(dir, '.sheet-config.json'), 'utf8'));
const post = (action, params) => fetch(cfg.url, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: cfg.token, action, ...params }), redirect: 'follow',
}).then(r => r.text()).then(t => { try { return JSON.parse(t); } catch { return { ok: false, raw: t.slice(0, 200) }; } });

const r = JSON.parse(fs.readFileSync('_pricing/result.json', 'utf8'));
const TAB = '💰 ราคา AI (Benchmark)';

const created = await post('addSheet', { sheet: TAB });
if (!created.ok) {
  console.error('❌ ยังสร้างแท็บไม่ได้ — ต้อง redeploy Apps Script เวอร์ชันใหม่ก่อน. response:', JSON.stringify(created));
  process.exit(1);
}

const today = process.argv[2] || '';
const rows = [
  [`GO PREMIUM — ราคาอ้างอิงจาก AI (Benchmark)  ${today}`, '', '', '', '', '', '', '', ''],
  ['กลยุทธ์: ตั้งราคาต่ำกว่าราคากลางคู่แข่ง ~10% (สงครามราคา) · benchmark = giftwise @ 300 ชิ้น พิมพ์โลโก้ · ราคา "ตั้งต้นจากตลาด" จูนทีหลังได้', '', '', '', '', '', '', '', ''],
  ['SKU', 'ชื่อสินค้า', 'หมวด (เรา)', 'อ้างอิงคู่แข่ง', 'n ตัวอย่าง', 'ราคากลางคู่แข่ง ฿', 'ราคาที่เราตั้ง ฿', 'ถูกกว่า %', 'ความมั่นใจ'],
  ...r.map(x => [
    x.sku, x.name, x.ourCat,
    `${x.benchSource} · ${x.benchCat}`, x.n,
    x.median || '', x.price,
    (x.undercutPct >= 0 ? '-' : '+') + Math.abs(x.undercutPct) + '%',
    x.conf + (x.clamped ? ' (clamp)' : ''),
  ]),
];
const lastRow = rows.length, lastColL = 'I';
const res = await post('write', { sheet: TAB, range: `A1:${lastColL}${lastRow}`, values: rows });
console.log('report tab:', created.created, '| wrote', JSON.stringify(res));
console.log('rows:', rows.length, '(incl. 2 header + 1 column row)');
