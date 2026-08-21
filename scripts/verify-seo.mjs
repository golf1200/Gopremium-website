// SEO verification for the production v2 SPA landing pages.
// Run after build against a Vite preview server on BASE.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:5173';
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
});
await context.route('**/_vercel/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
await context.route('**/googletagmanager.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));

const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => {
  if (message.type() !== 'error') return;
  const location = message.location();
  consoleErrors.push(`${message.text()}${location.url ? ` @ ${location.url}` : ''}`);
});
page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

const canonicalPath = async () => {
  const href = await page.locator('link[rel="canonical"]').getAttribute('href');
  return href ? new URL(href).pathname : '';
};
const hasJsonLdType = (type) => page.evaluate((expectedType) =>
  [...document.querySelectorAll('script[type="application/ld+json"]')].some((script) => {
    try { return JSON.stringify(JSON.parse(script.textContent)).includes(`"${expectedType}"`); }
    catch { return false; }
  }), type);

await page.goto(`${BASE}/occasion/new-year`, { waitUntil: 'domcontentloaded' });
const occasionH1 = (await page.locator('#app h1').first().innerText()).trim();
ok('A1. occasion landing has one keyword-focused h1', await page.locator('#app h1').count() === 1 && /ของขวัญ|พิมพ์โลโก้|ปีใหม่/.test(occasionH1), `h1="${occasionH1}"`);
ok('A2. occasion landing has product cards', await page.locator('#app a.pcard[href^="/product/"]').count() > 0);
ok('A3. occasion canonical resolves to the clean canonical slug', await canonicalPath() === '/occasion/newyear', `canonical=${await canonicalPath()}`);
ok('A4. occasion has BreadcrumbList JSON-LD', await hasJsonLdType('BreadcrumbList'));

await page.goto(`${BASE}/category/drinkware`, { waitUntil: 'domcontentloaded' });
ok('B1. category landing has exactly one h1', await page.locator('#app h1').count() === 1);
ok('B2. category landing has product cards', await page.locator('#app a.pcard[href^="/product/"]').count() > 0);
ok('B3. category canonical is clean', await canonicalPath() === '/category/drinkware', `canonical=${await canonicalPath()}`);
ok('B4. category has BreadcrumbList JSON-LD', await hasJsonLdType('BreadcrumbList'));

const moneyPages = [
  ['/category/powerbank', /พาวเวอร์แบงค์พรีเมี่ยม/, 'พาวเวอร์แบงค์พรีเมี่ยม'],
  ['/category/souvenir', /สั่งทำของชำร่วยองค์กร/, 'สั่งทำของชำร่วยองค์กร'],
  ['/category/umbrella', /ร่มพรีเมียม/, 'ร่มพรีเมียม'],
  ['/occasion/welcome', /ของขวัญต้อนรับพนักงานใหม่/, 'ของขวัญต้อนรับพนักงานใหม่'],
];
for (const [path, keyword, label] of moneyPages) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  const h1 = (await page.locator('#app h1').first().innerText()).trim();
  ok(`B5. ${label} landing aligns h1 + title`, keyword.test(h1) && keyword.test(await page.title()), `h1="${h1}" title="${await page.title()}"`);
  ok(`B6. ${label} landing has visible commercial intro`, (await page.locator('#app h1 + div p').first().innerText()).trim().length >= 80);
}

await page.goto(`${BASE}/occasion/newyear`, { waitUntil: 'domcontentloaded' });
ok('B7. 2027 seasonal landing is live before Q4', /ของขวัญปีใหม่บริษัท 2027/.test(await page.locator('#app h1').first().innerText()));
ok('B8. seasonal landing links to the 2027 buying timeline', await page.locator('a[href="/blog/ของขวัญปีใหม่บริษัท-2027"]').count() === 1);

await page.goto(`${BASE}/budget/premium`, { waitUntil: 'domcontentloaded' });
ok('C1. budget landing has exactly one h1', await page.locator('#app h1').count() === 1);
ok('C2. budget landing has product cards', await page.locator('#app a.pcard[href^="/product/"]').count() > 0);
ok('C3. budget canonical is clean', await canonicalPath() === '/budget/premium', `canonical=${await canonicalPath()}`);

await page.evaluate(() => { window.__events = []; });
await page.goto(`${BASE}/product/dw001`, { waitUntil: 'domcontentloaded' });
const events = await page.evaluate(() => window.__events);
const viewItem = events.find((event) => event[0] === 'event' && event[1] === 'view_item');
ok('D1. product page fires view_item with sku + category', viewItem?.[2]?.sku === 'DW001' && Boolean(viewItem?.[2]?.item_category), JSON.stringify(viewItem?.[2] || null));
ok('D2. product page has Product JSON-LD', await hasJsonLdType('Product'));
ok('D3. product canonical is clean', await canonicalPath() === '/product/dw001', `canonical=${await canonicalPath()}`);
const quoteCta = page.locator('.pd-cta a[href^="/quote?sku="]').first();
const quoteHref = await quoteCta.getAttribute('href');
ok('D4. product quote CTA carries the SKU', new URL(quoteHref, BASE).searchParams.get('sku') === 'DW001', `href=${quoteHref}`);
const staticProduct = readFileSync(new URL('../public/product/dw001/index.html', import.meta.url), 'utf8');
ok('D5. static product entry fires view_item', staticProduct.includes("gtag('event','view_item'") && staticProduct.includes('"sku":"DW001"'));
ok('D6. static product entry preserves ad attribution into quote', staticProduct.includes("'gp_attribution_v1'") && staticProduct.includes('data-product-quote'));

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
ok('E1. home has FAQPage JSON-LD', await hasJsonLdType('FAQPage'));
ok('E2. home renders the visible FAQ', await page.locator('#app .faq details').count() >= 6);
ok('E3. home has exactly one h1', await page.locator('#app h1').count() === 1);
ok('Z. no console errors across run', consoleErrors.length === 0, consoleErrors.slice(0, 6).join(' | '));

await browser.close();

let passed = 0;
console.log('\n================ SEO V2 VERIFICATION ================');
for (const result of results) {
  console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${result.name}${result.detail ? `  — ${result.detail}` : ''}`);
  if (result.pass) passed++;
}
console.log('-----------------------------------------------------');
console.log(`${passed}/${results.length} checks passed`);
console.log('=====================================================\n');
process.exit(passed === results.length ? 0 : 1);
