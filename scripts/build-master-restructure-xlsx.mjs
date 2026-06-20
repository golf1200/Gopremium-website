// Build PRODUCT-MASTER-RESTRUCTURE.xlsx from the per-supplier restructure proposals.
// Standalone deliverable — does NOT touch live products-raw.json / PRODUCT-MASTER.xlsx.
// Run: node scripts/build-master-restructure-xlsx.mjs
import ExcelJS from 'exceljs';
import { readFileSync, readdirSync } from 'node:fs';

const DIR = 'express-template-mockups';
const SUPNAME = { 'SUP-00009': 'YW Premium (แก้วสแตนเลส)' };
for (const f of readdirSync(DIR)) {
  if (f.startsWith('_sup-input-') && f.endsWith('.json')) {
    const d = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8'));
    SUPNAME[d.supplier] = d.sup_name || '';
  }
}
const masters = readdirSync(DIR)
  .filter(f => f.startsWith('_sup-master-') && f.endsWith('.json'))
  .sort()
  .map(f => JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')));

// new-SKU code pool (mirror assemble-master-proposal.py)
const pool = [7, 43, ...Array.from({ length: 38 }, (_, i) => 62 + i)];
const nextCode = () => 'EX' + String(pool.shift()).padStart(3, '0');

const CAT_TH = { drinkware: 'แก้ว & กระบอกน้ำ', garment: 'เสื้อผ้า', hat: 'หมวก', umbrella: 'ร่ม', bags: 'กระเป๋า' };
const cleanColors = cs => (cs || []).filter(c => !String(c).startsWith('('));

const rows = [];     // all SKU rows
const newRows = [];  // new models
const reqRows = [];  // photo requests
for (const m of masters) {
  const sup = m.supplier, sname = SUPNAME[sup] || sup;
  for (const e of (m.existing || [])) {
    const cs = cleanColors(e.colors);
    rows.push({ code: e.sku, sup, name: e.name_final || '', cat: e.category_slug || '',
      ncol: cs.length, colors: (e.colors || []).join(' / '), status: e.status || 'weak',
      isNew: 'เดิม', note: e.note || e.photo_request || '' });
    if (e.photo_request) reqRows.push({ sup: sname, item: `${e.sku} ${e.name_final || ''} — ${e.photo_request}` });
  }
  for (const nm of (m.new_models || [])) {
    const code = nextCode(), cs = cleanColors(nm.colors);
    rows.push({ code, sup, name: nm.proposed_name_th || '(รุ่นใหม่)', cat: nm.category_slug || '',
      ncol: cs.length, colors: (nm.colors || []).join(' / '), status: 'new', isNew: 'ใหม่ ★', note: nm.note || '' });
    newRows.push({ code, sup, name: nm.proposed_name_th || '', cat: nm.category_slug || '',
      type: nm.type || '', ncol: cs.length, colors: (nm.colors || []).join(' / '), src: nm.source_file || '' });
  }
  for (const pr of (m.photo_requests || [])) reqRows.push({ sup: sname, item: pr });
}

const FILL = {
  ok: 'FFE7F5EC', weak: 'FFFFF3D6', no_image: 'FFFBE0E0', pack: 'FFE3EAF5', new: 'FFF3E8FF',
};
const STLABEL = { ok: 'พร้อม', weak: 'ควรยืนยัน', no_image: 'ต้องขอรูปซัพ', pack: 'variant กล่อง', new: '＋ รุ่นใหม่' };

const wb = new ExcelJS.Workbook();
wb.creator = 'GO PREMIUM restructure';
const hdrStyle = r => { r.font = { bold: true, color: { argb: 'FFFFFFFF' } }; r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF13244A' } }; r.alignment = { vertical: 'middle' }; };

// Sheet 1: summary
const s0 = wb.addWorksheet('สรุป');
s0.columns = [{ width: 36 }, { width: 14 }];
const cnt = k => rows.filter(r => r.status === k).length;
s0.addRow(['Product Master — โครงสร้างจัดใหม่ (ข้อเสนอ)']).font = { bold: true, size: 14 };
s0.addRow([]);
[['รวมทุก SKU', rows.length], ['✓ พร้อม (มีรูปรวมสี)', cnt('ok')], ['△ ควรยืนยัน', cnt('weak')],
 ['◧ variant กล่อง', cnt('pack')], ['✗ ต้องขอรูปจากซัพ', cnt('no_image')], ['＋ รุ่นใหม่ (เพิ่ม SKU)', newRows.length],
 ['รายการขอรูปจากซัพ', reqRows.length]].forEach(r => s0.addRow(r));
s0.addRow([]);
s0.addRow(['หมายเหตุ: ไฟล์นี้เป็นข้อเสนอจากการแตกรูปต้นฉบับ Google Drive ราย รุ่น+สี ด้วย AI · ราคา/MOQ ของรุ่นใหม่ยังไม่กรอก · ไม่กระทบเว็บจนกว่าจะยืนยัน']).font = { italic: true, color: { argb: 'FF777777' } };

// Sheet 2: all SKUs + colors
const s1 = wb.addWorksheet('ทุก SKU + สี', { views: [{ state: 'frozen', ySplit: 1 }] });
s1.columns = [
  { header: 'SKU', key: 'code', width: 11 }, { header: 'ซัพ', key: 'sup', width: 12 },
  { header: 'ชื่อรุ่น', key: 'name', width: 42 }, { header: 'หมวด', key: 'cat', width: 12 },
  { header: 'จำนวนสี', key: 'ncol', width: 9 }, { header: 'สถานะ', key: 'status', width: 15 },
  { header: 'เดิม/ใหม่', key: 'isNew', width: 10 }, { header: 'สีทั้งหมด', key: 'colors', width: 70 },
  { header: 'หมายเหตุ', key: 'note', width: 46 },
];
hdrStyle(s1.getRow(1));
for (const r of rows) {
  const row = s1.addRow({ code: r.code, sup: r.sup, name: r.name, cat: r.cat, ncol: r.ncol || '',
    status: STLABEL[r.status] || r.status, isNew: r.isNew, colors: r.colors, note: r.note });
  const fg = FILL[r.status];
  if (fg) row.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fg } }; });
  row.alignment = { vertical: 'top', wrapText: true };
}

// Sheet 3: new models
const s2 = wb.addWorksheet('รุ่นใหม่ (เพิ่ม SKU)', { views: [{ state: 'frozen', ySplit: 1 }] });
s2.columns = [
  { header: 'SKU (เสนอ)', key: 'code', width: 11 }, { header: 'ซัพ', key: 'sup', width: 12 },
  { header: 'ชื่อรุ่น (เสนอ)', key: 'name', width: 40 }, { header: 'หมวด', key: 'cat', width: 12 },
  { header: 'ชนิด', key: 'type', width: 18 }, { header: 'จำนวนสี', key: 'ncol', width: 9 },
  { header: 'สีทั้งหมด', key: 'colors', width: 64 }, { header: 'รูปต้นฉบับ', key: 'src', width: 36 },
];
hdrStyle(s2.getRow(1));
for (const r of newRows) {
  const row = s2.addRow(r);
  row.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FILL.new } }; });
  row.alignment = { vertical: 'top', wrapText: true };
}

// Sheet 4: photo requests
const s3 = wb.addWorksheet('ขอรูปจากซัพ', { views: [{ state: 'frozen', ySplit: 1 }] });
s3.columns = [{ header: 'ซัพพลายเออร์', key: 'sup', width: 32 }, { header: 'รายการที่ขอ', key: 'item', width: 90 }];
hdrStyle(s3.getRow(1));
for (const r of reqRows) { const row = s3.addRow(r); row.alignment = { vertical: 'top', wrapText: true }; }

const out = 'PRODUCT-MASTER-RESTRUCTURE.xlsx';
await wb.xlsx.writeFile(out);
console.log(`Wrote ${out} — ${rows.length} SKUs (${newRows.length} new), ${reqRows.length} photo requests`);
