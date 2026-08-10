/**
 * Build unified Product Master — CATALOG layer (Dev Master 245 + Express 111),
 * cost-enriched with cascade: NPD Inquiry (SSOT) > 2025 Business > NT Product.
 * Emits master-catalog.json + coverage report.
 */
import fs from 'node:fs';
const RAW = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data/_raw';
const DATA = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const J = (f) => JSON.parse(fs.readFileSync(`${RAW}/${f}.json`, 'utf8'));
const offer = (s) => { const m = String(s ?? '').match(/1688\.com\/offer\/(\d+)/); return m ? m[1] : null; };
const norm = (s) => String(s ?? '').toLowerCase().replace(/\s+/g,'').replace(/[()\-_/.,์ิีึืุู็่้๊๋ัำะาๆ]/g,'').replace(/รุ่น|ฟรี/g,'');
const rowOffer = (row) => { for (const c of row) { const o = offer(c); if (o) return o; } return null; };
const num = (x) => { const n = parseFloat(String(x).replace(/[, ]/g,'')); return isFinite(n) ? n : null; };

// ---------- load cost sources ----------
// NPD seed TSV (cleaned Sourcing CN/TH) — COST SSOT
const tsv = fs.readFileSync(`${DATA}/NPD_Import_Products.tsv`,'utf8').trim().split('\n').map(l=>l.split('\t'));
const SH = tsv[0];
const si = (name) => SH.indexOf(name);
const I = { name:si('ชื่อสินค้า'), link:si('ลิงก์ 1688'), sup:si('ชื่อ Supplier'), moq:si('MOQ'),
  yuan:si('ต้นทุนหยวน/หน่วย'), baht:si('ต้นทุนบาท/ชิ้น'), logo:si('ค่าโลโก้/ชิ้น'), pack:si('ค่าแพ็ค/ชิ้น'),
  ship:si('ค่าส่ง/ชิ้น'), total:si('รวมต้นทุน/ชิ้น'), cbm:si('CBM'), wh:si('โกดัง'), ptype:si('ประเภท'),
  client:si('ลูกค้า/Client (แบรนด์)'), size:si('ขนาดสินค้า'), mat:si('วัสดุ') };
const npdByOffer = new Map(), npdByName = new Map();
for (const r of tsv.slice(1)) {
  const rec = { yuan:num(r[I.yuan]), baht:num(r[I.baht]), logo:num(r[I.logo]), pack:num(r[I.pack]),
    ship:num(r[I.ship]), total:num(r[I.total]), cbm:num(r[I.cbm]), wh:r[I.wh], moq:r[I.moq],
    sup:r[I.sup], client:r[I.client], link:r[I.link], name:r[I.name], src:'NPD Inquiry' };
  const o = offer(r[I.link]); if (o && !npdByOffer.has(o)) npdByOffer.set(o, rec);
  if (r[I.name]) npdByName.set(norm(r[I.name]), rec);
}
// 2025 Business (hdr r1; SKU c2, name c3, yuan c28, baht c29, price300 c9, moq c31) — fallback
const biz = J('2025biz__รายการสินค้า');
const bizBySku = new Map(), bizByOffer = new Map();
for (let i=2;i<biz.length;i++){
  const row=biz[i], sku=String(row[2]??'').trim();
  const rec={ yuan:num(row[28]), baht:num(row[29]), price300:num(row[9]), moq:row[31], src:'2025 Business', link:rowOffer(row) };
  if(/^[A-Z]{2,3}\d{2,4}$/.test(sku) && !bizBySku.has(sku)) bizBySku.set(sku,rec);
  const o=rowOffer(row); if(o && !bizByOffer.has(o)) bizByOffer.set(o,rec);
}
// NT CN Product (hdr r1; name c2, link c4, yuan c15, baht c16, total c38) — express/N8N
const ntcn = J('nt__CN_Product');
const ntByOffer=new Map(), ntByName=new Map();
for(let i=2;i<ntcn.length;i++){ const row=ntcn[i]; if(/ตัวอย่าง/.test(row[2]||''))continue;
  const rec={ yuan:num(row[15]), baht:num(row[16]), total:num(row[38]), src:'NT CN Product', link:row[4] };
  const o=offer(row[4]); if(o&&!ntByOffer.has(o))ntByOffer.set(o,rec); if(row[2])ntByName.set(norm(row[2]),rec); }

function resolveCost(sku, name, o){
  if(o && npdByOffer.has(o)) return {...npdByOffer.get(o), via:'NPD/offer'};
  const nn=norm(name);
  if(npdByName.has(nn)) return {...npdByName.get(nn), via:'NPD/name'};
  if(bizBySku.has(sku)) return {...bizBySku.get(sku), via:'2025biz/SKU'};
  if(o && bizByOffer.has(o)) return {...bizByOffer.get(o), via:'2025biz/offer'};
  if(o && ntByOffer.has(o)) return {...ntByOffer.get(o), via:'NT/offer'};
  if(ntByName.has(nn)) return {...ntByName.get(nn), via:'NT/name'};
  return null;
}

// ---------- build catalog rows ----------
const COLS = ['SKU','ชื่อสินค้า','หมวดหมู่','ช่องทาง','สถานะ','รายละเอียด','ขนาด','วัสดุ','สี','MOQ',
  'ราคาขาย/ชิ้น(฿)','ต้นทุน¥','ต้นทุนบาท/ชิ้น','ค่าโลโก้/ชิ้น','ค่าส่ง/ชิ้น','รวมต้นทุน/ชิ้น','Margin%',
  'Supplier/ซัพ','ลูกค้า/Brand','ลิงก์1688','โกดัง','Lead time','วิธีสกรีน','แหล่งต้นทุน','มีรูป','ขึ้นLive','หมายเหตุ'];
const out=[];
const cov={offer:0,npdName:0,biz:0,bizOffer:0,nt:0,none:0};
const noCost=[];

// Master (general)
for(const r of J('devmaster__รายการสินค้า_Master').slice(1).filter(r=>r[1])){
  const sku=r[1], name=r[2], o=rowOffer(r);
  const c=resolveCost(sku,name,o);
  const sell=num(r[5]);
  const total=c?.total ?? c?.baht ?? null;
  const margin=(sell&&total)?Math.round((1-total/sell)*100):null;
  if(c){ if(c.via==='NPD/offer')cov.offer++; else if(c.via==='NPD/name')cov.npdName++; else if(c.via==='2025biz/SKU')cov.biz++; else if(c.via==='2025biz/offer')cov.bizOffer++; else cov.nt++; } else { cov.none++; noCost.push(sku); }
  out.push({SKU:sku,'ชื่อสินค้า':name,'หมวดหมู่':r[4],'ช่องทาง':'Catalog ทั่วไป','สถานะ':'Active (Live)',
    'รายละเอียด':r[3],'ขนาด':r[11],'วัสดุ':r[12],'สี':'','MOQ':r[10],'ราคาขาย/ชิ้น(฿)':sell,
    'ต้นทุน¥':c?.yuan??'','ต้นทุนบาท/ชิ้น':c?.baht??'','ค่าโลโก้/ชิ้น':c?.logo??'','ค่าส่ง/ชิ้น':c?.ship??'',
    'รวมต้นทุน/ชิ้น':total??'','Margin%':margin??'','Supplier/ซัพ':c?.sup??'','ลูกค้า/Brand':c?.client??'',
    'ลิงก์1688':(r[13]&&r[13]!=='—')?r[13]:(c?.link||''),'โกดัง':c?.wh??'','Lead time':'','วิธีสกรีน':'',
    'แหล่งต้นทุน':c?c.via:'— ไม่มี','มีรูป':r[8],'ขึ้นLive':r[9],'หมายเหตุ':r[3]?'':''});
}
// Express
for(const r of J('devmaster__สินค้าส่งด่วน_Express').slice(1).filter(r=>r[0])){
  const sku=r[0], name=r[2]; const cost=num(String(r[11]).split('-')[0]);
  out.push({SKU:sku,'ชื่อสินค้า':name,'หมวดหมู่':r[3],'ช่องทาง':'Express (ส่งด่วน)','สถานะ':'Active (Live)',
    'รายละเอียด':r[15],'ขนาด':'','วัสดุ':'','สี':r[5],'MOQ':r[9],'ราคาขาย/ชิ้น(฿)':'',
    'ต้นทุน¥':'','ต้นทุนบาท/ชิ้น':cost??'','ค่าโลโก้/ชิ้น':'','ค่าส่ง/ชิ้น':'','รวมต้นทุน/ชิ้น':cost??'','Margin%':'',
    'Supplier/ซัพ':r[1],'ลูกค้า/Brand':'','ลิงก์1688':'','โกดัง':'ไทย','Lead time':r[10],'วิธีสกรีน':r[12],
    'แหล่งต้นทุน':'DevMaster/Express','มีรูป':r[6],'ขึ้นLive':r[8],'หมายเหตุ':r[13]});
}

fs.writeFileSync(`${DATA}/master-catalog.json`, JSON.stringify({cols:COLS,rows:out},null,1));
// report
const withCost=out.filter(x=>x['รวมต้นทุน/ชิ้น']!=='').length;
console.log('CATALOG rows:', out.length, '(Master 245 + Express 111)');
console.log('cost coverage (Master 245):', JSON.stringify(cov));
console.log('  -> general w/ cost:', 245-cov.none, '| no cost:', cov.none);
console.log('total rows with any cost:', withCost, '/', out.length);
const mm=out.filter(x=>x['Margin%']!==''&&x['ช่องทาง'].includes('Catalog'));
console.log('general w/ computable margin:', mm.length);
console.log('no-cost general SKUs (sample):', noCost.slice(0,20).join(','));
const pf={}; noCost.forEach(s=>{const p=String(s).replace(/\d.*/,'');pf[p]=(pf[p]||0)+1;});
console.log('no-cost by prefix:', Object.entries(pf).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join(' '));
fs.writeFileSync(`${DATA}/_nocost-general.json`, JSON.stringify(noCost));
console.log('wrote master-catalog.json');
