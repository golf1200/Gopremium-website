/**
 * Pull all product/supplier tabs from the 4 source Google Sheets via the
 * sheet-sync Web App, save raw JSON locally, and print a compact summary.
 * Output dir: <GoPremium-Platform>/data/_raw/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(dir, '.sheet-config.json'), 'utf8'));
const OUT = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data/_raw';
fs.mkdirSync(OUT, { recursive: true });

const JOBS = [
  ['devmaster', '1LDR6VIqCZR4Gdt3thPqGrvkOfOnSHJHem7KFgf71rnE', 'รายการสินค้า (Master)'],
  ['devmaster', '1LDR6VIqCZR4Gdt3thPqGrvkOfOnSHJHem7KFgf71rnE', 'สินค้าส่งด่วน (Express)'],
  ['2025biz',   '1GS-N57CCUKPdv98-mn6BRE9ybFRTqQ4aZL2EfGdLKa8', 'รายการสินค้า'],
  ['2025biz',   '1GS-N57CCUKPdv98-mn6BRE9ybFRTqQ4aZL2EfGdLKa8', 'ตารางสินค้า'],
  ['2025biz',   '1GS-N57CCUKPdv98-mn6BRE9ybFRTqQ4aZL2EfGdLKa8', 'Supplier OEM'],
  ['npd',       '1IoQ0bGYckhWqz0f8-8BH63YqBt1DbWgi_BoJqoh8zp0', 'Sourcing CN'],
  ['npd',       '1IoQ0bGYckhWqz0f8-8BH63YqBt1DbWgi_BoJqoh8zp0', 'Sourcing TH'],
  ['npd',       '1IoQ0bGYckhWqz0f8-8BH63YqBt1DbWgi_BoJqoh8zp0', 'ราคาสินค้าพร้อมส่ง'],
  ['nt',        '1C5ZEpCL6jpxp5O95-GIU9z-cBgcru0rLy38WvAFq8XI', 'Supplier'],
  ['nt',        '1C5ZEpCL6jpxp5O95-GIU9z-cBgcru0rLy38WvAFq8XI', 'TH Product'],
  ['nt',        '1C5ZEpCL6jpxp5O95-GIU9z-cBgcru0rLy38WvAFq8XI', 'CN Product'],
];

const slug = (s) => s.replace(/[^\w฀-๿]+/g, '_').replace(/^_|_$/g, '');

async function read(spreadsheetId, sheet) {
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: cfg.token, action: 'read', spreadsheetId, sheet }),
    redirect: 'follow',
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { ok: false, error: text.slice(0, 200) }; }
}

console.log('| file | tab | rows | cols | header (first row, truncated) |');
console.log('|---|---|---|---|---|');
for (const [file, id, sheet] of JOBS) {
  const r = await read(id, sheet);
  if (!r.ok) { console.log(`| ${file} | ${sheet} | ERR | - | ${r.error} |`); continue; }
  const v = r.values || [];
  const outfile = path.join(OUT, `${file}__${slug(sheet)}.json`);
  fs.writeFileSync(outfile, JSON.stringify(v));
  const header = (v[0] || []).map(c => String(c).replace(/\s+/g, ' ').trim()).filter(Boolean).join(' · ');
  console.log(`| ${file} | ${sheet} | ${Math.max(0, v.length - 1)} | ${(v[0] || []).length} | ${header.slice(0, 180)} |`);
}
console.log('\nSaved raw JSON ->', OUT);
