// Build a Format/Template comparison sheet for ONE product (DW001).
const fs=require('fs'),path=require('path');
const HERE=__dirname, REPO=path.join(HERE,'..','..');
const b64=(p,m)=>`data:${m};base64,`+fs.readFileSync(p).toString('base64');
const cut   = b64(path.join(HERE,'staged','_tpl','dw001-cut.png'),'image/png');
const iconN = b64(path.join(REPO,'public','icon.png'),'image/png');        // navy gift icon
const iconW = b64(path.join(REPO,'public','icon-white.png'),'image/png');   // white gift icon
const wordW = b64(path.join(REPO,'public','logo-white.png'),'image/png');   // white wordmark
const wordN = b64(path.join(REPO,'public','logo.png'),'image/png');         // navy-gold wordmark
const life  = b64(path.join(HERE,'staged','DW001','main.jpg'),'image/jpeg'); // gemini lifestyle

const card=(label,free,inner)=>`
<div class="cell">
  <div class="cap"><b>${label}</b> ${free?'<span class=free>ฟรี $0</span>':'<span class=paid>Gemini ~$0.04</span>'}</div>
  <div class="sq">${inner}</div>
</div>`;

const prod=(h=74)=>`<img class="prod" style="height:${h}%" src="${cut}"><div class="shadow"></div>`;

const html=`<!doctype html><html lang="th"><head><meta charset="utf-8">
<title>GO PREMIUM — Format / Template options (DW001)</title>
<style>
body{font-family:'Segoe UI',Tahoma,sans-serif;background:#0f1726;color:#e8edf5;margin:0;padding:30px}
h1{font-size:21px;margin:0 0 4px}.sub{color:#9fb2cc;font-size:13.5px;margin:0 0 24px;max-width:90ch}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1180px}
.cell .cap{font-size:13px;margin-bottom:8px;color:#cdd8ea}.cap b{color:#fff}
.free{color:#5fd28a;font-size:11.5px;border:1px solid #2f7d52;border-radius:6px;padding:1px 6px;margin-left:4px}
.paid{color:#f4bd44;font-size:11.5px;border:1px solid #7a6320;border-radius:6px;padding:1px 6px;margin-left:4px}
.sq{position:relative;aspect-ratio:1;border-radius:14px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.prod{position:relative;z-index:2;object-fit:contain;filter:drop-shadow(0 18px 22px rgba(0,0,0,.28))}
.shadow{position:absolute;z-index:1;bottom:11%;left:50%;transform:translateX(-50%);width:46%;height:5%;background:radial-gradient(ellipse,rgba(0,0,0,.28),transparent 70%);filter:blur(3px)}
.lg-corner{position:absolute;z-index:3;right:12px;bottom:11px;height:26px;opacity:.92}
.lg-word{position:absolute;z-index:3;left:50%;bottom:14px;transform:translateX(-50%);height:24px;opacity:.95}
.kvcircle{position:absolute;z-index:1;width:64%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#F8D586,#F4BD44);opacity:.5}
.name{position:absolute;z-index:3;left:0;right:0;bottom:16px;text-align:center;font-family:Kanit,sans-serif;color:#1F3A5F;font-weight:600;font-size:14px;letter-spacing:.02em}
/* backgrounds */
.t-white{background:#ffffff}
.t-grad{background:radial-gradient(60% 90% at 78% 16%,rgba(244,189,68,.28),transparent 60%),linear-gradient(135deg,#1F3A5F,#2C4F7C)}
.t-kv{background:#F4F1EA}
.t-spot{background:radial-gradient(70% 70% at 50% 30%,#33567f,#16293F)}
.life{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1}
</style></head><body>
<h1>GO PREMIUM — เลือก Format / Template รูปสินค้า (ตัวอย่าง DW001)</h1>
<p class="sub">สินค้าตัวเดียวกัน วางใน 5 เทมเพลต — เลือกแบบที่ชอบเป็น "มาตรฐาน" ของทั้ง 71 รายการ. แบบ 1–4 ทำ <b>ฟรี</b> (ตัดพื้นหลัง + ประกอบ + ใช้ Key Visual/โลโก้เดียวกันทุกใบ → สม่ำเสมอ). แบบ 5 เป็น AI lifestyle (มีค่าใช้จ่ายเล็กน้อย ฉากต่างกันทุกใบ).</p>
<div class="grid">
  ${card('1. ขาวมินิมอล (ไม่มีโลโก้)',true,`<div class="sq t-white">${prod(76)}</div>`)}
  ${card('2. แบรนด์เกรเดียนต์ + โลโก้มุม',true,`<div class="sq t-grad">${prod(74)}<img class="lg-corner" src="${iconW}"></div>`)}
  ${card('3. Key Visual ครีม+วงทอง + โลโก้',true,`<div class="sq t-kv"><div class="kvcircle"></div>${prod(72)}<img class="lg-corner" src="${iconN}"></div>`)}
  ${card('4. สปอตไลต์พรีเมียม + wordmark',true,`<div class="sq t-spot">${prod(74)}<img class="lg-word" src="${wordW}"></div>`)}
  ${card('5. AI Lifestyle (คาเฟ่)',false,`<div class="sq"><img class="life" src="${life}"></div>`)}
</div>
<p class="sub" style="margin-top:22px">หมายเหตุ: โลโก้วางที่ <b>พื้นหลัง/มุมภาพ</b> เท่านั้น ไม่วางบนตัวสินค้า (กันเข้าใจผิดว่าสินค้ามีโลโก้พิมพ์มา). ขอบกระบอกในตัวอย่างยังหยาบเล็กน้อยเพราะตัดพื้นหลังแบบฟรี—ของจริงจะใช้ตัวตัดที่เนียนกว่า.</p>
</body></html>`;
const out=path.join(HERE,'staged','templates.html');
fs.writeFileSync(out,html);
console.log('wrote',out);
