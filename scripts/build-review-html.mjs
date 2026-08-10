import fs from 'node:fs';
const DATA = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const m = JSON.parse(fs.readFileSync(`${DATA}/master-lossless.json`,'utf8'));
const esc = (s)=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cols = m.cols, rows = m.rows;
const nCat = rows.filter(r=>r['สถานะ'].startsWith('Active')).length;
const nPipe = rows.length-nCat;
const nCost = rows.filter(r=>r['รวมต้นทุน/ชิ้น']!=='').length;
const nNoCost = rows.filter(r=>r['ช่องทาง'].includes('Catalog')&&r['รวมต้นทุน/ชิ้น']==='').length;
const nWarn = rows.filter(r=>String(r['หมายเหตุ']).includes('ตรวจหมวด')).length;
const tr = (r)=>`<tr class="${r['สถานะ'].startsWith('Active')?'act':'pipe'}">`+cols.map(c=>`<td>${esc(r[c])}</td>`).join('')+'</tr>';
const html = `<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GoPremium — Product Master (รวม)</title>
<style>
:root{--navy:#13244a;--gold:#f4b223}
*{box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,sans-serif;margin:0;background:#f4f6fa;color:#1a2336}
header{background:var(--navy);color:#fff;padding:22px 26px}header h1{margin:0;font-size:20px}header p{margin:6px 0 0;opacity:.8;font-size:13px}
.cards{display:flex;gap:12px;flex-wrap:wrap;padding:18px 26px}
.card{background:#fff;border-radius:12px;padding:14px 18px;box-shadow:0 1px 4px rgba(0,0,0,.06);min-width:120px}
.card b{display:block;font-size:26px;color:var(--navy)}.card span{font-size:12px;color:#667}
.card.warn b{color:#c0392b}
.bar{padding:0 26px 14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
input,select{padding:8px 10px;border:1px solid #cdd;border-radius:8px;font-size:13px}
.note{padding:0 26px 14px;font-size:13px;color:#445;max-width:1100px;line-height:1.6}
.wrap{overflow:auto;max-height:72vh;margin:0 14px 24px;border-radius:10px;border:1px solid #dde;background:#fff}
table{border-collapse:collapse;font-size:12px;white-space:nowrap}
th,td{border:1px solid #eef;padding:5px 8px;text-align:left;max-width:280px;overflow:hidden;text-overflow:ellipsis}
th{position:sticky;top:0;background:var(--navy);color:#fff;z-index:2}
tr.act td:first-child{border-left:3px solid #2e9e5b}tr.pipe td:first-child{border-left:3px solid var(--gold)}
tr.pipe{background:#fffdf5}td:nth-child(5){font-weight:600}
</style>
<header><h1>🗂️ GoPremium Product Master — รวมทุกแหล่งเป็นไฟล์เดียว</h1>
<p>Single Source of Truth · รวม 4 Google Sheet → ${rows.length} รายการ · สร้าง 2026-06-28</p></header>
<div class="cards">
<div class="card"><b>${rows.length}</b><span>รวมทั้งหมด</span></div>
<div class="card"><b>${nCat}</b><span>Catalog (Live บนเว็บ)</span></div>
<div class="card"><b>${nPipe}</b><span>Pipeline (รออนุมัติ)</span></div>
<div class="card"><b>${nCost}</b><span>มีต้นทุน</span></div>
<div class="card warn"><b>${nNoCost}</b><span>Catalog ไม่มีต้นทุน (margin ไม่รู้)</span></div>
<div class="card warn"><b>${nWarn}</b><span>⚠️ ตรวจหมวด</span></div>
</div>
<div class="note"><b>SSOT:</b> Identity/ราคาขาย = Dev Master · ต้นทุน = NPD Inquiry หาของ (แกน) → 2025 Business → NT · ทะเบียนโรงงาน = NT/Supplier (15 SUP) · แยกลูกค้า/แบรนด์ออกจากโรงงานแล้ว (37 ราย).
🟢 ขอบเขียว = Active(Live) · 🟡 ขอบทอง = Pipeline. ดูรายงานเต็มที่ <code>data/DUPLICATE-SSOT-ANALYSIS.md</code></div>
<div class="bar">
<input id="q" placeholder="🔎 ค้นหา SKU / ชื่อ / ซัพ…" oninput="f()" size="34">
<select id="ch" onchange="f()"><option value="">— ทุกช่องทาง —</option><option>Catalog ทั่วไป</option><option>Express</option><option>NPD/Pipeline</option></select>
<select id="st" onchange="f()"><option value="">— ทุกสถานะ —</option><option>Active</option><option>Draft</option></select>
<span id="cnt" style="font-size:13px;color:#667"></span>
</div>
<div class="wrap"><table id="t"><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead>
<tbody>${rows.map(tr).join('')}</tbody></table></div>
<script>
const tb=document.getElementById('t').tBodies[0],rows=[...tb.rows];
function f(){const q=document.getElementById('q').value.toLowerCase(),ch=document.getElementById('ch').value,st=document.getElementById('st').value;let n=0;
for(const r of rows){const t=r.innerText.toLowerCase();const ok=t.includes(q)&&(!ch||r.cells[3].innerText.includes(ch))&&(!st||r.cells[4].innerText.includes(st));r.style.display=ok?'':'none';if(ok)n++;}
document.getElementById('cnt').innerText=n+' / '+rows.length+' แถว';}
f();
</script></html>`;
const out = `${DATA}/REVIEW-product-master.html`;
fs.writeFileSync(out, html, 'utf8');
console.log('wrote', out);
