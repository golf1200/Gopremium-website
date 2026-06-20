# -*- coding: utf-8 -*-
"""Side-by-side OLD(catalog) vs NEW(raw) review for every express SKU, with the
agent same-product verdicts. Flagged items first. Self-contained base64."""
import os, io, json, base64
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,"express-template-mockups","REVIEW-old-vs-new.html")
pairs={p["sku"]:p for p in json.load(io.open(os.path.join(ROOT,"express-template-mockups","_compare-pairs.json"),encoding="utf-8"))}

# verdicts from the 6 comparison agents
V=[
("EX040","DIFFERENT","med",True,"รูปทรงต่างกัน: เก่าทรงกระบอกตรง / ใหม่ทรงกรวยเรียว (เหมือนตระกูล EX039) — เช็กว่าตัวไหนถูก"),
("EX008","DIFFERENT","med",False,"เก่า=หมวกบักเก็ต(มุมในหมวก) / ใหม่=หมวกแก๊ปตาข่าย — คนละทรง (ชื่อ SKU เป็นเซ็ตหลายหมวก)"),
("EX026","DIFFERENT","high",False,"เก่าเป็นรูป 'ฝาแก้ว' อย่างเดียว(รูปไม่ดี) / ใหม่เป็นแก้ว skinny เต็มใบ — ใหม่ถูกกว่า ✅"),
("EX002","SAME","high",True,"ขาว→เทา (เสื้อแขนยาวตัวเดียวกัน, ใหม่เป็นมุมหลัง)"),
("EX003","SAME","high",True,"ครีม→ส้ม (เสื้อ oversize ตัวเดียวกัน, ใหม่โคลสอัพ)"),
("EX009","SAME","high",True,"ยีนส์เข้ม→น้ำเงิน (แก๊ปทรงเดียวกัน)"),
("EX019","SAME","high",True,"ดำ→น้ำเงิน/ทอง (ร่มกอล์ฟตัวเดียวกัน)"),
("EX025","SAME","high",True,"ดำ→แดง (ทัมเบลอร์ 20oz ตัวเดียวกัน)"),
("EX031","SAME","high",True,"เงิน→ขาว (แก้วหูเหลี่ยมตัวเดียวกัน)"),
("EX032","SAME","med",True,"กลุ่มแก้ว→แก้วขาวเดี่ยว (ทรงสูงกว่าเล็กน้อย, ชนิดเดียวกัน)"),
("EX035","SAME","high",True,"เงิน→ขาว (มัคหูโค้งตัวเดียวกัน)"),
("EX042","SAME","high",True,"น้ำเงิน→แดง (แจ็คเก็ตตัวเดียวกัน)"),
("EX044","SAME","high",True,"ขาว→แดง (โปโล Russell ตัวเดียวกัน)"),
("EX045","SAME","high",True,"ครีม→ดำ (โปโลตัวเดียวกัน)"),
("EX046","SAME","high",True,"น้ำตาล→กรมท่า (โปโลแถบข้างตัวเดียวกัน)"),
("EX047","SAME","high",True,"ขาว→กรมท่า (ผ้ากันเปื้อนเต็มตัวเดียวกัน)"),
("EX048","SAME","high",True,"ขาว→ดำ (ผ้ากันเปื้อนครึ่งตัวเดียวกัน)"),
("EX052","SAME","high",True,"ดำ→กรมท่า (กางเกงทำงานตัวเดียวกัน)"),
("EX039","SAME","high",False,"ใหม่เพิ่มสีขาว (6 สี vs 5) ตระกูลเดียวกัน"),
("EX001","SAME","high",False,""),("EX004","SAME","high",False,""),("EX005","SAME","high",False,""),
("EX006","SAME","high",False,""),("EX027","SAME","high",False,""),("EX029","SAME","high",False,""),
("EX030","SAME","high",False,""),("EX033","SAME","high",False,""),("EX034","SAME","high",False,""),
("EX036","SAME","high",False,""),("EX037","SAME","high",False,""),("EX038","SAME","high",False,""),
("EX041","SAME","high",False,""),("EX049","SAME","high",False,""),("EX050","SAME","high",False,""),
("EX051","SAME","high",False,""),("EX053","SAME","med",False,""),("EX054","SAME","high",False,""),
("EX055","SAME","high",False,""),
]
order={"DIFFERENT":0,"UNCERTAIN":1,"SAME":2}
V.sort(key=lambda r:(order[r[1]], 0 if r[3] else 1, r[0]))

def b64(rel):
    im=Image.open(os.path.join(ROOT,rel)); im.thumbnail((520,520),Image.LANCZOS)
    buf=io.BytesIO(); im.convert("RGB").save(buf,"JPEG",quality=82,optimize=True)
    return "data:image/jpeg;base64,"+base64.b64encode(buf.getvalue()).decode()

rows=[]
for sku,verdict,conf,coldiff,note in V:
    p=pairs.get(sku)
    if not p: continue
    badge={"DIFFERENT":"#c0392b","UNCERTAIN":"#b8860b","SAME":"#1f8a4c"}[verdict]
    tag = verdict + (" · สีต่าง" if coldiff else "")
    rows.append(f'''<div class="cmp">
      <div class="cmphd"><b>{sku}</b> · {p.get("name","")}
        <span class="vb" style="background:{badge}">{tag}</span><span class="cf">conf {conf}</span></div>
      <div class="imgs"><figure><img src="{b64(p["old_catalog"])}"><figcaption>เดิม (แคตตาล็อก/AI)</figcaption></figure>
      <figure><img src="{b64(p["new_raw"])}"><figcaption>ใหม่ (รูป raw จริง)</figcaption></figure></div>
      {f'<div class="note">{note}</div>' if note else ''}
    </div>''')

ndiff=sum(1 for r in V if r[1]=="DIFFERENT"); ncol=sum(1 for r in V if r[3] and r[1]=="SAME")
html=f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>เทียบรูปเดิม vs รูป raw ใหม่ — สินค้าตัวเดียวกันไหม</title>
<style>
*{{box-sizing:border-box;margin:0}}body{{font-family:"Sora","IBM Plex Sans Thai",system-ui,sans-serif;background:#f4f2ec;color:#13244a}}
header{{background:#13244a;color:#fff;padding:26px 18px;text-align:center}}header h1{{font-size:21px}}header p{{color:#cdd6e6;font-size:14px;margin-top:8px;max-width:80ch;margin-inline:auto}}
.bar{{height:4px;background:#f4b223}}
main{{max-width:1080px;margin:0 auto;padding:22px 16px 70px}}
.cmp{{background:#fff;border-radius:14px;padding:16px;margin-bottom:16px;box-shadow:0 6px 20px rgba(19,36,74,.07)}}
.cmphd{{font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}}
.vb{{color:#fff;font-size:12px;padding:3px 10px;border-radius:999px;font-weight:600}}
.cf{{font-size:11.5px;color:#8A93A2}}
.imgs{{display:grid;grid-template-columns:1fr 1fr;gap:12px}}
figure{{border:1px solid #e7e3d8;border-radius:10px;overflow:hidden;background:#fafafa}}
figure img{{width:100%;aspect-ratio:1/1;object-fit:contain;background:#fff;display:block}}
figcaption{{font-size:12px;color:#5B6472;text-align:center;padding:7px}}
.note{{margin-top:10px;background:#fff7e6;border:1px solid #f4b223;border-radius:9px;padding:9px 12px;font-size:13px;color:#5a4a1e}}
.sum{{background:#fff;border-radius:14px;padding:16px 20px;margin-bottom:18px;font-size:14px;line-height:1.7}}
</style></head><body>
<header><h1>เทียบรูปเดิม (แคตตาล็อก) ↔ รูป raw ใหม่ — เป็นสินค้าตัวเดียวกันไหม</h1>
<p>ตรวจด้วย agent 6 ตัว ทั้ง 38 SKU · เรียงตัวที่ต้องดูขึ้นก่อน · ซ้าย=รูปเดิม(AI) ขวา=รูป raw จริงที่เพิ่งสลับเข้าไป</p></header><div class="bar"></div>
<main><div class="sum"><b>สรุป:</b> ตัวเดียวกัน <b>{38-ndiff}/38</b> · ต่างกัน/ต้องดู <b>{ndiff}</b> (EX040, EX008, EX026) · เป็นตัวเดียวกันแต่ <b>สลับสี {ncol}</b> ตัว (เลือกสีหลักได้)</div>
{''.join(rows)}</main></body></html>'''
io.open(OUT,"w",encoding="utf-8").write(html)
print("WROTE",OUT,"|",round(os.path.getsize(OUT)/1024/1024,2),"MB |",len(rows),"pairs |",ndiff,"different,",ncol,"color-changed")
