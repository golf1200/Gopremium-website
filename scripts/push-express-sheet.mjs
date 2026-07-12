/**
 * Push the 129 consolidated Express products (Demo/express-master-DB.json)
 * into a dedicated tab in the "Gopremium Dev Master" Google Sheet, as the
 * single backend source of truth for สินค้าส่งด่วน.
 *
 * Full backend view: @300 display price + full price ladder + cost tiers +
 * internal shop lead (V) + customer MOQ (J) + colours/sizes + supplier.
 *
 *   node scripts/push-express-sheet.mjs            # writes the tab
 *   node scripts/push-express-sheet.mjs --dry      # print rows, no write
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(dir, '.sheet-config.json'), 'utf8'));
const DB = JSON.parse(fs.readFileSync(path.join(dir, '../../Demo/express-master-DB.json'), 'utf8'));
const TAB = '⚡ สินค้าส่งด่วน (Express)';
const DRY = process.argv.includes('--dry');

const priceAt = (ladder, q) => {
  const r = (ladder || []).find(x => x.q === q);
  return r ? r.price : '';
};
const tiersStr = (t) => (t || [])
  .map(x => `MOQ${x.supMOQ}: ต้นทุน${x.q_cost}→AC${x.ac}`)
  .join(' | ');

const HEADERS = [
  'SKU', 'SKU เดิม', 'สถานะ', 'ชื่อสินค้า', 'หมวดหมู่',
  'รหัสซัพ', 'ซัพพลายเออร์', 'ขั้นต่ำลูกค้า (J)', 'สี', 'จำนวนสี',
  'ขนาด/ไซส์', 'วัสดุ', 'จุดเด่น', 'วิธีสกรีน', 'รายละเอียดสกรีน',
  'Lead ร้าน (V) internal', 'Lead ลูกค้า (GP)', 'ต้นทุน/ชิ้น (AC)', 'Cost tiers',
  'ราคา @100', 'ราคา @300 (โชว์เว็บ)', 'ราคา @500', 'ราคา @1000',
  'Packaging', 'ค่า Pack', 'Shipping', 'ค่าส่ง', 'Payment', 'ข้อจำกัด',
  'ลิงก์รูป (Drive)', 'หมายเหตุ',
];

const rows = DB.map(p => [
  p.sku,
  p.src_sku === p.sku ? '' : (p.src_sku || ''),
  p.status || '',
  p.name || '',
  p.category || '',
  p.sup_code || '',
  p.sup_name || '',
  p.cust_moq ?? '',
  Array.isArray(p.colors) ? p.colors.join(', ') : '',
  p.n_colors ?? '',
  p.size || '',
  p.material || '',
  p.feature || '',
  p.custom_method || '',
  p.custom_detail || '',
  p.lead_shop || '',
  p.lead_gp || '',
  p.ac_cost ?? '',
  tiersStr(p.cost_tiers),
  priceAt(p.pricing_ladder, 100),
  p.price_display ?? priceAt(p.pricing_ladder, 300),
  priceAt(p.pricing_ladder, 500),
  priceAt(p.pricing_ladder, 1000),
  p.packaging || '',
  p.packaging_cost || '',
  p.shipping_detail || '',
  p.shipping_cost || '',
  p.payment || '',
  p.limit || '',
  p.img_link_drive || '',
  p.note || '',
]);

const values = [HEADERS, ...rows];
const lastCol = String.fromCharCode(64 + HEADERS.length); // 31 -> not >26; compute properly below
const colLetter = (n) => {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
};
const range = `A1:${colLetter(HEADERS.length)}${values.length}`;

console.log(`Tab: ${TAB}`);
console.log(`Range: ${range}  (${rows.length} products + header, ${HEADERS.length} cols)`);
if (DRY) {
  console.log(HEADERS.join(' | '));
  console.log(rows.slice(0, 3).map(r => r.join(' | ')).join('\n'));
  process.exit(0);
}

// Clear the tab first (in case of a re-run), then write. `write` auto-creates the tab.
const post = async (action, params) => {
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: cfg.token, action, sheet: TAB, ...params }),
    redirect: 'follow',
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { ok: false, http: res.status, text: text.slice(0, 400) }; }
};

// write auto-creates; clear only if it already exists
const w = await post('write', { range, values });
console.log('write →', JSON.stringify(w));
