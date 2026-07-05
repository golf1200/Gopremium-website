// Self-contained review of a published batch: each SKU's restyled gallery + colour swatches.
//   node scripts/build-batch-review.mjs --file scripts/_batch1.json --title "Batch 1 — Bag"
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const skus = JSON.parse(fs.readFileSync(arg('--file', 'scripts/_batch1.json'), 'utf8'));
const TITLE = arg('--title', 'Batch review');
const OUTFILE = arg('--out', 'scripts/raw-1688/_batch-review.html');

const imgmap = JSON.parse(fs.readFileSync('src/data/product-images.generated.json', 'utf8'));
const colors = JSON.parse(fs.readFileSync('src/data/product-colors.generated.json', 'utf8'));
const pl = JSON.parse(fs.readFileSync('scripts/restyle-picklist.json', 'utf8'));

const thumb = async (p, px = 230) => {
  if (!fs.existsSync(p)) return '';
  const b = await sharp(p).resize(px, px, { fit: 'cover' }).jpeg({ quality: 72 }).toBuffer();
  return 'data:image/jpeg;base64,' + b.toString('base64');
};

let cards = '';
for (const sku of skus) {
  const rec = imgmap[sku]; if (!rec) continue;
  const name = (pl[sku] && pl[sku].note) || sku;
  const imgs = [];
  for (const g of rec.gallery) imgs.push(await thumb(path.join('public', g.replace(/^\//, ''))));
  const sw = (colors[sku] || []).map(c => `<span class=sw title="${c.name}" style="background:${c.hex}"></span>`).join('');
  cards += `<div class=card>
    <div class=head><span class=sku>${sku}</span><span class=nm>${name}</span></div>
    <div class=gal>${imgs.map((s, i) => `<img src="${s}"${i === 0 ? ' class=hero' : ''}>`).join('')}</div>
    <div class=colors><span class=clabel>สีที่มี (${(colors[sku] || []).length} สี)</span><div class=sws>${sw}</div></div>
  </div>`;
}

const css = `
 :root{--navy:#13244a;--gold:#f4b223}
 *{box-sizing:border-box}
 body{margin:0;background:#eceae4;font-family:system-ui,'Segoe UI',sans-serif;color:var(--navy)}
 header{background:var(--navy);color:#fff;padding:22px 30px}
 header h1{margin:0;font-size:20px}header h1 b{color:var(--gold)}
 header p{margin:6px 0 0;opacity:.8;font-size:13px}
 .grid{max-width:1180px;margin:0 auto;padding:18px;display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
 .card{background:#fff;border-radius:14px;padding:14px;box-shadow:0 2px 10px rgba(19,36,74,.08)}
 .head{display:flex;align-items:baseline;gap:10px;margin-bottom:10px}
 .sku{font-weight:800;color:var(--gold);font-size:14px}.nm{font-size:14px;font-weight:600}
 .gal{display:flex;gap:6px}
 .gal img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;background:#f4f1ea;flex:1}
 .gal img.hero{outline:2px solid var(--gold)}
 .colors{margin-top:10px;display:flex;align-items:center;gap:10px}
 .clabel{font-size:12px;color:#5b647a}
 .sws{display:flex;gap:6px}
 .sw{width:22px;height:22px;border-radius:50%;border:1px solid #d8d5cc;box-shadow:inset 0 0 0 2px #fff;display:inline-block}
 @media(max-width:760px){.grid{grid-template-columns:1fr}}
`;
const html = `<!doctype html><meta charset=utf8><title>${TITLE}</title><style>${css}</style>
<header><h1>GO <b>PREMIUM</b> — ${TITLE}</h1><p>${skus.length} SKU · รูปสตูดิโอ restyle + เพลตสี (hover วงสีเพื่อดูชื่อ) · ยังไม่ push ขึ้น live</p></header>
<div class=grid>${cards}</div>`;
fs.writeFileSync(OUTFILE, html);
console.log(`wrote ${OUTFILE} (${skus.length} SKU, ${Math.round(fs.statSync(OUTFILE).size / 1024)}KB)`);
