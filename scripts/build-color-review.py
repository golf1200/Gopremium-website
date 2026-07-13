# -*- coding: utf-8 -*-
"""Colour decision report: AI-detected colours (swatches) vs the master's stated
count, split into safe-to-apply vs needs-decision (master claims MORE than the photo
shows). -> Demo/EXPRESS-COLOR-REVIEW.html"""
import json, os, re, base64, io
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
det = json.load(open(os.path.join(ROOT, '../Demo/_detected-colors.json'), encoding='utf-8'))
db = {p['sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))}
cmap = json.load(open(os.path.join(ROOT, 'src/data/color-map.json'), encoding='utf-8'))
keys = sorted([k for k in cmap if k[0] != '_'], key=len, reverse=True)
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
picks = json.load(open(os.path.join(ROOT, '../Demo/_source-picks.json'), encoding='utf-8'))
def hexof(n):
    n = str(n).strip()
    if n in cmap: return cmap[n]
    for k in keys:
        if k in n: return cmap[k]
    return '#cccccc'
def num(s):
    m = re.search(r'\d+', str(s)); return int(m.group()) if m else 0
import glob
def src_thumb(sku, box=150):
    multi = next((c for c in picks.get(sku, []) if c.get('multicolor')), None)
    if not multi: return None
    p = os.path.normpath(os.path.join(ROOT, multi['path']))
    if not os.path.exists(p): return None
    try:
        im = Image.open(p).convert('RGB'); im.thumbnail((box, box))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=78)
        return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    except Exception: return None

match, mismatch = [], []
for sku, v in det.items():
    stated = num(v['stated']); found = len(v['colors'])
    (mismatch if found < stated - 1 else match).append((sku, stated, found, v['colors']))

def card(sku, stated, found, colors):
    p = db.get(sku, {})
    sw = ''.join(f'<span class="sw" title="{c}"><i style="background:{hexof(c)}"></i>{c}</span>' for c in colors)
    t = src_thumb(sku)
    im = f'<img src="{t}">' if t else '<div class="noimg">—</div>'
    flag = f'<span class="flag">master เคลม {stated} · รูปมี {found}</span>' if found < stated - 1 else f'<span class="ok">{found} สี</span>'
    return f'<div class="card"><div class="l">{im}</div><div class="r"><div class="hd"><b>{sku}</b> {p.get("name","")} {flag}</div><div class="sws">{sw}</div></div></div>'

secM = ''.join(card(*x) for x in sorted(mismatch))
secOK = ''.join(card(*x) for x in sorted(match))
html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express — ตรวจสี (AI จากรูปจริง)</title><link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{font-family:'Anuphan',sans-serif;background:#eceae4;color:#13244a;padding:22px}}
.wrap{{max-width:1050px;margin:0 auto}}h1{{font-size:23px}}.sub{{color:#6b7280;margin:4px 0 14px}}
h2{{font-size:19px;margin:22px 0 10px;padding-left:11px;border-left:5px solid #f4b223}}
.box{{background:#fffbe9;border:1px solid #f4e2a8;border-radius:10px;padding:12px 15px;font-size:13px;margin-bottom:14px}}
.card{{background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:9px;box-shadow:0 1px 4px rgba(0,0,0,.05);display:flex;gap:14px}}
.l img,.noimg{{width:130px;height:130px;object-fit:cover;border-radius:8px;border:1px solid #ddd}}
.noimg{{display:flex;align-items:center;justify-content:center;background:#faf7f2;color:#bbb}}
.hd{{font-size:14px;margin-bottom:8px}}
.flag{{background:#ffeaea;color:#c0392b;font-size:12px;padding:2px 9px;border-radius:99px;margin-left:6px;font-weight:700}}
.ok{{background:#e3fbec;color:#0a7d43;font-size:12px;padding:2px 9px;border-radius:99px;margin-left:6px;font-weight:700}}
.sws{{display:flex;flex-wrap:wrap;gap:6px}}
.sw{{display:inline-flex;align-items:center;gap:5px;font-size:12px;background:#f5f6f8;border-radius:99px;padding:2px 9px 2px 3px}}
.sw i{{width:15px;height:15px;border-radius:50%;border:1px solid rgba(0,0,0,.15);display:inline-block}}</style></head>
<body><div class="wrap">
<h1>สินค้าส่งด่วน — ตรวจสีจากรูปจริง (แทน placeholder)</h1>
<div class="sub">AI อ่านสีจากรูปซัพหลายสี → เอามาเป็นชื่อสีจริงใน Product Detail (แทน "12 สี")</div>
<div class="box">⚠️ <b>ต้องตัดสินใจ ({len(mismatch)} ตัว):</b> master เคลมจำนวนสีมากกว่าที่เห็นในรูปซัพ (รูปโชว์ไม่ครบทุกสี)<br>
<b>ตัวเลือก:</b> (ก) ใช้สีที่เห็นจริงในรูป (ตรงกับรูปรวมสีที่จะโชว์) · (ข) เก็บจำนวน master ไว้ แต่ลิสต์เท่าที่มีรูป · (ค) คุณส่งลิสต์สีจริงจากซัพ</div>
<h2>🔴 ต้องตัดสินใจ — master เคลมมากกว่ารูป ({len(mismatch)})</h2>
{secM}
<h2>✅ ตรง (±1) — ใช้สีจากรูปได้เลย ({len(match)})</h2>
{secOK}
</div></body></html>'''
OUT = os.path.join(ROOT, '../Demo/EXPRESS-COLOR-REVIEW.html')
open(OUT, 'w', encoding='utf-8').write(html)
print(f'wrote {os.path.relpath(OUT)} — mismatch {len(mismatch)}, match {len(match)}')
