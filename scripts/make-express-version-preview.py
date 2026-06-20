# -*- coding: utf-8 -*-
"""
Real Express page replica with a VERSION SWITCHER (styled / styled_free / gen / real).
Renders every express SKU using the live card markup + CSS, swapping each product
image between the AI-generated version buckets in express-assets/<SKU>/<bucket>/.
Self-contained (base64) so it opens by double-click. FREE (no paid API).
"""
import os, re, io, json, base64, glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V2   = os.path.join(ROOT, "public", "v2.html")
DATA = os.path.join(ROOT, "public", "catalogue-data.js")
OUTDIR = os.path.join(ROOT, "express-template-mockups")
os.makedirs(OUTDIR, exist_ok=True)
OUT = os.path.join(OUTDIR, "REVIEW-express-VERSIONS-onpage.html")

EXPRESS_SKUS = ['EX001','EX002','EX003','EX004','EX005','EX006','EX008','EX009','EX019','EX025','EX026','EX027','EX029','EX030','EX031','EX032','EX033','EX034','EX035','EX036','EX037','EX038','EX039','EX040','EX041','EX042','EX044','EX045','EX046','EX047','EX048','EX049','EX050','EX051','EX052','EX053','EX054','EX055']
BUCKETS = [("styled","styled"),("styled_free","styled_free"),("gen","gen"),("real","real")]
VLABELS = {"styled":"styled · Gemini บน Template","styled_free":"styled_free · ตัดพื้นฟรี","gen":"gen · Gemini สร้างใหม่","real":"real · รูปจริงดิบ"}

def read(p): return io.open(p, encoding="utf-8", errors="replace").read()

# ---- extract live <style> for identical look ----
html = read(V2)
style = re.search(r"<style>.*?</style>", html, re.S).group(0)

# ---- parse product data ----
js = read(DATA)
def js_array(name):
    i = js.index(name+"=[") + len(name)+1
    depth=0
    for j in range(i, len(js)):
        c=js[j]
        if c=='[': depth+=1
        elif c==']':
            depth-=1
            if depth==0: return json.loads(js[i:j+1])
    raise RuntimeError("no array "+name)
def js_obj(name):
    i = js.index(name+"={") + len(name)+1
    depth=0
    for j in range(i, len(js)):
        c=js[j]
        if c=='{': depth+=1
        elif c=='}':
            depth-=1
            if depth==0: return json.loads(js[i:j+1])
PRODUCTS = {p["sku"]:p for p in js_array("window.GP_PRODUCTS")}
CL = js_obj("window.GP_CATLABELS")

# ---- image helpers ----
_b64cache={}
MAXPX=760
def b64_file(path):
    if path in _b64cache: return _b64cache[path]
    im = Image.open(path)
    has_alpha = im.mode in ("RGBA","LA") or (im.mode=="P" and "transparency" in im.info)
    im.thumbnail((MAXPX,MAXPX), Image.LANCZOS)
    buf=io.BytesIO()
    if has_alpha:
        im.convert("RGBA").save(buf,"PNG",optimize=True); mime="png"
    else:
        im.convert("RGB").save(buf,"JPEG",quality=80,optimize=True); mime="jpeg"
    d="data:image/%s;base64,%s"%(mime, base64.b64encode(buf.getvalue()).decode())
    _b64cache[path]=d
    return d

# best authentic raw, hand-picked where the auto-primary grabbed a weak shot
PRIMARY_OVERRIDE = {
    "EX008": "express-assets/EX008/real/EX008-trucker-front.jpg",   # auto picked hat interior
    "EX035": "express-assets/EX035/real/EX035-curved-mug2.jpg",     # auto picked low-res png
    "EX032": "express-assets/EX032/real/EX032-coffee-tumbler-white.webp",
}

def primary_in(folder):
    if not os.path.isdir(folder): return None
    files=[f for f in glob.glob(os.path.join(folder,"*")) if f.lower().endswith((".jpg",".jpeg",".png",".webp"))]
    if not files: return None
    # prefer the "base" shot: shortest name, de-prioritise alt angles
    def rank(f):
        n=os.path.basename(f).lower()
        alt=any(k in n for k in("-2","-back","-side","-lidoff","-lying","-top","-open","-03","-04","_2"))
        return (1 if alt else 0, len(n), n)
    files.sort(key=rank)
    return files[0]

def live_path(img):
    # "/images/products/..square.jpg?v=2" -> public/images/products/..square.jpg
    rel = img.split("?")[0].lstrip("/")
    return os.path.join(ROOT,"public",rel)

# ---- build IMG map: IMG[sku][ver] = {"src":dataURI,"fb":bool} ----
IMG={}
stats={k:0 for k,_ in BUCKETS}; fb=0
for sku in EXPRESS_SKUS:
    p=PRODUCTS.get(sku)
    if not p: continue
    live = live_path(p.get("img",""))
    live_uri = b64_file(live) if os.path.exists(live) else ""
    IMG[sku]={}
    for ver,folder in BUCKETS:
        pf = primary_in(os.path.join(ROOT,"express-assets",sku,folder))
        if ver=="real" and sku in PRIMARY_OVERRIDE:
            ov=os.path.join(ROOT,PRIMARY_OVERRIDE[sku])
            if os.path.exists(ov): pf=ov
        if pf:
            IMG[sku][ver]={"src":b64_file(pf),"fb":False}; stats[ver]+=1
        else:
            IMG[sku][ver]={"src":live_uri,"fb":True}; fb+=1

# ---- render cards (mirror live card() markup) ----
def baht(p):
    return ("฿%s"%format(p,",")) if p else "สอบถามราคา"

cards=[]
for sku in EXPRESS_SKUS:
    p=PRODUCTS.get(sku)
    if not p: continue
    chip = CL.get(p.get("catSlug",""), p.get("cat",""))
    name = p.get("name",""); feat=p.get("features","") or ""
    moq = p.get("moq",""); price=p.get("price")
    first = IMG[sku]["real"]
    cards.append(f'''<a class="pcard" data-sku="{sku}" href="javascript:void(0)">
  <div class="pthumb"><span class="pchip">{chip}</span>
    <span class="fbb" data-fbb="{sku}" style="display:{'block' if first['fb'] else 'none'}">ใช้รูปปัจจุบัน</span>
    <img data-img="{sku}" loading="lazy" src="{first['src']}" alt="{name}"></div>
  <div class="pbody"><div class="pname">{name}</div><div class="pfeat">{feat}</div>
  <div class="pfoot"><div class="pprice">{baht(price)} <small>{'/ชิ้น' if price else ''}</small></div><div class="pmoq">MOQ {moq}</div></div></div></a>''')

grid="\n".join(cards)
imgjson=json.dumps(IMG, ensure_ascii=False)

extra_css='''
.vswitch{position:sticky;top:0;z-index:50;background:#13244a;color:#fff;padding:14px 16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(0,0,0,.18)}
.vswitch b{margin-right:6px;font-family:var(--head)}
.vbtn{font-family:var(--head);font-size:13.5px;border:1.5px solid rgba(255,255,255,.4);background:transparent;color:#fff;border-radius:999px;padding:9px 16px;cursor:pointer;transition:.15s}
.vbtn:hover{border-color:#f4b223}
.vbtn.on{background:#f4b223;color:#13244a;border-color:#f4b223;font-weight:600}
.fbb{position:absolute;top:8px;right:8px;background:rgba(19,36,74,.82);color:#f4b223;font-size:10.5px;font-family:var(--head);padding:3px 8px;border-radius:6px;z-index:3}
.vnote{max-width:1180px;margin:14px auto 0;padding:0 18px;font-size:13px;color:#5B6472;text-align:center}
.pcard{cursor:default}
'''

page=f'''<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express — เทียบเวอร์ชันรูปบนหน้าจริง</title>
{style}
<style>{extra_css}</style></head>
<body>
<div class="vswitch">
  <b>สลับเวอร์ชันรูป:</b>
  <button class="vbtn on" data-v="real">real ✓ แนะนำ</button>
  <button class="vbtn" data-v="styled_free">styled_free</button>
  <button class="vbtn" data-v="styled">styled</button>
  <button class="vbtn" data-v="gen">gen</button>
</div>
<p class="vnote">หน้านี้ใช้ layout/การ์ด/CSS เดียวกับหน้า Express จริง · กดปุ่มด้านบนเพื่อสลับรูปทั้งหน้าเป็นแต่ละเวอร์ชัน · ป้าย <b style="color:#b8860b">ใช้รูปปัจจุบัน</b> = SKU นั้นไม่มีรูปเวอร์ชันนี้ เลย fallback เป็นรูป live</p>
<section class="sec" style="padding-top:20px"><div class="wrap">
  <div class="shead" style="margin-top:4px"><span class="eyebrow"><span class="dot"></span>พร้อมผลิตด่วน</span><h2 class="h2">รุ่นแนะนำสำหรับงานด่วน</h2><p class="lead">พรีวิวเทียบเวอร์ชันรูปสินค้า — เวอร์ชันที่แสดง: <b id="curv">real</b></p></div>
  <div class="pgrid">{grid}</div>
</div></section>
<script>
const IMG={imgjson};
function setVer(v){{
  document.querySelectorAll('.vbtn').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
  document.getElementById('curv').textContent=v;
  document.querySelectorAll('[data-img]').forEach(img=>{{
    const sku=img.dataset.img, rec=IMG[sku]&&IMG[sku][v];
    if(!rec) return;
    img.src=rec.src;
    const bb=document.querySelector('[data-fbb="'+sku+'"]');
    if(bb) bb.style.display=rec.fb?'block':'none';
  }});
}}
document.querySelectorAll('.vbtn').forEach(b=>b.addEventListener('click',()=>setVer(b.dataset.v)));
</script>
</body></html>'''

io.open(OUT,"w",encoding="utf-8").write(page)
print("WROTE",OUT)
print("SIZE", round(os.path.getsize(OUT)/1024/1024,2),"MB")
print("SKUs rendered:", len([s for s in EXPRESS_SKUS if s in PRODUCTS]))
print("real-imgs found per bucket:", stats, "| fallbacks:", fb)
