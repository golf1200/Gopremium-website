// Build a self-contained contact-sheet review of scraped 1688 images (base64), grouped by SKU.
import fs from 'fs';
import path from 'path';

const OUT = path.join('scripts', 'raw-1688');
const manifest = JSON.parse(fs.readFileSync(path.join(OUT, '_manifest.json'), 'utf8'));
const cat = JSON.parse(fs.readFileSync(path.join('scripts', 'catalog-master.json'), 'utf8'));
const arr = Array.isArray(cat) ? cat : (cat.products || Object.values(cat).find(Array.isArray));
const nameOf = Object.fromEntries(arr.map(p => [p.sku, p.name || '']));

const skus = fs.readdirSync(OUT).filter(d => fs.statSync(path.join(OUT, d)).isDirectory()).sort();
let cards = '', totalImg = 0;
for (const sku of skus) {
  const dir = path.join(OUT, sku);
  const files = fs.readdirSync(dir).filter(f => /\.jpe?g$/i.test(f)).sort();
  if (!files.length) continue;
  let thumbs = '';
  for (const f of files) {
    const b64 = fs.readFileSync(path.join(dir, f)).toString('base64');
    thumbs += `<figure><img src="data:image/jpeg;base64,${b64}"><figcaption>${f}</figcaption></figure>`;
    totalImg++;
  }
  cards += `<section><h2>${sku} <small>${nameOf[sku] || ''}</small> <em>${files.length} รูป</em></h2><div class="grid">${thumbs}</div></section>`;
}

const html = `<!doctype html><html lang="th"><meta charset="utf-8">
<title>1688 scrape review — ${skus.length} SKU / ${totalImg} รูป</title>
<style>
body{font-family:'Segoe UI',Tahoma,sans-serif;margin:0;background:#f4f5f7;color:#1F3A5F}
header{background:#1F3A5F;color:#fff;padding:18px 24px;position:sticky;top:0;z-index:9}
header h1{margin:0;font-size:19px}header p{margin:4px 0 0;color:#F8D586;font-size:13px}
section{background:#fff;margin:16px;border-radius:10px;padding:14px 18px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
h2{font-size:16px;margin:0 0 12px;border-bottom:2px solid #F4BD44;padding-bottom:6px}
h2 small{color:#666;font-weight:400;font-size:13px}h2 em{float:right;color:#F4BD44;font-style:normal;font-size:13px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
figure{margin:0}figure img{width:100%;aspect-ratio:1;object-fit:contain;background:#fafafa;border:1px solid #eee;border-radius:6px}
figcaption{font-size:11px;color:#888;text-align:center;margin-top:2px}
</style>
<header><h1>🖼️ 1688 image scrape — review</h1><p>${skus.length} SKU · ${totalImg} รูป · เก็บเฉพาะแกลเลอรีหลัก (สูงสุด 10/SKU)</p></header>
${cards}
</html>`;

const dest = path.join(OUT, '_review.html');
fs.writeFileSync(dest, html);
console.log('wrote', dest, '-', skus.length, 'SKU,', totalImg, 'images');
