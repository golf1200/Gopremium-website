const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport:{width:1240,height:900}, deviceScaleFactor:1.2 });
  await pg.goto('file://'+path.join(__dirname,'catalog-full-landscape.html').replace(/\\/g,'/'));
  await pg.waitForTimeout(2500);
  const sheets = await pg.$$('.sheet');
  for (let i=0;i<sheets.length;i++){
    await sheets[i].screenshot({ path: path.join(__dirname,`ls-${String(i+1).padStart(2,'0')}.png`) });
  }
  console.log('shot', sheets.length, 'landscape pages');
  await b.close();
})();
