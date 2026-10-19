#!/usr/bin/env node
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://127.0.0.1:4177';
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

const browser = await chromium.launch();
let failed = false;

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  await context.route('**/googletagmanager.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await context.route('**/_vercel/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__gpLayoutShifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.hadRecentInput) continue;
        window.__gpLayoutShifts.push({
          value: entry.value,
          sources: entry.sources.map((source) => {
            const node = source.node;
            if (!node) return 'unknown';
            const id = node.id ? `#${node.id}` : '';
            const classes = typeof node.className === 'string'
              ? node.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).map((name) => `.${name}`).join('')
              : '';
            return `${node.tagName?.toLowerCase() || 'node'}${id}${classes}`;
          }),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await page.goto(`${base}/express`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);

  const result = await page.evaluate(() => ({
    cls: window.__gpLayoutShifts.reduce((sum, item) => sum + item.value, 0),
    shifts: window.__gpLayoutShifts
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
  }));
  const pass = result.cls < 0.1;
  failed ||= !pass;
  console.log(`${pass ? 'PASS' : 'FAIL'} ${viewport.name}: CLS=${result.cls.toFixed(4)}`);
  for (const shift of result.shifts) {
    console.log(`  ${shift.value.toFixed(4)}  ${shift.sources.join(', ')}`);
  }

  await context.close();
}

await browser.close();
process.exitCode = failed ? 1 : 0;
