# NPD → เว็บลูกค้า (live Master sync) — ของค้าง / ต้องทำเพื่อเปิดใช้

**วันที่:** 2026-07-16
**สถานะ:** โค้ดพร้อม + เทสต์ผ่าน (local full build exit 0, output identical) — **ยังไม่ commit / ยังไม่ deploy**

## ไฟล์ที่แก้ในงานนี้ (commit แบบ SELECTIVE เท่านั้น — repo นี้มี uncommitted อื่นเยอะที่ไม่เกี่ยว ⚠️ ห้าม `git add -A`)

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `scripts/sync-master-live.mjs` | **ใหม่** — build-time ดึง Product Master สด → append เฉพาะสินค้า NPD (tag `ช่องทาง=NPD→Master` + มีราคา) เข้า products-raw.json ก่อน build. Fallback ปลอดภัย: fetch fail/ไม่มี env → เตือน + exit 0 (ใช้ไฟล์ commit เดิม ไม่พัง) |
| `scripts/build-catalogue-data.mjs` | เพิ่ม fallback: สินค้าที่ไม่มีรูป curated แต่มี `p.images` (URL จาก pipeline) ให้ใช้รูปนั้น |
| `package.json` | build chain เพิ่ม `sync-master-live.mjs` + `build-catalogue-data.mjs` เป็น 2 step แรก |

คำสั่ง commit ที่แนะนำ:
```
git add scripts/sync-master-live.mjs scripts/build-catalogue-data.mjs package.json
git commit -m "NPD: build-time live-sync of published products from Product Master"
git push origin main
```

## Env ที่ต้องตั้งก่อนจึงจะทำงาน (ถ้าไม่ตั้ง = เว็บ build เหมือนเดิมทุกอย่าง ปลอดภัย แต่สินค้า NPD ใหม่จะไม่ขึ้น)

**โปรเจกต์ Vercel `gopremium-website`** → Settings › Environment Variables (Production) เพิ่ม:
- `SHEET_URL` = ค่า `url` ใน `website/scripts/.sheet-config.json` (Apps Script /exec)
- `SHEET_TOKEN` = ค่า `token` ในไฟล์เดียวกัน

(build บน Vercel ไม่มีไฟล์ .sheet-config.json เพราะ gitignore — จึงต้องใส่เป็น env)

## ฝั่ง Platform (repo อื่น: COWORK Agent/GoPremium-Platform) — deploy แล้ว รอ env เดียว
- `WEBSITE_DEPLOY_HOOK` = Vercel **Deploy Hook** ของ `gopremium-website` (สร้างที่ Settings › Git › Deploy Hooks, branch main)
  → ทำให้ปุ่ม "ขึ้นเว็บ" ในการ์ด NPD สั่ง redeploy เว็บลูกค้าอัตโนมัติ

## ครบวงจรเมื่อทำครบ
กรอกฟอร์ม/ซิงก์ → หาของ+เทียบซัพ → เลือกซัพ → อนุมัติ → 🚀 เข้า Master (เขียน Sheet + tag NPD→Master) → 🌐 ขึ้นเว็บ (ยิง Deploy Hook → เว็บ build → sync-master-live ดึงสินค้าใหม่จาก Master → ขึ้นเว็บจริง)

## ทดสอบแล้ว
- `node scripts/sync-master-live.mjs` → 0 NPD product, ไม่แตะไฟล์, exit 0
- inject สินค้า NPD จำลอง → build-catalogue-data → render ครบ + รูปจาก URL ภายนอกใช้ได้
- `npm run build` เต็ม → exit 0, 385 products, 380 หน้า, output เท่าเดิมเป๊ะ (md5 catalogue-data.js ตรงต้นฉบับ)
