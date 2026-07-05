// Before/after review: original Chinese/supplier raw  →  new GoPremium restyled,
// paired per image, for every SKU in the pick-list. Easy visual QA.
//   node scripts/build-compare-review.mjs --file scripts/_all.json --out scripts/raw-1688/_COMPARE.html
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const skus = JSON.parse(fs.readFileSync(arg('--file', 'scripts/_all.json'), 'utf8'));
const OUT = arg('--out', 'scripts/raw-1688/_COMPARE.html');
const TITLE = arg('--title', 'จีนดิบ → GoPremium');

const imgmap = JSON.parse(fs.readFileSync('src/data/product-images.generated.json', 'utf8'));
const pl = JSON.parse(fs.readFileSync('scripts/restyle-picklist.json', 'utf8'));

const TH = 150;
const thumb = async (p) => {
  if (!fs.existsSync(p)) return '';
  try { const b = await sharp(p).resize(TH, TH, { fit: 'cover' }).jpeg({ quality: 58 }).toBuffer(); return 'data:image/jpeg;base64,' + b.toString('base64'); }
  catch { return ''; }
};

let cards = '';
let n = 0;
for (const sku of skus) {
  const e = pl[sku]; if (!e) continue;
  const slug = (imgmap[sku] && imgmap[sku].base) || e.slug;
  const roles = Object.keys(e.picks); // square,02,03,...
  let rawRow = '', genRow = '';
  for (const role of roles) {
    const rawImg = await thumb(path.join('scripts/raw-1688', sku, e.picks[role]));
    const genImg = await thumb(path.join('public/images/products', slug, `${slug}-${role}.jpg`));
    rawRow += `<td><img src="${rawImg}"></td>`;
    genRow += `<td><img src="${genImg}" class=gen></td>`;
  }
  cards += `<div class=card>
    <div class=head><span class=sku>${sku}</span> <span class=nm>${e.note || ''}</span></div>
    <table>
      <tr><th>จีนดิบ</th>${rawRow}</tr>
      <tr><th class=g>GoPremium</th>${genRow}</tr>
    </table>
  </div>`;
  n++;
}

const css = `
 *{box-sizing:border-box}
 body{margin:0;background:#e9e7e1;font-family:system-ui,'Segoe UI',sans-serif;color:#13244a}
 header{background:#13244a;color:#fff;padding:20px 28px;position:sticky;top:0;z-index:5}
 header h1{margin:0;font-size:19px}header h1 b{color:#f4b223}
 header p{margin:5px 0 0;opacity:.8;font-size:12.5px}
 .wrap{max-width:1300px;margin:0 auto;padding:16px}
 .card{background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:14px;box-shadow:0 1px 8px rgba(19,36,74,.08)}
 .head{margin-bottom:8px}.sku{font-weight:800;color:#f4b223;font-size:14px}.nm{font-size:13px;color:#13244a}
 table{border-collapse:collapse}
 th{font-size:11px;color:#8a8d92;text-align:right;padding-right:10px;white-space:nowrap;vertical-align:middle;font-weight:600}
 th.g{color:#f4b223}
 td{padding:3px}
 td img{width:${TH}px;height:${TH}px;object-fit:cover;border-radius:7px;background:#f4f1ea;display:block}
 td img.gen{outline:2px solid #f4b223}
 @media(max-width:700px){td img{width:110px;height:110px}}
`;
const html = `<!doctype html><meta charset=utf8><title>${TITLE}</title><style>${css}</style>
<header><h1>GO <b>PREMIUM</b> — เทียบก่อน/หลัง: ${TITLE}</h1><p>${n} SKU · แถวบน = รูปดิบจากซัพจีน (มีตัวหนังสือจีน/ลายน้ำ) · แถวล่าง (กรอบทอง) = รูป GoPremium ที่ gen ใหม่</p></header>
<div class=wrap>${cards}</div>`;
fs.writeFileSync(OUT, html);
console.log(`wrote ${OUT} (${n} SKU, ${Math.round(fs.statSync(OUT).size / 1024 / 1024 * 10) / 10}MB)`);
