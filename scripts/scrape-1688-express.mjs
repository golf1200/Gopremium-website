// Scrape main-gallery product images from the 1688 offer links in the EXPRESS worklist.
// Worklist: scripts/express-1688-worklist.json  -> [{ sku, name, urls:[...] }]
// Uses the user's logged-in Chrome via CDP (http://localhost:9222).
// Human-in-the-loop: when a captcha appears, the script WAITS (polls) for the
// user to solve it manually in their Chrome window, then continues. Never bypasses it.
//
// Usage: node scripts/scrape-1688-express.mjs [--limit N] [--offset N]
//   Processes every SKU in the worklist that isn't already done in _manifest-express.json.
//   --limit N  : only process the first N of the (offset-sliced) worklist
//   --offset N : skip the first N worklist entries

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const getArg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LIMIT = parseInt(getArg('--limit', '9999'), 10);
const OFFSET = parseInt(getArg('--offset', '0'), 10);
const MAX_MAIN = 10;              // keep first N gallery images per SKU
const CAPTCHA_WAIT_MS = 240000;  // wait up to 4 min for manual solve
const DELAY_MIN = 20000, DELAY_MAX = 45000; // slow, human pacing -> fewer captchas
const REST_EVERY = 15, REST_MS = 90000;     // longer break every N SKUs
const rand = (a, b) => a + Math.floor(Math.random() * (b - a));

const OUT = path.join('scripts', 'raw-1688');
fs.mkdirSync(OUT, { recursive: true });
const manifestPath = path.join(OUT, '_manifest-express.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const save = () => fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
const log = (...a) => { console.log(...a); };

// --- build worklist -------------------------------------------------------
// Each entry's `urls` may contain array items that themselves hold several
// URLs glued together with whitespace/newlines. Flatten to tokens, then pick
// the FIRST 1688 offer link (this is a 1688 scraper); fall back to the very
// first token if no 1688 link is present.
const pick1688 = (urls) => {
  const tokens = (urls || [])
    .flatMap(u => String(u).split(/\s+/))
    .map(t => t.trim())
    .filter(t => /^https?:\/\//i.test(t));
  if (!tokens.length) return null;
  return tokens.find(t => /(^|\.)1688\.com\//i.test(t)) || tokens[0];
};

const wl = JSON.parse(fs.readFileSync(path.join('scripts', 'express-1688-worklist.json'), 'utf8'));
let list = wl
  .map(p => ({ sku: p.sku, name: p.name, offer: pick1688(p.urls) }))
  .filter(p => p.sku && p.offer);
list = list.slice(OFFSET, OFFSET + LIMIT);
log(`worklist: ${list.length} SKUs (offset=${OFFSET} limit=${LIMIT})`);

const cleanUrl = (u) => (u.startsWith('//') ? 'https:' + u : u)
  .replace(/\.(jpg|jpeg|png|webp)_.*$/i, '.$1')
  .replace(/_\d+x\d+[^/]*\.(jpg|jpeg|png|webp)$/i, '.$1');

async function extractGallery(page) {
  return await page.evaluate(() => {
    const collect = (strict) => {
      const out = [], seen = new Set();
      const ok = (u) => {
        if (!u) return null;
        u = u.startsWith('//') ? 'https:' + u : u;
        if (/\.(svg|gif)(\?|_|$)/i.test(u)) return null;               // icons/animations
        if (/(logo|icon|avatar|-tps-|\/tps\/|\/sns\/|\.mp4|\.webm)/i.test(u)) return null; // ui chrome + video files
        if (strict) { if (!/cbu01\.alicdn\.com\/img\/ibank\//.test(u)) return null; }        // clean product images
        else if (!/(cbu01\.alicdn\.com\/|img\.alicdn\.com\/imgextra\/)/i.test(u)) return null; // broader fallback host
        return u;
      };
      const add = (u) => { const c = ok(u); if (c && !seen.has(c)) { seen.add(c); out.push(c); } };
      const sel = '[class*="gallery"] img, [class*="Gallery"] img, [class*="preview"] img, [class*="thumb"] img, [class*="slider"] img, [class*="detail"] img';
      const gal = document.querySelectorAll(sel);
      (gal.length ? gal : document.querySelectorAll('img')).forEach(el => {
        add(el.currentSrc || el.src); add(el.getAttribute('data-src')); add(el.getAttribute('data-lazy-img'));
      });
      // video-aware: never take the <video> itself — use its poster frame instead, then rely on the still images
      document.querySelectorAll('video[poster]').forEach(v => add(v.getAttribute('poster')));
      return out;
    };
    let out = collect(true);                 // prefer clean cbu01 gallery
    if (out.length === 0) out = collect(false); // odd/video-first pages: widen host match
    return out;
  });
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { referer: 'https://detail.1688.com/' } });
  if (!res.ok) throw new Error('http ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error('too small ' + buf.length);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
const page = ctx.pages().find(p => /1688\.com/.test(p.url())) || ctx.pages()[0] || await ctx.newPage();

let done = 0, imgTotal = 0, captchaHits = 0, skipped = 0, seen = 0;
for (const p of list) {
  const sku = p.sku;
  const dir = path.join(OUT, sku);
  if (manifest[sku]?.ok && fs.existsSync(dir) && fs.readdirSync(dir).length) { log(`SKIP ${sku} (already done)`); continue; }

  seen++;
  if (seen > 1 && seen % REST_EVERY === 0) { log(`  ...resting ${REST_MS / 1000}s (every ${REST_EVERY} SKU)`); await page.waitForTimeout(REST_MS); }

  const offer = p.offer.split('?')[0];
  await page.waitForTimeout(rand(DELAY_MIN, DELAY_MAX)); // human-like pacing
  log(`\n[${done + 1}/${list.length}] ${sku} -> ${offer.slice(-30)}`);
  try {
    await page.goto(offer, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  } catch {}
  await page.waitForTimeout(2500);

  // captcha wait loop — never bypass; poll until the user solves it in their Chrome
  let t0 = Date.now(), warned = false;
  while (page.url().includes('/punish') || (await page.title()).includes('Captcha')) {
    if (!warned) { log(`  CAPTCHA_WAIT ${sku} >> solve the slider in your Chrome window`); captchaHits++; warned = true; }
    if (Date.now() - t0 > CAPTCHA_WAIT_MS) { log(`  captcha timeout, skipping ${sku}`); break; }
    await page.waitForTimeout(3000);
  }
  if (page.url().includes('/punish')) { manifest[sku] = { ok: false, reason: 'captcha-timeout' }; save(); skipped++; continue; }

  // human-like: scroll through the page so lazy gallery images load (also fixes many "no-images")
  await page.evaluate(async () => {
    for (let y = 0; y < 4200; y += 550) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 350 + Math.random() * 350)); }
    window.scrollTo(0, 0);
  }).catch(() => {});
  await page.waitForTimeout(1500);
  let urls = (await extractGallery(page)).map(cleanUrl);
  urls = [...new Set(urls)].slice(0, MAX_MAIN);
  if (!urls.length) { log(`  no images found for ${sku}`); manifest[sku] = { ok: false, reason: 'no-images' }; save(); skipped++; continue; }

  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const u of urls) {
    const fn = `${String(n + 1).padStart(2, '0')}.jpg`;
    try { const bytes = await download(u, path.join(dir, fn)); n++; imgTotal++; log(`  saved ${sku}/${fn} (${(bytes / 1024).toFixed(0)}kb)`); }
    catch (e) { log(`  fail ${u.slice(-40)}: ${e.message}`); }
  }
  manifest[sku] = { ok: n > 0, count: n, urls, name: p.name, offer, title: (await page.title()).slice(0, 60), at: new Date().toISOString().slice(0, 16) };
  save();
  done++;
}

log(`\n==== DONE: ${done} SKUs, ${imgTotal} images, ${captchaHits} captcha stops, ${skipped} skipped ====`);
await browser.close();
