# -*- coding: utf-8 -*-
"""Build per-supplier agent input JSON for every supplier that has BOTH express SKUs
and locally-downloaded Google-Drive images. Prints a breakdown."""
import json, io, glob, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
OUTDIR='express-template-mockups'
EXPRESS=['EX001','EX002','EX003','EX004','EX005','EX006','EX008','EX009','EX019','EX025','EX026','EX027','EX029','EX030','EX031','EX032','EX033','EX034','EX035','EX036','EX037','EX038','EX039','EX040','EX041','EX042','EX044','EX045','EX046','EX047','EX048','EX049','EX050','EX051','EX052','EX053','EX054','EX055']
js=io.open('public/catalogue-data.js',encoding='utf-8',errors='replace').read()
def arr(name):
    i=js.index(name+'=[')+len(name)+1; d=0
    for j in range(i,len(js)):
        if js[j]=='[': d+=1
        elif js[j]==']':
            d-=1
            if d==0: return json.loads(js[i:j+1])
PR={p['sku']:p for p in arr('window.GP_PRODUCTS')}
MAP=json.load(io.open('express-assets/EXPRESS-IMAGE-MAP.json',encoding='utf-8'))

# group express SKUs by supplier
bysup={}
for r in MAP:
    if r['sku'] in EXPRESS and r['sku'] in PR:
        bysup.setdefault(r.get('sup_code',''),{'name':r.get('sup_name',''),'skus':[]})
        bysup[r['sup_code']]['skus'].append({'sku':r['sku'],'name':PR[r['sku']].get('name','')})

def drive_imgs(sup):
    dirs=glob.glob(os.path.join('express-assets','_source','_drive',sup+'*'))
    fs=[]
    for d in dirs:
        for f in glob.glob(os.path.join(d,'**','*'),recursive=True):
            if f.lower().endswith(('.jpg','.jpeg','.png','.webp')): fs.append(os.path.abspath(f).replace(os.sep,'/'))
    return sorted(fs)

print("%-10s %-34s %4s %5s %s"%("SUP","name","SKUs","imgs","status"))
ready=[]
for sup in sorted(bysup):
    info=bysup[sup]; imgs=drive_imgs(sup)
    status="READY" if imgs else "NO-DRIVE"
    print("%-10s %-34s %4d %5d %s"%(sup, info['name'][:34], len(info['skus']), len(imgs), status))
    if imgs and sup!='SUP-00009':   # SUP-00009 already done
        out={'supplier':sup,'sup_name':info['name'],'skus':info['skus'],'drive_images':imgs}
        io.open(os.path.join(OUTDIR,f'_sup-input-{sup}.json'),'w',encoding='utf-8').write(json.dumps(out,ensure_ascii=False,indent=1))
        ready.append(sup)
print("\nwrote inputs for:", ready)
