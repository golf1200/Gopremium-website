# -*- coding: utf-8 -*-
"""After identity-regen, build one verify composite per SKU: the correct SOURCE
next to the 4 regenerated variants (labelled v1-v4), so a Fable agent can pick the
best variant that matches identity + is upright + copyright-safe + good quality.
-> Demo/_regen-verify/<SKU>.jpg"""
import json, os, glob
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
skus = json.load(open(os.path.join(ROOT, '../Demo/_regen-list.json'), encoding='utf-8'))
db = {p['sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))}
CUR = os.path.join(ROOT, 'express-realphoto-2026/staged-curate')
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
OUT = os.path.join(ROOT, '../Demo/_regen-verify'); os.makedirs(OUT, exist_ok=True)
try: font = ImageFont.truetype('C:/Windows/Fonts/tahoma.ttf', 20)
except Exception: font = ImageFont.load_default()

def cell(p, size=380):
    im = Image.open(p).convert('RGB'); im.thumbnail((size, size))
    c = Image.new('RGB', (size, size), '#efefef'); c.paste(im, ((size - im.width) // 2, (size - im.height) // 2)); return c

built = 0
for sku in skus:
    src = glob.glob(os.path.join(CUR, sku, '01-hero.*')) or glob.glob(os.path.join(CUR, sku, '*.jpg'))
    vs = sorted(glob.glob(os.path.join(STUDIO, sku, 'gemini-*.jpg')))
    if not src or not vs: continue
    n = 1 + len(vs)
    canvas = Image.new('RGB', (390 * n, 430), 'white')
    d = ImageDraw.Draw(canvas)
    canvas.paste(cell(src[0]), (5, 45)); d.text((5, 12), 'SOURCE (ของจริง)', fill='#b8860b', font=font)
    for i, v in enumerate(vs):
        x = 390 * (i + 1)
        canvas.paste(cell(v), (x + 5, 45)); d.text((x + 5, 12), f'v{i+1}', fill='#0a7d43', font=font)
    canvas.save(os.path.join(OUT, f'{sku}.jpg'), 'JPEG', quality=84); built += 1
print(f'built {built} verify composites -> {os.path.relpath(OUT, ROOT)}')
