# -*- coding: utf-8 -*-
"""Identity FIX result review: for each of the 40 SKUs show the SOURCE + old-wrong
website image (from the compare composite) next to the NEW fixed image on the site.
-> Demo/EXPRESS-IDENTITY-FIXED.html"""
import json, os, base64, io
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
db = {p['sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))}
gen = json.load(open(os.path.join(ROOT, 'src/data/product-images.generated.json'), encoding='utf-8'))
CMP = os.path.join(ROOT, '../Demo/_identity-compare')
IMGROOT = os.path.join(ROOT, 'public/images/products')
CATSLUG = {'Drinkware':'drinkware','Garment':'garment','Powerbank':'powerbank','Fan':'fan','Lifestyle':'lifestyle','Souvenir':'souvenir','Stationery':'stationery','Bag':'bags','Umbrella':'umbrella','Hat':'hat'}

fixed = ['EX005','EX006','EX026','EX040','EX041','EX003','EX029','EX030','EX031','EX032','EX033','EX034','EX035','EX012','EX125','EX121','EX112','EX134','EX145','EX013','EX116','EX113','EX140','EX143','EX153','EX154','EX170','EX014','EX015','EX019','EX021','EX110','EX011','EX018','EX036','EX100','EX111']
held = ['EX051','EX172']
minor = ['EX158']

def b64(path, w=460):
    if not path or not os.path.exists(path): return None
    im = Image.open(path).convert('RGB')
    if im.width > w: im = im.resize((w, int(im.height*w/im.width)))
    b = io.BytesIO(); im.save(b,'JPEG',quality=82)
    return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()

def newimg(sku):
    g = gen.get(sku,{})
    if g.get('gallery'):
        p = os.path.join(ROOT,'public',g['gallery'][0].split('?')[0].lstrip('/'))
        return b64(p, 300)
    return None

def card(sku, status):
    cmp = b64(os.path.join(CMP,f'{sku}.jpg'), 560)  # source + old website
    nw = newimg(sku)
    cmp_h = f'<img src="{cmp}">' if cmp else '<div class="noimg">—</div>'
    nw_h = f'<img src="{nw}">' if nw else '<div class="noimg">พักออกเว็บ</div>'
    return f'''<div class="card"><div class="hd"><b>{sku}</b> {db.get(sku,{}).get("name","")}</div>
      <div class="cols"><div><h4>ต้นฉบับ (ซ้าย) + รูปเก่าที่ผิด (ขวา)</h4>{cmp_h}</div>
      <div class="arr">→</div><div><h4>รูปใหม่ (แก้แล้ว บนเว็บ)</h4>{nw_h}</div></div></div>'''

html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express — ผล Identity Fix (ก่อน/หลัง)</title><link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{font-family:'Anuphan',sans-serif;background:#eef0f4;color:#13244a;padding:22px}}
.wrap{{max-width:1050px;margin:0 auto}}
.hero{{background:linear-gradient(135deg,#0a7d43,#13244a);color:#fff;border-radius:16px;padding:22px 26px;margin-bottom:16px}}
.hero h1{{font-size:24px}}.hero p{{color:#d3e8dc;margin-top:4px}}
h2{{font-size:19px;margin:24px 0 10px;padding-left:11px;border-left:5px solid #0a7d43}}h2.h{{border-color:#c98a00}}
.card{{background:#fff;border-radius:12px;padding:12px 16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.05)}}
.hd{{font-size:14px;margin-bottom:8px}}
.cols{{display:grid;grid-template-columns:1fr 26px 300px;gap:10px;align-items:center}}
h4{{font-size:11px;color:#6b7280;margin-bottom:5px}}
.cols img{{width:100%;border-radius:8px;border:1px solid #e5e7eb}}
.cols>div:last-child img{{border:2px solid #0a7d43}}
.arr{{font-size:24px;color:#0a7d43;text-align:center;font-weight:700}}
.noimg{{padding:30px;text-align:center;color:#bbb;background:#f6f4ef;border-radius:8px}}
.box{{background:#f0f9f2;border:1px solid #b9e6c8;border-radius:10px;padding:12px 15px;font-size:13px;margin-bottom:14px}}</style></head>
<body><div class="wrap">
<div class="hero"><h1>สินค้าส่งด่วน — ผลแก้ Product Identity (ก่อน / หลัง)</h1>
<p>Fable ตรวจ 124 ตัว → แก้ 37 ตัวที่ผิดตัว · เทียบ: ต้นฉบับซัพ + รูปเก่าที่ผิด → รูปใหม่ที่แก้แล้ว</p></div>
<div class="box">✅ <b>แก้ถูกตัว + live 37 ตัว</b> — ทุกตัวผ่าน Fable verify (ถูกตัว/ตั้งตรง/ไม่มีลิขสิทธิ์/คุณภาพ) · รูปขวา = บนเว็บตอนนี้</div>
<h2>✅ แก้แล้ว ({len(fixed)})</h2>
{''.join(card(s,'fixed') for s in fixed)}
<h2 class="h">🟡 พักรอรูปซัพหน้าเรียบ ({len(held)})</h2>
{''.join(card(s,'held') for s in held)}
<h2 class="h">⚪ ปล่อยไว้ (ถูกประเภท) ({len(minor)})</h2>
{''.join(card(s,'minor') for s in minor)}
</div></body></html>'''
OUT = os.path.join(ROOT,'../Demo/EXPRESS-IDENTITY-FIXED.html')
open(OUT,'w',encoding='utf-8').write(html)
print(f'wrote {os.path.relpath(OUT)} — {os.path.getsize(OUT)//1024} KB, fixed {len(fixed)}')
