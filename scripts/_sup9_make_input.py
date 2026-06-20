# -*- coding: utf-8 -*-
import json, io, glob, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
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
MAP=json.load(io.open('express-assets/EXPRESS-IMAGE-MAP.json',encoding='utf-8'))
skus=[]
for r in MAP:
    if r.get('sup_code')==SUP and r['sku'] in PR:
        skus.append({"sku":r['sku'],"name":r.get('name','')})
dirs=glob.glob(os.path.join('express-assets','_source','_drive',SUP+'*'))
imgs=[]
for d in dirs:
    for f in glob.glob(os.path.join(d,'**','*'),recursive=True):
        if f.lower().endswith(('.jpg','.jpeg','.png','.webp')):
            imgs.append(os.path.abspath(f).replace(os.sep,'/'))
imgs=sorted(imgs)
out={"supplier":SUP,"sup_name":"YW Premium (แก้วสแตนเลส)","skus":skus,"drive_images":imgs}
io.open('express-template-mockups/_sup9_input.json','w',encoding='utf-8').write(json.dumps(out,ensure_ascii=False,indent=1))
print("skus:",len(skus),"| drive_images:",len(imgs))
print("wrote express-template-mockups/_sup9_input.json")
