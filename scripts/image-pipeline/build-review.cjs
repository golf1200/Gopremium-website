// Build a self-contained before/after review sheet (base64-embedded).
const fs = require('fs'), path = require('path');
const HERE = __dirname;
const STAGE = path.join(HERE, 'staged');
const SRC = 'C:/Users/Golf/Gopremium-website/Gopremium new version/รูปสินค้า';
const b64 = (p) => { try { const ext = path.extname(p).slice(1).replace('jpg','jpeg'); return `data:image/${ext};base64,` + fs.readFileSync(p).toString('base64'); } catch { return ''; } };

const pairs = [
  ['DW001 · กระบอกน้ำ Loopa', 'รูปหลัก (lifestyle)', `${SRC}/1.Drinkware/DW001 - Loopa/AW กระบอกน้ำสแตนเลส รุ่น Loopa/1.png`, path.join(STAGE,'DW001','main.jpg')],
  ['DW001 · กระบอกน้ำ Loopa', 'ลบภาษาจีน (สีฟ้า)', `${SRC}/1.Drinkware/DW001 - Loopa/O1CN012PctJN1oHBzlPASMV_!!2811215199-0-cib.jpg`, path.join(STAGE,'DW001','clean-02.jpg')],
  ['BG001 · กระเป๋าผ้า Classic', 'รูปหลัก (lifestyle)', `${SRC}/3.Bag/BG001 - classic/กระเป๋าผ้า รุ่น Classic/1.png`, path.join(STAGE,'BG001','main.jpg')],
  ['BG001 · กระเป๋าผ้า Classic', 'ลบภาษาจีน + มือถือ/iPad', `${SRC}/3.Bag/BG001 - classic/O1CN012OUKJL1OaiurLdVr9_!!2211638321722-0-cib.jpg`, path.join(STAGE,'BG001','clean-02.jpg')],
  ['ST001 · ปากกา Oxygen', 'รูปหลัก (ลบกรอบ+ข้อความ)', `${SRC}/2.Stationery/ST001 - ปากกา รุ่น oxygen/O1CN017FYb381VhJtr7Bt0t_!!2200616692684-0-cib.jpg`, path.join(STAGE,'ST001','main.jpg')],
];

const rows = pairs.map(([sku, kind, before, after]) => `
  <div class="row">
    <div class="meta"><h3>${sku}</h3><span>${kind}</span></div>
    <div class="pair">
      <figure><figcaption>ก่อน (ต้นฉบับ)</figcaption><img src="${b64(before)}"></figure>
      <div class="arrow">→</div>
      <figure><figcaption class="ok">หลัง (Gemini) ✓</figcaption><img src="${b64(after)}"></figure>
    </div>
  </div>`).join('');

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<title>GO PREMIUM — Image Pilot Review (before/after)</title>
<style>
body{font-family:'Segoe UI',Tahoma,sans-serif;background:#11192a;color:#e8edf5;margin:0;padding:32px}
h1{font-size:22px;margin:0 0 4px}.sub{color:#9fb2cc;margin:0 0 28px;font-size:14px}
.row{background:#1a2740;border:1px solid #2b3a57;border-radius:16px;padding:20px;margin-bottom:22px}
.meta{display:flex;align-items:baseline;gap:12px;margin-bottom:14px}
.meta h3{margin:0;font-size:17px;color:#fff}.meta span{color:#f4bd44;font-size:13px}
.pair{display:flex;align-items:center;gap:18px}
figure{margin:0;flex:1;text-align:center}
figcaption{font-size:12px;color:#9fb2cc;margin-bottom:8px}figcaption.ok{color:#5fd28a}
img{width:100%;max-width:420px;border-radius:12px;background:#fff;box-shadow:0 8px 24px -10px rgba(0,0,0,.5)}
.arrow{font-size:30px;color:#f4bd44;flex:0 0 auto}
@media(max-width:720px){.pair{flex-direction:column}.arrow{transform:rotate(90deg)}}
</style></head><body>
<h1>GO PREMIUM — รีวิวรูปนำร่อง (3 สินค้า)</h1>
<p class="sub">ซ้าย = รูปต้นฉบับ · ขวา = รูปที่ Gemini 2.5 ปรับ (ยังอยู่ใน staging ยังไม่ขึ้นเว็บ) — ทุกรูป 1:1 1000×1000 ≤170KB</p>
${rows}
</body></html>`;

const out = path.join(STAGE, 'review.html');
fs.writeFileSync(out, html);
console.log('wrote', out);
