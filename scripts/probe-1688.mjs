// Feasibility probe: can a real headless browser get past 1688 anti-bot and
// extract product image URLs? Tests ONE offer.
import { chromium } from 'playwright';

const URL = process.argv[2] || 'https://detail.1688.com/offer/674035283676.html';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  locale: 'zh-CN',
  viewport: { width: 1366, height: 900 },
});
const page = await ctx.newPage();

let imgUrls = new Set();
page.on('response', (res) => {
  const u = res.url();
  if (/alicdn\.com\/.+\.(jpg|jpeg|png|webp)/i.test(u)) imgUrls.add(u.split('?')[0]);
});

let status = 'unknown';
try {
  const resp = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  const title = await page.title().catch(() => '');
  const bodyText = (await page.locator('body').innerText().catch(() => '')).slice(0, 200);
  const blocked = /punish|滑动|验证|captcha|x5sec|安全/i.test(await page.content());
  status = `HTTP ${resp?.status()} | title="${title}" | blocked=${blocked}`;
  console.log('PAGE:', status);
  console.log('BODY SNIPPET:', JSON.stringify(bodyText));
  // try to read <img> srcs too
  const domImgs = await page.$$eval('img', (els) =>
    els.map((e) => e.src || e.getAttribute('data-src') || '').filter((s) => /alicdn/.test(s))
  ).catch(() => []);
  domImgs.forEach((s) => imgUrls.add(s.split('?')[0]));
} catch (e) {
  console.log('NAV ERROR:', e.message);
}

console.log('\nImage URLs captured:', imgUrls.size);
[...imgUrls].slice(0, 12).forEach((u) => console.log('  ' + u));

await browser.close();
