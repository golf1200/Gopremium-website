import fs from 'node:fs';
const RAW = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data/_raw';
const DATA = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const J = (f) => JSON.parse(fs.readFileSync(`${RAW}/${f}.json`, 'utf8'));
const offer = (s) => { const m = String(s ?? '').match(/1688\.com\/offer\/(\d+)/); return m ? m[1] : null; };
const norm = (s) => String(s ?? '').toLowerCase().replace(/\s+/g,'').replace(/[()\-_/.,์ิีึืุู็่้๊๋ัำะาๆ]/g,'').replace(/รุ่น|ฟรี|สแตนเลส|สีหยก/g,'');
const rowOffer = (row) => { for (const c of row) { const o = offer(c); if (o) return o; } return null; };

// Dev Master Master
const dmM = J('devmaster__รายการสินค้า_Master').slice(1).filter(r=>r[1]);
// NPD seed TSV
const tsv = fs.readFileSync(`${DATA}/NPD_Import_Products.tsv`,'utf8').trim().split('\n').map(l=>l.split('\t'));
const seed = tsv.slice(1); // name idx3, link idx5, cost฿ idx13, total idx28
const seedByOffer = new Map(), seedByName = new Map();
for (const r of seed){ const o=offer(r[5]); if(o) seedByOffer.set(o,r); if(r[3]) seedByName.set(norm(r[3]),r); }
// 2025biz SKU -> row (hdr r1; SKU col2)
const biz = J('2025biz__รายการสินค้า');
const bizBySku = new Map();
for (let i=2;i<biz.length;i++){ const s=String(biz[i][2]??'').trim(); if(/^[A-Z]{2,3}\d{2,4}$/.test(s) && !bizBySku.has(s)) bizBySku.set(s,biz[i]); }

let viaOffer=0, viaName=0, viaBiz=0, none=0, hasLink=0;
const noneList=[];
for (const r of dmM){
  const sku=r[1], name=r[2], o=rowOffer(r);
  if(o) hasLink++;
  if(o && seedByOffer.has(o)) viaOffer++;
  else if(seedByName.has(norm(name))) viaName++;
  else if(bizBySku.has(sku)) viaBiz++;
  else { none++; noneList.push(sku); }
}
console.log('Dev Master Master:', dmM.length);
console.log('  has 1688 link in row:', hasLink);
console.log('  cost via NPD offer-id :', viaOffer);
console.log('  cost via NPD name     :', viaName);
console.log('  cost via 2025biz SKU  :', viaBiz);
console.log('  NO cost source        :', none);
console.log('  sample no-cost SKUs   :', noneList.slice(0,30).join(','));
// prefix of no-cost
const pf={}; noneList.forEach(s=>{const p=String(s).replace(/\d.*/,'');pf[p]=(pf[p]||0)+1;});
console.log('  no-cost by prefix     :', Object.entries(pf).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join(' '));
console.log('NPD seed records:', seed.length, '| with offer-id:', seedByOffer.size, '| 2025biz SKUs:', bizBySku.size);
