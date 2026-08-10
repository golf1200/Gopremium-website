import fs from 'node:fs';
const RAW='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data/_raw';
const DATA='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const J=(f)=>JSON.parse(fs.readFileSync(`${RAW}/${f}.json`,'utf8'));
const norm=(s)=>String(s??'').toLowerCase().replace(/\s+/g,'').replace(/[()\-_/.,์ิีึืุู็่้๊๋ัำะาๆ"]/g,'').replace(/บริษัท|จำกัด|มหาชน|หจก|รุ่น/g,'');
const offer=(s)=>{const mm=String(s??'').match(/1688\.com\/offer\/(\d+)/);return mm?mm[1]:null;};
const num=(x)=>{const n=parseFloat(String(x).replace(/[, ]/g,''));return isFinite(n)?n:null;};
const m=JSON.parse(fs.readFileSync(`${DATA}/master-lossless.json`,'utf8'));
const reg=JSON.parse(fs.readFileSync(`${DATA}/suppliers-registry.json`,'utf8'));
const offerToCode=new Map(),nameToCode=new Map();
for(const s of reg.registered){if(s.offer)offerToCode.set(s.offer,s.code);nameToCode.set(norm(s.name),s.code);}

let fk=0;
for(const r of m.rows){if(r['Supplier-code'])continue;
 const o=offer(r['ลิงก์1688'])||r['offer-id'];
 const code=(o&&offerToCode.get(o))||nameToCode.get(norm(r['ชื่อSupplier/โรงงาน']))||'';
 if(code){r['Supplier-code']=code;fk++;}}

const ratios=[];
for(const r of m.rows){if(!String(r['สถานะ']).startsWith('Active'))continue;const sell=num(r['ราคาขาย/ชิ้น(฿)']),tot=num(r['รวมต้นทุน/ชิ้น'])||num(r['ต้นทุนบาท/ชิ้น']);if(sell&&tot&&tot>0&&sell/tot>1&&sell/tot<6)ratios.push(sell/tot);}
ratios.sort((a,b)=>a-b);const med=ratios.length?ratios[Math.floor(ratios.length/2)]:1.5;
let priced=0;
for(const r of m.rows){if(String(r['สถานะ']).startsWith('Active'))continue;if(r['ราคาขาย/ชิ้น(฿)'])continue;
 const tot=num(r['รวมต้นทุน/ชิ้น'])||num(r['ต้นทุนบาท/ชิ้น']);if(!tot)continue;
 const sell=Math.ceil(tot*med/5)*5;r['ราคาขาย/ชิ้น(฿)']=sell;r['Margin%']=Math.round((1-tot/sell)*100);
 const note=String(r['หมายเหตุ']||'');r['หมายเหตุ']=(note?note+' · ':'')+'💡ราคาแนะนำ(auto ×'+med.toFixed(2)+')';priced++;}

let noCost=0;
for(const r of m.rows){if(!String(r['ช่องทาง']).includes('Catalog'))continue;if(r['รวมต้นทุน/ชิ้น']||r['ต้นทุนบาท/ชิ้น'])continue;
 const note=String(r['หมายเหตุ']||'');if(!note.includes('ขอราคา'))r['หมายเหตุ']=(note?note+' · ':'')+'⛔ ต้องขอราคาซัพ';noCost++;}

const linkByName=new Map();
const scan=(file,nameCol,imgCol,hr)=>{const v=J(file);for(let i=hr;i<v.length;i++){const u=String(v[i]?.[imgCol]??'');const mm=u.match(/https?:\/\/\S+/);const nm=norm(v[i]?.[nameCol]);if(mm&&nm&&!linkByName.has(nm))linkByName.set(nm,mm[0]);}};
try{scan('npd__Sourcing_CN',3,4,3);}catch{} try{scan('nt__TH_Product',2,3,2);}catch{} try{scan('nt__CN_Product',2,3,2);}catch{}
let pImg=0;for(const r of m.rows){if(r['รูปภาพ(URL)'])continue;const u=linkByName.get(norm(r['ชื่อสินค้า']));if(u){r['รูปภาพ(URL)']=u;pImg++;}}

fs.writeFileSync(`${DATA}/master-lossless.json`,JSON.stringify(m));
console.log('Supplier FK filled :',fk,'| total with FK:',m.rows.filter(r=>r['Supplier-code']).length,'/',m.rows.length);
console.log('median catalog markup:',med.toFixed(3),'(from',ratios.length,'samples)');
console.log('pipeline suggested price:',priced);
console.log('catalog no-cost flagged:',noCost);
console.log('pipeline images from links:',pImg);
