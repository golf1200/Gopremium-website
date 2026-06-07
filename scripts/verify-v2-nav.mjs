// Ad-hoc verification for v2.html nav changes: สินค้าส่งด่วน page + เกี่ยวกับเรา as its own page.
// Serves dist/ on a tiny static server and drives it with Playwright.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('dist');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.jpg':'image/jpeg', '.png':'image/png', '.xml':'application/xml', '.txt':'text/plain', '.svg':'image/svg+xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.statusCode = 404; return res.end('404'); }
  res.setHeader('Content-Type', MIME[path.extname(fp)] || 'application/octet-stream');
  fs.createReadStream(fp).pipe(res);
});
await new Promise(r => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}`;

const results = [];
const ok = (n, pass, d = '') => { results.push({ n, pass, d }); };

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

// 1. Home loads, nav has both new/updated links
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const navText = await page.locator('nav.nav').innerText();
ok('1a. nav has "สินค้าส่งด่วน"', navText.includes('สินค้าส่งด่วน'));
ok('1b. nav has "เกี่ยวกับเรา"', navText.includes('เกี่ยวกับเรา'));
const aboutHref = await page.locator('nav.nav a', { hasText: 'เกี่ยวกับเรา' }).getAttribute('href');
ok('1c. เกี่ยวกับเรา links to #/about (not scroll #about)', aboutHref === '#/about', `href=${aboutHref}`);
const expHref = await page.locator('nav.nav a', { hasText: 'สินค้าส่งด่วน' }).getAttribute('href');
ok('1d. สินค้าส่งด่วน links to #/express', expHref === '#/express', `href=${expHref}`);

// 2. About is its own page (top of page, has crumbs, story heading, NOT the home hero)
await page.goto(`${BASE}/#/about`, { waitUntil: 'networkidle' });
await page.waitForTimeout(150);
const aboutApp = await page.locator('#app').innerText();
ok('2a. /about shows crumb "เกี่ยวกับเรา"', aboutApp.includes('หน้าแรก') && aboutApp.includes('เกี่ยวกับเรา'));
ok('2b. /about shows brand story heading', aboutApp.includes('ประสบการณ์การให้'));
ok('2c. /about is a dedicated page (no home hero headline)', !aboutApp.includes('คือประสบการณ์ที่น่าจดจำ') && !(await page.locator('#app .hero').count()));
ok('2d. page scrolled to top (not mid-page)', (await page.evaluate(() => window.scrollY)) < 50);

// 3. Express page renders the service banner
await page.goto(`${BASE}/#/express`, { waitUntil: 'networkidle' });
await page.waitForTimeout(150);
const expApp = await page.locator('#app').innerText();
ok('3a. /express shows "สินค้าส่งด่วน 7–14 วัน"', expApp.includes('สินค้าส่งด่วน') && expApp.includes('7–14 วัน'));
ok('3b. /express shows service points', expApp.includes('ตอบกลับ') && expApp.includes('Mockup'));
ok('3c. /express has quote CTA', expApp.includes('ขอใบเสนอราคา'));

// 4. No console errors anywhere
ok('4. no console/page errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();
server.close();

let fail = 0;
for (const r of results) { if (!r.pass) fail++; console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.n}${r.d ? '  — ' + r.d : ''}`); }
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exit(fail ? 1 : 0);
