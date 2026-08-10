/**
 * One-way sync: Google Sheet (source of truth) -> Supabase (read-only mirror).
 * Upserts categories/suppliers/customers/products/product_costs via PostgREST (service key).
 * Run anytime after the sheet changes. Config: scripts/.supabase-config.json
 *   { "url": "https://xxx.supabase.co", "serviceKey": "<service_role key from dashboard>" }
 *
 * Usage:  node scripts/sync-to-supabase.mjs
 *   (re-run pull-product-master + build-master-lossless + build-images-map + enrich-master first
 *    to refresh master-lossless.json from the live sheet — see etl/PIPELINE.md)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const cfgPath = path.join(dir, '.supabase-config.json');
if (!fs.existsSync(cfgPath)) {
  console.error('❌ ขาด scripts/.supabase-config.json — ใส่ { "url", "serviceKey" }');
  console.error('   serviceKey: Supabase Dashboard → Project Settings → API → service_role (secret)');
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const DATA = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const m = JSON.parse(fs.readFileSync(`${DATA}/master-lossless.json`, 'utf8'));
const reg = JSON.parse(fs.readFileSync(`${DATA}/suppliers-registry.json`, 'utf8'));
const num = (v) => { const x = parseFloat(String(v).replace(/[, ]/g, '')); return isFinite(x) ? x : null; };
const s = (v) => (v === '' || v == null) ? null : String(v);
const pref = (k) => String(k).match(/^[A-Z]+/)?.[0] || 'LS';
const supCodes = new Set(reg.registered.map(r => r.code));
const PCAT = {BG:'กระเป๋า',BK:'เด็ก & เบบี๋',DW:'แก้ว & กระบอกน้ำ',FN:'พัดลมพกพา',GD:'แกดเจ็ต',GM:'เสื้อผ้า',GP:'หมวก',GS:'กิฟต์เซ็ต',KC:'ครัว & กล่องอาหาร',LG:'กระเป๋าเดินทาง',LS:'ไลฟ์สไตล์',PB:'พาวเวอร์แบงก์',PK:'บรรจุภัณฑ์',PT:'สัตว์เลี้ยง',SC:'กลิ่น & สมุนไพร',ST:'เครื่องเขียน',SV:'ของชำร่วย',UM:'ร่ม',EX:'สินค้าส่งด่วน'};

async function upsert(table, rows, onConflict) {
  let ok = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const res = await fetch(`${cfg.url}/rest/v1/${table}?on_conflict=${onConflict}`, {
      method: 'POST',
      headers: {
        apikey: cfg.serviceKey, Authorization: `Bearer ${cfg.serviceKey}`,
        'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) { console.error(`❌ ${table} batch ${i}:`, res.status, (await res.text()).slice(0, 300)); return ok; }
    ok += batch.length;
    process.stdout.write(`  ${table}: ${ok}/${rows.length}\r`);
  }
  console.log(`✓ ${table}: ${ok}`);
  return ok;
}

// build payloads
const prefixes = [...new Set(m.rows.map(r => pref(r.SKU)))];
const categories = prefixes.map(p => ({ code: p, name_th: PCAT[p] || 'อื่นๆ' }));
const suppliers = reg.registered.map(r => ({ code: r.code, name: r.name, country: r.country || null, type: r.type || null, offer_1688: r.offer || null }));
const customers = reg.customer_brands.map(name => ({ name }));
const tier = (r) => { const t = {}; for (const k of ['100','300','500','1000','2000','5000']) { const v = r['tier'+k]; if (v !== '' && v != null) t[k] = num(v); } return Object.keys(t).length ? t : null; };
const products = m.rows.map(r => ({
  sku: r.SKU, name: s(r['ชื่อสินค้า']), category_code: pref(r.SKU), channel: s(r['ช่องทาง']), status: s(r['สถานะ']),
  description: s(r['รายละเอียด']), features: s(r['คุณสมบัติเด่น']), size: s(r['ขนาด/ความจุ']), material: s(r['วัสดุ']),
  colors: s(r['สี']), color_count: num(r['จำนวนสี']), image_url: s(r['รูปภาพ(URL)']), moq: s(r['MOQ']),
  sell_price: num(r['ราคาขาย/ชิ้น(฿)']), price_tier: tier(r), margin_pct: num(r['Margin%']),
  supplier_code: supCodes.has(r['Supplier-code']) ? r['Supplier-code'] : null, customer_brand: s(r['ลูกค้า/Brand']),
  link_1688: s(r['ลิงก์1688']), lead_time: s(r['ระยะเวลาผลิต/Lead']), logo_method: s(r['วิธีcustomlogo']),
  has_image: !!r['รูปภาพ(URL)'], is_live: /✓|ขึ้น/.test(String(r['ขึ้นLive'])), source: s(r['แหล่งที่มา']), notes: s(r['หมายเหตุ']),
}));
const costs = m.rows.map(r => ({
  sku: r.SKU, cost_yuan: num(r['ต้นทุน¥']), rate: num(r['เรท']), cost_thb: num(r['ต้นทุนบาท/ชิ้น']),
  logo_cost: num(r['ค่าโลโก้/ชิ้น']), pack_cost: num(r['ค่าแพ็ค/ชิ้น']), ship_per_unit: num(r['ค่าส่ง/ชิ้น']),
  total_cost: num(r['รวมต้นทุน/ชิ้น']), width: num(r['กว้าง(cm)']), length: num(r['ยาว(cm)']), height: num(r['สูง(cm)']),
  cbm: num(r['CBM']), box_weight: num(r['น้ำหนักกล่อง(kg)']), per_box: num(r['จำนวน/กล่อง']), calc_rate: num(r['CalculatedRate']),
  warehouse: s(r['โกดัง']), product_type: s(r['ประเภทสินค้า']), shipping_type: s(r['ขนส่ง']), solid_soft: s(r['ของแข็ง/ของนิ่ม']),
  cost_source: s(r['แหล่งต้นทุน']),
}));

console.log(`Syncing sheet -> Supabase (${m.rows.length} products)...`);
await upsert('categories', categories, 'code');
await upsert('suppliers', suppliers, 'code');
await upsert('customers', customers, 'name');
await upsert('products', products, 'sku');
await upsert('product_costs', costs, 'sku');
console.log('✅ sync done.');
