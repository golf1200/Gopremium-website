import fs from 'node:fs';
const SP='C:/Users/Golf/AppData/Local/Temp/claude/C--Users-Golf-Documents-Claude-Projects-Gopremium-Website-LIVE/29ef4b74-aa14-4215-8a55-13ec0d2410e1/scratchpad/';
const scored=JSON.parse(fs.readFileSync(SP+'scored.json','utf8'));
// DB id ↔ name keyword
const want=[
  {id:1, kw:/asaki.*pods3plus/i, cat:'Gadget'},
  {id:2, kw:/aroma diffuser 11/i, cat:'Scent/candle'},
  {id:3, kw:/wireless charger 26/i, cat:'Gadget'},
  {id:4, kw:/gp-gb013/i, cat:'Giftset'},
  {id:5, kw:/gp-tb006/i, cat:'Luggage'},
];
const out=[];
for(const w of want){
  const p=scored.find(x=>w.kw.test(x.name||''));
  if(!p){console.log('NOT FOUND',w.id);continue;}
  out.push({id:w.id, name:p.name, cat:w.cat, price:p.priceMin,
    imgs:(p.imageUrls||[]).slice(0,3), img:(p.imageUrls||[])[0]});
}
fs.writeFileSync('C:/Users/Golf/Documents/Claude/Projects/Gopremium Website LIVE/website/scripts/_cand1688.json',JSON.stringify(out,null,1));
out.forEach(c=>console.log('#'+c.id,c.cat,'|',c.name.slice(0,32),'|',(c.img||'').slice(0,70)));
console.log('wrote',out.length);
