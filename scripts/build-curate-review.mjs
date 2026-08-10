// Build per-supplier review pages: CURRENT site gallery vs PROPOSED Drive set, per SKU.
// Thumbnails are downscaled+embedded so each page is small. Plus an index page.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'express-realphoto-2026');
const STAGED = join(DIR, 'staged-curate');
const PUB = join(ROOT, 'public', 'images', 'products');
const OUT = join(DIR, 'review'); mkdirSync(OUT, { recursive: true });

const data = JSON.parse(readFileSync(join(DIR, 'curate-master.json'), 'utf8'));
const master = data.master;

const thumbCache = new Map();
async function thumb(path) {
  if (thumbCache.has(path)) return thumbCache.get(path);
  try {
    const b = await sharp(path).resize(340, 340, { fit: 'inside' }).jpeg({ quality: 68 }).toBuffer();
    const uri = 'data:image/jpeg;base64,' + b.toString('base64');
    thumbCache.set(path, uri); return uri;
  } catch { return null; }
}
const slugCurrent = (slug) => {
  const d = join(PUB, slug);
  if (!existsSync(d)) return [];
  return readdirSync(d).filter(f => /\.jpg$/i.test(f) && !/pre-restyle|pre-curate/i.test(f))
    .sort((a, b) => (a.includes('square') ? -1 : b.includes('square') ? 1 : a.localeCompare(b)))
    .map(f => join(d, f));
};
const stagedFor = (sku) => {
  const d = join(STAGED, sku);
  if (!existsSync(d)) return [];
  return readdirSync(d).filter(f => /\.jpg$/i.test(f)).sort().map(f => join(d, f));
};

// group SKUs by supplier
const bySup = {};
for (const [sku, r] of Object.entries(master)) (bySup[r.supplier] = bySup[r.supplier] || []).push(sku);
const SUP_ID = {
  'เสื้อ สมานการ์เม้นท์': 'samarn-shirt', 'ขวด love bottle': 'love-bottle', 'Remax': 'remax',
  'กระเป๋า mpkj': 'mpkj-bags', 'PMK polomaker': 'pmk', 'โฮมสกีน hats': 'homescreen-hats',
  'ร่ม new fly': 'umbrella-newfly', 'ร่ม สิริบัวทอง': 'umbrella-siri',
  'ร่ม rakafactory': 'umbrella-raka', 'หมอน ผ้าห่ม pamatoy': 'pamatoy-lifestyle',
};
let _n = 0;
const supName = (s) => SUP_ID[s] || ('supplier-' + (++_n));

const CSS = `body{margin:0;background:#eceae4;font-family:"IBM Plex Sans Thai",system-ui;color:#13244a}
header{background:#13244a;color:#fff;padding:20px 26px}header h1{margin:0;font-size:18px}header h1 b{color:#f4b223}
header a{color:#f4b223}.row{background:#fff;border-radius:14px;margin:14px;padding:14px;box-shadow:0 2px 10px rgba(19,36,74,.08)}
.sku{font-weight:700;font-size:15px;margin-bottom:8px}.sku small{font-weight:400;color:#5b647a}
.cols{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}
.col{flex:1;min-width:320px}.col h4{margin:0 0 7px;font-size:12px;letter-spacing:.5px;text-transform:uppercase}
.cur h4{color:#9aa1b2}.new h4{color:#0a7a3f}
.strip{display:flex;gap:8px;flex-wrap:wrap}
figure{margin:0}figure img{width:150px;height:150px;object-fit:cover;border-radius:8px;display:block;background:#f4f1ea}
.new figure img{outline:2px solid #0a7a3f}figcaption{font-size:10px;color:#5b647a;text-align:center;margin-top:3px;max-width:150px}
.none{color:#b94a48;font-size:13px;padding:14px}.flag{background:#fff7e6;border-left:3px solid #f4b223;padding:6px 10px;font-size:12px;margin-top:8px;border-radius:4px}`;

async function buildSupplier(supplier, skus) {
  let rows = '';
  for (const sku of skus.sort()) {
    const r = master[sku];
    const cur = slugCurrent(r.slug), nw = stagedFor(sku);
    const curCells = cur.length ? (await Promise.all(cur.map(async p =>
      `<figure><img src="${await thumb(p)}"><figcaption>${p.split(/[\\/]/).pop()}</figcaption></figure>`))).join('')
      : '<div class="none">— ไม่มีรูปปัจจุบัน —</div>';
    const newCells = (await Promise.all(nw.map(async (p, i) => {
      const role = (r.images[i] && r.images[i].role) || '';
      return `<figure><img src="${await thumb(p)}"><figcaption>${i + 1}. ${role}</figcaption></figure>`;
    }))).join('');
    rows += `<div class="row"><div class="sku">${sku} · ${r.name} <small>(${r.nColors} สี)</small></div>
      <div class="cols"><div class="col cur"><h4>ปัจจุบันบนเว็บ (${cur.length})</h4><div class="strip">${curCells}</div></div>
      <div class="col new"><h4>เสนอใหม่จาก Drive (${nw.length})</h4><div class="strip">${newCells}</div></div></div></div>`;
  }
  const html = `<!doctype html><meta charset=utf-8><title>Review ${supplier}</title><style>${CSS}</style>
  <header><h1>GO <b>PREMIUM</b> — Review รูปสินค้าจริง · ${supplier} <a href="index.html">[← index]</a></h1></header>${rows}`;
  writeFileSync(join(OUT, `review-${supName(supplier)}.html`), html);
  return { supplier, file: `review-${supName(supplier)}.html`, n: skus.length };
}

const pages = [];
for (const [sup, skus] of Object.entries(bySup)) pages.push(await buildSupplier(sup, skus));

// index
const notCov = data.notCoveredSkus || [];
const idx = `<!doctype html><meta charset=utf-8><title>Curate Review — index</title><style>${CSS}
 .card{background:#fff;border-radius:12px;margin:12px;padding:14px}a{color:#13244a}ul{columns:3;font-size:13px}</style>
<header><h1>GO <b>PREMIUM</b> — Express รูปสินค้าจริง · Review (เลือกจาก Supplier Drive)</h1></header>
<div class="card"><b>สรุป:</b> เลือกรูปได้ ${data.counts.covered}/${data.counts.expressTotal} SKU · ${data.counts.totalImages} รูป · 🔴 ${notCov.length} SKU ต้องขอรูปซัพเพิ่ม</div>
<div class="card"><b>รีวิวทีละซัพ:</b><ul style="columns:2">${pages.map(p => `<li><a href="${p.file}">${p.supplier}</a> — ${p.n} SKU</li>`).join('')}</ul></div>
<div class="card"><b>🔴 SKU ที่ยังไม่มีรูปใน Drive (ต้องขอซัพ):</b><ul>${notCov.map(s => `<li>${s}</li>`).join('')}</ul></div>
<div class="card" style="font-size:12px;color:#5b647a"><b>หมายเหตุ:</b> รูปเสนอใหม่ = รูปจริงจากซัพ (อาจมีลายน้ำ/ตัวหนังสือ) — เลือกให้ "ถูกต้อง" ก่อน แล้ว Phase 4 (AI Flow) ค่อยลบลายน้ำ/แต่งให้สวยเข้าแคตตาล็อก</div>`;
writeFileSync(join(OUT, 'index.html'), idx);
console.log('wrote', pages.length, 'supplier pages + index ->', join(OUT, 'index.html'));
