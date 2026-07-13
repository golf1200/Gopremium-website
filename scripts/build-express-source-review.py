# -*- coding: utf-8 -*-
"""
SOURCE review for the express restyle re-do: for every express SKU show ALL the
real Google-Drive supplier photos that were pulled (numbered, to pick the best 5),
next to (a) the single embedded-xlsx image that was WRONGLY used as the gen source,
and (b) the current live hero. Lets Golf compare + choose the best 5 sources
BEFORE re-running the studio gen skill.
-> Demo/EXPRESS-SOURCE-REVIEW.html
"""
import json, os, re, base64, io
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
db = {p['sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))}
fin = {p['final_sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-final.json'), encoding='utf-8'))}
gen = json.load(open(os.path.join(ROOT, 'src/data/product-images.generated.json'), encoding='utf-8'))
v2 = open(os.path.join(ROOT, 'public/v2.html'), encoding='utf-8').read()
live = json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\]);', v2).group(1))
EMB = os.path.join(ROOT, '../Demo/_embedded-images')
FOLDERS = os.path.join(ROOT, 'express-realphoto-2026/drive-raw/_folders')
IMGROOT = os.path.join(ROOT, 'public/images/products')
OUT = os.path.join(ROOT, '../Demo/EXPRESS-SOURCE-REVIEW.html')
emb_files = os.listdir(EMB)

def enc(path, box=150):
    try:
        im = Image.open(path).convert('RGB'); im.thumbnail((box, box))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=76)
        return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    except Exception: return None

def drive_imgs(p):
    out = []
    for l in (p.get('img_link_drive') or []):
        fid = l.rstrip('/').split('/')[-1]
        d = os.path.join(FOLDERS, fid)
        if os.path.isdir(d):
            for f in sorted(os.listdir(d)):
                if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.jfif')):
                    out.append(os.path.join(d, f))
    return out

def embedded_used(sku):
    rows = fin.get(sku, {}).get('rows', [])
    for r in rows:
        for f in sorted(emb_files):
            if f.startswith('row%03d_' % r): return os.path.join(EMB, f)
    return None

def cur_hero(sku):
    g = gen.get(sku, {})
    if not g.get('gallery'): return None
    fp = os.path.join(ROOT, 'public', g['gallery'][0].split('?')[0].lstrip('/'))
    return fp if os.path.exists(fp) else None

secA, secB, secC = [], [], []
nA = nB = nC = 0
for sku in db:  # all 129 (incl held) so nothing is hidden
    p = db[sku]
    dimgs = drive_imgs(p)
    emb = embedded_used(sku)
    hero = cur_hero(sku)
    has_link = bool(p.get('img_link_drive'))
    emb_html = f'<figure class="used"><figcaption>❌ ที่ gen ใช้ (ฝัง xlsx)</figcaption><img src="{enc(emb)}"></figure>' if emb else ''
    hero_html = f'<figure class="cur"><figcaption>บนเว็บตอนนี้</figcaption><img src="{enc(hero)}"></figure>' if hero else '<figure class="cur"><figcaption>บนเว็บ</figcaption><div class="noimg">พักไว้</div></figure>'
    head = f'<div class="hd"><b>{sku}</b> {p.get("name","")} <span class="meta">{p.get("category","")} · {len(p.get("colors",[]))} สี</span></div>'
    if dimgs:
        nA += 1
        cells = ''.join(f'<figure class="src"><figcaption>Drive #{i+1}</figcaption><img src="{enc(f)}"></figure>' for i, f in enumerate(dimgs))
        secA.append(f'<div class="card">{head}<div class="row"><div class="grp cmp">{emb_html}{hero_html}</div><div class="grp drv"><span class="lbl">รูป Drive จริง — เลือก 5 ที่สุด ({len(dimgs)})</span>{cells}</div></div></div>')
    elif has_link:
        nB += 1
        secB.append(f'<div class="card mini">{head}<div class="row">{emb_html}{hero_html}<span class="warn">มีลิงก์ Drive แต่ยังดึงไม่ได้ (throttle) — ต้องดึงเพิ่ม</span></div></div>')
    else:
        nC += 1
        secC.append(f'<div class="card mini">{head}<div class="row">{emb_html}{hero_html}<span class="warn">ไม่มี Drive — ต้องใช้ 1688 หรือขอรูปซัพ</span></div></div>')

html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express — เทียบรูปต้นทาง (เลือก 5 ที่สุด)</title>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{font-family:'Anuphan',sans-serif;background:#eceae4;color:#13244a;padding:20px}}
.wrap{{max-width:1250px;margin:0 auto}}h1{{font-size:23px}}.sub{{color:#6b7280;margin:4px 0 12px}}
h2{{font-size:18px;margin:22px 0 10px;padding-left:10px;border-left:5px solid #f4b223}}
.bar{{background:#13244a;color:#fff;padding:10px 16px;border-radius:10px;margin-bottom:14px;font-size:14px}}.bar b{{color:#f4b223}}
.card{{background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:11px;box-shadow:0 1px 4px rgba(0,0,0,.05)}}
.card.mini{{opacity:.96}}
.hd{{font-size:14px;margin-bottom:9px}}.meta{{color:#8a94a6;font-size:12px;margin-left:6px}}
.row{{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}}
.grp{{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start}}
.cmp{{padding-right:14px;border-right:2px dashed #e0ddd5}}
.drv{{position:relative;padding-top:16px}}.lbl{{position:absolute;top:-2px;left:0;font-size:11px;color:#b8860b;font-weight:700}}
figure figcaption{{font-size:10px;color:#9aa;margin-bottom:3px;text-align:center}}
figure img{{width:120px;height:120px;object-fit:cover;border-radius:7px;border:1px solid #e5e7eb}}
.src img{{border:2px solid #b8860b}} .used img{{border:2px solid #d05a5a}} .used figcaption{{color:#d05a5a}} .cur img{{border:2px solid #0a7d43}}
.noimg{{width:120px;height:120px;display:flex;align-items:center;justify-content:center;background:#faf7f2;border:1px dashed #ccc;border-radius:7px;color:#bbb;font-size:11px}}
.warn{{align-self:center;color:#b04a4a;font-size:12px;background:#fff2f2;padding:4px 10px;border-radius:8px}}</style></head>
<body><div class="wrap">
<h1>สินค้าส่งด่วน — เทียบรูปต้นทาง เพื่อเลือก 5 รูปที่สุด ก่อน gen ใหม่</h1>
<div class="sub">🔴 กรอบแดง = รูปที่ระบบ gen ใช้ผิด (รูปฝัง xlsx รูปเดียว) · 🟡 กรอบทอง = รูป Google Drive จริงจาก Master (ที่ควรใช้) · 🟢 เขียว = บนเว็บตอนนี้</div>
<div class="bar">มีรูป Drive ให้เลือก <b>{nA}</b> SKU · มีลิงก์แต่ยังดึงไม่ได้ <b>{nB}</b> · ไม่มี Drive (1688/ขอซัพ) <b>{nC}</b></div>
<h2>1) มีรูป Google Drive จริง — เลือก 5 ที่สุดต่อ SKU ({nA})</h2>
{''.join(secA)}
<h2>2) มีลิงก์ Drive แต่ยังดึงไม่ได้ (throttle) — ต้องดึงเพิ่ม ({nB})</h2>
{''.join(secB)}
<h2>3) ไม่มี Drive — ต้องใช้ 1688 หรือขอรูปซัพ ({nC})</h2>
{''.join(secC)}
</div></body></html>'''
open(OUT, 'w', encoding='utf-8').write(html)
print(f'wrote {os.path.relpath(OUT)} — has-drive {nA}, link-not-pulled {nB}, no-drive {nC}, {os.path.getsize(OUT)//1024} KB')
