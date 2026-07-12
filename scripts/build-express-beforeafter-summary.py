# -*- coding: utf-8 -*-
"""
Comprehensive BEFORE / AFTER summary of the Express (สินค้าส่งด่วน) master rollout:
  - 67 NEW SKUs: supplier source photo -> published GoPremium studio photo (visual)
  - 62 UPDATED SKUs: old name / "สอบถามราคา" -> new name / ฿@300 (table)
  - 31 REMOVED SKUs
  - backend Google Sheet (129)
Self-contained HTML (thumbnails base64, downscaled) -> Demo/EXPRESS-BEFORE-AFTER.html
"""
import json, os, re, glob, base64, io
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
DB = os.path.join(ROOT, '../Demo/express-master-DB.json')
BEFORE = os.environ['BEFORE_RAW']
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
CUR = os.path.join(ROOT, 'express-realphoto-2026/staged-curate')
IMGROOT = os.path.join(ROOT, 'public/images/products')
OUT = os.path.join(ROOT, '../Demo/EXPRESS-BEFORE-AFTER.html')

db = json.load(open(DB, encoding='utf-8'))
before = {p['sku']: p for p in json.load(open(BEFORE, encoding='utf-8'))}
v2 = open(os.path.join(ROOT, 'public/v2.html'), encoding='utf-8').read()
now_live = json.loads(re.search(r'const EXPRESS_SKUS=(\[[^\]]*\]);', v2).group(1))
now_set = set(now_live)

CATSLUG = {'Drinkware': 'drinkware', 'Garment': 'garment', 'Powerbank': 'powerbank',
           'Fan': 'fan', 'Lifestyle': 'lifestyle', 'Souvenir': 'souvenir',
           'Stationery': 'stationery'}

def thumb(path, box=230):
    try:
        im = Image.open(path).convert('RGB')
        im.thumbnail((box, box))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=80)
        return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    except Exception:
        return None

def source_for(sku):
    d = os.path.join(CUR, sku)
    if not os.path.isdir(d): return None
    fs = [f for f in os.listdir(d) if re.search(r'\.(jpg|jpeg|png|webp)$', f, re.I)]
    hero = next((f for f in fs if 'hero' in f.lower()), None) \
        or next((f for f in sorted(fs) if not re.search(r'chart|size|detail|lineup|group', f, re.I)), None) \
        or (sorted(fs)[0] if fs else None)
    return os.path.join(d, hero) if hero else None

# --- classify against the OLD LIVE DISPLAY set (93 EXPRESS_SKUS before) ---
old_live = set(json.load(open(os.environ['OLD_LIVE'], encoding='utf-8')))  # 93 displayed before
db_skus = {p['sku'] for p in db}
removed = sorted([s for s in old_live if s not in db_skus])   # 31 dropped from live display
new = [p for p in db if p['sku'] not in old_live]             # 67 new to the page
updated = [p for p in db if p['sku'] in old_live]             # 62 kept & refreshed

# NEW cards: source -> published
new_cards = []
for p in sorted(new, key=lambda x: x['sku']):
    sku = p['sku']
    catslug = CATSLUG.get(p['category'], p['category'].lower())
    slug = f'{sku.lower()}-{catslug}'
    pub = os.path.join(IMGROOT, slug, f'{slug}-square.jpg')
    if not os.path.exists(pub):
        continue
    src = source_for(sku)
    src_t = thumb(src) if src else None
    pub_t = thumb(pub)
    price = p.get('price_display')
    ps = f'฿{price}' if price else 'สอบถามราคา'
    src_html = f'<img src="{src_t}">' if src_t else '<div class="noimg">—</div>'
    new_cards.append(f'''<div class="ba">
      <div class="ba-h"><b>{sku}</b> {p.get('name','')} <span class="pill">{p['category']}</span><span class="pr">{ps}<small>@300</small></span></div>
      <div class="ba-imgs"><figure><figcaption>รูปซัพเดิม</figcaption>{src_html}</figure>
      <div class="arrow">→</div>
      <figure><figcaption>สตูดิโอ GoPremium</figcaption><img src="{pub_t}"></figure></div>
    </div>''')

# UPDATED table
up_rows = []
for p in sorted(updated, key=lambda x: x['sku']):
    sku = p['sku']; b = before[sku]
    oldp = b.get('price_300_thb'); ops = f'฿{oldp}' if oldp else '<i>สอบถามราคา</i>'
    np = p.get('price_display'); nps = f'฿{np}' if np else '—'
    ncol = len(p.get('colors', []))
    up_rows.append(f'''<tr><td class="sku">{sku}</td>
      <td>{b.get('name','')}</td><td class="new">{p.get('name','')}</td>
      <td class="old">{ops}</td><td class="new">{nps}</td>
      <td>{ncol} สี</td><td>{p.get('lead_gp','')}</td></tr>''')

# REMOVED
rem_items = ''.join(f'<span class="rem">{s} · {before.get(s,{}).get("name","")}</span>' for s in removed)

html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express — สรุปก่อน/หลัง</title>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Anuphan',sans-serif;background:#f4f1ec;color:#13244a;padding:24px;line-height:1.5}}
.wrap{{max-width:1100px;margin:0 auto}}
h1{{font-size:26px}} h2{{font-size:20px;margin:28px 0 12px;border-left:5px solid #f4b223;padding-left:10px}}
.sub{{color:#6b7280;margin:4px 0 18px}}
.stats{{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px}}
.stat{{background:#13244a;color:#fff;border-radius:12px;padding:14px 18px;flex:1;min-width:150px}}
.stat b{{font-size:26px;color:#f4b223;display:block}}
.stat.g b{{color:#7CFFB2}}
.ba{{background:#fff;border-radius:12px;padding:12px 14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.05)}}
.ba-h{{font-size:14px;margin-bottom:8px}} .ba-h .pill{{background:#eef1f6;color:#41557c;padding:1px 8px;border-radius:99px;font-size:12px;margin-left:6px}}
.ba-h .pr{{float:right;color:#b8860b;font-weight:700}} .pr small{{font-weight:400;color:#9aa;margin-left:3px}}
.ba-imgs{{display:flex;align-items:center;gap:14px}}
figure{{text-align:center}} figcaption{{font-size:11px;color:#8a94a6;margin-bottom:4px}}
figure img{{width:200px;height:200px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb}}
figure:last-child img{{border:2px solid #f4b223}}
.arrow{{font-size:26px;color:#b8860b;font-weight:700}}
.noimg{{width:200px;height:200px;display:flex;align-items:center;justify-content:center;background:#faf7f2;border:1px dashed #ccc;border-radius:8px;color:#bbb}}
table{{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;font-size:13px}}
th,td{{padding:7px 9px;text-align:left;border-bottom:1px solid #eef1f4}}
th{{background:#13244a;color:#fff;font-weight:600;position:sticky;top:0}}
td.sku{{font-weight:700;color:#41557c}} td.new{{color:#0a7d43;font-weight:600}} td.old{{color:#9aa}} td.old i{{color:#c98a00}}
.rem{{display:inline-block;background:#fff;border:1px solid #f0d9d9;color:#b04a4a;border-radius:99px;padding:3px 10px;margin:3px;font-size:12px}}
.legend{{background:#fffbe9;border:1px solid #f4e2a8;border-radius:10px;padding:10px 14px;font-size:13px;margin-bottom:14px}}
</style></head><body><div class="wrap">
<h1>สินค้าส่งด่วน (Express) — สรุปก่อน / หลัง</h1>
<div class="sub">อัปเดตจากไฟล์มาสเตอร์ final · ขึ้น live แล้วบน Vercel (โดเมนไทย + gopremium-website.vercel.app) · Backend อยู่ใน Google Sheet</div>
<div class="stats">
  <div class="stat">แสดงบนเว็บ<b>93 → {len(now_live)}</b>SKU (net +{len(now_live)-93})</div>
  <div class="stat g">SKU ใหม่<b>+{len(new_cards)}</b>พร้อมรูปสตูดิโอ</div>
  <div class="stat">อัปเดตข้อมูล<b>{len(updated)}</b>ราคา @300 + สี/ไซซ์</div>
  <div class="stat">ถอดออก<b>{len(removed)}</b>ไม่อยู่ในมาสเตอร์</div>
  <div class="stat">Backend Sheet<b>129</b>ครบทุกตัว</div>
</div>
<div class="legend">💰 ต้นทุน AI restyle รูป 67 ตัวใหม่ ≈ <b>฿348</b> (~268 รูป @ ฿1.3) · ราคาโชว์เว็บ = <b>@300 ชิ้น</b> ทั้งหมด · ลบแบรนด์ซัพ + นางแบบไทยใหม่ + สีตรง + ไอคอน gift</div>

<h2>1) สินค้าใหม่ {len(new_cards)} รายการ — รูปซัพเดิม → รูปสตูดิโอ GoPremium (ขึ้นใหม่)</h2>
{''.join(new_cards)}

<h2>2) สินค้าเดิม {len(updated)} รายการ — อัปเดตชื่อ + ราคา @300 + สี</h2>
<table><thead><tr><th>SKU</th><th>ชื่อเดิม</th><th>ชื่อใหม่</th><th>ราคาเดิม</th><th>ราคาใหม่ @300</th><th>สี</th><th>Lead</th></tr></thead>
<tbody>{''.join(up_rows)}</tbody></table>

<h2>3) ถอดออก {len(removed)} รายการ (ไม่อยู่ในไฟล์มาสเตอร์)</h2>
<div>{rem_items}</div>

<h2>4) Backend — Google Sheet tab “⚡ สินค้าส่งด่วน (Express)”</h2>
<div class="sub">129 SKU ครบ พร้อม cost tiers, ต้นทุน/ชิ้น (AC), Lead ร้าน (V) internal, ราคา @100/300/500/1000, สี/ไซซ์, ซัพพลายเออร์ — เป็น single source of truth ฝั่งหลังบ้าน</div>
</div></body></html>'''

open(OUT, 'w', encoding='utf-8').write(html)
print(f'wrote {os.path.relpath(OUT)} — new {len(new_cards)}, updated {len(updated)}, removed {len(removed)}, {os.path.getsize(OUT)//1024} KB')
