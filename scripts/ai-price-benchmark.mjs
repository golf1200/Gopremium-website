/**
 * AI reference pricing for GoPremium's priceless SKUs.
 * Benchmarks each SKU against competitor data (giftwise primary @qty 300),
 * then sets OUR price ~10% BELOW the competitor median (price-war strategy).
 * Outputs _pricing/result.json + a console summary. Does NOT touch the sheet (separate push step).
 */
import fs from 'node:fs';
const ROOT = 'C:/Users/Golf/Documents/Claude/Projects/Gopremium Website LIVE';
const UNDERCUT = 0.10;           // 10% below competitor median
const skus = JSON.parse(fs.readFileSync('_pricing/skus.json', 'utf8'));

// --- enrich from live catalogue-data.js ---
const cat = fs.readFileSync('public/catalogue-data.js', 'utf8').split(/\r?\n/)[0];
const live = JSON.parse(cat.slice(cat.indexOf('[')).replace(/;\s*$/, ''));
const liveBy = {};
for (const p of live) liveBy[p.sku] = p;

// --- giftwise (primary benchmark) ---
const gw = JSON.parse(fs.readFileSync(ROOT + '/giftwise-scrape/products.json', 'utf8'));
function p300(prod) {
  if (prod.priceTiers && prod.priceTiers.length) {
    const t = prod.priceTiers.filter(x => x.price > 0);
    if (t.length) {
      const exact = t.find(x => x.qty === 300);
      if (exact) return exact.price;
      t.sort((a, b) => Math.abs(a.qty - 300) - Math.abs(b.qty - 300));
      return t[0].price;
    }
  }
  if (prod.minPrice > 0) return prod.minPrice;
  if (prod.maxPrice > 0) return prod.maxPrice;
  return null;
}
const gwPriced = gw.map(p => ({ name: p.name || '', category: p.category || '', price: p300(p) }))
                   .filter(p => p.price >= 8 && p.price < 5000); // drop scrape junk (฿1-2 entries)

// giftmanufactory (premium competitor) — fallback for thin tech/travel/giftset pools
const gm = JSON.parse(fs.readFileSync(ROOT + '/competitor-scrape/data/giftmanufactory/products.json', 'utf8'));
const gmPriced = gm.map(p => ({ name: p.name || '', category: p.category || '', price: p.priceMin }))
                   .filter(p => p.price >= 8 && p.price < 5000);
const GM_MAP = { 'แกดเจ็ต': 'Tech Products', 'พาวเวอร์แบงก์': 'Tech Products', 'กระเป๋าเดินทาง': 'Travel Essentials', 'กิฟต์เซ็ต': 'Promotional Gifts' };

// per-category sanity clamp [floor, cap] for OUR price (safety net for thin/dirty benchmark pools)
const CLAMP = {
  'กระเป๋า': [25, 450], 'แก้ว & กระบอกน้ำ': [60, 350], 'ไลฟ์สไตล์': [30, 500],
  'เครื่องเขียน': [15, 160], 'พัดลมพกพา': [60, 300], 'กลิ่น & สมุนไพร': [35, 260],
  'กิฟต์เซ็ต': [100, 500], 'แกดเจ็ต': [90, 500], 'ของชำร่วย': [15, 90], 'ร่ม': [80, 350],
  'เด็ก & เบบี๋': [40, 350], 'บรรจุภัณฑ์': [10, 160], 'เสื้อผ้า': [80, 260],
  'ครัว & กล่องอาหาร': [50, 350], 'พาวเวอร์แบงก์': [150, 500], 'กระเป๋าเดินทาง': [200, 1500],
  'สัตว์เลี้ยง': [40, 300], 'หมวก': [60, 220],
};

// our category -> giftwise category substrings
const CATMAP = {
  'กระเป๋า': ['กระเป๋า'],
  'แก้ว & กระบอกน้ำ': ['แก้ว', 'กระบอก'],
  'ไลฟ์สไตล์': ['ของใช้จิปาถะ', 'ของตกแต่งบ้าน', 'ผ้าขนหนู', 'หมอน', 'ผ้าห่ม', 'ของคลายเครียด', 'ความงาม', 'สุขภาพ', 'จัดระเบียบ', 'ผ้าพันคอ'],
  'เครื่องเขียน': ['เครื่องเขียน', 'ปากกา', 'สมุด', 'อุปกรณ์สำนักงาน', 'กระดาษ', 'ซอง'],
  'พัดลมพกพา': ['แก็ดเจ็ต', 'อุปกรณ์เสริมมือถือ'],
  'กลิ่น & สมุนไพร': ['อโรมา', 'ความงาม', 'สุขภาพ'],
  'กิฟต์เซ็ต': ['ชุดของขวัญ'],
  'แกดเจ็ต': ['แก็ดเจ็ต', 'อุปกรณ์เสริมมือถือ', 'อุปกรณ์ชาร์จ', 'พาวเวอร์แบงก์', 'เสียงเพลง', 'คอมพิวเตอร์', 'เทคโนโลยี', 'อุปกรณ์เสริมในรถ'],
  'ของชำร่วย': ['เครื่องประดับ', 'ของใช้จิปาถะ', 'พวงกุญแจ'],
  'ร่ม': ['ร่ม'],
  'เด็ก & เบบี๋': ['ตุ๊กตา', 'ของเล่น'],
  'บรรจุภัณฑ์': ['กล่อง', 'ถุง', 'แพ็ค', 'ครอบกล่อง', 'สายคาด', 'สติกเกอร์', 'พิมพ์การ์ด'],
  'เสื้อผ้า': ['เสื้อ'],
  'ครัว & กล่องอาหาร': ['ห้องครัว', 'ผ้ากันเปื้อน', 'กล่องเก็บของ', 'ครัว'],
  'พาวเวอร์แบงก์': ['พาวเวอร์แบงก์', 'อุปกรณ์ชาร์จ'],
  'กระเป๋าเดินทาง': ['กระเป๋าเดินทาง', 'อุปกรณ์เดินทาง'],
  'สัตว์เลี้ยง': ['ของใช้จิปาถะ', 'ของเล่น'],
  'หมวก': ['หมวก'],
};
const KW = ['สแตนเลส', 'เซรามิก', 'พลาสติก', 'ซิลิโคน', 'อลูมิเนียม', 'กระบอก', 'กระติก', 'หลอด', 'แคนวาส', 'ผ้าฝ้าย', 'สักหลาด', 'หูรูด', 'สะพายหลัง', 'เป้', 'คาดอก', 'ช้อปปิ้ง', 'เก็บความเย็น', 'ถุงผ้า', 'ร่ม', 'หมวก', 'ปากกา', 'สมุด', 'ดินสอ', 'แฟ้ม', 'พัดลม', 'ตุ๊กตา', 'หมอน', 'ผ้าห่ม', 'ผ้าขนหนู', 'เทียน', 'ก้านหอม', 'น้ำหอม', 'ดิฟฟิวเซอร์', 'พาวเวอร์', 'ชาร์จ', 'ลำโพง', 'หูฟัง', 'กล่อง', 'ถุงกระดาษ', 'ริบบิ้น', 'เสื้อ', 'โปโล', 'ฮู้ด', 'แจ็คเก็ต', 'แจ๊คเก็ต', 'ปิ่นโต', 'ช้อน', 'ส้อม', 'เขียง', 'พวงกุญแจ', 'เหรียญ', 'โล่', 'แม่เหล็ก'];

const median = arr => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };
const round5 = x => x >= 300 ? Math.round(x / 10) * 10 : Math.round(x / 5) * 5;

const out = [];
for (const s of skus) {
  const lv = liveBy[s.sku] || {};
  const text = [s.name, lv.features, lv.material, lv.size].filter(Boolean).join(' ');
  const subs = CATMAP[s.cat] || [];
  let pool = gwPriced.filter(g => subs.some(sub => g.category.includes(sub)));
  if (pool.length < 5) pool = gwPriced.filter(g => g.category.includes((s.cat || '').split(' ')[0]));
  // keyword-matched subset within pool
  const hits = KW.filter(k => text.includes(k));
  let matched = pool.filter(g => hits.some(k => g.name.includes(k)));
  let basis, n, gwCat, source = 'giftwise';
  if (matched.length >= 3) { basis = matched; n = matched.length; gwCat = 'keyword-match'; }
  else if (pool.length >= 4) { basis = pool; n = pool.length; gwCat = 'category'; }
  else if (GM_MAP[s.cat]) {
    const gp = gmPriced.filter(g => g.category === GM_MAP[s.cat]);
    if (gp.length) { basis = gp; n = gp.length; gwCat = GM_MAP[s.cat]; source = 'giftmanufactory'; }
    else { basis = gwPriced; n = gwPriced.length; gwCat = 'all-fallback'; }
  }
  else { basis = gwPriced; n = gwPriced.length; gwCat = 'all-fallback'; }
  const med = median(basis.map(b => b.price));
  // dominant competitor category label
  const catCount = {}; basis.forEach(b => catCount[b.category] = (catCount[b.category] || 0) + 1);
  const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || s.cat;
  let price = round5(med * (1 - UNDERCUT));
  let conf = matched.length >= 4 ? 'สูง' : (matched.length >= 3 || (gwCat === 'category' && n >= 8)) ? 'กลาง' : 'ต่ำ';
  const cl = CLAMP[s.cat];
  let clamped = false;
  if (cl) { const c = Math.min(Math.max(price, cl[0]), cl[1]); if (c !== price) { price = round5(c); clamped = true; conf = 'ต่ำ'; } }
  out.push({
    sku: s.sku, name: s.name, ourCat: s.cat, row: s.row,
    benchSource: source, benchCat: topCat, n, basisType: gwCat,
    median: med, price, undercutPct: med ? Math.round((1 - price / med) * 100) : 0,
    conf, clamped, hits: hits.join('+'),
  });
}

fs.mkdirSync('_pricing', { recursive: true });
fs.writeFileSync('_pricing/result.json', JSON.stringify(out, null, 1));

// summary
const byConf = {}; out.forEach(o => byConf[o.conf] = (byConf[o.conf] || 0) + 1);
const prices = out.map(o => o.price);
console.log('priced SKUs:', out.length);
console.log('confidence:', JSON.stringify(byConf));
console.log('price range: ฿' + Math.min(...prices) + ' – ฿' + Math.max(...prices), '| median ฿' + median(prices));
console.log('avg undercut vs competitor:', Math.round(out.reduce((a, o) => a + o.undercutPct, 0) / out.length) + '%');
console.log('\nby our category (count · median our price):');
const g = {}; out.forEach(o => (g[o.ourCat] ||= []).push(o.price));
for (const [k, v] of Object.entries(g)) console.log('  ' + k + ': ' + v.length + ' · ฿' + median(v));
console.log('\nsamples:');
out.slice(0, 8).forEach(o => console.log(`  ${o.sku} ${o.name} | ${o.ourCat} → bench ${o.benchCat}(n=${o.n}) med ฿${o.median} → ฿${o.price} (-${o.undercutPct}%) [${o.conf}]`));
