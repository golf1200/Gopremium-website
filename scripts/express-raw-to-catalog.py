# -*- coding: utf-8 -*-
"""
Replace the express catalog square images with the AUTHENTIC raw supplier photos
(validated as more natural than the AI versions). FREE — PIL only, no API.
- chosen raw per SKU = primary in express-assets/<SKU>/real (+ hand overrides)
- output = 1000x1000 JPG, white background, optimised < 170 KB
- white-bg raws are letterbox-padded on white; coloured-bg raws are centre-cropped
- ORIGINAL live squares are backed up first (reversible)
Run from website/ root.  After this: bump IMG_VER + node scripts/build-catalogue-data.mjs
"""
import os, io, json, glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAN  = os.path.join(ROOT, "express-template-mockups", "_validate-manifest.json")
BK   = os.path.join(ROOT, "express-template-mockups", "_backup-live-squares")
os.makedirs(BK, exist_ok=True)

PRIMARY_OVERRIDE = {
    "EX008": "express-assets/EX008/real/EX008-trucker-front.jpg",
    "EX035": "express-assets/EX035/real/EX035-curved-mug2.jpg",
    "EX032": "express-assets/EX032/real/EX032-coffee-tumbler-white.webp",
}
EXTS = (".jpg",".jpeg",".png",".webp")
SIZE = 1000
PAD  = 0.06   # margin when padding on white

def primary_real(sku):
    if sku in PRIMARY_OVERRIDE:
        p = os.path.join(ROOT, PRIMARY_OVERRIDE[sku])
        if os.path.exists(p): return p
    folder = os.path.join(ROOT, "express-assets", sku, "real")
    fs = [f for f in glob.glob(os.path.join(folder,"*")) if f.lower().endswith(EXTS)]
    if not fs: return None
    def rank(f):
        n=os.path.basename(f).lower()
        alt=any(k in n for k in("-2","-back","-side","-lidoff","-lying","-top","-open","-03","-04","_2"))
        return (1 if alt else 0, len(n), n)
    fs.sort(key=rank); return fs[0]

def near_white(im):
    """sample 4 corners of an RGB image -> True if background looks white."""
    w,h=im.size; s=12
    pts=[(0,0),(w-s,0),(0,h-s),(w-s,h-s)]
    vals=[]
    for x,y in pts:
        c=im.crop((x,y,x+s,y+s)).resize((1,1)).getpixel((0,0))
        vals.append(sum(c[:3])/3)
    return min(vals) >= 232

def to_square(path):
    im = Image.open(path)
    alpha = im.mode in ("RGBA","LA") or (im.mode=="P" and "transparency" in im.info)
    if alpha:
        rgba=im.convert("RGBA"); bg=Image.new("RGBA",rgba.size,(255,255,255,255))
        bg.alpha_composite(rgba); im=bg.convert("RGB"); white=True
    else:
        im=im.convert("RGB"); white=near_white(im)
    if white:
        # contain on white square with margin (keeps full product, authentic look)
        inner=int(SIZE*(1-2*PAD))
        c=im.copy(); c.thumbnail((inner,inner), Image.LANCZOS)
        canvas=Image.new("RGB",(SIZE,SIZE),(255,255,255))
        canvas.paste(c, ((SIZE-c.width)//2,(SIZE-c.height)//2))
        return canvas, "pad-white"
    else:
        # centre cover-crop to square (coloured studio bg -> keep full bleed)
        w,h=im.size; m=min(w,h)
        im=im.crop(((w-m)//2,(h-m)//2,(w-m)//2+m,(h-m)//2+m)).resize((SIZE,SIZE),Image.LANCZOS)
        return im, "crop"

def save_under_170kb(img, dst):
    for q in (86,82,78,74,70,66,62):
        buf=io.BytesIO(); img.save(buf,"JPEG",quality=q,optimize=True,progressive=True)
        if buf.tell() <= 170*1024 or q==62:
            with open(dst,"wb") as f: f.write(buf.getvalue())
            return buf.tell(), q
    return None,None

man = json.load(io.open(MAN, encoding="utf-8"))
rows=[]
for m in man:
    sku=m["sku"]; live=m.get("live_img","")
    if not live: rows.append((sku,"SKIP no live_img","","")); continue
    dst=os.path.join(ROOT, live.replace("/", os.sep))
    raw=primary_real(sku)
    if not raw: rows.append((sku,"SKIP no raw","","")); continue
    # backup current live square once
    if os.path.exists(dst):
        bdst=os.path.join(BK, os.path.basename(dst))
        if not os.path.exists(bdst):
            with open(dst,"rb") as a, open(bdst,"wb") as b: b.write(a.read())
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    sq,mode=to_square(raw)
    size,q=save_under_170kb(sq,dst)
    rows.append((sku, mode, "%dKB q%d"%(round(size/1024),q), os.path.basename(raw)))

print("%-7s %-10s %-10s %s"%("SKU","MODE","SIZE","SOURCE"))
for r in rows: print("%-7s %-10s %-10s %s"%r)
print("\nbackups in:", BK)
print("processed:", sum(1 for r in rows if r[1] in("pad-white","crop")))
