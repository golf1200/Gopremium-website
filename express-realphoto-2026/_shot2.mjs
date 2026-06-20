import { chromium } from 'playwright';
const b = await chromium.launch();
for (const route of ['#/','#/express']){
  const pg = await b.newPage({viewport:{width:1280,height:900}});
  const errs=[];
  pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('http://localhost:8799/v2.html'+route,{waitUntil:'networkidle',timeout:30000});
  await pg.waitForTimeout(1000);
  console.log(route,'-> pageerrors:',errs.length, errs.slice(0,3));
  await pg.close();
}
await b.close();
