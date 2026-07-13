# -*- coding: utf-8 -*-
"""Visual summary of every STILL-STUCK express item -> Demo/EXPRESS-STUCK.html
 A) baked-in supplier text/watermark that restyle can't remove (dirty regens + held thaikij)
 B) placeholder colour data -> can't build a matching multi-colour group shot yet"""
import json, os, glob, base64, io
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
db = {p['sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))}
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
CUR = os.path.join(ROOT, 'express-realphoto-2026/staged-curate')
hp = json.load(open(os.path.join(ROOT, '../Demo/_regen-hero-picks.json'), encoding='utf-8'))

def enc(path, box=210):
    try:
        im = Image.open(path).convert('RGB'); im.thumbnail((box, box))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=80)
        return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    except Exception: return None

def studio_best(sku):
    b = hp.get(sku, {})
    if b and b.get('file'):
        p = os.path.join(STUDIO, sku, b['file'])
        if os.path.exists(p): return p
    v = sorted(glob.glob(os.path.join(STUDIO, sku, 'gemini-*.jpg')))
    return v[0] if v else None

def src_hero(sku):
    d = os.path.join(CUR, sku)
    if not os.path.isdir(d): return None
    fs = sorted(f for f in os.listdir(d) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))
    h = next((f for f in fs if 'hero' in f.lower()), fs[0] if fs else None)
    return os.path.join(d, h) if h else None

# A) baked-in text/watermark
dirty = ['EX120', 'EX121', 'EX113', 'EX173']            # spec/LOGO on product
thaikij = ['EX164', 'EX165', 'EX167', 'EX169', 'EX171']  # www.thaikij.com watermark (already held offline)
def card_A(sku, reason):
    p = db.get(sku, {})
    s = enc(src_hero(sku)); g = enc(studio_best(sku))
    sh = f'<figure><figcaption>รูปซัพ</figcaption><img src="{s}"></figure>' if s else ''
    gh = f'<figure><figcaption>gen (ยังติด)</figcaption><img src="{g}"></figure>' if g else '<div class="noimg">พักออกเว็บแล้ว</div>'
    return f'<div class="card"><div class="hd"><b>{sku}</b> {p.get("name","")} <span class="cat">{p.get("category","")}</span></div><div class="imgs">{sh}{gh}</div><div class="why">❌ {reason}</div></div>'

# B) placeholder colours
ph = []
for sku, p in db.items():
    cols = p.get('colors') or []
    if len(cols) == 1 and any(k in str(cols[0]) for k in ['สี', 'color']) or (len(cols) == 1 and str(cols[0]).strip().isdigit()):
        ph.append((sku, p.get('name', ''), p.get('category', ''), cols[0]))

secA = ''.join(card_A(s, 'สเปค/แบรนด์/LOGO พิมพ์ติดตัวสินค้าในรูปซัพทุกใบ — AI ลบไม่ออก') for s in dirty)
secTH = ''.join(card_A(s, 'watermark www.thaikij.com คร่อมปก+หน้ากระดาษ — ลบไม่ออก (พักออกเว็บแล้ว)') for s in thaikij)
rowsB = ''.join(f'<tr><td class="sku">{s}</td><td>{n}</td><td>{c}</td><td class="ph">{v}</td></tr>' for s, n, c, v in sorted(ph))

html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express — รายการที่ติดค้าง</title><link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{font-family:'Anuphan',sans-serif;background:#eceae4;color:#13244a;padding:22px}}
.wrap{{max-width:1100px;margin:0 auto}}h1{{font-size:24px}}.sub{{color:#6b7280;margin:4px 0 14px}}
h2{{font-size:19px;margin:24px 0 10px;padding-left:10px;border-left:5px solid #d05a5a}}
h2.b{{border-color:#c98a00}}
.card{{background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:11px;box-shadow:0 1px 4px rgba(0,0,0,.05)}}
.hd{{font-size:14px;margin-bottom:8px}}.cat{{background:#eef1f6;color:#41557c;padding:1px 8px;border-radius:99px;font-size:12px;margin-left:6px}}
.imgs{{display:flex;gap:12px}}figure figcaption{{font-size:11px;color:#9aa;text-align:center;margin-bottom:3px}}
figure img{{width:190px;height:190px;object-fit:cover;border-radius:8px;border:2px solid #e0a3a3}}
.noimg{{width:190px;height:190px;display:flex;align-items:center;justify-content:center;background:#faf7f2;border:1px dashed #ccc;border-radius:8px;color:#bbb;font-size:12px}}
.why{{margin-top:8px;color:#b04a4a;font-size:13px;background:#fff2f2;padding:6px 10px;border-radius:8px}}
table{{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;font-size:14px}}
th,td{{padding:8px 10px;text-align:left;border-bottom:1px solid #eef1f4}}th{{background:#13244a;color:#fff}}
td.sku{{font-weight:700;color:#41557c}}td.ph{{color:#c98a00;font-weight:700}}
.box{{background:#fffbe9;border:1px solid #f4e2a8;border-radius:10px;padding:10px 14px;font-size:13px;margin:6px 0 14px}}</style></head>
<body><div class="wrap">
<h1>สินค้าส่งด่วน — รายการที่ยัง “ติดค้าง”</h1>
<div class="sub">สรุปทุกตัวที่ยังแก้ไม่จบ + สาเหตุ + ต้องตัดสินใจอะไร</div>

<h2>A) text/watermark ฝังในตัวสินค้า — AI ลบไม่ออก ({len(dirty)+len(thaikij)})</h2>
<div class="box">รูปซัพมีตัวหนังสือ (สเปค/แบรนด์/LOGO/URL) ปั๊ม/พิมพ์ติดกับตัวสินค้าเลย ไม่ใช่ overlay → Gemini restyle มองเป็นส่วนหนึ่งของสินค้า เก็บไว้เสมอ (เหมือนเคส REMAX)<br>
<b>ทางออก:</b> (ก) ขอรูปซัพหน้าเรียบ → gen ใหม่ · (ข) พักออกเว็บ · (ค) ยอมรับ (powerbank จริงมีสเปค)</div>
{secA}
{secTH}

<h2 class="b">B) สีเป็น placeholder ใน Product Detail — ทำ group รวมสีไม่ได้ ({len(ph)})</h2>
<div class="box">Master ระบุ “จำนวนสี” แทนชื่อสีจริง เลยไม่รู้ว่ามีสีอะไรบ้าง → ทำรูปรวมสีให้ตรง detail ไม่ได้ (ตามกฎที่คุณสั่งให้หยุดคุยก่อน)<br>
<b>ทางออก:</b> ให้ผมนับ/ระบุสีจากรูปซัพจริงมาเติม detail · หรือคุณส่งลิสต์สีจริง · หรือข้าม group</div>
<table><thead><tr><th>SKU</th><th>ชื่อ</th><th>หมวด</th><th>colors ใน master</th></tr></thead><tbody>{rowsB}</tbody></table>
</div></body></html>'''
OUT = os.path.join(ROOT, '../Demo/EXPRESS-STUCK.html')
open(OUT, 'w', encoding='utf-8').write(html)
print(f'wrote {os.path.relpath(OUT)} — baked-text {len(dirty)+len(thaikij)}, placeholder-colours {len(ph)}')
