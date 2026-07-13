# -*- coding: utf-8 -*-
"""One-page decision report for the express image re-do: status + stuck items (with
photos) + options & costs + recommendation. -> Demo/EXPRESS-DECISION-REPORT.html"""
import json, os, glob, base64, io
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
db = {p['sku']: p for p in json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))}
STUDIO = os.path.join(ROOT, 'scripts/image-pipeline/staged/studio-ab')
hp = json.load(open(os.path.join(ROOT, '../Demo/_regen-hero-picks.json'), encoding='utf-8'))

def enc(path, box=200):
    try:
        im = Image.open(path).convert('RGB'); im.thumbnail((box, box))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=80)
        return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
    except Exception: return None

def best_img(sku):
    b = hp.get(sku, {})
    p = os.path.join(STUDIO, sku, b['file']) if b and b.get('file') else None
    if p and os.path.exists(p): return enc(p)
    v = sorted(glob.glob(os.path.join(STUDIO, sku, 'gemini-*.jpg')))
    return enc(v[0]) if v else None

dirty = {'EX120': 'สเปค/ตัวเลขพิมพ์กระจายทั่วตัว', 'EX121': 'สเปคพิมพ์ข้างตัว',
         'EX113': 'สเปค+label พิมพ์หน้า+ข้าง', 'EX173': '"LOGO" placeholder พิมพ์บนสินค้า'}
thaikij = {'EX164': '', 'EX165': '', 'EX167': '', 'EX169': '', 'EX171': ''}

def chips(d, kind):
    out = ''
    for sku, why in d.items():
        img = best_img(sku); p = db.get(sku, {})
        ih = f'<img src="{img}">' if img else '<div class="noimg">พักออกเว็บ</div>'
        out += f'<figure><figcaption><b>{sku}</b> {p.get("name","")[:20]}</figcaption>{ih}<div class="cap">{why or kind}</div></figure>'
    return out

html = f'''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Express — รายงานสรุป & ตัดสินใจ</title><link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{{box-sizing:border-box;margin:0;padding:0}}body{{font-family:'Anuphan',sans-serif;background:#eef0f4;color:#13244a;padding:22px;line-height:1.55}}
.wrap{{max-width:980px;margin:0 auto}}
.hero{{background:linear-gradient(135deg,#13244a,#20386b);color:#fff;border-radius:16px;padding:22px 26px;margin-bottom:16px}}
.hero h1{{font-size:25px}}.hero p{{color:#c9d3e8;margin-top:4px}}
.stats{{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}}
.stat{{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.14);border-radius:11px;padding:11px 15px;flex:1;min-width:120px}}
.stat b{{font-size:23px;display:block;color:#f4b223}}.stat.ok b{{color:#7CFFB2}}.stat span{{font-size:12px;color:#c9d3e8}}
h2{{font-size:20px;margin:22px 0 10px;padding-left:11px;border-left:5px solid #f4b223}}
.card{{background:#fff;border-radius:14px;padding:16px 18px;margin-bottom:14px;box-shadow:0 1px 5px rgba(0,0,0,.06)}}
.gal{{display:flex;gap:12px;flex-wrap:wrap;margin:6px 0}}
figure{{width:150px;text-align:center}}figure img{{width:150px;height:150px;object-fit:cover;border-radius:9px;border:2px solid #e0a3a3}}
figcaption{{font-size:11px;color:#41557c;margin-bottom:4px}}.cap{{font-size:10px;color:#b04a4a;margin-top:3px}}
.noimg{{width:150px;height:150px;display:flex;align-items:center;justify-content:center;background:#f6f4ef;border:1px dashed #ccc;border-radius:9px;color:#aaa;font-size:11px}}
table{{width:100%;border-collapse:collapse;font-size:14px;margin-top:8px}}
th,td{{padding:9px 11px;text-align:left;border-bottom:1px solid #eef1f4;vertical-align:top}}
th{{background:#13244a;color:#fff}}td.p{{font-weight:700;white-space:nowrap}}
.rec{{background:#7CFFB2;color:#0a4d2a}}.mid{{color:#c98a00}}.low{{color:#b04a4a}}
.pill{{display:inline-block;font-size:11px;font-weight:700;padding:2px 9px;border-radius:99px}}
.pill.g{{background:#e3fbec;color:#0a7d43}}.pill.y{{background:#fff5db;color:#b8860b}}.pill.r{{background:#ffeaea;color:#c0392b}}
.reco{{background:#f0f9f2;border:1.5px solid #b9e6c8;border-radius:12px;padding:14px 18px;margin-top:8px;font-size:14px}}
.ask{{background:#fffbe9;border:1.5px solid #f4e2a8;border-radius:12px;padding:14px 18px;margin-top:14px;font-size:14px}}
.muted{{color:#6b7280;font-size:13px}}
</style></head><body><div class="wrap">

<div class="hero">
  <h1>สินค้าส่งด่วน — รายงานสรุป & สิ่งที่ต้องตัดสินใจ</h1>
  <p>โปรเจกต์ปรับรูป Express จากรูปต้นทางจริง (Google Drive + 1688) · อัปเดต {13} ก.ค. 2026</p>
  <div class="stats">
    <div class="stat ok"><b>124</b><span>SKU live บนเว็บ</span></div>
    <div class="stat ok"><b>8</b><span>hero แก้ใหม่แล้ว (จากรูปจริง)</span></div>
    <div class="stat ok"><b>45</b><span>รูปรวมสีในแกลเลอรี</span></div>
    <div class="stat"><b>1,023</b><span>รูปต้นทางดึงครบ (Drive+1688)</span></div>
    <div class="stat"><b>9</b><span>ยังติด (ตัดสินใจด้านล่าง)</span></div>
  </div>
</div>

<h2>✅ ที่ทำเสร็จแล้ว (live)</h2>
<div class="card">
  <div class="muted" style="margin-bottom:6px">แก้จากต้นตอ: รอบแรกใช้รูปฝังไฟล์ Excel รูปเดียว → รอบนี้ดึงรูปจริงครบจาก Drive/1688 (1,023 รูป) → AI คัด 5 รูปที่สุด → gen ใหม่ → verify ก่อนขึ้น</div>
  <ul style="margin-left:18px">
    <li><b>8 hero แก้แล้ว:</b> EX097, EX022, EX138, EX144, EX148, EX154, EX172, EX174 — ตั้งตรง, เต็มตัว, ลบแบรนด์/พื้นโต๊ะ</li>
    <li><b>45 รูปรวมสี</b> (หลายสีในเฟรมเดียว) เพิ่มเข้าแกลเลอรี</li>
    <li><b>AI verifier ถาวร</b> — ตรวจทุกรูปก่อนขึ้นเว็บ ไม่ให้ตกหล่นอีก</li>
  </ul>
</div>

<h2>🔴 ยังติด — text/watermark ฝังในตัวสินค้า (9 ตัว)</h2>
<div class="card">
  <p class="muted">รูปซัพมีตัวหนังสือ (สเปค/แบรนด์/LOGO/URL) <b>พิมพ์ติดกับตัวสินค้าจริง</b> ไม่ใช่ overlay → AI restyle มองเป็นส่วนหนึ่งของสินค้า เก็บไว้เสมอ</p>
  <div class="gal">{chips(dirty, 'baked text')}</div>
  <div class="muted"><b>บนเว็บอยู่ 4 ตัว (powerbank/LOGO)</b> · พักออกแล้ว 5 ตัว (www.thaikij.com)</div>

  <h3 style="margin:14px 0 4px;font-size:16px">ตัวเลือก + ค่าใช้จ่าย</h3>
  <table>
    <tr><th>วิธี</th><th>ราคา</th><th>โอกาสสำเร็จ</th><th>หมายเหตุ</th></tr>
    <tr class="rec"><td class="p">2. ขอรูปซัพหน้าเรียบ → gen</td><td class="p">฿26</td><td><span class="pill g">สูง</span></td><td>รูปที่ไม่มีสเปค/LOGO/URL แล้วผม gen ให้ — <b>คุ้มสุด</b></td></tr>
    <tr><td class="p">1. Regen + prompt ลบ text แรงขึ้น</td><td class="p mid">~฿47</td><td><span class="pill y">ปานกลาง-ต่ำ</span></td><td>9 ตัว × 4 รูป — ไม่การันตี (text ฝังลึก)</td></tr>
    <tr><td class="p">3. Inpaint ลบ text (ฟรี)</td><td class="p">฿0</td><td><span class="pill r">ต่ำ</span></td><td>text กระจายทั่วตัว → เลอะ</td></tr>
    <tr><td class="p">4. ยอมรับ / พักไว้</td><td class="p">฿0</td><td>—</td><td>powerbank จริงก็มีสเปคติดตัว</td></tr>
  </table>
  <div class="reco"><b>💡 แนะนำ:</b> powerbank (EX120/121/113) ของจริงมีสเปคอยู่แล้ว → <b>ยอมรับ</b> หรือขอรูปหน้าเรียบ · ส่วน EX173 + thaikij 5 ตัว = mockup/watermark ซัพ → <b>ขอรูปซัพจริง</b> (วิธี 2, ฿26) ชัวร์สุด</div>
</div>

<h2>🟡 สีเป็น placeholder ใน Product Detail (~75 ตัว)</h2>
<div class="card">
  <p class="muted">Master ใส่ <b>"จำนวนสี"</b> แทนชื่อสีจริง (เช่น <span class="mid">"12 สี" / "15 สี"</span>) → ทำรูปรวมสีให้ตรง detail ไม่ได้ (ตามกฎที่คุณสั่งให้หยุดคุยก่อน)</p>
  <table>
    <tr><th>ตัวเลือก</th><th>ราคา</th><th>ผล</th></tr>
    <tr class="rec"><td class="p">ให้ AI นับสีจากรูปซัพจริง → เติมชื่อสีใน detail</td><td class="p">~฿10</td><td>ได้สีจริงครบ, รูปรวมสีตรง detail</td></tr>
    <tr><td class="p">คุณส่งลิสต์สีจริงจากซัพ</td><td class="p">฿0</td><td>แม่นสุด</td></tr>
    <tr><td class="p">ข้าม group รวมสีสำหรับตัวที่ไม่รู้สี</td><td class="p">฿0</td><td>โชว์แค่ hero</td></tr>
  </table>
</div>

<div class="ask"><b>❓ ขอคำตอบ 2 ข้อ:</b><br>
1. <b>9 ตัวที่ติด text</b> → เอาวิธีไหน? (แนะนำ: ขอรูปซัพหน้าเรียบ / หรือยอมรับ powerbank)<br>
2. <b>สี placeholder ~75 ตัว</b> → ให้ AI นับสีจากรูปจริงมาเติม detail (~฿10)? หรือส่งลิสต์เอง? หรือข้าม?</div>

<p class="muted" style="margin-top:14px">ค่าใช้จ่ายรอบ re-do ที่ผ่านมา: ดึงรูป (ฟรี) · AI คัดรูป ฿27 · gen 8 hero ฿62 · verify ฿12 — เว็บอัปเดต live แล้ว</p>
</div></body></html>'''
OUT = os.path.join(ROOT, '../Demo/EXPRESS-DECISION-REPORT.html')
open(OUT, 'w', encoding='utf-8').write(html)
print(f'wrote {os.path.relpath(OUT)} — {os.path.getsize(OUT)//1024} KB')
