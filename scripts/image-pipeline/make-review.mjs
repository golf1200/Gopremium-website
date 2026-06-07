// ============================================================
// GO PREMIUM — Image pipeline · make a SELF-CONTAINED review sheet
// Scans staged/<set>/ for images, embeds each as base64, writes
// review-standalone.html (opens anywhere, no sibling files needed).
//
// This is the default end-of-job deliverable for any image/mockup batch.
//
// Run:
//   node scripts/image-pipeline/make-review.mjs <set-name-or-dir> ["Title"]
//   e.g. node scripts/image-pipeline/make-review.mjs BG001-studio "กระเป๋าผ้า Classic — Studio set"
// ============================================================
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const STAGE = join(HERE, 'staged');

const arg = process.argv[2];
if (!arg) { console.log('usage: node make-review.mjs <set-name-or-dir> ["Title"]'); process.exit(0); }
const dir = isAbsolute(arg) ? arg : join(STAGE, arg);
if (!existsSync(dir) || !statSync(dir).isDirectory()) { console.error(`✗ not a dir: ${dir}`); process.exit(1); }
const title = process.argv[3] || basename(dir);

const MIME = { '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp' };
const imgs = readdirSync(dir)
  .filter((f) => MIME[extname(f).toLowerCase()])
  .sort();

if (!imgs.length) { console.error(`✗ no images in ${dir}`); process.exit(1); }

const cards = imgs.map((f) => {
  const b64 = readFileSync(join(dir, f)).toString('base64');
  const kb = (statSync(join(dir, f)).size / 1024).toFixed(0);
  const src = `data:${MIME[extname(f).toLowerCase()]};base64,${b64}`;
  return `  <figure><img src="${src}" alt="${f}"><figcaption><b>${f}</b><span>${kb} KB</span></figcaption></figure>`;
}).join('\n');

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — ${title}</title>
<style>
  :root{--navy:#1F3A5F}
  *{box-sizing:border-box}
  body{margin:0;background:#f3f1ec;color:var(--navy);font-family:"Segoe UI",system-ui,sans-serif}
  header{padding:26px 30px;background:#fff;border-bottom:1px solid #e6e2d8}
  h1{margin:0 0 4px;font-size:19px}
  header p{margin:0;color:#6b6457;font-size:13px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:18px;padding:26px 30px}
  figure{margin:0;background:#fff;border:1px solid #e6e2d8;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05)}
  figure img{display:block;width:100%;aspect-ratio:1;object-fit:cover}
  figcaption{padding:9px 13px;font-size:13px;display:flex;justify-content:space-between;align-items:center}
  figcaption span{color:#8a8273;font-size:12px}
</style></head><body>
<header><h1>${title}</h1><p>${imgs.length} ภาพ · ฝังรูปในไฟล์ (เปิดได้เลย ไม่ต้องมีรูปข้างๆ) · staged review</p></header>
<div class="grid">
${cards}
</div></body></html>`;

const out = join(dir, 'review-standalone.html');
writeFileSync(out, html);
console.log(`OK -> ${out} (${imgs.length} imgs, ${(Buffer.byteLength(html)/1024/1024).toFixed(1)}MB)`);
