// Pull the permission-restricted Drive folders that the free download can't reach,
// using the user's LOGGED-IN Chrome over CDP (must be signed into Google in that
// window). Uses Drive's embeddedfolderview to list file ids, then fetches each
// file's high-res thumbnail (authenticated) — good enough as a gen source.
//   1) user starts Chrome:  --remote-debugging-port=9222 --user-data-dir=... , signs into Google
//   2) node scripts/drive-cdp-pull.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const db = JSON.parse(readFileSync(join(REPO, '../Demo/express-master-DB.json'), 'utf8'));
const FOLDERS = join(REPO, 'express-realphoto-2026/drive-raw/_folders');
const IMGEXT = /\.(jpg|jpeg|png|webp|jfif)$/i;
const fid = (l) => l.replace(/\/$/, '').split('/').pop().split('?')[0];
const imgcount = (d) => existsSync(d) ? readdirSync(d).filter(f => IMGEXT.test(f)).length : 0;

// SKUs whose Drive folder is still empty
const todo = [];
for (const p of db) for (const l of (p.img_link_drive || [])) {
  const id = fid(l), d = join(FOLDERS, id);
  if (imgcount(d) === 0) todo.push({ sku: p.sku, id, dir: d });
}
console.log(`Drive folders to pull via Chrome: ${todo.length}`);
if (!todo.length) process.exit(0);

let browser;
try { browser = await chromium.connectOverCDP('http://localhost:9222'); }
catch { console.error('✗ Chrome not on :9222 — start it with --remote-debugging-port=9222 and sign into Google.'); process.exit(1); }
const ctx = browser.contexts()[0];
const page = await ctx.newPage();

let ok = 0;
for (const { sku, id, dir } of todo) {
  try {
    await page.goto(`https://drive.google.com/embeddedfolderview?id=${id}#list`, { waitUntil: 'networkidle', timeout: 30000 });
    // file ids appear as entry-<id> anchors / flip-entry divs
    const ids = await page.evaluate(() => {
      const out = new Set();
      document.querySelectorAll('[id^="entry-"]').forEach(e => out.add(e.id.replace('entry-', '')));
      document.querySelectorAll('a[href*="/file/d/"]').forEach(a => {
        const m = a.href.match(/\/file\/d\/([-\w]{20,})/); if (m) out.add(m[1]);
      });
      return [...out];
    });
    if (!ids.length) { console.log(`  ${sku}: 0 files (login? empty?)`); continue; }
    mkdirSync(dir, { recursive: true });
    let n = 0;
    for (const f of ids) {
      const data = await page.evaluate(async (fileId) => {
        const r = await fetch(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`, { credentials: 'include' });
        if (!r.ok) return null;
        const b = await r.arrayBuffer();
        let s = ''; const u = new Uint8Array(b);
        for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
        return btoa(s);
      }, f);
      if (data && data.length > 800) { writeFileSync(join(dir, `${f}.jpg`), Buffer.from(data, 'base64')); n++; }
    }
    if (n) ok++;
    console.log(`  ${sku}: ${n}/${ids.length} imgs`);
  } catch (e) { console.log(`  ${sku}: ERR ${String(e.message).slice(0, 70)}`); }
}
console.log(`\ndone: ${ok}/${todo.length} folders pulled`);
await browser.close();
