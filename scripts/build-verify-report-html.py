# -*- coding: utf-8 -*-
"""AI QA report (visual) from Demo/express-verify-report.json -> Demo/EXPRESS-QA-REPORT.html"""
import json, os, re, glob, base64, io
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
R = json.load(open(os.path.join(ROOT, '../Demo/express-verify-report.json'), encoding='utf-8'))
gen = json.load(open(os.path.join(ROOT, 'src/data/product-images.generated.json'), encoding='utf-8'))
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
old_live = set(json.load(open(os.environ['OLD_LIVE'])))
OUT = os.path.join(ROOT, '../Demo/EXPRESS-QA-REPORT.html')

def thumb(path, box=200):
    try:
        im = Image.open(path).convert('RGB'); im.thumbnail((box, box))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=80)
        return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    except Exception: return None

def hero_path(sku):
    g = gen.get(sku, {});
    if not g.get('gallery'): return None
    return os.path.join(ROOT, 'public', g['gallery'][0].split('?')[0].lstrip('/'))

def group_path(sku):
    f = sorted(glob.glob(os.path.join(STUDIO, sku, 'group-*.jpg')))
    return f[0] if f else None

allr = R['all']
heroes = [x for x in allr if x['kind'] == 'hero']
groups = [x for x in allr if x['kind'] == 'group']
def bad(x): return not (x['clean'] and x['color_natural'] and x['upright'] and x['studio_ok'])
def is_wm(x):
    i = (x['issue'] or '').lower(); return 'watermark' in i and '.com' not in i and 'url' not in i and 'website' not in i and 'thaikij' not in i

new_def = [x for x in heroes if bad(x) and x['sku'] not in old_live]
old_wm = [x for x in heroes if bad(x) and x['sku'] in old_live and is_wm(x)]
old_other = [x for x in heroes if bad(x) and x['sku'] in old_live and not is_wm(x)]
badbg_grp = [x for x in groups if x['is_multicolor_group'] and x['studio_ok'] == False]
passed = [x for x in heroes if not bad(x)]

def card(x, pathfn, tag):
    t = thumb(pathfn(x['sku']))
    img = f'<img src="{t}">' if t else '<div class="noimg">—</div>'
    return f'<figure><figcaption><b>{x["sku"]}</b> · {x["issue"] or tag}</figcaption>{img}</figure>'

def grid(items, pathfn, tag):
    return '<div class="grid">' + ''.join(card(x, pathfn, tag) for x in items) + '</div>'

html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Express — AI QA Report</title>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{font-family:'Anuphan',sans-serif;background:#eceae4;color:#13244a;padding:22px}}
.wrap{{max-width:1200px;margin:0 auto}}h1{{font-size:24px}}.sub{{color:#6b7280;margin:4px 0 16px}}
h2{{font-size:18px;margin:24px 0 10px;padding-left:10px;border-left:5px solid #f4b223}}
.stats{{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px}}
.stat{{background:#13244a;color:#fff;border-radius:10px;padding:12px 16px;flex:1;min-width:130px}}.stat b{{font-size:24px;display:block;color:#f4b223}}.stat.ok b{{color:#7CFFB2}}.stat.bad b{{color:#ff9a9a}}
.grid{{display:flex;gap:10px;flex-wrap:wrap}}figure{{width:150px;text-align:center}}figcaption{{font-size:10px;color:#6b7280;margin-bottom:4px;min-height:26px}}figcaption b{{color:#b04a4a}}
figure img{{width:150px;height:150px;object-fit:cover;border-radius:8px;border:2px solid #e0a3a3}}
.noimg{{width:150px;height:150px;background:#faf7f2;border:1px dashed #ccc;border-radius:8px}}
.note{{background:#fffbe9;border:1px solid #f4e2a8;border-radius:10px;padding:10px 14px;font-size:13px;margin:8px 0 14px}}</style></head>
<body><div class="wrap">
<h1>สินค้าส่งด่วน — รายงาน AI QA (ตรวจทุกรูป)</h1>
<div class="sub">Gemini vision ตรวจ {R["imagesChecked"]} รูป (hero + group) ของ {R["express"]} SKU · เครื่องมือรันซ้ำได้: <code>node scripts/verify-express-images.mjs</code></div>
<div class="stats">
<div class="stat ok">ผ่าน<b>{len(passed)}</b>hero สะอาด</div>
<div class="stat bad">รูปใหม่มีปัญหา<b>{len(new_def)}</b>ต้อง regen</div>
<div class="stat bad">group พื้นหลังเสีย<b>{len(badbg_grp)}</b>regen</div>
<div class="stat">watermark เก่า (GP)<b>{len(old_wm)}</b>ตัดสินใจ</div>
<div class="stat ok">group หลายสีเพิ่มแล้ว<b>45</b>live</div>
</div>
<div class="note">🔴 <b>ต้องแก้:</b> รูปใหม่ {len(new_def)} ตัวยังมี text/watermark ซัพหลงเหลือ (เช่น www.thaikij.com, สเปค powerbank, "LOGO") + group พื้นหลังเสีย {len(badbg_grp)} ตัว → regen เลือก variant สะอาด<br>
🟡 <b>ตัดสินใจ:</b> รูปเก่า {len(old_wm)} ตัวมี watermark "GO PREMIUM" กลางรูป (ของเดิม อาจตั้งใจกันก็อป) — จะเก็บไว้ หรือ regen ให้สะอาด?</div>

<h2>🔴 รูปใหม่มีปัญหา — ต้อง regen ({len(new_def)})</h2>
{grid(new_def, hero_path, 'ปัญหา')}

<h2>🔴 group พื้นหลังไม่ใช่สตูดิโอ — regen ({len(badbg_grp)})</h2>
{grid(badbg_grp, group_path, 'พื้นหลังเสีย')}

<h2>🟡 รูปเก่า: watermark GO PREMIUM กลางรูป ({len(old_wm)}) — ตัวอย่าง 12 ตัวแรก</h2>
{grid(old_wm[:12], hero_path, 'GP watermark')}

<h2>⚠️ อื่นๆ ({len(old_other)})</h2>
{grid(old_other, hero_path, 'อื่นๆ')}
</div></body></html>'''
open(OUT, 'w', encoding='utf-8').write(html)
print(f'wrote {os.path.relpath(OUT)} — new_def {len(new_def)}, badbg_grp {len(badbg_grp)}, old_wm {len(old_wm)}, passed {len(passed)}')
