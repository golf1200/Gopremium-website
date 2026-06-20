# -*- coding: utf-8 -*-
"""SAMPLE restructure for ONE supplier (SUP-00009 YW Premium) — proof of the new
per-model / per-color structure built from the Google-Drive originals via a
2-analyst + 1-reviewer AI pass. Shows the รวมสี (all-colors) group shot, the full
color list, the proposed Product Master name, and gaps needing supplier photos."""
import os, io, glob, html as H
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR=os.path.join(ROOT,"express-template-mockups")
OUT=os.path.join(OUTDIR,"REVIEW-SUP9-restructure.html")
DRIVE=glob.glob(os.path.join(ROOT,"express-assets","_source","_drive","SUP-00009*"))[0]

def find(basename):
    hits=glob.glob(os.path.join(DRIVE,"**",basename),recursive=True)
    return os.path.relpath(hits[0],OUTDIR).replace(os.sep,"/") if hits else ""

# consolidated final data (reviewer mapping + analyst-A colour lists)
D=[
("EX025","แก้วเยติ 20oz · กล่องน้ำตาล (ฟู๊ดเกรด)","Screenshot 2026-06-05 134140.png",
 ["เขียวเข้ม","เขียวมิ้นต์","เทา","เหลืองมะนาว","เขียวหัวเป็ด","ม่วง","ชมพูบานเย็น","ฟ้าคราม","น้ำเงิน","ส้ม","เงิน","แดง","เหลือง","ดำ","ม่วงอ่อน","ชมพู","เขียว","ฟ้า","กรมท่า","ขาว","น้ำตาล"],
 "pack","ใช้รูปร่วมกับ EX026/EX027 — ต่างแค่กล่องบรรจุ (รูปไม่โชว์กล่อง)"),
("EX026","แก้วเยติ 20oz · กล่องขาว","Screenshot 2026-06-05 134140.png",["(สีชุดเดียวกับ EX025)"],"pack","ต่างแค่กล่องขาว"),
("EX027","แก้วเยติ 20oz · กล่องขาว YW","Screenshot 2026-06-05 134140.png",["(สีชุดเดียวกับ EX025)"],"pack","ต่างแค่กล่องขาวแบรนด์ YW"),
("EX028","แก้วเยติ 30oz ทรงอ้วน","Screenshot 2026-06-05 134351.png",
 ["ชมพูบานเย็น","เขียวขี้ม้า","เทา","เหลือง","เทาฟ้า","ส้ม","ม่วง","แดง","น้ำเงิน","เขียว","เขียวมิ้นต์","ดำ","ขาว","ฟ้าอ่อน","ฟ้าคราม","ชมพู","แดงเข้ม"],"ok",""),
("EX029","แก้วเก็บความเย็น 30oz ทรงสูง · ฝาเกลียว","Screenshot 2026-06-05 134251.png",
 ["ฟ้าอมเขียว","น้ำเงิน","ม่วงเลือดหมู","เขียว","เหลือง","แดง","ดำ","ชมพู","ส้ม","เทา","ขาว","กรมท่า"],"weak","ทรงสูงไม่มีหู ฝาเกลียว — ควรได้รูปคมขึ้นยืนยัน"),
("EX030","แก้วเก็บความเย็น 30oz ทรงสูง · หูโค้ง","Screenshot 2026-06-05 153010.png",
 ["ขาว","ฟ้า","เขียว","ดำ","แดง","ชมพู","เทา","ม่วง","เขียวมะกอก","เหลือง","กรมท่า","น้ำเงิน","เขียวมิ้นต์","ชมพูบานเย็น"],"ok","หูหิ้วโค้งบนฝา"),
("EX031","แก้วเก็บความเย็น 30oz ทรงสูง · หูเหลี่ยม","Screenshot 2026-06-05 134358.png",
 ["ฟ้า","เขียว","เทา","ดำ","แดง","ชมพู","ม่วง","กรมท่า","น้ำเงิน","ขาว","ส้ม","เหลือง"],"weak","หูโค้ง vs หูเหลี่ยมแยกยากที่ความละเอียดนี้ — ขอรูปหูชัด ๆ"),
("EX032","แก้วกาแฟ COFFEE (ฝากระดก)","Screenshot 2026-06-05 134534.png",
 ["เขียวขี้ม้า","ชมพู","ครีม/ขาว","กรมท่า","ดำ"],"ok","มีคำว่า COFFEE บนตัวแก้ว ไม่มีหู"),
("EX033","แก้วเยติ 20oz ทรงอ้วน · ฝาเกลียว","Screenshot 2026-06-05 134304.png",
 ["แดง","เขียวเข้ม","น้ำเงิน","เขียวมิ้นต์","เทา","กรมท่า","ม่วง","ขาว","ชมพูบานเย็น","ฟ้า","เหลือง","ส้ม","เขียว","น้ำตาล"],"ok",""),
("EX034","แก้วเยติ 20oz ทรงอ้วน · หูเหลี่ยม","",[],"need","❌ ไม่มีรูปอ้วน 20oz ที่มีหู — ต้องขอรูปจากซัพ"),
("EX035","แก้ว 20oz ทรงอ้วน · หูโค้ง","",[],"need","❌ ไม่มีรูปอ้วน 20oz ที่มีหู — ต้องขอรูปจากซัพ"),
("EX036","กระบอกน้ำทรงสปอร์ต ACTIVE","Screenshot 2026-06-05 134559.png",
 ["แทน/น้ำตาลอ่อน","ดำ","แดง","กรมท่า","ครีม","ม่วงมารูน","เขียวขี้ม้า"],"ok","มีโลโก้ ACTIVE"),
("EX037","แก้วกาแฟ มีหูจับข้าง 14oz","",[],"need","❌ ไม่มีรูปแก้วหูจับข้าง 14oz (รูป COFFEE คือ EX032) — ต้องขอรูปจากซัพ"),
("EX038","แก้วไข่","Screenshot 2026-06-05 153109.png",
 ["ม่วงอ่อน","ชมพู","ฟ้า","เทา","เขียวมิ้นต์","ขาว","เขียวขี้ม้า","แดง","ส้ม","น้ำเงิน","ม่วง","เขียว","ดำ","กรมท่า","เทาเข้ม"],"ok","ทรงไข่ป่องกลาง"),
("EX039","แก้วทรงสตาร์บัค · ขอบดำ","Screenshot 2026-06-05 153117.png",
 ["ชมพู","ดำ","ม่วงลาเวนเดอร์","ฟ้า","ขาว","เงิน"],"ok","หลอด/ขอบสีเงิน-ดำ"),
("EX040","แก้วทรงสตาร์บัค · ขอบทอง","Screenshot 2026-06-05 153121.png",
 ["ชมพู","เหลือง","เขียวเซจ","ฟ้าเทอร์ควอยซ์","ดำ","ขาว","ม่วงลาเวนเดอร์"],"ok","หลอด/ขอบสีทอง"),
("EX041","กระบอกน้ำเก็บอุณหภูมิ (Smart LED)","Screenshot 2026-06-05 153015.png",
 ["ดำ","ทอง","ขาว/เงิน","เงิน","แดง","น้ำเงิน"],"ok","ทรงสลิม มีจอ LED วัดอุณหภูมิ"),
]
ST={"ok":("#1f8a4c","✓ พร้อม (มีรูปรวมสี)"),"weak":("#b8860b","△ ใช้ได้แต่ควรยืนยัน"),
    "need":("#c0392b","✗ ต้องขอรูปจากซัพ"),"pack":("#2C4F7C","◧ variant-กล่อง · ใช้รูปร่วม")}

def chips(cs): return "".join(f'<span class="chip">{H.escape(c)}</span>' for c in cs)
rows_tbl=[]; cards=[]
for sku,name,fn,colors,status,note in D:
    col,lbl=ST[status]
    ncol=len([c for c in colors if not c.startswith("(")]) if colors else 0
    rows_tbl.append(f'<tr><td><b>{sku}</b></td><td>{H.escape(name)}</td><td style="text-align:center">{ncol or "—"}</td><td><span class="sb" style="background:{col}">{lbl}</span></td><td>{H.escape(note)}</td></tr>')
    img = f'<a href="{find(fn)}" target="_blank"><img src="{find(fn)}" loading="lazy"></a>' if fn and find(fn) else '<div class="noimg">— ไม่มีรูป · ต้องขอจากซัพพลายเออร์ —</div>'
    cards.append(f'''<section class="cd">
      <div class="ch"><b>{sku}</b> · {H.escape(name)} <span class="sb" style="background:{col}">{lbl}</span></div>
      <div class="cb"><div class="im">{img}<div class="cap">รูปรวมสี (ต้นฉบับ Google Drive)</div></div>
      <div class="meta"><div class="ml">สี ({ncol})</div><div class="chips">{chips(colors) if colors else '<span class="muted">—</span>'}</div>
      {f'<div class="nt">{H.escape(note)}</div>' if note else ''}</div></div></section>''')

okc=sum(1 for d in D if d[4]=="ok"); needc=sum(1 for d in D if d[4]=="need")
page=f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ตัวอย่างจัดโครงสร้างใหม่ · SUP-00009 YW Premium</title>
<style>
*{{box-sizing:border-box;margin:0}}body{{font-family:"Sora","IBM Plex Sans Thai",system-ui,sans-serif;background:#eef0ea;color:#13244a}}
header{{background:#13244a;color:#fff;padding:26px 18px;text-align:center}}h1{{font-size:21px}}header p{{color:#cdd6e6;font-size:13.5px;margin-top:8px;max-width:90ch;margin-inline:auto}}
.bar{{height:4px;background:#f4b223}}
main{{max-width:1120px;margin:0 auto;padding:22px 16px 80px}}
h2{{font-size:16px;margin:22px 0 10px}}
table{{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:13px;box-shadow:0 6px 18px rgba(19,36,74,.06)}}
th,td{{padding:9px 11px;border-bottom:1px solid #eee;text-align:left;vertical-align:top}}th{{background:#13244a;color:#fff;font-size:12px}}
.sb{{color:#fff;font-size:11px;padding:2px 8px;border-radius:999px;white-space:nowrap}}
.cd{{background:#fff;border-radius:13px;margin-bottom:14px;box-shadow:0 6px 18px rgba(19,36,74,.06);overflow:hidden}}
.ch{{padding:12px 16px;font-size:15px;border-bottom:2px solid #f4b223;display:flex;gap:10px;align-items:center;flex-wrap:wrap}}
.cb{{display:grid;grid-template-columns:320px 1fr;gap:16px;padding:16px}}
@media(max-width:680px){{.cb{{grid-template-columns:1fr}}}}
.im img{{width:100%;border:1px solid #e7e3d8;border-radius:9px;background:#fff;cursor:zoom-in;display:block}}
.cap{{font-size:11px;color:#8A93A2;text-align:center;margin-top:5px}}
.noimg{{border:2px dashed #e2a3a3;border-radius:9px;padding:48px 12px;text-align:center;color:#c0392b;font-size:13px;background:#fdf3f3}}
.ml{{font-size:12px;color:#5B6472;margin-bottom:6px;font-weight:600}}
.chips{{display:flex;flex-wrap:wrap;gap:5px}}
.chip{{background:#f3f1ea;border:1px solid #e2dfd2;border-radius:6px;padding:2px 8px;font-size:12px}}
.nt{{margin-top:11px;background:#fff7e6;border:1px solid #f4b223;border-radius:8px;padding:8px 11px;font-size:12.5px;color:#5a4a1e}}
.muted{{color:#aaa}}
.note-top{{background:#fff;border-radius:12px;padding:14px 18px;font-size:13.5px;line-height:1.7;margin-bottom:16px;box-shadow:0 6px 18px rgba(19,36,74,.06)}}
</style></head><body>
<header><h1>ตัวอย่างจัดโครงสร้างใหม่ · ซัพ SUP-00009 YW Premium (แก้วสแตนเลส)</h1>
<p>แตกรูปต้นฉบับ Google Drive (19 รูป) → ราย "รุ่น/SKU" + ราย "สี" ครบทุกแบบ ผ่าน AI 2 ตัววิเคราะห์อิสระ + 1 ตัวรีวิวฟันธง · คลิกรูปเพื่อซูม</p></header><div class="bar"></div>
<main>
<div class="note-top"><b>สรุป:</b> 17 SKU · พร้อมใช้ (มีรูปรวมสี) <b style="color:#1f8a4c">{okc}</b> · ต้องขอรูปเพิ่มจากซัพ <b style="color:#c0392b">{needc}</b> (EX034/EX035 อ้วน-มีหู, EX037 แก้วหูจับ 14oz) · EX025/26/27 = รุ่นเดียวกันต่างแค่กล่อง · เก็บ "สี" ครบทุกเฉด (เช่น แก้วไข่/เยติ ได้ 15–21 สี ไม่ใช่สีเดียวแบบเดิม)</div>
<h2>① ตารางเสนอชื่อ Product Master</h2>
<table><tr><th>SKU</th><th>ชื่อรุ่น (เสนอ)</th><th>จำนวนสี</th><th>สถานะรูป</th><th>หมายเหตุ</th></tr>{''.join(rows_tbl)}</table>
<h2>② รูปรวมสี + สีทั้งหมด ราย SKU</h2>
{''.join(cards)}
</main></body></html>'''
io.open(OUT,"w",encoding="utf-8").write(page)
print("WROTE",OUT,"| ok=",okc,"need=",needc)
