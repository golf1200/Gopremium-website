# -*- coding: utf-8 -*-
"""Review the FINAL express catalog images (authentic raw) exactly as wired for live.
Renders the real card grid from the processed public square files. Self-contained base64."""
import os, io, re, json, base64
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,"express-template-mockups","REVIEW-express-LIVE-raw.html")
EXPRESS=['EX001','EX002','EX003','EX004','EX005','EX006','EX008','EX009','EX019','EX025','EX026','EX027','EX029','EX030','EX031','EX032','EX033','EX034','EX035','EX036','EX037','EX038','EX039','EX040','EX041','EX042','EX044','EX045','EX046','EX047','EX048','EX049','EX050','EX051','EX052','EX053','EX054','EX055']
js=io.open(os.path.join(ROOT,"public","catalogue-data.js"),encoding="utf-8",errors="replace").read()
def arr(name):
    i=js.index(name+"=[")+len(name)+1;d=0
    for j in range(i,len(js)):
        if js[j]=='[':d+=1
        elif js[j]==']':
            d-=1
            if d==0:return json.loads(js[i:j+1])
def obj(name):
    i=js.index(name+"={")+len(name)+1;d=0
    for j in range(i,len(js)):
        if js[j]=='{':d+=1
        elif js[j]=='}':
            d-=1
            if d==0:return json.loads(js[i:j+1])
PR={p["sku"]:p for p in arr("window.GP_PRODUCTS")}
CL=obj("window.GP_CATLABELS")
style=re.search(r"<style>.*?</style>",io.open(os.path.join(ROOT,"public","v2.html"),encoding="utf-8",errors="replace").read(),re.S).group(0)
def b64(path):
    im=Image.open(path); im.thumbnail((760,760),Image.LANCZOS)
    buf=io.BytesIO(); im.convert("RGB").save(buf,"JPEG",quality=82,optimize=True)
    return "data:image/jpeg;base64,"+base64.b64encode(buf.getvalue()).decode()
def baht(p): return ("฿%s"%format(p,",")) if p else "สอบถามราคา"
cards=[]
for sku in EXPRESS:
    p=PR.get(sku)
    if not p: continue
    img=os.path.join(ROOT,"public",p.get("img","").split("?")[0].lstrip("/").replace("/",os.sep))
    if not os.path.exists(img): continue
    chip=CL.get(p.get("catSlug",""),p.get("cat",""))
    cards.append(f'''<a class="pcard" href="javascript:void(0)"><div class="pthumb"><span class="pchip">{chip}</span><img loading="lazy" src="{b64(img)}" alt="{p.get('name','')}"></div>
    <div class="pbody"><div class="pname">{p.get('name','')}</div><div class="pfeat">{p.get('features','') or ''}</div>
    <div class="pfoot"><div class="pprice">{baht(p.get('price'))} <small>{'/ชิ้น' if p.get('price') else ''}</small></div><div class="pmoq">MOQ {p.get('moq','')}</div></div></div></a>''')
page=f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express LIVE — รูป raw จริง (review ก่อน deploy)</title>{style}
<style>.rv{{background:#13244a;color:#fff;padding:24px 18px;text-align:center}}.rv h1{{font-size:22px}}.rv p{{color:#cdd6e6;font-size:14px;margin-top:6px;max-width:74ch;margin-inline:auto}}</style></head>
<body><div class="rv"><h1>หน้า Express — รูปถ่ายจริง (พร้อม review ก่อน deploy)</h1>
<p>นี่คือรูปที่ wire ลงหน้าเว็บแล้ว (เขียนทับ <code>*-square.jpg</code>, ทำสี่เหลี่ยมพื้นขาว/crop, ทุกไฟล์ &lt;170KB) — ยังไม่ push ของเดิม backup ไว้ที่ <code>_backup-live-squares/</code></p></div>
<section class="sec" style="padding-top:20px"><div class="wrap"><div class="pgrid">{''.join(cards)}</div></div></section></body></html>'''
io.open(OUT,"w",encoding="utf-8").write(page)
print("WROTE",OUT,"|",round(os.path.getsize(OUT)/1024/1024,2),"MB |",len(cards),"cards")
