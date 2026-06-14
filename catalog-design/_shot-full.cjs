const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport:{width:880,height:1240}, deviceScaleFactor:1.3 });
  await pg.goto('file://'+path.join(__dirname,'catalog-full.html').replace(/\\/g,'/'));
  await pg.waitForTimeout(2500);
  const sheets = await pg.$$('.sheet');
  for (let i=0;i<sheets.length;i++){
    await sheets[i].screenshot({ path: path.join(__dirname,`full-${String(i+1).padStart(2,'0')}.png`) });
  }
  console.log('shot', sheets.length, 'pages');
  await b.close();
})();
