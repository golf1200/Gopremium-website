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

// 1. Home loads; nav order + labels are correct
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const order = await page.evaluate(() =>
  [...document.querySelectorAll('nav.nav > a, nav.nav > .mega-wrap > a.navlink')].map(e => e.textContent.trim()));
ok('1a. nav item #1 is หน้าแรก', order[0] === 'หน้าแรก', `got=${order[0]}`);
ok('1b. nav item #2 is ⚡ สินค้าส่งด่วน', order[1]?.includes('สินค้าส่งด่วน') && order[1]?.includes('⚡'), `got=${order[1]}`);
ok('1c. nav item #3 is the สินค้าทั้งหมด dropdown', order[2]?.includes('สินค้าทั้งหมด'), `got=${order[2]}`);
ok('1d. only ONE "สินค้าทั้งหมด" in nav (no duplicate)', order.filter(t => t.includes('สินค้าทั้งหมด')).length === 1, `count=${order.filter(t => t.includes('สินค้าทั้งหมด')).length}`);
const expHref = await page.locator('nav.nav > a', { hasText: 'สินค้าส่งด่วน' }).getAttribute('href');
ok('1e. สินค้าส่งด่วน links to #/express', expHref === '#/express', `href=${expHref}`);
const dropHref = await page.locator('.mega-wrap a.navlink').getAttribute('href');
ok('1f. สินค้าทั้งหมด dropdown trigger is clickable → #/all', dropHref === '#/all', `href=${dropHref}`);
const aboutHref = await page.locator('nav.nav > a', { hasText: 'เกี่ยวกับเรา' }).getAttribute('href');
ok('1g. เกี่ยวกับเรา links to #/about', aboutHref === '#/about', `href=${aboutHref}`);

// 5. Mega menu: opens on hover, stays interactive, category click navigates
const megaVis = async () => page.evaluate(() => {
  const m = document.querySelector('.mega'); const s = getComputedStyle(m);
  return s.visibility === 'visible' && +s.opacity > 0.9;
});
await page.hover('.mega-wrap a.navlink');
await page.waitForTimeout(120);
ok('5a. mega opens on hover (visible + opaque)', await megaVis());
ok('5b. transparent bridge over the gap exists (.mega::before)', await page.evaluate(() => getComputedStyle(document.querySelector('.mega'), '::before').content !== 'none'));
// move into the menu and click the first category — must navigate, not vanish
const firstCat = page.locator('#megaMenu a').first();
const catHref = await firstCat.getAttribute('href');
await firstCat.hover();
await page.waitForTimeout(60);
ok('5c. mega still visible after moving into it', await megaVis());
await firstCat.click();
await page.waitForTimeout(120);
const hashAfter = await page.evaluate(() => location.hash);
ok('5d. clicking a category navigates to it', hashAfter.startsWith('#/c/'), `hash=${hashAfter} target=${catHref}`);

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

// 6. Catalogue (สินค้าทั้งหมด) — new filters + AI filter
await page.goto(`${BASE}/#/all`, { waitUntil: 'networkidle' });
await page.waitForTimeout(150);
ok('6a. occasion filter group present', await page.locator('#occFilter button').count() >= 6);
ok('6b. budget (tier) filter group present', await page.locator('#tierFilter button').count() >= 5);
ok('6c. AI filter input present', await page.locator('#aifq').count() === 1);
const totalCount = await page.locator('#countLbl').innerText();

// budget filter by price (value = ไม่เกิน ฿60): every shown card price must be ≤ 60
await page.locator('#tierFilter button[data-tier="value"]').click();
await page.waitForTimeout(120);
const valuePrices = await page.evaluate(() => [...document.querySelectorAll('#grid .pcard .pprice')].map(e => parseInt(e.textContent.replace(/[^\d]/g, ''), 10)).filter(n => n > 0));
ok('6d. budget=value shows only ≤฿60 (derived from price)', valuePrices.length > 0 && valuePrices.every(p => p <= 60), `max=${Math.max(...valuePrices)} n=${valuePrices.length}`);
ok('6e. budget filter shows a removable chip', (await page.locator('#afchips .afchip').count()) >= 1);

// occasion filter narrows to mapped categories
await page.locator('#afchips [data-clr="all"]').click();
await page.waitForTimeout(80);
await page.locator('#occFilter button[data-occ="newyear"]').click();
await page.waitForTimeout(120);
const occCats = await page.evaluate(() => [...document.querySelectorAll('#grid .pcard .pchip')].map(e => e.textContent.trim()));
ok('6f. occasion=ปีใหม่ narrows results', occCats.length > 0 && occCats.length < 245);

// AI filter: "ของขวัญปีใหม่ งบ 100" → sets occasion + budget chips, results respect ≤100
await page.locator('#afchips [data-clr="all"]').click();
await page.waitForTimeout(80);
await page.fill('#aifq', 'ของขวัญปีใหม่พนักงาน งบ 100 กระบอกน้ำ');
await page.locator('.aifilter button').click();
await page.waitForTimeout(150);
const aiChips = await page.locator('#afchips .afchip').allInnerTexts();
const aiPrices = await page.evaluate(() => [...document.querySelectorAll('#grid .pcard .pprice')].map(e => parseInt(e.textContent.replace(/[^\d]/g, ''), 10)).filter(n => n > 0));
ok('6g. AI filter parsed budget (≤฿100)', aiPrices.length === 0 || aiPrices.every(p => p <= 100), `max=${aiPrices.length ? Math.max(...aiPrices) : 'n/a'}`);
ok('6h. AI filter set category chip (กระบอก→drinkware)', aiChips.some(c => c.includes('หมวด')), aiChips.join(' / '));
ok('6i. AI filter no console errors', consoleErrors.length === 0);

// 7. Home occasion tiles deep-link into the filtered catalogue (#/o/<key>)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(120);
const occLinks = await page.evaluate(() => [...document.querySelectorAll('a')].map(a => a.getAttribute('href')).filter(h => h && h.startsWith('#/o/')));
ok('7a. home has occasion deep-links (#/o/...)', occLinks.length >= 6, `n=${occLinks.length}`);
await page.goto(`${BASE}/#/o/newyear`, { waitUntil: 'networkidle' });
await page.waitForTimeout(150);
const occChip = await page.locator('#afchips .afchip').allInnerTexts();
ok('7b. #/o/newyear opens catalogue with occasion chip active', occChip.some(c => c.includes('โอกาส')), occChip.join(' / '));
const occBtnOn = await page.locator('#occFilter button[data-occ="newyear"].on').count();
ok('7c. occasion sidebar button reflects the route', occBtnOn === 1);

// 4. No console errors anywhere
ok('4. no console/page errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();
server.close();

let fail = 0;
for (const r of results) { if (!r.pass) fail++; console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.n}${r.d ? '  — ' + r.d : ''}`); }
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exit(fail ? 1 : 0);
