# -*- coding: utf-8 -*-
"""
Per-SKU gallery comparing EVERY available version of each express product:
  real (raw, FREE/authentic) · styled_free (AI FREE) · styled (AI PAID) · gen (AI PAID)
Marks which file is the ORIGINAL catalog source (integrate-express uses styled/ if present
else styled_free/) and which raw is now live. Click any image to zoom full-res.

Images are referenced by RELATIVE path (no base64) so it stays light and zoom shows the
real full-resolution file. KEEP this html inside express-template-mockups/ so paths resolve.
"""
import os, glob, io
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR=os.path.join(ROOT,"express-template-mockups")
OUT=os.path.join(OUTDIR,"REVIEW-ALL-versions.html")
BK=os.path.join(OUTDIR,"_backup-live-squares")

EXPRESS=['EX001','EX002','EX003','EX004','EX005','EX006','EX008','EX009','EX019','EX025','EX026','EX027','EX029','EX030','EX031','EX032','EX033','EX034','EX035','EX036','EX037','EX038','EX039','EX040','EX041','EX042','EX044','EX045','EX046','EX047','EX048','EX049','EX050','EX051','EX052','EX053','EX054','EX055']
FLAGGED=['EX040','EX008','EX026']   # show these first
PRIMARY_OVERRIDE={"EX008":"EX008-trucker-front.jpg","EX035":"EX035-curved-mug2.jpg","EX032":"EX032-coffee-tumbler-white.webp"}
EXTS=(".jpg",".jpeg",".png",".webp")
NAMES={}  # sku->name from manifest
import json
for m in json.load(io.open(os.path.join(OUTDIR,"_validate-manifest.json"),encoding="utf-8")):
    NAMES[m["sku"]]=m.get("name","")

# SKU -> supplier (for the original Google Drive images, stored per-supplier)
SUP={}   # sku -> (sup_code, sup_name)
for r in json.load(io.open(os.path.join(ROOT,"express-assets","EXPRESS-IMAGE-MAP.json"),encoding="utf-8")):
    SUP[r["sku"]]=(r.get("sup_code",""), r.get("sup_name",""))
_drive_cache={}
def drive_imgs(sku):
    sup=SUP.get(sku,("",""))[0]
    if not sup: return []
    if sup in _drive_cache: return _drive_cache[sup]
    dirs=glob.glob(os.path.join(ROOT,"express-assets","_source","_drive",sup+"*"))
    fs=[]
    for d in dirs:
        for f in glob.glob(os.path.join(d,"**","*"),recursive=True):
            if f.lower().endswith(EXTS): fs.append(f)
    fs=sorted(fs)
    _drive_cache[sup]=fs
    return fs

BUCKETS=[
 ("real","rawจริง · ฟรี","#1f8a4c"),
 ("styled_free","AI ฟรี (rembg)","#0e7c86"),
 ("styled","AI เสียตังค์ (Gemini i2i)","#b8860b"),
 ("gen","AI เสียตังค์ (Gemini gen)","#c0392b"),
]
def files_in(sku,bucket):
    d=os.path.join(ROOT,"express-assets",sku,bucket)
    if not os.path.isdir(d): return []
    fs=[f for f in glob.glob(os.path.join(d,"*")) if f.lower().endswith(EXTS)]
    return sorted(fs)
def rel(path):  # relative to OUTDIR (where html lives)
    return os.path.relpath(path,OUTDIR).replace(os.sep,"/")
def primary_real(sku):
    if sku in PRIMARY_OVERRIDE:
        p=os.path.join(ROOT,"express-assets",sku,"real",PRIMARY_OVERRIDE[sku])
        if os.path.exists(p): return p
    fs=files_in(sku,"real")
    if not fs: return None
    def rank(f):
        n=os.path.basename(f).lower()
        alt=any(k in n for k in("-2","-back","-side","-lidoff","-lying","-top","-open","-03","-04","_2"))
        return(1 if alt else 0,len(n),n)
    return sorted(fs,key=rank)[0]

def fig(path,tags):
    badges="".join(f'<span class="bdg" style="background:{c}">{t}</span>' for t,c in tags)
    return (f'<figure><a href="{rel(path)}" target="_blank">'
            f'<img loading="lazy" src="{rel(path)}"></a>'
            f'<figcaption>{badges}<span class="fn">{os.path.basename(path)}</span></figcaption></figure>')

def section(sku):
    name=NAMES.get(sku,"")
    live_raw=primary_real(sku)
    styled=files_in(sku,"styled"); styled_free=files_in(sku,"styled_free")
    src_bucket="styled" if styled else ("styled_free" if styled_free else None)
    src_primary=(styled or styled_free or [None])[0]
    src_label={"styled":"styled (Gemini · เสียตังค์)","styled_free":"styled_free (ฟรี)",None:"— ไม่มี —"}[src_bucket]
    # backup catalog image (what was actually live before swap)
    bk=os.path.join(BK,f"{sku.lower()}-{ {'EX':''}.get('','') }square.jpg")
    # backup file name pattern = <slug>-square.jpg ; find it
    bkfiles=glob.glob(os.path.join(BK,f"{sku.lower()}-*square.jpg"))
    blocks=[]
    # original catalog image (backup) shown first, big
    if bkfiles:
        blocks.append('<div class="grp"><h4>★ รูปที่อยู่ในแคตตาล็อก (เดิม ก่อนสลับ)</h4><div class="row">'
                      + fig(bkfiles[0], [(f"มาจาก: {src_label}", "#13244a")]) + '</div></div>')
    # original Google Drive images (per supplier — may include other SKUs of same supplier)
    sup_code,sup_name=SUP.get(sku,("",""))
    dfs=drive_imgs(sku)
    if dfs:
        dfigs="".join(fig(f,[("รูปจาก Google Drive","#4285F4")]) for f in dfs)
        blocks.append(f'<div class="grp"><h4><span class="ct" style="background:#4285F4"></span>รูปจาก Google Drive · ต้นฉบับซัพ {sup_code} {sup_name} · {len(dfs)} รูป <span class="hint">(โฟลเดอร์รวมหลาย SKU ของซัพเดียวกัน — หาตัวที่ตรงรุ่น)</span></h4><div class="row">{dfigs}</div></div>')
    else:
        blocks.append(f'<div class="grp empty"><h4 style="color:#aaa">รูปจาก Google Drive — ยังไม่ได้โหลดในเครื่อง (ซัพ {sup_code} {sup_name})</h4></div>')
    for bucket,label,color in BUCKETS:
        fs=files_in(sku,bucket)
        if not fs:
            blocks.append(f'<div class="grp empty"><h4 style="color:#aaa">{label} — ไม่มี</h4></div>'); continue
        figs=[]
        for f in fs:
            tags=[(label,color)]
            if live_raw and os.path.abspath(f)==os.path.abspath(live_raw):
                tags.append(("✓ live ตอนนี้","#1f8a4c"))
            if src_primary and os.path.abspath(f)==os.path.abspath(src_primary):
                tags.append(("★ ในแคตตาล็อกเดิม","#13244a"))
            figs.append(fig(f,tags))
        blocks.append(f'<div class="grp"><h4><span class="ct" style="background:{color}"></span>{label} · {len(fs)} รูป</h4><div class="row">{"".join(figs)}</div></div>')
    flag = ' <span class="flag">⚠️ ต้องดู</span>' if sku in FLAGGED else ''
    return f'<section class="sku" id="{sku}"><div class="skhd"><b>{sku}</b> · {name}{flag}</div>{"".join(blocks)}</section>'

secs=[section(s) for s in FLAGGED]+[section(s) for s in EXPRESS if s not in FLAGGED]
nav=" · ".join(f'<a href="#{s}">{s}</a>' for s in FLAGGED+[s for s in EXPRESS if s not in FLAGGED])

html=f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>เทียบทุกเวอร์ชันรูป · Express (คลิกซูม)</title>
<style>
*{{box-sizing:border-box;margin:0}}body{{font-family:"Sora","IBM Plex Sans Thai",system-ui,sans-serif;background:#eef0ea;color:#13244a}}
header{{background:#13244a;color:#fff;padding:24px 18px;text-align:center}}h1{{font-size:21px}}header p{{color:#cdd6e6;font-size:13.5px;margin-top:8px;max-width:86ch;margin-inline:auto}}
.bar{{height:4px;background:#f4b223}}
.legend{{background:#fff;padding:12px 18px;font-size:12.5px;text-align:center;border-bottom:1px solid #e2e2d8}}
.legend span{{display:inline-block;margin:2px 8px}}.dotc{{display:inline-block;width:11px;height:11px;border-radius:3px;vertical-align:middle;margin-right:4px}}
.nav{{background:#fafaf7;padding:10px 14px;font-size:11.5px;line-height:1.9;border-bottom:1px solid #e2e2d8}}.nav a{{color:#2C4F7C;text-decoration:none;margin-right:2px}}
main{{max-width:1180px;margin:0 auto;padding:18px 14px 80px}}
.sku{{background:#fff;border-radius:14px;padding:16px 18px;margin-bottom:18px;box-shadow:0 6px 20px rgba(19,36,74,.06);scroll-margin-top:10px}}
.skhd{{font-size:16px;margin-bottom:12px;border-bottom:2px solid #f4b223;padding-bottom:8px}}
.flag{{color:#c0392b;font-size:13px;font-weight:600}}
.grp{{margin-bottom:12px}}.grp.empty{{opacity:.5;font-size:12px}}
.grp h4{{font-size:13px;margin-bottom:8px;display:flex;align-items:center;gap:6px}}
.ct{{width:11px;height:11px;border-radius:3px;display:inline-block}}
.row{{display:flex;gap:10px;flex-wrap:wrap}}
figure{{width:200px;border:1px solid #e7e3d8;border-radius:9px;overflow:hidden;background:#fff}}
figure img{{width:100%;aspect-ratio:1/1;object-fit:contain;background:#fff;display:block;cursor:zoom-in}}
figcaption{{padding:6px 7px;font-size:10.5px;color:#5B6472}}
.bdg{{display:inline-block;color:#fff;border-radius:5px;padding:1px 6px;margin:1px 2px 1px 0;font-size:9.5px}}
.fn{{display:block;margin-top:3px;color:#9aa2af;word-break:break-all}}
.hint{{font-weight:400;font-size:10.5px;color:#9aa2af}}
</style></head><body>
<header><h1>เทียบทุกเวอร์ชันรูป · Express — คลิกรูปเพื่อซูมเต็ม</h1>
<p>แต่ละ SKU โชว์ครบทุกเวอร์ชันที่มีในโฟลเดอร์ <code>express-assets/&lt;SKU&gt;/</code> · ป้าย <b>★ ในแคตตาล็อกเดิม</b> = รูปที่ถูกใช้ในเว็บก่อนสลับ (มาจาก styled ถ้ามี ไม่งั้น styled_free) · <b>✓ live ตอนนี้</b> = รูป raw ที่เพิ่งสลับเข้าไป · ⚠️ 3 ตัวบนสุดคือที่ต้องตัดสินใจ</p></header><div class="bar"></div>
<div class="legend">
<span><i class="dotc" style="background:#4285F4"></i>รูปจาก Google Drive (ต้นฉบับซัพ)</span>
<span><i class="dotc" style="background:#1f8a4c"></i>real (raw จริง · ฟรี)</span>
<span><i class="dotc" style="background:#0e7c86"></i>styled_free (AI ฟรี)</span>
<span><i class="dotc" style="background:#b8860b"></i>styled (AI เสียตังค์)</span>
<span><i class="dotc" style="background:#c0392b"></i>gen (AI เสียตังค์)</span>
</div>
<div class="nav">ไปที่: {nav}</div>
<main>{''.join(secs)}</main></body></html>'''
io.open(OUT,"w",encoding="utf-8").write(html)
print("WROTE",OUT,"|",round(os.path.getsize(OUT)/1024,1),"KB |",len(secs),"SKUs")
