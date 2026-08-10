/**
 * LOSSLESS unified Product Master — union of ALL meaningful columns across the 4 sources.
 * Nothing dropped: identity + pricing/tier + cost breakdown + logistics + logo + supplier/payment + meta.
 * Catalog (356) cost-cascade NPD>2025biz>NT ; Pipeline (125, same SKUs as build-pipeline).
 */
import fs from 'node:fs';
const RAW='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data/_raw';
const DATA='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const J=(f)=>JSON.parse(fs.readFileSync(`${RAW}/${f}.json`,'utf8'));
const offer=(s)=>{const m=String(s??'').match(/1688\.com\/offer\/(\d+)/);return m?m[1]:null;};
const norm=(s)=>String(s??'').toLowerCase().replace(/\s+/g,'').replace(/[()\-_/.,์ิีึืุู็่้๊๋ัำะาๆ"]/g,'').replace(/รุ่น|ฟรี|custom|logo/g,'');
const num=(x)=>{const n=parseFloat(String(x).replace(/[, ]/g,''));return isFinite(n)?n:null;};
const rowOffer=(row)=>{for(const c of row){const o=offer(c);if(o)return o;}return null;};
const url=(x)=>{const s=String(x??'');return /^https?:\/\//.test(s)?s:'';};

const UNION=['SKU','ชื่อสินค้า','หมวดหมู่','ช่องทาง','สถานะ','รายละเอียด','คุณสมบัติเด่น','ขนาด/ความจุ','วัสดุ','สี','จำนวนสี','รูปภาพ(URL)','MOQ',
'ราคาขาย/ชิ้น(฿)','ราคา@300','tier100','tier300','tier500','tier1000','tier2000','tier5000','Margin%','Grade',
'ต้นทุน¥','เรท','ต้นทุนบาท/ชิ้น','ค่าโลโก้/ชิ้น','ค่าแพ็ค/ชิ้น','ค่าส่งจีน(ลัง)','ค่าส่งมาไทย','ค่าOEM','%ship-to-cost','ค่าส่ง/ชิ้น','รวมต้นทุน/ชิ้น',
'กว้าง(cm)','ยาว(cm)','สูง(cm)','CBM','น้ำหนักกล่อง(kg)','CBM/KG','จำนวน/กล่อง','CalculatedRate','โกดัง','ประเภทสินค้า','ขนส่ง','ของแข็ง/ของนิ่ม','ระยะเวลาผลิต/Lead',
'เลเซอร์ฟรี','สกรีนฟรี','UVฟรี','UV-DTFฟรี','DTFฟรี','วิธีcustomlogo','ค่าlogo-custom','ขนาดโลโก้','รายละเอียดlogo',
'Supplier-code','ชื่อSupplier/โรงงาน','ลูกค้า/Brand','ลิงก์1688','offer-id','ชื่อแชท1688','Wechat','โอนเงินได้','บัญชีธนาคาร','เงื่อนไขชำระเงิน','Packaging1:1','ค่าPackaging',
'มีรูป','ขึ้นLive','สถานะเว็บ','ข้อมูลครบ','แหล่งต้นทุน','แหล่งที่มา','หมายเหตุ'];
const blank=()=>Object.fromEntries(UNION.map(k=>[k,'']));
const set=(o,p)=>{for(const k in p){if(p[k]!==''&&p[k]!=null&&(o[k]===''||o[k]==null))o[k]=p[k];}return o;};

// ---------- cost-source extractors -> union-partial ----------
function fromBiz(r){const o=rowOffer(r);return{'คุณสมบัติเด่น':r[5],'ขนาด/ความจุ':r[6],'วัสดุ':r[7],'สี':r[8]||r[27],'รูปภาพ(URL)':url(r[1])||url(r[25]),
 'ราคา@300':num(r[9]),'tier100':num(r[48]),'tier300':num(r[49]),'tier500':num(r[50]),'tier1000':num(r[51]),'tier2000':num(r[52]),'tier5000':num(r[53]),'Grade':r[38],
 'ต้นทุน¥':num(r[28]),'ต้นทุนบาท/ชิ้น':num(r[29]),'ค่าส่งจีน(ลัง)':num(r[41]),'ค่าส่งมาไทย':num(r[42]),'ค่าOEM':num(r[43]),'%ship-to-cost':r[44],'รวมต้นทุน/ชิ้น':num(r[45]),
 'ประเภทสินค้า':r[30],'ระยะเวลาผลิต/Lead':r[35],'เลเซอร์ฟรี':r[11],'สกรีนฟรี':r[12],'UVฟรี':r[13],'UV-DTFฟรี':r[14],'DTFฟรี':r[16],'ขนาดโลโก้':r[18],
 'ชื่อSupplier/โรงงาน':r[33],'ลิงก์1688':url(r[33]),'offer-id':o,'ชื่อแชท1688':r[34],'โอนเงินได้':r[36],'บัญชีธนาคาร':r[37],'MOQ':r[31],'แหล่งที่มา':'2025biz'};}
function fromNTcn(r){return{'รายละเอียด':r[10],'คุณสมบัติเด่น':r[11],'ขนาด/ความจุ':r[12],'วัสดุ':r[13],
 'ต้นทุน¥':num(r[15]),'ต้นทุนบาท/ชิ้น':num(r[16]),'ค่าโลโก้/ชิ้น':num(r[19]),'รวมต้นทุน/ชิ้น':num(r[38]),
 'กว้าง(cm)':num(r[24]),'ยาว(cm)':num(r[25]),'สูง(cm)':num(r[26]),'CBM':num(r[27]),'น้ำหนักกล่อง(kg)':num(r[28]),'CBM/KG':r[29],'จำนวน/กล่อง':num(r[35]),'CalculatedRate':num(r[33]),
 'โกดัง':r[30],'ประเภทสินค้า':r[31],'ขนส่ง':r[32],'ค่าส่ง/ชิ้น':num(r[36]),'ระยะเวลาผลิต/Lead':r[21],'วิธีcustomlogo':r[17],'ค่าlogo-custom':num(r[19]),'รายละเอียดlogo':r[18],
 'ลิงก์1688':url(r[4]),'offer-id':offer(r[4]),'ชื่อแชท1688':r[5],'Wechat':r[8],'โอนเงินได้':r[6],'บัญชีธนาคาร':r[7],'Packaging1:1':r[22],'ค่าPackaging':num(r[23]),'MOQ':r[9],'แหล่งที่มา':'NT CN'};}
function fromNTth(r){return{'รายละเอียด':r[6],'คุณสมบัติเด่น':r[7],'ขนาด/ความจุ':r[8],'วัสดุ':r[9],
 'ต้นทุนบาท/ชิ้น':num(r[11]),'ค่าlogo-custom':num(r[14]),'ค่าส่ง/ชิ้น':num(r[21]),'รวมต้นทุน/ชิ้น':num(r[22]),'ระยะเวลาผลิต/Lead':r[16],
 'วิธีcustomlogo':r[12],'รายละเอียดlogo':r[13],'Supplier-code':r[0],'ชื่อSupplier/โรงงาน':r[1],'ลิงก์1688':url(r[4]),'offer-id':offer(r[4]),
 'เงื่อนไขชำระเงิน':r[17],'Packaging1:1':r[18],'ค่าPackaging':num(r[19]),'MOQ':r[5],'หมายเหตุ':r[23],'แหล่งที่มา':'NT TH'};}
function fromNPDseed(r,hi){return{'รายละเอียด':r[hi('รายละเอียด')],'คุณสมบัติเด่น':r[hi('คุณสมบัติ')],'ขนาด/ความจุ':r[hi('ขนาดสินค้า')],'วัสดุ':r[hi('วัสดุ')],
 'ต้นทุน¥':num(r[hi('ต้นทุนหยวน/หน่วย')]),'เรท':num(r[hi('เรท')]),'ต้นทุนบาท/ชิ้น':num(r[hi('ต้นทุนบาท/ชิ้น')]),'ค่าโลโก้/ชิ้น':num(r[hi('ค่าโลโก้/ชิ้น')]),'ค่าแพ็ค/ชิ้น':num(r[hi('ค่าแพ็ค/ชิ้น')]),
 'ค่าส่ง/ชิ้น':num(r[hi('ค่าส่ง/ชิ้น')]),'รวมต้นทุน/ชิ้น':num(r[hi('รวมต้นทุน/ชิ้น')]),'กว้าง(cm)':num(r[hi('กว้าง(cm)')]),'ยาว(cm)':num(r[hi('ยาว(cm)')]),'สูง(cm)':num(r[hi('สูง(cm)')]),
 'CBM':num(r[hi('CBM')]),'น้ำหนักกล่อง(kg)':num(r[hi('น้ำหนักกล่อง(kg)')]),'CBM/KG':r[hi('CBM/KG')],'จำนวน/กล่อง':num(r[hi('จำนวน/กล่อง')]),'CalculatedRate':num(r[hi('Calculated Rate')]),
 'โกดัง':r[hi('โกดัง')],'ประเภทสินค้า':r[hi('ประเภท')],'ขนส่ง':r[hi('ขนส่ง')],'ของแข็ง/ของนิ่ม':r[hi('ของแข็ง/ของนิ่ม')],
 'Supplier-code':r[hi('Supplier Code')],'ชื่อSupplier/โรงงาน':r[hi('ชื่อ Supplier')],'ลูกค้า/Brand':r[hi('ลูกค้า/Client (แบรนด์)')],'ลิงก์1688':url(r[hi('ลิงก์ 1688')]),'offer-id':offer(r[hi('ลิงก์ 1688')]),
 'MOQ':r[hi('MOQ')],'แหล่งที่มา':'NPD Inquiry'};}

// ---------- build cost indexes (full union-partial) ----------
const tsv=fs.readFileSync(`${DATA}/NPD_Import_Products.tsv`,'utf8').trim().split('\n').map(l=>l.split('\t'));
const SH=tsv[0],hi=(n)=>SH.indexOf(n);
const npdByOffer=new Map(),npdByName=new Map();
for(const r of tsv.slice(1)){const p=fromNPDseed(r,hi);const o=offer(r[hi('ลิงก์ 1688')]);if(o&&!npdByOffer.has(o))npdByOffer.set(o,p);const nm=norm(r[hi('ชื่อสินค้า')]);if(nm)npdByName.set(nm,p);}
const biz=J('2025biz__รายการสินค้า');const bizBySku=new Map(),bizByOffer=new Map();
for(let i=3;i<biz.length;i++){const r=biz[i],sku=String(r[2]??'').trim();const p=fromBiz(r);if(/^[A-Z]{2,3}\d{2,4}$/.test(sku)&&!bizBySku.has(sku))bizBySku.set(sku,p);const o=rowOffer(r);if(o&&!bizByOffer.has(o))bizByOffer.set(o,p);}
const ntcn=J('nt__CN_Product');const ntcnByOffer=new Map(),ntcnByName=new Map();
for(let i=2;i<ntcn.length;i++){const r=ntcn[i];if(/ตัวอย่าง/.test(r[2]||''))continue;const p=fromNTcn(r);const o=offer(r[4]);if(o&&!ntcnByOffer.has(o))ntcnByOffer.set(o,p);if(r[2])ntcnByName.set(norm(r[2]),p);}
const ntth=J('nt__TH_Product');const ntthByName=new Map();
for(let i=2;i<ntth.length;i++){const r=ntth[i];if(r[2]&&!ntthByName.has(norm(r[2])))ntthByName.set(norm(r[2]),fromNTth(r));}
function resolve(sku,name,o){const nn=norm(name);
 if(o&&npdByOffer.has(o))return{via:'NPD/offer',p:npdByOffer.get(o)};
 if(npdByName.has(nn))return{via:'NPD/name',p:npdByName.get(nn)};
 if(bizBySku.has(sku))return{via:'2025biz/SKU',p:bizBySku.get(sku)};
 if(o&&bizByOffer.has(o))return{via:'2025biz/offer',p:bizByOffer.get(o)};
 if(o&&ntcnByOffer.has(o))return{via:'NT/offer',p:ntcnByOffer.get(o)};
 if(ntcnByName.has(nn))return{via:'NT/name',p:ntcnByName.get(nn)};
 if(ntthByName.has(nn))return{via:'NTth/name',p:ntthByName.get(nn)};
 return null;}

const rows=[];
// Catalog: Dev Master Master
for(const r of J('devmaster__รายการสินค้า_Master').slice(1).filter(r=>r[1])){
 const o=rowOffer(r);const c=resolve(r[1],r[2],o);const sell=num(r[5]);
 const row=set(blank(),{SKU:r[1],'ชื่อสินค้า':r[2],'หมวดหมู่':r[4],'ช่องทาง':'Catalog ทั่วไป','สถานะ':'Active (Live)','รายละเอียด':r[3],
  'ขนาด/ความจุ':r[11],'วัสดุ':r[12],'MOQ':r[10],'ราคาขาย/ชิ้น(฿)':sell,'ลิงก์1688':(r[13]&&r[13]!=='—')?r[13]:'',
  'มีรูป':r[8],'ขึ้นLive':r[9],'สถานะเว็บ':r[6],'ข้อมูลครบ':r[7],'แหล่งต้นทุน':c?c.via:'— ไม่มี'});
 if(c)set(row,c.p);
 const tot=num(row['รวมต้นทุน/ชิ้น'])??num(row['ต้นทุนบาท/ชิ้น']);
 row['Margin%']=(sell&&tot)?Math.round((1-tot/sell)*100):'';
 rows.push(row);}
// Catalog: Express (cost in-tab + enrich by name)
for(const r of J('devmaster__สินค้าส่งด่วน_Express').slice(1).filter(r=>r[0])){
 const c=resolve(r[0],r[2],null);
 const row=set(blank(),{SKU:r[0],'ชื่อสินค้า':r[2],'หมวดหมู่':r[3],'ช่องทาง':'Express (ส่งด่วน)','สถานะ':'Active (Live)','รายละเอียด':r[15],
  'สี':r[5],'จำนวนสี':r[4],'MOQ':r[9],'ต้นทุนบาท/ชิ้น':num(String(r[11]).split('-')[0]),'รวมต้นทุน/ชิ้น':num(String(r[11]).split('-')[0]),
  'Supplier-code':String(r[1]).match(/SUP-\d+/)?.[0]||'','ชื่อSupplier/โรงงาน':r[1],'โกดัง':'ไทย','ระยะเวลาผลิต/Lead':r[10],'วิธีcustomlogo':r[12],
  'มีรูป':r[6],'ขึ้นLive':r[8],'แหล่งต้นทุน':'DevMaster/Express','แหล่งที่มา':'Dev Master Express','หมายเหตุ':r[13]});
 if(c)set(row,c.p);
 rows.push(row);}

// ---------- Pipeline (replicate build-pipeline SKU logic, full fields) ----------
const RULES=[[/(กระเป๋าเดินทาง|ล้อลาก|suitcase|luggage|trolley)/,'LG'],[/(ร่ม|umbrella)/,'UM'],[/(พัดลม|fan)/,'FN'],[/(powerbank|power bank|พาวเวอร์|แบตสำรอง)/,'PB'],[/(กระบอก|แก้ว|ขวดน้ำ|กระติก|ทัมเบลอร์|tumbler|bottle)/,'DW'],[/(เสื้อ|jacket|polo|hoodie|แจ็คเก็ต)/,'GM'],[/(หมวก|cap)/,'GP'],[/(หัดดื่ม|เด็ก|baby|เบบี๋)/,'BK'],[/(ปากกา|สมุด|ดินสอ|แฟ้ม|planner|notebook|ไฮไลท์)/,'ST'],[/(กล่องอาหาร|ปิ่นโต|จาน|ชาม|ถ้วย|ช้อน|ส้อม|lunch box|ตะเกียบ)/,'KC'],[/(ยาดม|สมุนไพร|เทียนหอม|น้ำหอม|diffuser|กลิ่น|สบู่|herb)/,'SC'],[/(เซต|gift set|ชุดของขวัญ|gift box|เซ็ต|hamper)/,'GS'],[/(พวงกุญแจ|keychain|อะคริลิค|แม่เหล็ก|magnet|figure|art ?toy|ตุ๊กตา|ที่ห้อย|พิน|badge)/,'SV'],[/(magsafe|griptok|กริปต็อก|ฐานกริป|ขาตั้งโทรศัพท์|นาฬิกา|ปลั๊ก|รีโมท|เครื่องชั่ง|ลำโพง|speaker|earbud|หูฟัง|airtag|usb|สายชาร์จ|smartgrip)/,'GD'],[/(สัตว์เลี้ยง|หมา|แมว|pet|สุนัข)/,'PT'],[/(ถุงสปันบอนด์|ถุงผ้า|ถุงหูรูด|บรรจุภัณฑ์|ถุงซิป|ถุงกระดาษ|กล่องพิมพ์)/,'PK'],[/(กระเป๋า|tote|bag|เป้)/,'BG']];
const PCAT={BG:'กระเป๋า',BK:'เด็ก & เบบี๋',DW:'แก้ว & กระบอกน้ำ',FN:'พัดลมพกพา',GD:'แกดเจ็ต',GM:'เสื้อผ้า',GP:'หมวก',GS:'กิฟต์เซ็ต',KC:'ครัว & กล่องอาหาร',LG:'กระเป๋าเดินทาง',LS:'ไลฟ์สไตล์',PB:'พาวเวอร์แบงก์',PK:'บรรจุภัณฑ์',PT:'สัตว์เลี้ยง',SC:'กลิ่น & สมุนไพร',ST:'เครื่องเขียน',SV:'ของชำร่วย',UM:'ร่ม'};
const START={BG:52,BK:5,DW:31,FN:19,GD:7,GM:5,GP:2,GS:10,KC:6,LG:1,LS:47,PB:4,PK:5,PT:2,SC:7,ST:23,SV:7,UM:11};
const counter={...START};const classify=(n)=>{for(const[re,p]of RULES)if(re.test(String(n)))return p;return'LS';};
const nextSku=(p)=>{counter[p]=(counter[p]||0)+1;return p+String(counter[p]).padStart(3,'0');};
// category fixes (from agent) optional
let FIX={};try{FIX=JSON.parse(fs.readFileSync(`${DATA}/_category-fixes.json`,'utf8'));}catch{}
const catNames=new Set(rows.map(r=>norm(r['ชื่อสินค้า'])));const catOffers=new Set(rows.map(r=>r['offer-id']).filter(Boolean));
const seenO=new Set(catOffers),seenN=new Set(catNames);
const isDup=(n,o)=>(o&&seenO.has(o))||(norm(n)&&seenN.has(norm(n)));
const mark=(n,o)=>{if(o)seenO.add(o);if(norm(n))seenN.add(norm(n));};
function addPipe(part,name,o,extra){if(!name||/ตัวอย่าง/.test(name)||isDup(name,o))return;mark(name,o);
 let prefix=classify(name);const sku0=prefix;const sku=nextSku(prefix);
 const fx=FIX[sku];if(fx&&fx.prefix){/*reassign handled post*/}
 const row=set(blank(),{SKU:sku,'ชื่อสินค้า':name,'หมวดหมู่':PCAT[prefix],'ช่องทาง':'NPD/Pipeline','สถานะ':'Draft (รออนุมัติ)','แหล่งต้นทุน':part.src,...extra});
 set(row,part.p);row['offer-id']=o||row['offer-id'];
 rows.push(row);}
// NPD seed
for(const r of tsv.slice(1)){const name=r[hi('ชื่อสินค้า')],o=offer(r[hi('ลิงก์ 1688')]);addPipe({src:'NPD Inquiry',p:fromNPDseed(r,hi)},name,o,{'ลูกค้า/Brand':r[hi('ลูกค้า/Client (แบรนด์)')]});}
// NPD Sourcing TH
{const th=J('npd__Sourcing_TH');const seen=new Set();for(let i=1;i<th.length;i++){const r=th[i],name=r[3];if(!name)continue;const k=norm(name)+'|'+r[2];if(seen.has(k))continue;seen.add(k);
 addPipe({src:'NPD Inquiry (TH)',p:set(blank(),{'รายละเอียด':r[7],'คุณสมบัติเด่น':r[8],'ขนาด/ความจุ':r[9],'วัสดุ':r[10],'ต้นทุนบาท/ชิ้น':num(r[12]),'ค่าlogo-custom':num(r[15]),'ค่าส่ง/ชิ้น':num(r[22]),'รวมต้นทุน/ชิ้น':num(r[23]),'Supplier-code':r[1],'ชื่อSupplier/โรงงาน':r[2],'ลิงก์1688':url(r[5]),'วิธีcustomlogo':r[13],'รายละเอียดlogo':r[14],'เงื่อนไขชำระเงิน':r[18],'MOQ':r[6],'ระยะเวลาผลิต/Lead':r[17],'แหล่งที่มา':'NPD TH'})},name,offer(r[5]),{'ลูกค้า/Brand':r[0]});}}
// NT TH Product
{const seen=new Set();for(let i=2;i<ntth.length;i++){const r=ntth[i],name=r[2];if(!name)continue;const k=r[0]+'|'+norm(name);if(seen.has(k))continue;seen.add(k);addPipe({src:'NT TH Product',p:fromNTth(r)},name,offer(r[4]),{});}}
// NT CN Product
{const seen=new Set();for(let i=2;i<ntcn.length;i++){const r=ntcn[i],name=r[2];if(!name||/ตัวอย่าง/.test(name))continue;const k=norm(name);if(seen.has(k))continue;seen.add(k);addPipe({src:'NT CN Product',p:fromNTcn(r)},name,offer(r[4]),{});}}

// apply category fixes (rename หมวดหมู่ only; keep SKU stable)
let fixed=0;for(const row of rows){const f=FIX[row.SKU];if(f){if(f.prefix&&PCAT[f.prefix]){row['หมวดหมู่']=PCAT[f.prefix];row['หมายเหตุ']=(f.isProduct===false?'⛔ ไม่ใช่สินค้าขาย — '+(f.note||''):(f.note||''));fixed++;}}}

fs.writeFileSync(`${DATA}/master-lossless.json`,JSON.stringify({cols:UNION,rows}));
const csv=(rr)=>rr.map(r=>r.map(c=>{const s=String(c??'');return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}).join(',')).join('\r\n');
fs.writeFileSync(`${DATA}/PRODUCT-MASTER-lossless.csv`,'﻿'+csv([UNION,...rows.map(r=>UNION.map(c=>r[c]??''))]),'utf8');
console.log('LOSSLESS master:',rows.length,'rows x',UNION.length,'cols');
console.log('  catalog:',rows.filter(r=>r['สถานะ'].startsWith('Active')).length,'| pipeline:',rows.filter(r=>r['สถานะ'].startsWith('Draft')).length);
const fillRate=(c)=>Math.round(rows.filter(r=>r[c]!==''&&r[c]!=null).length/rows.length*100);
console.log('  fill%: รูป',fillRate('รูปภาพ(URL)'),'CBM',fillRate('CBM'),'tier1000',fillRate('tier1000'),'ค่าโลโก้',fillRate('ค่าโลโก้/ชิ้น'),'Supplier-code',fillRate('Supplier-code'),'ระยะเวลาผลิต',fillRate('ระยะเวลาผลิต/Lead'));
console.log('  category fixes applied:',fixed,'(from _category-fixes.json)');
console.log('wrote master-lossless.json + PRODUCT-MASTER-lossless.csv');
