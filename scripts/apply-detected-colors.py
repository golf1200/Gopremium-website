# -*- coding: utf-8 -*-
"""Replace placeholder colour data ("12 สี") with the AI-detected real colour names
(from the supplier photo) in products-raw.json — Golf's decision: use colours
actually visible in the photo. Backs up first."""
import json, os, datetime, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
RAW = os.path.join(ROOT, 'src/data/products-raw.json')
det = json.load(open(os.path.join(ROOT, '../Demo/_detected-colors.json'), encoding='utf-8'))
raw = json.load(open(RAW, encoding='utf-8'))
stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
shutil.copy2(RAW, RAW + f'.bak-colors-{stamp}')
upd = 0
for p in raw:
    d = det.get(p['sku'])
    if d and d.get('colors'):
        p['colors'] = d['colors']; upd += 1
json.dump(raw, open(RAW, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'updated colours on {upd} SKUs -> products-raw.json (backup .bak-colors-{stamp})')
