import fs from 'node:fs';
const RAW='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data/_raw';
const DATA='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const J=(f)=>JSON.parse(fs.readFileSync(`${RAW}/${f}.json`,'utf8'));
const t=(s)=>String(s??'').replace(/\s+/g,' ').trim();

// captured source-column indices per tab (what my build scripts actually used)
const used={
  'devmaster Master': {hdr:0, keep:[1,2,3,4,5,8,9,10,11,12,13]},
  'devmaster Express':{hdr:0, keep:[0,1,2,3,5,6,8,9,10,11,12,13,15]},
  '2025biz รายการสินค้า':{hdr:1, keep:[2,3,9,28,29,31]},
  'npd Sourcing CN (raw)':{hdr:2, keep:[]}, // used via cleaned seed instead
  'npd Sourcing TH':{hdr:0, keep:[0,2,3,5,6,7,9,10,12,13,23]},
  'nt TH Product':{hdr:1, keep:[0,1,2,4,5,6,8,9,11,12,16,22]},
  'nt CN Product':{hdr:1, keep:[2,4,9,10,12,13,15,16,17,30,38]},
};
const files={
  'devmaster Master':'devmaster__รายการสินค้า_Master',
  'devmaster Express':'devmaster__สินค้าส่งด่วน_Express',
  '2025biz รายการสินค้า':'2025biz__รายการสินค้า',
  'npd Sourcing TH':'npd__Sourcing_TH',
  'nt TH Product':'nt__TH_Product',
  'nt CN Product':'nt__CN_Product',
};
for(const [label,f] of Object.entries(files)){
  const v=J(f); const u=used[label]; const hdr=v[u.hdr]||[];
  const dropped=[];
  hdr.forEach((h,i)=>{ if(t(h) && !u.keep.includes(i)) dropped.push(`[${i}]${t(h)}`); });
  console.log(`\n### ${label}  (${hdr.filter(t).length} named cols, เก็บ ${u.keep.length}, ตัด ${dropped.length})`);
  console.log('ตัดออก: '+(dropped.join(' · ')||'—'));
}
// 2025biz tier matrix note
console.log('\n### 2025biz เพิ่มเติม: คอลัมน์ 48-91 = เมทริกซ์ราคา/กำไรต่อเทียร์ 100/300/500/1000/2000/5000 (ตัดออกทั้งหมด)');
// NPD seed TSV
const SH=fs.readFileSync(`${DATA}/NPD_Import_Products.tsv`,'utf8').split('\n')[0].split('\t');
const seedKeep=['ชื่อสินค้า','ลิงก์ 1688','ชื่อ Supplier','MOQ','ต้นทุนหยวน/หน่วย','ต้นทุนบาท/ชิ้น','ค่าโลโก้/ชิ้น','ค่าส่ง/ชิ้น','รวมต้นทุน/ชิ้น','โกดัง','ลูกค้า/Client (แบรนด์)','ขนาดสินค้า','วัสดุ','รายละเอียด'];
console.log('\n### NPD seed (pipeline) — ตัดจาก 34 คอลัมน์: '+SH.filter(h=>h&&!seedKeep.includes(h)).join(' · '));
