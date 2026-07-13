# -*- coding: utf-8 -*-
"""
COMPLETE per-product BEFORE / AFTER for EVERY live express SKU.
  BEFORE = the product's image before this project (git @ 12980c8). New products
           had none -> show the supplier source photo instead.
  AFTER  = every image live on the site now (hero + multi-colour group + gallery).
-> Demo/EXPRESS-ALL-BEFORE-AFTER.html
"""
import json, os, re, glob, base64, io, subprocess
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
BEFORE_COMMIT = '12980c8'  # last commit before the express project
gen = json.load(open(os.path.join(ROOT, 'src/data/product-images.generated.json'), encoding='utf-8'))
raw = {p['sku']: p for p in json.load(open(os.path.join(ROOT, 'src/data/products-raw.json'), encoding='utf-8'))}
db = {p['sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))}
v2 = open(os.path.join(ROOT, 'public/v2.html'), encoding='utf-8').read()
live = json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\]);', v2).group(1))
old_live = set(json.load(open(os.environ['OLD_LIVE'])))
CUR = os.path.join(ROOT, 'express-realphoto-2026/staged-curate')
IMGROOT = os.path.join(ROOT, 'public/images/products')

def enc(data, is_bytes=True, box=170):
    try:
        im = Image.open(io.BytesIO(data) if is_bytes else data).convert('RGB')
        im.thumbnail((box, box))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=78)
        return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    except Exception:
        return None

def git_before(slug):
    for name in (f'{slug}-square.jpg', f'{slug}-square.png'):
        path = f'public/images/products/{slug}/{name}'
        try:
            out = subprocess.run(['git', 'show', f'{BEFORE_COMMIT}:{path}'],
                                 cwd=ROOT, capture_output=True)
            if out.returncode == 0 and out.stdout:
                return enc(out.stdout)
        except Exception:
            pass
    return None

def source_thumb(sku):
    d = os.path.join(CUR, sku)
    if not os.path.isdir(d): return None
    fs = [f for f in os.listdir(d) if re.search(r'\.(jpg|jpeg|png|webp)$', f, re.I)]
    hero = next((f for f in fs if 'hero' in f.lower()), None) \
        or next((f for f in sorted(fs) if not re.search(r'chart|size|detail|lineup|group', f, re.I)), None) \
        or (sorted(fs)[0] if fs else None)
    if not hero: return None
    return enc(open(os.path.join(d, hero), 'rb').read())

def after_imgs(sku):
    g = gen.get(sku, {})
    cells = []
    for i, rel in enumerate(g.get('gallery', [])):
        fp = os.path.join(ROOT, 'public', rel.split('?')[0].lstrip('/'))
        if os.path.exists(fp):
            lab = 'hero' if i == 0 else ('🎨 กลุ่มสี' if 'group' in rel else str(i + 1))
            cells.append((lab, enc(open(fp, 'rb').read())))
    return cells

cards = []
n_new = n_old = 0
for i, sku in enumerate(live):
    p = raw.get(sku, {}); d = db.get(sku, {})
    slug = gen.get(sku, {}).get('base', p.get('slug', ''))
    is_new = sku not in old_live
    if is_new:
        n_new += 1; before = source_thumb(sku); blab = 'รูปซัพต้นฉบับ (ก่อน)'
    else:
        n_old += 1; before = git_before(slug); blab = 'รูปเก่าบนเว็บ (ก่อน)'
    b_html = f'<img src="{before}">' if before else '<div class="noimg">— ไม่มีรูปเก่า —</div>'
    after = after_imgs(sku)
    a_html = ''.join(f'<figure><figcaption>{lab}</figcaption><img src="{src}"></figure>' for lab, src in after) or '<div class="noimg">—</div>'
    price = p.get('price_300_thb') or d.get('price_display')
    ps = f'฿{price} @300' if price else 'สอบถามราคา'
    badge = 'NEW' if is_new else 'เดิม'
    cards.append(f'''<div class="card">
      <div class="hd"><span class="idx">{i+1}</span> <span class="badge {'bn' if is_new else 'bo'}">{badge}</span>
        <b>{sku}</b> {p.get('name','') or d.get('name','')}
        <span class="meta">{p.get('category','') or d.get('category','')} · {len(d.get('colors',[]))} สี · {ps}</span></div>
      <div class="ba">
        <div class="before"><h4>{blab}</h4><figure>{b_html}</figure></div>
        <div class="arrow">→</div>
        <div class="after"><h4>รูปใหม่บนเว็บตอนนี้ ({len(after)})</h4><div class="arow">{a_html}</div></div>
      </div>
    </div>''')

html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Express ทั้งหมด — ก่อน/หลัง</title>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{font-family:'Anuphan',sans-serif;background:#eceae4;color:#13244a;padding:20px}}
.wrap{{max-width:1200px;margin:0 auto}}h1{{font-size:24px}}.sub{{color:#6b7280;margin:4px 0 14px}}
.bar{{position:sticky;top:0;background:#13244a;color:#fff;padding:10px 16px;border-radius:10px;margin-bottom:14px;z-index:5;font-size:14px}}
.bar b{{color:#f4b223}}
.card{{background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:11px;box-shadow:0 1px 4px rgba(0,0,0,.05)}}
.hd{{font-size:14px;margin-bottom:9px}}.idx{{color:#b8b1a2;font-weight:700}}.meta{{color:#8a94a6;font-size:12px;margin-left:6px}}
.badge{{font-size:11px;font-weight:700;padding:1px 8px;border-radius:99px;color:#fff}}.bn{{background:#0a7d43}}.bo{{background:#41557c}}
.ba{{display:grid;grid-template-columns:190px 24px 1fr;gap:10px;align-items:center}}
h4{{font-size:11px;color:#6b7280;margin-bottom:5px;font-weight:600}}
figure figcaption{{font-size:10px;color:#9aa;margin-bottom:3px;text-align:center}}
.before img{{width:170px;height:170px;object-fit:cover;border-radius:8px;border:2px solid #b9c2d0}}
.arrow{{font-size:24px;color:#b8860b;font-weight:700;text-align:center}}
.arow{{display:flex;gap:8px;flex-wrap:wrap}}.arow figure{{width:150px}}
.arow img{{width:150px;height:150px;object-fit:cover;border-radius:8px;border:2px solid #0a7d43}}
.arow figure:has(figcaption:first-line) img{{}}
.noimg{{width:170px;height:170px;display:flex;align-items:center;justify-content:center;background:#faf7f2;border:1px dashed #ccc;border-radius:8px;color:#bbb;font-size:12px}}</style></head>
<body><div class="wrap">
<h1>สินค้าส่งด่วน — รูปเก่า vs รูปใหม่ (ครบทุกรายการ)</h1>
<div class="sub">ทุก product ที่ live บนเว็บ · ซ้าย = รูปก่อน (สินค้าใหม่=รูปซัพต้นฉบับ / สินค้าเดิม=รูปเก่าบนเว็บ) · ขวา = รูปใหม่ทั้งหมดบนเว็บตอนนี้ (hero + 🎨 กลุ่มสี + แกลเลอรี)</div>
<div class="bar">รวม <b>{len(live)}</b> รายการ · ใหม่พร้อมรูปสตูดิโอ <b>{n_new}</b> · เดิม (อัปเดตข้อมูล+เพิ่มกลุ่มสี) <b>{n_old}</b></div>
{''.join(cards)}
</div></body></html>'''
OUT = os.path.join(ROOT, '../Demo/EXPRESS-ALL-BEFORE-AFTER.html')
open(OUT, 'w', encoding='utf-8').write(html)
print(f'wrote {os.path.relpath(OUT)} — {len(live)} products (new {n_new}, existing {n_old}), {os.path.getsize(OUT)//1024} KB')
