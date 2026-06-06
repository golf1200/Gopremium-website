// Verify Tasks A/B/C — SEO landing content + analytics events + no console errors.
// Run: BASE=http://localhost:5173 node scripts/verify-seo.mjs
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5173';
const results = [];
const ok = (n, p, d = '') => results.push({ n, pass: p, d });

const browser = await chromium.launch();
const ctx = await browser.newContext();

// Stub gtag before app code (gaId empty → initGA won't override it).
await ctx.addInitScript(() => {
  window.__events = [];
  window.gtag = (...a) => window.__events.push(a);
});
await ctx.route('**/lin.ee/**', (r) => r.abort());
await ctx.route('**/formspree.io/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));

const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

const events = () => page.evaluate(() => window.__events.map((a) => ({ ev: a[1], p: a[2] })));
const reset = () => page.evaluate(() => { window.__events = []; });
const hasJsonLdType = (t) => page.evaluate((type) =>
  [...document.querySelectorAll('script[type="application/ld+json"]')]
    .some((s) => { try { return JSON.stringify(JSON.parse(s.textContent)).includes(`"${type}"`); } catch { return false; } }), t);

// ===== A: Occasion landing =====
await page.goto(`${BASE}/occasion/new-year`, { waitUntil: 'networkidle' });
const occH1 = (await page.locator('h1').first().innerText()).trim();
ok('A1. occasion h1 has keyword', /พิมพ์โลโก้|ราคาส่ง|ของขวัญ/.test(occH1), `h1="${occH1}"`);
ok('A2. occasion shows "สินค้าแนะนำสำหรับโอกาสนี้"', (await page.getByText('สินค้าแนะนำสำหรับโอกาสนี้').count()) > 0);
ok('A3. occasion has product cards', (await page.locator('a[href^="/product/"]').count()) > 0);
ok('A4. occasion has FAQ section', (await page.getByText('คำถามที่พบบ่อย').count()) > 0);
ok('A5. occasion has FAQPage JSON-LD', await hasJsonLdType('FAQPage'));
ok('A6. occasion fired select_occasion', (await events()).some((e) => e.ev === 'select_occasion' && e.p.slug === 'new-year'));

// ===== C: Category landing =====
await reset();
await page.goto(`${BASE}/category/drinkware`, { waitUntil: 'networkidle' });
ok('C1. category has intro + FAQ', (await page.getByText('คำถามที่พบบ่อย').count()) > 0);
ok('C2. category has FAQPage JSON-LD', await hasJsonLdType('FAQPage'));
ok('C3. category fired select_category', (await events()).some((e) => e.ev === 'select_category' && e.p.slug === 'drinkware'));
ok('C4. category has product cards', (await page.locator('a[href^="/product/"]').count()) > 0);

// ===== C: Budget landing =====
await reset();
await page.goto(`${BASE}/budget/premium`, { waitUntil: 'networkidle' });
ok('C5. budget has FAQ', (await page.getByText('คำถามที่พบบ่อย').count()) > 0);
ok('C6. budget fired select_budget', (await events()).some((e) => e.ev === 'select_budget' && e.p.slug === 'premium'));

// ===== B: view_item + add_to_quote =====
await reset();
await page.goto(`${BASE}/product/dw001`, { waitUntil: 'networkidle' });
ok('B1. view_item fired with sku+category', (await events()).some((e) => e.ev === 'view_item' && e.p.sku && e.p.category));
await reset();
await page.getByRole('button', { name: /เพิ่มในใบขอราคา/ }).first().click();
await page.waitForTimeout(200);
ok('B2. add_to_quote fired with sku', (await events()).some((e) => e.ev === 'add_to_quote' && e.p.sku));

// ===== B: ai_concierge_run =====
await reset();
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.locator('#ai').scrollIntoViewIfNeeded().catch(() => {});
await page.locator('#ai input').first().fill('ของขวัญปีใหม่ 100 ชิ้น');
await page.locator('#ai').getByRole('button', { name: /ให้ AI ช่วยคิด/ }).click();
await page.waitForTimeout(300);
ok('B3. ai_concierge_run fired', (await events()).some((e) => e.ev === 'ai_concierge_run'));

// ===== console clean =====
ok('Z. no console errors across run', consoleErrors.length === 0, consoleErrors.slice(0, 6).join(' | '));

await browser.close();

let pass = 0;
console.log('\n============ A/B/C VERIFICATION ============');
for (const r of results) { console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.n}${r.d ? `  — ${r.d}` : ''}`); if (r.pass) pass++; }
console.log('-------------------------------------------');
console.log(`${pass}/${results.length} checks passed`);
console.log('===========================================\n');
process.exit(pass === results.length ? 0 : 1);
