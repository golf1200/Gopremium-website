# -*- coding: utf-8 -*-
import os, io, json, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPRESS = ['EX001','EX002','EX003','EX004','EX005','EX006','EX008','EX009','EX019','EX025','EX026','EX027','EX029','EX030','EX031','EX032','EX033','EX034','EX035','EX036','EX037','EX038','EX039','EX040','EX041','EX042','EX044','EX045','EX046','EX047','EX048','EX049','EX050','EX051','EX052','EX053','EX054','EX055']
js = io.open(os.path.join(ROOT,'public','catalogue-data.js'), encoding='utf-8', errors='replace').read()

def arr(name):
    i = js.index(name+'=[') + len(name)+1; d = 0
    for j in range(i, len(js)):
        if js[j] == '[': d += 1
        elif js[j] == ']':
            d -= 1
            if d == 0: return json.loads(js[i:j+1])

PR = {p['sku']: p for p in arr('window.GP_PRODUCTS')}

def rel(f): return os.path.relpath(f, ROOT).replace(os.sep, '/')

def imgs(folder):
    if not os.path.isdir(folder): return []
    fs = [f for f in glob.glob(os.path.join(folder,'*')) if f.lower().endswith(('.jpg','.jpeg','.png'))]
    return sorted(fs)

def primary(folder):
    fs = imgs(folder)
    if not fs: return None
    def rank(f):
        n = os.path.basename(f).lower()
        alt = any(k in n for k in ('-2','-back','-side','-lidoff','-lying','-top','-open','-03','-04','_2'))
        return (1 if alt else 0, len(n), n)
    fs.sort(key=rank)
    return rel(fs[0])

man = []
for sku in EXPRESS:
    p = PR.get(sku, {})
    base = os.path.join(ROOT, 'express-assets', sku)
    man.append({
        'sku': sku, 'name': p.get('name',''), 'cat': p.get('cat',''),
        'live_img': ('public'+p.get('img','').split('?')[0]) if p.get('img') else '',
        'raw': primary(os.path.join(base,'real')),
        'raw_all': [rel(f) for f in imgs(os.path.join(base,'real'))],
        'styled_free': primary(os.path.join(base,'styled_free')),
        'styled': primary(os.path.join(base,'styled')),
        'gen': primary(os.path.join(base,'gen')),
    })

out = os.path.join(ROOT,'express-template-mockups','_validate-manifest.json')
io.open(out,'w',encoding='utf-8').write(json.dumps(man, ensure_ascii=False, indent=1))
print('SKUs:', len(man), '| missing raw:', sum(1 for m in man if not m['raw']))
print('have styled_free:', sum(1 for m in man if m['styled_free']))
print('wrote', out)
