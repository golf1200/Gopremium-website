import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT=path.resolve('dist');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const fp=path.join(ROOT,p);if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res.statusCode=404;return res.end('404');}res.setHeader('Content-Type',MIME[path.extname(fp)]||'application/octet-stream');fs.createReadStream(fp).pipe(res);});
await new Promise(r=>server.listen(0,r));
const BASE=`http://localhost:${server.address().port}`;
const br=await chromium.launch();const page=await(await br.newContext()).newPage();
const errs=[];page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});page.on('pageerror',e=>errs.push('pageerror: '+e.message));
const R=[];const ck=(n,p,d='')=>R.push([p?'OK ':'FAIL',n,d]);
// home
await page.goto(BASE+'/#/',{waitUntil:'networkidle'});
ck('home renders #app', await page.$('#app *')!==null);
// portfolio
await page.goto(BASE+'/#/portfolio',{waitUntil:'networkidle'});
await page.waitForTimeout(900);
ck('hero slides', (await page.$$('.pf-slide')).length>=5, (await page.$$('.pf-slide')).length+' slides');
ck('gallery cards', (await page.$$('#pfGal .pf-card')).length===18, (await page.$$('#pfGal .pf-card')).length+' cards');
ck('logo marquee', (await page.$$('.pf-mtrack img')).length>=40);
ck('featured cases', (await page.$$('.pf-feat')).length===4);
ck('team band img', await page.$('.pf-band img')!==null);
const body=await page.textContent('.pf');
ck('Toyota วรจักร present', body.includes('Toyota วรจักร'));
ck('jobsdb new copy', body.includes('เพื่อการเข้าถึงลูกค้า'));
ck('no old copy', !body.includes('ต้อนรับพนักงาน'));
// filter interaction
await page.click('.pf-chipf[data-c="umbrella"]');await page.waitForTimeout(300);
const vis=await page.$$eval('#pfGal .pf-card',els=>els.filter(e=>getComputedStyle(e).display!=='none').length);
ck('filter umbrella -> 2', vis===2, vis+' visible');
// lightbox
await page.click('.pf-chipf[data-c="all"]');await page.waitForTimeout(200);
await page.click('#pfGal .pf-card');await page.waitForTimeout(300);
ck('lightbox opens', await page.$eval('#pfLb',e=>e.classList.contains('on')));
// images load (no broken)
const broken=await page.$$eval('.pf img',is=>is.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src')));
ck('no broken images', broken.length===0, broken.join(','));
ck('no console errors', errs.length===0, errs.slice(0,3).join(' | '));
await br.close();server.close();
console.log(R.map(r=>r[0]+' '+r[1]+(r[2]?'  ('+r[2]+')':'')).join('\n'));
console.log(R.some(r=>r[0]==='FAIL')?'\n>>> FAIL':'\n>>> ALL PASS');
