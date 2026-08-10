// 1688 reverse-image search for ALL candidates over CDP (Golf's logged-in Chrome :9222).
// Human solves captcha if it appears; we only read public offer data. Pacing = polite.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

let cands = JSON.parse(fs.readFileSync(new URL('./_cand1688.json', import.meta.url)));
const onlyIds = (process.argv[2]||'').split(',').map(s=>parseInt(s,10)).filter(Boolean);
if (onlyIds.length) cands = cands.filter(c=>onlyIds.includes(c.id));
const RAW = path.join(process.cwd(), 'scripts', 'raw-1688-search');
fs.mkdirSync(RAW, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const FX = 5.1; // ¥1 → ฿ (matches 1688's on-page estimate)

// per-candidate relevance keywords + shipping uplift
const REL = {
  1: { kw:/earbud|tws|bluetooth|headphone|headset|earphone/i, ship:0.18 },
  2: { kw:/diffuser|humidifier|aroma|mist|fragrance|essential oil/i, ship:0.18 },
  3: { kw:/charger|charging|wireless|magnetic|3.?in.?1|three.?in.?one/i, ship:0.18 },
  4: { kw:/set|gift|kit|combo|bottle|umbrella|fan/i, ship:0.20 },
  5: { kw:/luggage|suitcase|trolley|travel case|boarding|carry.?on/i, ship:0.30 },
};
const median = a => { if(!a.length) return null; const s=[...a].sort((x,y)=>x-y); const m=s.length>>1; return s.length%2?s[m]:(s[m-1]+s[m])/2; };

async function dl(url, dest){ const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0',referrer:''}}); if(!r.ok) throw new Error('img '+r.status); fs.writeFileSync(dest,Buffer.from(await r.arrayBuffer())); }

async function searchOne(ctx, c){
  const imgPath=path.join(RAW,`q${c.id}.jpg`);
  await dl(c.img,imgPath);
  const page=await ctx.newPage();
  try{
    await page.goto('https://www.1688.com/',{waitUntil:'domcontentloaded',timeout:45000});
    await sleep(2500+Math.random()*2000);
    let inputs=await page.$$('input[type=file]');
    if(!inputs.length){ const cam=await page.$('[class*="camera" i],[class*="imgSearch" i],.search-photo'); if(cam){await cam.click().catch(()=>{});await sleep(1500);inputs=await page.$$('input[type=file]');} }
    if(!inputs.length){ console.log(`#${c.id} no file input`); return {id:c.id,offers:[]}; }
    await inputs[0].setInputFiles(imgPath);
    await sleep(3500);
    const clicked=await page.evaluate(()=>{let b=document.querySelector('.search-btn');if(!b)b=[...document.querySelectorAll('div,span,button,a')].find(e=>/^search for image$/i.test((e.textContent||'').trim()));if(b){b.click();return true;}return false;});
    if(!clicked){ console.log(`#${c.id} no search-for button`); return {id:c.id,offers:[]}; }
    let rpage=page;
    for(let i=0;i<52;i++){   // ~2.2 min window to allow human captcha solve
      await sleep(2500);
      const cand=ctx.pages().reverse().find(p=>/pc-image-search|imageSearch|imageId|air\.1688|s\.1688/i.test(p.url()));
      if(cand)rpage=cand;
      const u=rpage.url();
      if(/punish|captcha|x5secdata/i.test(u)){ console.log(`#${c.id} CAPTCHA_WAIT (${i}) — solve slider in Chrome`); continue; }
      if(/pc-image-search|imageSearch|imageId|air\.1688/i.test(u)) break;
    }
    await sleep(3500);
    try{await rpage.mouse.wheel(0,1800);await sleep(1200);await rpage.mouse.wheel(0,1600);await sleep(1000);}catch{}
    await rpage.screenshot({path:path.join(RAW,`r${c.id}.png`)}).catch(()=>{});
    let offers=await rpage.evaluate(()=>{
      const seen=new Set(),out=[];
      let cards=[...document.querySelectorAll('a,div,li')].filter(e=>{if(e.childElementCount>10)return false;const t=e.innerText||'';if(t.length>240)return false;return /¥\s?[\d.]+/.test(t)&&/(MOQ|sold|Factory|Merchant|Rate)/i.test(t);});
      cards.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
      for(const card of cards){
        const txt=(card.innerText||'').replace(/\s+/g,' ').replace(/find similar/ig,'').trim();
        const pm=txt.match(/¥\s?([\d.]+)/);if(!pm)continue;
        const thb=txt.match(/[≈~]\s?฿?\s?([\d.,]+)/),moq=txt.match(/MOQ\s?([\d,]+)/i);
        const a=card.matches('a')?card:(card.querySelector('a[href]')||card.closest('a[href]'));
        let href=a?a.href.split('?')[0]:'';
        const title=txt.replace(/¥[\s\S]*$/,'').trim().slice(0,70);
        const key=(title.slice(0,30)+pm[1]); if(seen.has(key))continue; seen.add(key);
        const img=card.querySelector('img');
        out.push({price:+pm[1],thb:thb?+String(thb[1]).replace(/,/g,''):null,moq:moq?+moq[1].replace(/,/g,''):null,title,url:href,img:img?(img.src||''):''});
      }
      return out.filter(o=>o.price>0);
    });
    return {id:c.id,offers};
  }catch(e){ console.log(`#${c.id} ERR ${e.message}`); return {id:c.id,offers:[]}; }
  finally{ await page.close().catch(()=>{}); }
}

const b=await chromium.connectOverCDP('http://localhost:9222');
const ctx=b.contexts()[0];
const results=[];
for(const c of cands){
  console.log(`\n=== #${c.id} ${c.name.slice(0,40)} (${c.cat}) ===`);
  const r=await searchOne(ctx,c);
  // clean + relevance + representative
  const rel=REL[c.id]||{kw:/.^/,ship:0.2};
  const relevant=r.offers.filter(o=>rel.kw.test(o.title)).filter(o=>o.moq==null||o.moq<=1000);
  const use=(relevant.length>=2?relevant:r.offers).filter(o=>o.price>=1);
  const prices=use.map(o=>o.price);
  const repYuan=median(prices);
  const goodsThb=repYuan?Math.round(repYuan*FX):null;
  const landed=goodsThb?Math.round(goodsThb*(1+rel.ship)):null;
  console.log(`  offers:${r.offers.length} relevant:${relevant.length} | repr ¥${repYuan} → goods ฿${goodsThb} → landed ฿${landed}`);
  use.slice(0,5).forEach((o,i)=>console.log(`    ${i+1}. ¥${o.price} MOQ${o.moq??'?'} | ${o.title.slice(0,48)}`));
  results.push({...c, offersAll:r.offers.slice(0,15), offersRelevant:relevant.slice(0,8), repYuan, goodsThb, landed, ship:rel.ship});
  await sleep(15000+Math.random()*15000); // polite pacing between candidates
}
// merge into existing results-all.json (keep already-sourced candidates)
const RESF=path.join(RAW,'results-all.json');
let prev=[]; try{prev=JSON.parse(fs.readFileSync(RESF));}catch{}
const byId=new Map(prev.map(r=>[r.id,r]));
for(const r of results) if(r.landed || !byId.has(r.id)) byId.set(r.id,r);
fs.writeFileSync(RESF,JSON.stringify([...byId.values()].sort((a,b)=>a.id-b.id),null,1));
console.log('\n==== DONE → results-all.json (merged) ====');
await b.close();
