// Read 1688 search results → apply Pricing V3 → emit UPDATE SQL for competitor_products.
import fs from 'node:fs';
const RES = JSON.parse(fs.readFileSync(new URL('./raw-1688-search/results-all.json', import.meta.url)));

// --- Pricing V3 (mirrors PLATFORM-clickup.html prCalc; v=comm3+defect3=6%, floor 18%) ---
const PR_TIERS=[{max:20,mult:4,d:[0,.12,.20,.30]},{max:50,mult:2.5,d:[0,.12,.20,.30]},{max:300,mult:1.75,d:[0,.07,.10,.14]},{max:500,mult:1.6,d:[0,.06,.09,.12]},{max:800,mult:1.5,d:[0,.05,.07,.09]},{max:1000,mult:1.4,d:[0,.03,.05,.06]},{max:1e9,mult:1.35,d:[0,.02,.03,.03]}];
const V=0.06, FLOOR=0.18;
const tierOf=c=>PR_TIERS.find(t=>c<t.max)||PR_TIERS[PR_TIERS.length-1];
function prCalc(cost,qi){const t=tierOf(cost);const list=cost*t.mult*(1-t.d[qi]);const floor=cost/(1-V-FLOOR);let price=Math.round(Math.max(list,floor));if((price-cost-price*V)/price<FLOOR-1e-9)price+=1;const profit=price-cost-price*V;return{price,margin:profit/price};}

const q=s=>s==null?'NULL':"'"+String(s).replace(/'/g,"''")+"'";
const n=v=>v==null||isNaN(v)?'NULL':+v;
const jb=a=>a&&a.length?("'"+JSON.stringify(a).replace(/'/g,"''")+"'::jsonb"):'NULL';
const sql=[];
console.log('id | landed → V3@300 | margin | vs competitor');
for(const r of RES){
  if(!r.landed){ console.log(`#${r.id} no landed cost (0 offers) — skip`); continue; }
  const v3=prCalc(r.landed,1); // qty 300 = catalog convention
  const comp=r.price;
  const cheaper= comp? Math.round((comp - v3.price)/comp*100) : null;
  const best=(r.offersRelevant&&r.offersRelevant[0])||(r.offersAll&&r.offersAll[0])||{};
  const offers=(r.offersRelevant&&r.offersRelevant.length?r.offersRelevant:r.offersAll||[]).slice(0,6)
    .map(o=>({price:o.price,moq:o.moq,title:o.title,url:o.url}));
  console.log(`#${r.id} ฿${r.landed} → ฿${v3.price} | ${Math.round(v3.margin*100)}% | คู่แข่ง ฿${comp} (${cheaper>=0?'ถูกกว่า':'แพงกว่า'} ${Math.abs(cheaper)}%)`);
  sql.push(`update competitor_products set yuan_cost=${n(r.repYuan)}, landed_cost=${n(r.landed)}, sell_price_v3=${n(v3.price)}, margin_v3=${n(+(v3.margin).toFixed(3))}, cheaper_pct=${n(cheaper)}, best_1688_url=${q(best.url||null)}, offers_1688=${jb(offers)}, status='sourcing', sourced_at=now() where id=${r.id};`);
}
fs.writeFileSync(new URL('./raw-1688-search/update.sql', import.meta.url), sql.join('\n'));
console.log('\n→ wrote update.sql ('+sql.length+' rows)');
