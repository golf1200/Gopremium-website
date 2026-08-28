import { chromium } from 'playwright';

const BASE = process.env.REACT_BASE || process.env.BASE || 'http://127.0.0.1:5175';
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: Boolean(pass), detail });

const browser = await chromium.launch();
const context = await browser.newContext();
await context.route('**/_vercel/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
await context.route('**/googletagmanager.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));

const submitted = [];
await context.route('**/api/rfq', async (route) => {
  const payload = route.request().postDataJSON();
  submitted.push(payload);
  await new Promise((resolve) => setTimeout(resolve, 350));
  await route.fulfill({
    status: 202,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, status: 'processing', submission_id: payload.submission_id }),
  });
});

const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
const home = page.locator('#rfq');
await home.locator('input[placeholder*="คุณแป้ง"]').fill('React Home QA');
await home.locator('input[placeholder*="you@company.com"]').fill('qa@example.com');
await home.locator('input[type="checkbox"]').check();
const homeRequest = page.waitForRequest('**/api/rfq');
await home.locator('button.gp-btn-primary').click();
await homeRequest;

const homeLocked = await home.evaluate((section) => {
  const controls = [...section.querySelectorAll('input,select,textarea,button.gp-btn-primary')];
  const locked = controls.every((control) => control.disabled);
  const name = section.querySelector('input[placeholder*="คุณแป้ง"]');
  name.value = 'MUTATED HOME';
  name.dispatchEvent(new Event('input', { bubbles: true }));
  return locked;
});
ok('1a. React home locks every RFQ control while POST is active', homeLocked);
await page.waitForTimeout(500);
ok('1b. React home restores controlled value after an in-flight mutation', await home.locator('input[placeholder*="คุณแป้ง"]').inputValue() === 'React Home QA');
ok('1c. React home pending payload stays canonical', submitted[0]?.form_type === 'home_rfq' && submitted[0]?.contact?.name === 'React Home QA');
ok('1d. React home does not claim success for status=processing', await home.getByText('ได้รับคำขอแล้ว ขอบคุณค่ะ').count() === 0);

await page.evaluate(() => {
  localStorage.setItem('gp_quote_v1', JSON.stringify([{ sku: 'DW001', name: 'QA Drinkware', qty: 100 }]));
});
await page.goto(`${BASE}/quote`, { waitUntil: 'domcontentloaded' });
const quoteForm = page.locator('#quoteForm');
await quoteForm.locator('input[placeholder="ชื่อ-นามสกุล"]').fill('React Quote QA');
await quoteForm.locator('input[placeholder*="ชื่อบริษัท"]').fill('GO PREMIUM QA');
await quoteForm.locator('input[placeholder*="you@company.com"]').fill('qa@example.com');
await quoteForm.locator('input[type="date"]').fill('2026-09-30');
await quoteForm.locator('input[placeholder*="50,000"]').fill('50000');
await quoteForm.locator('input[type="checkbox"]').check();
const initialQty = await page.locator('#quote-grid input[type="number"]').inputValue();
const quoteRequest = page.waitForRequest('**/api/rfq');
await quoteForm.locator('button[type="submit"]').click();
await quoteRequest;

const quoteLocked = await page.locator('#quote-grid').evaluate((grid) => {
  const form = grid.querySelector('#quoteForm');
  const formControls = [...form.querySelectorAll('input:not([type="hidden"]),textarea,button[type="submit"]')];
  const cartControls = [...grid.querySelectorAll('input[type="number"],button')].filter((control) => !form.contains(control));
  const name = form.querySelector('input[placeholder="ชื่อ-นามสกุล"]');
  name.value = 'MUTATED QUOTE';
  name.dispatchEvent(new Event('input', { bubbles: true }));
  const plus = cartControls.find((control) => control.textContent.trim() === '+');
  if (plus) plus.click();
  return formControls.every((control) => control.disabled) && cartControls.every((control) => control.disabled);
});
ok('2a. React quote locks form and cart edits while POST is active', quoteLocked);
await page.waitForTimeout(500);
ok('2b. React quote restores controlled contact value', await quoteForm.locator('input[placeholder="ชื่อ-นามสกุล"]').inputValue() === 'React Quote QA');
ok('2c. React quote ignores in-flight cart edits', await page.locator('#quote-grid input[type="number"]').inputValue() === initialQty);
ok('2d. React quote pending payload matches the visible frozen state', submitted[1]?.form_type === 'quote_page' && submitted[1]?.contact?.name === 'React Quote QA' && submitted[1]?.rfq?.items?.[0]?.qty === initialQty);

await page.goto(`${BASE}/privacy`, { waitUntil: 'domcontentloaded' });
const privacy = page.locator('[data-privacy-version="2026-08-28"]');
const privacyText = await privacy.innerText();
ok('3a. React /privacy renders the current notice', await privacy.count() === 1 && privacyText.includes('Supabase') && privacyText.includes('Pipedrive') && privacyText.includes('นอกประเทศไทย') && privacyText.includes('ยังไม่ส่งผลการขาย'));
ok('3b. no console errors / page exceptions', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));

await browser.close();

let passed = 0;
console.log('\n============= REACT RFQ LOCK VERIFICATION =============');
for (const result of results) {
  if (result.pass) passed++;
  console.log(`${result.pass ? 'PASS' : 'FAIL'}  ${result.name}${result.detail ? ` — ${result.detail}` : ''}`);
}
console.log('--------------------------------------------------------');
console.log(`${passed}/${results.length} checks passed`);
console.log('========================================================\n');
process.exit(passed === results.length ? 0 : 1);
