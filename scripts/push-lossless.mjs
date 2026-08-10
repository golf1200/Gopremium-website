import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const cfg=JSON.parse(fs.readFileSync(path.join(dir,'.sheet-config.json'),'utf8'));
const DATA='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const DEVID='1LDR6VIqCZR4Gdt3thPqGrvkOfOnSHJHem7KFgf71rnE';
async function call(a,p){const r=await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:cfg.token,action:a,spreadsheetId:DEVID,...p}),redirect:'follow'});const t=await r.text();try{return JSON.parse(t);}catch{return{ok:false,error:t.slice(0,150)};}}
const clean=(v)=>v===null||v===undefined?'':(typeof v==='number'?v:String(v));
async function writeTab(name,cols,rows,chunk=100){await call('addSheet',{sheet:name});await call('clear',{sheet:name});await call('appendRows',{sheet:name,rows:[cols]});
 for(let i=0;i<rows.length;i+=chunk){const c=rows.slice(i,i+chunk).map(r=>cols.map(x=>clean(r[x])));const res=await call('appendRows',{sheet:name,rows:c});if(!res.ok){console.log('err',name,i,res.error);return;}process.stdout.write(`  ${name}: ${Math.min(i+chunk,rows.length)}/${rows.length}\r`);}
 console.log(`\n✓ ${name}: ${rows.length} rows × ${cols.length} cols`);}
const csv=(rr)=>rr.map(r=>r.map(c=>{const s=String(c??'');return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}).join(',')).join('\r\n');

const m=JSON.parse(fs.readFileSync(`${DATA}/master-lossless.json`,'utf8'));
const reg=JSON.parse(fs.readFileSync(`${DATA}/suppliers-registry.json`,'utf8'));
const supCols=['code','name','country','type','offer'];
const supRows=reg.registered;
const custRows=reg.customer_brands.map(b=>({'ลูกค้า/Brand (ไม่ใช่โรงงาน)':b}));
fs.writeFileSync(`${DATA}/suppliers-registry.csv`,'﻿'+csv([supCols,...supRows.map(r=>supCols.map(c=>r[c]??''))]),'utf8');
fs.writeFileSync(`${DATA}/customers.csv`,'﻿'+csv([['ลูกค้า/Brand'],...reg.customer_brands.map(b=>[b])]),'utf8');

await writeTab('🗂️ PRODUCT MASTER (รวม)', m.cols, m.rows, 80);
await writeTab('🏭 Suppliers (โรงงาน)', supCols, supRows);
await writeTab('👥 Customers (แบรนด์ที่สั่ง)', ['ลูกค้า/Brand (ไม่ใช่โรงงาน)'], custRows);
console.log('\nDONE -> https://docs.google.com/spreadsheets/d/'+DEVID+'/edit');
console.log('suppliers:',supRows.length,'(โรงงาน '+supRows.filter(s=>s.type==='factory').length+' / OEM '+supRows.filter(s=>s.type==='OEM service').length+' / อื่น '+supRows.filter(s=>!['factory','OEM service'].includes(s.type)).length+') | customers:',custRows.length);
