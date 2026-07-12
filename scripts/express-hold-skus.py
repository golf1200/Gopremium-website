# -*- coding: utf-8 -*-
"""
HOLD (temporarily pull) express SKUs from the public website — used when an image
can't be cleaned (e.g. a supplier watermark that won't remove). The SKUs stay in
the backend Google Sheet + Demo/express-master-DB.json so they can be restored the
moment a clean photo exists (re-run express-publish-new.py --skus ...).

Removes them from: products-raw.json, EXPRESS_SKUS (v2.html),
product-images.generated.json, and deletes their /product page + /images dirs.

  python scripts/express-hold-skus.py EX164 EX165 EX167 EX169 EX171
"""
import json, os, re, sys, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
RAW = os.path.join(ROOT, 'src/data/products-raw.json')
GEN = os.path.join(ROOT, 'src/data/product-images.generated.json')
V2 = os.path.join(ROOT, 'public/v2.html')
IMGROOT = os.path.join(ROOT, 'public/images/products')
PAGEROOT = os.path.join(ROOT, 'public/product')

hold = set(s.upper() for s in sys.argv[1:])
if not hold:
    print('pass SKUs to hold'); sys.exit(1)

raw = json.load(open(RAW, encoding='utf-8'))
gen = json.load(open(GEN, encoding='utf-8'))
slugs = {p['sku']: p['slug'] for p in raw if p['sku'] in hold}

raw2 = [p for p in raw if p['sku'] not in hold]
for s in hold:
    gen.pop(s, None)
    sl = slugs.get(s)
    if sl:
        for d in (os.path.join(PAGEROOT, sl), os.path.join(IMGROOT, sl)):
            if os.path.isdir(d): shutil.rmtree(d)

v2 = open(V2, encoding='utf-8').read()
arr = json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\]);', v2).group(1))
arr2 = [s for s in arr if s not in hold]
v2 = re.sub(r'const EXPRESS_SKUS=\[[^\]]*\];',
            'const EXPRESS_SKUS=' + json.dumps(arr2, separators=(',', ':')).replace(' ', '') + ';', v2, count=1)

json.dump(raw2, open(RAW, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(gen, open(GEN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(V2, 'w', encoding='utf-8').write(v2)
print(f'HELD {len(hold)} SKUs: {sorted(hold)}')
print(f'products-raw {len(raw)}->{len(raw2)} · EXPRESS_SKUS {len(arr)}->{len(arr2)}')
print('restore later: python scripts/express-publish-new.py --skus ' + ','.join(sorted(hold)))
