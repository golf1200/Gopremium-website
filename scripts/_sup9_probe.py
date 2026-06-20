# -*- coding: utf-8 -*-
import json, io, glob, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
MAP=json.load(io.open('express-assets/EXPRESS-IMAGE-MAP.json',encoding='utf-8'))
SUP='SUP-00009'
js=io.open('public/catalogue-data.js',encoding='utf-8',errors='replace').read()
def arr(name):
    i=js.index(name+'=[')+len(name)+1; d=0
    for j in range(i,len(js)):
        if js[j]=='[': d+=1
        elif js[j]==']':
            d-=1
            if d==0: return json.loads(js[i:j+1])
PR={p['sku']:p for p in arr('window.GP_PRODUCTS')}
print("=== Express SKUs under SUP-00009 ===")
for r in MAP:
    if r.get('sup_code')==SUP:
        p=PR.get(r['sku'])
        if not p: continue
        nreal=len(glob.glob('express-assets/%s/real/*'%r['sku']))
        print("%s  %-40s real=%d  cat=%s" % (r['sku'], r.get('name','')[:40], nreal, p.get('cat','')))
print("\n=== Google Drive originals for SUP-00009 ===")
dirs=glob.glob(os.path.join('express-assets','_source','_drive',SUP+'*'))
imgs=[]
for d in dirs:
    for f in glob.glob(os.path.join(d,'**','*'),recursive=True):
        if f.lower().endswith(('.jpg','.jpeg','.png','.webp')): imgs.append(f)
for f in sorted(imgs):
    print("  ", os.path.relpath(f,ROOT).replace(os.sep,'/'))
print("total drive imgs:", len(imgs))
