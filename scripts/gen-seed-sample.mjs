import fs from 'node:fs';
const DATA='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const m=JSON.parse(fs.readFileSync(`${DATA}/master-lossless.json`,'utf8'));
const reg=JSON.parse(fs.readFileSync(`${DATA}/suppliers-registry.json`,'utf8'));
const sup=new Set(reg.registered.map(s=>s.code));
const q=(v)=>v===''||v==null?'null':`'${String(v).replace(/'/g,"''")}'`;
const qt=(v,l)=>{const s=String(v??'').slice(0,l);return s===''?'null':`'${s.replace(/'/g,"''")}'`;};
const n=(v)=>{const x=parseFloat(String(v).replace(/[, ]/g,''));return isFinite(x)?x:'null';};
const pref=(s)=>String(s).match(/^[A-Z]+/)?.[0]||'LS';
const cat=m.rows.filter(r=>r['ช่องทาง'].includes('Catalog')).slice(0,12);
const exp=m.rows.filter(r=>r['ช่องทาง'].includes('Express')).slice(0,8);
const pipe=m.rows.filter(r=>r['สถานะ'].startsWith('Draft')).slice(0,10);
const rows=[...cat,...exp,...pipe];
const P=rows.map(r=>`(${q(r.SKU)},${qt(r['ชื่อสินค้า'],100)},${q(pref(r.SKU))},${q(r['ช่องทาง'])},${q(r['สถานะ'])},${n(r['ราคาขาย/ชิ้น(฿)'])},${n(r['Margin%'])},${sup.has(r['Supplier-code'])?q(r['Supplier-code']):'null'},${qt(r['ลูกค้า/Brand'],40)},${r['รูปภาพ(URL)']?'true':'false'})`);
const C=rows.map(r=>`(${q(r.SKU)},${n(r['ต้นทุน¥'])},${n(r['ต้นทุนบาท/ชิ้น'])},${n(r['รวมต้นทุน/ชิ้น'])},${n(r['CBM'])},${qt(r['โกดัง'],16)},${qt(r['แหล่งต้นทุน'],16)})`);
fs.writeFileSync(`${DATA}/seed/sample.sql`,
`insert into products(sku,name,category_code,channel,status,sell_price,margin_pct,supplier_code,customer_brand,has_image) values ${P.join(',')} on conflict(sku) do nothing;
insert into product_costs(sku,cost_yuan,cost_thb,total_cost,cbm,warehouse,cost_source) values ${C.join(',')} on conflict(sku) do nothing;`);
console.log('sample bytes:',fs.statSync(`${DATA}/seed/sample.sql`).size,'rows:',rows.length);
