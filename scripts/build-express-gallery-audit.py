# -*- coding: utf-8 -*-
"""
Full gallery AUDIT for every LIVE express SKU (129):
  ก่อน (BEFORE)      = image that was / is on the website (existing = current web square;
                       new = supplier source photo)
  หลัง (DEPLOYED)    = images currently live on the site (deployed gallery)
  ➕ เลือกเพิ่มได้     = generated images NOT yet on the web — the multi-colour GROUP shot
                       (หลายสีในรูปเดียว) + any unused single variants, so Golf can pick
                       which to ADD to each product gallery.

Self-contained HTML (PIL thumbnails, base64) -> Demo/EXPRESS-GALLERY-AUDIT.html
"""
import json, os, re, glob, base64, io
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
DB = os.path.join(ROOT, '../Demo/express-master-DB.json')
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
CUR = os.path.join(ROOT, 'express-realphoto-2026/staged-curate')
IMGROOT = os.path.join(ROOT, 'public/images/products')
OUT = os.path.join(ROOT, '../Demo/EXPRESS-GALLERY-AUDIT.html')

db = {p['sku']: p for p in json.load(open(DB, encoding='utf-8'))}
gen = json.load(open(os.path.join(ROOT, 'src/data/product-images.generated.json'), encoding='utf-8'))
v2 = open(os.path.join(ROOT, 'public/v2.html'), encoding='utf-8').read()
live = json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\]);', v2).group(1))
old_live = set(json.load(open(os.environ['OLD_LIVE'], encoding='utf-8')))  # 93 before → tells new vs existing

def thumb(path, box=190):
    try:
        im = Image.open(path).convert('RGB'); im.thumbnail((box, box))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=78)
        return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    except Exception:
        return None

def source_for(sku):
    d = os.path.join(CUR, sku)
    if not os.path.isdir(d): return None
    fs = [f for f in os.listdir(d) if re.search(r'\.(jpg|jpeg|png|webp)$', f, re.I)]
    hero = next((f for f in fs if 'hero' in f.lower()), None) \
        or next((f for f in sorted(fs) if not re.search(r'chart|size|detail|lineup|group', f, re.I)), None) \
        or (sorted(fs)[0] if fs else None)
    return os.path.join(d, hero) if hero else None

def cell(src, label, cls=''):
    t = thumb(src) if src and os.path.exists(src) else None
    inner = f'<img src="{t}">' if t else '<div class="noimg">—</div>'
    return f'<figure class="{cls}"><figcaption>{label}</figcaption>{inner}</figure>'

def build_card(sku):
    p = db.get(sku, {})
    is_new = sku not in old_live
    slug = gen.get(sku, {}).get('base', '')
    deployed = gen.get(sku, {}).get('gallery', [])
    # BEFORE
    if is_new:
        before = cell(source_for(sku), 'รูปซัพต้นฉบับ', 'before')
        before_lbl = 'สินค้าใหม่'
    else:
        sq = os.path.join(IMGROOT, slug, f'{slug}-square.jpg')
        before = cell(sq, 'เว็บเดิม (hero)', 'before')
        before_lbl = 'สินค้าเดิม'
    # DEPLOYED (live gallery)
    dep_cells = ''
    for i, g in enumerate(deployed):
        fp = os.path.join(ROOT, 'public', g.split('?')[0].lstrip('/'))
        dep_cells += cell(fp, 'hero' if i == 0 else f'{i+1}', 'live')
    if not dep_cells:
        dep_cells = '<div class="empty">ยังไม่ขึ้นเว็บ</div>'
    # AVAILABLE TO ADD = studio-ab files not represented in deployed
    avail = ''
    group = sorted(glob.glob(os.path.join(STUDIO, sku, 'group-*.jpg')))
    variants = sorted(glob.glob(os.path.join(STUDIO, sku, 'gemini-*.jpg')))
    for g in group:
        avail += cell(g, '🎨 หลายสีในรูปเดียว', 'add group')
    # for existing SKUs, single variants are also un-deployed (their web uses old pipeline img)
    if not is_new:
        for i, v in enumerate(variants):
            avail += cell(v, f'variant {i+1}', 'add')
    else:
        # new SKUs: gemini-1..4 already deployed; only show extras beyond 4 (none) -> group only
        pass
    if not avail:
        avail = '<div class="empty">ไม่มีรูปเพิ่ม</div>'
    price = p.get('price_display')
    ps = f'฿{price} @300' if price else 'สอบถามราคา'
    ncol = len(p.get('colors', []))
    badge = 'NEW' if is_new else 'เดิม'
    bcls = 'bnew' if is_new else 'bold'
    return f'''<div class="card">
      <div class="hd"><span class="badge {bcls}">{badge}</span> <b>{sku}</b> {p.get('name','')}
        <span class="meta">{p.get('category','')} · {ncol} สี · {ps}</span></div>
      <div class="cols">
        <div class="col"><h4>ก่อน</h4><div class="row">{before}</div></div>
        <div class="col"><h4>หลัง (ขึ้นเว็บล่าสุด)</h4><div class="row">{dep_cells}</div></div>
        <div class="col addcol"><h4>➕ เลือกเพิ่มได้</h4><div class="row">{avail}</div></div>
      </div>
    </div>'''

new_skus = [s for s in live if s not in old_live]
exist_skus = [s for s in live if s in old_live]
# existing shown only if they have something to add (group/variant)
exist_with_add = [s for s in exist_skus if glob.glob(os.path.join(STUDIO, s, 'group-*.jpg')) or glob.glob(os.path.join(STUDIO, s, 'gemini-*.jpg'))]

secA = ''.join(build_card(s) for s in new_skus)
secB = ''.join(build_card(s) for s in exist_with_add)

html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express — Gallery Audit (ก่อน/หลัง/เลือกเพิ่ม)</title>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Anuphan',sans-serif;background:#eceae4;color:#13244a;padding:22px}}
.wrap{{max-width:1280px;margin:0 auto}}
h1{{font-size:24px}} .sub{{color:#6b7280;margin:4px 0 16px}}
h2{{font-size:19px;margin:26px 0 12px;border-left:5px solid #f4b223;padding-left:10px}}
.legend{{background:#fffbe9;border:1px solid #f4e2a8;border-radius:10px;padding:10px 14px;font-size:13px;margin-bottom:16px}}
.card{{background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.05)}}
.hd{{font-size:14px;margin-bottom:10px}} .hd .meta{{color:#8a94a6;font-size:12px;margin-left:6px}}
.badge{{font-size:11px;font-weight:700;padding:1px 8px;border-radius:99px;color:#fff}}
.badge.bnew{{background:#0a7d43}} .badge.bold{{background:#41557c}}
.cols{{display:grid;grid-template-columns:1fr 2fr 2fr;gap:12px}}
.col h4{{font-size:12px;color:#6b7280;margin-bottom:6px;font-weight:600}}
.addcol{{background:#fbf7ee;border-radius:8px;padding:6px;margin:-6px}}
.addcol h4{{color:#b8860b}}
.row{{display:flex;gap:8px;flex-wrap:wrap}}
figure{{text-align:center}} figcaption{{font-size:10px;color:#9aa;margin-bottom:3px}}
figure img{{width:120px;height:120px;object-fit:cover;border-radius:7px;border:1px solid #e5e7eb}}
figure.before img{{border:2px solid #b9c2d0}}
figure.live img{{border:2px solid #0a7d43}}
figure.add img{{border:2px solid #f4b223}}
figure.group figcaption{{color:#b8860b;font-weight:700}}
figure.group img{{border:3px solid #f4b223}}
.noimg,.empty{{width:120px;height:120px;display:flex;align-items:center;justify-content:center;background:#faf7f2;border:1px dashed #ccc;border-radius:7px;color:#bbb;font-size:12px;padding:4px;text-align:center}}
.empty{{width:auto;min-width:120px}}
</style></head><body><div class="wrap">
<h1>สินค้าส่งด่วน — Gallery Audit (ก่อน / หลัง / เลือกเพิ่ม)</h1>
<div class="sub">ตรวจทุกรูปที่ generate — เลือกว่าตัวไหนอยากเพิ่มเข้าแกลเลอรีสินค้า (โดยเฉพาะรูปรวมหลายสี)</div>
<div class="legend">
🔵 <b>ก่อน</b> = รูปบนเว็บเดิม (สินค้าใหม่ = รูปซัพต้นฉบับ) · 🟢 <b>หลัง</b> = รูปที่ขึ้นเว็บล่าสุดแล้ว ·
🟡 <b>➕ เลือกเพิ่มได้</b> = รูปที่ generate ไว้แต่ยังไม่ขึ้นเว็บ — <b>🎨 = รูปรวมหลายสีในเฟรมเดียว</b> (มีเฉพาะสินค้าที่ซัพส่งรูปหลายสีมา)<br>
บอกผมได้เลยว่าอยากเพิ่มรูปไหนของ SKU ไหน (เช่น "เพิ่ม group ทุกตัวที่มี" หรือระบุราย SKU) แล้วผมจะเพิ่มเข้าแกลเลอรี + deploy ให้
</div>

<h2>1) สินค้าใหม่ {len(new_skus)} รายการ (ขึ้นเว็บแล้ว) — มี 🎨 group ให้เลือกเพิ่มบางตัว</h2>
{secA}

<h2>2) สินค้าเดิม {len(exist_with_add)} รายการ — มีรูป generate ใหม่ (🎨 หลายสี / variant) รอเลือกเพิ่ม</h2>
{secB}
</div></body></html>'''

open(OUT, 'w', encoding='utf-8').write(html)
n_group = len(glob.glob(os.path.join(STUDIO, '*', 'group-*.jpg')))
print(f'wrote {os.path.relpath(OUT)} — new {len(new_skus)}, existing-with-adds {len(exist_with_add)}, group shots {n_group}, {os.path.getsize(OUT)//1024} KB')
