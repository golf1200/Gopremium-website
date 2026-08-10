/**
 * Push the unified Product Master into the Dev Master workbook as new clearly-named tabs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(dir, '.sheet-config.json'), 'utf8'));
const DATA = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const DEVID = '1LDR6VIqCZR4Gdt3thPqGrvkOfOnSHJHem7KFgf71rnE';

async function call(action, params){
  const res = await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({token:cfg.token,action,spreadsheetId:DEVID,...params}),redirect:'follow'});
  const t=await res.text(); try{return JSON.parse(t);}catch{return{ok:false,error:t.slice(0,200)};}
}
const clean=(v)=>v===null||v===undefined?'':(typeof v==='number'?v:String(v));
async function writeTab(name, cols, rows){
  await call('addSheet',{sheet:name});
  await call('clear',{sheet:name});
  await call('appendRows',{sheet:name,rows:[cols]});
  for(let i=0;i<rows.length;i+=150){
    const chunk=rows.slice(i,i+150).map(r=>cols.map(c=>clean(r[c])));
    const r=await call('appendRows',{sheet:name,rows:chunk});
    if(!r.ok){console.log('  chunk err',i,r.error);return false;}
    process.stdout.write(`  ${name}: ${Math.min(i+150,rows.length)}/${rows.length}\r`);
  }
  console.log(`\n✓ ${name}: ${rows.length} rows`);
  return true;
}

const master=JSON.parse(fs.readFileSync(`${DATA}/master-all.json`,'utf8'));
const pipe=JSON.parse(fs.readFileSync(`${DATA}/master-pipeline.json`,'utf8'));
const supRaw=JSON.parse(fs.readFileSync(`${DATA}/_raw/nt__Supplier.json`,'utf8'));
const supCols=supRaw[0]; const supRows=supRaw.slice(1).filter(r=>r[0]).map(r=>Object.fromEntries(supCols.map((c,i)=>[c,r[i]])));
const allBrands={}; for(const r of master.rows){const b=String(r['ลูกค้า/Brand']||'').trim();if(b&&b!=='—')allBrands[b]=(allBrands[b]||0)+1;}
const custRows=Object.entries(allBrands).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({'ลูกค้า/Brand (ไม่ใช่โรงงาน)':k,'จำนวนสินค้าอ้างอิง':v}));

console.log('Pushing to Dev Master workbook...');
await writeTab('🗂️ PRODUCT MASTER (รวม)', master.cols, master.rows);
await writeTab('🆕 Pipeline (รออนุมัติ)', pipe.cols, pipe.rows);
await writeTab('🏭 Suppliers (โรงงาน)', supCols, supRows);
await writeTab('👥 Customers (แบรนด์ที่สั่ง)', ['ลูกค้า/Brand (ไม่ใช่โรงงาน)','จำนวนสินค้าอ้างอิง'], custRows);
console.log('\nDONE. Open:', `https://docs.google.com/spreadsheets/d/${DEVID}/edit`);
