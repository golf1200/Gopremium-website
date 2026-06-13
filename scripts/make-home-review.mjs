// One-off: self-contained review sheet for the home category + occasion covers.
// Reads public/images/home/*.jpg, embeds base64, groups by set, real aspect ratios.
// Out: ../20-AI-OUTPUT/home-images-review.html
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const SRC = join(REPO, 'public', 'images', 'home');
const OUT = join(REPO, '..', '20-AI-OUTPUT', 'home-images-review.html');

const CATS = [
  ['cat-drinkware', 'แก้ว & กระบอกน้ำ'], ['cat-bags', 'กระเป๋า & ถุงผ้า'],
  ['cat-stationery', 'เครื่องเขียน & สำนักงาน'], ['cat-fan', 'พัดลมพกพา & แกดเจ็ต'],
  ['cat-umbrella', 'ร่มพรีเมียม'], ['cat-giftset', 'กิฟต์เซ็ต'], ['cat-lifestyle', 'ไลฟ์สไตล์ & ของใช้'],
];
const OCCS = [
  ['occ-newyear', 'ของขวัญปีใหม่'], ['occ-welcome', 'ชุดต้อนรับพนักงานใหม่'],
  ['occ-vip', 'ของขวัญลูกค้า VIP'], ['occ-event', 'งานอีเวนต์ & สัมมนา'],
  ['occ-milestone', 'ครบรอบ & Milestone'], ['occ-eco', 'ของขวัญรักษ์โลก'],
];

const card = (key, label, ratio) => {
  const p = join(SRC, `${key}.jpg`);
  const b64 = readFileSync(p).toString('base64');
  const kb = (statSync(p).size / 1024).toFixed(0);
  return `<figure><img style="aspect-ratio:${ratio}" src="data:image/jpeg;base64,${b64}" alt="${label}"><figcaption><b>${label}</b><span>${key}.jpg · ${kb} KB</span></figcaption></figure>`;
};

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — รูปหน้าหลัก หมวด + โอกาส</title>
<style>
 :root{--navy:#13244a;--gold:#f4b223}
 *{box-sizing:border-box}
 body{margin:0;background:#eef1f6;color:var(--navy);font-family:"Segoe UI",system-ui,sans-serif}
 header{padding:28px 32px;background:var(--navy);color:#fff}
 h1{margin:0 0 6px;font-size:21px}
 header p{margin:0;color:#aebadc;font-size:13.5px}
 h2{margin:30px 32px 4px;font-size:16px;display:flex;align-items:center;gap:9px}
 h2::before{content:"";width:18px;height:3px;background:var(--gold);border-radius:2px}
 .sub{margin:0 32px 14px;color:#5b6577;font-size:12.5px}
 .grid{display:grid;gap:18px;padding:6px 32px 14px}
 .cat{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
 .occ{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
 figure{margin:0;background:#fff;border:1px solid #d9dfea;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(19,36,74,.06)}
 figure img{display:block;width:100%;object-fit:cover;background:#fff}
 figcaption{padding:11px 14px;display:flex;flex-direction:column;gap:2px}
 figcaption b{font-size:14px}
 figcaption span{color:#8a93a2;font-size:11px;font-family:ui-monospace,monospace}
 footer{padding:20px 32px 40px;color:#8a93a2;font-size:12px}
</style></head><body>
<header><h1>รูปหน้าหลัก — ปกหมวด (7) + โอกาส (6)</h1>
<p>13 ภาพ · gen ด้วย Gemini · โทน Studio สว่าง คุมโทน navy #13244a / gold #f4b223 · ฝังรูปในไฟล์ เปิดได้เลย</p></header>

<h2>ประเภทสินค้า — "เลือกหมวดที่ใช่" (สัดส่วน 1 : 0.82)</h2>
<p class="sub">ฉาก/แสง/พื้นหลัง/พร็อพชุดเดียวกันทั้ง 7 หมวด — แท่น navy + วงแหวน/ลูกบาศก์ทอง + พื้น off-white</p>
<div class="grid cat">${CATS.map(([k, l]) => card(k, l, '1/.82')).join('')}</div>

<h2>เลือกตามโอกาส — "ของขวัญองค์กรสำหรับทุกโอกาส" (สัดส่วน 16 : 10)</h2>
<p class="sub">แต่ละใบสื่อถึงวาระโอกาสนั้น ๆ คงโทน navy/gold เดียวกับหมวด</p>
<div class="grid occ">${OCCS.map(([k, l]) => card(k, l, '16/10')).join('')}</div>

<footer>ไฟล์รูปจริงอยู่ที่ website/public/images/home/ — ถ้าใบไหนอยากแก้ สั่ง regen เฉพาะใบได้ เช่น: node scripts/gen-home-images.mjs --force occ-vip</footer>
</body></html>`;

writeFileSync(OUT, html);
console.log(`OK -> ${OUT} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)}MB)`);
