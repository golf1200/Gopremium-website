// Interactive, human-in-the-loop Facebook image grabber.
// FB pages are login-gated and their links often point at a whole Page/album,
// not one product — so this is deliberately MANUAL: you open the photo you want
// in your own logged-in Chrome, then press a key here to grab it. Never bypass FB.
//
// It reuses the user's Chrome over CDP (http://localhost:9222) and, for each SKU,
// navigates the tab to the FB link, then loops on your commands:
//   [Enter]  grab the BEST full-res photo currently on screen
//            (prefers FB's theater/lightbox image = true full resolution)
//   a        grab ALL large product photos currently visible
//   o        grab the og:image (page's primary photo)
//   u <url>  grab a specific image URL you paste (e.g. right-click > copy image address)
//   s        skip to the next SKU
//   q        quit
//
// Tip for best quality: CLICK a product photo so FB opens it full-screen (theater),
// then press Enter. Use the on-screen arrows to move to the next photo and Enter again.
//
// Images land in the same folder as the other scrapers so restyle picks them up:
//   scripts/raw-1688/<SKU>/<SKU>-NN.jpg   (manifest source: "facebook")
//
// Usage:
//   node scripts/fb-grab.mjs               # walk every FB-linked SKU with no image
//   node scripts/fb-grab.mjs --sku BG031   # just one

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const args = process.argv.slice(2);
const getArg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const ONLY = (getArg('--sku', '') || '').toUpperCase();

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
console.log(`Facebook grabber — ${list.length} SKU(s): ${list.map(p => p.sku).join(', ')}\n`);

// ---- extract candidate FB photo URLs currently in the DOM -------------------
// pri 100 = the open theater/lightbox image (full-res). Emoji/UI/profile dropped.
async function candidates(page) {
  return await page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
    const out = [];
    const isPhoto = (u) => /scontent[^/]*\.fbcdn\.net\/v\/t39\./i.test(u) && !/static\.xx\.fbcdn|emoji|\/rsrc\.php|safe_image|_nc_cat=1\b.*t39\.30808-1\//i.test(u);
    const idOf = (u) => (u.match(/\/(\d{6,})_/) || [])[1] || u.split('?')[0];
    const add = (src, w, h, pri) => {
      if (!src) return; src = abs(src); if (!src || !isPhoto(src)) return;
      out.push({ src, area: (w || 0) * (h || 0), pri: pri || 0, id: idOf(src) });
    };
    const th = document.querySelector('img[data-visualcompletion="media-vc-image"]');
    if (th) add(th.currentSrc || th.src, th.naturalWidth, th.naturalHeight, 100);
    document.querySelectorAll('img').forEach(el => add(el.currentSrc || el.src, el.naturalWidth, el.naturalHeight, 0));
    const og = document.querySelector('meta[property="og:image"]');
    if (og) add(og.content, 1200, 1600, 50);
    // keep the largest variant per photo id
    const best = new Map();
    for (const c of out) {
      const k = c.id;
      const prev = best.get(k);
      if (!prev || c.pri > prev.pri || (c.pri === prev.pri && c.area > prev.area)) best.set(k, c);
    }
    return [...best.values()].sort((a, b) => b.pri - a.pri || b.area - a.area);
  });
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { referer: 'https://www.facebook.com/', 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error('http ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error('too small ' + buf.length);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

const browser = await chromium.connectOverCDP('http://localhost:9222');
const ctx = browser.contexts()[0];
if (!ctx) { console.log('No Chrome on :9222 — launch Chrome with --remote-debugging-port=9222 and log into Facebook first.'); process.exit(1); }
const page = ctx.pages()[0] || await ctx.newPage();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

// per-SKU saver: continues numbering, skips photo ids already saved this SKU
function makeSaver(sku, dir) {
  const savedIds = new Set();
  let n = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.jpg$/i.test(f)).length : 0;
  return async (cands) => {
    let got = 0;
    for (const c of cands) {
      if (savedIds.has(c.id)) continue;
      fs.mkdirSync(dir, { recursive: true });
      const fn = `${sku}-${String(n + 1).padStart(2, '0')}.jpg`;
      try {
        const bytes = await download(c.src, path.join(dir, fn));
        savedIds.add(c.id); n++; got++;
        console.log(`   ✓ saved ${fn} (${(bytes / 1024).toFixed(0)}kb, ${c.area ? Math.round(Math.sqrt(c.area)) + 'px' : 'og'})`);
      } catch (e) { console.log(`   ✗ ${e.message}`); }
    }
    if (!got) console.log('   (nothing new grabbed — open/scroll to a product photo first)');
    return n;
  };
}

for (const p of list) {
  const sku = p.sku;
  const dir = path.join(OUT, sku);
  console.log(`\n=== ${sku} — ${p.name || ''} ===`);
  console.log(`    ${p.link1688}`);
  try { await page.goto(p.link1688, { waitUntil: 'domcontentloaded', timeout: 45000 }); } catch {}
  console.log('    Opened in your Chrome. Navigate to the product photo, then:');
  console.log('    [Enter]=grab best  a=grab all  o=og:image  u <url>=paste url  s=skip  q=quit');

  const saver = makeSaver(sku, dir);
  let total = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.jpg$/i.test(f)).length : 0;
  let quit = false;
  for (;;) {
    const cmd = (await ask(`  ${sku}> `)).trim();
    if (cmd === 'q') { quit = true; break; }
    if (cmd === 's') break;
    if (cmd === 'o') { total = await saver((await candidates(page)).filter(c => c.pri === 50)); }
    else if (cmd === 'a') { total = await saver(await candidates(page)); }
    else if (cmd.startsWith('u ')) { total = await saver([{ src: cmd.slice(2).trim(), area: 0, id: cmd }]); }
    else { const cs = await candidates(page); total = await saver(cs.slice(0, 1)); }
  }
  manifest[sku] = total > 0
    ? { ok: true, count: total, source: 'facebook', at: new Date().toISOString().slice(0, 16) }
    : { ok: false, reason: 'skipped-facebook', source: 'facebook' };
  save();
  console.log(`  -> ${sku}: ${total} image(s) saved.`);
  if (quit) break;
}

rl.close();
await browser.close();
console.log('\nDone. Rebuild review:  node scripts/build-1688-review.mjs');
