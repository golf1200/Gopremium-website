#!/usr/bin/env node
/**
 * express-retier.mjs — จัดชั้นหมวด "ส่งด่วน" ให้ตรงความจริง (Golf approved 2026-08-04)
 *
 * ปัญหาเดิม: `express: true` เป็น boolean ก้อนเดียว 124 SKU ที่ lead time จริงกระจาย 7–60 วัน
 * และ `lead_time` เป็นข้อความดิบจากซัพ (sort/filter/แสดงผลไม่ได้)
 *
 * ทำอะไร (idempotent — รันซ้ำได้ ผลเท่าเดิม):
 *   1. parse `lead_time` → ship_days_min / ship_days_max (ตัวเลข)
 *   2. ติด ship_tier ตามความจริง: rush ≤14 / ontime ≤20 / plan ≤25
 *   3. ของที่ผลิต >25 วัน → ถอด `express` ออก (ย้ายเข้าแคตตาล็อกปกติ)
 *   4. ใส่ ship_label ภาษาลูกค้า + เก็บข้อความดิบไว้ที่ lead_time_note (ภายใน)
 *
 * usage: node scripts/express-retier.mjs [--write]   (ไม่ใส่ --write = dry run)
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';

const SRC = 'src/data/products-raw.json';
const WRITE = process.argv.includes('--write');

// ของ 6 ตัวนี้ lead_time เป็นโน้ตคุยกับซัพ ไม่ใช่คำสัญญากับลูกค้า และ "ไม่มีราคา" ด้วยทั้ง 6
// → ถอดออกจากหมวดส่งด่วน จนกว่าจะเคลียร์ราคา + ยืนยัน lead time กับซัพ
const MANUAL_DROP = {
  EX056: 'สั่งผลิต 30-45 วันทำการ (ของสต๊อกเท่านั้นที่ 7-10 วัน) + ยังไม่มีราคา',
  EX057: 'สั่งผลิต 30-45 วันทำการ (ของสต๊อกเท่านั้นที่ 7-10 วัน) + ยังไม่มีราคา',
  EX058: 'ผลิต 40-60 วันทำการ + ยังไม่มีราคา',
  EX059: 'ผลิต 30-60 วันทำการตามจำนวน + ยังไม่มีราคา',
  EX060: 'ขึ้นตัวอย่าง 7-10 วัน แต่ผลิตจริง 30 วัน + ยังไม่มีราคา',
  EX061: 'ขึ้นตัวอย่าง 7-10 วัน แต่ผลิตจริง 30 วัน + ยังไม่มีราคา',
};

/** "14-20 วัน" → { min: 14, max: 20 } · คืน null ถ้า parse ไม่ได้ */
function parseLeadTime(raw) {
  if (!raw) return null;
  const m = String(raw).match(/^\s*(\d{1,3})\s*-\s*(\d{1,3})\s*วัน\s*$/);
  if (!m) return null;
  const min = Number(m[1]);
  const max = Number(m[2]);
  if (!min || !max || max < min || max > 120) return null;
  return { min, max };
}

/** ชั้นตามวันสูงสุดที่รับปากลูกค้าได้ */
function tierOf(max) {
  if (max <= 14) return 'rush';
  if (max <= 20) return 'ontime';
  if (max <= 25) return 'plan';
  return null; // >25 วัน = ไม่ใช่ของส่งด่วน
}

const TIER_LABEL = {
  rush: 'ส่งด่วน',
  ontime: 'ทันงาน',
  plan: 'วางแผนล่วงหน้า',
};

const raw = JSON.parse(readFileSync(SRC, 'utf8'));
const report = { rush: [], ontime: [], plan: [], dropped: [], unparsed: [] };

for (const p of raw) {
  // ทุกครั้งเริ่มจากสถานะดิบ เพื่อให้รันซ้ำได้ผลเท่าเดิม
  const wasExpress = p.express === true || p.ship_tier != null;
  if (!wasExpress) continue;

  const source = p.lead_time_note || p.lead_time;

  if (MANUAL_DROP[p.sku]) {
    p.express = false;
    delete p.ship_tier; delete p.ship_days_min; delete p.ship_days_max; delete p.ship_label;
    p.lead_time_note = source;
    p.express_blocked_reason = MANUAL_DROP[p.sku];
    report.dropped.push(`${p.sku} — ${MANUAL_DROP[p.sku]}`);
    continue;
  }

  const parsed = parseLeadTime(source);
  if (!parsed) {
    report.unparsed.push(`${p.sku} — ${JSON.stringify(source)}`);
    continue;
  }

  const tier = tierOf(parsed.max);
  if (!tier) {
    p.express = false;
    delete p.ship_tier; delete p.ship_days_min; delete p.ship_days_max; delete p.ship_label;
    p.lead_time_note = source;
    p.express_blocked_reason = `ผลิต ${parsed.min}-${parsed.max} วัน — เกินเกณฑ์ส่งด่วน`;
    report.dropped.push(`${p.sku} — ${parsed.min}-${parsed.max} วัน`);
    continue;
  }

  p.express = true;
  p.ship_tier = tier;
  p.ship_days_min = parsed.min;
  p.ship_days_max = parsed.max;
  p.ship_label = `${TIER_LABEL[tier]} ${parsed.min}–${parsed.max} วัน`;
  delete p.express_blocked_reason;
  report[tier].push(p.sku);
}

// ---- report ----
const line = (s) => console.log(s);
line(`\n${WRITE ? '✍️  WRITE' : '👀 DRY RUN'} — ${SRC}\n`);
line(`  rush   (ส่งด่วน ≤14 วัน)        ${String(report.rush.length).padStart(3)}  ← พระเอกของแอด/SEO`);
line(`  ontime (ทันงาน 15–20 วัน)       ${String(report.ontime.length).padStart(3)}`);
line(`  plan   (วางแผนล่วงหน้า 21–25)   ${String(report.plan.length).padStart(3)}`);
line(`  ────────────────────────────────────`);
line(`  ยังอยู่ในหมวดส่งด่วน            ${String(report.rush.length + report.ontime.length + report.plan.length).padStart(3)}`);
line(`  ถอดออกจากหมวดส่งด่วน           ${String(report.dropped.length).padStart(3)}`);
report.dropped.forEach((d) => line(`     · ${d}`));
if (report.unparsed.length) {
  line(`\n  ⚠️  parse lead_time ไม่ได้ (ไม่แตะต้อง) ${report.unparsed.length}`);
  report.unparsed.forEach((d) => line(`     · ${d}`));
}
line(`\n  SKU ส่งด่วนตัวจริง (rush): ${report.rush.join(', ')}\n`);

if (WRITE) {
  copyFileSync(SRC, `${SRC}.bak-express-retier`);
  writeFileSync(SRC, JSON.stringify(raw, null, 2) + '\n', 'utf8');
  line(`  ✅ เขียนแล้ว · สำรองไว้ที่ ${SRC}.bak-express-retier\n`);
} else {
  line(`  (ยังไม่เขียนไฟล์ — ใส่ --write เพื่อบันทึกจริง)\n`);
}
