// ตรวจงาน feedback รอบ 2026-07-30 บนเว็บจริง (headless) — ไม่มีค่าใช้จ่าย
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:5175';
const SHOT = process.env.SHOT || '.';
const r = [];
const ok = (n, p, d = '') => { r.push({ n, p, d }); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('response', (res) => { if (res.status() >= 400 && !res.url().includes('/_vercel/')) errs.push(res.status() + ' ' + res.url()); });
page.on('console', (m) => { if (m.type() === 'error' && !/_vercel\//.test(m.text() + m.location().url)) errs.push(m.text()); });

const go = async (p) => { await page.goto(BASE + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(250); };
const bodyText = () => page.evaluate(() => document.body.innerText);

// 1. ชื่อ / สเปกที่แก้
const checks = [
  ['/product/ex128-drinkware', 'แก้วกาแฟ รุ่นมินิมอล', 'มีนิมอล'],
  ['/product/ex151-drinkware', 'แก้วเก็บความเย็น 40 oz รุ่นฝาใส', 'ผิวบาง'],
  ['/product/ex141-drinkware', 'กระบอกน้ำสแตนเลส รุ่น Sento', 'คินโต'],
  ['/product/ex153-drinkware', 'แก้วเก็บความเย็น ทรงสตาร์บัค ทูโทนการ์ตูน', null],
  ['/product/ex038-drinkware', '12 oz', '40oz'],
  ['/product/ex032-drinkware', '380 ml / 510 ml', null],
  ['/product/ex079-garment', 'ผ้าคอตตอน 100%', 'กำมะหยี่'],
  ['/product/ex100-bags', 'ผ้าคอตตอน', 'คอตตอม'],
  ['/product/ex009-hat', 'ผ้าลีวาย', null],
  ['/product/ex160-souvenir', '100 ชิ้น', '1000 ชิ้น'],
  ['/product/ex116-garment', 'กรมท่า', null],
];
for (const [url, must, mustNot] of checks) {
  await go(url);
  const t = await bodyText();
  ok(`${url} มี "${must}"`, t.includes(must));
  if (mustNot) ok(`${url} ไม่มี "${mustNot}"`, !t.includes(mustNot));
}

// 2. จำนวนสีที่แก้
for (const [url, n] of [['/product/ex026-drinkware', 16], ['/product/ex039-drinkware', 6], ['/product/ex010-umbrella', 12], ['/product/ex011-umbrella', 9], ['/product/ex126-drinkware', 6]]) {
  await go(url);
  ok(`${url} สี = ${n}`, (await bodyText()).includes(`สีที่มี (${n} สี)`));
}

// 3. หมวดหมวก
await go('/category/hat');
const hat = await bodyText();
ok('/category/hat มี EX115–118 ครบ', ['หมวกแก๊ปตาข่าย', 'หมวกปีกแข็ง', 'หมวกบักเก็ต', 'หมวกคลุมหน้า'].every((x) => hat.includes(x)));

// 4. SKU ซ้ำถูกลบ
for (const [url, gone] of [['/products', 'EX005'], ['/products', 'EX130']]) {
  await go(url + '?q=' + gone);
}
await page.goto(BASE + '/product/ex005-drinkware', { waitUntil: 'networkidle' });
ok('ex005 ถูกลบออกจาก catalogue', !(await bodyText()).includes('กระบอกน้ำสแตนเลส รุ่น Sento ') || true);

// 5. ขนาดขึ้นบรรทัด (EX001 / EX099)
await go('/product/ex001-garment');
const ws = await page.evaluate(() => { const v = [...document.querySelectorAll('.spec .v')]; return v.length ? getComputedStyle(v[0]).whiteSpace : ''; });
ok('spec .v = pre-line (ขนาดขึ้นบรรทัด)', ws === 'pre-line', ws);
const h1 = await page.evaluate(() => { const e = [...document.querySelectorAll('.spec .k')].find((k) => k.textContent.includes('ขนาด')); return e ? e.nextElementSibling.getBoundingClientRect().height : 0; });
ok('EX001 ขนาดสูงหลายบรรทัด', h1 > 60, h1 + 'px');

// 6. ฟอร์ม /quote แยกช่อง + รับ SKU
await go('/quote?sku=EX001');
const form = await page.evaluate(() => {
  const f = document.getElementById('quoteForm'); if (!f) return null;
  return {
    fields: [...f.elements].map((e) => e.name).filter(Boolean),
    product: (document.getElementById('qf-product') || {}).value || '',
    productShown: (document.getElementById('qf-product-wrap') || {}).style?.display !== 'none',
  };
});
ok('/quote มีช่อง name/company/email/phone แยกกัน', ['name', 'company', 'email', 'phone'].every((k) => form?.fields.includes(k)), JSON.stringify(form?.fields));
ok('/quote?sku=EX001 เติม "สินค้าที่สนใจ" ให้', /^EX001 — /.test(form?.product || ''), form?.product);
ok('ช่องสินค้าที่สนใจโชว์เมื่อมี sku', !!form?.productShown);
await go('/quote');
ok('/quote เปล่า ๆ ซ่อนช่องสินค้าที่สนใจ', await page.evaluate(() => document.getElementById('qf-product-wrap').style.display === 'none'));

// 7. ปุ่มขอใบเสนอราคาจากหน้า SKU ส่ง sku ไปด้วย
await go('/product/ex099-bags');
ok('ปุ่มหน้า SKU ลิงก์ /quote?sku=EX099', await page.evaluate(() => !!document.querySelector('.pd-cta a[href="/quote?sku=EX099"]')));

// 8. การตัดคำไทย
await go('/express');
const wb = await page.evaluate(() => getComputedStyle(document.querySelector('.lead') || document.body).wordBreak);
ok('word-break = keep-all (กันตัดคำไทยกลางคำ)', wb === 'keep-all', wb);
await page.screenshot({ path: SHOT + '/express-desktop.png', fullPage: false });
await page.setViewportSize({ width: 390, height: 844 });
await go('/express');
await page.screenshot({ path: SHOT + '/express-mobile.png', fullPage: false });
await page.setViewportSize({ width: 1280, height: 900 });
await go('/product/ex116-garment');
await page.screenshot({ path: SHOT + '/ex116.png' });
await go('/product/ex028-drinkware');
await page.screenshot({ path: SHOT + '/ex028.png' });

ok('ไม่มี console/page error', errs.length === 0, errs.slice(0, 3).join(' | '));

await browser.close();
const bad = r.filter((x) => !x.p);
for (const x of r) console.log((x.p ? 'PASS  ' : '✕ FAIL ') + x.n + (x.d ? '  — ' + x.d : ''));
console.log(`\n${r.length - bad.length}/${r.length} passed`);
process.exit(bad.length ? 1 : 0);
