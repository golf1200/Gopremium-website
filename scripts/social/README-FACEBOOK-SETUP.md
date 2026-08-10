# 🔑 Facebook Auto-Publish — วิธีขอ Page Access Token (ทำครั้งเดียว)

> เป้าหมาย: ให้ระบบโพสต์ลง **Facebook Page "GO Premium"** (https://www.facebook.com/gopremiums) อัตโนมัติผ่าน Graph API
> สิ่งที่ต้องได้ตอนจบ = **Long-lived Page Access Token** (แบบไม่หมดอายุ) + **Page ID**
> เวลาที่ใช้: ~15–20 นาที (ทำครั้งเดียว)

⚠️ **ทำไมคุณต้องเป็นคนทำขั้นตอนนี้เอง:** มันผูกกับบัญชี Facebook ของคุณ ผม (Claude) เข้าไปกด OAuth/ล็อกอินแทนไม่ได้ — แต่ผมเขียน script รอไว้หมดแล้ว คุณแค่เอา token มาวางในไฟล์ config เดียว

---

## ขั้นที่ 0 — เช็คสิทธิ์
คุณต้องเป็น **Admin** (หรืออย่างน้อยมีบทบาทจัดการเนื้อหา) ของเพจ `gopremiums` — ปกติเจ้าของเพจเป็นอยู่แล้ว

---

## ขั้นที่ 1 — สร้าง Meta App
1. ไปที่ https://developers.facebook.com/ → ล็อกอินด้วย Facebook ของคุณ
2. ถ้ายังไม่เคยสมัคร developer → กด **Get Started** ทำตาม (ยืนยันเบอร์/อีเมล)
3. เมนูบนขวา **My Apps → Create App**
4. เลือกประเภท: **Business** → Next
5. ตั้งชื่อ App เช่น `GoPremium Auto Publisher` → ใส่อีเมล → Create App

---

## ขั้นที่ 2 — เพิ่มสิทธิ์ + ดึง Token (วิธีเร็วสุด: Graph API Explorer)
1. ไปที่ https://developers.facebook.com/tools/explorer/
2. มุมขวาบน ช่อง **Meta App** → เลือก App ที่เพิ่งสร้าง
3. ปุ่ม **User or Page** → เลือก **Get Page Access Token** → เลือกเพจ **GO Premium**
4. กด **Add a Permission** ใส่ 3 ตัวนี้ให้ครบ (ติ๊กถูก):
   - `pages_manage_posts`  ← โพสต์ได้
   - `pages_read_engagement`  ← อ่านยอด engagement
   - `pages_show_list`  ← เห็นรายการเพจ
5. กด **Generate Access Token** → จะมีป๊อปอัพให้ยืนยันสิทธิ์ → กดอนุญาตให้ครบ
6. คัดลอก token ที่ได้ (อันนี้คือ **short-lived ~1 ชม.** ยังใช้ระยะยาวไม่ได้ — ไปขั้นต่อ)

---

## ขั้นที่ 3 — แปลงเป็น Token ไม่หมดอายุ (สำคัญ!)
Token จากขั้น 2 อายุสั้น เราต้องแปลงเป็น **Long-lived Page Token** ที่อยู่ได้ยาว (page token ที่ได้มาจาก long-lived user token มักไม่หมดอายุ)

ต้องใช้ 2 ค่านี้จากหน้า App (Settings → Basic):
- **App ID**
- **App Secret** (กด Show, ใส่รหัส FB ยืนยัน)

แล้วรันคำสั่งนี้ (ผมเตรียม script ให้แล้ว — แค่กรอกค่า):

```bash
node scripts/social/get-fb-token.mjs --app-id=<APP_ID> --app-secret=<APP_SECRET> --short-token=<TOKEN_จากขั้น2>
```

Script จะทำให้อัตโนมัติ:
1. แลก short-lived → long-lived **user** token
2. ดึง **page** token (ตัวที่ไม่หมดอายุ) + **Page ID** ของ gopremiums
3. ตรวจว่าโพสต์ได้จริงไหม
4. พิมพ์ค่าออกมาให้พร้อมวางลง config

---

## ขั้นที่ 4 — วาง Token ลง config
สร้างไฟล์ `scripts/social/.social-config.json` (ไฟล์นี้ถูก gitignore แล้ว ไม่หลุดขึ้น repo) ตามแบบใน `.social-config.example.json`:

```json
{
  "facebook": {
    "pageId": "<PAGE_ID>",
    "pageAccessToken": "<LONG_LIVED_PAGE_TOKEN>",
    "pageUrl": "https://www.facebook.com/gopremiums"
  }
}
```

เสร็จแล้วบอกผม → ผมจะรัน `node scripts/social/facebook-publish.mjs --test` เพื่อยิงโพสต์ทดสอบ 1 อัน (ลบได้)

---

## 🔒 ความปลอดภัย
- **อย่าวาง token/secret ลงแชทสาธารณะ หรือ commit ขึ้น git** — ไฟล์ `.social-config.json` อยู่ใน `.gitignore` แล้ว
- ถ้า token หลุด: ไปที่ App → ลบ/regenerate ได้ทันที
- ขั้นแรกแนะนำโหมด **"ร่าง → คุณอนุมัติ → ค่อยโพสต์"** เพื่อความปลอดภัยของแบรนด์

---

## ❓ ถ้าติดตรงไหน
ติดขั้นไหนแคปหน้าจอมาได้เลย ผมไกด์ทีละสเต็ป — หรือถ้าอยากให้เป็น **token ไม่หมดอายุถาวรแบบองค์กร** (System User token ผ่าน Business Manager) ผมมีวิธีนั้นให้เหมือนกัน (ซับซ้อนกว่านิดแต่เสถียรสุด)
