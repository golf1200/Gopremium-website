# -*- coding: utf-8 -*-
"""
Self-contained review HTML for the NEW express SKUs: source photo + the restyled
studio variants side by side, per SKU, so Golf can approve before publish.
Images are base64-embedded so the file is portable.

  python scripts/build-express-new-review.py
"""
import json, os, re, glob, base64, mimetypes

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
DB = os.path.join(ROOT, '../Demo/express-master-DB.json')
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
CUR = os.path.join(ROOT, 'express-realphoto-2026/staged-curate')
OUT = os.path.join(ROOT, '../Demo/EXPRESS-NEW-PHOTOS-REVIEW.html')

db = json.load(open(DB, encoding='utf-8'))
v2 = open(os.path.join(ROOT, 'public/v2.html'), encoding='utf-8').read()
live = set(json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\]);', v2).group(1)))
new = [p for p in db if p['sku'] not in live]

def b64(path):
    mt = mimetypes.guess_type(path)[0] or 'image/jpeg'
    return f'data:{mt};base64,' + base64.b64encode(open(path, 'rb').read()).decode()

def source_for(sku):
    d = os.path.join(CUR, sku)
    if not os.path.isdir(d): return None
    files = [f for f in os.listdir(d) if re.search(r'\.(jpg|jpeg|png|webp)$', f, re.I)]
    hero = next((f for f in files if 'hero' in f.lower()), None) \
        or next((f for f in sorted(files) if not re.search(r'chart|size|detail|lineup|group', f, re.I)), None) \
        or (sorted(files)[0] if files else None)
    return os.path.join(d, hero) if hero else None

cards = []
n_done = 0
for p in sorted(new, key=lambda x: x['sku']):
    sku = p['sku']
    variants = sorted(glob.glob(os.path.join(STUDIO, sku, 'gemini-*.jpg')))
    if not variants:
        continue
    n_done += 1
    src = source_for(sku)
    src_html = f'<div class="cell src"><span class="tag">source</span><img src="{b64(src)}"></div>' if src else '<div class="cell src empty">no source</div>'
    var_html = ''.join(
        f'<div class="cell"><span class="tag">v{i+1}</span><img src="{b64(v)}"></div>'
        for i, v in enumerate(variants))
    price = p.get('price_display')
    price_s = f'฿{price} <small>@300</small>' if price else 'สอบถามราคา'
    cards.append(f'''<div class="card">
      <div class="hd"><b>{sku}</b> · {p.get('name','')} <span class="cat">{p['category']}</span> <span class="pr">{price_s}</span></div>
      <div class="row">{src_html}{var_html}</div>
    </div>''')

html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express รูปใหม่ — Review</title>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Segoe UI',Tahoma,sans-serif;background:#f4f1ec;color:#13244a;padding:20px}}
h1{{font-size:22px;margin-bottom:4px}}
.sub{{color:#6b7280;margin-bottom:18px;font-size:14px}}
.card{{background:#fff;border-radius:12px;padding:14px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.06)}}
.hd{{font-size:15px;margin-bottom:10px}}
.cat{{background:#eef1f6;color:#41557c;padding:2px 8px;border-radius:99px;font-size:12px;margin-left:6px}}
.pr{{float:right;color:#b8860b;font-weight:700}}
.pr small,.tag small{{font-weight:400;color:#9aa}}
.row{{display:flex;gap:10px;overflow-x:auto}}
.cell{{position:relative;flex:0 0 auto;width:180px}}
.cell img{{width:180px;height:180px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb}}
.cell.src img{{border:2px solid #b8860b}}
.cell.empty{{width:180px;height:180px;display:flex;align-items:center;justify-content:center;background:#faf7f2;border:1px dashed #ccc;border-radius:8px;color:#aaa}}
.tag{{position:absolute;top:4px;left:4px;background:rgba(19,36,74,.82);color:#fff;font-size:11px;padding:1px 7px;border-radius:99px}}
.cell.src .tag{{background:#b8860b}}
</style></head><body>
<h1>สินค้าส่งด่วน — รูปใหม่ (restyle) รอรีวิว</h1>
<div class="sub">{n_done} SKU · source (กรอบทอง) = รูปซัพต้นฉบับ · v1–v4 = รูปสตูดิโอ GoPremium ที่ AI ทำให้ · ดูว่าลบแบรนด์ซัพ/สีตรง/ตั้งตรง แล้วบอกตัวที่ไม่ผ่าน</div>
{''.join(cards)}
</body></html>'''

open(OUT, 'w', encoding='utf-8').write(html)
print(f'wrote {os.path.relpath(OUT)} — {n_done} SKUs, {os.path.getsize(OUT)//1024} KB')
