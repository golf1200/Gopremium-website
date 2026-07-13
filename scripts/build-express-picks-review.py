# -*- coding: utf-8 -*-
"""Show the AI-picked best-5 source images per SKU (green) vs the rest (dim), for
Golf to approve/adjust before the studio gen re-do. -> Demo/EXPRESS-SOURCE-PICKS.html"""
import json, os, re, base64, io
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
db = {p['sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))}
picks = json.load(open(os.path.join(ROOT, '../Demo/_source-picks.json'), encoding='utf-8'))
FOLDERS = os.path.join(ROOT, 'express-realphoto-2026/drive-raw/_folders')
RAW1688 = os.path.join(ROOT, 'scripts/raw-1688')
def enc(path, box=150):
    try:
        im = Image.open(path).convert('RGB'); im.thumbnail((box, box))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=76)
        return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    except Exception: return None
def drive_imgs(p):
    out = []
    for l in (p.get('img_link_drive') or []):
        d = os.path.join(FOLDERS, l.rstrip('/').split('/')[-1].split('?')[0])
        if os.path.isdir(d):
            for f in sorted(os.listdir(d)):
                if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.jfif')): out.append(os.path.join(d, f))
    d1688 = os.path.join(RAW1688, p['sku'])
    if os.path.isdir(d1688):
        for f in sorted(os.listdir(d1688)):
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.jfif')): out.append(os.path.join(d1688, f))
    return out
cards = []
for sku, chosen in picks.items():
    p = db.get(sku, {})
    chosen_paths = {os.path.normpath(os.path.join(ROOT, c['path'])) for c in chosen}
    cells = ''
    for i, f in enumerate(drive_imgs(p)):
        picked = os.path.normpath(f) in chosen_paths
        cells += f'<figure class="{ "pick" if picked else "no" }"><figcaption>{"✅ เลือก" if picked else "#"+str(i+1)}</figcaption><img src="{enc(f)}"></figure>'
    cards.append(f'<div class="card"><div class="hd"><b>{sku}</b> {p.get("name","")} <span class="meta">{p.get("category","")} · เลือก {len(chosen)}/{len(drive_imgs(p))}</span></div><div class="row">{cells}</div></div>')
html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express — AI คัด 5 รูปที่สุด</title><link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{font-family:'Anuphan',sans-serif;background:#eceae4;color:#13244a;padding:20px}}
.wrap{{max-width:1250px;margin:0 auto}}h1{{font-size:23px}}.sub{{color:#6b7280;margin:4px 0 14px}}
.card{{background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.05)}}
.hd{{font-size:14px;margin-bottom:8px}}.meta{{color:#8a94a6;font-size:12px;margin-left:6px}}
.row{{display:flex;gap:8px;flex-wrap:wrap}}figure figcaption{{font-size:10px;margin-bottom:3px;text-align:center;color:#9aa}}
figure img{{width:130px;height:130px;object-fit:cover;border-radius:7px}}
.pick img{{border:3px solid #0a7d43}}.pick figcaption{{color:#0a7d43;font-weight:700}}
.no img{{border:1px solid #e5e7eb;opacity:.5}}</style></head><body><div class="wrap">
<h1>สินค้าส่งด่วน — AI คัด 5 รูปที่สุดต่อ SKU (จาก Google Drive จริง)</h1>
<div class="sub">🟢 กรอบเขียว = รูปที่ AI เลือกไปใช้ gen · จางๆ = ไม่เลือก · บอกได้ถ้าอยากสลับรูปไหน (เช่น "EX120 เอา #7 แทน") · {len(picks)} SKU</div>
{''.join(cards)}</div></body></html>'''
OUT = os.path.join(ROOT, '../Demo/EXPRESS-SOURCE-PICKS.html')
open(OUT, 'w', encoding='utf-8').write(html)
print(f'wrote {os.path.relpath(OUT)} — {len(picks)} SKUs, {os.path.getsize(OUT)//1024} KB')
