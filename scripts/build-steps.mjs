// Step-by-step HTML: what was done at each stage, with source->result comparisons.
// Outputs express-realphoto-2026/steps/{index, step-1..4}.html
import { writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CUR = join(ROOT, 'express-realphoto-2026', 'staged-curate');
const AB = join(ROOT, 'scripts', 'image-pipeline', 'staged', 'studio-ab');
const OUT = join(ROOT, 'express-realphoto-2026', 'steps'); mkdirSync(OUT, { recursive: true });

async function img(p, px) { if (!p || !existsSync(p)) return null; const b = await sharp(p).resize(px, px, { fit: 'inside' }).jpeg({ quality: 75 }).toBuffer(); return 'data:image/jpeg;base64,' + b.toString('base64'); }
const heroSrc = (sku) => { const d = join(CUR, sku); if (!existsSync(d)) return null; const fs = readdirSync(d).filter(x => /\.jpg$/i.test(x)); const h = fs.find(x => /hero/i.test(x)) || fs.sort()[0]; return h ? join(d, h) : null; };
const allSrc = (sku) => { const d = join(CUR, sku); if (!existsSync(d)) return []; return readdirSync(d).filter(x => /\.jpg$/i.test(x)).sort().map(x => join(d, x)); };
const res = (sku) => join(AB, sku, 'gemini-1.jpg');

const CSS = `:root{--navy:#13244a;--gold:#f4b223}body{margin:0;background:#eceae4;font-family:"IBM Plex Sans Thai",system-ui;color:var(--navy)}
header{background:var(--navy);color:#fff;padding:20px 28px}header h1{margin:0;font-size:19px}header h1 b{color:var(--gold)}
header .nav{margin-top:8px;font-size:13px}header .nav a{color:var(--gold);margin-right:14px;text-decoration:none}
.wrap{max-width:980px;margin:0 auto;padding:18px}.lead{font-size:14px;line-height:1.7;background:#fff;border-radius:12px;padding:14px 18px;box-shadow:0 2px 10px rgba(19,36,74,.07)}
.ba{display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:#fff;border-radius:12px;padding:14px;margin:12px 0;box-shadow:0 2px 10px rgba(19,36,74,.07)}
.ba .lbl{flex:1 1 200px;min-width:180px}.ba .lbl b{font-size:15px}.ba .lbl p{font-size:13px;color:#444;line-height:1.6;margin:6px 0 0}
figure{margin:0}.big img{width:300px;height:300px;object-fit:cover;border-radius:10px;background:#f4f1ea;display:block}
.sm img{width:150px;height:150px;object-fit:cover;border-radius:9px;background:#f4f1ea;display:block}
figcaption{font-size:11.5px;color:#5b647a;text-align:center;margin-top:4px}.res img{outline:3px solid #0a7a3f}.bad img{outline:3px solid #c0392b}
.arr{font-size:30px;color:var(--gold)}.strip{display:flex;gap:9px;flex-wrap:wrap}
.tag{display:inline-block;font-size:12px;padding:2px 10px;border-radius:20px;margin-left:6px}.ok{background:#e6f4ea;color:#0a7a3f}.warn{background:#fdecea;color:#c0392b}
.why{background:#fff7e6;border-left:4px solid var(--gold);padding:10px 14px;border-radius:6px;font-size:13px;line-height:1.6;margin-top:8px}`;

const page = (title, navActive, body) => `<!doctype html><meta charset=utf-8><title>${title}</title><style>${CSS}</style>
<header><h1>GO <b>PREMIUM</b> — ${title}</h1><div class="nav">
<a href="index.html">📋 ภาพรวม</a><a href="step-1.html">1·คัดรูป</a><a href="step-2.html">2·เลือก AI</a><a href="step-3.html">3·ผ่าน ✅</a><a href="step-4.html">4·ตัวดื้อ ⚠️</a></div></header>
<div class="wrap">${body}</div>`;

async function baRow(sku, name, label, resultGood) {
  const s = await img(heroSrc(sku), 300), r = await img(res(sku), 300);
  return `<div class="ba"><div class="lbl"><b>${sku} · ${name}</b><p>${label}</p></div>
    <figure class="big"><img src="${s || ''}"><figcaption>รูปจริงจากซัพ</figcaption></figure>
    <div class="arr">→</div>
    <figure class="big ${resultGood ? 'res' : 'bad'}"><img src="${r || ''}"><figcaption>ผล AI</figcaption></figure></div>`;
}

// ---- index ----
writeFileSync(join(OUT, 'index.html'), page('ภาพรวม 4 ขั้นตอน', 'i', `
 <div class="lead"><b>โปรเจกต์: เอารูปสินค้าจริง Express ขึ้นเว็บให้ถูก แล้วให้ AI ทำให้สวย (brand-safe)</b><br>
 แบ่งเป็น 4 ขั้น — กดดูทีละขั้นได้จากเมนูบน หรือลิงก์ข้างล่าง:</div>
 <div class="ba"><div class="lbl"><b><a href="step-1.html">ขั้น 1 · คัดรูปจริงจาก Supplier Drive</a></b>
  <p>10 AI agent อ่าน Drive 10 ซัพ → เลือกชุดรูปที่ถูก (hero/detail/ชาร์ตสี) ต่อ SKU. ได้ <b>78/111 SKU · 249 รูป</b>. ฟรี.</p></div></div>
 <div class="ba"><div class="lbl"><b><a href="step-2.html">ขั้น 2 · เลือกโมเดล AI (Gemini vs Flux)</a></b>
  <p>ทดสอบ A/B + แก้สีเหลือง Flux + ทำลายน้ำ V3. ฿~21.</p></div></div>
 <div class="ba"><div class="lbl"><b><a href="step-3.html">ขั้น 3 · Pilot brand-safe ที่ผ่าน ✅</a></b>
  <p>ลบโลโก้ซัพ · ทำนายแบบไทยใหม่ · ลายลูกค้า→ลายใหม่คงสี · รูปรวม→ตัวเดียว. ฿15.6.</p></div></div>
 <div class="ba"><div class="lbl"><b><a href="step-4.html">ขั้น 4 · ตัวดื้อที่ยังไม่ผ่าน ⚠️</a></b>
  <p>EX048 ผ้ากันเปื้อน + EX008 หมวก — ดูว่าเพี้ยนยังไง + วิธีแก้.</p></div></div>
 <div class="lead" style="margin-top:14px">💰 ใช้เงินรวมทั้งหมด ~<b>฿36.5</b> · ทุกอย่างยังอยู่ใน staging ยังไม่ขึ้นเว็บ</div>`));

// ---- step 1: curate (show 2 example source sets) ----
let s1 = `<div class="lead"><b>ขั้น 1 — คัดรูปจริงจาก Drive (ฟรี)</b><br>AI agent ดูรูปจริงทุกใบในโฟลเดอร์ซัพ แล้วเลือกชุดที่ถูกต้องต่อ SKU. ตัวอย่าง 2 SKU:</div>`;
for (const [sku, nm] of [['EX001', 'เสื้อยืด 30 สี'], ['EX006', 'แก้วพร้อมปลอก']]) {
  const cells = (await Promise.all(allSrc(sku).map(async p => `<figure class="sm"><img src="${await img(p, 150)}"><figcaption>${p.split(/[\\/]/).pop().replace('.jpg', '')}</figcaption></figure>`))).join('');
  s1 += `<div class="ba" style="display:block"><b>${sku} · ${nm}</b> — ชุดรูปที่ AI เลือก (hero → detail → ชาร์ตสี → รายสี):<div class="strip" style="margin-top:8px">${cells}</div></div>`;
}
s1 += `<div class="lead">ดูครบทั้ง 78 SKU ได้ที่ <a href="../review/index.html">review/index.html</a></div>`;
writeFileSync(join(OUT, 'step-1.html'), page('ขั้น 1 · คัดรูปจริง', '1', s1));

// ---- step 2: choose AI ----
let s2 = `<div class="lead"><b>ขั้น 2 — เลือกโมเดล AI</b><br>ทดสอบรูปเดียวกันด้วย Gemini และ Flux เพื่อดูว่าตัวไหนเหมาะ (สุดท้ายใช้ Gemini เป็นหลัก). ตัวอย่างพัดลม + ร่ม:</div>`;
for (const [sku, nm] of [['EX022', 'พัดลม'], ['EX010', 'ร่ม']]) {
  const g = await img(res(sku), 220), f = await img(join(AB, sku, 'kontext-pro-1.jpg'), 220);
  s2 += `<div class="ba"><div class="lbl"><b>${sku} · ${nm}</b><p>เทียบ 2 โมเดล</p></div>
    <figure class="big" style="width:220px"><img src="${g || ''}" style="width:220px;height:220px"><figcaption>Gemini</figcaption></figure>
    <figure class="big" style="width:220px"><img src="${f || ''}" style="width:220px;height:220px"><figcaption>Flux Kontext</figcaption></figure></div>`;
}
writeFileSync(join(OUT, 'step-2.html'), page('ขั้น 2 · เลือก AI', '2', s2));

// ---- step 3: brand-safe passes ----
let s3 = `<div class="lead"><b>ขั้น 3 — Pilot brand-safe (ผ่าน ✅)</b><br>กฎ: ลบโลโก้ซัพ · ใส่บนคน=นายแบบไทยใหม่ · ลายลูกค้า=ลายใหม่คงสี · รูปรวม=ตัวเดียว · blank=เปล่า. 5 ตัวนี้ผ่าน:</div>`;
s3 += await baRow('EX044', 'โปโล', '👤 ได้นายแบบ+นางแบบไทยใหม่ 2 คน สีกรมตรง ไม่มีโลโก้ PMK', true);
s3 += await baRow('EX058', 'ร่ม', '🎨 ลบโลโก้ "หยกสด" → ร่มกรมสะอาด สีเดิม', true);
s3 += await baRow('EX001', 'เสื้อยืด', '🧩 รูปรวม 8 ตัว → เสื้อฟ้าตัวเดียวสะอาด', true);
s3 += await baRow('EX006', 'แก้ว', '🧽 ลบ "thank you" + ลายน้ำ → แก้วเดียวสะอาด', true);
s3 += await baRow('EX056', 'กระเป๋า', '🧩 spec sheet → กระเป๋าดำใบเดียว ไม่มี text', true);
writeFileSync(join(OUT, 'step-3.html'), page('ขั้น 3 · ผ่าน', '3', s3));

// ---- step 4: stubborn ----
let s4 = `<div class="lead"><b>ขั้น 4 — ตัวดื้อ (ยังไม่ผ่าน ⚠️)</b><br>2 ตัวนี้ยังไม่ครบเกณฑ์ ดูว่าเพี้ยนตรงไหน + แก้ยังไง:</div>`;
s4 += await baRow('EX048', 'ผ้ากันเปื้อน', '🟡 ควรเป็นผ้ากันเปื้อนใส่บนนางแบบไทยใหม่ แต่ผลออกมาเป็นของเดี่ยว ไม่มีคน + สีดำเพี้ยนเป็นเทา', false);
s4 += `<div class="why">🔧 <b>ทำไมดื้อ:</b> สคริปต์เผลอหยิบ "รูปชาร์ตสี" เป็นต้นทาง (ไม่ใช่รูปผ้ากันเปื้อนบนนางแบบ) → เลยไม่มีคนให้ AI ทำใหม่. <b>วิธีแก้:</b> แก้ให้หยิบรูป hero ที่ถูก → AI ก็จะทำนายแบบใหม่ได้ (น่าจะหายดื้อ ไม่ต้องเสียเงินเดาสุ่ม)</div>`;
s4 += await baRow('EX008', 'หมวก', '🟡 หมวกสะอาดดี แต่ AI ยังเผลอ "ใส่โลโก้" บนหน้าหมวก ทั้งที่ต้องเป็น blank', false);
s4 += `<div class="why">🔧 <b>ทำไมดื้อ:</b> Gemini ชอบเติมลายบนพื้นที่ว่างของหมวกเอง. <b>วิธีแก้:</b> retry 1-2 ครั้ง (สุ่มได้ blank) หรือใช้ Flux / crop โลโก้ออกทีหลัง — ราคาถูก</div>`;
writeFileSync(join(OUT, 'step-4.html'), page('ขั้น 4 · ตัวดื้อ', '4', s4));

console.log('wrote 5 step pages ->', join(OUT, 'index.html'));
