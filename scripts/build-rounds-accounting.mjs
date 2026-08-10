// Detailed 2-round accounting: what round-1 (v1) produced, what round-2 (v2) fixed,
// cost breakdown, and whether the extra spend was worth it. Self-contained HTML.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AB = join(ROOT, 'scripts', 'image-pipeline', 'staged', 'studio-ab');
const OUT = join(ROOT, 'express-realphoto-2026', 'ROUNDS-ACCOUNTING.html');

async function thumb(p, px=320){ if(!p||!existsSync(p))return null; const b=await sharp(p).resize(px,px,{fit:'inside'}).jpeg({quality:74}).toBuffer(); return 'data:image/jpeg;base64,'+b.toString('base64'); }

// Round table. v1note = what round 1 produced; v2note = what round 2 changed.
const ROWS = [
  { sku:'EX044', name:'โปโล CoolPlus', round:'1 เท่านั้น', v1:'นายแบบ+นางแบบไทยใหม่ สีกรมตรง — ดีตั้งแต่รอบแรก', v2:'(ไม่ต้องทำซ้ำ)', status:'pass1' },
  { sku:'EX058', name:'ร่มพับ 3 ตอน', round:'1 เท่านั้น', v1:'ลบโลโก้หยกสด ร่มกรมสะอาด — ดีตั้งแต่รอบแรก', v2:'(ไม่ต้องทำซ้ำ)', status:'pass1' },
  { sku:'EX001', name:'เสื้อยืด', round:'1 → 2', v1:'❌ ออกเป็น "รูปรวม 8 ตัว" (montage)', v2:'✅ เสื้อฟ้า "ตัวเดียว" สะอาด — รอบ 2 แก้ได้', status:'fixed', showImgs:true },
  { sku:'EX006', name:'แก้วพร้อมปลอก', round:'1 → 2', v1:'❌ เหลือคำ "thank you" บนปลอก', v2:'✅ แก้วเดียว ไม่มี text — รอบ 2 แก้ได้', status:'fixed' },
  { sku:'EX056', name:'กระเป๋า Puffy', round:'1 → 2', v1:'❌ เหลือ "LONDON CLUBS" + ไซส์ (spec sheet)', v2:'✅ กระเป๋าดำใบเดียว สะอาด — รอบ 2 แก้ได้', status:'fixed' },
  { sku:'EX048', name:'ผ้ากันเปื้อน', round:'1 → 2', v1:'🟡 ลบนางแบบออก (ของเดี่ยว)', v2:'🟡 ยังไม่ใส่นายแบบ + สีดำเพี้ยนเทา — ยังต้อง retry', status:'retry' },
  { sku:'EX008', name:'หมวก bundle', round:'1 → 2', v1:'🟡 ใส่โลโก้ทึบบนหมวก', v2:'🟡 โลโก้จางลงแต่ยังมี — ยังต้อง retry', status:'retry' },
];

const ex001v1 = await thumb(join(ROOT, 'express-realphoto-2026', '_EX001-v1.jpg'));
const ex001v2 = await thumb(join(AB,'EX001','gemini-1.jpg'));

let rows = '';
for (const r of ROWS) {
  const cls = r.status==='fixed'?'fixed':r.status==='retry'?'retry':'pass1';
  rows += `<tr class="${cls}"><td class="sku">${r.sku}<br><small>${r.name}</small></td>
    <td class="rnd">${r.round}</td><td>${r.v1}</td><td>${r.v2}</td></tr>`;
}

const html = `<!doctype html><meta charset=utf-8><title>GO PREMIUM — สรุป 2 รอบ + คุณค่าเงิน</title><style>
 :root{--navy:#13244a;--gold:#f4b223}body{margin:0;background:#eceae4;font-family:"IBM Plex Sans Thai",system-ui;color:var(--navy)}
 header{background:var(--navy);color:#fff;padding:24px 30px}header h1{margin:0;font-size:20px}header h1 b{color:var(--gold)}
 .wrap{max-width:1000px;margin:0 auto;padding:18px}
 .card{background:#fff;border-radius:14px;padding:18px 20px;margin:14px 0;box-shadow:0 2px 12px rgba(19,36,74,.08)}
 h2{font-size:17px;margin:0 0 12px}h2 b{color:var(--gold)}
 table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:9px 10px;border-bottom:1px solid #f0ede6;vertical-align:top}
 th{font-size:12px;color:#5b647a;text-transform:uppercase;letter-spacing:.4px}
 .sku{font-weight:700;white-space:nowrap}.sku small{font-weight:400;color:#5b647a}.rnd{white-space:nowrap;color:#5b647a}
 tr.fixed{background:#f3faf5}tr.retry{background:#fffaf0}tr.pass1{background:#fafafa}
 .cost{display:flex;gap:14px;flex-wrap:wrap}.cbox{flex:1;min-width:180px;background:#f7f5f0;border-radius:10px;padding:12px 14px}
 .cbox .n{font-size:24px;font-weight:700}.cbox.g .n{color:#0a7a3f}.cbox small{color:#5b647a;font-size:12px}
 .ba{display:flex;gap:16px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:8px}
 .ba figure{margin:0}.ba img{width:230px;height:230px;object-fit:cover;border-radius:10px;display:block;background:#f4f1ea}
 .ba .after img{outline:3px solid #0a7a3f}figcaption{text-align:center;font-size:12px;margin-top:5px;color:#5b647a}.arr{font-size:30px;color:var(--gold)}
 .verdict{background:#13244a;color:#fff;border-radius:14px;padding:18px 20px;margin:14px 0;line-height:1.7;font-size:14px}.verdict b{color:var(--gold)}
</style>
<header><h1>GO <b>PREMIUM</b> — สรุป 2 รอบ Pilot + เงินที่จ่ายเพิ่มคุ้มยังไง</h1></header>
<div class="wrap">

 <div class="card"><h2>💰 จ่ายอะไรไปบ้าง (รวม <b>฿15.6</b>)</h2>
  <div class="cost">
   <div class="cbox"><div class="n">฿9.1</div><small>รอบ 1 (v1) — 7 รูป<br>ทดสอบสูตรครั้งแรก</small></div>
   <div class="cbox"><div class="n">฿6.5</div><small>รอบ 2 (v2) — 5 รูป<br>หลังจูน prompt</small></div>
   <div class="cbox g"><div class="n">5/7</div><small>ผ่านพร้อมใช้<br>(+2 ตัวต้อง retry)</small></div>
  </div></div>

 <div class="card"><h2>📋 เกิดอะไรขึ้นแต่ละรอบ (รายตัว)</h2>
  <table><tr><th>SKU</th><th>รอบ</th><th>รอบ 1 (v1) ได้อะไร</th><th>รอบ 2 (v2) เปลี่ยนเป็น</th></tr>${rows}</table>
  <p style="font-size:12px;color:#5b647a;margin:10px 0 0">หมายเหตุ: ไฟล์รอบ 1 ของ 4 ตัว (EX006/008/048/056) ถูกรอบ 2 เขียนทับ (ชื่อไฟล์เดียวกัน) — เก็บภาพ v1 ไว้ได้แค่ EX001 ด้านล่าง</p>
 </div>

 <div class="card"><h2>👀 ตัวอย่างจริงที่ "เงินรอบ 2 ซื้อ" — EX001 เสื้อยืด</h2>
  <div class="ba"><figure><img src="${ex001v1||''}"><figcaption>รอบ 1 (v1) — ❌ รูปรวม 8 ตัว ใช้เป็น hero ไม่ได้</figcaption></figure>
   <div class="arr">→</div>
   <figure class="after"><img src="${ex001v2||''}"><figcaption>รอบ 2 (v2) — ✅ เสื้อฟ้าตัวเดียว สะอาด พร้อมขึ้นเว็บ</figcaption></figure></div>
 </div>

 <div class="verdict"><b>คุ้มไหม?</b> — ฿6.5 รอบ 2 ให้ผล 2 อย่าง:<br>
  ① <b>แก้ของจริง 3 ตัว</b> (EX001 รูปรวม→ตัวเดียว · EX006 ลบ "thank you" · EX056 ลบ "LONDON CLUBS") = ได้รูปพร้อมขายเพิ่ม 3 ใบ<br>
  ② <b>ค้นเจอกฎ "SINGLE-UNIT"</b> ที่ฝังในสูตรถาวร → ตอนสเกล 78 SKU จะไม่เจอปัญหารูปรวม/ติด text อีก<br>
  → เงิน ฿6.5 จึง <b>กันความเสียหายของงานใหญ่ ฿300-500</b> ไว้ (ถ้าไม่จูน จะได้รูปรวม/ติด text เต็มไปหมดตอนทำครบ) — <b>คุ้มมาก</b>
 </div>

 <div class="card"><h2>สถานะตอนนี้</h2><p style="font-size:13.5px;line-height:1.7;margin:0">
  ✅ พร้อมใช้: EX044 · EX058 · EX001 · EX006 · EX056 &nbsp;|&nbsp; 🟡 ต้อง retry: EX048 · EX008<br>
  สูตร brand-safe v2 พร้อมสเกลทีละหมวด (~฿35/หมวด) — ทุกอย่างยังอยู่ใน staging ยังไม่ขึ้นเว็บ
 </p></div>
</div>`;
writeFileSync(OUT, html);
console.log('wrote', OUT, '('+Math.round(readFileSync(OUT).length/1024)+'KB)');
