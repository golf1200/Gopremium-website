# -*- coding: utf-8 -*-
"""Single-writer assembly of the per-supplier master proposals into:
  1) src/data/products-raw.proposed.json  (STAGED copy: + colors field, name fixes, 22 new SKUs)
  2) express-template-mockups/PRODUCT-MASTER-PROPOSAL.html (+ .csv)
  3) express-template-mockups/SUPPLIER-PHOTO-REQUESTS.html
Nothing live is overwritten. New SKU codes fill gaps EX007/EX043 then EX062+.
"""
import os, io, json, glob, csv, html as H
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR=os.path.join(ROOT,"express-template-mockups")
RAW=os.path.join(ROOT,"src","data","products-raw.json")

SUPNAME={}
for f in glob.glob(os.path.join(OUTDIR,"_sup-input-*.json")):
    d=json.load(io.open(f,encoding="utf-8")); SUPNAME[d["supplier"]]=d.get("sup_name","")
SUPNAME["SUP-00009"]="YW Premium (แก้วสแตนเลส)"

CATTITLE={"drinkware":"Drinkware","garment":"Garment","hat":"Hat","umbrella":"Umbrella","bags":"Bags"}
def idx_sup(sup):
    idx={}
    for d in glob.glob(os.path.join(ROOT,"express-assets","_source","_drive",sup+"*")):
        for f in glob.glob(os.path.join(d,"**","*"),recursive=True):
            if f.lower().endswith((".jpg",".jpeg",".png",".webp")):
                idx[os.path.basename(f)]=os.path.relpath(f,OUTDIR).replace(os.sep,"/")
    return idx

masters=[json.load(io.open(f,encoding="utf-8")) for f in sorted(glob.glob(os.path.join(OUTDIR,"_sup-master-*.json")))]
masters.sort(key=lambda d:d["supplier"])

# new SKU code pool
pool=[7,43]+list(range(62,100))
def nextcode():
    return "EX%03d"%pool.pop(0)

raw=json.load(io.open(RAW,encoding="utf-8"))
bysku={p["sku"]:p for p in raw}

prop_rows=[]   # for table/csv
new_records=[] # appended to proposed raw
photo_by_sup={}
ST={"ok":("#1f8a4c","พร้อม"),"weak":("#b8860b","ควรยืนยัน"),"no_image":("#c0392b","ต้องขอรูปซัพ"),"pack":("#2C4F7C","variant กล่อง")}

for m in masters:
    sup=m["supplier"]; sname=SUPNAME.get(sup,sup); idx=idx_sup(sup)
    # existing
    for e in m.get("existing",[]):
        sku=e["sku"]; rec=bysku.get(sku)
        colors=[c for c in e.get("colors",[]) if not str(c).startswith("(")]
        name_final=e.get("name_final") or (rec.get("name") if rec else sku)
        changed = bool(rec) and name_final.strip()!=rec.get("name","").strip()
        if rec is not None:
            rec["colors"]=e.get("colors",[])
            if name_final.strip(): rec["name"]=name_final
        prop_rows.append({"code":sku,"sup":sup,"name":name_final,"cat":(rec.get("category_slug") if rec else e.get("category_slug","")),
            "ncol":len(colors),"colors":e.get("colors",[]),"status":e.get("status","weak"),
            "src":idx.get("",""),"kind":"existing","changed":changed,"note":""})
    # new models -> assign codes + build raw records
    for nm in m.get("new_models",[]):
        code=nextcode(); cs=nm.get("category_slug","lifestyle")
        name=nm.get("proposed_name_th","(รุ่นใหม่)")
        colors=[c for c in nm.get("colors",[]) if not str(c).startswith("(")]
        rec={"sku":code,"slug":"%s-%s"%(code.lower(),cs),"name":name,
             "category":CATTITLE.get(cs,cs.title()),"category_slug":cs,
             "features":nm.get("type",""),"size":nm.get("size_inch",""),"material":"",
             "price_300_thb":None,"budget_tier":"","moq":50,"free_logo":[],"logo_max_cm":"",
             "occasions":[],"colors":nm.get("colors",[]),"_supplier":sup,"_source_drive":nm.get("source_file","")}
        new_records.append(rec)
        prop_rows.append({"code":code,"sup":sup,"name":name,"cat":cs,"ncol":len(colors),
            "colors":nm.get("colors",[]),"status":"new","src":idx.get(nm.get("source_file",""),""),
            "kind":"new","changed":False,"note":nm.get("note","")})
    # photo requests
    pr=m.get("photo_requests",[])
    if pr: photo_by_sup[sup]=(sname,pr)

# ---- write staged proposed raw ----
proposed=list(bysku.values())+new_records
io.open(os.path.join(ROOT,"src","data","products-raw.proposed.json"),"w",encoding="utf-8").write(json.dumps(proposed,ensure_ascii=False,indent=1))

# ---- CSV ----
with open(os.path.join(OUTDIR,"PRODUCT-MASTER-PROPOSAL.csv"),"w",encoding="utf-8-sig",newline="") as cf:
    w=csv.writer(cf); w.writerow(["SKU","Supplier","Name","Category","#Colors","Colors","Status","New?"])
    for r in prop_rows:
        w.writerow([r["code"],r["sup"],r["name"],r["cat"],r["ncol"]," / ".join(r["colors"]),r["status"],"NEW" if r["kind"]=="new" else ""])

# ---- HTML proposal ----
def chips(cs): return "".join(f'<span class="chip">{H.escape(str(c))}</span>' for c in cs) if cs else '<span class="muted">—</span>'
rows=[]
for r in prop_rows:
    col,lbl=ST.get(r["status"],("#7b2cbf","รุ่นใหม่")) if r["status"]!="new" else ("#7b2cbf","＋ รุ่นใหม่")
    img=f'<a href="{r["src"]}" target="_blank"><img src="{r["src"]}"></a>' if r["src"] else ''
    chg=' <span class="chg">ชื่อแก้</span>' if r["changed"] else ''
    rows.append(f'<tr class="{r["kind"]}"><td><b>{r["code"]}</b></td><td>{r["sup"]}</td><td>{H.escape(r["name"])}{chg}</td><td>{r["cat"]}</td><td style="text-align:center">{r["ncol"] or "—"}</td><td><span class="sb" style="background:{col}">{lbl}</span></td><td>{img}</td><td><div class="chips">{chips(r["colors"])}</div></td></tr>')
nnew=sum(1 for r in prop_rows if r["kind"]=="new")
html_prop=f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Product Master — ข้อเสนอ (staged)</title><style>
*{{box-sizing:border-box;margin:0}}body{{font-family:"Sora","IBM Plex Sans Thai",system-ui;background:#eef0ea;color:#13244a}}
header{{background:#13244a;color:#fff;padding:22px;text-align:center}}h1{{font-size:20px}}header p{{color:#cdd6e6;font-size:13px;margin-top:6px}}
.bar{{height:4px;background:#f4b223}}main{{max-width:1280px;margin:0 auto;padding:18px 12px 70px}}
table{{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;font-size:12px;box-shadow:0 6px 18px rgba(19,36,74,.06)}}
th,td{{padding:7px 9px;border-bottom:1px solid #eee;text-align:left;vertical-align:top}}th{{background:#13244a;color:#fff;position:sticky;top:0}}
tr.new{{background:#faf5ff}}.sb{{color:#fff;font-size:10.5px;padding:2px 7px;border-radius:999px;white-space:nowrap}}
td img{{width:80px;border-radius:6px;border:1px solid #e3e3da;cursor:zoom-in;display:block}}
.chips{{display:flex;flex-wrap:wrap;gap:3px;max-width:360px}}.chip{{background:#f3f1ea;border:1px solid #e2dfd2;border-radius:5px;padding:1px 6px;font-size:11px}}
.muted{{color:#aaa}}.chg{{background:#fde9c8;color:#8a5a00;font-size:10px;padding:1px 5px;border-radius:4px}}
.sum{{background:#fff;border-radius:10px;padding:12px 16px;margin-bottom:12px;font-size:13.5px;box-shadow:0 6px 18px rgba(19,36,74,.06)}}
</style></head><body><header><h1>Product Master — ข้อเสนอจัดใหม่ (staged · ยังไม่เขียนทับของจริง)</h1>
<p>{len(prop_rows)} รายการ ({len(prop_rows)-nnew} เดิม + {nnew} ใหม่) · มีฟิลด์ "สี" ครบ · ไฟล์ร่าง: src/data/products-raw.proposed.json + .csv</p></header><div class="bar"></div>
<main><div class="sum">แถวสีม่วง = SKU ใหม่ (โค้ดเริ่ม EX062 เติมช่อง EX007/EX043) · ป้าย "ชื่อแก้" = ชื่อถูกปรับ · คลิกรูปซูม · ราคา/MOQ ของรุ่นใหม่ตั้ง null/50 รอเติม</div>
<table><tr><th>SKU</th><th>ซัพ</th><th>ชื่อรุ่น</th><th>หมวด</th><th>สี</th><th>สถานะ</th><th>รูป</th><th>สีทั้งหมด</th></tr>{''.join(rows)}</table></main></body></html>'''
io.open(os.path.join(OUTDIR,"PRODUCT-MASTER-PROPOSAL.html"),"w",encoding="utf-8").write(html_prop)

# ---- photo request HTML ----
secs=[]; total_req=0
for sup in sorted(photo_by_sup):
    sname,pr=photo_by_sup[sup]; total_req+=len(pr)
    lis="".join(f'<li>{H.escape(x)}</li>' for x in pr)
    secs.append(f'<section class="sup"><h2>{sup} · {H.escape(sname)} <span class="n">({len(pr)})</span></h2><ol>{lis}</ol></section>')
html_pr=f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>รายการขอรูปจากซัพพลายเออร์</title><style>
*{{box-sizing:border-box;margin:0}}body{{font-family:"Sora","IBM Plex Sans Thai",system-ui;background:#eef0ea;color:#13244a}}
header{{background:#13244a;color:#fff;padding:22px;text-align:center}}h1{{font-size:20px}}.bar{{height:4px;background:#f4b223}}
main{{max-width:900px;margin:0 auto;padding:20px 16px 70px}}.sup{{background:#fff;border-radius:11px;padding:14px 20px;margin-bottom:14px;box-shadow:0 6px 18px rgba(19,36,74,.06)}}
h2{{font-size:15px;border-left:4px solid #f4b223;padding-left:9px;margin-bottom:8px}}.n{{color:#8A93A2;font-size:12px}}
ol{{padding-left:22px;font-size:13.5px;line-height:1.9}}</style></head><body>
<header><h1>📋 รายการขอรูป/ข้อมูลจากซัพพลายเออร์ ({total_req} รายการ)</h1></header><div class="bar"></div>
<main>{''.join(secs)}</main></body></html>'''
io.open(os.path.join(OUTDIR,"SUPPLIER-PHOTO-REQUESTS.html"),"w",encoding="utf-8").write(html_pr)

print("rows:",len(prop_rows),"| new SKUs:",nnew,"| photo requests:",total_req)
print("staged raw:",len(proposed),"products -> src/data/products-raw.proposed.json")
print("codes assigned to new:", [r["code"] for r in prop_rows if r["kind"]=="new"])
