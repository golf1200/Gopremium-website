# REPORT — Pricing v3 Web Audit (2026-07-07)

## งานที่ทำ
ตรวจราคาสินค้าทั้งหมดบนเว็บ (356 SKU ใน `src/data/products-raw.json`, ฟิลด์ `price_300_thb` = ราคา@300ชิ้น) เทียบต้นทุนจริง ("รวมต้นทุน/ชิ้น" จาก Google Sheet PRODUCT MASTER สด 481 แถว) ด้วย **Pricing Model v3** (PR_TIERS ล่าสุดจาก PLATFORM-clickup.html รวม tier <20฿→4×, Floor 18%, overhead 6%, ส่วนลด@300 ตาม tier)

เกณฑ์ OK = ราคาเว็บอยู่ในช่วง −10%..+25% ของราคา v3@300 และ net margin ≥ 18%

## ผลสรุป (เช็คได้ 199 / 356)
| กลุ่ม | จำนวน |
|---|---|
| ✔ โอเค | 60 |
| ✖ ต่ำกว่า Floor 18% (หลายตัวขายต่ำกว่าทุน) | 43 |
| ▼ ต่ำกว่าเป้า v3 (ยังกำไร ≥18%) | 31 |
| ▲ สูงกว่าเป้า v3 เกิน +25% | 65 |
| ไม่มีราคาบนเว็บ | 116 |
| ไม่มีต้นทุนในระบบ | 41 |

ตัวแย่สุด: LS043 ทุน 1,247.5 ขาย 250 · GM001-003 Jacket ทุน 280-300 ขาย 80 · LG001 ทุน 845 ขาย 310 · BG023/025/028/029/030 กระเป๋าทุน 205-410 ขาย 110
สาเหตุหลัก: ราคาเว็บชุดนี้ตั้งจาก AI benchmark เทียบคู่แข่ง (งาน F01) ไม่ได้อิงต้นทุน

## Deliverables
- รายงานเต็ม: `website/docs/PRICING-V3-WEB-AUDIT-2026-07-07.html` (เปิดดูได้เลย, self-contained)
- Library (แพลตฟอร์ม, deploy prod แล้ว): หมวด Pricing → "Pricing v3 — Audit ราคาเว็บ vs ต้นทุน" (`/assets/library/pricing-v3-web-audit.html`)
- Changelog แพลตฟอร์ม: entry 2026-07-07 18:10
- ข้อมูลดิบ: scratchpad `pricing-audit-result.json` (+ สคริปต์ `pricing-check.mjs` คัดลอก prCalc ตรงจากแพลตฟอร์ม)

## UPDATE 2026-07-07 เย็น — Golf เคาะแล้ว: ปรับราคาตาม v3 ทั้งหมด (ทำเสร็จ)
- ✅ ปรับราคา **197 SKU → v3@300** ทั้ง Master Sheet (คอลัมน์ ราคาขาย/ชิ้น(฿) + mirror ราคา@300 ที่มีค่า) และเว็บ (products-raw.json / catalog-master.json / catalogue-data.js ผ่าน `import-prices-from-sheet.mjs`)
- ✅ ประวัติการเปลี่ยนราคา: แท็บใหม่ **"📜 PRICE CHANGE LOG"** ใน Google Sheet (197 แถว: ราคาเดิม→ใหม่, ต้นทุน, margin เดิม/ใหม่, เหตุผล) + backup ก่อนแก้ + changes.csv/json ในโฟลเดอร์ `docs/price-change-2026-07-07/`
- ✅ Verify: ชีต 199/199 · products-raw 199/199 · catalogue-data 199/199 · build ผ่าน · verify-v2-nav 38/38 (p0/p1/seo fail เป็นปัญหา environment เดิมก่อนหน้างานนี้)
- BG036 ราคาเว็บ 110 = v3 พอดี แต่ช่องชีตว่าง → เติม 110 ให้ครบ SSOT; BK003 ตรง v3 อยู่แล้ว ไม่แตะ

## ของค้าง / ต้องตามต่อ
- 41 SKU ไม่มีต้นทุนในชีต (Bag 11, Lifestyle 7, Scent/candle 6, Kitchen 4, Powerbank 4 …) — ต้องเติมต้นทุนก่อนถึงจะเช็ค/ตั้งราคาได้
- ตัวเลขน่าสงสัยควรตรวจกับจัดซื้อ: LS043 (ถังน้ำแข็ง ทุน 1,247.5 — ทุนต่อลัง?) และ LS020 (ผ้าไมโครไฟเบอร์ ทุน 5.95 ขาย 250)
- uncommitted (website repo): `docs/PRICING-V3-WEB-AUDIT-2026-07-07.html`, `docs/REPORT-pricing-v3-web-audit-2026-07-07.md` — ไฟล์ docs ไม่กระทบหน้าเว็บ ยังไม่ commit
