/**
 * MERGE: inject real 481 products + 81 suppliers (from master-lossless) into the
 * prototype.html software shell (login/role/8 modules) -> PLATFORM.html
 */
import fs from 'node:fs';
const ROOT='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform';
const DATA=`${ROOT}/data`;
const m=JSON.parse(fs.readFileSync(`${DATA}/master-lossless.json`,'utf8'));
const reg=JSON.parse(fs.readFileSync(`${DATA}/suppliers-registry.json`,'utf8'));
const imgMap=JSON.parse(fs.readFileSync(`${DATA}/images-map.json`,'utf8'));
const IMG_ROOT='file:///C:/Users/Golf/Documents/Claude/Projects/Gopremium%20Website%20LIVE/website/public';
const num=(v)=>{const x=parseFloat(String(v).replace(/[, ]/g,''));return isFinite(x)?x:null;};
const sstr=(v)=>(v===''||v==null)?'':String(v);
const imgUrl=(sku)=>{const im=imgMap[sku];return im?IMG_ROOT+encodeURI(im.primary).replace(/%2F/g,'/'):'';};
const statusMap=(s)=>String(s).includes('Active')?'published':'draft';

// products count per supplier
const supCount={};
for(const r of m.rows){const c=r['Supplier-code'];if(c)supCount[c]=(supCount[c]||0)+1;}

const PRODUCTS=m.rows.map(r=>({
  code:r.SKU, name:sstr(r['ชื่อสินค้า']), sup:sstr(r['Supplier-code']), client:sstr(r['ลูกค้า/Brand']),
  link:sstr(r['ลิงก์1688']).replace(/^https?:\/\//,''), moq:sstr(r['MOQ']), size:sstr(r['ขนาด/ความจุ']),
  material:sstr(r['วัสดุ']), detail:sstr(r['รายละเอียด']),
  yuan:num(r['ต้นทุน¥']), rate:num(r['เรท'])||5, costBaht:num(r['ต้นทุนบาท/ชิ้น']),
  logo:num(r['ค่าโลโก้/ชิ้น'])||0, pack:num(r['ค่าแพ็ค/ชิ้น'])||0,
  w:num(r['กว้าง(cm)']), l:num(r['ยาว(cm)']), h:num(r['สูง(cm)']), cbm:num(r['CBM']),
  kg:num(r['น้ำหนักกล่อง(kg)']), cbmkg:sstr(r['CBM/KG'])||'CBM', warehouse:sstr(r['โกดัง']),
  type:sstr(r['ประเภทสินค้า'])||'สินค้าทั่วไป', ship:sstr(r['ขนส่ง'])||'รถ', calcRate:num(r['CalculatedRate']),
  qtyBox:num(r['จำนวน/กล่อง']), shipCost:num(r['ค่าส่ง/ชิ้น'])||0, cost:num(r['รวมต้นทุน/ชิ้น']),
  band:'MID', hs:sstr(r['ของแข็ง/ของนิ่ม'])||'ของแข็ง', sell:num(r['ราคาขาย/ชิ้น(฿)']),
  source:sstr(r['แหล่งที่มา'])||'-', status:statusMap(r['สถานะ']),
  channel:sstr(r['ช่องทาง']), cat:sstr(r['หมวดหมู่']), img:imgUrl(r.SKU),
}));
const SUPPLIERS=reg.registered.map(s=>({
  code:s.code, name:sstr(s.name), country:s.country==='จีน'?'CN':'TH',
  contact:(s.type||'')+(s.offer?(' · 1688/'+s.offer):''), status:s.type==='factory'?'Deal':(s.type==='OEM service'?'OEM':'Spare'),
  products:supCount[s.code]||0, client:''
}));

const J=(x)=>JSON.stringify(x);
let html=fs.readFileSync(`${ROOT}/prototype.html`,'utf8');
const before=html.length;
html=html.replace(/var SUPPLIERS=\[[\s\S]*?\n\];/, 'var SUPPLIERS='+J(SUPPLIERS)+';');
html=html.replace(/var PRODUCTS=\[[\s\S]*?\n\];/,  'var PRODUCTS='+J(PRODUCTS)+';');
// tag the header so it's clearly the real-data build
html=html.replace(/<title>[\s\S]*?<\/title>/, '<title>GoPremium Platform — ข้อมูลจริง 481</title>');

// ---- inject "sources" module (Data Sources & Files directory) ----
// 1) NAVDEF entry
html=html.replace('  security:{t:"Security Model",c:"โครงความปลอดภัย",ic:"🔒"},\n};',
  '  security:{t:"Security Model",c:"โครงความปลอดภัย",ic:"🔒"},\n  sources:{t:"แหล่งข้อมูล & ไฟล์",c:"Data Sources · ที่มา 4 ไฟล์ · ลิงก์ทั้งหมด",ic:"🗃️"},\n};');
// 2) sidebar group
html=html.replace('{label:"ระบบ", keys:["admin","security"]}', '{label:"ข้อมูล & ระบบ", keys:["sources","admin","security"]}');
// 3) role nav (Management / Sourcing / Admin only — มีลิงก์ไฟล์ที่มีต้นทุน)
html=html.replace('"butler","team","security"], cost:true, approve:true, admin:false}', '"butler","team","sources","security"], cost:true, approve:true, admin:false}');
html=html.replace('"npd","pricing","security"], cost:true, approve:false', '"npd","pricing","sources","security"], cost:true, approve:false');
html=html.replace('"butler","team","admin","security"], cost:true, approve:true, admin:true}', '"butler","team","admin","sources","security"], cost:true, approve:true, admin:true}');
// 4) dispatch map
html=html.replace('security:vSecurity}[k]', 'security:vSecurity,sources:vSources}[k]');
// 5) vSources() function
const DIR="file:///C:/Users/Golf/Documents/Claude/Projects/COWORK%20Agent/GoPremium-Platform/data";
const SHEET="https://docs.google.com/spreadsheets/d/1LDR6VIqCZR4Gdt3thPqGrvkOfOnSHJHem7KFgf71rnE/edit";
const SB="https://supabase.com/dashboard/project/jrutfaqhhexgojmvioyn";
const vSourcesFn=`
function linkrow(href,t,d){return '<a href="'+href+'" target="_blank" style="display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:10px;padding:11px 13px;margin-bottom:8px"><b style="color:var(--navy)">'+t+'</b><div style="font-size:12px;color:var(--muted)">'+d+'</div></a>';}
function srow(a,b){return '<tr><td><b>'+a+'</b></td><td>'+b+'</td></tr>';}
function vSources(){
  var pub=PRODUCTS.filter(function(x){return x.status==="published";}).length, draft=PRODUCTS.length-pub;
  var img=PRODUCTS.filter(function(x){return x.img;}).length;
  var nocost=PRODUCTS.filter(function(x){return (x.channel||"").indexOf("Catalog")>=0 && !x.cost;}).length;
  var clients={};PRODUCTS.forEach(function(x){if(x.client)clients[x.client]=1;});
  var h=hint("ศูนย์รวม <b>แหล่งข้อมูล & ไฟล์ทั้งหมด</b> — เปิดจากซอฟต์แวร์ที่เดียว (ที่มา 4 ไฟล์ · SSOT · ลิงก์ Sheet/Supabase/ไฟล์)");
  h+='<div class="kpis">'+kpi("สินค้าทั้งหมด",PRODUCTS.length)+kpi("Catalog (Live)",pub)+kpi("Pipeline (Draft)",draft)+kpi("มีรูป",img)+kpi("โรงงาน/ซัพ",SUPPLIERS.length)+kpi("⛔ ต้องขอราคา",nocost)+'</div>';
  h+='<div class="grid2"><div>';
  h+='<div class="panel"><h3>📁 ไฟล์ & ลิงก์ (เปิดจากตรงนี้)</h3>'+
    linkrow("${SHEET}","📊 Google Sheet (Dev Master)","ตัวจริง — ทีมแก้ที่นี่ · Product Master/Suppliers/Customers")+
    linkrow("${SB}","🟢 Supabase Dashboard","ฐานข้อมูล + RLS + Activity Log (backend)")+
    linkrow("${DIR}/PRODUCT-MASTER-lossless.csv","📥 PRODUCT-MASTER-lossless.csv","เปิด Excel · 481×75 คอลัมน์")+
    linkrow("${DIR}/DUPLICATE-SSOT-ANALYSIS.md","📄 รายงาน Duplicate / SSOT","วิเคราะห์เต็ม")+
    linkrow("${DIR}/master-lossless.json","🗄️ master-lossless.json","ไฟล์ต้นทาง (ทุกสคริปต์อ่านจากนี่)")+
    linkrow("${DIR}/suppliers-registry.json","🏭 suppliers-registry.json","81 โรงงาน + 32 ลูกค้า")+'</div>';
  h+='<div class="panel"><h3>⚠️ ช่องว่างที่ต้องตาม</h3><ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.9">'+
    '<li>Catalog ไม่มีต้นทุน <b style="color:var(--red)">'+nocost+'</b> ตัว — margin ไม่รู้ (ต้องขอราคาซัพ)</li>'+
    '<li>รูป pipeline ยังไม่มี <b>'+(PRODUCTS.length-img)+'</b> ตัว</li>'+
    '<li>Pipeline draft <b>'+draft+'</b> ตัว รออนุมัติ + ตั้งราคา</li></ul></div></div><div>';
  h+='<div class="panel"><h3>🗂️ 4 แหล่งข้อมูล & SSOT</h3><table><thead><tr><th>ไฟล์ / tab</th><th>เป็น SSOT ของ</th></tr></thead><tbody>'+
    srow("Dev Master / Master+Express","Identity · SKU · ราคาขาย · สถานะเว็บ")+
    srow("NPD Inquiry หาของ","💰 ต้นทุน + รายละเอียด + โลจิสติกส์")+
    srow("2025 Business","ราคา tier 100–5,000 (subset Dev Master)")+
    srow("NT Supplier NPD","ทะเบียนโรงงาน (SUP-codes)")+'</tbody></table></div>';
  h+='<div class="panel"><h3>🔁 Duplicate ที่พบ</h3><table><tbody>'+
    srow("2025biz ⊂ Dev Master","91 SKU ซ้ำครบ 100% → ใช้ enrich ไม่นับใหม่")+
    srow('"Supplier" = ลูกค้า',SUPPLIERS.length+" โรงงาน vs "+Object.keys(clients).length+" ลูกค้า/แบรนด์ (แยกแล้ว)")+
    srow("Pipeline dedupe","ตัด dup 82 · ออก SKU จริงครบ")+'</tbody></table></div></div></div>';
  return h;
}
`;
html=html.replace('function render(){', vSourcesFn+'\nfunction render(){');

fs.writeFileSync(`${ROOT}/PLATFORM.html`, html, 'utf8');
console.log('PLATFORM.html written. size',before,'->',html.length);
console.log('PRODUCTS:',PRODUCTS.length,'| SUPPLIERS:',SUPPLIERS.length,'| with sell:',PRODUCTS.filter(p=>p.sell).length,'| with img:',PRODUCTS.filter(p=>p.img).length);
console.log('published:',PRODUCTS.filter(p=>p.status==='published').length,'| draft:',PRODUCTS.filter(p=>p.status==='draft').length);
