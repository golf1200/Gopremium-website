// Import sell prices from the LIVE Google Sheet "Gopremium Dev Master",
// tab "🗂️ PRODUCT MASTER (รวม)" column "ราคาขาย/ชิ้น(฿)" — the single SSOT the
// team edits (in the sheet, or via the internal platform's Product Master editor).
// This replaces the older xlsx-based import-prices-from-master.mjs and the earlier
// throwaway "ราคาที่ต้องเติม" tab (removed 2026-07-01 during the sheet cleanup).
//
//   src/data/products-raw.json   → price_300_thb + budget_tier (what the live site reads)
//   scripts/catalog-master.json  → price300                    (master record)
//
// Run from the website/ folder:  node scripts/import-prices-from-sheet.mjs
// After it succeeds: npm run build → push main (or tell Claude to deploy).
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(path.join(dir, '.sheet-config.json'), 'utf8'));
const SHEET = '🗂️ PRODUCT MASTER (รวม)';
const PRICE_COL = 'ราคาขาย/ชิ้น(฿)';
// ช่วงงบเดียวกับ priceTier() ใน public/v2.html
const tierOf = (n) => (n <= 60 ? 'value' : n <= 150 ? 'smart' : n <= 300 ? 'premium' : 'executive');

async function readSheet(sheet) {
  const res = await fetch(cfg.url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: cfg.token, action: 'read', sheet }), redirect: 'follow',
  });
  return (JSON.parse(await res.text()).values) || [];
}

const rows = await readSheet(SHEET);
const head = (rows[0] || []).map((x) => String(x).trim());
const iSku = head.indexOf('SKU');
const iPrice = head.indexOf(PRICE_COL);
if (iSku < 0 || iPrice < 0) { console.error(`ไม่พบคอลัมน์ SKU/${PRICE_COL} ในชีต "${SHEET}"`); process.exit(1); }
// build SKU → sell price (skip blank prices)
const entered = {};
for (const r of rows.slice(1)) {
  const sku = String(r[iSku] || '').trim();
  if (!/^[A-Z]{2,3}\d{3}$/.test(sku)) continue;
  const v = r[iPrice];
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^\d.]/g, ''));
  if (Number.isFinite(n) && n > 0) entered[sku] = Math.round(n);
}

const skus = Object.keys(entered);
if (!skus.length) { console.log('ยังไม่มีราคาที่กรอกในชีต "' + SHEET + '"'); process.exit(0); }

// 1) products-raw.json (ไฟล์ที่เว็บใช้จริง) — record diffs
const rawPath = path.join(dir, '../src/data/products-raw.json');
const raw = JSON.parse(readFileSync(rawPath, 'utf8'));
const changed = [];
let updRaw = 0;
raw.forEach((p) => {
  if (entered[p.sku] != null) {
    if (p.price_300_thb !== entered[p.sku]) changed.push(`${p.sku} ${p.price_300_thb ?? 'ว่าง'}→${entered[p.sku]}`);
    p.price_300_thb = entered[p.sku];
    p.budget_tier = tierOf(entered[p.sku]);
    updRaw++;
  }
});
writeFileSync(rawPath, JSON.stringify(raw, null, 2));

// 2) catalog-master.json (master record)
const cmPath = path.join(dir, 'catalog-master.json');
const cm = JSON.parse(readFileSync(cmPath, 'utf8'));
let updCm = 0;
cm.forEach((p) => { if (entered[p.sku] != null) { p.price300 = String(entered[p.sku]); updCm++; } });
writeFileSync(cmPath, JSON.stringify(cm, null, 2));

// 3) regenerate catalogue-data.js so the site reflects new prices
execSync('node scripts/build-catalogue-data.mjs', { stdio: 'inherit', cwd: path.join(dir, '..') });

console.log('\n=== IMPORT (จาก Google Sheet) สำเร็จ ===');
console.log(`รวม ${skus.length} SKU · products-raw.json ${updRaw} · catalog-master.json ${updCm}`);
console.log(`ราคาที่เปลี่ยนจริง (${changed.length}): ` + (changed.join('  ') || 'ไม่มี — ยืนยันค่าเดิมทั้งหมด'));
