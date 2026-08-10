/**
 * GoPremium Internal Platform — single-file HUB (open one file, access everything):
 * Dashboard · Gallery (+Detail) · Suppliers · Customers · Data Source/Metadata · Resources
 * Data embedded (offline-safe). Images: env IMG_ROOT (file:// local | https for deploy).
 */
import fs from 'node:fs';
import path from 'node:path';
const DATA='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const m=JSON.parse(fs.readFileSync(`${DATA}/master-lossless.json`,'utf8'));
const imgMap=JSON.parse(fs.readFileSync(`${DATA}/images-map.json`,'utf8'));
const reg=JSON.parse(fs.readFileSync(`${DATA}/suppliers-registry.json`,'utf8'));
const IMG_ROOT=process.env.IMG_ROOT||'file:///C:/Users/Golf/Documents/Claude/Projects/Gopremium%20Website%20LIVE/website/public';
const G=[['ข้อมูลสินค้า',0,13],['ราคาขาย / Tier',13,23],['ต้นทุน (Sourcing/Mgmt)',23,34],['โลจิสติกส์',34,47],['โลโก้ / Custom',47,56],['ซัพพลายเออร์ / ลูกค้า',56,68],['Meta / แหล่งข้อมูล',68,75]];
const payload={cols:m.cols,rows:m.rows,img:imgMap,groups:G,imgRoot:IMG_ROOT,
  suppliers:reg.registered,customers:reg.customer_brands,
  links:{sheet:'https://docs.google.com/spreadsheets/d/1LDR6VIqCZR4Gdt3thPqGrvkOfOnSHJHem7KFgf71rnE/edit',
         supabase:'https://supabase.com/dashboard/project/jrutfaqhhexgojmvioyn',
         dataDir:'file:///C:/Users/Golf/Documents/Claude/Projects/COWORK%20Agent/GoPremium-Platform/data'}};

const html=`<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GoPremium — Internal Platform</title>
<style>
:root{--navy:#13244a;--navy2:#21386b;--gold:#f4b223;--bg:#eef1f7;--card:#fff;--ink:#1a2336;--mut:#6b7791}
*{box-sizing:border-box}body{margin:0;font-family:'Segoe UI',Tahoma,sans-serif;background:var(--bg);color:var(--ink)}
header{background:var(--navy);color:#fff;padding:0 22px;display:flex;align-items:center;gap:8px;position:sticky;top:0;z-index:20;box-shadow:0 2px 8px rgba(0,0,0,.15);flex-wrap:wrap}
header h1{font-size:15px;margin:0;padding:14px 14px 14px 0;white-space:nowrap}
nav{display:flex;gap:2px;flex-wrap:wrap}
nav button{background:none;border:none;color:#bcc6dd;padding:14px 12px;font-size:13px;cursor:pointer;border-bottom:3px solid transparent}
nav button.on{color:#fff;border-bottom-color:var(--gold);font-weight:600}
.wrap{padding:18px 22px;max-width:1500px;margin:0 auto}
.filters{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
input,select{padding:9px 12px;border:1px solid #ccd3e0;border-radius:9px;font-size:13px;background:#fff}
.chip{padding:6px 12px;border-radius:20px;border:1px solid #ccd3e0;background:#fff;font-size:12px;cursor:pointer}
.chip.on{background:var(--navy);color:#fff;border-color:var(--navy)}
.cnt{color:var(--mut);font-size:13px;margin-left:auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}
.card{background:var(--card);border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.07);cursor:pointer;transition:.12s;border:1px solid #e6eaf2}
.card:hover{transform:translateY(-3px);box-shadow:0 6px 18px rgba(0,0,0,.13)}
.thumb{width:100%;aspect-ratio:1;object-fit:cover;background:#f0f2f7;display:block}
.ph{width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#e9edf5,#dfe4ee);color:#9aa6bd;font-size:30px;font-weight:700}
.cbody{padding:9px 11px}.csku{font-size:11px;color:var(--mut);font-weight:600}
.cname{font-size:13px;font-weight:600;margin:2px 0 6px;line-height:1.3;height:34px;overflow:hidden}
.badges{display:flex;gap:5px;flex-wrap:wrap}.b{font-size:10px;padding:2px 7px;border-radius:6px;font-weight:600}
.b.live{background:#e3f5ea;color:#1f8a4c}.b.draft{background:#fff3d6;color:#9a6b00}.b.exp{background:#e7efff;color:#27518f}.b.price{background:#f0f0f4;color:#333}
.ov{position:fixed;inset:0;background:rgba(15,22,40,.55);display:none;z-index:40;padding:24px;overflow:auto}.ov.show{display:block}
.modal{background:#fff;max-width:1080px;margin:0 auto;border-radius:16px;overflow:hidden;display:grid;grid-template-columns:380px 1fr}
.mleft{background:#f6f8fc;padding:18px;border-right:1px solid #eef}
.mhero{width:100%;aspect-ratio:1;object-fit:contain;background:#fff;border-radius:12px;border:1px solid #eef}
.thumbs{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.thumbs img{width:52px;height:52px;object-fit:cover;border-radius:7px;border:1px solid #dde;cursor:pointer}
.mright{padding:20px 22px;max-height:88vh;overflow:auto}.mtitle{font-size:19px;font-weight:700;margin:0}.msub{color:var(--mut);font-size:13px;margin:3px 0 14px}
.grp{margin-bottom:16px}.grp h4{margin:0 0 7px;font-size:12px;color:var(--navy);text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid var(--gold);display:inline-block;padding-bottom:2px}
.kv{display:grid;grid-template-columns:150px 1fr;gap:3px 12px;font-size:13px}.kv div:nth-child(odd){color:var(--mut)}
.x{position:absolute;top:30px;right:34px;background:#fff;border:none;width:38px;height:38px;border-radius:50%;font-size:20px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.mcards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:20px}
.mc{background:#fff;border-radius:12px;padding:16px 18px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.mc b{display:block;font-size:28px;color:var(--navy)}.mc.warn b{color:#c0392b}.mc span{font-size:12px;color:var(--mut)}
.navcards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.nc{background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06);cursor:pointer;border:1px solid #e6eaf2;transition:.12s}
.nc:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.12)}.nc .ico{font-size:30px}.nc h3{margin:8px 0 4px;color:var(--navy);font-size:17px}.nc p{margin:0;color:var(--mut);font-size:13px}
table.t{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;font-size:13px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
table.t th{background:var(--navy);color:#fff;text-align:left;padding:9px 12px;position:sticky;top:52px}
table.t td{border-top:1px solid #eef;padding:8px 12px;vertical-align:top}
h2.sec{font-size:16px;color:var(--navy);margin:24px 0 10px}
.tag{display:inline-block;border-radius:6px;padding:1px 8px;font-size:11px;font-weight:600}
.tag.f{background:#e7efff;color:#27518f}.tag.o{background:#fff3d6;color:#9a6b00}.tag.cn{background:#fde8e8;color:#b03a3a}.tag.th{background:#e3f5ea;color:#1f8a4c}
.res{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.res a{display:block;background:#fff;border-radius:12px;padding:16px 18px;text-decoration:none;color:var(--ink);box-shadow:0 1px 4px rgba(0,0,0,.06);border:1px solid #e6eaf2}
.res a:hover{border-color:var(--gold)}.res b{color:var(--navy)}.res small{color:var(--mut)}
</style>
<header><h1>🏢 GoPremium Internal Platform</h1>
<nav>
<button id="n-home" class="on" onclick="show('home')">🏠 หน้าหลัก</button>
<button id="n-gallery" onclick="show('gallery')">🖼️ สินค้า</button>
<button id="n-sup" onclick="show('sup')">🏭 โรงงาน</button>
<button id="n-cust" onclick="show('cust')">👥 ลูกค้า</button>
<button id="n-meta" onclick="show('meta')">🗃️ แหล่งข้อมูล</button>
<button id="n-res" onclick="show('res')">🔗 ลิงก์/ไฟล์</button>
</nav></header>

<div id="view-home" class="wrap"></div>
<div id="view-gallery" class="wrap" style="display:none">
 <div class="filters">
  <input id="q" placeholder="🔎 ค้นหา SKU / ชื่อ / ซัพ…" size="26" oninput="render()">
  <select id="channel" onchange="render()"><option value="">ทุกช่องทาง</option><option>Catalog ทั่วไป</option><option>Express</option><option>Pipeline</option></select>
  <select id="status" onchange="render()"><option value="">ทุกสถานะ</option><option>Active</option><option>Draft</option></select>
  <label style="font-size:12px;color:var(--mut)"><input type="checkbox" id="imgonly" onchange="render()"> มีรูปเท่านั้น</label>
  <span class="cnt" id="cnt"></span></div>
 <div class="filters" id="catchips"></div>
 <div class="grid" id="grid"></div>
</div>
<div id="view-sup" class="wrap" style="display:none"></div>
<div id="view-cust" class="wrap" style="display:none"></div>
<div id="view-meta" class="wrap" style="display:none"></div>
<div id="view-res" class="wrap" style="display:none"></div>
<div class="ov" id="ov" onclick="if(event.target===this)close_()"><button class="x" onclick="close_()">×</button><div class="modal" id="modal"></div></div>

<script>
const D=${JSON.stringify(payload)};
const g=(r,c)=>(r[c]!==undefined&&r[c]!==null)?r[c]:'';
const esc=(s)=>String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const imgUrl=(p)=>p?D.imgRoot+encodeURI(p).replace(/%2F/g,'/'):'';
const primaryImg=(sku)=>{const im=D.img[sku];return im?imgUrl(im.primary):'';};
const ph=(sku)=>'<div class="ph">'+String(sku||'?').slice(0,2)+'</div>';
const VIEWS=['home','gallery','sup','cust','meta','res'];
let activeCat='';
const cats=[...new Set(D.rows.map(r=>g(r,'หมวดหมู่')).filter(Boolean))].sort();
document.getElementById('catchips').innerHTML='<span class="chip on" data-c="" onclick="setCat(this,\\'\\')">ทุกหมวด</span>'+cats.map(c=>'<span class="chip" data-c="'+esc(c)+'" onclick="setCat(this,\\''+esc(c).replace(/'/g,'')+'\\')">'+esc(c)+'</span>').join('');
function setCat(elm,c){activeCat=c;document.querySelectorAll('#catchips .chip').forEach(e=>e.classList.remove('on'));elm.classList.add('on');render();}
function show(v){VIEWS.forEach(x=>{document.getElementById('view-'+x).style.display=x===v?'':'none';const b=document.getElementById('n-'+x);if(b)b.classList.toggle('on',x===v);});
 if(v==='home')renderHome();if(v==='meta')renderMeta();if(v==='sup')renderSup();if(v==='cust')renderCust();if(v==='res')renderRes();if(v==='gallery'&&!grendered){render();grendered=true;}}
let grendered=false;

function render(){const q=document.getElementById('q').value.toLowerCase(),ch=document.getElementById('channel').value,st=document.getElementById('status').value,io=document.getElementById('imgonly').checked;
 const out=[];D.rows.forEach((r,idx)=>{const hasImg=!!D.img[g(r,'SKU')];
  if(activeCat&&g(r,'หมวดหมู่')!==activeCat)return;
  if(ch&&!String(g(r,'ช่องทาง')).includes(ch))return;if(st&&!String(g(r,'สถานะ')).includes(st))return;if(io&&!hasImg)return;
  if(q){const blob=(g(r,'SKU')+' '+g(r,'ชื่อสินค้า')+' '+g(r,'ชื่อSupplier/โรงงาน')+' '+g(r,'ลูกค้า/Brand')).toLowerCase();if(!blob.includes(q))return;}out.push(idx);});
 document.getElementById('cnt').innerText=out.length+' / '+D.rows.length+' รายการ';
 document.getElementById('grid').innerHTML=out.map(idx=>{const r=D.rows[idx];const sku=g(r,'SKU');const img=primaryImg(sku);
  const live=String(g(r,'สถานะ')).includes('Active');const exp=String(g(r,'ช่องทาง')).includes('Express');const price=g(r,'ราคาขาย/ชิ้น(฿)'),cost=g(r,'รวมต้นทุน/ชิ้น');
  return '<div class="card" onclick="detail('+idx+')">'+(img?'<img class="thumb" loading="lazy" src="'+img+'" onerror="this.outerHTML=\\''+ph(sku).replace(/'/g,'')+'\\'">':ph(sku))+
   '<div class="cbody"><div class="csku">'+esc(sku)+'</div><div class="cname">'+esc(g(r,'ชื่อสินค้า'))+'</div><div class="badges">'+
   (live?'<span class="b live">Live</span>':'<span class="b draft">Draft</span>')+(exp?'<span class="b exp">ส่งด่วน</span>':'')+
   (price?'<span class="b price">฿'+price+'</span>':(cost?'<span class="b price">ทุน ฿'+cost+'</span>':''))+'</div></div></div>';}).join('');}

function detail(idx){const r=D.rows[idx];const sku=g(r,'SKU');const im=D.img[sku];const gal=im?im.gallery:[];
 let h='<div class="mleft">'+(gal.length?'<img class="mhero" id="hero" src="'+imgUrl(gal[0])+'">':'<div class="ph" style="border-radius:12px">'+esc(sku).slice(0,2)+'</div>')+
  '<div class="thumbs">'+gal.map(p=>'<img src="'+imgUrl(p)+'" onclick="document.getElementById(\\'hero\\').src=this.src">').join('')+'</div>'+
  '<div style="margin-top:12px;font-size:12px;color:var(--mut)">'+gal.length+' รูป · แหล่งต้นทุน: <b>'+esc(g(r,'แหล่งต้นทุน'))+'</b><br>ที่มา: '+esc(g(r,'แหล่งที่มา'))+'</div></div>';
 h+='<div class="mright"><div class="msub">'+esc(g(r,'ช่องทาง'))+' · '+esc(g(r,'สถานะ'))+' · '+esc(g(r,'หมวดหมู่'))+'</div><p class="mtitle">'+esc(g(r,'ชื่อสินค้า'))+'</p><div class="msub">SKU: <b>'+esc(sku)+'</b></div>';
 D.groups.forEach(([title,a,b])=>{const items=[];for(let i=a;i<b;i++){const v=r[D.cols[i]];if(v!==''&&v!=null)items.push('<div>'+esc(D.cols[i])+'</div><div>'+esc(v)+'</div>');}
  if(items.length)h+='<div class="grp"><h4>'+title+'</h4><div class="kv">'+items.join('')+'</div></div>';});
 h+='</div>';document.getElementById('modal').innerHTML=h;document.getElementById('ov').classList.add('show');}
function close_(){document.getElementById('ov').classList.remove('show');}
document.addEventListener('keydown',e=>{if(e.key==='Escape')close_();});

function stats(){const R=D.rows,n=R.length;return{n,cat:R.filter(r=>String(g(r,'สถานะ')).includes('Active')).length,
 pipe:R.filter(r=>String(g(r,'สถานะ')).includes('Draft')).length,img:R.filter(r=>D.img[g(r,'SKU')]).length,
 cost:R.filter(r=>g(r,'รวมต้นทุน/ชิ้น')!==''||g(r,'ต้นทุนบาท/ชิ้น')!=='').length,
 nocost:R.filter(r=>String(g(r,'ช่องทาง')).includes('Catalog')&&g(r,'รวมต้นทุน/ชิ้น')===''&&g(r,'ต้นทุนบาท/ชิ้น')==='').length};}
function mc(v,l,w){return '<div class="mc'+(w?' warn':'')+'"><b>'+v+'</b><span>'+l+'</span></div>';}

function renderHome(){const s=stats();
 document.getElementById('view-home').innerHTML='<h2 class="sec">ภาพรวม</h2><div class="mcards">'+
 mc(s.n,'สินค้าทั้งหมด')+mc(s.cat,'Catalog (Live)')+mc(s.pipe,'Pipeline (Draft)')+mc(s.img,'มีรูปภาพ')+mc(D.suppliers.length,'โรงงาน/ซัพ')+mc(D.customers.length,'ลูกค้า/แบรนด์')+mc(s.nocost,'⛔ ต้องขอราคา',1)+'</div>'+
 '<h2 class="sec">เข้าถึงทุกอย่าง</h2><div class="navcards">'+
 nc('🖼️','สินค้า (Gallery)','ดูรูป กรองหมวด กดดูรายละเอียด 75 ฟิลด์','gallery')+
 nc('🏭','โรงงาน / ซัพพลายเออร์',D.suppliers.length+' ราย (ไทย+จีน+OEM)','sup')+
 nc('👥','ลูกค้า / แบรนด์',D.customers.length+' แบรนด์ที่เคยสั่ง','cust')+
 nc('🗃️','แหล่งข้อมูล & SSOT','ที่มา 4 ไฟล์ · duplicate · ช่องว่าง','meta')+
 nc('🔗','ลิงก์ / ไฟล์','Google Sheet · Supabase · ไฟล์ข้อมูล','res')+'</div>';}
function nc(ico,t,p,v){return '<div class="nc" onclick="show(\\''+v+'\\')"><div class="ico">'+ico+'</div><h3>'+t+'</h3><p>'+p+'</p></div>';}

function renderSup(){const c=(t)=>D.suppliers.filter(s=>s.type===t).length;
 const rowsHtml=D.suppliers.map(s=>{const tg=s.country==='จีน'?'<span class="tag cn">จีน</span>':'<span class="tag th">ไทย</span>';
  return '<tr><td><b>'+esc(s.code)+'</b></td><td>'+esc(s.name)+'</td><td>'+tg+'</td><td>'+esc(s.type||'')+'</td><td>'+(s.offer?'<a href="https://detail.1688.com/offer/'+s.offer+'.html" target="_blank">1688 ↗</a>':'')+'</td></tr>';}).join('');
 document.getElementById('view-sup').innerHTML='<h2 class="sec">🏭 โรงงาน / ซัพพลายเออร์ ('+D.suppliers.length+')</h2>'+
 '<p style="color:var(--mut);font-size:13px">โรงงานจริง '+c('factory')+' · OEM service '+c('OEM service')+' · อื่นๆ '+(D.suppliers.length-c('factory')-c('OEM service'))+' <br>⚠️ ไม่ใช่ลูกค้า/แบรนด์ (ดูแท็บลูกค้า)</p>'+
 '<input id="qs" placeholder="🔎 ค้นหาโรงงาน" oninput="filterTable(\\'tsup\\',this.value)" style="margin-bottom:10px">'+
 '<table class="t" id="tsup"><thead><tr><th>รหัส</th><th>ชื่อ</th><th>ประเทศ</th><th>ประเภท</th><th>ลิงก์</th></tr></thead><tbody>'+rowsHtml+'</tbody></table>';}
function renderCust(){const counts={};D.rows.forEach(r=>{const b=String(g(r,'ลูกค้า/Brand')).trim();if(b&&b!=='—')counts[b]=(counts[b]||0)+1;});
 const list=D.customers.map(c=>({name:c,n:counts[c]||0})).sort((a,b)=>b.n-a.n);
 document.getElementById('view-cust').innerHTML='<h2 class="sec">👥 ลูกค้า / แบรนด์ที่เคยสั่ง ('+D.customers.length+')</h2>'+
 '<p style="color:var(--mut);font-size:13px">แยกออกจากโรงงานแล้ว — พวกนี้คือแบรนด์ที่มาสั่งทำ ไม่ใช่ผู้ผลิต</p>'+
 '<table class="t"><thead><tr><th>แบรนด์</th><th>จำนวนสินค้าอ้างอิง</th></tr></thead><tbody>'+
 list.map(c=>'<tr><td>'+esc(c.name)+'</td><td>'+(c.n||'')+'</td></tr>').join('')+'</tbody></table>';}
function filterTable(id,q){q=q.toLowerCase();document.querySelectorAll('#'+id+' tbody tr').forEach(tr=>{tr.style.display=tr.innerText.toLowerCase().includes(q)?'':'none';});}

function renderMeta(){const s=stats();const fill=(c)=>Math.round(D.rows.filter(r=>g(r,c)!=='').length/s.n*100);
 document.getElementById('view-meta').innerHTML='<h2 class="sec">🗃️ 4 แหล่งข้อมูล & SSOT</h2>'+
 '<table class="t"><tr><th>ไฟล์ / tab</th><th>บทบาท</th><th>SSOT ของ</th></tr>'+
 r3('Dev Master / Master+Express','แคตตาล็อกที่ขึ้นเว็บ','Identity · SKU · ราคาขาย · สถานะ')+
 r3('NPD Inquiry หาของ','pipeline หาของใหม่/custom','💰 ต้นทุน + รายละเอียด + โลจิสติกส์')+
 r3('2025 Business','ชีตต้นฉบับ (subset Dev Master)','ราคา tier 100–5,000')+
 r3('NT Supplier NPD','ซัพไทย/จีน + N8N','ทะเบียนโรงงาน (SUP-codes)')+'</table>'+
 '<h2 class="sec">🔁 Duplicate ที่พบ</h2><table class="t"><tr><th>เรื่อง</th><th>รายละเอียด</th></tr>'+
 r2('2025biz ⊂ Dev Master','SKU 91 ซ้ำครบ 100% → ใช้ enrich ไม่นับใหม่')+
 r2('"Supplier" = ลูกค้า','ชื่อบริษัทใน NPD = แบรนด์ที่สั่ง → แยก '+D.suppliers.length+' โรงงาน vs '+D.customers.length+' ลูกค้า')+
 r2('Pipeline dedupe','ของใหม่ '+s.pipe+' (ตัด dup 82) ออก SKU จริงครบ')+'</table>'+
 '<h2 class="sec">⚠️ ช่องว่าง</h2><div class="mc"><span>• Catalog ไม่มีต้นทุน <b style="color:#c0392b">'+s.nocost+'</b> ตัว<br>• รูป pipeline ยังไม่มี '+(s.n-s.img)+' ตัว<br>• fill: tier1000 '+fill('tier1000')+'% · CBM '+fill('CBM')+'% · Lead '+fill('ระยะเวลาผลิต/Lead')+'%</span></div>';}
function r3(a,b,c){return '<tr><td><b>'+a+'</b></td><td>'+b+'</td><td>'+c+'</td></tr>';}
function r2(a,b){return '<tr><td><b>'+a+'</b></td><td>'+b+'</td></tr>';}

function renderRes(){document.getElementById('view-res').innerHTML='<h2 class="sec">🔗 ลิงก์ & ไฟล์ทั้งหมด</h2><div class="res">'+
 '<a href="'+D.links.sheet+'" target="_blank"><b>📊 Google Sheet (Dev Master)</b><br><small>แท็บ PRODUCT MASTER / Suppliers / Customers — แก้ข้อมูลที่นี่</small></a>'+
 '<a href="'+D.links.supabase+'" target="_blank"><b>🟢 Supabase Dashboard</b><br><small>ฐานข้อมูล + RLS + Activity Log (backend)</small></a>'+
 '<a href="'+D.links.dataDir+'/PRODUCT-MASTER-lossless.csv"><b>📥 PRODUCT-MASTER-lossless.csv</b><br><small>เปิดใน Excel · 481×75 คอลัมน์</small></a>'+
 '<a href="'+D.links.dataDir+'/DUPLICATE-SSOT-ANALYSIS.md"><b>📄 รายงาน Duplicate/SSOT</b><br><small>วิเคราะห์เต็ม</small></a>'+
 '<a href="'+D.links.dataDir+'/master-lossless.json"><b>🗄️ master-lossless.json</b><br><small>ไฟล์ต้นทาง</small></a>'+
 '</div><p style="color:var(--mut);font-size:12px;margin-top:16px">หมายเหตุ: แอปนี้เป็นเวอร์ชัน offline (ข้อมูลฝังในไฟล์) · เวอร์ชันเชื่อม Supabase สด + login จะทำขั้นถัดไป</p>';}

renderHome();
</script></html>`;
const out=process.env.OUT_HTML||`${DATA}/INTERNAL-APP.html`;
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,html,'utf8');
console.log('wrote',out,'('+Math.round(html.length/1024)+' KB) · views: home/gallery/sup/cust/meta/res');
