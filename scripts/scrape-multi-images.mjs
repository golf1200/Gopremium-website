// Multi-source product-image scraper.
// Pulls gallery/product images from whatever site a SKU's link points to —
// 1688, Shopee, or a supplier's own site (WooCommerce / WordPress / plain shop),
// with a best-effort pass for Facebook pages. Reuses the user's logged-in Chrome
// over CDP (http://localhost:9222) so anti-bot / login walls are handled by the
// human: when a captcha or login appears, the script waits (polls) while the user
// solves it in their Chrome window, then continues. Human-in-the-loop, never bypass.
//
// Images land in the SAME folder as the 1688 scraper so the downstream restyle
// pipeline picks them up unchanged:  scripts/raw-1688/<SKU>/<SKU>-NN.jpg
// Manifest entries gain a `source` field (1688 | shopee | generic | facebook | flipbook).
//
// Usage:
//   node scripts/scrape-multi-images.mjs                 # default: retry every SKU that still has no image
//   node scripts/scrape-multi-images.mjs --skus BK001,GD002,PB001
//   node scripts/scrape-multi-images.mjs --retry-failed  # only SKUs whose manifest is ok:false
//   node scripts/scrape-multi-images.mjs --source generic  # only one source type
//   node scripts/scrape-multi-images.mjs --force          # re-download even if already ok
//   node scripts/scrape-multi-images.mjs --dry            # list the worklist + detected source, download nothing

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const getArg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const has = (k) => args.includes(k);
const MAX_IMG = parseInt(getArg('--max', '10'), 10);
const ONLY_SKUS = (getArg('--skus', '') || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
const ONLY_SOURCE = getArg('--source', '');
const RETRY_FAILED = has('--retry-failed');
const FORCE = has('--force');
const DRY = has('--dry');
const CAPTCHA_WAIT_MS = 240000; // wait up to 4 min for a manual captcha/login solve

const OUT = path.join('scripts', 'raw-1688');
fs.mkdirSync(OUT, { recursive: true });
const manifestPath = path.join(OUT, '_manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const save = () => fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
const log = (...a) => console.log(...a);
const rand = (a, b) => a + Math.floor(Math.random() * (b - a));

// ---- source detection ------------------------------------------------------
function sourceOf(u) {
  if (/1688\.com|alibaba\.com/i.test(u)) return '1688';
  if (/shopee\./i.test(u)) return 'shopee';
  if (/facebook\.com|fb\.com|fb\.watch|fb\.me/i.test(u)) return 'facebook';
  if (/yunzhan365\.com|flipbook|book\d*\./i.test(u)) return 'flipbook';
  return 'generic';
}
// per-source pacing: heavy anti-bot hosts get slow, human-like pacing
const PACING = {
  '1688':    { min: 18000, max: 40000, captcha: true,  scroll: 4200 },
  shopee:    { min: 15000, max: 30000, captcha: true,  scroll: 5000 },
  generic:   { min: 2500,  max: 6000,  captcha: false, scroll: 3500 },
  facebook:  { min: 6000,  max: 12000, captcha: true,  scroll: 2500 },
  flipbook:  { min: 4000,  max: 8000,  captcha: false, scroll: 3000 },
};

// ---- worklist --------------------------------------------------------------
const cat = JSON.parse(fs.readFileSync(path.join('scripts', 'catalog-master.json'), 'utf8'));
const arr = Array.isArray(cat) ? cat : (cat.products || Object.values(cat).find(Array.isArray));
let list = arr.filter(p => p.link1688 && /^https?:/.test(p.link1688));

if (ONLY_SKUS.length) {
  list = list.filter(p => ONLY_SKUS.includes((p.sku || '').toUpperCase()));
} else if (RETRY_FAILED) {
  list = list.filter(p => manifest[p.sku] && manifest[p.sku].ok === false);
} else {
  // default: everything that still lacks a real image (never-done or previously failed)
  list = list.filter(p => !p.hasImage && manifest[p.sku]?.ok !== true);
}
if (ONLY_SOURCE) list = list.filter(p => sourceOf(p.link1688) === ONLY_SOURCE);

log(`worklist: ${list.length} SKUs`);
const bySrc = {};
for (const p of list) { const s = sourceOf(p.link1688); (bySrc[s] ||= []).push(p.sku); }
for (const [s, skus] of Object.entries(bySrc)) log(`  ${s.padEnd(9)} ${skus.length}  [${skus.join(', ')}]`);

if (DRY) { log('\n--dry: nothing downloaded.'); process.exit(0); }

// ---- 1688 extractor (clean cbu01 gallery, from the original scraper) --------
async function extract1688(page) {
  return await page.evaluate(() => {
    const collect = (strict) => {
      const out = [], seen = new Set();
      const ok = (u) => {
        if (!u) return null;
        u = u.startsWith('//') ? 'https:' + u : u;
        if (/\.(svg|gif)(\?|_|$)/i.test(u)) return null;
        if (/(logo|icon|avatar|-tps-|\/tps\/|\/sns\/|\.mp4|\.webm)/i.test(u)) return null;
        if (strict) { if (!/cbu01\.alicdn\.com\/img\/ibank\//.test(u)) return null; }
        else if (!/(cbu01\.alicdn\.com\/|img\.alicdn\.com\/imgextra\/)/i.test(u)) return null;
        return u;
      };
      const add = (u) => { const c = ok(u); if (c && !seen.has(c)) { seen.add(c); out.push(c); } };
      const sel = '[class*="gallery"] img, [class*="Gallery"] img, [class*="preview"] img, [class*="thumb"] img, [class*="slider"] img, [class*="detail"] img';
      const gal = document.querySelectorAll(sel);
      (gal.length ? gal : document.querySelectorAll('img')).forEach(el => {
        add(el.currentSrc || el.src); add(el.getAttribute('data-src')); add(el.getAttribute('data-lazy-img'));
      });
      document.querySelectorAll('video[poster]').forEach(v => add(v.getAttribute('poster')));
      return out;
    };
    let out = collect(true);
    if (out.length === 0) out = collect(false);
    return out.map(u => u.replace(/\.(jpg|jpeg|png|webp)_.*$/i, '.$1').replace(/_\d+x\d+[^/]*\.(jpg|jpeg|png|webp)$/i, '.$1'));
  });
}

// ---- generic extractor (supplier sites, WooCommerce, Shopee, most shops) ----
// Ranks candidates by real rendered area so hero/gallery shots beat icons.
async function extractGeneric(page) {
  return await page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
    const BAD = /(sprite|logo|icon|avatar|placeholder|loading|spinner|blank|favicon|badge|flag|payment|social|banner-?ad|pixel|1x1|chat|-404|_next\/static|\/static\/media\/|\/assets\/(ui|common)\/|\.svg(\?|$)|\.gif(\?|$)|^data:)/i;
    const results = new Map(); // key(base url) -> {url, area}
    const push = (u, area = 0) => {
      if (!u) return; u = abs(u); if (!u || !/^https?:/i.test(u)) return;
      if (BAD.test(u)) return;
      const key = u.split('?')[0];
      const prev = results.get(key);
      if (!prev || area > prev.area) results.set(key, { url: u, area });
    };
    const largestSrcset = (ss) => {
      if (!ss) return null;
      let best = null, bw = -1;
      ss.split(',').forEach(part => {
        const [url, d] = part.trim().split(/\s+/);
        const w = d ? (d.endsWith('w') ? parseInt(d) : d.endsWith('x') ? parseFloat(d) * 1000 : 0) : 0;
        if (url && w >= bw) { bw = w; best = url; }
      });
      return best;
    };
    // 1) social/product metadata — usually the clean hero shot
    document.querySelectorAll('meta[property="og:image"],meta[property="og:image:secure_url"],meta[name="og:image"],meta[name="twitter:image"],meta[itemprop="image"]')
      .forEach(m => push(m.content, 1_500_000));
    // 2) JSON-LD product images
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const imgs = [];
        (function walk(o) {
          if (!o) return;
          if (typeof o === 'string') { if (/^https?:.*\.(jpe?g|png|webp)/i.test(o)) imgs.push(o); return; }
          if (Array.isArray(o)) return o.forEach(walk);
          if (typeof o === 'object') { if (o.image) walk(o.image); if (o.contentUrl) walk(o.contentUrl); Object.values(o).forEach(v => v && typeof v === 'object' && walk(v)); }
        })(JSON.parse(s.textContent));
        imgs.forEach(u => push(u, 1_400_000));
      } catch {}
    });
    // 3) WooCommerce / lightbox full-size links
    document.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (h && /\.(jpe?g|png|webp)(\?|$)/i.test(h)) push(h, 1_300_000);
    });
    // 4) <img> tags, scored by rendered size
    document.querySelectorAll('img').forEach(el => {
      const area = (el.naturalWidth || 0) * (el.naturalHeight || 0);
      push(largestSrcset(el.getAttribute('srcset')), Math.max(area, 1000));
      push(el.currentSrc || el.src, area);
      push(el.getAttribute('data-src'), Math.max(area, 1000));
      push(el.getAttribute('data-lazy') || el.getAttribute('data-original') || el.getAttribute('data-image'), 1000);
    });
    // 5) CSS background images
    document.querySelectorAll('[style*="background"]').forEach(el => {
      const m = /url\(["']?(.*?)["']?\)/.exec(el.getAttribute('style') || '');
      if (m) push(m[1], 500);
    });
    // keep unknown-size (lazy) + anything >=~300x300; drop tiny known icons
    const out = [...results.values()].filter(x => x.area === 0 || x.area >= 90_000);
    out.sort((a, b) => b.area - a.area);
    return out.map(x => x.url);
  });
}

// ---- download --------------------------------------------------------------
async function download(url, dest, referer) {
  const res = await fetch(url, { headers: { referer, 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error('http ' + res.status);
  const ct = res.headers.get('content-type') || '';
  if (!/image\//i.test(ct) && !/\.(jpe?g|png|webp)/i.test(url)) throw new Error('not-image ' + ct);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error('too small ' + buf.length);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

// ---- main ------------------------------------------------------------------
// --standalone: launch our own chromium (for public supplier sites with no login/captcha).
// default: attach to the user's logged-in Chrome over CDP (needed for 1688/Shopee).
const STANDALONE = has('--standalone');
let browser, ctx, page;
if (STANDALONE) {
  browser = await chromium.launch({ headless: true });
  ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 1600 }, locale: 'th-TH',
  });
  page = await ctx.newPage();
} else {
  browser = await chromium.connectOverCDP('http://localhost:9222');
  ctx = browser.contexts()[0];
  if (!ctx) { log('No Chrome context on :9222 — open Chrome with --remote-debugging-port=9222 first (or use --standalone for public supplier sites).'); process.exit(1); }
  page = ctx.pages()[0] || await ctx.newPage();
}

let done = 0, imgTotal = 0, skipped = 0, seen = 0;
for (const p of list) {
  const sku = p.sku;
  const url = p.link1688;
  const src = sourceOf(url);
  const pace = PACING[src] || PACING.generic;
  const dir = path.join(OUT, sku);

  if (!FORCE && manifest[sku]?.ok && fs.existsSync(dir) && fs.readdirSync(dir).length) { log(`SKIP ${sku} (already done)`); continue; }

  seen++;
  await page.waitForTimeout(rand(pace.min, pace.max)); // per-source pacing
  log(`\n[${done + 1}/${list.length}] ${sku}  <${src}>  ${url.slice(0, 60)}`);

  try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); } catch (e) { log(`  nav warn: ${e.message}`); }
  await page.waitForTimeout(2500);

  // human-in-the-loop: wait while user clears a captcha / login wall
  if (pace.captcha) {
    const t0 = Date.now(); let warned = false;
    while (/\/punish|captcha|login|verify|checkpoint/i.test(page.url()) || /captcha|verify|robot/i.test((await page.title()).toLowerCase())) {
      if (!warned) { log(`  ⏳ CAPTCHA/LOGIN — solve it in your Chrome window for ${sku}...`); warned = true; }
      if (Date.now() - t0 > CAPTCHA_WAIT_MS) { log(`  captcha timeout, skipping ${sku}`); break; }
      await page.waitForTimeout(3000);
    }
    if (/\/punish|checkpoint/i.test(page.url())) { manifest[sku] = { ok: false, reason: 'captcha-timeout', source: src }; save(); skipped++; continue; }
  }

  // scroll so lazy gallery images load
  await page.evaluate(async (maxY) => {
    for (let y = 0; y < maxY; y += 550) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 300 + Math.random() * 300)); }
    window.scrollTo(0, 0);
  }, pace.scroll).catch(() => {});
  await page.waitForTimeout(1500);

  let urls = src === '1688' ? await extract1688(page) : await extractGeneric(page);
  urls = [...new Set(urls)].slice(0, MAX_IMG);
  if (!urls.length) { log(`  no images found for ${sku}`); manifest[sku] = { ok: false, reason: 'no-images', source: src }; save(); skipped++; continue; }

  const referer = new URL(url).origin + '/';
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const u of urls) {
    const fn = `${sku}-${String(n + 1).padStart(2, '0')}.jpg`;
    try { const bytes = await download(u, path.join(dir, fn), referer); n++; imgTotal++; log(`  saved ${fn} (${(bytes / 1024).toFixed(0)}kb)`); }
    catch (e) { log(`  fail ${u.slice(-46)}: ${e.message}`); }
  }
  manifest[sku] = n > 0
    ? { ok: true, count: n, urls, source: src, title: (await page.title()).slice(0, 60), at: new Date().toISOString().slice(0, 16) }
    : { ok: false, reason: 'download-failed', source: src };
  save();
  if (n > 0) done++; else skipped++;
}

log(`\n==== DONE: ${done} SKUs ok, ${imgTotal} images, ${skipped} skipped ====`);
log('Rebuild the review page:  node scripts/build-1688-review.mjs');
await browser.close();
