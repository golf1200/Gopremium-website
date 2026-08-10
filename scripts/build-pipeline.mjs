/**
 * Build PIPELINE layer: distinct NEW products from NPD + NT not already in catalog.
 * Dedupe (vs catalog + across sources), classify category, assign REAL SKUs.
 * Append to catalog -> master-all.json
 */
import fs from 'node:fs';
const RAW = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data/_raw';
const DATA = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const J = (f) => JSON.parse(fs.readFileSync(`${RAW}/${f}.json`, 'utf8'));
const offer = (s) => { const m = String(s ?? '').match(/1688\.com\/offer\/(\d+)/); return m ? m[1] : null; };
const norm = (s) => String(s ?? '').toLowerCase().replace(/\s+/g,'').replace(/[()\-_/.,์ิีึืุู็่้๊๋ัำะาๆ"]/g,'').replace(/รุ่น|ฟรี|custom|logo/g,'');
const rowOffer = (row) => { for (const c of row) { const o = offer(c); if (o) return o; } return null; };
const num = (x) => { const n = parseFloat(String(x).replace(/[, ]/g,'')); return isFinite(n) ? n : null; };

// ---- category classifier (keyword -> SKU prefix) ----
const RULES = [
  [/(กระเป๋าเดินทาง|ล้อลาก|suitcase|luggage|trolley)/,'LG'],
  [/(ร่ม|umbrella)/,'UM'],
  [/(พัดลม|fan)/,'FN'],
  [/(powerbank|power bank|พาวเวอร์|แบตสำรอง|แบตเตอรี่สำรอง)/,'PB'],
  [/(กระบอก|แก้ว|ขวดน้ำ|กระติก|ทัมเบลอร์|tumbler|bottle|แก้วเก็บ|กระบอกน้ำ)/,'DW'],
  [/(เสื้อ|jacket|polo|hoodie|แจ็คเก็ต|เสื้อยืด|เสื้อโปโล)/,'GM'],
  [/(หมวก|cap|bucket hat)/,'GP'],
  [/(หัดดื่ม|เด็ก|baby|เบบี๋|ผ้ากันเปื้อนเด็ก)/,'BK'],
  [/(ปากกา|สมุด|ดินสอ|แฟ้ม|planner|notebook|เครื่องเขียน|ไฮไลท์)/,'ST'],
  [/(กล่องอาหาร|ปิ่นโต|จาน|ชาม|ถ้วย|ช้อน|ส้อม|กล่องข้าว|lunch box|ตะเกียบ)/,'KC'],
  [/(ยาดม|สมุนไพร|เทียนหอม|น้ำหอม|diffuser|กลิ่น|สบู่|herb)/,'SC'],
  [/(เซต|gift set|ชุดของขวัญ|gift box|เซ็ต|hamper)/,'GS'],
  [/(พวงกุญแจ|keychain|อะคริลิค|แม่เหล็ก|magnet|figure|art ?toy|ตุ๊กตา|พวงกุญแจ|ที่ห้อย|พิน|badge)/,'SV'],
  [/(magsafe|griptok|กริปต็อก|ฐานกริป|ขาตั้งโทรศัพท์|นาฬิกา|ปลั๊ก|รีโมท|เครื่องชั่ง|ลำโพง|speaker|earbud|หูฟัง|airtag|usb|สายชาร์จ|adapter|smartgrip)/,'GD'],
  [/(สัตว์เลี้ยง|หมา|แมว|pet|สุนัข)/,'PT'],
  [/(ถุงสปันบอนด์|ถุงผ้า|ถุงหูรูด|บรรจุภัณฑ์|ถุงซิป|ถุงกระดาษ|กล่องพิมพ์)/,'PK'],
  [/(กระเป๋า|tote|bag|เป้|กระเป๋าผ้า|กระเป๋าเครื่องสำอาง)/,'BG'],
];
const PREFIX_CAT = {BG:'กระเป๋า',BK:'เด็ก & เบบี๋',DW:'แก้ว & กระบอกน้ำ',FN:'พัดลมพกพา',GD:'แกดเจ็ต',GM:'เสื้อผ้า',GP:'หมวก',GS:'กิฟต์เซ็ต',KC:'ครัว & กล่องอาหาร',LG:'กระเป๋าเดินทาง',LS:'ไลฟ์สไตล์',PB:'พาวเวอร์แบงก์',PK:'บรรจุภัณฑ์',PT:'สัตว์เลี้ยง',SC:'กลิ่น & สมุนไพร',ST:'เครื่องเขียน',SV:'ของชำร่วย',UM:'ร่ม'};
const START = {BG:52,BK:5,DW:31,FN:19,GD:7,GM:5,GP:2,GS:10,KC:6,LG:1,LS:47,PB:4,PK:5,PT:2,SC:7,ST:23,SV:7,UM:11};
function classify(name){ for(const [re,p] of RULES) if(re.test(String(name))) return p; return 'LS'; }
const counter = {...START};
function nextSku(prefix){ counter[prefix]=(counter[prefix]||0)+1; return prefix+String(counter[prefix]).padStart(3,'0'); }

// ---- catalog signatures (to exclude already-cataloged) ----
const cat = JSON.parse(fs.readFileSync(`${DATA}/master-catalog.json`,'utf8')).rows;
const catNames = new Set(cat.map(r=>norm(r['ชื่อสินค้า'])));
const catOffers = new Set(cat.map(r=>offer(r['ลิงก์1688'])).filter(Boolean));
const seenOffer = new Set(catOffers), seenName = new Set(catNames);
function isDup(name,o){ if(o && seenOffer.has(o)) return true; const n=norm(name); if(n && seenName.has(n)) return true; return false; }
function mark(name,o){ if(o)seenOffer.add(o); const n=norm(name); if(n)seenName.add(n); }

const pipe=[]; const stat={};
function add(src,name,o,rec){
  if(!name || !String(name).trim() || /ตัวอย่าง/.test(name)) return;
  if(isDup(name,o)){ stat[src]=stat[src]||{new:0,dup:0}; stat[src].dup++; return; }
  mark(name,o);
  const prefix=classify(name); const sku=nextSku(prefix);
  stat[src]=stat[src]||{new:0,dup:0}; stat[src].new++;
  const lowconf = classify(name)==='LS' && !/ไลฟ์สไตล์|card|holder|passport/i.test(name);
  pipe.push({SKU:sku,'ชื่อสินค้า':name,'หมวดหมู่':PREFIX_CAT[prefix],'ช่องทาง':'NPD/Pipeline','สถานะ':'Draft (รออนุมัติ)',
    'รายละเอียด':rec.detail||'','ขนาด':rec.size||'','วัสดุ':rec.mat||'','สี':'','MOQ':rec.moq||'',
    'ราคาขาย/ชิ้น(฿)':'','ต้นทุน¥':rec.yuan??'','ต้นทุนบาท/ชิ้น':rec.baht??'','ค่าโลโก้/ชิ้น':rec.logo??'',
    'ค่าส่ง/ชิ้น':rec.ship??'','รวมต้นทุน/ชิ้น':rec.total??'','Margin%':'','Supplier/ซัพ':rec.sup||'',
    'ลูกค้า/Brand':rec.client||'','ลิงก์1688':rec.link||'','โกดัง':rec.wh||'','Lead time':rec.lead||'',
    'วิธีสกรีน':rec.logoM||'','แหล่งต้นทุน':src,'มีรูป':'','ขึ้นLive':'','หมายเหตุ':lowconf?'⚠️ ตรวจหมวด':''});
}

// 1) NPD seed TSV (richest) ----
const tsv=fs.readFileSync(`${DATA}/NPD_Import_Products.tsv`,'utf8').trim().split('\n').map(l=>l.split('\t'));
const H=tsv[0], hi=(n)=>H.indexOf(n);
for(const r of tsv.slice(1)){
  const name=r[hi('ชื่อสินค้า')], o=offer(r[hi('ลิงก์ 1688')]);
  add('NPD Inquiry', name, o, {yuan:num(r[hi('ต้นทุนหยวน/หน่วย')]),baht:num(r[hi('ต้นทุนบาท/ชิ้น')]),logo:num(r[hi('ค่าโลโก้/ชิ้น')]),
    ship:num(r[hi('ค่าส่ง/ชิ้น')]),total:num(r[hi('รวมต้นทุน/ชิ้น')]),moq:r[hi('MOQ')],sup:r[hi('ชื่อ Supplier')],
    client:r[hi('ลูกค้า/Client (แบรนด์)')],link:r[hi('ลิงก์ 1688')],wh:r[hi('โกดัง')],size:r[hi('ขนาดสินค้า')],mat:r[hi('วัสดุ')],detail:r[hi('รายละเอียด')]});
}
// 2) NPD Sourcing TH (hdr r0; client0 sup2 name3 cost12 total23) ----
{ const th=J('npd__Sourcing_TH'); const seen=new Set();
  for(let i=1;i<th.length;i++){ const row=th[i],name=row[3]; if(!name)continue; const k=norm(name)+'|'+row[2]; if(seen.has(k))continue; seen.add(k);
    add('NPD Inquiry (TH)',name,offer(row[5]),{baht:num(row[12]),total:num(row[23]),moq:row[6],sup:row[2],client:row[0],link:row[5],size:row[9],mat:row[10],detail:row[7],logoM:row[13]}); } }
// 3) NT TH Product (hdr r1; sup0 name2 cost11 total22) — collapse by (sup,name) ----
{ const t=J('nt__TH_Product'); const seen=new Set();
  for(let i=2;i<t.length;i++){ const row=t[i],name=row[2]; if(!name)continue; const k=row[0]+'|'+norm(name); if(seen.has(k))continue; seen.add(k);
    add('NT TH Product',name,offer(row[4]),{baht:num(row[11]),total:num(row[22]),moq:row[5],sup:row[1],link:row[4],size:row[8],mat:row[9],detail:row[6],logoM:row[12],lead:row[16]}); } }
// 4) NT CN Product (hdr r1; name2 link4 yuan15 baht16 total38) ----
{ const c=J('nt__CN_Product'); const seen=new Set();
  for(let i=2;i<c.length;i++){ const row=c[i],name=row[2]; if(!name||/ตัวอย่าง/.test(name))continue; const k=norm(name); if(seen.has(k))continue; seen.add(k);
    add('NT CN Product',name,offer(row[4]),{yuan:num(row[15]),baht:num(row[16]),total:num(row[38]),moq:row[9],link:row[4],size:row[12],mat:row[13],detail:row[10],logoM:row[17],wh:row[30]}); } }

// ---- combine + write ----
const all={cols:JSON.parse(fs.readFileSync(`${DATA}/master-catalog.json`,'utf8')).cols, rows:[...cat,...pipe]};
fs.writeFileSync(`${DATA}/master-all.json`, JSON.stringify(all));
fs.writeFileSync(`${DATA}/master-pipeline.json`, JSON.stringify({cols:all.cols,rows:pipe},null,1));
console.log('PIPELINE new products:', pipe.length);
console.log('per source:', JSON.stringify(stat,null,0));
const byp={}; pipe.forEach(r=>{const p=r.SKU.replace(/\d.*/,'');byp[p]=(byp[p]||0)+1;});
console.log('new SKUs by prefix:', Object.entries(byp).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join(' '));
console.log('low-confidence category (⚠️):', pipe.filter(r=>r['หมายเหตุ']).length);
console.log('TOTAL master rows:', all.rows.length, '(catalog 356 + pipeline '+pipe.length+')');
console.log('sample pipeline SKUs:', pipe.slice(0,6).map(r=>r.SKU+'='+r['ชื่อสินค้า'].slice(0,20)).join(' | '));
