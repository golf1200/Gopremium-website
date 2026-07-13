# -*- coding: utf-8 -*-
"""Deploy the regenerated heroes that PASSED verify (clean+upright+well_scaled).
Replaces <slug>-square.jpg (+ gallery variants) with the fresh clean studio shot,
preserving any existing group shot in the gallery. Skips SKUs whose best variant
is still dirty (reported for follow-up)."""
import json, os, re, shutil, glob
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
GEN = os.path.join(ROOT, 'src/data/product-images.generated.json')
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
IMGROOT = os.path.join(ROOT, 'public/images/products')
picks = json.load(open(os.path.join(ROOT, '../Demo/_regen-hero-picks.json'), encoding='utf-8'))
gen = json.load(open(GEN, encoding='utf-8'))

deployed, held = [], []
for sku, best in picks.items():
    if not best or not (best.get('clean') and best.get('upright') and best.get('well_scaled')):
        held.append((sku, best.get('issue') if best else 'no variant')); continue
    g = gen.get(sku)
    if not g: held.append((sku, 'no gen entry')); continue
    slug = g['base']; d = os.path.join(IMGROOT, slug)
    os.makedirs(d, exist_ok=True)
    # square = best; two more clean-ish variants as -02/-03 (any other gemini files)
    variants = sorted(glob.glob(os.path.join(STUDIO, sku, 'gemini-*.jpg')))
    best_path = os.path.join(STUDIO, sku, best['file'])
    others = [v for v in variants if os.path.basename(v) != best['file']][:2]
    shutil.copy2(best_path, os.path.join(d, f'{slug}-square.jpg'))
    new_gallery = [f'/images/products/{slug}/{slug}-square.jpg']
    # preserve an existing group shot right after hero
    grp = [x for x in g.get('gallery', []) if 'group' in x]
    new_gallery += grp
    for i, v in enumerate(others, 2):
        fn = f'{slug}-{i:02d}.jpg'; shutil.copy2(v, os.path.join(d, fn))
        new_gallery.append(f'/images/products/{slug}/{fn}')
    g['gallery'] = new_gallery
    deployed.append(sku)

json.dump(gen, open(GEN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'DEPLOYED {len(deployed)}: {deployed}')
print(f'HELD (still dirty) {len(held)}: {held}')
