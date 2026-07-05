// Self-contained before/after review for the raw-1688 restyle pilot.
//   node scripts/build-1688-pilot-review.mjs BG017 DW012 BG031
import fs from 'fs';
const skus = process.argv.slice(2).length ? process.argv.slice(2) : ['BG017', 'DW012', 'BG031'];
const b64 = (p) => fs.existsSync(p) ? 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64') : '';
const firstRaw = (s) => {
  const d = `scripts/raw-1688/${s}`;
  if (!fs.existsSync(d)) return '';
  const f = fs.readdirSync(d).filter(x => /\.(jpg|jpeg|png|webp)$/i.test(x)).sort()[0];
  return f ? b64(`${d}/${f}`) : '';
};
let rows = '';
for (const s of skus) {
  const raw = firstRaw(s);
  const out = b64(`scripts/image-pipeline/staged/studio-ab/${s}/gemini-1.jpg`);
  rows += `<div class=row><div class=cell><span class=tag>ดิบจาก 1688</span><img src="${raw}"></div><div class=arrow>&rarr;</div><div class=cell><span class="tag ok">restyle GoPremium</span><img src="${out}"></div><div class=sku>${s}</div></div>`;
}
const css = `body{background:#13244a;color:#fff;font-family:system-ui,'Segoe UI',sans-serif;margin:0;padding:32px}h1{font-weight:800;margin:0}.sub{color:#f4b223;margin:8px 0 24px}.row{display:flex;align-items:center;gap:18px;background:#1b2f5e;border-radius:16px;padding:18px;margin-bottom:18px}.cell{position:relative}.cell img{width:340px;height:340px;object-fit:cover;border-radius:10px;background:#fff}.arrow{font-size:34px;color:#f4b223}.tag{position:absolute;top:8px;left:8px;background:#000a;padding:4px 10px;border-radius:20px;font-size:12px}.tag.ok{background:#f4b223;color:#13244a;font-weight:700}.sku{margin-left:auto;font-size:26px;font-weight:800;color:#f4b223}`;
const html = `<!doctype html><meta charset=utf8><title>Pilot restyle review</title><style>${css}</style><h1>GO PREMIUM — Pilot restyle (hero only)</h1><div class=sub>${skus.length} SKU &middot; Gemini &middot; ต้นทุนจริง ฿${(skus.length * 1.3).toFixed(1)} &middot; ลบจีน/ลายน้ำ/แบนเนอร์ + สตูดิโอ GoPremium</div>${rows}`;
fs.writeFileSync('scripts/raw-1688/_pilot-review.html', html);
console.log('wrote scripts/raw-1688/_pilot-review.html');
