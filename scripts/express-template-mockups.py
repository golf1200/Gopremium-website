#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Express "Product Template" style mock-ups — FREE (rembg + PIL, no paid API).
Cuts out previously-generated express product photos and composites them onto
6 candidate studio-template backgrounds so the user can pick a direction.
CI source of truth: Navy #13244a · Gold #f4b223 · off-white.
"""
import os, io
from PIL import Image, ImageDraw, ImageFilter, ImageChops
from rembg import remove

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, "express-template-mockups")
CACHE= os.path.join(OUT, "_cutouts")
os.makedirs(OUT, exist_ok=True); os.makedirs(CACHE, exist_ok=True)

S = 1000                      # canvas
NAVY  = (19, 36, 74)          # #13244a
NAVY_HI = (32, 52, 96)
NAVY_DK = (12, 22, 48)
GOLD  = (244, 178, 35)        # #f4b223
CREAM = (242, 238, 228)
CREAM_FLOOR = (235, 229, 214)

PRODUCTS = [
    ("EX004 · ขวดน้ำ",   "public/images/products/ex004-drinkware/ex004-drinkware-square.jpg"),
    ("EX035 · แก้วเก็บอุณหภูมิ", "public/images/products/ex035-drinkware/ex035-drinkware-square.jpg"),
    ("EX001 · เสื้อยืด",  "public/images/products/ex001-garment/ex001-garment-square.jpg"),
    ("EX056 · กระเป๋า",   "public/images/products/ex056-bags/ex056-bags-square.jpg"),
]

# ---------- helpers ----------
def cutout(path, key):
    cp = os.path.join(CACHE, key + ".png")
    if os.path.exists(cp):
        return Image.open(cp).convert("RGBA")
    with open(os.path.join(ROOT, path), "rb") as f:
        out = remove(f.read())
    im = Image.open(io.BytesIO(out)).convert("RGBA")
    bbox = im.getbbox()
    if bbox: im = im.crop(bbox)
    im.save(cp)
    return im

def fit(prod, target_h):
    w, h = prod.size
    scale = target_h / h
    nw = int(w * scale)
    if nw > S * 0.82:                     # keep width in frame
        scale = (S * 0.82) / w; nw = int(w*scale); target_h = int(h*scale)
    return prod.resize((nw, int(h*scale)), Image.LANCZOS)

def vgrad(top, bot, h=S, w=S):
    base = Image.new("RGB", (w, h))
    px = base.load()
    for y in range(h):
        t = y / (h-1)
        px[0, y] = tuple(int(top[i] + (bot[i]-top[i])*t) for i in range(3))
    return base.resize((w, h)) if False else _hstretch(base, w)

def _hstretch(col, w):
    return col.resize((w, col.height), Image.NEAREST) if col.width==w else col.crop((0,0,1,col.height)).resize((w,col.height))

def vgrad2(top, bot, h, w=S):
    col = Image.new("RGB", (1, h))
    p = col.load()
    for y in range(h):
        t = y/(h-1)
        p[0,y] = tuple(int(top[i]+(bot[i]-top[i])*t) for i in range(3))
    return col.resize((w, h), Image.BILINEAR)

def radial(center, edge, w=S, h=S, cx=0.5, cy=0.42, r=0.75):
    base = Image.new("RGB",(w,h),edge)
    mask = Image.new("L",(w,h),0)
    d = ImageDraw.Draw(mask)
    R = int(max(w,h)*r)
    d.ellipse([int(cx*w)-R,int(cy*h)-R,int(cx*w)+R,int(cy*h)+R], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(R*0.55))
    top = Image.new("RGB",(w,h),center)
    return Image.composite(top, base, mask)

def contact_shadow(prod, floor_y, squash=0.16, blur=22, alpha=120, tint=(15,22,40)):
    w,h = prod.size
    a = prod.split()[3]
    sh_h = max(8, int(w*squash))
    sh = a.resize((w, sh_h), Image.LANCZOS)
    layer = Image.new("RGBA",(S,S),(0,0,0,0))
    canvas_a = Image.new("L",(S,S),0)
    x = (S - w)//2
    canvas_a.paste(sh, (x, floor_y - sh_h//2))
    canvas_a = canvas_a.filter(ImageFilter.GaussianBlur(blur))
    canvas_a = canvas_a.point(lambda v: int(v*alpha/255))
    solid = Image.new("RGBA",(S,S),tint+(0,))
    solid.putalpha(canvas_a)
    return solid

def reflection(prod, top_y, x, fade=0.5, strength=70):
    w,h = prod.size
    refl = prod.transpose(Image.FLIP_TOP_BOTTOM)
    grad = Image.new("L",(1,h),0); gp=grad.load()
    for y in range(h):
        t = y/(h-1)
        gp[0,y] = int(strength*max(0, 1 - t/fade))
    grad = grad.resize((w,h))
    ra = ImageChops.multiply(refl.split()[3], grad)
    refl.putalpha(ra)
    layer = Image.new("RGBA",(S,S),(0,0,0,0))
    layer.paste(refl,(x, top_y),refl)
    return layer

def place(bg, prod, target_h=600, floor_ratio=0.80, shadow=True, refl=False,
          sh_alpha=120, sh_tint=(15,22,40), refl_strength=55):
    bg = bg.convert("RGBA")
    p = fit(prod, target_h)
    w,h = p.size
    x = (S - w)//2
    floor_y = int(S*floor_ratio)
    y = floor_y - h
    if shadow:
        bg = Image.alpha_composite(bg, contact_shadow(p, floor_y, alpha=sh_alpha, tint=sh_tint))
    if refl:
        bg = Image.alpha_composite(bg, reflection(p, floor_y, x, strength=refl_strength))
    bg.alpha_composite(p, (x, y))
    return bg

# ---------- 6 template backgrounds ----------
def bg_studio_cream():
    g = vgrad2((246,242,233),(236,230,217), S)
    d = ImageDraw.Draw(g)
    fy = int(S*0.66)
    g.paste(vgrad2((237,231,219),(231,224,209), S-fy), (0, fy))
    return g

def bg_navy_podium():
    g = radial(NAVY_HI, NAVY_DK, cy=0.40, r=0.85)
    fy = int(S*0.66)
    floor = vgrad2((20,34,68),(11,20,44), S-fy)
    g.paste(floor,(0,fy))
    d = ImageDraw.Draw(g, "RGBA")
    d.rectangle([0,fy-2,S,fy+1], fill=GOLD+(180,))      # gold horizon
    return g

def bg_gold_halo():
    base = vgrad2((247,243,235),(238,232,220), S)
    halo = Image.new("RGB",(S,S),(247,243,235))
    mask = Image.new("L",(S,S),0); dd=ImageDraw.Draw(mask)
    R=int(S*0.33); cx,cy=S//2,int(S*0.42)
    dd.ellipse([cx-R,cy-R,cx+R,cy+R],fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(R*0.5))
    gold=Image.new("RGB",(S,S),(248,206,120))
    base=Image.composite(gold,base,mask.point(lambda v:int(v*0.55)))
    fy=int(S*0.70)
    base.paste(vgrad2((238,232,220),(231,224,209),S-fy),(0,fy))
    return base

def bg_two_tone():
    base = vgrad2((245,241,232),(239,233,221), S)
    panel_top=int(S*0.46)
    panel=Image.new("RGBA",(S,S),(0,0,0,0)); dp=ImageDraw.Draw(panel)
    dp.rounded_rectangle([60,panel_top,S-60,S-60],radius=46,fill=NAVY+(255,))
    dp.rounded_rectangle([60,panel_top,S-60,S-60],radius=46,outline=GOLD+(255,),width=3)
    dp.line([90,panel_top+22,S-90,panel_top+22],fill=GOLD+(150,),width=2)
    base=Image.alpha_composite(base.convert("RGBA"),panel)
    return base.convert("RGB")

def bg_dark_luxe():
    g = radial((26,42,80),(8,15,34), cy=0.44, r=0.7)
    spot=Image.new("L",(S,S),0); ds=ImageDraw.Draw(spot)
    ds.ellipse([int(S*0.2),int(S*0.05),int(S*0.8),int(S*0.85)],fill=255)
    spot=spot.filter(ImageFilter.GaussianBlur(120)).point(lambda v:int(v*0.35))
    warm=Image.new("RGB",(S,S),(70,86,128))
    g=Image.composite(warm,g,spot)
    d=ImageDraw.Draw(g,"RGBA")
    d.rectangle([0,S-10,S,S],fill=GOLD+(200,))
    return g

def bg_warm_floor():
    base=vgrad2((248,244,236),(243,238,228),S)
    fy=int(S*0.72)
    base.paste(vgrad2((236,229,215),(228,220,203),S-fy),(0,fy))
    d=ImageDraw.Draw(base,"RGBA")
    d.line([0,fy,S,fy],fill=(210,200,180,120),width=1)
    return base

TEMPLATES = [
    ("01-studio-cream", "Studio Cream (ปัจจุบัน)", lambda p: place(bg_studio_cream(), p, 600, 0.80, refl=False)),
    ("02-navy-podium",  "Navy Podium + เส้นทอง",   lambda p: place(bg_navy_podium(),  p, 560, 0.66+0.13, refl=True, sh_alpha=150, sh_tint=(5,10,24), refl_strength=45)),
    ("03-gold-halo",    "Gold Halo (ออร่าทอง)",    lambda p: place(bg_gold_halo(),    p, 600, 0.80, sh_alpha=110)),
    ("04-two-tone",     "Two-Tone Navy Panel",     lambda p: place(bg_two_tone(),     p, 600, 0.82, sh_alpha=90)),
    ("05-dark-luxe",    "Dark Luxe (สาย Exclusive)",lambda p: place(bg_dark_luxe(),    p, 560, 0.80, refl=True, sh_alpha=160, sh_tint=(2,6,18), refl_strength=50)),
    ("06-warm-floor",   "Warm Minimal Floor",      lambda p: place(bg_warm_floor(),   p, 600, 0.80, refl=True, sh_alpha=120, refl_strength=40)),
]

def main():
    rows=[]
    for label, path in PRODUCTS:
        key = label.split(" ")[0]
        print("cutout", key)
        prod = cutout(path, key)
        for tid, tname, fn in TEMPLATES:
            img = fn(prod).convert("RGB")
            fn_out = f"{key}_{tid}.jpg"
            img.save(os.path.join(OUT, fn_out), quality=88)
            print("  ->", fn_out)
    print("DONE ->", OUT)

if __name__ == "__main__":
    main()
