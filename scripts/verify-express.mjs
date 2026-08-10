#!/usr/bin/env node
/**
 * verify-express.mjs — ตรวจหน้า /express ว่าไม่มีคำสัญญาเวลาส่งที่ข้อมูลไม่รองรับ
 * รันหลัง build โดยชี้ที่ preview server:  node scripts/verify-express.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:4177';
const fails = [];
const ok = (m) => console.log(`  ✅ ${m}`);
const bad = (m) => { fails.push(m); console.log(`  ❌ ${m}`); };

// ความจริงจากข้อมูล (source of truth)
const raw = JSON.parse(readFileSync('src/data/products-raw.json', 'utf8'));
const ex = raw.filter((p) => p.express === true && p.ship_tier);
const counts = {
  rush: ex.filter((p) => p.ship_tier === 'rush').length,
  ontime: ex.filter((p) => p.ship_tier === 'ontime').length,
  plan: ex.filter((p) => p.ship_tier === 'plan').length,
};

console.log(`\n🔍 ตรวจ ${BASE}/express  (ข้อมูลจริง: rush ${counts.rush} / ontime ${counts.ontime} / plan ${counts.plan})\n`);

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
// _vercel/insights + speed-insights มีเฉพาะบน Vercel — รันในเครื่องจะ 404 เสมอ ไม่ใช่ error จริง
const IGNORE = /_vercel\/(insights|speed-insights)/;
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  // ข้อความ "Failed to load resource" ไม่มี URL ในตัวข้อความ — URL อยู่ใน location()
  const where = (m.location() && m.location().url) || '';
  if (m.type() === 'error' && !IGNORE.test(m.text()) && !IGNORE.test(where)) {
    errors.push(`${m.text()} ${where}`.trim());
  }
});
page.on('response', (r) => {
  if (r.status() >= 400 && !IGNORE.test(r.url())) errors.push(`${r.status()} ${r.url()}`);
});

await page.goto(`${BASE}/express`, { waitUntil: 'networkidle' });
await page.waitForSelector('.ecard', { timeout: 10000 }).catch(() => {});

// 1. ไม่มี JS error
errors.length ? bad(`JS error: ${errors.slice(0, 3).join(' | ')}`) : ok('ไม่มี JS error');

// 2. การ์ดขึ้นครบตามข้อมูล (ค่าเริ่มต้น = ภายใน 25 วัน = ทั้งหมด)
const cards = await page.locator('.ecard').count();
cards === ex.length ? ok(`การ์ดขึ้นครบ ${cards} ใบ`) : bad(`การ์ด ${cards} ใบ แต่ข้อมูลมี ${ex.length}`);

// 3. ทุกการ์ดต้องมีป้ายวันส่ง และห้ามมีใบไหนเขียน "7–14 วัน" ทั้งที่ไม่ใช่ชั้น rush
const badges = await page.locator('.ecard .ebadge').allInnerTexts();
badges.length === cards ? ok('ทุกการ์ดมีป้ายวันส่ง') : bad(`มีป้าย ${badges.length} จาก ${cards} การ์ด`);
const rushBadges = badges.filter((b) => b.includes('7–14') || b.includes('10–14'));
rushBadges.length <= counts.rush
  ? ok(`ป้าย "ด่วน ≤14 วัน" มี ${rushBadges.length} ใบ (ไม่เกิน ${counts.rush} ตามข้อมูล)`)
  : bad(`ป้าย ≤14 วัน มี ${rushBadges.length} ใบ แต่ข้อมูลมีแค่ ${counts.rush} — เคลมเกินจริง`);

// 4. ฟิลเตอร์เดดไลน์ทำงาน: กด "ภายใน 14 วัน" ต้องเหลือเท่า rush
await page.locator('.dchip', { hasText: 'ภายใน 14 วัน' }).first().click();
await page.waitForTimeout(400);
const rushCards = await page.locator('.ecard').count();
rushCards === counts.rush
  ? ok(`ฟิลเตอร์ 14 วัน → ${rushCards} รายการ ตรงข้อมูล`)
  : bad(`ฟิลเตอร์ 14 วัน → ${rushCards} รายการ แต่ข้อมูลมี ${counts.rush}`);

// 5. หัวข้อหน้าห้ามเคลมเวลาส่งเหมารวม
const h1 = (await page.locator('h1').first().innerText().catch(() => '')) || '';
/7\s*[–-]\s*14\s*วัน/.test(h1)
  ? bad(`H1 ยังเคลมเวลาส่งเหมารวม: "${h1.replace(/\n/g, ' ')}"`)
  : ok(`H1 ไม่เคลมเวลาส่งเหมารวม: "${h1.replace(/\n/g, ' ')}"`);

// 6. FAQ/หมายเหตุอธิบายวิธีนับวัน
const body = await page.locator('body').innerText();
/นับตั้งแต่/.test(body) ? ok('มีหมายเหตุอธิบายวิธีนับวัน') : bad('ไม่มีหมายเหตุอธิบายวิธีนับวัน');

await browser.close();
console.log(fails.length ? `\n❌ ไม่ผ่าน ${fails.length} ข้อ\n` : '\n✅ ผ่านทั้งหมด\n');
process.exit(fails.length ? 1 : 0);
