// Build a self-contained review of all ROLLOUT main images (one per product),
// grouped by category. Scans staged/rollout/<base>/<base>-square.jpg.
//   node scripts/image-pipeline/make-rollout-review.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, 'staged', 'rollout');
const DATA = JSON.parse(readFileSync(join(HERE, '..', '..', 'src', 'data', 'product-images.generated.json'), 'utf8'));
// base -> SKU
const baseToSku = {}; for (const [sku, e] of Object.entries(DATA)) baseToSku[e.base] = sku;
const CATNAME = { BG:'Bag', DW:'Drinkware', ST:'Stationery', FN:'Mini Fan', UM:'Umbrella', GS:'Giftset', LS:'Lifestyle' };

const rows = [];
for (const base of readdirSync(ROOT)) {
  const dir = join(ROOT, base);
  if (!statSync(dir).isDirectory()) continue;
  const f = join(dir, `${base}-square.jpg`);
  if (!existsSync(f)) continue;
  const sku = baseToSku[base] || base.toUpperCase();
  const cat = sku.replace(/[0-9]+$/, '');
  const kb = (statSync(f).size / 1024).toFixed(0);
  const b64 = readFileSync(f).toString('base64');
  rows.push({ sku, cat, base, kb, src: `data:image/jpeg;base64,${b64}` });
}
const CATORDER = ['BG','DW','ST','FN','UM','GS','LS'];
rows.sort((a, b) => (CATORDER.indexOf(a.cat) - CATORDER.indexOf(b.cat)) || a.sku.localeCompare(b.sku));

let body = '';
let cur = null;
for (const r of rows) {
  if (r.cat !== cur) { if (cur !== null) body += '</div>'; cur = r.cat;
    body += `<h2>${CATNAME[r.cat] || r.cat} <small>(${rows.filter(x=>x.cat===r.cat).length})</small></h2><div class="grid">`; }
  body += `<figure><img src="${r.src}" alt="${r.sku}"><figcaption><b>${r.sku}</b><span>${r.kb} KB</span></figcaption></figure>`;
}
if (cur !== null) body += '</div>';

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — Studio mains (${rows.length} สินค้า)</title><style>
:root{--navy:#1F3A5F}*{box-sizing:border-box}body{margin:0;background:#f3f1ec;color:var(--navy);font-family:"Segoe UI",system-ui,sans-serif}
header{padding:24px 30px;background:#fff;border-bottom:1px solid #e6e2d8}h1{margin:0 0 4px;font-size:19px}header p{margin:0;color:#6b6457;font-size:13px}
h2{margin:26px 30px 0;font-size:16px}h2 small{color:#8a8273;font-weight:400}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;padding:14px 30px 8px}
figure{margin:0;background:#fff;border:1px solid #e6e2d8;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.05)}
figure img{display:block;width:100%;aspect-ratio:1;object-fit:cover}
figcaption{padding:8px 12px;font-size:13px;display:flex;justify-content:space-between;align-items:center}figcaption span{color:#8a8273;font-size:12px}
</style></head><body>
<header><h1>GO PREMIUM — Studio main images (รูปหลัก 1 ใบ/สินค้า)</h1><p>${rows.length} สินค้า · จัดกลุ่มตามหมวด · ฝังรูปในไฟล์ (เปิดได้เลย) · staged review ก่อนเผยแพร่</p></header>
${body}</body></html>`;

const out = join(ROOT, 'review-mains.html');
writeFileSync(out, html);
console.log(`OK -> ${out} (${rows.length} products, ${(Buffer.byteLength(html)/1024/1024).toFixed(1)}MB)`);
