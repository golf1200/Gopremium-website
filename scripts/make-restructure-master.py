# -*- coding: utf-8 -*-
"""Combined restructure master: all suppliers' final maps -> one review page.
Product Master proposal table + per-SKU cards (รวมสี group + full colour list) +
NEW SKU candidates (models without a SKU) + SKUs that need a supplier photo."""
import os, io, json, glob, html as H
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR=os.path.join(ROOT,"express-template-mockups")
OUT=os.path.join(OUTDIR,"REVIEW-RESTRUCTURE-master.html")

# supplier display names
SUPNAME={"SUP-00009":"YW Premium (แก้วสแตนเลส)"}
for f in glob.glob(os.path.join(OUTDIR,"_sup-input-*.json")):
    d=json.load(io.open(f,encoding="utf-8")); SUPNAME[d["supplier"]]=d.get("sup_name","")

# basename -> relpath index, per supplier drive folder
def index_supplier(sup):
    idx={}
    for d in glob.glob(os.path.join(ROOT,"express-assets","_source","_drive",sup+"*")):
        for f in glob.glob(os.path.join(d,"**","*"),recursive=True):
            if f.lower().endswith((".jpg",".jpeg",".png",".webp")):
                idx[os.path.basename(f)]=os.path.relpath(f,OUTDIR).replace(os.sep,"/")
    return idx

finals=[]
for f in sorted(glob.glob(os.path.join(OUTDIR,"_sup-final-*.json"))):
    finals.append(json.load(io.open(f,encoding="utf-8")))
# order: 00001,00002,00004,00005,00009,00011
finals.sort(key=lambda d:d["supplier"])

ST={"ok":("#1f8a4c","✓ พร้อม"),"weak":("#b8860b","△ ควรยืนยัน"),
    "no_image":("#c0392b","✗ ต้องขอรูปซัพ"),"pack":("#2C4F7C","◧ variant กล่อง")}
def chips(cs): return "".join(f'<span class="chip">{H.escape(c)}</span>' for c in cs) if cs else '<span class="muted">—</span>'

# tallies
tot=ok=weak=noimg=pack=newm=0
tbl=[]; sections=[]; newcards=[]; needlist=[]
for d in finals:
    sup=d["supplier"]; idx=index_supplier(sup)
    sname=SUPNAME.get(sup,sup)
    cards=[]
    for s in d.get("final_sku_map",[]):
        tot+=1; st=s.get("status","weak")
        if st=="ok":ok+=1
        elif st=="weak":weak+=1
        elif st=="no_image":noimg+=1
        elif st=="pack":pack+=1
        col,lbl=ST.get(st,ST["weak"])
        ncol=len([c for c in s.get("colors",[]) if not c.startswith("(")])
        rel=idx.get(s.get("primary_group_file",""),"")
        tbl.append(f'<tr><td>{sup}</td><td><b>{s["sku"]}</b></td><td>{H.escape(s.get("name",""))}</td><td style="text-align:center">{ncol or "—"}</td><td><span class="sb" style="background:{col}">{lbl}</span></td><td>{H.escape(s.get("note",""))}</td></tr>')
        if st=="no_image": needlist.append(f'{s["sku"]} · {H.escape(s.get("name",""))} <span class="muted">({sname})</span>')
        img=f'<a href="{rel}" target="_blank"><img src="{rel}" loading="lazy"></a>' if rel else '<div class="noimg">— ไม่มีรูป · ต้องขอจากซัพ —</div>'
        cards.append(f'''<section class="cd"><div class="ch"><b>{s["sku"]}</b> · {H.escape(s.get("name",""))} <span class="sb" style="background:{col}">{lbl}</span></div>
        <div class="cb"><div class="im">{img}<div class="cap">รูปรวมสี (Google Drive)</div></div>
        <div class="meta"><div class="ml">สี ({ncol})</div><div class="chips">{chips(s.get("colors",[]))}</div>{f'<div class="nt">{H.escape(s.get("note",""))}</div>' if s.get("note") else ''}</div></div></section>''')
    # new-model candidates for this supplier
    for m in d.get("models_without_sku",[]):
        newm+=1
        nm=m.get("proposed_name_th") or m.get("desc","")
        files=m.get("files",[]) or ([m.get("primary_group_file","")] if m.get("primary_group_file") else [])
        rel=idx.get(files[0],"") if files else ""
        img=f'<a href="{rel}" target="_blank"><img src="{rel}" loading="lazy"></a>' if rel else '<div class="noimg" style="padding:30px 8px">—</div>'
        cs=m.get("colors",[])
        newcards.append(f'''<section class="cd new"><div class="ch"><span class="sb" style="background:#7b2cbf">+ รุ่นใหม่ (ยังไม่มี SKU)</span> <b>{sname}</b></div>
        <div class="cb"><div class="im">{img}</div><div class="meta"><div class="ml">{H.escape(nm)}</div><div class="chips">{chips(cs)}</div></div></div></section>''')
    sections.append(f'<h2>{sup} · {H.escape(sname)} <span class="cnt">({len(d.get("final_sku_map",[]))} SKU)</span></h2>'+"".join(cards))

summary=f'<b>รวม {tot} SKU จาก {len(finals)} ซัพ:</b> ✓ พร้อม <b style="color:#1f8a4c">{ok}</b> · △ ควรยืนยัน <b style="color:#b8860b">{weak}</b> · ◧ variant กล่อง <b style="color:#2C4F7C">{pack}</b> · ✗ ต้องขอรูปซัพ <b style="color:#c0392b">{noimg}</b> &nbsp;|&nbsp; ＋ รุ่นใหม่ที่ควรเพิ่ม SKU <b style="color:#7b2cbf">{newm}</b>'
need_html="".join(f'<li>{x}</li>' for x in needlist)
page=f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>จัดโครงสร้างใหม่ · ทุกซัพ (Master)</title>
<style>
*{{box-sizing:border-box;margin:0}}body{{font-family:"Sora","IBM Plex Sans Thai",system-ui,sans-serif;background:#eef0ea;color:#13244a}}
header{{background:#13244a;color:#fff;padding:26px 18px;text-align:center}}h1{{font-size:21px}}header p{{color:#cdd6e6;font-size:13.5px;margin-top:8px;max-width:92ch;margin-inline:auto}}
.bar{{height:4px;background:#f4b223}}main{{max-width:1140px;margin:0 auto;padding:22px 16px 80px}}
h2{{font-size:16px;margin:26px 0 12px;border-left:4px solid #f4b223;padding-left:10px}}.cnt{{color:#8A93A2;font-size:13px;font-weight:400}}
.summary{{background:#fff;border-radius:12px;padding:14px 18px;font-size:14px;line-height:1.8;box-shadow:0 6px 18px rgba(19,36,74,.06);margin-bottom:8px}}
.box{{background:#fff;border-radius:12px;padding:14px 18px;margin-top:12px;box-shadow:0 6px 18px rgba(19,36,74,.06)}}
.box h3{{font-size:14px;margin-bottom:8px}}.box ul{{margin:0;padding-left:20px;font-size:13px;line-height:1.8}}
table{{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:12.5px;box-shadow:0 6px 18px rgba(19,36,74,.06);margin-top:10px}}
th,td{{padding:8px 10px;border-bottom:1px solid #eee;text-align:left;vertical-align:top}}th{{background:#13244a;color:#fff;font-size:11.5px}}
.sb{{color:#fff;font-size:11px;padding:2px 8px;border-radius:999px;white-space:nowrap}}
.cd{{background:#fff;border-radius:13px;margin-bottom:13px;box-shadow:0 6px 18px rgba(19,36,74,.06);overflow:hidden}}.cd.new{{border:1.5px solid #d9b8ff}}
.ch{{padding:11px 15px;font-size:14.5px;border-bottom:2px solid #f4b223;display:flex;gap:10px;align-items:center;flex-wrap:wrap}}
.cb{{display:grid;grid-template-columns:300px 1fr;gap:16px;padding:15px}}@media(max-width:680px){{.cb{{grid-template-columns:1fr}}}}
.im img{{width:100%;border:1px solid #e7e3d8;border-radius:9px;background:#fff;cursor:zoom-in;display:block}}.cap{{font-size:11px;color:#8A93A2;text-align:center;margin-top:5px}}
.noimg{{border:2px dashed #e2a3a3;border-radius:9px;padding:44px 12px;text-align:center;color:#c0392b;font-size:13px;background:#fdf3f3}}
.ml{{font-size:13px;color:#13244a;margin-bottom:7px;font-weight:600}}.chips{{display:flex;flex-wrap:wrap;gap:5px}}
.chip{{background:#f3f1ea;border:1px solid #e2dfd2;border-radius:6px;padding:2px 8px;font-size:12px}}
.nt{{margin-top:10px;background:#fff7e6;border:1px solid #f4b223;border-radius:8px;padding:8px 11px;font-size:12.5px;color:#5a4a1e}}.muted{{color:#aaa}}
</style></head><body>
<header><h1>จัดโครงสร้างใหม่ · ทุกซัพ (Master)</h1>
<p>แตกรูปต้นฉบับ Google Drive ของทุกซัพ → ราย รุ่น/SKU + ราย สี ครบทุกแบบ ผ่าน AI analyzer + reviewer ต่อซัพ · คลิกรูปเพื่อซูม</p></header><div class="bar"></div>
<main>
<div class="summary">{summary}</div>
<div class="box"><h3>🔴 SKU ที่ต้องขอรูปจากซัพพลายเออร์ ({noimg})</h3><ul>{need_html}</ul></div>
<h2>① ตารางเสนอ Product Master (ทุก SKU)</h2>
<table><tr><th>ซัพ</th><th>SKU</th><th>ชื่อรุ่น</th><th>สี</th><th>สถานะ</th><th>หมายเหตุ</th></tr>{''.join(tbl)}</table>
<h2 style="margin-top:30px">② ＋ รุ่นใหม่ที่ซัพมี แต่ยังไม่มี SKU ({newm}) — ผู้ใช้พิจารณาเพิ่ม</h2>
{''.join(newcards)}
<h2 style="margin-top:30px">③ รูปรวมสี + สีทั้งหมด ราย SKU (แยกตามซัพ)</h2>
{''.join(sections)}
</main></body></html>'''
io.open(OUT,"w",encoding="utf-8").write(page)
print("WROTE",OUT,"| SKUs",tot,"ok",ok,"weak",weak,"pack",pack,"no_image",noimg,"| new_models",newm)
