/**
 * Extract in-cell image URLs via the readImages action (REQUIRES redeploying sheet-sync.gs),
 * then patch รูปภาพ(URL) into master-lossless.json by offer-id / normalized name.
 * Image columns: 2025biz รายการสินค้า col1, NT TH/CN col3, NPD seed รูปสินค้า.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const cfg=JSON.parse(fs.readFileSync(path.join(dir,'.sheet-config.json'),'utf8'));
const DATA='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const norm=(s)=>String(s??'').toLowerCase().replace(/\s+/g,'').replace(/[()\-_/.,์ิีึืุู็่้๊๋ัำะาๆ"]/g,'').replace(/รุ่น|ฟรี/g,'');
async function call(a,p){const r=await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:cfg.token,action:a,...p}),redirect:'follow'});return JSON.parse(await r.text());}

const SRC=[ // [spreadsheetId, sheet, nameCol, imgCol, headerRows]
 ['1GS-N57CCUKPdv98-mn6BRE9ybFRTqQ4aZL2EfGdLKa8','รายการสินค้า',3,1,3],
 ['1C5ZEpCL6jpxp5O95-GIU9z-cBgcru0rLy38WvAFq8XI','TH Product',2,3,2],
 ['1C5ZEpCL6jpxp5O95-GIU9z-cBgcru0rLy38WvAFq8XI','CN Product',2,3,2],
 ['1IoQ0bGYckhWqz0f8-8BH63YqBt1DbWgi_BoJqoh8zp0','Sourcing CN',3,4,3],
];
const byName=new Map();
for(const [id,sheet,nc,ic,hr] of SRC){
  const r=await call('readImages',{spreadsheetId:id,sheet});
  if(!r.ok){console.log('SKIP',sheet,r.error,'(redeploy sheet-sync.gs first?)');continue;}
  const vals=(await call('read',{spreadsheetId:id,sheet})).values;
  let n=0;
  for(let i=hr;i<r.images.length;i++){const u=r.images[i]?.[ic];const nm=norm(vals[i]?.[nc]);if(u&&nm&&!byName.has(nm)){byName.set(nm,u);n++;}}
  console.log(`${sheet}: +${n} image urls`);
}
const m=JSON.parse(fs.readFileSync(`${DATA}/master-lossless.json`,'utf8'));
let filled=0;
for(const row of m.rows){if(row['รูปภาพ(URL)'])continue;const u=byName.get(norm(row['ชื่อสินค้า']));if(u){row['รูปภาพ(URL)']=u;filled++;}}
fs.writeFileSync(`${DATA}/master-lossless.json`,JSON.stringify(m));
console.log('filled รูปภาพ(URL):',filled,'/',m.rows.length,'-> re-run push-lossless + build-review-html');
