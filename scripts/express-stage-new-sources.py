# -*- coding: utf-8 -*-
"""
Stage source photos for the 67 NEW express SKUs (EX112-EX178) into
express-realphoto-2026/staged-curate/<SKU>/ so fal-studio.mjs --from-curate can
restyle them. Sources = the embedded xlsx photos already extracted to
Demo/_embedded-images/ (mapped excel row -> product via express-master-final.json).
"""
import json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '../..')
EMB = os.path.join(ROOT, 'Demo/_embedded-images')
CUR = os.path.join(HERE, '../express-realphoto-2026/staged-curate')
fin = json.load(open(os.path.join(ROOT, 'Demo/express-master-final.json'), encoding='utf-8'))
v = open(os.path.join(HERE, '../public/v2.html'), encoding='utf-8').read()
live = set(json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\]);', v).group(1)))
emb_files = sorted(os.listdir(EMB))

only = set(a.upper() for a in sys.argv[1:])  # optional SKU filter for pilot

def imgs_for_rows(rows):
    got = []
    for r in rows:
        got += sorted(f for f in emb_files if f.startswith('row%03d_' % r))
    return got

new = [p for p in fin if p['final_sku'] not in live]
staged = 0
for p in new:
    sku = p['final_sku']
    if only and sku not in only:
        continue
    src = imgs_for_rows(p.get('rows', []))
    if not src:
        print('NO SOURCE', sku); continue
    d = os.path.join(CUR, sku)
    os.makedirs(d, exist_ok=True)
    for i, f in enumerate(src, 1):
        ext = os.path.splitext(f)[1].lower()
        # neutral names (no chart/size/detail/lineup/group keywords) so hero-picker works
        shutil.copy2(os.path.join(EMB, f), os.path.join(d, f'{sku}-src{i}{ext}'))
    staged += 1
    print(f'staged {sku}: {len(src)} img(s)')
print(f'\nstaged {staged} SKU dirs into {os.path.relpath(CUR, ROOT)}')
