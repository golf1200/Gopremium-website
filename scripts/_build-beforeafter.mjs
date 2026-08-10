import sharp from 'sharp';
import fs from 'node:fs';
const rows = JSON.parse(fs.readFileSync('scripts/_express-beforeafter.json','utf8'));
const find = JSON.parse(fs.readFileSync('scripts/_express-qa-findings.json','utf8'));
const fmap = Object.fromEntries(find.map(f=>[f.sku,f]));
const CL = {drinkware:'แก้ว & กระบอกน้ำ',garment:'เสื้อผ้า',hat:'หมวก',umbrella:'ร่ม',bags:'กระเป๋า',powerbank:'พาวเวอร์แบงก์',fan:'พัดลม',lifestyle:'ไลฟ์สไตล์'};
const srcLabel={curate:'Drive ตั้งต้น',assetsReal:'ภาพดิบซัพ',studioReal:'ภาพดิบซัพ',freeReal:'ภาพดิบซัพ',logobk:'backup'};
const sevC={high:'#c0392b',med:'#e08a1e',low:'#999'};
async function thumb(p){ try{ const b=await sharp(p).resize(330,330,{fit:'cover'}).jpeg({quality:70}).toBuffer(); return 'data:image/jpeg;base64,'+b.toString('base64'); }catch{ return ''; } }
// group by category in express order
const order=['drinkware','garment','hat','umbrella','bags','powerbank','fan','lifestyle'];
const groups={}; rows.forEach(r=>{(groups[r.cat]=groups[r.cat]||[]).push(r);});
const cats=order.filter(c=>groups[c]).concat(Object.keys(groups).filter(c=>!order.includes(c)));
let body='';
for(const c of cats){
  let cards='';
  for(const r of groups[c]){
    const bef=await thumb(r.before), aft=await thumb(r.after);
    const f=fmap[r.sku];
    const badge=f?`<span class="badge" style="background:${sevC[f.sev]}">${f.flags.join(' · ')}</span>`:'';
    cards+=`<div class="row ${f?'flagged':''}">
      <div class="meta"><b>${r.sku}</b> ${badge}<div class="nm">${r.name||''}</div>${f?`<div class="qa">⚠ ${f.note}</div>`:''}</div>
      <div class="pair">
        <figure><img src="${bef}"><figcaption>ตั้งต้น · <i>${srcLabel[r.src]||r.src}</i></figcaption></figure>
        <span class="arrow">→</span>
        <figure><img src="${aft}"><figcaption>จัดใหม่ · <i>live</i></figcaption></figure>
      </div></div>`;
  }
  body+=`<h2>${CL[c]||c} <span>(${groups[c].length})</span></h2><div class="grid">${cards}</div>`;
}
const flagged=rows.filter(r=>fmap[r.sku]).length;
const html=`<!doctype html><meta charset=utf8><title>Express · ตั้งต้น vs จัดใหม่</title>
<style>body{font-family:system-ui,"Segoe UI","Sarabun",sans-serif;background:#0f1c38;color:#fff;margin:0;padding:26px}
h1{font-size:22px;margin:0 0 4px}.sub{color:#9fb0cc;font-size:14px;margin:0 0 8px}
h2{margin:26px 0 12px;font-size:17px;border-left:5px solid #f4b223;padding-left:10px}h2 span{color:#9fb0cc;font-size:13px;font-weight:400}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px}
.row{background:#16243f;border-radius:12px;padding:10px}.row.flagged{outline:2px solid rgba(224,138,30,.6)}
.meta{font-size:13px;margin-bottom:8px}.nm{color:#aebbd2;font-size:11.5px;margin-top:2px}
.qa{color:#ffd9a8;font-size:11px;margin-top:3px}
.badge{font-size:9.5px;color:#fff;border-radius:4px;padding:1px 5px;vertical-align:middle}
.pair{display:flex;align-items:center;gap:6px}.pair figure{margin:0;flex:1}
.pair img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;background:#fff;display:block}
figcaption{font-size:10.5px;color:#9fb0cc;text-align:center;margin-top:3px}figcaption i{color:#f4b223;font-style:normal}
.arrow{color:#f4b223;font-size:20px;font-weight:700}</style>
<h1>สินค้าส่งด่วน — เทียบ "รูปตั้งต้น" vs "รูปที่จัดใหม่ (live)"</h1>
<p class="sub">93 SKU · เรียงตามหมวด · กรอบส้ม = ตัวที่ AI QA แฟลกว่ามีประเด็น (${flagged} ตัว) · รูปตั้งต้น = ภาพ Drive/ดิบจากซัพที่เอามาทำ</p>
${body}`;
const out='C:/Users/Golf/AppData/Local/Temp/claude/C--Users-Golf-Documents-Claude-Projects-Gopremium-Website-LIVE/f797190c-af86-4232-a70f-1f4f1e50871f/scratchpad/EXPRESS-before-after.html';
fs.writeFileSync(out,html);
console.log('wrote',out,(html.length/1024/1024).toFixed(1)+'MB');
