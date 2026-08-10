// Comprehensive master report for the express studio-restyle + gallery project.
// Cost breakdown + old(git 170706f)->new gallery comparison + per-SKU data.
//   node scripts/express-master-report.mjs   -> docs/REPORT-express-MASTER.html
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const SP = 'C:/Users/Golf/AppData/Local/Temp/claude/C--Users-Golf-Documents-Claude-Projects-Gopremium-Website-LIVE/d07a266d-16b2-41e1-be39-268852c3a121/scratchpad';
const m = JSON.parse(readFileSync(join(REPO, 'src/data/product-images.generated.json'), 'utf8'));
let detail = {};
try { detail = Object.fromEntries(JSON.parse(readFileSync(join(REPO, 'express-realphoto-2026/express-skus-detail.json'), 'utf8')).map(d => [d.sku, d])); } catch {}
const pub = readFileSync(SP + '/g_round.txt', 'utf8').split(',').concat(readFileSync(SP + '/g_dist.txt', 'utf8').split(','));
const OLD = '170706f';

// ---- COST DATA (฿ from each batch receipt) ----
const COST = {
  'รูปหลัก (Square hero) — 74 SKU': [
    ['Pilot — Flux EX111', 2.7], ['Pilot — Gemini EX007/081', 5.2],
    ['Batch 2 — Gemini 8 SKU (กลุ่มสกปรก)', 20.8], ['Gemini retry + กลุ่ม B (เสื้อ)', 15.6],
    ['Flux — กลุ่ม C drinkware 13', 17.4], ['Gemini retry C (แก้ Flux ใส่ text)', 10.4],
    ['Gemini cleanup EX050/090/062', 7.8], ['Gemini EX050/090 เพิ่ม seed', 10.4],
    ['Gemini เสื้อ กลุ่ม D', 15.6], ['Flux — กลุ่ม D 43 SKU', 57.4],
    ['Gemini แก้วางนอน→ตั้งตรง 4', 10.4], ['Gemini ลบ Your Logo 16', 20.8],
  ],
  'รูปแกลเลอรี (3 มุม/SKU) — Gemini': [
    ['Pilot — 3 SKU x 3 มุม', 11.7], ['Batch DISTINCT รอบ 1 (ก่อนเครดิตหมด)', 65.1],
    ['Batch ROUND รอบ 1', 80.6], ['Batch ROUND ที่เหลือ (เติมเครดิตแล้ว)', 71.6],
    ['Batch DISTINCT ที่เหลือ', 72.8], ['Retry ตัวตกค้าง EX032/059/046/106', 15.6],
    ['Retry EX018 (front เพี้ยน)', 3.9],
  ],
};
const flat = Object.entries(COST).map(([k, v]) => [k, v.reduce((a, b) => a + b[1], 0), v]);
const GRAND = flat.reduce((a, b) => a + b[1], 0);

// ---- per-SKU flags ----
const heroGemini = new Set('EX007 EX081 EX111 EX019 EX096 EX098 EX100 EX009 EX062 EX064 EX044 EX049 EX028 EX039 EX082 EX042 EX048 EX079 EX080 EX091 EX092 EX005 EX037 EX085 EX002 EX012 EX026 EX029 EX031 EX032 EX034 EX035 EX045 EX046 EX051 EX057 EX058 EX059 EX060 EX061'.split(' '));
const upright = new Set(['EX005', 'EX037', 'EX082', 'EX085']);
const noSticker = new Set('EX002 EX012 EX026 EX029 EX031 EX032 EX034 EX035 EX045 EX046 EX051 EX057 EX058 EX059 EX060 EX061'.split(' '));
const excluded = { EX050: 'ลายน้ำ "POLO MAKER" ฝังบนสินค้า ลบไม่ได้ทั้ง AI/ฟรี — รอรูปจริงจากซัพ PMK',
                   EX090: 'ลายน้ำ "POLO MAKER" ฝังบนสินค้า ลบไม่ได้ทั้ง AI/ฟรี — รอรูปจริงจากซัพ PMK' };

const b64f = p => { try { return 'data:image/jpeg;base64,' + readFileSync(p).toString('base64'); } catch { return ''; } };
const b64git = rel => { try { return 'data:image/jpeg;base64,' + execSync(`git show ${OLD}:${rel}`, { encoding: 'buffer', maxBuffer: 1e8 }).toString('base64'); } catch { return ''; } };
const catOf = s => m[s].base.split('-').slice(1).join('-');

const order = ['garment', 'hat', 'drinkware', 'umbrella', 'bags', 'powerbank', 'fan', 'lifestyle'];
const all = [...pub, ...Object.keys(excluded)];
const byCat = {}; for (const s of all) (byCat[catOf(s)] = byCat[catOf(s)] || []).push(s);
const cats = order.filter(c => byCat[c]).concat(Object.keys(byCat).filter(c => !order.includes(c)));

let skuRows = '';
for (const c of cats) {
  skuRows += `<h2>${c} <span class=cnt>${byCat[c].length}</span></h2>`;
  for (const s of all.filter(x => catOf(x) === c)) {
    const base = m[s].base, d = detail[s] || {};
    const oldImg = b64git(`public/images/products/${base}/${base}-square.jpg`);
    const excl = excluded[s];
    const tags = [heroGemini.has(s) ? 'Gemini' : 'Flux'];
    if (upright.has(s)) tags.push('↑ตั้งตรง'); if (noSticker.has(s)) tags.push('ลบ Your Logo');
    let newCells;
    if (excl) newCells = `<div class=ph>⛔ ไม่มีรูปใหม่</div>`;
    else {
      const g = m[s].gallery.map(u => join(REPO, 'public', u.replace(/^\//, '').split('?')[0]));
      const labels = ['hero', 'front', existsSync(join(REPO, 'scripts/image-pipeline/staged/studio-ab', s, 'angle-back.jpg')) ? 'back' : 'side', 'detail'];
      newCells = g.map((p, i) => `<div class=cell><img src="${b64f(p)}"><span class=cap>${labels[i] || ''}</span></div>`).join('');
    }
    const meta = `${d.name || ''}${d.nColors ? ` · ${d.nColors} สี` : ''}`;
    const tagHtml = excl ? `<span class=warn>ตัดออก</span>` : tags.map(t => `<span class=tag>${t}</span>`).join('');
    skuRows += `<div class="sku${excl ? ' excl' : ''}"><div class=hd><b>${s}</b> <span class=nm>${meta}</span> ${tagHtml}</div>${excl ? `<div class=rem>${excl}</div>` : ''}<div class=cmp><div class=side><div class=lbl>เก่า</div><div class=cell><img src="${oldImg}"></div></div><div class=arrow>→</div><div class=side><div class=lbl>ใหม่ — GoPremium gallery</div><div class=newrow>${newCells}</div></div></div></div>`;
  }
}

const costRows = flat.map(([k, sub, items]) =>
  `<tr class=grp><td>${k}</td><td class=r>฿${sub.toFixed(1)}</td></tr>` +
  items.map(([n, v]) => `<tr><td class=sub2>${n}</td><td class=r>฿${v.toFixed(1)}</td></tr>`).join('')
).join('');

const css = `body{background:#eceae4;font-family:system-ui;margin:0;padding:26px;color:#13244a;max-width:1500px}
h1{margin:0 0 2px;font-size:26px}.sub{color:#5a6b8c;margin:0 0 18px}
.kpis{display:flex;gap:14px;flex-wrap:wrap;margin:14px 0 22px}
.kpi{background:#13244a;color:#fff;border-radius:14px;padding:14px 20px;min-width:130px}
.kpi b{display:block;font-size:26px}.kpi span{font-size:12px;opacity:.8}
.kpi.gold{background:#f4b223;color:#13244a}
h2{margin:26px 0 8px;text-transform:capitalize;border-bottom:2px solid #f4b223;padding-bottom:4px;display:inline-block}
.cnt{background:#13244a;color:#fff;border-radius:10px;font-size:11px;padding:1px 7px}
table{border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;width:520px;box-shadow:0 1px 5px rgba(0,0,0,.08)}
td{padding:6px 14px;font-size:13px;border-bottom:1px solid #eee}.r{text-align:right;font-variant-numeric:tabular-nums}
tr.grp td{background:#f3f6fc;font-weight:700}.sub2{color:#5a6b8c;padding-left:26px}
tr.total td{background:#f4b223;font-weight:800;font-size:15px}
.sku{background:#fff;border-radius:14px;padding:12px 14px;margin:12px 0;box-shadow:0 1px 5px rgba(0,0,0,.08)}
.sku.excl{border-left:4px solid #c0392b}.hd{font-size:14px;margin-bottom:6px}.nm{color:#5a6b8c;font-size:12px}
.tag{background:#eef;border-radius:7px;font-size:10px;padding:1px 6px;margin-left:3px;font-weight:600}
.warn{background:#c0392b;color:#fff;border-radius:7px;font-size:11px;padding:1px 7px;margin-left:4px}
.rem{font-size:12px;color:#7a4a44;background:#faf0ee;border-radius:8px;padding:5px 9px;margin-bottom:6px}
.cmp{display:flex;align-items:center;gap:10px}.lbl{font-size:11px;color:#8a93a8;margin-bottom:3px;font-weight:600}
.arrow{color:#f4b223;font-size:26px;font-weight:700}.cell{display:flex;flex-direction:column;align-items:center}
.cell img,.ph{width:150px;height:150px;object-fit:cover;border-radius:8px;background:#f7f5f0;display:block}
.newrow{display:flex;gap:6px}.newrow .cell img{width:120px;height:120px}
.cap{font-size:10px;color:#8a93a8;margin-top:2px;font-weight:600}
.ph{display:flex;align-items:center;justify-content:center;color:#c0392b;border:2px dashed #d8b4b0;width:150px;height:150px;text-align:center;font-size:12px}
.box{background:#fff;border-radius:12px;padding:14px 18px;margin:10px 0;box-shadow:0 1px 4px rgba(0,0,0,.07);font-size:13px;line-height:1.6}`;

const html = `<!doctype html><meta charset=utf-8><title>Express — Comprehensive Report</title><style>${css}</style>
<h1>GO PREMIUM · สินค้าส่งด่วน — Comprehensive Image Report</h1>
<p class=sub>2026-06-30 · งานยกเครื่องรูปสินค้าส่งด่วนทั้งหมดผ่าน studio-restyle skill · live บน gopremium-website.vercel.app + www.ผลิตของพรีเมี่ยม.com (v15)</p>
<div class=kpis>
 <div class=kpi><b>${pub.length}</b><span>SKU ขึ้นเว็บ</span></div>
 <div class=kpi><b>${pub.length * 4}</b><span>รูปรวม (hero+3 มุม)</span></div>
 <div class=kpi><b>2</b><span>ตัดออก (รอรูปซัพ)</span></div>
 <div class=kpi gold><b>฿${GRAND.toFixed(0)}</b><span>ค่าใช้จ่ายรวม</span></div>
</div>
<div class=box><b>ขอบเขตงาน:</b> แปลงรูปสินค้าส่งด่วนทุกตัวให้เป็นภาพสตูดิโอสไตล์ GoPremium — ลบลายน้ำ/โลโก้ซัพ (POLO MAKER, MPKJ, LONDON CLUBS, โฮมสกรีน, REMAX…), ลบหุ่น/การ์ดสเปก/กล่อง "Your Logo", ยุบคอลลาจเหลือชิ้นเดียว, จัดของวางนอนให้ตั้งตรง, สร้างนายแบบไทยใหม่บนเสื้อ และ gen มุมเพิ่ม 3 มุม/ตัว (front · back/side · detail) ให้แกลเลอรีครบ 4 รูป<br>
<b>เครื่องมือ:</b> Gemini 2.5 Flash Image (คน/มี text/มุมใหม่) + Flux Kontext pro (ของใช้ผิวเรียบ) · ลายน้ำ V3 + ไอคอนกรมท่า · cache-bust IMG_VER → v15</div>

<h2 style="border:none">💰 ค่าใช้จ่ายทั้งหมด</h2>
<table>${costRows}<tr class=total><td>รวมทั้งโปรเจกต์</td><td class=r>฿${GRAND.toFixed(1)}</td></tr></table>

<h2 style="border:none;margin-top:26px">🖼️ เทียบเก่า → ใหม่ ทุก SKU</h2>
<p class=sub>ซ้าย = รูปเดิม (git ${OLD}) · ขวา = แกลเลอรี GoPremium ใหม่ครบ 4 รูป</p>
${skuRows}`;

const out = join(REPO, 'docs', 'REPORT-express-MASTER.html');
writeFileSync(out, html);
console.log('wrote', out, (html.length / 1024 / 1024).toFixed(1) + 'MB · grand ฿' + GRAND.toFixed(1));
