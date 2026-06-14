const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport:{width:900,height:1200}, deviceScaleFactor:1.4 });
  await pg.goto('file://'+path.join(__dirname,'catalog-concepts.html').replace(/\\/g,'/'));
  await pg.waitForTimeout(1800); // fonts + base64
  const sheets = await pg.$$('.sheet');
  for (let i=0;i<sheets.length;i++){
    await sheets[i].screenshot({ path: path.join(__dirname,`shot-${i+1}.png`) });
    console.log('shot-'+(i+1));
  }
  await b.close();
})();
