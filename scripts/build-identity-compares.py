# -*- coding: utf-8 -*-
"""Build side-by-side compare images (SOURCE from Google Drive / 1688  vs  WEBSITE)
for every live express SKU, so a Fable agent can judge product identity from ONE image.
-> Demo/_identity-compare/<SKU>.jpg  (+ _index.json)"""
import json, os, re
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
db = {p['sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))}
gen = json.load(open(os.path.join(ROOT, 'src/data/product-images.generated.json'), encoding='utf-8'))
FOLDERS = os.path.join(ROOT, 'express-realphoto-2026/drive-raw/_folders')
RAW1688 = os.path.join(ROOT, 'scripts/raw-1688')
v2 = open(os.path.join(ROOT, 'public/v2.html'), encoding='utf-8').read()
live = json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\]);', v2).group(1))
OUT = os.path.join(ROOT, '../Demo/_identity-compare'); os.makedirs(OUT, exist_ok=True)
EXT = ('.jpg', '.jpeg', '.png', '.webp', '.jfif')

def sources(sku):
    out = []
    for l in (db[sku].get('img_link_drive') or []):
        d = os.path.join(FOLDERS, l.rstrip('/').split('/')[-1].split('?')[0])
        if os.path.isdir(d):
            for r, _, fs in os.walk(d):
                for f in sorted(fs):
                    if f.lower().endswith(EXT): out.append(os.path.join(r, f))
    d1688 = os.path.join(RAW1688, sku)
    if os.path.isdir(d1688):
        for f in sorted(os.listdir(d1688)):
            if f.lower().endswith(EXT): out.append(os.path.join(d1688, f))
    return out

def load(p, size=460):
    im = Image.open(p).convert('RGB'); im.thumbnail((size, size))
    c = Image.new('RGB', (size, size), '#f0f0f0'); c.paste(im, ((size - im.width) // 2, (size - im.height) // 2))
    return c

try: font = ImageFont.truetype('C:/Windows/Fonts/tahoma.ttf', 22)
except Exception: font = ImageFont.load_default()

index = {}
for sku in live:
    srcs = sources(sku)
    webrel = gen.get(sku, {}).get('gallery', [None])[0]
    webp = os.path.join(ROOT, 'public', webrel.split('?')[0].lstrip('/')) if webrel else None
    if not srcs or not webp or not os.path.exists(webp): continue
    src_src = srcs[0]                       # main supplier photo
    canvas = Image.new('RGB', (960, 520), 'white')
    canvas.paste(load(src_src), (10, 45)); canvas.paste(load(webp), (490, 45))
    d = ImageDraw.Draw(canvas)
    d.text((10, 10), f'{sku}  —  SOURCE (Drive/1688)', fill='#b8860b', font=font)
    d.text((490, 10), 'WEBSITE (ตอนนี้)', fill='#0a7d43', font=font)
    canvas.save(os.path.join(OUT, f'{sku}.jpg'), 'JPEG', quality=85)
    index[sku] = {'name': db[sku].get('name', ''), 'source': os.path.relpath(src_src, ROOT), 'n_sources': len(srcs)}
json.dump(index, open(os.path.join(OUT, '_index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'built {len(index)} compare images -> {os.path.relpath(OUT, ROOT)}')
