// ============================================================
// GO PREMIUM — 1688 assisted image scraper  (v3: robust candidate collector)
// Opens a REAL (visible) Chrome with a persistent profile. You solve the
// captcha / log in ONCE at the start; then it collects ALL candidate product
// photos into:  <product folder>/_candidates/<SKU>-cand-NN.jpg
// An AI pass (separate step) then picks the best 4 for the website.
//
// RUN IT YOURSELF (browser appears on your screen):
//     ! node scripts/scrape-1688.mjs            (all products needing images)
//     ! node scripts/scrape-1688.mjs 3          (first 3 only — test)
//     ! node scripts/scrape-1688.mjs 3 fresh    (re-collect even if done)
//
// Keep the Chrome window OPEN until you see "==== DONE ====".
// Safe to re-run — finished products are skipped (use "fresh" to redo).
// ============================================================
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'C:\\Users\\Golf\\Gopremium-website';
const MASTER = 'C:\\Users\\Golf\\Desktop\\Gopremium new version\\Product Master';
const PROFILE = join(ROOT, 'scripts', '.1688-profile');
const MAX_CANDIDATES = 16;
const args = process.argv.slice(2);
const LIMIT = parseInt(args.find((a) => /^\d+$/.test(a)) || '0', 10) || Infinity;
const FRESH = args.includes('fresh');

const rows = JSON.parse(readFileSync(join(ROOT, 'scripts', 'catalog-master.json'), 'utf8'));
const safe = (s) => (s || '').replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
const folderOf = (p) =>
  join(MASTER, safe(p.category) || 'Uncategorized', `${p.sku} - ${safe(p.name)}`.slice(0, 120));
const candDir = (p) => join(folderOf(p), '_candidates');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const imgCount = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f)).length : 0;

const targets = rows
  .filter((p) => !p.hasImage && p.hasLink)
  .filter((p) => FRESH || imgCount(candDir(p)) < 4)
  .slice(0, LIMIT);

console.log(`Products to collect candidates for: ${targets.length}${FRESH ? ' (fresh)' : ''}`);
if (targets.length === 0) { console.log('Nothing to do — all caught up.'); process.exit(0); }

// Block detection via URL/title (reliable; avoids false positives from page body)
const isBlocked = (page) => {
  try {
    const u = page.url();
    return /punish|x5secdata|sec\.taobao|login\.(1688|taobao)/i.test(u);
  } catch { return false; }
};
// "ready" = at least one real product image present in the DOM
const productReady = async (page) => {
  try {
    return await page.evaluate(() =>
      [...document.images].some((e) => /cbu01\.alicdn\.com/.test(e.currentSrc || e.src || ''))
    );
  } catch { return false; }
};

const fullSize = (u) => {
  let s = u.split('?')[0];
  s = s.replace(/(\.(jpg|jpeg|png|webp))_.*$/i, '$1');
  s = s.replace(/_\d+x\d+[^/]*(\.(jpg|jpeg|png|webp))$/i, '$2');
  return s;
};

let ctx, page;
try {
  ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: false, viewport: null, locale: 'zh-CN', args: ['--start-maximized'],
  });
  page = ctx.pages()[0] || (await ctx.newPage());
} catch (e) { console.log('Cannot launch browser:', e.message); process.exit(1); }

// logged-in detection: URL left the login page, OR a member cookie exists, OR
// a real product image is already visible.
const loginSignals = async () => {
  let url = '', names = [], unb = false;
  try { url = page.url(); } catch {}
  try {
    const cookies = await ctx.cookies('https://www.1688.com');
    names = cookies.map((c) => c.name);
    unb = cookies.some((c) => ['unb', 'lid', '_nk_', '_l_g_', 'munb', '_csg_ck_'].includes(c.name) && c.value);
  } catch {}
  const offLogin = /1688\.com/i.test(url) && !/login\.1688|signin|member\/signin|captcha|punish|x5sec/i.test(url);
  return { url, names, unb, offLogin };
};

// ---- STEP 1: log in to 1688 FIRST (before any scraping) ----
console.log('\n================ ขั้นตอนที่ 1: LOGIN ================');
console.log('กำลังเปิดหน้า login 1688 ... กรุณาล็อกอินให้เสร็จในหน้าต่าง Chrome');
console.log('  user: passiongrow01');
console.log('*** อย่าปิดหน้าต่าง Chrome จนกว่าจะเห็น "==== DONE ====" ***\n');
try { await page.goto('https://login.1688.com/member/signin.htm', { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch {}
await sleep(2500);

let waited = 0;
while (true) {
  const s = await loginSignals();
  if (s.unb || s.offLogin || (await productReady(page))) break;
  if (waited % 15 === 0) console.log(`\n   [diag] url=${s.url}\n          cookies=${s.names.join(',') || '(none)'}`);
  process.stdout.write('\r   >>> รอคุณล็อกอิน 1688 ในหน้าต่าง Chrome ให้เสร็จ ...           ');
  await sleep(3000); waited += 3;
  if (page.isClosed?.()) { console.log('\n   หน้าต่างถูกปิด — หยุด'); process.exit(1); }
  if (waited > 900) { console.log('\n   หมดเวลารอ login (15 นาที) — หยุด'); try { await ctx.close(); } catch {} process.exit(1); }
}
console.log('\n   ✓ ตรวจพบว่าล็อกอินแล้ว! เริ่มเก็บรูป...\n');
console.log('================ ขั้นตอนที่ 2: เก็บรูป ================');

const results = [];
let aborted = false;

for (let i = 0; i < targets.length && !aborted; i++) {
  const p = targets[i];
  const dir = candDir(p);
  try {
    if (FRESH && existsSync(dir)) rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    console.log(`\n[${i + 1}/${targets.length}] ${p.sku} — ${p.name}`);

    const seen = new Set();
    const onResp = (res) => {
      const u = res.url();
      if (/cbu01\.alicdn\.com\/.+\.(jpg|jpeg|png|webp)/i.test(u)) seen.add(fullSize(u));
    };
    page.on('response', onResp);

    try { await page.goto(p.link1688, { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch {}
    // re-challenge mid-run? wait it out
    let w = 0;
    while (!(await productReady(page)) && w < 300) {
      if (isBlocked(page)) process.stdout.write('\r   >>> เจอ captcha อีกครั้ง — แก้ในหน้าต่าง Chrome...   ');
      await sleep(3000); w += 3;
      if (page.isClosed?.()) throw new Error('window closed');
    }

    for (let y = 0; y < 6; y++) { await page.mouse.wheel(0, 1400); await page.waitForTimeout(450); }
    let domImgs = [];
    try {
      domImgs = await page.$$eval('img', (els) =>
        els.map((e) => ({ src: e.currentSrc || e.src || e.getAttribute('data-src') || '', nw: e.naturalWidth || 0, nh: e.naturalHeight || 0 }))
      );
    } catch {}
    page.off('response', onResp);

    const cand = new Map();
    for (const d of domImgs) {
      if (!/cbu01\.alicdn\.com\/.+\.(jpg|jpeg|png|webp)/i.test(d.src)) continue;
      const ar = d.nw && d.nh ? d.nw / d.nh : 1;
      cand.set(fullSize(d.src), ar);
    }
    for (const u of seen) if (!cand.has(u)) cand.set(u, 1);

    const urls = [...cand.entries()]
      .filter(([, ar]) => ar >= 0.45 && ar <= 2.2)
      .map(([u]) => u)
      .slice(0, MAX_CANDIDATES);

    let saved = 0;
    for (let n = 0; n < urls.length; n++) {
      const ext = (urls[n].match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'jpg').toLowerCase();
      const fname = `${p.sku}-cand-${String(n + 1).padStart(2, '0')}.${ext}`;
      try {
        const resp = await ctx.request.get(urls[n], { timeout: 30000 });
        if (resp.ok()) { const buf = await resp.body(); if (buf.length > 8000) { writeFileSync(join(dir, fname), buf); saved++; } }
      } catch {}
    }
    console.log(`   collected ${saved} candidate(s)`);
    results.push({ sku: p.sku, candidates: saved });
    await sleep(700 + (i % 3) * 300);
  } catch (e) {
    console.log(`   ! ${p.sku} error: ${e.message}`);
    if (/closed/i.test(e.message)) { aborted = true; console.log('   เบราว์เซอร์ถูกปิด — บันทึกความคืบหน้าแล้วหยุด'); }
  }
}

writeFileSync(join(ROOT, 'scripts', 'scrape-1688-results.json'), JSON.stringify(results, null, 2), 'utf8');
const ok = results.filter((r) => r.candidates >= 1).length;
console.log(`\n==== DONE ====`);
console.log(`Products with >=1 candidate: ${ok}/${results.length}`);
try { await ctx.close(); } catch {}
