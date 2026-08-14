// BUILD-TIME LIVE SYNC — connects the customer website to the internal system.
//
// Chain:  Google Sheet "Product Master" (ต้นทุน)  →  Pricing Engine v3.1  →  ราคาบนเว็บ
//
// Two jobs, every build:
//   A) REPRICE every existing product from the sheet's ต้นทุน using the REAL pricing
//      engine (scripts/pricing-model.generated.mjs — generated from the platform's
//      PLATFORM-clickup.html, not hand-copied), times the per-SKU market factor in
//      scripts/price-factors.generated.json. Change a cost in the sheet → the site
//      price moves on the next deploy. No more hand-edited prices.
//   B) APPEND newly-published NPD products (ช่องทาง = "NPD→Master") that aren't on
//      the site yet, priced by the same engine.
//
// SAFETY:
//   • ANY failure (no config, network, bad data, engine mismatch) → warn and exit 0
//     with the committed catalogue untouched. It can never break the site, and the
//     committed products-raw.json always holds correct prices as a fallback.
//   • A product is only repriced when the sheet gives it a real ต้นทุน > 0.
//     No cost → its committed price stays exactly as-is.
//   • The engine module self-checks against golden vectors on import; if the pricing
//     formula was tampered with, the import throws and we keep committed prices.
//
// Config: scripts/.sheet-config.json {url,token} locally, or env SHEET_URL / SHEET_TOKEN on Vercel.
// Runs first in `npm run build`.
// Pricing history / why: GoPremium-Platform/docs/PRICING-DECISIONS.md
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(dir, '..');
const SHEET = '🗂️ PRODUCT MASTER (รวม)';
// SKU ที่ถอดออกจากเว็บแล้ว — ยังอยู่ในชีตได้ แต่ห้าม sync กลับขึ้นเว็บอีก
// (ไม่งั้น step 4 จะ append กลับมาทุกครั้งที่ build). ถอดเมื่อ 2026-08-14 ตามคอมเมนต์ 11 ส.ค.
const RETIRED = new Set(['NPD-0229']);
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
    iCost = ix('รวมต้นทุน/ชิ้น'),
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

  // 3b) load the real pricing engine + per-SKU market factors
  //     (both generated by the platform — see header). Failure here is non-fatal:
  //     we simply skip repricing and keep the committed prices.
  let priceOf = null;
  if (iCost >= 0) {
    try {
      const eng = await import('./pricing-model.generated.mjs');
      let factors = {};
      const fp = path.join(dir, 'price-factors.generated.json');
      if (existsSync(fp)) factors = JSON.parse(readFileSync(fp, 'utf8')).factors || {};
      priceOf = (sku, cost) => {
        const base = eng.priceAt(cost, 1);          // เรท 300 ชิ้น = ราคาป้ายบนเว็บ
        if (!(base > 0)) return null;
        const k = factors[sku] == null ? 1 : factors[sku];
        return Math.round(base * k);
      };
      console.log('[sync-master-live] pricing engine ' + eng.MODEL_VERSION + ' (' + eng.MODEL_HASH + ') · factors ' + Object.keys(factors).length);
    } catch (e) { warn('pricing engine unavailable (' + (e && e.message) + ') — keeping committed prices.'); }
  } else { warn('sheet has no รวมต้นทุน/ชิ้น column — keeping committed prices.'); }

  // 3b2) สินค้าที่มาจาก NPD — ราคาบนเว็บ = "ราคาที่เสนอขาย" ที่ผู้บริหารเคาะไว้ ห้ามให้เอนจินคิดใหม่ทับ
  //      (Golf สั่ง 2026-08-14) แพลตฟอร์มเลือกราคาตามกติกา MOQ แล้วเขียนลงคอลัมน์ ราคาขาย/ชิ้น(฿)
  //        • MOQ ≤ 300 → ราคาที่เสนอขายของเรท 300
  //        • MOQ > 300 → ราคาที่เสนอขายของเรทขั้นต่ำที่รับผลิตจริง
  //      เดิมเว็บ reprice ทุก build ด้วย engine × factor · SKU ที่เพิ่ง published ยังไม่มี factor (k=1)
  //      → เว็บโชว์ราคาโมเดล ไม่ใช่ราคาที่คนเคาะ = ขัดเจตนา "ราคาที่อนุมัติแล้วคือราคาที่ลูกค้าเห็น"
  //      กติกาตั้งราคาเต็ม ๆ: GoPremium-Platform/docs/PRICING-DECISIONS.md
  const npdSku = new Set();
  const npdPrice = new Map();
  for (const r of rows.slice(1)) {
    const sku = String(r[iSku] || '').trim();
    if (!sku || String(r[iChan] || '').trim() !== 'NPD→Master') continue;
    npdSku.add(sku);
    const p = iPrice >= 0 ? num(r[iPrice]) : null;
    if (!(p > 0)) continue;
    // promote() append แถวใหม่ทุกครั้งที่กดขึ้นเว็บ → SKU เดียวมีได้หลายแถว
    // เอาแถวล่าสุด (ล่างสุด) = ราคาที่อนุมัติครั้งหลังสุด · เตือนถ้าเจอราคาขัดกัน
    const prev = npdPrice.get(sku);
    if (prev != null && prev !== p) warn(`${sku}: ชีตมีหลายแถว ราคาต่างกัน (฿${prev} vs ฿${p}) — ใช้แถวล่าสุด ฿${p}`);
    npdPrice.set(sku, p);
  }
  const isNpd = (p) => npdSku.has(String(p.sku)) || p.npd === true;

  // 3c) REPRICE existing products from live cost
  let repriced = 0;
  {
    const costBySku = new Map();
    for (const r of rows.slice(1)) {
      const sku = String(r[iSku] || '').trim();
      const cost = num(r[iCost]);
      if (sku && cost > 0) costBySku.set(sku, cost);
    }
    for (const p of raw) {
      let next;
      if (isNpd(p)) {
        next = npdPrice.get(String(p.sku));          // 🔒 ราคาที่เสนอขายจากชีตตรง ๆ ไม่ผ่านเอนจิน
        if (!(next > 0)) continue;                   // ชีตไม่มีราคา = ไม่แตะราคาที่ commit ไว้
      } else {
        if (!priceOf) continue;                      // เอนจินใช้ไม่ได้ = คงราคาที่ commit ไว้
        const cost = costBySku.get(String(p.sku));
        if (!(cost > 0)) continue;                   // ไม่มีต้นทุน = ไม่แตะราคาที่ commit ไว้
        next = priceOf(String(p.sku), cost);
        if (!(next > 0)) continue;
      }
      next = Math.round(next);
      if (p.price_300_thb !== next) repriced++;
      p.price_300_thb = next;
      p.budget_tier = tierOf(next);
    }
    console.log('[sync-master-live] repriced ' + repriced + ' product(s)'
      + (priceOf ? ' (NPD ใช้ราคาที่เสนอขายจากชีต · ที่เหลือคิดจากต้นทุน)' : ' (เอนจินใช้ไม่ได้ — เฉพาะ NPD จากชีต)'));
  }

  // 4) collect NPD-published rows not already on the site
  const added = [];
  for (const r of rows.slice(1)) {
    const sku = String(r[iSku] || '').trim();
    if (!sku || have.has(sku)) continue;
    if (RETIRED.has(sku)) continue;                                 // ถอดออกจากเว็บแล้ว — ห้ามกลับมา
    if (String(r[iChan] || '').trim() !== 'NPD→Master') continue;   // ONLY products promoted via NPD
    const name = String(r[iName] || '').trim();
    // ราคาของ NPD ที่เพิ่งขึ้นเว็บ = **ราคาที่เสนอขาย** ที่ผู้บริหารเคาะไว้ในชีต (Golf 14 ส.ค.)
    // เอนจินเป็นแค่ทางสำรองกรณีชีตไม่มีราคา — เดิมกลับกัน ทำให้ราคาที่อนุมัติแล้วถูกคิดใหม่ทับ
    const cost = iCost >= 0 ? num(r[iCost]) : null;
    const price = npdPrice.get(sku) || (priceOf && cost > 0 ? priceOf(sku, cost) : null);
    if (!name || !price || price <= 0) continue;                    // must be presentable
    have.add(sku);
    // promote() may write several image URLs joined by ' , ' (up to 10) — split them all into the gallery
    const imgCell = iImg >= 0 ? String(r[iImg] || '').trim() : '';
    const imgList = imgCell ? imgCell.split(/\s*,\s*/).map((x) => x.trim()).filter(Boolean).slice(0, 10) : [];
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
      images: imgList,            // consumed by build-catalogue-data.mjs (img fallback + gallery)
      express: false, npd: true,
    };
    raw.push(rec); added.push(sku);
  }

  if (!added.length && !repriced) { console.log('[sync-master-live] no new NPD products, no price change — catalogue unchanged.'); return; }

  // 5) write products-raw.json — the next build step (build-catalogue-data.mjs) regenerates catalogue-data.js
  writeFileSync(rawPath, JSON.stringify(raw, null, 2) + '\n');
  console.log('[sync-master-live] wrote catalogue — repriced ' + repriced
    + (added.length ? ', added ' + added.length + ' NPD product(s): ' + added.join(', ') : ', no new products'));
}

main().catch((e) => { warn('unexpected error: ' + (e && e.stack || e) + ' — keeping committed catalogue.'); })
  .finally(() => process.exit(0)); // never break the build
