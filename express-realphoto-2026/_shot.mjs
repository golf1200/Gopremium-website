import { chromium } from 'playwright';
const b = await chromium.launch();
const pg = await b.newPage({ viewport:{width:1280,height:1000}, deviceScaleFactor:1 });
const errs=[];
pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await pg.goto('http://localhost:8799/v2.html#/express',{waitUntil:'networkidle',timeout:30000});
await pg.waitForTimeout(1500);
// count cards rendered
const n=await pg.$$eval('.ecard',els=>els.length);
const chips=await pg.$$eval('.echip',els=>els.length);
console.log('ecards:',n,'chips:',chips,'| console errors:',errs.length);
errs.slice(0,5).forEach(e=>console.log('  ERR',e));
await pg.screenshot({path:'express-realphoto-2026/_express-top.png',fullPage:false});
// scroll to first product grid
await pg.evaluate(()=>{const el=document.querySelector('.ecat');if(el)el.scrollIntoView();});
await pg.waitForTimeout(800);
await pg.screenshot({path:'express-realphoto-2026/_express-grid.png',fullPage:false});
await b.close();
