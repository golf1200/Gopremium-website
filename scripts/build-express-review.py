# Self-contained (base64) review of the express real-photo refresh.
import json, os, base64, io, html
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def J(p): return json.load(open(os.path.join(ROOT,p),encoding="utf-8"))
gen = J("src/data/product-images.generated.json")
raw = {p["sku"]:p for p in J("src/data/products-raw.json") if p["sku"].startswith("EX")}
recon = {e["sku"]:e for e in J("express-realphoto-2026/reconcile.json")}
featured = J("express-realphoto-2026/featured-skus.json")
CL = {"drinkware":"แก้ว & กระบอกน้ำ","garment":"เสื้อผ้า","hat":"หมวก","umbrella":"ร่ม",
      "bags":"กระเป๋า","powerbank":"พาวเวอร์แบงก์","fan":"พัดลมพกพา","lifestyle":"ไลฟ์สไตล์"}
ORDER=["drinkware","garment","hat","umbrella","bags","powerbank","fan","lifestyle"]

def b64_img(path, box=230, q=72):
    try:
        im=Image.open(path).convert("RGB"); im.thumbnail((box,box))
        b=io.BytesIO(); im.save(b,"JPEG",quality=q);
        return "data:image/jpeg;base64,"+base64.b64encode(b.getvalue()).decode()
    except: return ""

def b64_file(path):
    try: return "data:image/png;base64,"+base64.b64encode(open(path,"rb").read()).decode()
    except: return ""

groups={}
for sku in featured:
    p=raw.get(sku);
    if not p: continue
    groups.setdefault(p["category_slug"],[]).append(sku)
cats=[c for c in ORDER if c in groups]+[c for c in groups if c not in ORDER]

cards=[]
for c in cats:
    cards.append(f'<h2>{html.escape(CL.get(c,c))} <small>{len(groups[c])} รายการ</small></h2><div class="grid">')
    for sku in groups[c]:
        p=raw[sku]; rc=recon.get(sku,{})
        slug=gen.get(sku,{}).get("base","")
        src=b64_img(os.path.join(ROOT,"public","images","products",slug,f"{slug}-square.jpg"))
        flags=""
        if rc.get("is_new"): flags+='<span class="b new">NEW</span>'
        if rc.get("hero_is_group"): flags+='<span class="b grp">รูปรวม</span>'
        nc=len(p.get("colors") or [])
        ncs=f'<span class="nc">{nc} สี</span>' if nc>1 else ''
        cards.append(f'<div class="c"><div class="t"><img src="{src}" loading="lazy"></div>'
                     f'<div class="m"><b>{sku}</b>{flags}</div>'
                     f'<div class="n">{html.escape(p["name"][:40])}</div>{ncs}</div>')
    cards.append('</div>')

shot_top=b64_file(os.path.join(ROOT,"express-realphoto-2026","_express-top.png"))
shot_grid=b64_file(os.path.join(ROOT,"express-realphoto-2026","_express-grid.png"))
n_new=sum(1 for s in featured if recon.get(s,{}).get("is_new"))
n_grp=sum(1 for s in featured if recon.get(s,{}).get("hero_is_group"))

doc=f"""<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>รีวิว: สินค้าส่งด่วน รูปจริง + redesign</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Anuphan:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500&display=swap');
*{{box-sizing:border-box}}body{{font-family:'IBM Plex Sans Thai',sans-serif;margin:0;background:#f5f6f8;color:#1a2230}}
.wrap{{max-width:1200px;margin:0 auto;padding:28px 20px 60px}}
h1{{font-family:'Anuphan';color:#13244a;font-size:28px;margin:0 0 4px}}
.sub{{color:#5b6472;margin-bottom:18px}}
.stats{{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0 26px}}
.stat{{background:#fff;border-radius:14px;padding:14px 20px;box-shadow:0 4px 16px -6px rgba(31,58,95,.16);min-width:130px}}
.stat b{{font-family:'Anuphan';font-size:26px;color:#13244a;display:block}}.stat span{{font-size:12.5px;color:#5b6472}}
h2{{font-family:'Anuphan';color:#13244a;font-size:20px;margin:30px 0 12px;border-bottom:1px solid #e3e7ee;padding-bottom:7px}}
h2 small{{font-size:13px;color:#8a93a2;font-weight:400}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}}
.c{{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 3px 12px -6px rgba(31,58,95,.18)}}
.t{{aspect-ratio:1;background:#f7f6f1}}.t img{{width:100%;height:100%;object-fit:cover}}
.m{{display:flex;align-items:center;gap:6px;padding:8px 10px 2px}}.m b{{font-family:'Anuphan';color:#13244a;font-size:13px}}
.n{{padding:0 10px;font-size:12px;color:#5b6472;line-height:1.35;min-height:32px}}
.nc{{display:inline-block;margin:2px 10px 10px;font-size:11px;color:#5b6472;background:#eef1f5;padding:2px 8px;border-radius:99px}}
.b{{font-size:9.5px;font-weight:700;padding:2px 6px;border-radius:99px;color:#fff}}
.b.new{{background:#0a7a30}}.b.grp{{background:#c9852b}}
.shot{{width:100%;border-radius:14px;box-shadow:0 8px 30px -12px rgba(31,58,95,.4);margin:8px 0 4px;border:1px solid #e3e7ee}}
.note{{background:#fff;border-left:4px solid #f4b223;padding:14px 18px;border-radius:0 12px 12px 0;margin:14px 0;font-size:14px;line-height:1.6}}
.cols{{display:grid;grid-template-columns:1fr 1fr;gap:18px}}@media(max-width:760px){{.cols{{grid-template-columns:1fr}}}}
</style></head><body><div class="wrap">
<h1>สินค้าส่งด่วน — รูปจริง + Redesign</h1>
<div class="sub">รูปจริงจากโฟลเดอร์ "สินค้าพร้อมส่ง" · ตัดพื้นหลังด้วย rembg (ฟรี) → พื้นสตูดิโอเดียวกันทั้งหน้า · {len(featured)} รายการบนเว็บ</div>
<div class="stats">
<div class="stat"><b>{len(featured)}</b><span>SKU บนหน้า Express</span></div>
<div class="stat"><b>{n_new}</b><span>SKU ใหม่ (EX082–111)</span></div>
<div class="stat"><b>364→71</b><span>รูปต้นฉบับ → hero สตูดิโอ</span></div>
<div class="stat"><b>8</b><span>หมวดหมู่ จัดกลุ่ม</span></div>
<div class="stat"><b>{n_grp}</b><span>รูปรวม/กลุ่ม (ควรหาภาพเดี่ยว)</span></div>
</div>
<div class="note"><b>สรุปงาน:</b> ใช้รูปสินค้าจริง 364 รูปจาก 38 โฟลเดอร์ซัพพลายเออร์ → วิเคราะห์ด้วย 6 AI agent แตกเป็น 71 รุ่น → ตัดพื้นหลัง rembg แล้ววางบนพื้นสตูดิโอ off-white เดียวกัน → หน้า Express ออกแบบใหม่ จัดกลุ่มตามหมวด + แถบสี swatch + ป้าย "N สี" + ป้าย ⚡7–14 วัน. รวม 30 SKU ใหม่ (กระเป๋า/หมอน/ผ้าห่ม/ร่มเพิ่ม/แก้วเพิ่ม) เข้าระบบ + Product Master FINAL.</div>
<div class="cols"><div><h2 style="border:0">หน้า Express (บนสุด)</h2><img class="shot" src="{shot_top}"></div>
<div><h2 style="border:0">การ์ดสินค้า (theme เดียวกัน)</h2><img class="shot" src="{shot_grid}"></div></div>
{''.join(cards)}
<div class="note" style="margin-top:30px"><b>Product Master FINAL:</b> PRODUCT-MASTER-FINAL.xlsx — เพิ่มแท็บ "สินค้าส่งด่วน (Express)" 111 แถว (93 live · 30 ใหม่ ไฮไลต์เขียว · ระบุสถานะรูป/สี/ต้นทุน/ซัพ).</div>
</div></body></html>"""
out=os.path.join(ROOT,"express-realphoto-2026","REVIEW-express-realphoto.html")
open(out,"w",encoding="utf-8").write(doc)
print("wrote",out,f"({len(doc)/1024:.0f} KB)")
