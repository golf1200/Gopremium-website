# LINE OA Customer Chatbot — คู่มือตั้งค่า

บอท AI คุยกับลูกค้าใน LINE OA ของ GO PREMIUM — รู้จักแคตตาล็อกจริง 240 SKU ตอบ/แนะนำสินค้า, ขอใบเสนอราคา (RFQ), ตอบ FAQ, และส่งต่อแอดมินได้

- **Endpoint (webhook):** `POST /api/line-chat` → `https://gopremium-website.vercel.app/api/line-chat`
- **โมเดล:** Claude Haiku 4.5 (เร็ว + ถูก ~฿0.02–0.05/ข้อความ)
- **ข้อมูลสินค้า:** `api/_data/products.js` (สร้างจาก `scripts/build-line-catalog.mjs` — ตัดลิงก์ซัพ/ต้นทุนออกแล้ว)
- **เก็บบทสนทนา/RFQ:** Supabase `line_sessions`, `line_rfq` (project *GoPremium Platform*)
- ⚠️ เป็นคนละบอทกับ `api/line-webhook.js` (บอทอนุมัติโพสต์ FB) — ใช้ LINE channel คนละตัว ไม่กระทบกัน

---

## ขั้นที่ 1 — ใส่ Environment Variables ใน Vercel

ไปที่ Vercel → project **gopremium-website** → Settings → Environment Variables → เพิ่มทีละตัว (Environment: **Production**) :

| ชื่อ (Key) | ค่า (Value) | หาได้จากไหน |
|---|---|---|
| `LINE_OA_CHANNEL_SECRET` | *(Channel secret ของ OA ลูกค้า)* | LINE Developers Console → channel → Basic settings → **Channel secret** |
| `LINE_OA_CHANNEL_TOKEN` | *(Channel access token — long-lived)* | LINE Developers Console → channel → Messaging API → **Channel access token** (กด Issue) |
| `ANTHROPIC_API_KEY` | *(คีย์ Anthropic)* | console.anthropic.com → API keys |
| `SUPABASE_URL` | `https://jrutfaqhhexgojmvioyn.supabase.co` | (ใส่ตามนี้ได้เลย) |
| `SUPABASE_SERVICE_KEY` | *(service_role key)* | Supabase → project *GoPremium Platform* → Settings → API → **service_role** (secret) |
| `ADMIN_LINE_USER_ID` | *(userId ของ Golf)* | ดูขั้นที่ 4 (พิมพ์ `/whoami` ให้บอท) — ใส่ทีหลังได้ |
| `ANTHROPIC_MODEL` | *(ไม่ต้องใส่ก็ได้)* | ค่า default = `claude-haiku-4-5-20251001` |

> `ADMIN_LINE_USER_ID` เว้นว่างไว้ก่อนได้ — ถ้ายังไม่ใส่ บอทยังทำงานปกติ แค่จะไม่มีการ "แจ้งเตือนแอดมิน" ตอนมี RFQ/handoff (ข้อมูลยังถูกเก็บใน Supabase ครบ)

---

## ขั้นที่ 2 — Deploy

หลังใส่ env ครบแล้ว **บอกผม** → ผมจะ commit + push ขึ้น `main` (Vercel auto-deploy พร้อม env)
หรือถ้าใส่ env หลัง deploy ไปแล้ว ต้อง **redeploy 1 ครั้ง** เพื่อให้ env มีผล

---

## ขั้นที่ 3 — ตั้ง Webhook URL ใน LINE

**A) LINE Developers Console** (developers.line.biz) → channel (Messaging API) :
1. Webhook URL = `https://gopremium-website.vercel.app/api/line-chat`
2. เปิด **Use webhook** = ON
3. กด **Verify** → ต้องขึ้น Success (200)

**B) LINE Official Account Manager** (manager.line.biz) → Settings → **Response settings** :
1. **Chat** = เปิด (เพื่อให้แอดมินตอบเองได้ตอน handoff)
2. **Webhook** = เปิด
3. **Auto-response (ตอบกลับอัตโนมัติ)** = **ปิด** ← สำคัญ ไม่งั้นข้อความอัตโนมัติของ LINE จะชนกับบอท
4. Greeting message = จะเปิดหรือปิดก็ได้ (บอทมีข้อความต้อนรับตอน follow อยู่แล้ว)

---

## ขั้นที่ 4 — ทดสอบ + เอา Admin userId

1. แอดเป็นเพื่อนกับ OA แล้วทักไปว่า **"อยากได้ร่มแจกลูกค้า งบ 150"** → บอทควรแนะนำร่มจริงจากแคตตาล็อก
2. พิมพ์ **"ขอใบเสนอราคา ร่ม 300 ชิ้น สกรีนโลโก้ เบอร์ 08x-xxx-xxxx"** → บอทรับเรื่อง + แถว RFQ ใหม่ใน Supabase `line_rfq`
3. พิมพ์ **"ขอคุยกับแอดมิน"** → บอทเงียบ, สลับโหมด human (แอดมินเข้าตอบใน OA Manager ได้); ลูกค้าพิมพ์ **"คุยกับบอท"** เพื่อกลับมาคุยกับบอท (หรือรอ auto 3 ชม.)
4. พิมพ์ **`/whoami`** → บอทตอบ `userId` ของคุณ → เอาไปใส่ `ADMIN_LINE_USER_ID` ใน Vercel แล้ว redeploy จะได้รับแจ้งเตือน RFQ/handoff เข้า LINE ตัวเอง

---

## สิ่งที่บอททำได้ / ควบคุมอย่างไร

- **แนะนำสินค้า** — ค้นแคตตาล็อกด้วย n-gram (ภาษาไทย) ส่ง 14 SKU ที่เกี่ยวข้องให้ Claude ตอบแบบ grounded ไม่มั่ว
- **ราคา** — บอกเป็น "ราคาเริ่มต้นโดยประมาณ/ชิ้น @300" เสมอ ไม่สัญญาเป๊ะ → นัดขอใบเสนอราคา
- **ความปลอดภัยข้อมูล** — บอทไม่เห็นต้นทุน/ลิงก์ซัพเลย (ตัดออกตั้งแต่ตอน build catalog)
- **ความจำ** — จำบทสนทนาได้ 12 ข้อความล่าสุด/คน (Supabase)
- **ปรับคำพูด/บุคลิกบอท** — แก้ที่ `api/_lib/prompt.js`
- **อัปเดตสินค้า** — เมื่อ `catalog-master.json` เปลี่ยน รัน `node scripts/build-line-catalog.mjs` แล้ว deploy

## ไฟล์ที่เกี่ยวข้อง
```
api/line-chat.js          ← webhook หลัก (verify, routing, RFQ, handoff)
api/_lib/line.js          ← LINE API (reply/push/loading/verify)
api/_lib/anthropic.js     ← เรียก Claude + นิยาม tools (capture_rfq, request_human)
api/_lib/catalog.js       ← ค้น/format สินค้า (n-gram ไทย)
api/_lib/prompt.js        ← system prompt (บุคลิก + กฎ)
api/_lib/store.js         ← Supabase session/RFQ
api/_data/products.js     ← slim catalog 240 SKU (auto-generated)
scripts/build-line-catalog.mjs  ← regenerate products.js
```
