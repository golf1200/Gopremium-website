// P0 acceptance verification for the production v2 homepage.
// Run after build against a Vite preview server on BASE.
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5175';
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: Boolean(pass), detail });

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

// Local preview does not provide Vercel telemetry. Keep the gate local and deterministic.
await context.route('**/_vercel/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
await context.route('**/googletagmanager.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));

let formspreeHits = 0;
let lastBody = '';
await context.route('**/formspree.io/**', async (route) => {
  formspreeHits++;
  try { lastBody = JSON.stringify(route.request().postDataJSON()); }
  catch { lastBody = route.request().postData() || ''; }
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
});

// The production homepage is public/v2.html after postbuild-home.mjs.
const homeResponse = await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
ok('1a. homepage responds successfully', homeResponse?.ok(), `status=${homeResponse?.status()}`);
ok('1b. v2 footer renders', await page.locator('#footer').count() === 1);
ok('1c. footer carries the legal company tax ID', (await page.locator('#footer').innerText()).includes('0105567196422'));

const footerQuote = page.locator('#footer a[href="/quote"]').first();
ok('1d. footer has a quote CTA', await footerQuote.count() === 1);
if (await footerQuote.count()) {
  await footerQuote.click();
  await page.waitForURL('**/quote');
}
ok('1e. footer quote CTA opens /quote', new URL(page.url()).pathname === '/quote', `url=${page.url()}`);

const form = page.locator('#quoteForm');
ok('2a. /quote renders the v2 quote form', await form.count() === 1);
const submit = form.locator('button[type="submit"]');

// Invalid submission must stay local and show validation instead of sending a lead.
await submit.click();
await page.waitForTimeout(150);
ok('2b. incomplete form does not POST', formspreeHits === 0, `hits=${formspreeHits}`);
ok('2c. incomplete form exposes validation state', await page.locator('#qf-name[aria-invalid="true"]').count() === 1);

await page.locator('#qf-name').fill('Playwright QA');
await page.locator('#qf-email').fill('qa@example.com');
await submit.click();
await page.waitForTimeout(500);
ok('3a. valid quote form fires one mocked Formspree POST', formspreeHits === 1, `hits=${formspreeHits}`);
ok('3b. POST body carries the submitted contact', lastBody.includes('Playwright QA') && lastBody.includes('qa@example.com'));
ok('3c. success state is shown after ok:true', await page.locator('#qok.show').count() === 1);
ok('4. no console errors / page exceptions', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));

await browser.close();

let passed = 0;
console.log('\n================ P0 V2 VERIFICATION ================');
for (const result of results) {
  console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${result.name}${result.detail ? `  — ${result.detail}` : ''}`);
  if (result.pass) passed++;
}
console.log('----------------------------------------------------');
console.log(`${passed}/${results.length} checks passed`);
console.log('====================================================\n');
process.exit(passed === results.length ? 0 : 1);
