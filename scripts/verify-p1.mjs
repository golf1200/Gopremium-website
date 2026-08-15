// P1 verification for the production v2 homepage: canonical domain + GA4 plumbing.
// Run after build against a Vite preview server on BASE.
import { chromium } from 'playwright';
import { site, gaId } from '../src/config.js';

const BASE = process.env.BASE || 'http://localhost:5175';
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: Boolean(pass), detail });

const browser = await chromium.launch();
const context = await browser.newContext();
await context.addInitScript(() => {
  window.__events = [];
  window.dataLayer = [];
  const originalPush = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = function (...items) {
    for (const item of items) window.__events.push(Array.from(item));
    return originalPush(...items);
  };
  window.gtag = (...args) => window.__events.push(args);
});
await context.route('**/_vercel/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
await context.route('**/googletagmanager.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
await context.route('**/formspree.io/**', (route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));

const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
ok('1a. canonical follows config.siteUrl', canonical === site.siteUrl || canonical === `${site.siteUrl}/`, `canonical=${canonical}`);
const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
ok('1b. og:url follows config.siteUrl', ogUrl === `${site.siteUrl}/`, `og:url=${ogUrl}`);
ok('1c. no unreplaced __SITE_URL__ tokens', !(await page.content()).includes('__SITE_URL__'));

const gaScripts = await page.locator('script[src*="googletagmanager.com/gtag"]').count();
ok('2a. GA script presence follows gaId', gaId ? gaScripts > 0 : gaScripts === 0, `gaId="${gaId}" scripts=${gaScripts}`);

await page.evaluate(() => { window.__events = []; });
const lineLink = page.locator('a.line-fab[href*="lin.ee"]').first();
ok('2b. v2 LINE floating CTA exists', await lineLink.count() === 1);
if (await lineLink.count()) {
  await lineLink.evaluate((element) => element.addEventListener('click', (event) => event.preventDefault(), { once: true }));
  await lineLink.click({ force: true });
}
await page.waitForTimeout(100);
let events = await page.evaluate(() => window.__events);
const lineEvent = events.find((event) => event[0] === 'event' && event[1] === 'contact_line');
ok('2c. LINE click fires contact_line', Boolean(lineEvent), JSON.stringify(lineEvent?.[2] || null));

await page.evaluate(() => { window.__events = []; });
await page.locator('#qf-name').fill('Playwright P1');
await page.locator('#qf-email').fill('qa@example.com');
await page.locator('#quoteForm button[type="submit"]').click();
await page.waitForTimeout(500);
events = await page.evaluate(() => window.__events);
const leadEvent = events.find((event) => event[0] === 'event' && event[1] === 'generate_lead');
ok('3a. successful v2 RFQ fires generate_lead', Boolean(leadEvent), JSON.stringify(leadEvent?.[2] || null));
ok('3b. generate_lead tags source=v2_quote_form', leadEvent?.[2]?.source === 'v2_quote_form');
ok('3c. generate_lead carries a non-PII landing path', leadEvent?.[2]?.landing_path === '/');
ok('4. no console errors / page exceptions', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));

await browser.close();

let passed = 0;
console.log('\n================ P1 V2 VERIFICATION ================');
for (const result of results) {
  console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${result.name}${result.detail ? `  — ${result.detail}` : ''}`);
  if (result.pass) passed++;
}
console.log('----------------------------------------------------');
console.log(`${passed}/${results.length} checks passed`);
console.log('====================================================\n');
process.exit(passed === results.length ? 0 : 1);
