// Inspect a 1688 page using the persisted (logged-in) profile, HEADLESS.
// Dumps every cbu01 image with size + position so we can find the main gallery.
import { chromium } from 'playwright';
import { join } from 'node:path';

const ROOT = 'C:\\Users\\Golf\\Gopremium-website';
const PROFILE = join(ROOT, 'scripts', '.1688-profile');
const URL = process.argv[2] || 'https://detail.1688.com/offer/802791009481.html';

const ctx = await chromium.launchPersistentContext(PROFILE, { headless: true, locale: 'zh-CN' });
const page = ctx.pages()[0] || (await ctx.newPage());
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);

const title = await page.title();
const blocked = /验证|captcha|拦截/i.test(title) || /x5sec|punish|滑动验证/i.test(await page.content());
console.log('title:', title, '| blocked:', blocked);
if (blocked) { console.log('STILL BLOCKED headless — need user session.'); await ctx.close(); process.exit(2); }

// scroll to trigger lazy loads
for (let y = 0; y < 6; y++) { await page.mouse.wheel(0, 1200); await page.waitForTimeout(500); }

const imgs = await page.$$eval('img', (els) =>
  els.map((e) => {
    const r = e.getBoundingClientRect();
    return {
      src: e.currentSrc || e.src || e.getAttribute('data-src') || '',
      cw: Math.round(r.width), ch: Math.round(r.height),
      nw: e.naturalWidth, nh: e.naturalHeight,
      top: Math.round(r.top + window.scrollY),
      cls: (e.className || '').toString().slice(0, 40),
      pcls: (e.parentElement?.className || '').toString().slice(0, 40),
    };
  })
);

const cbu = imgs.filter((i) => /cbu01\.alicdn\.com/.test(i.src));
console.log(`\ncbu01 images: ${cbu.length}`);
cbu.sort((a, b) => a.top - b.top).slice(0, 40).forEach((i) =>
  console.log(`top=${String(i.top).padStart(5)} disp=${i.cw}x${i.ch} nat=${i.nw}x${i.nh} pcls="${i.pcls}"\n   ${i.src}`)
);

await ctx.close();
