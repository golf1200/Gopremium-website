// P1 verification — domain single-source injection + GA4 event plumbing.
// Run: node scripts/verify-p1.mjs   (dev server must be on BASE)
import { chromium } from 'playwright';
import { site, gaId } from '../src/config.js';

const BASE = process.env.BASE || 'http://localhost:5175';
const results = [];
const ok = (n, p, d = '') => results.push({ n, pass: p, d });

const browser = await chromium.launch();
const ctx = await browser.newContext();

// Capture gtag calls: pre-inject a stub BEFORE app code runs. Because gaId is
// empty, initGA() won't define window.gtag, so this stub stays and lets us
// observe that track() fires the right events through the real plumbing.
await ctx.addInitScript(() => {
  window.__events = [];
  window.gtag = (...args) => window.__events.push(args);
});

// Block real LINE navigation (target=_blank) so clicks don't hit the network.
await ctx.route('**/lin.ee/**', (r) => r.abort());
await ctx.route('**/line.me/**', (r) => r.abort());
// Mock Formspree so the lead test sends no real email.
await ctx.route('**/formspree.io/**', (r) =>
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));

const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
page.on('popup', (p) => p.close().catch(() => {}));

// ---------- ITEM 5: domain single-source injection ----------
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
ok('5a. canonical follows config.siteUrl', canonical === site.siteUrl || canonical === `${site.siteUrl}/`, `canonical=${canonical}`);
const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
ok('5b. og:url follows config.siteUrl', ogUrl === `${site.siteUrl}/`, `og:url=${ogUrl}`);
const htmlRaw = await page.content();
ok('5c. no unreplaced __SITE_URL__ tokens', !htmlRaw.includes('__SITE_URL__'));

// ---------- ITEM 6: GA loads only when gaId set ----------
const gaScript = await page.locator('script[src*="googletagmanager.com/gtag"]').count();
ok('6a. GA script NOT loaded while gaId empty', gaId ? gaScript > 0 : gaScript === 0, `gaId="${gaId}" scripts=${gaScript}`);

// ---------- ITEM 6: contact_line fires on LINE click (floating) ----------
// Floating bar only becomes interactive after scrolling > 400px.
await page.evaluate(() => window.scrollTo(0, 1200));
await page.waitForTimeout(400);
await page.evaluate(() => { window.__events = []; });
await page.locator('a[aria-label="แชต LINE GO PREMIUM"]').first().click({ noWaitAfter: true });
await page.waitForTimeout(200);
let evts = await page.evaluate(() => window.__events);
const lineEvt = evts.find((e) => e[0] === 'event' && e[1] === 'contact_line');
ok('6b. floating LINE click fires contact_line', !!lineEvt, JSON.stringify(lineEvt?.[2] || null));

// ---------- ITEM 6: generate_lead fires on RFQ success ----------
await page.evaluate(() => { window.__events = []; });
await page.locator('#rfq').scrollIntoViewIfNeeded().catch(() => {});
await page.locator('#rfq input').first().fill('ทดสอบ P1');
await page.locator('#rfq input').nth(1).fill('golf1200s@gmail.com');
await page.locator('#rfq input[type="checkbox"]').first().check();
await page.locator('#rfq').getByRole('button', { name: /ส่งขอใบเสนอราคา|กำลังส่ง/ }).click();
await page.waitForTimeout(700);
evts = await page.evaluate(() => window.__events);
const leadEvt = evts.find((e) => e[0] === 'event' && e[1] === 'generate_lead');
ok('6c. RFQ success fires generate_lead', !!leadEvt, JSON.stringify(leadEvt?.[2] || null));
ok('6d. generate_lead tags form=rfq', leadEvt?.[2]?.form === 'rfq');

// ---------- console clean ----------
ok('6e. no console errors / page exceptions', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));

await browser.close();

let pass = 0;
console.log('\n================ P1 VERIFICATION ================');
for (const r of results) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.n}${r.d ? `  — ${r.d}` : ''}`);
  if (r.pass) pass++;
}
console.log('-------------------------------------------------');
console.log(`${pass}/${results.length} checks passed`);
console.log('=================================================\n');
process.exit(pass === results.length ? 0 : 1);
