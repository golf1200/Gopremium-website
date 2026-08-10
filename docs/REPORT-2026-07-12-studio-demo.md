# REPORT — Studio Customizer Demo (2026-07-12)

## ⭐ v4 FINAL (photo-based — ตามคำสั่ง Golf "ทำแบบฟรีก่อน ให้เหมือนจริงที่สุด")
- `public/studio.html` = **photo-based customizer**: เลือกสินค้า 10 SKU จริง → เห็น**รูปสตูดิโอจริง** → อัปโหลดโลโก้ → **ลากวางบนรูป** + ปรับขนาด/หมุน/ความเข้ม → ขอใบเสนอราคา (snapshot + สเปค)
- ความสมจริง (ฟรี 100%, canvas ล้วน): blend multiply บนพื้นสว่าง / screen บนพื้นเข้ม (เช็ค luminance ใต้โลโก้อัตโนมัติ), **cylinder wrap** โลโก้โค้งตามกระบอก + ขอบมืด, laser = สลักโทนเดียว (เทาเข้มบนสว่าง/เงินบนเข้ม), สกรีน 1 สี = สีเดียวขาว/กรม, powerbank มุมเอียง = rot -38°+บีบ sy .72 ลงระนาบหน้าเอียง
- ตำแหน่ง default ต่อ SKU **validate กับรูปปัจจุบันแล้วทั้ง 10 ตัว** (แก้ EX005 ที่ coords เก่าหลุดขอบ, EX010 ใช้ gallery-02 ร่มกาง, DW001/002/003/006 กำหนดใหม่จากรูปจริง)
- เทสต์ playwright: วาง 10/10 ถูกตำแหน่ง, drag ทำงาน, quote modal + snapshot ok, mobile ok, 0 errors
- 3D เวอร์ชันเดิมเก็บไว้ที่ `public/studio-3d.html` (ไม่ลิงก์จากไหน)
- Gemini tier (฿1.3/รูป) = แผนอนาคตตอนต่อฟอร์ม quote: gen mockup พรีเมียมเฉพาะ lead ที่กดขอใบเสนอราคา — ยังไม่ทำ (รอ Golf สั่ง + confirm งบ)

---
(ประวัติ v2-v3 ด้านล่าง)

# v2-v3 — 3D Studio Customizer Demo (2026-07-12)

## สร้าง/แก้ (uncommitted — รอ Golf รีวิวก่อน push)
- `public/studio.html` — **v2**: หน้าเลือกสินค้า (10 SKU จริงจาก catalogue-data.js พร้อมรูป/ราคา/MOQ/วิธีพิมพ์จริง) → เข้า customizer 3D รายสินค้า
- `public/studio/models/shirt_baked.glb` — โมเดลเสื้อยืด (1 MB, จาก tutorial repo — **ตรวจ license/commission ก่อนขึ้น production**)
- `docs/3D-CUSTOMIZER-ARCHITECTURE.md` — แผนสถาปัตยกรรม

## 10 สินค้าจริงใน demo (เทสต์ผ่าน playwright ครบทุกตัว)
| SKU | สินค้า | 3D shape | สีจริง | ความสมจริงพิเศษ |
|---|---|---|---|---|
| EX001 | เสื้อยืด Basic Tee ฿93 | GLB + decal | 13 สี | ตำแหน่ง กลางอก/อกซ้าย/หลังเต็ม |
| EX005 | กระบอก Sento ฿203 | lathe bottle | 5 สี | — |
| DW001 | กระบอก Loopa ฿176 | sport bottle + หูยาง | สตีล 6 สี | **เลเซอร์ = โลโก้สลักโทนเดียว** + โลโก้สูงสุด 5×5 ซม. |
| DW002 | แก้ว Brewy ฿159 | แก้ว + ปลอกซิลิโคน | ปลอก 5 สี | เลเซอร์ mono บนสตีล |
| DW003 | แก้ว Peak ฿143 | tumbler + หลอดสแตนเลส + ฝาใส | สตีล 6 สี | เลเซอร์ mono |
| DW006 | แก้ว Milo ฿147 | mug มีหูจับ | สตีล 6 สี | เลเซอร์ mono |
| EX006 | แก้วใส+ปลอกหนัง ฿88 | แก้ว transmission ใส | ปลอก 10 สี | โลโก้อยู่บนปลอกหนัง |
| EX009 | หมวกแก๊ป LEVI ฿98 | crown + visor (extrude) | 13 สี | — |
| EX010 | ร่มพับ Standard ฿122 | โดม+ก้าน+ด้ามJ | 12 สี | **สกรีน 1 สี = โลโก้สีเดียว** (ขาว/กรมอัตโนมัติตามความเข้มผ้า) |
| EX020 | Powerbank VOLT ฿812 | rounded box + LED | 2 สี | พิมพ์ UV สีเต็ม |

## ฟีเจอร์
- Print-method realism: laser→สลักเทาเข้ม, สกรีน1สี→silhouette สีเดียว (เลือกขาว/กรมตามพื้น), silk/DFT/UV→สีเต็ม
- โลโก้ที่อัปโหลดคงอยู่ข้ามสินค้า (ลองหลายสินค้าด้วยโลโก้เดียว)
- ขอใบเสนอราคา → snapshot + สเปคเต็ม (SKU·สี·ตำแหน่ง·วิธีพิมพ์·MOQ·ราคา) → sessionStorage.studioSpec + `/?from=studio#quote`
- Deep link `?sku=EX005` (ใช้ได้บน Vercel; `npx serve` ตัด query ตอน redirect .html→clean — ไม่กระทบ prod)
- GA4 (guarded): studio_open, studio_product_open, studio_upload_logo, studio_rfq_click

## บั๊กที่เจอ+แก้ระหว่างเทสต์
1. Desktop layout พัง (flex-wrap) → เปลี่ยนเป็น CSS grid
2. หมวก: ปีกอยู่ผิดด้าน/หลุดลอย → visor ใหม่ด้วย ExtrudeGeometry half-ellipse + camY ระดับสายตา
3. ร่ม: จุดโลโก้ raycast พลาดขอบโดม (y 0.24→0.42) + เฟรมครอบไม่พอ → lookY 0.10

## Realism pass (รอบ 3 — Golf ขอให้สมจริงขึ้น)
- **Lighting rig แบบสตูดิโอถ่ายสินค้า**: environment map จาก softbox จำลอง (key ซ้าย/fill ขวา/rim strip บน/kicker หลัง/floor bounce) → โลหะ-แก้วมีไฮไลต์แนวตั้งยาวแบบรูปถ่ายสตูดิโอจริง
- **เงาจริง**: VSMShadowMap soft shadow (radius 9) ตกบนพื้น ShadowMaterial แทน blob เงาปลอม
- **วัสดุ PBR ละเอียด** (MeshPhysicalMaterial + procedural bump maps):
  - สแตนเลสสีสตีล → brushed metal (ลายขนแปรงแนวตั้ง, metalness .95)
  - สแตนเลสสี → powder-coat (metalness .25 + clearcoat .55 + เกรนสี)
  - ผ้า (เสื้อ/หมวก/ร่ม) → weave bump + sheen; หมวกมีตะเข็บ 6 แผงใน bump map + ปีกโค้ง (side arch vertex bend)
  - แก้วใส → transmission .96 ior 1.5; powerbank → ABS clearcoat .85
- toneMappingExposure 1.08; verify แล้ว: EX005 (powder-coat ดำ), DW001 (brushed steel), EX009 (หมวกตะเข็บ), EX006 (แก้ว), EX001 (เสื้อ), 0 console errors

## วิธีดู
```
cd website && npx serve -l 4173 public   →  http://localhost:4173/studio.html
```

## ค้าง / ก่อนขึ้น live
1. license โมเดลเสื้อ GLB (หรือ commission ~$20-60)
2. ฟอร์ม quote บน v2.html อ่าน sessionStorage.studioSpec + แนบรูป mockup อัตโนมัติ
3. ลิงก์เข้า studio จาก nav + product pages (`?sku=` deep link พร้อมแล้ว)
4. เช็ค anchor `#quote` บนหน้าแรกมีจริง
5. ยังไม่ commit/push — รอ Golf สั่ง
