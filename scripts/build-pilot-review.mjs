// Build a self-contained HTML: pilot brand-safe test results (source -> result)
// + a "what success looks like" acceptance checklist. For sign-off before deploy.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CURATE = join(ROOT, 'express-realphoto-2026', 'staged-curate');
const AB = join(ROOT, 'scripts', 'image-pipeline', 'staged', 'studio-ab');
const OUT = join(ROOT, 'express-realphoto-2026', 'PILOT-REVIEW.html');

// pilot SKUs in display order: passes first, then the two that need retry
const PILOT = [
  { sku:'EX044', name:'เสื้อโปโล CoolPlus CA', test:'👤 นายแบบไทยคนใหม่', verdict:'pass', note:'นายแบบ+นางแบบไทยใหม่ 2 คน ใส่โปโลกรม สีตรง ไม่มีโลโก้ PMK — ตามโจทย์เป๊ะ' },
  { sku:'EX058', name:'ร่มพับ 3 ตอน', test:'🎨 ลายลูกค้า → ลายใหม่ (คงสี)', verdict:'pass', note:'ลบโลโก้ "หยกสด" → ร่มกรมสะอาด สีเดิม' },
  { sku:'EX001', name:'เสื้อยืดคอกลม', test:'🧩 รูปรวม → ตัวเดียว', verdict:'pass', note:'v1 ออกมาเป็นรูปรวม 8 ตัว → v2 (SINGLE-UNIT) ได้เสื้อฟ้าเดี่ยวสะอาด ไม่มีโลโก้ SAMARN' },
  { sku:'EX006', name:'แก้วพร้อมปลอก', test:'🧽 ลบลายน้ำ + text', verdict:'pass', note:'v1 เหลือคำ "thank you" → v2 แก้วใบเดียวสะอาด ไม่มี text/ลายน้ำ LOVE BOTTLE' },
  { sku:'EX056', name:'กระเป๋า FluFFy Puffy', test:'🧩 spec sheet → ตัวเดียว', verdict:'pass', note:'v1 เหลือ "LONDON CLUBS"+ไซส์ → v2 กระเป๋าดำใบเดียว สะอาด' },
  { sku:'EX048', name:'ผ้ากันเปื้อน SMOOTH SOLON', test:'👤 นายแบบไทยคนใหม่', verdict:'retry', note:'ดื้อ: Gemini โชว์ผ้ากันเปื้อนเดี่ยว (สะอาดดี) แต่ไม่ยอมใส่บนนายแบบ + สีดำเพี้ยนเป็นเทา → retry/ใช้ Flux ล็อกสี' },
  { sku:'EX008', name:'หมวกบันเดิล 4 ทรง', test:'⛔ blank ห้ามมีโลโก้', verdict:'retry', note:'ดื้อ: หมวกเขียวสะอาด แต่ Gemini ยังเผลอใส่โลโก้จางๆ บนหน้าหมวก → retry (สุ่มได้ blank) หรือ crop' },
];

const SUCCESS = [
  'ไม่มีโลโก้/ลายน้ำ/ชื่อซัพ (SAMARN · PMK · LOVE BOTTLE · หยกสด · @showhuay …)',
  'ไม่มีตัวหนังสือ/ช่องทางติดต่อ/ราคา/ไซส์ ทั้งบนสินค้าและรอบๆ',
  'สินค้า "ตัวเดียว" สะอาด — ไม่ใช่รูปรวมหลายสี/spec sheet/collage',
  'สีตรงกับของจริง (base colour ไม่เพี้ยน เช่น ดำต้องดำ ไม่กลายเป็นเทา)',
  'ถ้าใส่บนคน = นายแบบ/นางแบบ "ไทยคนใหม่" (ไม่ลอกแบบของซัพ)',
  'ถ้ามีลายลูกค้า = ลายใหม่กลางๆ ของเรา แต่ "สีเดิม"',
  'ถ้าเป็น blank = เปล่าสนิท ไม่มีโลโก้/ลายที่ AI มโนขึ้นเอง',
  'พื้นครีมอุ่น + เงานุ่ม + ไอคอนของขวัญ navy มุมขวาล่าง (เข้าชุดแคตตาล็อก)',
  'ไฟล์ 1000×1000 · ≤170KB · รายละเอียดสินค้า (สี/ไซส์/วัสดุ) อยู่ใน "ช่อง text" บนหน้าเว็บ ไม่ใช่ในรูป',
];

async function thumb(p, px=300) {
  if (!existsSync(p)) return null;
  const b = await sharp(p).resize(px, px, { fit:'inside' }).jpeg({ quality:72 }).toBuffer();
  return 'data:image/jpeg;base64,' + b.toString('base64');
}
const srcOf = (sku) => { const d=join(CURATE,sku); if(!existsSync(d))return null; const f=readdirSync(d).filter(x=>/\.jpg$/i.test(x)).sort()[0]; return f?join(d,f):null; };

let rows = '';
for (const p of PILOT) {
  const s = await thumb(srcOf(p.sku)), r = await thumb(join(AB, p.sku, 'gemini-1.jpg'));
  const chip = p.verdict==='pass' ? '<span class="v pass">✅ พร้อมใช้</span>' : '<span class="v retry">🟡 ต้อง retry</span>';
  rows += `<div class="row ${p.verdict}">
    <div class="meta"><div class="sku">${p.sku} ${chip}</div><div class="nm">${p.name}</div><div class="test">${p.test}</div><div class="note">${p.note}</div></div>
    <div class="pics"><figure><img src="${s||''}"><figcaption>รูปจริงจากซัพ (ต้นฉบับ)</figcaption></figure>
      <div class="arr">→</div>
      <figure class="res"><img src="${r||''}"><figcaption>ผลที่ AI ทำ (brand-safe)</figcaption></figure></div>
  </div>`;
}
const passN = PILOT.filter(p=>p.verdict==='pass').length;

const html = `<!doctype html><meta charset=utf-8><title>GO PREMIUM — Pilot Brand-Safe Review</title><style>
 :root{--navy:#13244a;--gold:#f4b223}
 body{margin:0;background:#eceae4;font-family:"IBM Plex Sans Thai",system-ui;color:var(--navy)}
 header{background:var(--navy);color:#fff;padding:24px 30px}header h1{margin:0;font-size:20px}header h1 b{color:var(--gold)}
 header p{margin:8px 0 0;opacity:.85;font-size:13.5px;line-height:1.6;max-width:880px}
 .wrap{max-width:1040px;margin:0 auto;padding:18px}
 .card{background:#fff;border-radius:14px;padding:18px 20px;margin:14px 0;box-shadow:0 2px 12px rgba(19,36,74,.08)}
 .card h2{margin:0 0 10px;font-size:17px}.card h2 b{color:var(--gold)}
 .crit{list-style:none;padding:0;margin:0}.crit li{padding:7px 0 7px 30px;position:relative;font-size:14px;border-bottom:1px solid #f0ede6;line-height:1.5}
 .crit li:before{content:"✓";position:absolute;left:4px;top:7px;color:#0a7a3f;font-weight:700}
 .row{display:flex;gap:18px;align-items:center;background:#fff;border-radius:14px;padding:14px;margin:12px 0;box-shadow:0 2px 10px rgba(19,36,74,.07)}
 .row.retry{outline:2px solid var(--gold)}.row.pass{outline:2px solid #0a7a3f33}
 .meta{flex:1;min-width:230px}.sku{font-weight:700;font-size:15px}.nm{font-size:13.5px;margin:2px 0}.test{font-size:13px;color:#5b647a;margin:3px 0}.note{font-size:12.5px;color:#444;margin-top:6px;line-height:1.5}
 .v{font-size:12px;padding:2px 9px;border-radius:20px;margin-left:6px}.v.pass{background:#e6f4ea;color:#0a7a3f}.v.retry{background:#fff7e6;color:#9a6a00}
 .pics{display:flex;align-items:center;gap:10px}.pics figure{margin:0}.pics img{width:170px;height:170px;object-fit:cover;border-radius:9px;background:#f4f1ea;display:block}
 .res img{outline:2px solid var(--gold)}figcaption{font-size:10.5px;color:#5b647a;text-align:center;margin-top:4px}.arr{font-size:24px;color:var(--gold)}
 .score{font-size:15px}.score b{font-size:22px;color:#0a7a3f}
 @media(max-width:760px){.row{flex-direction:column;align-items:stretch}.pics{justify-content:center}}
</style>
<header><h1>GO <b>PREMIUM</b> — Pilot Brand-Safe Test (รูปสินค้าจริง → AI ทำสะอาด)</h1>
<p>ทดสอบ 7 SKU ครอบคลุมทุกเคส: นายแบบใหม่ · ลายลูกค้า→ลายใหม่ · รูปรวม→ตัวเดียว · ลบลายน้ำ/text · blank · ใช้ไป ฿15.6 — นี่คือผลทั้งหมด + เกณฑ์ "Success" ก่อน deploy</p></header>
<div class="wrap">
 <div class="card"><h2>🎯 Success หน้าตาเป็นยังไง — <b>เช็กลิสต์ก่อน deploy</b></h2>
 <p style="font-size:13px;color:#5b647a;margin:0 0 8px">รูปจะ "ผ่าน/พร้อมขึ้นเว็บ" ก็ต่อเมื่อครบทุกข้อนี้:</p>
 <ul class="crit">${SUCCESS.map(c=>`<li>${c}</li>`).join('')}</ul></div>

 <div class="card score">ผลรวม Pilot: <b>${passN}/7</b> ผ่านครบเกณฑ์พร้อมใช้ · อีก ${7-passN} ตัว "ดื้อ" ต้อง retry (อยู่ในงบเผื่อ ~20%) · แนวทาง brand-safe + prompt v2 = <b style="font-size:15px;color:var(--navy)">ใช้ได้จริง</b></div>

 <h2 style="margin:18px 4px 4px;font-size:17px">ผลรายตัว (ต้นฉบับ → ผล)</h2>
 ${rows}

 <div class="card"><h2>ขั้นต่อไป</h2><p style="font-size:13.5px;line-height:1.7;margin:0">
 ทยอยทำทีละหมวด (~฿35/หมวด) → รีวิวด้วยเกณฑ์ด้านบน → ตัวที่ผ่านตั้งเป็น gallery → bump IMG_VER → deploy
 (พร้อมแถบ "สีที่มี" ในหน้า detail ที่เพิ่มไว้แล้ว). ตัวดื้อ retry/ใช้ Flux. SKU ที่ไม่มีรูปใน Drive (ขวด YW Premium ฯลฯ) → ขอรูปซัพ.
 </p></div>
</div>`;
writeFileSync(OUT, html);
console.log('wrote', OUT, '('+Math.round(readFileSync(OUT).length/1024)+'KB)');
