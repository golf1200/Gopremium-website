// Self-contained review of the FULL rolled-out gallery per product:
// cover (square) + cleaned #2..#n, grouped by SKU/category. Thumbnails are
// downscaled (~420px) so the single HTML stays light and opens fast.
//   node scripts/image-pipeline/make-gallery-review.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, 'staged', 'rollout');
const DATA = JSON.parse(readFileSync(join(HERE, '..', '..', 'src', 'data', 'product-images.generated.json'), 'utf8'));
const CATNAME = { BG:'Bag', DW:'Drinkware', ST:'Stationery', FN:'Mini Fan', UM:'Umbrella', GS:'Giftset', LS:'Lifestyle' };
const CATORDER = ['BG','DW','ST','FN','UM','GS','LS'];

async function thumb(file) {
  const buf = await sharp(file).resize(420, 420, { fit: 'cover' }).jpeg({ quality: 72, mozjpeg: true }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

const skus = Object.keys(DATA).sort((a, b) =>
  (CATORDER.indexOf(a.replace(/[0-9]+$/, '')) - CATORDER.indexOf(b.replace(/[0-9]+$/, ''))) || a.localeCompare(b));

let body = '', cur = null, nImg = 0, nSku = 0;
for (const sku of skus) {
  const base = DATA[sku].base;
  const dir = join(ROOT, base);
  if (!existsSync(dir)) continue;
  const cat = sku.replace(/[0-9]+$/, '');
  if (cat !== cur) { cur = cat; body += `<h2>${CATNAME[cat] || cat}</h2>`; }

  const files = readdirSync(dir).filter(f => /\.jpg$/i.test(f)).sort((a, b) =>
    (a.includes('-square') ? -1 : 0) - (b.includes('-square') ? -1 : 0) || a.localeCompare(b));
  if (!files.length) continue;
  nSku++;
  let cells = '';
  for (const f of files) {
    const isCover = f.includes('-square');
    const label = isCover ? 'ปก' : f.match(/-(\d{2})\.jpg$/i)?.[1] || '';
    const src = await thumb(join(dir, f));
    nImg++;
    cells += `<figure${isCover ? ' class="cover"' : ''}><img src="${src}" loading="lazy"><figcaption>${label}</figcaption></figure>`;
  }
  body += `<div class="sku"><div class="skuhead">${sku} <span>${base}</span></div><div class="row">${cells}</div></div>`;
}

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — Gallery clean review (${nSku} สินค้า / ${nImg} รูป)</title><style>
:root{--navy:#1F3A5F;--gold:#F4BD44}*{box-sizing:border-box}
body{margin:0;background:#f3f1ec;color:var(--navy);font-family:"Segoe UI",system-ui,sans-serif}
header{padding:22px 28px;background:#fff;border-bottom:1px solid #e6e2d8;position:sticky;top:0;z-index:5}
h1{margin:0 0 3px;font-size:18px}header p{margin:0;color:#6b6457;font-size:13px}
h2{margin:24px 28px 6px;font-size:15px;color:#8a7320;border-bottom:2px solid var(--gold);display:inline-block;padding:0 4px 2px}
.sku{padding:6px 28px 14px}
.skuhead{font-size:13.5px;font-weight:600;margin:6px 0}.skuhead span{color:#9a917f;font-weight:400;font-size:12px}
.row{display:flex;gap:10px;flex-wrap:wrap}
figure{margin:0;width:150px;background:#fff;border:1px solid #e6e2d8;border-radius:10px;overflow:hidden}
figure.cover{border-color:var(--gold);box-shadow:0 0 0 2px rgba(244,189,68,.35)}
figure img{display:block;width:100%;aspect-ratio:1;object-fit:cover}
figcaption{font-size:11px;text-align:center;padding:3px 0;color:#6b6457}
figure.cover figcaption{color:#8a7320;font-weight:600}
</style></head><body>
<header><h1>GO PREMIUM — รีวิวแกลเลอรีหลังคลีน</h1><p>${nSku} สินค้า · ${nImg} รูป · กรอบทอง = รูปปก (studio) · เลข = รูปแกลเลอรีที่คลีนแล้ว (ลบภาษาจีน/พื้นขาว) · ฝังรูปในไฟล์</p></header>
${body}</body></html>`;

const out = join(ROOT, 'review-gallery.html');
writeFileSync(out, html);
console.log(`OK -> ${out} (${nSku} SKUs, ${nImg} imgs, ${(Buffer.byteLength(html)/1024/1024).toFixed(1)}MB)`);
