# -*- coding: utf-8 -*-
"""Deploy the Fable-verified identity-fix heroes. picks = {SKU: variantIndex|'none'}.
Replaces <slug>-square.jpg with the chosen correct variant, sets gallery = [new hero
(+ existing group shot if any)], and drops the old wrong-product gallery images.
Skips 'none' (needs re-gen)."""
import json, os, glob, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
GEN = os.path.join(ROOT, 'src/data/product-images.generated.json')
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
IMGROOT = os.path.join(ROOT, 'public/images/products')
picks = json.load(open(os.path.join(ROOT, '../Demo/_regen-picks.json'), encoding='utf-8'))
gen = json.load(open(GEN, encoding='utf-8'))

deployed, skipped = [], []
for sku, best in picks.items():
    if best == 'none':
        skipped.append(sku); continue
    g = gen.get(sku)
    if not g: skipped.append(sku + '(no-gen)'); continue
    var = os.path.join(STUDIO, sku, f'gemini-{best}.jpg')
    if not os.path.exists(var): skipped.append(sku + '(no-variant)'); continue
    slug = g['base']; d = os.path.join(IMGROOT, slug); os.makedirs(d, exist_ok=True)
    # remove old wrong-product gallery files (-02/-03/-04/-05), keep group
    for f in glob.glob(os.path.join(d, f'{slug}-0*.jpg')):
        if 'group' not in f: os.remove(f)
    shutil.copy2(var, os.path.join(d, f'{slug}-square.jpg'))
    grp = [x for x in g.get('gallery', []) if 'group' in x]
    g['gallery'] = [f'/images/products/{slug}/{slug}-square.jpg'] + grp
    deployed.append(sku)

json.dump(gen, open(GEN, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'DEPLOYED {len(deployed)} identity-fixed heroes')
print(f'SKIPPED (re-gen needed) {len(skipped)}: {skipped}')
