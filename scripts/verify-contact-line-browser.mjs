import { chromium } from 'playwright';

const base = process.env.BASE || 'http://127.0.0.1:5175';
const browser = await chromium.launch();

try {
  const context = await browser.newContext();
  await context.route('**/googletagmanager.com/**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/javascript',
    body: '',
  }));

  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    sessionStorage.clear();
    window.__contactLineCalls = [];
    window.gtag = (...args) => window.__contactLineCalls.push(args);
    document.addEventListener('click', (event) => {
      if (event.target?.closest?.('a[href*="lin.ee"]')) event.preventDefault();
    }, true);
  });

  const lineLinks = page.locator('a[href*="lin.ee"]');
  const linkCount = await lineLinks.count();
  if (linkCount < 1) throw new Error('No LINE link was found on the homepage');

  await lineLinks.first().click();
  await lineLinks.first().click();

  const result = await page.evaluate(() => ({
    calls: window.__contactLineCalls.filter((args) => args[0] === 'event' && args[1] === 'contact_line'),
    sent: sessionStorage.getItem('gp_contact_line_sent_v1'),
    eventId: sessionStorage.getItem('gp_contact_line_event_id_v1'),
  }));

  if (result.calls.length !== 1) {
    throw new Error(`Expected one contact_line event after two clicks, received ${result.calls.length}`);
  }
  if (result.sent !== '1' || !result.eventId) {
    throw new Error('Session dedupe state or event_id was not persisted');
  }

  const payload = result.calls[0][2];
  if (payload.measurement_stage !== 'outbound_click' || payload.dedupe_scope !== 'browser_tab_session') {
    throw new Error('contact_line payload is missing the measurement metadata');
  }

  console.log(`PASS browser contact_line dedupe: ${linkCount} LINE link(s), two clicks, one event`);
} finally {
  await browser.close();
}
