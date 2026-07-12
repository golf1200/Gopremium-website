# -*- coding: utf-8 -*-
"""
Apply the FINAL Express master (Demo/express-master-DB.json) to the website SSOT
src/data/products-raw.json.

Scope of THIS run (safe, no-image-dependency changes only):
  * UPDATE the 62 existing express SKUs in-place (name/price@300/colors/size/
    material/moq/lead/features/logo) — PRESERVE slug & category_slug (URL/SEO stable).
  * REMOVE the 31 live express SKUs that are not in the master (single source of truth).
  * The 67 NEW SKUs are NOT added here — they need real photos before publish
    (they would otherwise leak into the main /products grid as blank mockups).

Backs up products-raw.json first. Idempotent-ish (re-running re-applies from master).
"""
import json, os, sys, datetime, shutil, re

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '../src/data/products-raw.json')
DB = os.path.join(HERE, '../../Demo/express-master-DB.json')
V2 = os.path.join(HERE, '../public/v2.html')

raw = json.load(open(RAW, encoding='utf-8'))
db = json.load(open(DB, encoding='utf-8'))
db_by_sku = {p['sku']: p for p in db}

# The LIVE express set = what actually renders (EXPRESS_SKUS array in v2.html), 93 SKUs.
v2 = open(V2, encoding='utf-8').read()
live_display = set(json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\])', v2).group(1)))
master_skus = set(db_by_sku)
keep = sorted(live_display & master_skus)     # 62 update
remove = sorted(live_display - master_skus)   # 31 drop (exactly what Golf reviewed)
add = sorted(master_skus - live_display)      # 67 new (NOT added here)
assert len(remove) == 31, f'expected 31 removals, got {len(remove)}'

def tier_of(price):
    if not price: return ''
    if price <= 60: return 'value'
    if price <= 150: return 'smart'
    if price <= 300: return 'premium'
    return 'executive'

# --- backup ---
stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
bak = RAW + f'.bak-express-{stamp}'
shutil.copy2(RAW, bak)

keep_set = set(keep)
remove_set = set(remove)
updated = 0
removed = 0
out = []
for p in raw:
    sku = p.get('sku')
    if sku in keep_set:
        d = db_by_sku[sku]
        price = d.get('price_display')
        p['name'] = d.get('name') or p.get('name')
        p['features'] = d.get('feature') or p.get('features', '')
        p['size'] = d.get('size') or p.get('size', '')
        p['material'] = d.get('material') or p.get('material', '')
        p['price_300_thb'] = price
        p['budget_tier'] = tier_of(price)
        p['moq'] = int(d['cust_moq']) if d.get('cust_moq') else p.get('moq')
        cm = d.get('custom_method')
        p['free_logo'] = [cm] if cm else p.get('free_logo', [])
        p['lead_time'] = d.get('lead_gp') or p.get('lead_time', '')
        p['colors'] = d.get('colors') or p.get('colors', [])
        p['express'] = True
        # keep slug, category, category_slug, occasions, _source_drive, _supplier
        updated += 1
        out.append(p)
    elif sku in remove_set:
        removed += 1
        # dropped
    else:
        out.append(p)

json.dump(out, open(RAW, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

print(f'backup: {os.path.basename(bak)}')
print(f'live display before: {len(live_display)}')
print(f'UPDATED (62 expected): {updated}')
print(f'REMOVED (31 expected): {removed}  -> {remove}')
print(f'NEW held back (67, need photos): {len(add)}')
print(f'raw products: {len(raw)} -> {len(out)}')
