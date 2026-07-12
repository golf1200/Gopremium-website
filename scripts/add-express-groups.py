# -*- coding: utf-8 -*-
"""
Add the AI-verified GOOD multi-colour GROUP shots (หลายสีในรูปเดียว) into each
product's gallery as image #2 (right after the hero). Source list = the
goodMulticolorGroups field of Demo/express-verify-report.json (so we only add
shots the AI confirmed are a genuine clean multi-colour family).

  python scripts/add-express-groups.py --dry
  python scripts/add-express-groups.py
"""
import json, os, re, shutil, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
GEN = os.path.join(ROOT, 'src/data/product-images.generated.json')
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
IMGROOT = os.path.join(ROOT, 'public/images/products')
REPORT = os.path.join(ROOT, '../Demo/express-verify-report.json')
DRY = '--dry' in sys.argv

gen = json.load(open(GEN, encoding='utf-8'))
# strict list = multicolor + clean + cream studio + natural colour (computed from report 'all')
STRICT = os.path.join(ROOT, '../Demo/_good_groups_strict.json')
good = json.load(open(STRICT, encoding='utf-8')) if os.path.exists(STRICT) \
    else json.load(open(REPORT, encoding='utf-8'))['goodMulticolorGroups']

added, skipped = [], []
for sku in good:
    g = gen.get(sku)
    if not g:
        skipped.append((sku, 'no gen entry')); continue
    slug = g['base']
    grp = sorted(glob.glob(os.path.join(STUDIO, sku, 'group-*.jpg')))
    if not grp:
        skipped.append((sku, 'no group file')); continue
    rel = f'/images/products/{slug}/{slug}-group.jpg'
    if any('group' in x for x in g['gallery']):
        skipped.append((sku, 'already has group')); continue
    if not DRY:
        shutil.copy2(grp[0], os.path.join(IMGROOT, slug, f'{slug}-group.jpg'))
    # insert after hero (index 0)
    g['gallery'] = [g['gallery'][0], rel] + g['gallery'][1:]
    added.append(sku)

print(f'ADD group shot: {len(added)} SKUs | skipped {len(skipped)}')
print('added:', ','.join(added))
if skipped: print('skipped:', skipped[:12])
if DRY:
    print('\n--dry: nothing written'); sys.exit(0)
json.dump(gen, open(GEN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('\nwrote product-images.generated.json — run: node scripts/build-catalogue-data.mjs && npm run build')
