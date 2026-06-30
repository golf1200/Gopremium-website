# Report — Express page: honest wording + correct colour swatches + EX025 regen
**Date:** 2026-06-30

## What the user asked
1. หน้าสินค้าส่งด่วน — เลิกใช้คำว่า "ภาพสินค้าจริงทุกชิ้น" (รูปจริงๆ gen ด้วย AI).
2. โชว์สีให้ถูกต้อง — สีที่โชว์บนการ์ดสินค้าส่งด่วนให้ตรงกับสีจริงของสินค้าแต่ละชิ้น.
3. EX025 รูปยังพัง — regenerate ใหม่.

## What was done

### 1. Wording (no cost)
`public/v2.html` — express heading
`สินค้าพร้อมส่ง · ภาพสินค้าจริงทุกชิ้น` → `สินค้าพร้อมส่ง · พร้อมผลิตทันงานด่วน`
(ไม่เคลมว่าเป็นรูปถ่ายจริงอีกต่อไป) — ตรวจแล้วไม่มีคำเดิมหลงเหลือใน dist.

### 2. Colour swatches (no cost)
**Root cause:** `scripts/build-catalogue-data.mjs` map ชื่อสี→hex ผ่าน `src/data/color-map.json`
ซึ่งมีแต่คีย์ภาษาไทย. ชื่อสีอังกฤษ (`navy`,`white`,`black`,`blue`…), ชื่อรวมเสื้อผ้า
(`navy+white`,`black w/ red trim`…), `หลากสี/Multi`, และชื่อรูปทรงเด็ก (`หมี/Bear`…)
ตกไป default เทา `#c9c9c9` → การ์ด **30/99 SKU โชว์จุดสีเทาเหมือนกันหมด** (สีผิด).

**Fix:** เพิ่ม exact-match entries 82 ชื่อใน `src/data/color-map.json`
(exact match ถูกเช็คก่อน substring → ผลแม่นยำ ไม่กำกวม). Rebuild แล้ว:
- ชื่อสีที่ map ไม่ได้: **0** (เดิม ~85)
- จุดสีเทา default บนหน้า express: **0 / 419 จุด**
- ตรวจ compound names (EX019 navy+white→navy, EX081, EX046, EX077, EX006) → ถูกต้องทุกตัว
- หน้า product detail "สีที่มี" (chip รายสี) ตอนนี้โชว์ hex ถูกต้องตามชื่อด้วย (EX025 = 21 chip)

### 3. EX025 image (PAID — confirmed ฿2.6 total)
รูป square เดิมเป็นกระบอกสแตนเลสที่มี **ขอบดำ halo** จาก rembg ตัดพื้นหลังเงาไม่เนียน.
- ลอง Flux pro (kontext-pro) ฿1.3 → สะอาดแต่เพี้ยนเป็นขาวด้าน (ซ้ำ gallery รูปขาว) — ไม่เอา
- ลอง Gemini ฿1.3 → คงสแตนเลสจริง ขอบเนียน + ไอคอนของขวัญ navy — **ใช้ตัวนี้**
ติดตั้งเป็น `ex025-drinkware-square.jpg` (38 KB), bump `IMG_VER` 15→16 (cache-bust).

## Verification
- `npm run build` ✅, `verify-v2-nav` ✅ 38/38
- Headless Playwright: express heading ใหม่ ✅, EX025 card = `…square.jpg?v=16` (200) ✅, 0 gray swatch ✅, product page no JS errors ✅
- หมายเหตุ: `verify-p0/p1/seo.mjs` fail — เป็น drift เดิม (มองหา element ของ React app เก่า เช่น `footer a[href="/privacy"]`) **ไม่เกี่ยวกับงานนี้**

## Committed (selective — NOT `git add -A`)
- `src/data/color-map.json`
- `scripts/build-catalogue-data.mjs`
- `public/catalogue-data.js`
- `public/v2.html` (รวมฟีเจอร์ "สีที่มี" chip บนหน้า product detail ที่ค้างมาก่อน — เกี่ยวกับสี, complete, verified)
- `public/images/products/ex025-drinkware/` (square ใหม่ + gallery 2–5 ที่ค้าง untracked, ลบ -02 เก่า)

## ⏳ Pending / uncommitted (ของเดิม ไม่ใช่งานนี้ — ปล่อยไว้ให้ user จัดการ)
`.gitignore`, `CLAUDE.md`, `PRODUCT-MASTER-FINAL.xlsx`, `docs/MARKETING-STRATEGY.md`,
`generate-sitemap.js`, `package.json`, `package-lock.json`, `vercel.json`,
`public/blog/index.html`, `public/sitemap.xml`, `scripts/gen-blog-images.mjs`,
`scripts/sheet-sync.gs`, ลบ `project/uploads/*` (4 ไฟล์).
