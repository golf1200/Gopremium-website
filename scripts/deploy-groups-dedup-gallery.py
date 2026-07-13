# -*- coding: utf-8 -*-
"""(1) Deploy the Fable-passed multi-colour GROUP shots into their product galleries
   (as image #2, after the hero). (2) De-duplicate EVERY live express gallery via a
   perceptual hash so near-identical repeat angles are dropped — leaving hero + group
   (all colours) + only genuinely distinct images.
   python scripts/deploy-groups-dedup-gallery.py  (reads Demo/_group-pass-all.json)"""
import json, os, re, glob, shutil
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
GEN = os.path.join(ROOT, 'src/data/product-images.generated.json')
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
IMGROOT = os.path.join(ROOT, 'public/images/products')
gen = json.load(open(GEN, encoding='utf-8'))
v2 = open(os.path.join(ROOT, 'public/v2.html'), encoding='utf-8').read()
live = set(json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\]);', v2).group(1)))
passing = json.load(open(os.path.join(ROOT, '../Demo/_group-pass-all.json'), encoding='utf-8'))

def ahash(path):
    try:
        im = Image.open(path).convert('L').resize((8, 8)); px = list(im.getdata()); avg = sum(px)/len(px)
        return sum(1 << i for i, v in enumerate(px) if v > avg)
    except Exception: return None
def ham(a, b): return bin(a ^ b).count('1')

# 1) deploy passing groups
added = 0
for sku in passing:
    g = gen.get(sku);
    if not g: continue
    slug = g['base']; src = os.path.join(STUDIO, sku, 'group-1.jpg')
    if not os.path.exists(src): continue
    shutil.copy2(src, os.path.join(IMGROOT, slug, f'{slug}-group.jpg'))
    rel = f'/images/products/{slug}/{slug}-group.jpg'
    if not any('group' in x for x in g['gallery']):
        g['gallery'] = [g['gallery'][0], rel] + g['gallery'][1:]
    added += 1

# 2) dedup every live express gallery (keep hero #0, then group, then hash-distinct)
deduped = 0
for sku in live:
    g = gen.get(sku)
    if not g or not g.get('gallery'): continue
    kept, hashes = [], []
    # always keep hero (index 0) + any group first
    ordered = g['gallery'][:1] + [x for x in g['gallery'][1:] if 'group' in x] + [x for x in g['gallery'][1:] if 'group' not in x]
    for rel in ordered:
        if len(kept) >= 4:  # cap: hero + group + up to 2 distinct angles
            break
        p = os.path.join(ROOT, 'public', rel.split('?')[0].lstrip('/'))
        if not os.path.exists(p): continue
        h = ahash(p)
        if h is not None and any(ham(h, k) <= 12 for k in hashes):
            continue  # near-duplicate (aggressive)
        if h is not None: hashes.append(h)
        kept.append(rel)
    if len(kept) != len(g['gallery']): deduped += 1
    g['gallery'] = kept

json.dump(gen, open(GEN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'deployed {added} group shots · deduped {deduped} galleries')
