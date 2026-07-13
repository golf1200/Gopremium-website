# -*- coding: utf-8 -*-
"""COMPLETE per-product comparison: EVERY Google-Drive/1688 source image vs EVERY
website image, for all express SKUs. Split into category files to keep each HTML
openable. -> Demo/compare/EXPRESS-COMPARE-<cat>.html + index."""
import json, os, re, base64, io
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
db = {p['sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))}
gen = json.load(open(os.path.join(ROOT, 'src/data/product-images.generated.json'), encoding='utf-8'))
FOLDERS = os.path.join(ROOT, 'express-realphoto-2026/drive-raw/_folders')
RAW1688 = os.path.join(ROOT, 'scripts/raw-1688')
v2 = open(os.path.join(ROOT, 'public/v2.html'), encoding='utf-8').read()
live = set(json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\]);', v2).group(1)))
OUT = os.path.join(ROOT, '../Demo/compare'); os.makedirs(OUT, exist_ok=True)
EXT = ('.jpg', '.jpeg', '.png', '.webp', '.jfif')

def thumb(path, box=150):
    try:
        im = Image.open(path).convert('RGB'); im.thumbnail((box, box))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=70)
        return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    except Exception:
        return None

def drive_srcs(sku):
    out = []
    for l in (db[sku].get('img_link_drive') or []):
        d = os.path.join(FOLDERS, l.rstrip('/').split('/')[-1].split('?')[0])
        if os.path.isdir(d):
            for r, _, fs in os.walk(d):
                for f in sorted(fs):
                    if f.lower().endswith(EXT): out.append(os.path.join(r, f))
    return out

def s1688(sku):
    d = os.path.join(RAW1688, sku)
    return [os.path.join(d, f) for f in sorted(os.listdir(d))] if os.path.isdir(d) else []

def web_imgs(sku):
    g = gen.get(sku, {}); out = []
    for rel in g.get('gallery', []):
        p = os.path.join(ROOT, 'public', rel.split('?')[0].lstrip('/'))
        if os.path.exists(p): out.append(p)
    return out

STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
import glob as _glob

def ahash(path):
    """8x8 average perceptual hash for near-duplicate detection."""
    try:
        im = Image.open(path).convert('L').resize((8, 8))
        px = list(im.getdata()); avg = sum(px) / len(px)
        return sum(1 << i for i, v in enumerate(px) if v > avg)
    except Exception:
        return None

def hamming(a, b):
    return bin(a ^ b).count('1')

def final_imgs(sku):
    """Curated finalized AI set: deployed gallery first (hero + group), then any
    studio-ab variant that is VISUALLY DISTINCT (perceptual-hash dedupe) — so near-
    identical variants and repeats are dropped. group shots (all-colour family) kept."""
    cands = []
    for rel in gen.get(sku, {}).get('gallery', []):
        p = os.path.join(ROOT, 'public', rel.split('?')[0].lstrip('/'))
        if os.path.exists(p): cands.append(('web', p))
    d = os.path.join(STUDIO, sku)
    if os.path.isdir(d):
        for f in sorted(_glob.glob(os.path.join(d, 'group-*.jpg'))):
            cands.append(('group', f))
        for f in sorted(_glob.glob(os.path.join(d, 'gemini-*.jpg'))):
            cands.append(('var', f))
    kept, hashes = [], []
    for tag, p in cands:
        h = ahash(p)
        if h is None: continue
        if any(hamming(h, k) <= 6 for k in hashes):  # near-duplicate -> skip
            continue
        hashes.append(h); kept.append((tag, p))
    return kept

# group SKUs by category
cats = {}
for sku, p in db.items():
    cats.setdefault(p.get('category', 'Other'), []).append(sku)

CSS = """*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Anuphan','Segoe UI',sans-serif;background:#eceae4;color:#13244a;padding:18px}
.wrap{max-width:1300px;margin:0 auto}h1{font-size:22px;margin-bottom:4px}.sub{color:#6b7280;margin-bottom:14px;font-size:14px}
.card{background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.05)}
.hd{font-size:15px;margin-bottom:8px}.hd .st{font-size:12px;padding:1px 8px;border-radius:99px;margin-left:6px}
.st.live{background:#e3fbec;color:#0a7d43}.st.held{background:#ffeaea;color:#c0392b}
.two{display:grid;grid-template-columns:0.9fr 1.4fr 0.9fr;gap:12px}
.col h4{font-size:12px;margin-bottom:6px;font-weight:600}.col.c h4{color:#41557c}.col.d h4{color:#b8860b}.col.w h4{color:#0a7d43}
.col.d{background:#fbf7ee;border-radius:8px;padding:6px}
.row{display:flex;gap:6px;flex-wrap:wrap}
.row img{width:110px;height:110px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb}
.col.c .row img{border:2px solid #41557c}
.col.w .row img{border:2px solid #0a7d43}
.col.w .row img.grp{border:3px solid #f4b223;width:150px;height:150px}
.none{color:#bbb;font-size:12px;padding:14px}
.nav{position:sticky;top:0;background:#13244a;padding:8px 12px;border-radius:8px;margin-bottom:12px}
.nav a{color:#f4b223;margin-right:12px;text-decoration:none;font-size:13px}</style>"""

navlinks = ''.join(f'<a href="EXPRESS-COMPARE-{c}.html">{c}({len(v)})</a>' for c, v in sorted(cats.items()))
for cat, skus in sorted(cats.items()):
    cards = ''
    for sku in sorted(skus):
        p = db[sku]
        d = drive_srcs(sku); e = s1688(sku); w = web_imgs(sku); f = final_imgs(sku)
        st = 'live' if sku in live else 'held'
        srcs = d + e
        dhtml = ''.join(f'<img src="{t}">' for t in (thumb(x) for x in srcs) if t) or '<div class="none">— ไม่มีรูป Drive/1688 —</div>'
        whtml = ''.join(f'<img src="{t}">' for t in (thumb(x) for x in w) if t) or '<div class="none">— พักออกเว็บ (รอรูปซัพ) —</div>'
        fparts = []
        for tag, x in f:
            t = thumb(x)
            if not t: continue
            cls = ' class="grp"' if tag == 'group' else ''
            fparts.append(f'<img{cls} src="{t}">')
        fhtml = ''.join(fparts) or '<div class="none">— ยังไม่มีรูป AI —</div>'
        cards += f'''<div class="card"><div class="hd"><b>{sku}</b> {p.get("name","")} <span class="st {st}">{'บนเว็บ' if st=='live' else 'พักไว้'}</span></div>
          <div class="two"><div class="col c"><h4>1. เว็บปัจจุบัน ({len(w)})</h4><div class="row">{whtml}</div></div>
          <div class="col d"><h4>2. Google Drive / 1688 — ของจริง ({len(srcs)})</h4><div class="row">{dhtml}</div></div>
          <div class="col w"><h4>3. AI Finalized — ทุก variant ({len(f)})</h4><div class="row">{fhtml}</div></div></div></div>'''
    html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express เทียบรูป — {cat}</title><link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700&display=swap" rel="stylesheet"><style>{CSS}</head>
<body><div class="wrap"><h1>สินค้าส่งด่วน — เทียบรูป Drive/1688 vs เว็บ · หมวด {cat}</h1>
<div class="sub">ทุก product: ซ้าย = รูปต้นฉบับซัพทั้งหมด · ขวา = รูปที่ขึ้นเว็บทั้งหมด</div>
<div class="nav">หมวด: {navlinks}</div>{cards}</div></body></html>'''
    open(os.path.join(OUT, f'EXPRESS-COMPARE-{cat}.html'), 'w', encoding='utf-8').write(html)
    print(f'{cat}: {len(skus)} SKUs -> EXPRESS-COMPARE-{cat}.html ({os.path.getsize(os.path.join(OUT,f"EXPRESS-COMPARE-{cat}.html"))//1024} KB)')

# index
idx = f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><title>Express เทียบรูป — Index</title><style>{CSS}</head>
<body><div class="wrap"><h1>สินค้าส่งด่วน — เทียบรูป Drive/1688 vs เว็บ (ทุก product)</h1>
<div class="sub">เลือกหมวดเพื่อดูการเทียบรูปแบบละเอียดทีละตัว</div><div class="nav">{navlinks}</div></div></body></html>'''
open(os.path.join(OUT, 'INDEX.html'), 'w', encoding='utf-8').write(idx)
print('index -> Demo/compare/INDEX.html')
