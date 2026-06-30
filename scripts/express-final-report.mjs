// Build the FINAL before/after report HTML for the express studio-restyle batch.
// before = staged real.jpg (original source) · after = current public -square.jpg.
// Excluded SKUs (no usable result) show before + a Remark.
//   node scripts/express-final-report.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const STAGED = join(REPO, 'scripts', 'image-pipeline', 'staged', 'studio-ab');
const IMGMAP = JSON.parse(readFileSync(join(REPO, 'src', 'data', 'product-images.generated.json'), 'utf8'));

const PUBLISHED = 'EX007 EX081 EX111 EX019 EX096 EX098 EX100 EX009 EX062 EX064 EX044 EX049 EX027 EX028 EX030 EX033 EX037 EX038 EX039 EX040 EX041 EX082 EX085 EX087 EX088 EX042 EX048 EX079 EX080 EX091 EX092 EX002 EX003 EX005 EX006 EX011 EX012 EX013 EX014 EX015 EX017 EX018 EX021 EX023 EX024 EX026 EX029 EX031 EX032 EX034 EX035 EX036 EX045 EX046 EX051 EX052 EX053 EX054 EX055 EX057 EX058 EX059 EX060 EX061 EX083 EX084 EX086 EX089 EX101 EX102 EX103 EX104 EX105 EX106'.split(' ');
const EXCLUDED = { EX050: 'ลายน้ำซัพ "POLO MAKER" ฝังบนสินค้า ลบไม่ได้ทั้ง AI/ฟรี — ใช้รูปเดิม รอรูปจริงจากซัพ',
                   EX090: 'ลายน้ำซัพ "POLO MAKER" ฝังบนสินค้า ลบไม่ได้ทั้ง AI/ฟรี — ใช้รูปเดิม รอรูปจริงจากซัพ' };
const upright = new Set(['EX005','EX037','EX082','EX085']);
const gemini = new Set('EX007 EX081 EX111 EX019 EX096 EX098 EX100 EX009 EX062 EX064 EX044 EX049 EX028 EX039 EX082 EX042 EX048 EX079 EX080 EX091 EX092 EX005 EX037 EX085 EX002 EX012 EX026 EX029 EX031 EX032 EX034 EX035 EX045 EX046 EX051 EX057 EX058 EX059 EX060 EX061'.split(' '));

const b64 = (p) => { try { return 'data:image/jpeg;base64,' + readFileSync(p).toString('base64'); } catch { return ''; } };
const realOf = (s) => join(STAGED, s, 'real.jpg');
const pubOf = (s) => join(REPO, 'public', 'images', 'products', IMGMAP[s].base, `${IMGMAP[s].base}-square.jpg`);
const catOf = (s) => IMGMAP[s].base.split('-').slice(1).join('-') || 'other';

const order = ['garment','hat','drinkware','umbrella','bags','powerbank','fan','lifestyle'];
const all = [...PUBLISHED, ...Object.keys(EXCLUDED)];
const byCat = {};
for (const s of all) (byCat[catOf(s)] = byCat[catOf(s)] || []).push(s);
const cats = order.filter(c => byCat[c]).concat(Object.keys(byCat).filter(c => !order.includes(c)));

let body = '';
for (const c of cats) {
  body += `<h2>${c} <span class=cnt>${byCat[c].length}</span></h2><div class=grid>`;
  for (const s of byCat[c]) {
    const before = b64(realOf(s));
    const excl = EXCLUDED[s];
    const after = excl ? '' : b64(pubOf(s));
    const eng = gemini.has(s) ? 'Gemini' : 'Flux';
    const tag = excl ? `<span class=excl>⛔ ตัดออก</span>`
              : `<span class=eng>${eng}</span>${upright.has(s) ? '<span class=up>↑ ตั้งตรง</span>' : ''}`;
    const afterCell = excl
      ? `<div class="ph excl-ph"><div>⛔<br>ใช้รูปเดิม</div></div>`
      : `<img src="${after}" loading=lazy>`;
    const remark = excl ? `<p class=remark><b>Remark:</b> ${excl}</p>` : '';
    body += `<figure><div class=pair>
        <div class=col><img src="${before}" loading=lazy><span class=cap>ก่อน (ต้นฉบับ)</span></div>
        <div class=arrow>→</div>
        <div class=col>${afterCell}<span class=cap>ล่าสุด (Final)</span></div>
      </div><figcaption><b>${s}</b> ${tag}</figcaption>${remark}</figure>`;
  }
  body += `</div>`;
}

const html = `<!doctype html><meta charset=utf-8><title>Express restyle — FINAL before/after 2026-06-30</title>
<style>body{background:#eceae4;font-family:'Segoe UI',system-ui;margin:0;padding:26px;color:#13244a}
h1{margin:0 0 2px}.sub{color:#5a6b8c;margin:0 0 16px;font-size:14px}
h2{margin:28px 0 10px;text-transform:capitalize;border-bottom:2px solid #f4b223;padding-bottom:4px;display:inline-block}
.cnt{background:#13244a;color:#fff;border-radius:10px;font-size:12px;padding:1px 8px}
.grid{display:flex;flex-wrap:wrap;gap:16px}
figure{margin:0;background:#fff;border-radius:14px;padding:12px;box-shadow:0 1px 5px rgba(0,0,0,.09);width:340px}
.pair{display:flex;align-items:center;gap:6px}.col{display:flex;flex-direction:column;align-items:center;flex:1}
.pair img,.ph{width:148px;height:148px;object-fit:cover;border-radius:8px;background:#f7f5f0;display:block}
.ph{display:flex;align-items:center;justify-content:center;color:#c0392b;text-align:center;font-size:13px;border:2px dashed #d8b4b0}
.arrow{color:#f4b223;font-size:24px;font-weight:700}
.cap{font-size:11px;color:#8a93a8;margin-top:4px}
figcaption{font-size:14px;margin-top:8px}.eng{color:#888;font-size:11px}
.up{background:#f4b223;color:#13244a;border-radius:8px;font-size:10px;padding:1px 6px;margin-left:4px;font-weight:700}
.excl{background:#c0392b;color:#fff;border-radius:8px;font-size:11px;padding:1px 7px}
.remark{font-size:12px;color:#7a4a44;background:#faf0ee;border-radius:8px;padding:6px 9px;margin:6px 0 0}
.legend{background:#fff;border-radius:10px;padding:10px 16px;margin:8px 0 18px;font-size:13px;display:inline-block}</style>
<h1>GO PREMIUM · Express restyle — FINAL (before → after)</h1>
<p class=sub>2026-06-30 · Final Version · ${PUBLISHED.length} SKU ขึ้นเว็บจริง (live) · ${Object.keys(EXCLUDED).length} ตัดออก</p>
<div class=legend><b>Gemini</b>=มีคน/text · <b>Flux</b>=ของใช้ · <span class=up>↑ ตั้งตรง</span>=แก้จากวางนอน · <span class=excl>⛔ ตัดออก</span>=รอรูปซัพ</div>
${body}`;
const out = join(REPO, 'docs', 'REVIEW-express-FINAL-before-after.html');
writeFileSync(out, html);
console.log('wrote', out, (html.length/1024/1024).toFixed(1)+'MB');
