// P0 acceptance verification — drives the real app in a headless browser.
// Run: node scripts/verify-p0.mjs  (dev server must be on BASE)
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5175';
const results = [];
const ok = (n, p, d = '') => results.push({ n, pass: p, d });

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

// Collect console errors + page exceptions across the whole run
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

// Mock Formspree so the submit-path test sends NO real email
let formspreeHits = 0;
let lastBody = null;
await ctx.route('**/formspree.io/**', async (route) => {
  formspreeHits++;
  try { lastBody = route.request().postDataJSON(); } catch { lastBody = route.request().postData(); }
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
});

// ---------- CHECK 4: /privacy direct load, not 404 ----------
await page.goto(`${BASE}/privacy`, { waitUntil: 'networkidle' });
const privacyH1 = (await page.locator('h1').first().innerText().catch(() => '')).trim();
ok('4a. /privacy direct load renders policy (not 404)',
  privacyH1.includes('นโยบายความเป็นส่วนตัว'), `h1="${privacyH1}"`);
const hasCompanyTax = await page.getByText('0105567196422').count();
ok('4b. /privacy shows company tax ID (COMPANY_INFO)', hasCompanyTax > 0);

// ---------- CHECK 4: footer privacy link navigates ----------
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const footerLink = page.locator('footer a[href="/privacy"]').first();
ok('4c. footer has /privacy link', await footerLink.count() > 0);
await footerLink.click();
await page.waitForURL('**/privacy');
ok('4d. footer link → /privacy (no 404)', page.url().endsWith('/privacy'));

// ---------- CHECK 3 + submit path: /quote ----------
await page.goto(`${BASE}/quote`, { waitUntil: 'networkidle' });
const qSubmit = page.getByRole('button', { name: /ส่งใบขอราคา/ });
ok('3a. /quote submit DISABLED before consent', await qSubmit.isDisabled());
await page.getByRole('checkbox').first().check();
ok('3b. /quote submit ENABLED after consent', await qSubmit.isEnabled());

// ---------- CHECK 3 + submit path: home RFQ ----------
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
// RFQ lives in an #rfq section on the home page
await page.locator('#rfq').scrollIntoViewIfNeeded().catch(() => {});
const rSubmit = page.locator('#rfq').getByRole('button', { name: /ส่งขอใบเสนอราคา|กำลังส่ง/ });
ok('3c. home RFQ submit DISABLED before consent', await rSubmit.isDisabled());
// fill required fields
await page.locator('#rfq input').first().fill('ทดสอบ Playwright');
await page.locator('#rfq input').nth(1).fill('golf1200s@gmail.com');
const rConsent = page.locator('#rfq input[type="checkbox"]').first();
await rConsent.check();
ok('3d. home RFQ submit ENABLED after consent', await rSubmit.isEnabled());

// ---------- CHECK 1 (client path): RFQ actually POSTs to Formspree ----------
await rSubmit.click();
await page.waitForTimeout(800);
ok('1a. RFQ submit fires Formspree POST', formspreeHits > 0, `hits=${formspreeHits}`);
ok('1b. POST body carries _subject + contact',
  !!(lastBody && lastBody._subject && lastBody['ติดต่อ']),
  lastBody ? `subject="${lastBody._subject}"` : 'no body');
// success screen shows after ok:true
const successShown = await page.getByText('ได้รับคำขอแล้ว').count();
ok('1c. RFQ shows success state on ok:true', successShown > 0);

// ---------- CHECK 5: console clean ----------
ok('5. no console errors / page exceptions', consoleErrors.length === 0,
  consoleErrors.slice(0, 5).join(' | '));

await browser.close();

// ---------- report ----------
let pass = 0;
console.log('\n================ P0 BROWSER VERIFICATION ================');
for (const r of results) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.n}${r.d ? `  — ${r.d}` : ''}`);
  if (r.pass) pass++;
}
console.log(`--------------------------------------------------------`);
console.log(`${pass}/${results.length} checks passed`);
console.log('========================================================\n');
process.exit(pass === results.length ? 0 : 1);
