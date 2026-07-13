# -*- coding: utf-8 -*-
"""Stage the AI-picked sources for the regen SKUs into staged-curate/<SKU>/ so
fal-studio --from-curate uses the RIGHT source (best front = hero, multicolor =
lineup). Clears old embedded staging for those SKUs first."""
import json, os, shutil, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
picks = json.load(open(os.path.join(ROOT, '../Demo/_source-picks.json'), encoding='utf-8'))
regen = json.load(open(os.path.join(ROOT, '../Demo/_regen-list.json'), encoding='utf-8'))
CUR = os.path.join(ROOT, 'express-realphoto-2026/staged-curate')
only = [s.upper() for s in sys.argv[1:]] or regen
for sku in only:
    pk = picks.get(sku, [])
    if not pk: print(f'{sku}: NO picks'); continue
    d = os.path.join(CUR, sku)
    if os.path.isdir(d): shutil.rmtree(d)
    os.makedirs(d, exist_ok=True)
    # hero = best front (highest clarity), else first
    front = [c for c in pk if c.get('view') == 'front']
    hero = (front or pk)[0]
    multi = next((c for c in pk if c.get('multicolor')), None)
    def src(c): return os.path.normpath(os.path.join(ROOT, c['path']))
    ext = os.path.splitext(hero['path'])[1] or '.jpg'
    shutil.copy2(src(hero), os.path.join(d, f'01-hero{ext}'))
    if multi and multi is not hero:
        shutil.copy2(src(multi), os.path.join(d, f'02-lineup{os.path.splitext(multi["path"])[1] or ".jpg"}'))
    i = 3
    for c in pk:
        if c is hero or c is multi: continue
        shutil.copy2(src(c), os.path.join(d, f'{i:02d}-src{os.path.splitext(c["path"])[1] or ".jpg"}')); i += 1
    print(f'{sku}: staged hero({hero.get("view")}) + {"lineup " if multi else ""}{len(pk)} picks -> {os.path.relpath(d, ROOT)}')
print('done')
