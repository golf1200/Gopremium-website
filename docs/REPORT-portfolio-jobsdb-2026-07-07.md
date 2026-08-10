# REPORT — ผลงาน jobsdb by SEEK ลงหน้า Portfolio ครบชุด (2026-07-07)

## ✅ ทำเสร็จ + LIVE (commit `1a2db5c`, ทั้ง 2 โดเมน)
สแกนรูปถ่ายงานจริงทั้ง 68 ไฟล์ใน `Demo/รูปถ่ายสินค้าจริง/.../1 รูปที่ใช้ได้` → พบงาน jobsdb 7 ช็อต = 5 ชิ้นงาน ลงครบแล้ว:

| ชิ้นงาน | รูปต้นฉบับ | สถานะบนเว็บ |
|---|---|---|
| เซ็ตของขวัญรวม (Case 01 + สไลด์ฮีโร่) | IMG_6675 | **เปลี่ยนรูป AI-gen เป็นรูปถ่ายจริง** |
| ขวดน้ำ + กล่องของขวัญ | IMG_6643 | มีอยู่แล้ว (คงเดิม) |
| ขวดแก้วใสคู่ | IMG_6190 | มีรูปอยู่แล้วแต่ brand ว่าง → **เครดิต jobsdb** (ยืนยันโลโก้บนขวด+กล่อง) |
| พัดลมพกพา + กล่อง | IMG_6630 | **การ์ดใหม่** + เพิ่มชิปกรอง "พัดลมมือถือ" |
| ปากกา 2 สีประจำแบรนด์ | IMG_6659 | **การ์ดใหม่** (เครื่องเขียน) |

- รูป gen ฟรีด้วย sharp pipeline เดิม (ไม่มีค่าใช้จ่าย AI), ทุกไฟล์ < 170KB
- verify: `verify-v2-nav` 38/38 ผ่าน + Playwright เช็ก /portfolio จริง (การ์ด jobsdb 5 ใบ, ชิปกรองทำงาน, รูปโหลดครบ, ไม่มี JS error)
- review HTML: `website/docs/REVIEW-portfolio-jobsdb-2026-07-07.html`

## ✅ เพิ่มเติม (commit `b20c672`): เอาโลโก้ jobsdb ออกจากแถบ "ลูกค้าของเรา"
- Golf สั่งเอา**โลโก้** jobsdb ออกจาก client marquee (แต่รูปผลงานยังอยู่ตามคำสั่งก่อนหน้า)
- โลโก้ = `c13.png` → ถอดออกจาก `CLIENTS` ใน v2.html (หน้าแรก + portfolio) + `Trust.jsx` (แอปเก่า /old.html) + ลบไฟล์ `public/clients/c13.png` (กู้ได้จาก git)
- verify บน production: v2.html ไม่มี c13, marquee เหลือ 19 โลโก้ไม่มีรูปแตก; URL /clients/c13.png ตอบเป็น SPA fallback HTML (ไฟล์รูปหายจริง)
- หมายเหตุ: mock เก่า `public/_mock-portfolio-{A,B,C,FINAL}.html` gen ลิสต์ c1–c20 อัตโนมัติ → โลโก้ช่องนั้นจะแตกเฉพาะในไฟล์ mock (ไม่มีลิงก์จากเว็บจริง, เป็น candidate ลบทิ้ง)

## ⏳ ของค้าง / หมายเหตุ
- ช็อตซ้ำที่ไม่ใช้: IMG_6651 (ขวด มุมใกล้เคียง 6643), IMG_6660 (ปากกา มุมใกล้เคียง 6659)
- `scripts/_demo-people-jobsdb.mjs` (ตัว gen รูป AI เดิม) ล้าสมัยแล้วสำหรับส่วน gift-jobsdb — generator จริงคือ `_demo-portfolio-images.mjs` (อัปเดต sync แล้ว)
- ยังไม่ได้เอา REVIEW HTML นี้เข้า Library ของ GoPremium-Platform (กฎ Library standing rule) — ทำรอบหน้าตอนแตะ platform repo
- uncommitted อื่น ๆ ในรีโปเป็นงานคนละเรื่อง (express-realphoto, pricing audit ฯลฯ) มี REPORT ของตัวเองอยู่แล้ว
