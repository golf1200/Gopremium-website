#!/usr/bin/env node
/**
 * verify-express.mjs — ตรวจหน้า /express ว่าไม่มีคำสัญญาเวลาส่งที่ข้อมูลไม่รองรับ
 * รันหลัง build โดยชี้ที่ preview server:  node scripts/verify-express.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';
import { gaId } from '../src/config.js';

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

// When the standalone /express landing is active, its public Product Truth
// must use the same per-SKU ship_label as the Website catalogue. This catches
// blanket 7–14 (or any other) copy drifting away from the actual SKU contract.
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const standaloneActive = (vercel.rewrites || []).some((rewrite) =>
  rewrite.source === '/express' && rewrite.destination === '/express/index.html');
standaloneActive
  ? bad('/express ยังถูก standalone landing ทับอยู่')
  : ok('/express ใช้ catalogue experience เดิม');
existsSync('public/express/index.html')
  ? bad('ไฟล์ standalone /express ยังอยู่และอาจแย่ง route เดิม')
  : ok('ไม่มีไฟล์ standalone ที่แย่ง route /express');
if (standaloneActive) {
  const landingPath = 'public/express/index.html';
  const truthPath = 'public/marketing-product-truth.js';
  if (!existsSync(landingPath) || !existsSync(truthPath)) {
    bad('standalone /express rewrite is active but its landing or Product Truth file is missing');
  } else {
    const truthSource = readFileSync(truthPath, 'utf8');
    const truthMatch = truthSource.match(/Object\.freeze\((\{[\s\S]*\})\);\s*$/);
    if (!truthMatch) {
      bad('public Marketing Product Truth is not parseable');
    } else {
      const truth = JSON.parse(truthMatch[1]);
      const rawBySku = new Map(raw.map((product) => [product.sku, product]));
      const drift = (truth.products || []).filter((product) =>
        rawBySku.get(product.sku)?.ship_label !== product.express_message);
      drift.length
        ? bad(`Product Truth ship_label drift: ${drift.map((product) => product.sku).join(', ')}`)
        : ok(`Product Truth ตรง ship_label ราย SKU ครบ ${truth.products.length} รายการ`);
    }
    const landingSource = readFileSync(landingPath, 'utf8');
    /ส่งภายใน\s*7[–-]14\s*วัน/.test(landingSource)
      ? bad('standalone landing hardcode 7–14 วันแบบเหมารวม')
      : ok('standalone landing ไม่เหมารวมว่า Express ทุก SKU ส่ง 7–14 วัน');
    const landingText = landingSource.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    /วันส่ง.{0,60}(?:จาก|ตาม|ตรวจจาก)\s*Product Master/i.test(landingText)
      ? bad('standalone landing อ้างวันส่งว่าเป็นข้อมูลจาก Product Master ทั้งที่ source คือ Website snapshot ราย SKU')
      : ok('standalone landing แยก authority ราคา/MOQ กับวันส่งถูกต้อง');
    landingSource.includes(`googletagmanager.com/gtag/js?id=${gaId}`) && landingSource.includes(`gtag('config','${gaId}'`)
      ? ok(`standalone landing ใช้ GA4 ID ตรง src/config.js (${gaId})`)
      : bad(`standalone landing ไม่มี GA4 ID จาก src/config.js (${gaId})`);
    /\bAW-\d+/i.test(landingSource)
      ? bad('standalone landing มี Google Ads AW tag ที่ยังไม่ยืนยัน')
      : ok('standalone landing ไม่มี Google Ads AW tag');
    landingSource.includes("track('express_rfq_click'") && landingSource.includes("track('add_to_quote'")
      ? ok('standalone landing มี event wiring สำหรับ Express CTA และ product RFQ')
      : bad('standalone landing ขาด event wiring สำหรับ Express CTA/RFQ');
  }
}

console.log(`\n🔍 ตรวจ ${BASE}/express  (ข้อมูลจริง: rush ${counts.rush} / ontime ${counts.ontime} / plan ${counts.plan})\n`);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.route('**/googletagmanager.com/**', (route) =>
  route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
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
const renderedLabels = new Map(await page.locator('.ecard').evaluateAll((cards) => cards.map((card) => [
  new URL(card.getAttribute('href'), location.href).pathname,
  (card.querySelector('.ebadge')?.textContent || '').replace('⚡', '').trim(),
])));
const labelDrift = ex.filter((product) =>
  renderedLabels.get(`/product/${product.slug || product.sku}`) !== product.ship_label);
labelDrift.length
  ? bad(`ป้ายวันส่งไม่ตรง ship_label: ${labelDrift.slice(0, 8).map((product) => product.sku).join(', ')}`)
  : ok(`ป้ายวันส่งตรง ship_label ราย SKU ครบ ${ex.length} รายการ`);

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

// 6. หมายเหตุชัดว่าเป็นช่วงคัดเบื้องต้นและต้องยืนยันคิวก่อนสั่ง
const body = await page.locator('body').innerText();
/ไม่ใช่ SLA/.test(body) && /ยืนยัน.{0,40}คิวจริงก่อนสั่ง/.test(body)
  ? ok('มีคำเตือน non-SLA และยืนยันคิวก่อนสั่ง')
  : bad('ขาดคำเตือน non-SLA หรือการยืนยันคิวก่อนสั่ง');
/ตอบกลับ.{0,20}2\s*ชม\.|Mockup ก่อนผลิตทุก/.test(body)
  ? bad('หน้า Express ยังมีคำรับประกัน 2 ชม. หรือ Mockup ทุกงานที่ไม่มีหลักฐานรองรับ')
  : ok('หน้า Express ไม่มีคำรับประกัน 2 ชม. หรือ Mockup ทุกงาน');

// 7. Attribution and non-PII Express event survive the restored SPA route
await page.goto(`${BASE}/express?gclid=qa-click&utm_source=google&utm_medium=cpc`, { waitUntil: 'domcontentloaded' });
const expressQuote = page.locator('[data-express-rfq="hero"]');
await expressQuote.waitFor({ state: 'visible' });
const quoteHref = await expressQuote.getAttribute('href');
const quoteUrl = new URL(quoteHref, BASE);
quoteUrl.searchParams.get('gclid') === 'qa-click' && quoteUrl.searchParams.get('utm_source') === 'google' && quoteUrl.searchParams.get('utm_medium') === 'cpc'
  ? ok('Express CTA เก็บ gclid/UTM ไปหน้า quote ครบ')
  : bad('Express CTA ทำ gclid/UTM หลุด');
await page.evaluate(() => { window.dataLayer = []; });
await expressQuote.click();
await page.waitForFunction(() => location.pathname === '/quote');
const trackedEvents = await page.evaluate(() => (window.dataLayer || []).map((entry) => Array.from(entry)));
const expressEvent = trackedEvents.find((entry) => entry[0] === 'event' && entry[1] === 'express_rfq_click');
expressEvent && !('gclid' in (expressEvent[2] || {}))
  ? ok('Express CTA ยิง express_rfq_click โดยไม่ส่ง click ID เข้า GA4')
  : bad('Express CTA ไม่ยิง event หรือส่ง click ID เข้า GA4');
const capturedAttribution = await page.locator('#quoteForm').evaluate((form) => ({
  gclid: form.elements.gclid.value,
  utmSource: form.elements.utm_source.value,
  utmMedium: form.elements.utm_medium.value,
}));
capturedAttribution.gclid === 'qa-click' && capturedAttribution.utmSource === 'google' && capturedAttribution.utmMedium === 'cpc'
  ? ok('ฟอร์ม quote รับ attribution ต่อจากหน้า Express ครบ')
  : bad('ฟอร์ม quote รับ attribution จากหน้า Express ไม่ครบ');

// Verify the standalone landing runtime separately. Vite preview resolves a
// directory index at /express/, while Vercel applies /express -> /express/index.html.
if (standaloneActive) {
  const trackingContext = await browser.newContext();
  await trackingContext.addInitScript(() => {
    window.__events = [];
    window.dataLayer = [];
    const originalPush = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = function (...items) {
      for (const item of items) window.__events.push(Array.from(item));
      return originalPush(...items);
    };
  });
  await trackingContext.route('**/googletagmanager.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await trackingContext.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const trackingPage = await trackingContext.newPage();
  await trackingPage.goto(`${BASE}/express/?gclid=qa-click&utm_source=google&utm_medium=cpc`, { waitUntil: 'networkidle' });
  const quoteLinks = trackingPage.locator('[data-quote-link], [data-product-rfq]');
  const attributionPreserved = (await quoteLinks.evaluateAll((links) => links.map((link) => {
    const url = new URL(link.getAttribute('href'), location.href);
    return url.searchParams.get('gclid') === 'qa-click' && url.searchParams.get('utm_source') === 'google' && url.searchParams.get('utm_medium') === 'cpc';
  }))).every(Boolean);
  attributionPreserved ? ok('standalone CTA เก็บ gclid/UTM ไปหน้า quote ครบ') : bad('standalone CTA ทำ gclid/UTM หลุด');

  await trackingPage.evaluate(() => { window.__events = []; });
  const heroCta = trackingPage.locator('[data-quote-link][data-placement="hero"]');
  await heroCta.evaluate((link) => link.addEventListener('click', (event) => event.preventDefault(), { once: true }));
  await heroCta.click();
  let tracked = await trackingPage.evaluate(() => window.__events);
  tracked.some((event) => event[0] === 'event' && event[1] === 'express_rfq_click' && event[2]?.placement === 'hero')
    ? ok('standalone hero CTA ยิง express_rfq_click')
    : bad('standalone hero CTA ไม่ยิง express_rfq_click');

  await trackingPage.evaluate(() => { window.__events = []; });
  const productCta = trackingPage.locator('[data-product-rfq]').first();
  await productCta.evaluate((link) => link.addEventListener('click', (event) => event.preventDefault(), { once: true }));
  await productCta.click();
  tracked = await trackingPage.evaluate(() => window.__events);
  const productSku = await productCta.getAttribute('data-product-rfq');
  const addToQuote = tracked.find((event) => event[0] === 'event' && event[1] === 'add_to_quote');
  addToQuote?.[2]?.sku === productSku && !('gclid' in (addToQuote?.[2] || {}))
    ? ok(`standalone product CTA ยิง add_to_quote แบบไม่ส่ง click ID (${productSku})`)
    : bad('standalone product CTA event ผิดหรือมี click ID ปน');
  await trackingContext.close();
}

await browser.close();
console.log(fails.length ? `\n❌ ไม่ผ่าน ${fails.length} ข้อ\n` : '\n✅ ผ่านทั้งหมด\n');
process.exit(fails.length ? 1 : 0);
