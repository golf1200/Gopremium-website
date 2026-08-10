// 1688 reverse-image search over CDP (uses Golf's logged-in Chrome on :9222).
// Human solves any captcha; we only navigate + read public offer data. Pacing = polite, no bypass.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const IDX = parseInt(process.argv[2] || '0', 10);
const cands = JSON.parse(fs.readFileSync(new URL('./_cand1688.json', import.meta.url)));
const RAW = path.join(process.cwd(), 'scripts', 'raw-1688-search');
fs.mkdirSync(RAW, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function dl(url, dest) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', referrer: '' } });
  if (!r.ok) throw new Error('img dl ' + r.status);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
  return dest;
}

const c = cands[IDX];
console.log(`\n=== #${c.id} ${c.name} (${c.cat}) ¥?  cost target ~${Math.round(c.price*0.85)}฿ ===`);
const imgPath = path.join(RAW, `q${c.id}.jpg`);
await dl(c.img, imgPath);
console.log('downloaded query image →', imgPath, fs.statSync(imgPath).size, 'bytes');

const b = await chromium.connectOverCDP('http://localhost:9222');
const ctx = b.contexts()[0];
const page = await ctx.newPage();
try {
  await page.goto('https://www.1688.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await sleep(2500);
  // find any file input for image search
  let inputs = await page.$$('input[type=file]');
  console.log('file inputs on home:', inputs.length);
  if (!inputs.length) {
    // click a camera / image-search trigger, then re-scan
    const cam = await page.$('[class*="camera" i], [class*="imgSearch" i], [class*="img-search" i], .search-photo, [aria-label*="拍" ]');
    if (cam) { await cam.click().catch(()=>{}); await sleep(1500); inputs = await page.$$('input[type=file]'); }
    console.log('after camera click, file inputs:', inputs.length);
  }
  if (inputs.length) {
    await inputs[0].setInputFiles(imgPath);
    console.log('uploaded image, waiting for "Search for" button…');
    await sleep(3500);
    // click the "Search for" / 搜同款 / 立即搜索 button in the upload popup (NOT the plain keyword "Search")
    const clicked = await page.evaluate(() => {
      let b = document.querySelector('.search-btn');
      if (!b) b = [...document.querySelectorAll('button,a,div,span')].find(e => /^(search for image|搜同款|立即搜索|搜索同款)$/i.test((e.textContent||'').trim()));
      if (b) { b.click(); return (b.textContent||'').trim(); }
      return null;
    });
    console.log('clicked search-for button:', clicked);
    if (!clicked) {
      const dump = await page.evaluate(() => [...document.querySelectorAll('button,a,div,span')]
        .filter(e=>/search|搜|同款|upload|图片/i.test(e.textContent||'') && (e.textContent||'').length<40 && (e.children||[]).length<=2)
        .slice(0,20).map(e=>e.tagName+'.'+String(e.className).slice(0,30)+' ["'+(e.textContent||'').trim()+'"]'));
      console.log('search-ish elements:\n  '+dump.join('\n  '));
    }
  } else {
    console.log('NO FILE INPUT FOUND — dumping camera-ish elements');
    const cams = await page.$$eval('*', els => els.filter(e=>/camera|拍立淘|图片搜索|img.?search/i.test(e.className+' '+(e.getAttribute&&(e.getAttribute('aria-label')||'')))).slice(0,6).map(e=>e.tagName+'.'+e.className));
    console.log(cams);
  }
  // results may open in a NEW tab — track it
  let rpage = page;
  for (let i=0;i<28;i++){
    await sleep(2500);
    // pick the newest page that looks like image-search results
    const pages = ctx.pages();
    const cand = pages.reverse().find(p=>/imageSearch|youyuan|tab=imageSearch|imageId|s\.1688\.com/i.test(p.url()));
    if (cand) rpage = cand;
    const u = rpage.url();
    if (/punish|captcha|x5secdata/i.test(u)) { console.log('⚠️ CAPTCHA_WAIT — solve the slider in the Chrome window ('+i+')'); continue; }
    if (/imageSearch|youyuan|tab=imageSearch|imageId|s\.1688\.com/i.test(u)) { console.log('on results page:', u.slice(0,90)); break; }
  }
  await sleep(3500);
  try { await rpage.mouse.wheel(0, 1800); await sleep(1500); await rpage.mouse.wheel(0,1500);} catch{}
  await rpage.screenshot({ path: path.join(RAW, `r${c.id}.png`), fullPage:false }).catch(()=>{});
  page._results = rpage;

  // extract offers heuristically (structure-agnostic)
  const offers = await (page._results||page).evaluate(() => {
    const seen=new Set(), out=[];
    // candidate cards = smallest blocks holding a ¥price + a signal word
    let cards=[...document.querySelectorAll('a,div,li')].filter(e=>{
      if(e.childElementCount>10) return false;
      const t=e.innerText||''; if(t.length>240) return false;
      return /¥\s?[\d.]+/.test(t) && /(MOQ|sold|Factory|Merchant|Rate|起订|已售)/i.test(t);
    });
    // prefer the tightest card per price-text
    cards.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    for(const card of cards){
      const txt=(card.innerText||'').replace(/\s+/g,' ').trim();
      const pm=txt.match(/¥\s?([\d.]+)/); if(!pm) continue;
      const thb=txt.match(/[≈~]\s?฿?\s?([\d.,]+)/);
      const moq=txt.match(/MOQ\s?([\d,]+)|起订量?\s?([\d,]+)/i);
      const a=card.matches('a')?card:(card.querySelector('a[href]')||card.closest('a[href]'));
      let href=a?a.href:''; if(href) href=href.split('?')[0];
      const key=href||txt.slice(0,40); if(seen.has(key)) continue; seen.add(key);
      const img=card.querySelector('img'); let src=img?(img.src||img.getAttribute('data-src')||''):'';
      const title=txt.replace(/¥[\s\S]*$/,'').trim().slice(0,60);
      out.push({ price:+pm[1], thb: thb?+String(thb[1]).replace(/,/g,''):null, moq: moq?+((moq[1]||moq[2]||'').replace(/,/g,'')):null, title, url:href, img:src });
    }
    return out.filter(o=>o.price>0).slice(0,15);
  });
  offers.sort((a,b)=>a.price-b.price);
  console.log('\noffers found:', offers.length);
  offers.slice(0,12).forEach((o,i)=>console.log(` ${i+1}. ¥${o.price} ≈฿${o.thb??'?'} MOQ${o.moq??'?'} | ${o.title} | ${(o.url||'').slice(0,50)}`));
  fs.writeFileSync(path.join(RAW, `offers-${c.id}.json`), JSON.stringify(offers,null,1));
  console.log('\n→ saved offers-'+c.id+'.json + r'+c.id+'.png');
} catch(e){ console.error('ERR', e.message); }
finally { await page.close().catch(()=>{}); await b.close(); }
