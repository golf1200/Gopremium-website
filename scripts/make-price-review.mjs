/** Build a self-contained HTML review of the AI benchmark pricing. */
import fs from 'node:fs';
const r = JSON.parse(fs.readFileSync('_pricing/result.json', 'utf8'));
const baht = n => '฿' + Number(n).toLocaleString('en-US');
const med = a => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };
const esc = s => (s == null ? '' : String(s)).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const nClamp = r.filter(x => x.clamped).length;
const conf = {}; r.forEach(x => conf[x.conf] = (conf[x.conf] || 0) + 1);
const cleanUndercut = r.filter(x => !x.clamped);
const avgU = Math.round(cleanUndercut.reduce((a, x) => a + x.undercutPct, 0) / cleanUndercut.length);

const cats = {}; r.forEach(x => (cats[x.ourCat] ||= []).push(x));
const confColor = c => c === 'สูง' ? '#2F7D52' : c === 'กลาง' ? '#b07d12' : '#B3413D';

const rowsHtml = r.map(x => `<tr class="${x.clamped ? 'clamp' : ''} c-${x.conf === 'สูง' ? 'hi' : x.conf === 'กลาง' ? 'mid' : 'lo'}">
  <td class="sku">${esc(x.sku)}</td><td>${esc(x.name)}</td><td class="muted">${esc(x.ourCat)}</td>
  <td class="muted sm">${esc(x.benchSource)} · ${esc(x.benchCat)} <span class="n">n=${x.n}</span></td>
  <td class="num">${x.median ? baht(x.median) : '—'}</td>
  <td class="num price">${baht(x.price)}</td>
  <td class="num ${x.undercutPct >= 0 ? 'good' : 'up'}">${x.undercutPct >= 0 ? '-' : '+'}${Math.abs(x.undercutPct)}%</td>
  <td><span class="badge" style="background:${confColor(x.conf)}">${x.conf}${x.clamped ? ' ·clamp' : ''}</span></td>
</tr>`).join('');

const catSummary = Object.entries(cats).map(([k, v]) =>
  `<tr><td>${esc(k)}</td><td class="num">${v.length}</td><td class="num">${baht(med(v.map(x => x.price)))}</td>
   <td class="num">${baht(Math.min(...v.map(x => x.price)))}–${baht(Math.max(...v.map(x => x.price)))}</td></tr>`).join('');

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — AI Benchmark Pricing Review</title>
<style>
:root{--navy:#13244a;--gold:#f4b223}
*{box-sizing:border-box}body{margin:0;font-family:"Segoe UI",Tahoma,sans-serif;color:#1A2230;background:#f5f6f8;line-height:1.5}
.wrap{max-width:1100px;margin:0 auto;padding:24px 18px 60px}
h1{color:var(--navy);font-size:24px;margin:0 0 4px}.sub{color:#5B6472;margin:0 0 20px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:22px}
.card{background:#fff;border:1px solid #E3E7ED;border-radius:12px;padding:14px 16px}
.card b{display:block;font-size:26px;color:var(--navy)}.card span{color:#5B6472;font-size:13px}
.note{background:#fff7e6;border:1px solid var(--gold);border-radius:10px;padding:12px 16px;font-size:14px;margin-bottom:22px}
h2{color:var(--navy);font-size:17px;margin:26px 0 10px}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:13.5px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
th{background:var(--navy);color:#fff;text-align:left;padding:9px 10px;font-weight:600;position:sticky;top:0}
td{padding:8px 10px;border-top:1px solid #eef1f5}
.num{text-align:right;white-space:nowrap}.muted{color:#5B6472}.sm{font-size:12px}.n{color:#8A93A2;font-size:11px}
.sku{font-weight:700;color:var(--navy)}.price{font-weight:700;color:var(--navy)}
.good{color:#2F7D52;font-weight:600}.up{color:#B3413D;font-weight:600}
.badge{color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}
tr.clamp{background:#fdf3f2}
.controls{margin:10px 0}.controls label{font-size:13px;color:#5B6472;cursor:pointer}
.legend{font-size:12.5px;color:#5B6472;margin-top:8px}
</style></head><body><div class="wrap">
<h1>🏷️ AI Benchmark Pricing — รีวิวก่อนใช้จริง</h1>
<p class="sub">${r.length} SKU ที่ยังไม่มีราคา · กลยุทธ์: ตั้งราคา <b>ต่ำกว่าราคากลางคู่แข่ง ~10%</b> (สงครามราคา) · benchmark: giftwise @ 300 ชิ้น</p>
<div class="cards">
  <div class="card"><b>${r.length}</b><span>SKU ตั้งราคาแล้ว</span></div>
  <div class="card"><b>-${avgU}%</b><span>ถูกกว่าคู่แข่งเฉลี่ย (ตัวที่ benchmark ได้)</span></div>
  <div class="card"><b>${baht(Math.min(...r.map(x => x.price)))}–${baht(Math.max(...r.map(x => x.price)))}</b><span>ช่วงราคา</span></div>
  <div class="card"><b style="color:#2F7D52">${conf['สูง'] || 0}</b><span>มั่นใจสูง</span></div>
  <div class="card"><b style="color:#b07d12">${conf['กลาง'] || 0}</b><span>มั่นใจกลาง</span></div>
  <div class="card"><b style="color:#B3413D">${conf['ต่ำ'] || 0}</b><span>ต่ำ — ควรดูเอง (${nClamp} ตัวถูก clamp)</span></div>
</div>
<div class="note">📌 <b>ราคานี้เป็น "ตั้งต้นจากตลาด"</b> ที่ AI ประเมินจากราคาคู่แข่ง (giftwise) ไม่ใช่ต้นทุนซัพจริง — ใช้ขึ้นเว็บให้ดูครบก่อน แล้วจูนทีหลังได้ · แถวพื้นชมพู = ข้อมูลคู่แข่งบาง/เพี้ยน เลย clamp เข้ากรอบที่สมเหตุสมผล <b>แนะนำให้ดูแถว "ต่ำ" เป็นพิเศษ</b></div>

<h2>สรุปรายหมวด</h2>
<table><thead><tr><th>หมวด</th><th class="num">จำนวน</th><th class="num">ราคากลางที่ตั้ง</th><th class="num">ช่วง</th></tr></thead><tbody>${catSummary}</tbody></table>

<h2>รายตัว ${r.length} SKU</h2>
<div class="controls"><label><input type="checkbox" id="only"> แสดงเฉพาะที่ควรรีวิว (มั่นใจต่ำ/clamp)</label></div>
<table id="t"><thead><tr><th>SKU</th><th>ชื่อสินค้า</th><th>หมวด</th><th>อ้างอิงคู่แข่ง</th><th class="num">ราคากลางคู่แข่ง</th><th class="num">ราคาที่เราตั้ง</th><th class="num">ถูกกว่า</th><th>มั่นใจ</th></tr></thead>
<tbody>${rowsHtml}</tbody></table>
<p class="legend">มั่นใจ: <b style="color:#2F7D52">สูง</b>=มีคู่แข่งตรงรุ่นหลายตัว · <b style="color:#b07d12">กลาง</b>=ใช้ราคากลางทั้งหมวด · <b style="color:#B3413D">ต่ำ</b>=ตัวอย่างน้อย/ข้อมูลเพี้ยน ดูเอง</p>
</div>
<script>
document.getElementById('only').addEventListener('change',e=>{
  document.querySelectorAll('#t tbody tr').forEach(tr=>{
    const lo=tr.classList.contains('c-lo')||tr.classList.contains('clamp');
    tr.style.display = e.target.checked && !lo ? 'none' : '';
  });
});
</script>
</body></html>`;
fs.writeFileSync('_pricing/review.html', html);
console.log('wrote _pricing/review.html');
