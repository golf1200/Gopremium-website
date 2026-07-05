// Automated Facebook product-photo scraper — FULL RESOLUTION, no login required.
//
// How it works (discovered by inspecting real public business-page posts):
//   1. Load the post/page in a headless browser, scroll so photos lazy-load.
//   2. Harvest each photo's permalink  (a[href*="/photo"]  ->  fbid + set).
//   3. Visit each permalink: the theater/lightbox <img data-visualcompletion=
//      "media-vc-image"> loads the FULL-RES file (e.g. 1494x2048) into the DOM
//      even behind the login overlay — the feed only ever shows a ~590px crop
//      (FB's ctp=s590x590), the permalink serves ctp=s1494x2048.
//   4. Download each full-res image (referer facebook.com).
//   Falls back to the ~590px feed images / og:image if no permalinks are found.
//
// This launches its OWN chromium (no CDP, no dependency on your Chrome). Works on
// public Pages/posts. If a specific post is friends-only, it will fall back or
// return nothing — then use fb-grab.mjs with your logged-in Chrome instead.
//
// Usage:
//   node scripts/fb-scrape.mjs                 # every FB-linked SKU with no image
//   node scripts/fb-scrape.mjs --sku BG031
//   node scripts/fb-scrape.mjs --max 8 --headed   # watch it work / debug login walls

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const getArg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const ONLY = (getArg('--sku', '') || '').toUpperCase();
const MAX_PHOTOS = parseInt(getArg('--max', '10'), 10);
const HEADED = args.includes('--headed');

const OUT = path.join('scripts', 'raw-1688');
fs.mkdirSync(OUT, { recursive: true });
const manifestPath = path.join(OUT, '_manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const save = () => fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));

const cat = JSON.parse(fs.readFileSync(path.join('scripts', 'catalog-master.json'), 'utf8'));
const arr = Array.isArray(cat) ? cat : (cat.products || Object.values(cat).find(Array.isArray));
const isFB = (u) => /facebook\.com|fb\.com|fb\.watch/i.test(u || '');
let list = arr.filter(p => isFB(p.link1688));
if (ONLY) list = list.filter(p => (p.sku || '').toUpperCase() === ONLY);
else list = list.filter(p => !p.hasImage && manifest[p.sku]?.ok !== true);
if (!list.length) { console.log('No Facebook SKUs to do.'); process.exit(0); }
console.log(`fb-scrape — ${list.length} SKU(s): ${list.map(p => p.sku).join(', ')}`);

const idOf = (u) => (u.match(/\/(\d{6,})_/) || u.match(/fbid=(\d+)/) || [])[1] || u.split('?')[0];

async function download(url, dest) {
  const res = await fetch(url, { headers: { referer: 'https://www.facebook.com/', 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error('http ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error('too small ' + buf.length);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

const browser = await chromium.launch({ headless: !HEADED });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 1600 },
  locale: 'th-TH',
});
const page = await ctx.newPage();

// harvest photo permalinks (+ feed images as fallback) from a post/page
async function harvest(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await page.evaluate(async () => { for (let y = 0; y < 3000; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 350)); } window.scrollTo(0, 0); }).catch(() => {});
  await page.waitForTimeout(1200);
  return await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[href*="/photo"]')].map(a => a.href)
      .filter(h => /fbid=\d+/.test(h)).filter((v, i, s) => s.indexOf(v) === i);
    const feed = [...document.querySelectorAll('img')].map(el => ({ src: el.currentSrc || el.src, a: (el.naturalWidth || 0) * (el.naturalHeight || 0) }))
      .filter(x => /scontent[^/]*\.fbcdn\.net\/v\/t39\.30808-6/.test(x.src))
      .sort((a, b) => b.a - a.a).map(x => x.src);
    const og = document.querySelector('meta[property="og:image"]')?.content || null;
    return { links, feed, og };
  });
}

// open a photo permalink and read its full-res theater image url
async function fullRes(permalink) {
  await page.goto(permalink, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1800);
  return await page.evaluate(() => {
    const vc = document.querySelector('img[data-visualcompletion="media-vc-image"]');
    if (vc && vc.src) return { url: vc.currentSrc || vc.src, w: vc.naturalWidth, h: vc.naturalHeight };
    const big = [...document.querySelectorAll('img')].map(el => ({ src: el.currentSrc || el.src, w: el.naturalWidth, h: el.naturalHeight }))
      .filter(x => /t39\.30808-6/.test(x.src)).sort((a, b) => b.w * b.h - a.w * a.h)[0];
    return big ? { url: big.src, w: big.w, h: big.h } : null;
  });
}

let okSku = 0, imgTotal = 0;
for (const p of list) {
  const sku = p.sku, dir = path.join(OUT, sku);
  console.log(`\n=== ${sku}  ${p.link1688}`);
  const { links, feed, og } = await harvest(p.link1688);
  console.log(`  found ${links.length} photo permalink(s), ${feed.length} feed image(s)`);

  // collect (url, dims) — prefer full-res via permalinks; fall back to feed/og
  const picks = []; const seen = new Set();
  if (links.length) {
    for (const link of links.slice(0, MAX_PHOTOS)) {
      const r = await fullRes(link);
      if (r && r.url) { const id = idOf(r.url); if (!seen.has(id)) { seen.add(id); picks.push(r); } }
      await page.waitForTimeout(700);
    }
  }
  if (!picks.length) { // fallback
    for (const src of [...feed, ...(og ? [og] : [])].slice(0, MAX_PHOTOS)) { const id = idOf(src); if (!seen.has(id)) { seen.add(id); picks.push({ url: src, w: 0, h: 0 }); } }
  }

  if (!picks.length) { console.log('  no images (likely login-gated) — use fb-grab.mjs with your Chrome'); manifest[sku] = { ok: false, reason: 'no-images', source: 'facebook' }; save(); continue; }

  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const pk of picks) {
    const fn = `${sku}-${String(n + 1).padStart(2, '0')}.jpg`;
    try { const bytes = await download(pk.url, path.join(dir, fn)); n++; imgTotal++; console.log(`  ✓ ${fn}  ${pk.w ? pk.w + 'x' + pk.h : '~feed'}  (${(bytes / 1024).toFixed(0)}kb)`); }
    catch (e) { console.log(`  ✗ ${e.message}`); }
  }
  manifest[sku] = n > 0 ? { ok: true, count: n, source: 'facebook', at: new Date().toISOString().slice(0, 16) } : { ok: false, reason: 'download-failed', source: 'facebook' };
  save();
  if (n > 0) okSku++;
}

console.log(`\n==== DONE: ${okSku}/${list.length} SKUs, ${imgTotal} images ====`);
console.log('Rebuild review:  node scripts/build-1688-review.mjs');
await browser.close();
