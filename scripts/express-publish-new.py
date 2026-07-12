# -*- coding: utf-8 -*-
"""
Publish the NEW express SKUs (restyled studio images ready) to the website:
  1. copy restyled variants studio-ab/<SKU>/gemini-N.jpg
     -> public/images/products/<slug>/<slug>-square.jpg (+ -02/-03/-04)
  2. register them in src/data/product-images.generated.json
  3. insert the products into src/data/products-raw.json (express:true, @300 price,
     colours/size/material/lead/moq/logo) with a stable slug
  4. add the SKUs to EXPRESS_SKUS in public/v2.html

Then run: node scripts/build-catalogue-data.mjs && npm run build

Usage:
  python scripts/express-publish-new.py --dry              # report only
  python scripts/express-publish-new.py --skus EX116,EX117 # publish a subset
  python scripts/express-publish-new.py                    # publish every new SKU
                                                           # that has restyled output
"""
import json, os, re, shutil, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
RAW = os.path.join(ROOT, 'src/data/products-raw.json')
GEN = os.path.join(ROOT, 'src/data/product-images.generated.json')
V2 = os.path.join(ROOT, 'public/v2.html')
DB = os.path.join(ROOT, '../Demo/express-master-DB.json')
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
IMGROOT = os.path.join(ROOT, 'public/images/products')

DRY = '--dry' in sys.argv
only = None
if '--skus' in sys.argv:
    only = set(s.strip().upper() for s in sys.argv[sys.argv.index('--skus') + 1].split(','))

CATSLUG = {'Drinkware': 'drinkware', 'Garment': 'garment', 'Powerbank': 'powerbank',
           'Fan': 'fan', 'Lifestyle': 'lifestyle', 'Souvenir': 'souvenir',
           'Stationery': 'stationery', 'Bag': 'bags', 'Umbrella': 'umbrella', 'Hat': 'hat'}

def tier_of(p):
    if not p: return ''
    if p <= 60: return 'value'
    if p <= 150: return 'smart'
    if p <= 300: return 'premium'
    return 'executive'

db = json.load(open(DB, encoding='utf-8'))
db_by_sku = {p['sku']: p for p in db}
raw = json.load(open(RAW, encoding='utf-8'))
raw_skus = {p['sku'] for p in raw}
gen = json.load(open(GEN, encoding='utf-8'))
v2 = open(V2, encoding='utf-8').read()
live = json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\]);', v2).group(1))
live_set = set(live)

new = [p for p in db if p['sku'] not in live_set]

published, skipped, added_raw = [], [], []
for p in new:
    sku = p['sku']
    if only and sku not in only:
        continue
    outdir = os.path.join(STUDIO, sku)
    variants = sorted(glob.glob(os.path.join(outdir, 'gemini-*.jpg')))
    if not variants:
        skipped.append((sku, 'no restyled output'))
        continue
    catslug = CATSLUG.get(p['category'], p['category'].lower())
    slug = f'{sku.lower()}-{catslug}'
    dstdir = os.path.join(IMGROOT, slug)
    gallery = []
    names = ['square', '02', '03', '04', '05']
    for i, v in enumerate(variants[:5]):
        nm = names[i]
        fn = f'{slug}-{nm}.jpg'
        if not DRY:
            os.makedirs(dstdir, exist_ok=True)
            shutil.copy2(v, os.path.join(dstdir, fn))
        gallery.append(f'/images/products/{slug}/{fn}')
    gen[sku] = {'base': slug, 'gallery': gallery}

    if sku not in raw_skus:
        price = p.get('price_display')
        cm = p.get('custom_method')
        raw.append({
            'sku': sku, 'slug': slug, 'name': p.get('name', ''),
            'category': p['category'], 'category_slug': catslug,
            'features': p.get('feature', ''), 'size': p.get('size', ''),
            'material': p.get('material', ''), 'price_300_thb': price,
            'budget_tier': tier_of(price),
            'moq': int(p['cust_moq']) if p.get('cust_moq') else 50,
            'free_logo': [cm] if cm else [], 'logo_max_cm': '',
            'occasions': [], 'express': True,
            'lead_time': p.get('lead_gp', ''), 'colors': p.get('colors', []),
        })
        added_raw.append(sku)
    published.append((sku, slug, len(gallery)))

new_live = live + [s for s, _, _ in published if s not in live_set]

print(f'PUBLISH {len(published)} SKUs | add-to-raw {len(added_raw)} | skipped {len(skipped)}')
for s, sl, n in published[:8]:
    print(f'  {s} -> {sl} ({n} imgs)')
if skipped:
    print('SKIPPED:', skipped[:10])
print(f'EXPRESS_SKUS {len(live)} -> {len(new_live)}')

if DRY:
    print('\n--dry: no files written')
    sys.exit(0)

json.dump(raw, open(RAW, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(gen, open(GEN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
arr = 'const EXPRESS_SKUS=' + json.dumps(new_live, separators=(',', ':')).replace(' ', '') + ';'
v2 = re.sub(r'const EXPRESS_SKUS=\[[^\]]*\];', arr, v2, count=1)
open(V2, 'w', encoding='utf-8').write(v2)
print('\nwrote products-raw.json, product-images.generated.json, v2.html')
print('next: node scripts/build-catalogue-data.mjs && npm run build')
