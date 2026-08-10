import fs from 'node:fs';
const DATA='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const OUT=`${DATA}/seed`; fs.mkdirSync(OUT,{recursive:true});
const m=JSON.parse(fs.readFileSync(`${DATA}/master-lossless.json`,'utf8'));
const reg=JSON.parse(fs.readFileSync(`${DATA}/suppliers-registry.json`,'utf8'));
const q=(v)=>v===''||v==null?'null':`'${String(v).replace(/'/g,"''")}'`;
const qt=(v,len)=>{const s=String(v??'').slice(0,len);return s===''?'null':`'${s.replace(/'/g,"''")}'`;};
const n=(v)=>{const x=parseFloat(String(v).replace(/[, ]/g,''));return isFinite(x)?x:'null';};
const b=(v)=>/✓|true|yes|มี|ขึ้น/i.test(String(v))?'true':'false';
const PCAT={BG:'กระเป๋า',BK:'เด็ก & เบบี๋',DW:'แก้ว & กระบอกน้ำ',FN:'พัดลมพกพา',GD:'แกดเจ็ต',GM:'เสื้อผ้า',GP:'หมวก',GS:'กิฟต์เซ็ต',KC:'ครัว & กล่องอาหาร',LG:'กระเป๋าเดินทาง',LS:'ไลฟ์สไตล์',PB:'พาวเวอร์แบงก์',PK:'บรรจุภัณฑ์',PT:'สัตว์เลี้ยง',SC:'กลิ่น & สมุนไพร',ST:'เครื่องเขียน',SV:'ของชำร่วย',UM:'ร่ม',EX:'สินค้าส่งด่วน'};
const supCodes=new Set(reg.registered.map(s=>s.code));
const prefix=(sku)=>String(sku).match(/^[A-Z]+/)?.[0]||'LS';

// categories
const prefixes=new Set(m.rows.map(r=>prefix(r.SKU)));
const cats=[...prefixes].map(p=>`('${p}',${q(PCAT[p]||'อื่นๆ')})`);
fs.writeFileSync(`${OUT}/seed_ref.sql`,
 `insert into categories(code,name_th) values\n${cats.join(',\n')}\non conflict do nothing;\n\n`+
 `insert into suppliers(code,name,country,type,offer_1688) values\n`+
 reg.registered.map(s=>`(${q(s.code)},${q(s.name)},${q(s.country)},${q(s.type)},${q(s.offer||'')})`).join(',\n')+`\non conflict do nothing;\n\n`+
 `insert into customers(name) values\n`+reg.customer_brands.map(c=>`(${q(c)})`).join(',\n')+`\non conflict do nothing;\n`);

// products + costs
const tier=(r)=>{const t={};for(const k of ['100','300','500','1000','2000','5000']){const v=r['tier'+k];if(v!==''&&v!=null)t[k]=v;}return Object.keys(t).length?`'${JSON.stringify(t)}'::jsonb`:'null';};
const prodVals=[],costVals=[];
for(const r of m.rows){
 const sc=supCodes.has(r['Supplier-code'])?q(r['Supplier-code']):'null';
 prodVals.push(`(${q(r.SKU)},${qt(r['ชื่อสินค้า'],120)},${q(prefix(r.SKU))},${q(r['ช่องทาง'])},${q(r['สถานะ'])},${qt(r['รายละเอียด'],140)},${qt(r['คุณสมบัติเด่น'],100)},${qt(r['ขนาด/ความจุ'],60)},${qt(r['วัสดุ'],60)},${qt(r['สี'],80)},${n(r['จำนวนสี'])==='null'?'null':n(r['จำนวนสี'])},${q(r['รูปภาพ(URL)'])},${qt(r['MOQ'],30)},${n(r['ราคาขาย/ชิ้น(฿)'])},${tier(r)},${n(r['Margin%'])},${sc},${qt(r['ลูกค้า/Brand'],60)},${q(r['ลิงก์1688'])},${qt(r['ระยะเวลาผลิต/Lead'],40)},${qt(r['วิธีcustomlogo'],40)},${b(r['มีรูป'])},${b(r['ขึ้นLive'])},${qt(r['แหล่งที่มา'],30)},${qt(r['หมายเหตุ'],80)})`);
 costVals.push(`(${q(r.SKU)},${n(r['ต้นทุน¥'])},${n(r['เรท'])},${n(r['ต้นทุนบาท/ชิ้น'])},${n(r['ค่าโลโก้/ชิ้น'])},${n(r['ค่าแพ็ค/ชิ้น'])},${n(r['ค่าส่งจีน(ลัง)'])},${n(r['ค่าส่งมาไทย'])},${n(r['ค่าOEM'])},${n(r['ค่าส่ง/ชิ้น'])},${n(r['รวมต้นทุน/ชิ้น'])},${n(r['กว้าง(cm)'])},${n(r['ยาว(cm)'])},${n(r['สูง(cm)'])},${n(r['CBM'])},${n(r['น้ำหนักกล่อง(kg)'])},${q(r['CBM/KG'])},${n(r['จำนวน/กล่อง'])==='null'?'null':n(r['จำนวน/กล่อง'])},${n(r['CalculatedRate'])},${qt(r['โกดัง'],20)},${qt(r['ประเภทสินค้า'],20)},${qt(r['ขนส่ง'],10)},${qt(r['ของแข็ง/ของนิ่ม'],10)},null,null,null,null,${qt(r['แหล่งต้นทุน'],20)})`);
}
const pcols='sku,name,category_code,channel,status,description,features,size,material,colors,color_count,image_url,moq,sell_price,price_tier,margin_pct,supplier_code,customer_brand,link_1688,lead_time,logo_method,has_image,is_live,source,notes';
const ccols='sku,cost_yuan,rate,cost_thb,logo_cost,pack_cost,ship_cn,ship_to_th,oem_cost,ship_per_unit,total_cost,width,length,height,cbm,box_weight,cbm_kg,per_box,calc_rate,warehouse,product_type,shipping_type,solid_soft,payment_terms,bank_account,wechat,contact_1688,cost_source';
const chunk=(arr,sz)=>{const o=[];for(let i=0;i<arr.length;i+=sz)o.push(arr.slice(i,i+sz));return o;};
chunk(prodVals,250).forEach((c,i)=>fs.writeFileSync(`${OUT}/seed_products_${i+1}.sql`,`insert into products(${pcols}) values ${c.join(',')} on conflict(sku) do nothing;`));
fs.writeFileSync(`${OUT}/seed_costs_1.sql`,`insert into product_costs(${ccols}) values ${costVals.join(',')} on conflict(sku) do nothing;`);
console.log('seed files written:',fs.readdirSync(OUT).join(', '));
console.log('products:',prodVals.length,'| costs:',costVals.length,'| cats:',cats.length,'| suppliers:',reg.registered.length,'| customers:',reg.customer_brands.length);
