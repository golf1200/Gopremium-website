# 🤖 LINE "บอตอนุมัติงาน" (Tier 2 — โต้ตอบสองทาง) — วิธีตั้งค่า

> เป้าหมาย: บอท **ส่วนตัวสำหรับคุณคนเดียว** ที่ส่ง draft โพสต์เข้า LINE → คุณกดปุ่ม **✅อนุมัติ / ⏭️ข้าม** → บอท **ลงมือกับโพสต์ Facebook จริง**
> ⚠️ นี่คือ **channel แยกใหม่** — ไม่ใช่ OA GO PREMIUM ที่คุยกับลูกค้า (อันนั้นไว้ broadcast ต่างหาก)
> เวลาที่ใช้ ~20–30 นาที (ทำครั้งเดียว)

---

## ขั้นที่ 1 — สร้าง Messaging API channel ใหม่ (บอตอนุมัติ)
1. เข้า **LINE Developers Console**: https://developers.line.biz/console/
2. เลือก/สร้าง **Provider** (เช่น "Passion Grow")
3. กด **Create a new channel** → เลือก **Messaging API**
4. ตั้งชื่อ เช่น **"GoPremium Ops"** (เป็นบอตภายใน ไม่ต้องโปรโมต) → กรอกข้อมูล → Create

## ขั้นที่ 2 — ดึงค่า 3 ตัว
1. แท็บ **Basic settings** → คัดลอก **Channel secret**
2. แท็บ **Basic settings** เลื่อนลงสุด → **"Your user ID"** (ขึ้นต้น `U...`) = userId ของคุณ
3. แท็บ **Messaging API** → **Issue** **Channel access token (long-lived)** → คัดลอก
4. แท็บ **Messaging API** → สแกน **QR เพิ่มเพื่อนบอต** ในมือถือ (สำคัญ! ไม่งั้นบอท push หาคุณไม่ได้)

## ขั้นที่ 3 — วางค่าลง config (local)
ในไฟล์ `scripts/social/.social-config.json` เพิ่มบล็อก `line.approval`:
```json
{
  "facebook": { "...": "(มีอยู่แล้ว อย่าลบ)" },
  "line": {
    "approval": {
      "channelAccessToken": "<CHANNEL_ACCESS_TOKEN>",
      "channelSecret": "<CHANNEL_SECRET>",
      "toUserId": "<YOUR_USER_ID ขึ้นต้น U...>"
    }
  }
}
```
> 💡 ส่งค่า 3 ตัวมาให้ผม (วางในไฟล์) ผมจัด JSON ให้เอง — แล้วผมรัน `line-push.mjs --test` ส่งข้อความเข้า LINE คุณก่อน เพื่อยืนยันว่าทะลุถึงมือถือ

---

## ขั้นที่ 4 — Deploy webhook + ตั้ง ENV บน Vercel
ไฟล์ webhook พร้อมแล้วที่ `api/line-webhook.js` (จะกลายเป็น `https://<โดเมนคุณ>/api/line-webhook`)

ตั้ง **Environment Variables** ใน Vercel (Project → Settings → Environment Variables):
| ตัวแปร | ค่า |
|---|---|
| `LINE_APPROVAL_CHANNEL_SECRET` | Channel secret (ขั้น 2) |
| `LINE_APPROVAL_CHANNEL_TOKEN` | Channel access token (ขั้น 2) |
| `FB_PAGE_ID` | `252563755181013` |
| `FB_PAGE_TOKEN` | Page token (ตัวเดียวกับใน .social-config.json) |

> ผมช่วยตั้ง ENV + deploy ให้ได้ผ่าน Vercel CLI/เครื่องมือ — หรือคุณวางในหน้า Vercel เองก็ได้ (ผมไกด์)

## ขั้นที่ 5 — ลงทะเบียน webhook ใน LINE
1. แท็บ **Messaging API** → **Webhook URL** → วาง `https://<โดเมนคุณ>/api/line-webhook` → **Update** → **Verify** (ต้องขึ้น Success)
2. เปิด **Use webhook** = ON
3. ปิด **Auto-reply / Greeting** (Messaging API tab หรือใน OA Manager) — ไม่งั้นบอทตอบอัตโนมัติมั่ว

## ขั้นที่ 6 — เทสต์จริง
ผมจะรัน:
```
node scripts/social/send-draft.mjs --message="ทดสอบ draft" --label="ทดสอบ"
```
→ การ์ดเด้งเข้า LINE คุณ → กด **✅ อนุมัติ** → โพสต์ขึ้นเพจจริง (หรือ ⏭️ ข้าม = ลบ draft)

---

## 🔒 ความปลอดภัย
- `.social-config.json` gitignored · ENV เก็บบน Vercel ไม่อยู่ใน repo
- webhook ตรวจ **ลายเซ็น LINE (channelSecret)** ทุกครั้ง — กันคนยิงปลอม
- v1 ฟรี 100% (push หาตัวเอง + จัดการ draft) · v1.1 "แก้ด้วย AI" จะมีค่า token เล็กน้อย — ขอยืนยันก่อนเปิด
