// Applies the team's express-catalogue feedback round of 2026-07-30 (Google Doc
// 1X95k4evf9Sw3uCzDfTduSsWXFXQA0p8LqNyB3xLYwvU) to the curated catalogue.
// Source list: 10-DECISIONS-PENDING/EXPRESS-2026-07-30-รูปอ้างอิง/_ลำดับรูปในเอกสาร.txt
// Idempotent: re-running produces the same result.
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(REPO, 'src/data/products-raw.json');
const IMG = path.join(REPO, 'src/data/product-images.generated.json');

const products = JSON.parse(readFileSync(RAW, 'utf8'));
const images = JSON.parse(readFileSync(IMG, 'utf8'));
const log = [];
const bySku = (s) => products.find((p) => p.sku === s);

const set = (sku, field, value) => {
  const p = bySku(sku);
  if (!p) return log.push(`!! ${sku} not found (${field})`);
  if (JSON.stringify(p[field]) === JSON.stringify(value)) return log.push(`   ${sku} ${field} already ok`);
  log.push(`   ${sku} ${field}: ${JSON.stringify(p[field])} -> ${JSON.stringify(value)}`);
  p[field] = value;
};

// keep = list of gallery indexes (of the ORIGINAL committed order) in the new order
const gallery = (sku, keep) => {
  const e = images[sku];
  if (!e) return log.push(`!! ${sku} has no image entry`);
  const before = e.gallery.slice();
  const next = keep.map((i) => before[i]).filter(Boolean);
  if (!next.length) return log.push(`!! ${sku} gallery would be empty — skipped`);
  if (JSON.stringify(before) === JSON.stringify(next)) return log.push(`   ${sku} gallery already ok`);
  log.push(`   ${sku} gallery ${before.length} -> ${next.length}: ${next.map((x) => x.split('/').pop()).join(', ')}`);
  e.gallery = next;
};

log.push('== spec / copy fixes ==');
// EX009 หมวกแก๊ป LEVI — วัสดุเป็นผ้าลีวาย
set('EX009', 'material', 'ผ้าลีวาย');
// EX010 ร่มพับ 3 ตอน — 12 สีจริงตามรูปซัพ (เดิม 20 สี ผิด)
set('EX010', 'colors', ['แดง', 'ส้ม', 'เหลือง', 'เขียว', 'ฟ้า', 'น้ำเงิน', 'กรมท่า', 'ม่วง', 'ชมพูบานเย็น', 'น้ำตาล', 'ดำ', 'เงิน']);
// EX011 ร่มพับ 4 ตอน — 9 สีจริงตามรูปซัพ ชื่อสีใหม่
set('EX011', 'colors', ['ดำ', 'น้ำเงิน', 'น้ำตาลเทา', 'ม่วง', 'เลือดหมู', 'ฟ้า', 'เหลือง', 'ชมพู', 'ขาว']);
// EX026 — 16 สี ไม่ใช่ 18 (ตัดฟ้าเทอร์ควอยซ์ + เงิน)
set('EX026', 'colors', (bySku('EX026')?.colors || []).filter((c) => c !== 'ฟ้าเทอร์ควอยซ์' && c !== 'เงิน'));
// EX032 — มีสองไซส์ใน SKU เดียว
set('EX032', 'size', '380 ml / 510 ml');
// EX038 แก้วลูกไข่ — 12 oz ไม่ใช่ 40 oz
set('EX038', 'size', '12 oz');
// EX039 แก้วทรงสตาร์บัค — 6 สีจริง (เดิม 13)
set('EX039', 'colors', ['ชมพู', 'ดำ', 'ม่วงลาเวนเดอร์', 'ฟ้าเทา', 'ขาว', 'เงิน']);
// EX079 — วัสดุคอตตอน 100% ไม่ใช่กำมะหยี่
set('EX079', 'material', 'ผ้าคอตตอน 100%');
// EX099 — ขนาดขึ้นบรรทัด S / L ให้อ่านออก (หน้าเว็บ render ด้วย white-space:pre-line)
set('EX099', 'size', 'ไซส์ S: 36.5 x 16 cm (ก้น 10 x 26 cm)\nไซส์ L: 48 x 29 cm (ก้น 15 x 30 cm)');
// EX100 — typo คอตตอม -> คอตตอน
set('EX100', 'material', 'ผ้าคอตตอน');
// EX116 — ชื่อสีจริง 6 สี แทน placeholder "6 สี" (นับจากรูปซัพ 6 ใบใน Drive)
set('EX116', 'colors', ['กรมท่า', 'ครีม', 'เขียวทหาร', 'ดำ', 'น้ำตาล', 'น้ำตาลเข้ม']);
// EX126 — ตัดสีเงิน/แดง เปลี่ยนเป็นชมพู/เขียว
set('EX126', 'colors', ['ดำ', 'ขาว', 'เหลือง', 'ฟ้า', 'ชมพู', 'เขียว']);
// EX128 — typo มีนิมอล -> มินิมอล
set('EX128', 'name', 'แก้วกาแฟ รุ่นมินิมอล');
// EX141 — ยึดเป็นตัวหลักแทน EX005 พร้อมชื่อใหม่
set('EX141', 'name', 'กระบอกน้ำสแตนเลส รุ่น Sento');
// EX151 — ตัด "ผิวบาง" ออกจากชื่อ
set('EX151', 'name', 'แก้วเก็บความเย็น 40 oz รุ่นฝาใส');
// EX153 — ชื่อขึ้นบรรทัดใหม่กลางชื่อ -> เว้นวรรคปกติ
set('EX153', 'name', 'แก้วเก็บความเย็น ทรงสตาร์บัค ทูโทนการ์ตูน');
// EX160/161/162 ของชำร่วย — MOQ 100 ไม่ใช่ 1,000
for (const s of ['EX160', 'EX161', 'EX162']) set(s, 'moq', 100);

log.push('== ย้าย EX115–EX118 เข้าหมวดหมวก ==');
// เปลี่ยนเฉพาะหมวด — คง slug/URL เดิมไว้ ไม่ให้ลิงก์ที่ Google index ไว้แล้วพัง
for (const s of ['EX115', 'EX116', 'EX117', 'EX118']) {
  set(s, 'category', 'Hat');
  set(s, 'category_slug', 'hat');
}

log.push('== ลบ SKU ซ้ำ ==');
// EX005 ซ้ำ EX141 (ยึด EX141), EX130 ซ้ำ EX006 (ยึด EX006)
const removals = [['EX005', 'ex005-drinkware', 'ex141-drinkware'], ['EX130', 'ex130-drinkware', 'ex006-drinkware']];
for (const [sku, oldSlug] of removals) {
  const i = products.findIndex((p) => p.sku === sku);
  if (i < 0) { log.push(`   ${sku} already removed`); continue; }
  products.splice(i, 1);
  delete images[sku];
  const dir = path.join(REPO, 'public/product', oldSlug);
  if (existsSync(dir)) { rmSync(dir, { recursive: true, force: true }); log.push(`   removed prerender ${oldSlug}`); }
  log.push(`   ${sku} deleted (duplicate)`);
}

log.push('== ลบ/สลับลำดับรูปตาม feedback ==');
gallery('EX001', [0]);          // ลบรูปที่สอง
gallery('EX004', [0]);          // ลบรูปสองรูปสาม
gallery('EX009', [0, 2]);       // ลบรูปที่สอง
gallery('EX011', [0]);          // ลบรูปที่สอง
gallery('EX026', [0]);          // รูปที่สองสัดส่วนแก้วแปลก
gallery('EX028', [0, 2]);       // รูปที่สองฝาเดียวไม่ตรงจริง (รูปแรกถูกแทนในสเต็ปรูป)
gallery('EX079', [0, 1]);       // ลบรูปที่สาม โลโก้ซ้อน
gallery('EX115', [2, 1]);       // ลบรูปแรก เอารูปสามเป็นรูปหลัก
gallery('EX118', [0]);          // ลบรูปที่สอง
gallery('EX126', [0]);          // ตัดรูปสองรูปสาม
gallery('EX127', [1]);          // ลบรูปหนึ่งกับสาม ใช้รูปสองเป็นหลัก
gallery('EX128', [0]);          // ตัดรูปสองที่ฝาผิด
gallery('EX135', [1]);          // ลบรูปแรก
gallery('EX136', [1]);          // ลบรูปแรก
gallery('EX137', [1]);          // ลบรูปแรก
gallery('EX142', [0, 1]);       // ลบรูปที่สาม
gallery('EX153', [1]);          // ลบรูปแรก
gallery('EX155', [1]);          // ลบรูปหนึ่งกับสาม
gallery('EX173', [0]);          // ลบรูปสองรูปสาม

writeFileSync(RAW, JSON.stringify(products, null, 2) + '\n');
writeFileSync(IMG, JSON.stringify(images, null, 2) + '\n');
console.log(log.join('\n'));
console.log(`\nproducts: ${products.length} · express: ${products.filter((p) => p.express).length}`);
