# -*- coding: utf-8 -*-
import os, base64, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, "express-template-mockups")

TEMPLATES = [
    ("01-studio-cream", "1 · Studio Cream", "พื้นครีมออฟไวต์ + เงานุ่ม (สไตล์ที่ใช้อยู่ตอนนี้) — สะอาด เป็นกลาง"),
    ("02-navy-podium",  "2 · Navy Podium + เส้นทอง", "ผนังกรมท่า #13244a + พื้นเวที เส้นขอบฟ้าสีทอง #f4b223 — พรีเมียม ตรงแบรนด์ CI"),
    ("03-gold-halo",    "3 · Gold Halo", "พื้นครีม + ออร่าทองอ่อนหลังสินค้า — อบอุ่น ดึงสายตาไปที่สินค้า"),
    ("04-two-tone",     "4 · Two-Tone Navy Panel", "พื้นครีมครึ่งบน + แผงกรมท่ากรอบทองครึ่งล่าง — มีดีไซน์ ใส่ข้อความ/โลโก้ได้"),
    ("05-dark-luxe",    "5 · Dark Luxe", "พื้นกรมท่าเข้ม + สปอตไลต์ + แถบทองล่าง — หรู สาย Exclusive/VIP"),
    ("06-warm-floor",   "6 · Warm Minimal Floor", "ผนังครีม + พื้นอุ่น เงาสัมผัส + เงาสะท้อน — แคตตาล็อกพรีเมียมมินิมอล"),
]
PRODS = [("EX004","ขวดน้ำ"),("EX035","แก้ว"),("EX001","เสื้อยืด"),("EX056","กระเป๋า")]

def b64(fn):
    with open(os.path.join(OUT, fn),"rb") as f:
        return "data:image/jpeg;base64,"+base64.b64encode(f.read()).decode()

blocks=[]
for tid,tname,desc in TEMPLATES:
    cells="".join(
        f'<figure><img src="{b64(f"{sku}_{tid}.jpg")}" alt="{sku}"><figcaption>{sku} · {th}</figcaption></figure>'
        for sku,th in PRODS)
    blocks.append(f'''<section class="tpl">
      <div class="thd"><h2>{tname}</h2><p>{desc}</p></div>
      <div class="row">{cells}</div></section>''')

html=f'''<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express Product Template — เลือกสไตล์</title>
<style>
*{{box-sizing:border-box;margin:0}}
body{{font-family:"Sora","IBM Plex Sans Thai",system-ui,sans-serif;background:#f4f2ec;color:#13244a}}
header{{background:#13244a;color:#fff;padding:34px 28px;text-align:center}}
header h1{{font-size:26px;letter-spacing:.3px}}
header p{{color:#cdd6e6;margin-top:8px;font-size:14.5px;max-width:70ch;margin-inline:auto}}
.bar{{height:4px;background:#f4b223}}
main{{max-width:1180px;margin:0 auto;padding:26px 18px 70px}}
.tpl{{background:#fff;border-radius:18px;padding:22px;margin-bottom:24px;box-shadow:0 8px 26px rgba(19,36,74,.07)}}
.thd h2{{font-size:20px}}
.thd p{{color:#5B6472;font-size:14px;margin-top:5px;margin-bottom:16px}}
.row{{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}}
@media(max-width:760px){{.row{{grid-template-columns:repeat(2,1fr)}}}}
figure{{border:1px solid #e7e3d8;border-radius:12px;overflow:hidden;background:#fafafa}}
figure img{{width:100%;display:block;aspect-ratio:1/1;object-fit:cover}}
figcaption{{font-size:12px;color:#5B6472;padding:8px 10px;text-align:center}}
.note{{background:#fff7e6;border:1px solid #f4b223;border-radius:14px;padding:16px 20px;font-size:14px;margin-bottom:22px;color:#5a4a1e}}
</style></head><body>
<header><h1>Express · Product Template — เลือกสไตล์พื้นหลัง</h1>
<p>6 สไตล์ × สินค้าตัวอย่าง 4 ชิ้น (รูปเดิมที่ gen ไว้ ตัดพื้นใหม่ด้วย rembg ฟรี ไม่เสียเครดิต) — บอกเลขสไตล์ที่ชอบ แล้วผมจะ render ครบทุก SKU ส่งด่วน + เปลี่ยนในหน้าเว็บให้</p></header>
<div class="bar"></div>
<main>
<div class="note">CI: Navy <b>#13244a</b> · Gold <b>#f4b223</b> · off-white — ทุกสไตล์ทำฟรีด้วย PIL/rembg. เลือกได้ทั้งแบบเดียวกันหมด หรือผสม (เช่น สินค้าทั่วไปใช้ #2, งาน VIP ใช้ #5)</div>
{''.join(blocks)}
</main></body></html>'''

p=os.path.join(OUT,"REVIEW-express-templates.html")
open(p,"w",encoding="utf-8").write(html)
print("WROTE",p)
print("SIZE",round(os.path.getsize(p)/1024),"KB")
