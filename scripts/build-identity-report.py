# -*- coding: utf-8 -*-
"""Fable product-identity report -> Demo/EXPRESS-IDENTITY-REPORT.html
Shows the SOURCE-vs-WEBSITE compare image + verdict for every mismatched SKU."""
import json, os, base64, io
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
v = json.load(open(os.path.join(ROOT, '../Demo/_identity-verdict.json'), encoding='utf-8'))
db = {p['sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))}
CMP = os.path.join(ROOT, '../Demo/_identity-compare')

def enc(sku, w=760):
    p = os.path.join(CMP, f'{sku}.jpg')
    if not os.path.exists(p): return None
    im = Image.open(p).convert('RGB')
    if im.width > w: im = im.resize((w, int(im.height * w / im.width)))
    b = io.BytesIO(); im.save(b, 'JPEG', quality=82)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

def cards(d):
    out = ''
    for sku, why in d.items():
        img = enc(sku)
        ih = f'<img src="{img}">' if img else '<div class="noimg">—</div>'
        out += f'<div class="card"><div class="hd"><b>{sku}</b> {db.get(sku,{}).get("name","")}</div>{ih}<div class="why">{why}</div></div>'
    return out

n_d, n_u, n_o = len(v['different']), len(v['unsure']), len(v['other'])
html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express — Fable ตรวจ Product Identity</title><link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{font-family:'Anuphan',sans-serif;background:#eceae4;color:#13244a;padding:22px}}
.wrap{{max-width:900px;margin:0 auto}}
.hero{{background:linear-gradient(135deg,#7a1f1f,#13244a);color:#fff;border-radius:16px;padding:22px 26px;margin-bottom:16px}}
.hero h1{{font-size:24px}}.hero p{{color:#e8d3d3;margin-top:4px}}
.stats{{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}}
.stat{{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.14);border-radius:11px;padding:11px 15px;flex:1;min-width:110px}}
.stat b{{font-size:24px;display:block}}.stat.bad b{{color:#ff9a9a}}.stat.warn b{{color:#f4b223}}.stat.ok b{{color:#7CFFB2}}.stat span{{font-size:12px;color:#e8d3d3}}
h2{{font-size:19px;margin:24px 0 10px;padding-left:11px;border-left:5px solid #c0392b}}h2.u{{border-color:#c98a00}}h2.o{{border-color:#888}}
.card{{background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.05)}}
.hd{{font-size:14px;margin-bottom:8px}}.card img{{width:100%;border-radius:8px;border:1px solid #e5e7eb}}
.why{{margin-top:8px;color:#b04a4a;font-size:14px;font-weight:600;background:#fff2f2;padding:7px 12px;border-radius:8px}}
.noimg{{padding:40px;text-align:center;color:#bbb}}
.box{{background:#fffbe9;border:1px solid #f4e2a8;border-radius:10px;padding:12px 15px;font-size:13px;margin-bottom:14px}}</style></head>
<body><div class="wrap">
<div class="hero"><h1>สินค้าส่งด่วน — Fable ตรวจ Product Identity เทียบ Google Drive/1688</h1>
<p>ตรวจครบ 124 ตัว · เทียบรูปเว็บกับรูปซัพจริง (ของ master) ทีละตัว</p>
<div class="stats">
  <div class="stat ok"><b>81</b><span>ตรง (ถูกตัว)</span></div>
  <div class="stat bad"><b>{n_d}</b><span>ผิดตัว (คนละสินค้า)</span></div>
  <div class="stat warn"><b>{n_u}</b><span>น่าสงสัย</span></div>
  <div class="stat"><b>{n_o}</b><span>รูปซ้ำ/สลับ</span></div>
</div></div>
<div class="box">🔴 <b>ยืนยันสิ่งที่คุณสังเกต:</b> รูปที่ gen รอบก่อนๆ ใช้ source ผิด ทำให้ได้สินค้า<b>คนละตัว</b> {n_d} รายการ (กระจุกที่แก้วมีหู, ร่มลายมั่ว, powerbank คนละรุ่น) · ทางแก้: <b>regen ใหม่จากรูป Drive/1688 ที่ถูกต้อง</b> (รูปซ้ายในแต่ละการ์ด = ของจริง)</div>

<h2>🔴 ผิดตัว — คนละสินค้า ({n_d})</h2>
{cards(v['different'])}
<h2 class="u">🟡 น่าสงสัย — ควรตรวจ/regen ({n_u})</h2>
{cards(v['unsure'])}
<h2 class="o">⚪ รูปซ้ำ / สลับสี ({n_o})</h2>
{cards(v['other'])}
</div></body></html>'''
OUT = os.path.join(ROOT, '../Demo/EXPRESS-IDENTITY-REPORT.html')
open(OUT, 'w', encoding='utf-8').write(html)
print(f'wrote {os.path.relpath(OUT)} — {os.path.getsize(OUT)//1024} KB')
