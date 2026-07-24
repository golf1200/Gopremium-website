// BUILD-TIME LIVE SYNC — pulls newly-published NPD products from the LIVE
// "Product Master" Google Sheet and appends them to products-raw.json before the
// site is built, so a product published from the internal NPD Pipeline appears on
// the customer website on the next deploy (the NPD "ขึ้นเว็บ" button fires a Vercel
// Deploy Hook → this runs → build).
//
// SAFETY:
//   • ONLY appends rows tagged by the platform's promote() (ช่องทาง = "NPD→Master")
//     that also have a price + name → the 356 curated products and 100+ Master
//     drafts are never touched.
//   • Existing SKUs are left exactly as committed (no overwrite / no price change).
//   • ANY failure (no config, network, bad data) → logs a warning and exits 0,
//     so the build proceeds with the committed catalogue. It can never break the site.
//
// Config: scripts/.sheet-config.json {url,token} locally, or env SHEET_URL / SHEET_TOKEN on Vercel.
// Runs first in `npm run build`.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(dir, '..');
const SHEET = '🗂️ PRODUCT MASTER (รวม)';
const warn = (m) => console.warn('[sync-master-live] ' + m);
const tierOf = (n) => (n <= 60 ? 'value' : n <= 150 ? 'smart' : n <= 300 ? 'premium' : 'executive');

// Thai category label → website category slug (reverse of build-catalogue-data.mjs catLabels)
const CAT_SLUG = {
  'แก้ว & กระบอกน้ำ': 'drinkware', 'กระเป๋า': 'bags', 'กระเป๋าเดินทาง': 'luggage',
  'เครื่องเขียน': 'stationery', 'พัดลมพกพา': 'fan', 'พาวเวอร์แบงก์': 'powerbank',
  'แกดเจ็ต': 'gadget', 'ไลฟ์สไตล์': 'lifestyle', 'ครัว & กล่องอาหาร': 'kitchen',
  'กลิ่น & สมุนไพร': 'scent', 'เสื้อผ้า': 'garment', 'หมวก': 'hat', 'สัตว์เลี้ยง': 'pet',
  'เด็ก & เบบี๋': 'baby-kid', 'กิฟต์เซ็ต': 'giftset', 'บรรจุภัณฑ์': 'packaging',
  'ของชำร่วย': 'souvenir', 'ร่ม': 'umbrella',
};
const slugForCat = (thai) => CAT_SLUG[String(thai || '').trim()] || 'lifestyle';
const num = (v) => { const n = parseFloat(String(v ?? '').replace(/[^\d.]/g, '')); return Number.isFinite(n) ? n : null; };
const splitLogo = (s) => String(s || '').split(/[\/,\n·]+/).map((x) => x.trim()).filter(Boolean);

async function main() {
  // 1) resolve config (local file first, then env)
  let url = process.env.SHEET_URL || '', token = process.env.SHEET_TOKEN || '';
  const cfgPath = path.join(dir, '.sheet-config.json');
  if ((!url || !token) && existsSync(cfgPath)) {
    try { const c = JSON.parse(readFileSync(cfgPath, 'utf8')); url = url || c.url; token = token || c.token; } catch {}
  }
  if (!url || !token) { warn('no SHEET_URL/SHEET_TOKEN — keeping committed catalogue.'); return; }

  // 2) fetch the live Master
  let rows;
  try {
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'read', sheet: SHEET }), redirect: 'follow',
    });
    rows = (JSON.parse(await res.text()).values) || [];
  } catch (e) { warn('sheet fetch failed (' + (e && e.message) + ') — keeping committed catalogue.'); return; }
  if (rows.length < 2) { warn('empty Master — keeping committed catalogue.'); return; }

  const head = (rows[0] || []).map((x) => String(x).trim());
  const ix = (name) => head.indexOf(name);
  const iSku = ix('SKU'), iName = ix('ชื่อสินค้า'), iCat = ix('หมวดหมู่'), iChan = ix('ช่องทาง'),
    iPrice = ix('ราคาขาย/ชิ้น(฿)'), iMoq = ix('MOQ'), iFeat = ix('คุณสมบัติเด่น'),
    iSize = ix('ขนาด/ความจุ'), iMat = ix('วัสดุ'), iImg = ix('รูปภาพ(URL)');
  // free-logo techniques: the live Master has no 'เทคนิคโลโก้ฟรี' column — promote() writes
  // them to 'วิธีcustomlogo' instead, so read whichever exists (both, preferring the dedicated one)
  const iLogoDedicated = ix('เทคนิคโลโก้ฟรี'), iLogoFallback = ix('วิธีcustomlogo');
  const iLogo = iLogoDedicated >= 0 ? iLogoDedicated : iLogoFallback;
  if (iSku < 0 || iName < 0 || iChan < 0) { warn('Master header missing SKU/ชื่อสินค้า/ช่องทาง — keeping committed catalogue.'); return; }

  // 3) load committed SSOT
  const rawPath = path.join(REPO, 'src/data/products-raw.json');
  const raw = JSON.parse(readFileSync(rawPath, 'utf8'));
  const have = new Set(raw.map((p) => String(p.sku)));

  // 4) collect NPD-published rows not already on the site
  const added = [];
  for (const r of rows.slice(1)) {
    const sku = String(r[iSku] || '').trim();
    if (!sku || have.has(sku)) continue;
    if (String(r[iChan] || '').trim() !== 'NPD→Master') continue;   // ONLY products promoted via NPD
    const name = String(r[iName] || '').trim();
    const price = num(r[iPrice]);
    if (!name || !price || price <= 0) continue;                    // must be presentable
    have.add(sku);
    const img = iImg >= 0 ? String(r[iImg] || '').trim() : '';
    const rec = {
      sku, slug: sku.toLowerCase(), name,
      category: (iCat >= 0 ? String(r[iCat] || '').trim() : '') || slugForCat(r[iCat]),
      category_slug: slugForCat(r[iCat]),
      features: iFeat >= 0 ? String(r[iFeat] || '').trim() : '',
      size: iSize >= 0 ? String(r[iSize] || '').trim() : '',
      material: iMat >= 0 ? String(r[iMat] || '').trim() : '',
      price_300_thb: Math.round(price), budget_tier: tierOf(price),
      moq: iMoq >= 0 ? (num(r[iMoq]) || 50) : 50,
      free_logo: iLogo >= 0 ? splitLogo(r[iLogo]) : [],
      logo_max_cm: '', colors: [], occasions: [],
      images: img ? [img] : [],   // consumed by build-catalogue-data.mjs img fallback
      express: false, npd: true,
    };
    raw.push(rec); added.push(sku);
  }

  if (!added.length) { console.log('[sync-master-live] no new NPD products — catalogue unchanged.'); return; }

  // 5) write products-raw.json — the next build step (build-catalogue-data.mjs) regenerates catalogue-data.js
  writeFileSync(rawPath, JSON.stringify(raw, null, 2));
  console.log('[sync-master-live] added ' + added.length + ' NPD product(s): ' + added.join(', '));
}

main().catch((e) => { warn('unexpected error: ' + (e && e.stack || e) + ' — keeping committed catalogue.'); })
  .finally(() => process.exit(0)); // never break the build
