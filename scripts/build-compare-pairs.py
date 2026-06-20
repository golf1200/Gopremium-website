# -*- coding: utf-8 -*-
import os, io, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
man = json.load(io.open(os.path.join(ROOT,'express-template-mockups','_validate-manifest.json'), encoding='utf-8'))
BK = os.path.join(ROOT,'express-template-mockups','_backup-live-squares')
pairs=[]; issues=[]
for m in man:
    sku=m['sku']; live=m.get('live_img','')
    if not live: issues.append(sku+'(noLive)'); continue
    base=os.path.basename(live)
    old=os.path.join(BK, base)
    new=os.path.join(ROOT, live.replace('/', os.sep))   # live already starts with 'public/'
    oo=os.path.exists(old); nn=os.path.exists(new)
    pairs.append({'sku':sku,'name':m.get('name',''),
                  'old_catalog': os.path.relpath(old,ROOT).replace(os.sep,'/'),
                  'new_raw': os.path.relpath(new,ROOT).replace(os.sep,'/'),
                  'old_ok':oo,'new_ok':nn})
    if not (oo and nn): issues.append(sku+(' noOld' if not oo else '')+(' noNew' if not nn else ''))
io.open(os.path.join(ROOT,'express-template-mockups','_compare-pairs.json'),'w',encoding='utf-8').write(json.dumps(pairs,ensure_ascii=False,indent=1))
print('pairs:',len(pairs),'| both exist:',sum(1 for p in pairs if p['old_ok'] and p['new_ok']))
print('issues:',issues if issues else 'none')
