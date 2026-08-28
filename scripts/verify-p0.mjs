// P0 acceptance verification for the production v2 homepage.
// Run after build against a Vite preview server on BASE.
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5175';
const HOME_URL = process.env.HOME_URL || `${BASE}/`;
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: Boolean(pass), detail });

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));
page.on('dialog', (dialog) => dialog.dismiss());

// Local preview does not provide Vercel telemetry. Keep the gate local and deterministic.
await context.route('**/_vercel/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
await context.route('**/googletagmanager.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));

let rfqHits = 0;
let formspreeHits = 0;
const rfqBodies = [];
await context.route('**/api/rfq', async (route) => {
  rfqHits++;
  const payload = route.request().postDataJSON();
  rfqBodies.push(payload);
  await new Promise((resolve) => setTimeout(resolve, 300));
  const processing = rfqHits === 1;
  await route.fulfill({
    status: processing ? 202 : 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, status: processing ? 'processing' : 'completed', submission_id: payload.submission_id, rfq_id: '7feee989-b36b-4893-bdec-72955fca398b' }),
  });
});
await context.route('**/formspree.io/**', (route) => { formspreeHits++; return route.abort(); });

// The production homepage is public/v2.html after postbuild-home.mjs.
const homeResponse = await page.goto(HOME_URL, { waitUntil: 'networkidle' });
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
ok('2b. incomplete form does not POST', rfqHits === 0, `hits=${rfqHits}`);
ok('2c. incomplete form exposes validation state', await page.locator('#qf-name[aria-invalid="true"]').count() === 1);
ok('2d. incomplete form requires explicit consent', await page.locator('#qf-consent[aria-invalid="true"]').count() === 1);
ok('2e. consent opens the current privacy route', await page.locator('#quoteForm a[href="/privacy"]').getAttribute('href') === '/privacy' && (await page.locator('#quoteForm').innerText()).includes('privacy-2026-08-28'));

await page.locator('#qf-name').fill('Playwright QA');
await page.locator('#qf-email').fill('qa@example.com');
await page.locator('#qf-consent').check();
await form.evaluate((element) => { element.requestSubmit(); element.requestSubmit(); });
const inFlightLock = await form.evaluate((element) => {
  const visibleControls = [...element.elements].filter((control) => control.type !== 'hidden');
  const allDisabled = visibleControls.every((control) => control.disabled);
  element.elements.name.value = 'MUTATED WHILE IN FLIGHT';
  element.elements.name.dispatchEvent(new Event('input', { bubbles: true }));
  return allDisabled;
});
ok('3a. every v2 form control locks while POST is active', inFlightLock);
await page.waitForTimeout(700);
ok('3b. double-submit fires one same-origin RFQ POST', rfqHits === 1, `hits=${rfqHits}`);
ok('3c. POST uses the canonical v1 contract', rfqBodies[0]?.contractVersion === 'rfq-attribution-v1' && rfqBodies[0]?.form_type === 'v2_quote_form');
ok('3d. POST carries contact only inside the protected canonical payload', rfqBodies[0]?.contact?.name === 'Playwright QA' && rfqBodies[0]?.contact?.email === 'qa@example.com');
ok('3e. in-flight mutation is restored to the pending payload value', await page.locator('#qf-name').inputValue() === 'Playwright QA');
ok('3f. canonical payload has consent, empty honeypot, submission_id and lead_id', rfqBodies[0]?.consent?.accepted === true && rfqBodies[0]?.honeypot === '' && Boolean(rfqBodies[0]?.submission_id) && Boolean(rfqBodies[0]?.lead_id));
ok('3g. browser never posts directly to Formspree', formspreeHits === 0, `hits=${formspreeHits}`);
ok('3h. status=processing does not show success', await page.locator('#qok.show').count() === 0);

await submit.click();
await page.waitForTimeout(700);
ok('3i. retry reuses submission_id and submitted_at', rfqHits === 2 && rfqBodies[1]?.submission_id === rfqBodies[0]?.submission_id && rfqBodies[1]?.submitted_at === rfqBodies[0]?.submitted_at);
ok('3j. success state is shown only after status=completed', await page.locator('#qok.show').count() === 1);

await page.locator('#qok button').click();
await page.locator('#qf-name').fill('Playwright QA 2');
await page.locator('#qf-email').fill('qa2@example.com');
await page.locator('#qf-consent').check();
await submit.click();
await page.waitForTimeout(700);
ok('3k. a new logical submission rotates submission_id', rfqHits === 3 && rfqBodies[2]?.submission_id !== rfqBodies[0]?.submission_id);

await page.locator('#footer a[href="/privacy"]').click();
await page.waitForTimeout(100);
const privacyText = await page.locator('[data-privacy-version="2026-08-28"]').innerText();
ok('3l. v2 /privacy route renders the current policy', new URL(page.url()).pathname === '/privacy' && privacyText.includes('Supabase') && privacyText.includes('Pipedrive') && privacyText.includes('นอกประเทศไทย') && privacyText.includes('ยังไม่ส่งผลการขาย'));
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
