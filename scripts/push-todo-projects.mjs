/**
 * Split TO-DO into 2 projects: relabel existing tab as "Building Website",
 * create new tab for "Internal Software (SSOT)" with latest to-dos.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(dir, '.sheet-config.json'), 'utf8'));
async function call(action, params){
  const res=await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({token:cfg.token,action,...params}),redirect:'follow'});
  const t=await res.text(); try{return JSON.parse(t);}catch{return{ok:false,error:t.slice(0,200)};}
}

// 1) relabel existing tab title
await call('setCell',{sheet:'📋 TO-DO',cell:'A1',value:'📁 Project: BUILDING WEBSITE — GO PREMIUM TO-DO (เว็บไซต์ + SEO/Tracking)'});

// 2) new tab for SSOT project
const TAB='📋 TO-DO — Internal Software (SSOT)';
await call('addSheet',{sheet:TAB});
await call('clear',{sheet:TAB});
const header=['#','งาน','เหลือ / เป้า','ความสำคัญ','สถานะ (ติ๊กเอง)','วิธีทำ','🔄 Action Plan / Follow-Up'];
const rows=[
  ['📁 Project: GO PREMIUM INTERNAL SOFTWARE — Single Source of Truth','','','','','',''],
  ['อัปเดตล่าสุด: 2026-06-28 · ต่อจากงานรวม Product Master 4 ไฟล์ → Master เดียว 481 รายการ','','','','','',''],
  header,
  ['1','สร้าง Master เวอร์ชัน LOSSLESS (เก็บทุกคอลัมน์ ไม่ตัด)','~26 → ~50+ คอลัมน์','🔴 สูงมาก','⬜ รอทำ',
   'รวมทุกคอลัมน์ต้นฉบับ: รูป/tier ราคา/โลจิสติกส์/โลโก้/supplier FK','เวอร์ชันปัจจุบันเป็น management view ตัดคอลัมน์เยอะ — ดู audit-columns.mjs'],
  ['2','ดึงรูปภาพสินค้า (URL) เข้า master ทุกตัว','481 ตัว','🔴 สูงมาก','⬜ รอทำ',
   'รูปอยู่ใน 2025biz col image / NPD-NT รูปสินค้า','รูปถูกตัดจากทุกไฟล์ตอน merge รอบแรก'],
  ['3','เชื่อม Supplier FK (SUP-code) เข้าทุกสินค้า + ลงทะเบียนโรงงานจีนที่ยังไม่มี SUP','15 → ครบ','🔴 สูง','⬜ รอทำ',
   'NT/Supplier มี 15 SUP · โรงงานจีน (ลิงก์ 1688) ยังไม่มีรหัส','แยก factory ออกจาก customer แล้ว ต้องออก SUP ให้โรงงานจีน'],
  ['4','เติมต้นทุน 43 catalog ที่ margin คำนวณไม่ได้','43 SKU','🔴 สูง','⬜ รอทำ',
   'ดู _nocost-general.json · หาต้นทุนจากซัพ/1688','ส่วนใหญ่ prefix BG/LS/SC/KC ที่เพิ่มเข้าเว็บโดยไม่มี sourcing'],
  ['5','ตรวจ + แก้หมวด 43 pipeline ที่ flag ⚠️','43 ตัว','🟡 กลาง','⬜ รอทำ',
   'กรองคอลัมน์หมายเหตุ = ⚠️ ตรวจหมวด','ชื่อกำกวม เช่น suvirun/ฉุยฟง = แบรนด์ชาในเซต LH Bank'],
  ['6','ตั้ง markup / ราคาขาย ให้ pipeline','125 ตัว','🟡 กลาง','⬜ รอทำ',
   'ใช้ Pricing Engine (markup band + volume)','pipeline มีต้นทุนแล้ว แต่ยังไม่มีราคาขาย'],
  ['7','รีวิว one-off custom ว่าตัวไหนเข้าแคตตาล็อกถาวร','~ ใน 125','🟡 กลาง','⬜ รอทำ',
   'ดูคอลัมน์ ลูกค้า/Brand ที่ไม่ว่าง','Art toy(Mistine)/Powerbank(GULF)/เซตชา(LH) = งานเฉพาะลูกค้า'],
  ['8','Seed เข้า Supabase (schema + RLS) — Phase 1','481 + 15 ซัพ','🔵 ถัดไป','⬜ รอทำ',
   'จาก master-all.json + suppliers.csv','ตาม PLATFORM_CONTEXT roadmap Phase 1'],
];
for(let i=0;i<rows.length;i+=50){ await call('appendRows',{sheet:TAB,rows:rows.slice(i,i+50)}); }
console.log('✓ relabel 📋 TO-DO -> Project: Building Website');
console.log('✓ created tab:', TAB, '('+(rows.length-3)+' tasks)');
