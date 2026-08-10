import fs from 'node:fs';
const DIR = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data/_raw';
const J = (f) => JSON.parse(fs.readFileSync(`${DIR}/${f}.json`, 'utf8'));
const norm = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, '').replace(/[()\-_/.,]/g, '').replace(/รุ่น|ฟรี/g, '');
const offer = (s) => { const m = String(s ?? '').match(/1688\.com\/offer\/(\d+)/); return m ? m[1] : null; };
const col = (rows, c, from) => rows.slice(from).map(r => r[c]).filter(x => x !== '' && x != null);
const uniq = (a) => [...new Set(a)];

// ---- load ----
const dmM = J('devmaster__รายการสินค้า_Master');      // hdr r0; SKU[1] name[2] price[5] link[13]
const dmE = J('devmaster__สินค้าส่งด่วน_Express');     // hdr r0; SKU[0] sup[1] name[2]
const biz = J('2025biz__รายการสินค้า');                // hdr r1; SKU[2] name[3] cost¥[28] cost฿[29] (links somewhere)
const cn  = J('npd__Sourcing_CN');                      // hdr r2; client[1] name[3] link[5] cost¥[16] cost฿[17]
const th  = J('npd__Sourcing_TH');                      // hdr r0; sup[2] name[3] cost[12]
const ntTH= J('nt__TH_Product');                        // hdr r1; sup[0] name[2] cost[11]
const ntCN= J('nt__CN_Product');                        // hdr r1; name[2] link[4] cost¥[15]
const sup = J('nt__Supplier');                          // hdr r0; code[0] name[1]

// ---- distinct products ----
const dmSku = uniq(col(dmM,1,1).map(String));
const bizSku= uniq(col(biz,2,2).map(String).filter(x=>/^[A-Z]{2,3}\d{2,4}$/.test(x)));
const exSku = uniq(col(dmE,0,1).map(String));

console.log('## Counts (distinct)');
console.log('Dev Master / Master SKU :', dmSku.length);
console.log('Dev Master / Express SKU:', exSku.length);
console.log('2025biz / รายการสินค้า SKU:', bizSku.length);

// ---- SKU overlap Dev Master Master vs 2025biz ----
const inBoth = dmSku.filter(s => bizSku.includes(s));
const onlyDm = dmSku.filter(s => !bizSku.includes(s));
const onlyBiz= bizSku.filter(s => !dmSku.includes(s));
console.log('\n## SKU overlap: Dev Master Master  vs  2025 Business');
console.log('in BOTH        :', inBoth.length, '  eg', inBoth.slice(0,8).join(','));
console.log('only Dev Master:', onlyDm.length, '  eg', onlyDm.slice(0,8).join(','));
console.log('only 2025biz   :', onlyBiz.length, '  eg', onlyBiz.slice(0,8).join(','));
// prefix breakdown of dev master
const pref = {}; dmSku.forEach(s=>{const p=s.replace(/\d.*/,'');pref[p]=(pref[p]||0)+1;});
console.log('Dev Master SKU prefixes:', Object.entries(pref).map(([k,v])=>`${k}:${v}`).join(' '));

// ---- 1688 offer-id cross-source ----
const offSet = (rows,c,from)=>uniq(col(rows,c,from).map(offer).filter(Boolean));
const oBiz = offSet(biz, 33, 2).concat(offSet(biz,34,2)); // link maybe col ~33; also scan all cols
// scan biz for any offer ids across all cols
const scanOffers = (rows,from)=>{const s=new Set();for(let r=from;r<rows.length;r++)for(const cell of rows[r]){const o=offer(cell);if(o)s.add(o);}return [...s];};
const offBiz = scanOffers(biz,2);
const offCN  = scanOffers(cn,3);
const offNtCN= scanOffers(ntCN,2);
const offDm  = scanOffers(dmM,1);
console.log('\n## 1688 offer-id footprint (distinct offer ids)');
console.log('2025biz:', offBiz.length, '| npd CN:', offCN.length, '| nt CN:', offNtCN.length, '| Dev Master Master:', offDm.length);
const inter=(a,b)=>a.filter(x=>b.includes(x));
console.log('offer overlap  biz∩npdCN :', inter(offBiz,offCN).length);
console.log('offer overlap  npdCN∩ntCN:', inter(offCN,offNtCN).length);
console.log('offer overlap  biz∩ntCN  :', inter(offBiz,offNtCN).length);

// ---- name-keyed distinct + rough overlap vs Dev Master names ----
const dmNames = uniq(col(dmM,2,1).map(norm));
const distinctNames = (rows,c,from)=>uniq(col(rows,c,from).map(String).filter(x=>x.trim()&&!/^\(ตัวอย่าง\)|^#|null/i.test(x)).map(s=>s)).filter((v,i,a)=>a.indexOf(v)===i);
function report(label, rows, c, from){
  const names = uniq(col(rows,c,from).map(String).filter(x=>x.trim() && !/ตัวอย่าง/.test(x)));
  const nn = uniq(names.map(norm));
  const matched = nn.filter(n => dmNames.some(d => d && n && (d.includes(n)||n.includes(d)) && Math.min(d.length,n.length)>=4));
  console.log(`${label}: ${names.length} raw names, ~${nn.length} distinct(norm), ~${matched.length} look-like-already-in-DevMaster, ~${nn.length-matched.length} look-NEW`);
}
console.log('\n## Name-keyed sources vs Dev Master (rough fuzzy)');
report('npd Sourcing CN  [name col3]', cn, 3, 3);
report('npd Sourcing TH  [name col3]', th, 3, 1);
report('nt  TH Product   [name col2]', ntTH, 2, 2);
report('nt  CN Product   [name col2]', ntCN, 2, 2);

// ---- suppliers ----
console.log('\n## Suppliers');
const supRows = sup.slice(1).filter(r=>r[0]);
console.log('nt Supplier master:', supRows.length, 'vendors ->', supRows.map(r=>`${r[0]}=${String(r[1]).slice(0,18)}`).slice(0,20).join(' | '));
