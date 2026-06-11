// ============================================================
// GO PREMIUM — LINE OA posts, "people / lifestyle" set  [FREE]
// 5 square 1080x1080: free stock photo background + brand overlay (HTML->PNG).
// Master Final CI · maps to the 5 wedges in docs/MARKETING-STRATEGY.md.
// Output: content/line-posts/people/post-N.png + review.html
// Run: node scripts/gen-line-posts-people.mjs
// ============================================================
import sharp from 'sharp';
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const CAND = join(REPO, 'content', 'line-posts', '_compare', 'cand');
const OUT = join(REPO, 'content', 'line-posts', 'people');
mkdirSync(OUT, { recursive: true });

const LOGO = 'data:image/png;base64,' +
  readFileSync('C:/Users/Golf/Gopremium-website/Gopremium new version/Logo/GoPremium Logo white-yellow.png').toString('base64');

const POSTS = [
  { id: 1, src: 'p1a.jpg', pos: 'top',
    eyebrow: 'TRANSPARENT PRICING',
    headline: 'เห็นราคา<br>เห็นงานจริง<br><span class="g">สั่งได้เลย</span>',
    sub: 'ของขวัญองค์กรพรีเมียม ที่ไม่ต้องรอใบเสนอราคาเป็นวัน',
    cta: 'ทักแชทรับราคาเลย' },
  { id: 2, src: 'p2a.jpg', pos: 'center',
    eyebrow: 'GO PREMIUM EXPRESS',
    headline: 'ของด่วน?<br><span class="g">เราส่งทันงาน</span>',
    sub: 'คัดสินค้าพร้อมส่ง สกรีนโลโก้ไว ทันทุกอีเวนต์สำคัญ',
    cta: 'สอบถามเวลาส่งได้เลย' },
  { id: 3, src: 'cand-d.jpg', pos: 'attention',
    eyebrow: 'WELCOME KIT',
    headline: 'ชุดต้อนรับ<br>พนักงานใหม่<br><span class="g">ที่เขาจะจำได้</span>',
    sub: 'ชุดของขวัญพรีเมียมพร้อมโลโก้บริษัท ประทับใจตั้งแต่วันแรก',
    cta: 'ทักแชทจัดชุดให้เลย' },
  { id: 4, src: 'p4a.jpg', pos: 'center',
    eyebrow: 'YOUR BRAND, ELEVATED',
    headline: 'ใส่โลโก้คุณ<br><span class="g">เห็นภาพก่อนผลิต</span>',
    sub: 'ขอ mockup งานจริงก่อนตัดสินใจ ดีไซน์คมทุกชิ้น',
    cta: 'ส่งโลโก้มาดู mockup' },
  { id: 5, src: 'p2b.jpg', pos: 'center', exclusive: true,
    eyebrow: 'GO PREMIUM EXCLUSIVE',
    headline: 'งานบีสโปก<br><span class="g">ระดับ Super-VIP</span>',
    sub: 'Royal Navy + Champagne Gold ออกแบบเฉพาะแบรนด์คุณ',
    cta: 'ปรึกษางานบีสโปก' },
];

async function bg(p) {
  const out = join(OUT, `bg-${p.id}.jpg`);
  await sharp(join(CAND, p.src)).resize(1080, 1080, { fit: 'cover', position: p.pos }).jpeg({ quality: 88 }).toFile(out);
  return out;
}

function html(bgPath, p) {
  const ex = !!p.exclusive;
  const GOLD = ex ? '#cbb06f' : '#f4b223', GOLD2 = ex ? '#e6d6a8' : '#f8ce5a';
  const inkOnGold = ex ? '#0a1530' : '#0e1d3a';
  const data = 'data:image/jpeg;base64,' + readFileSync(bgPath).toString('base64');
  return `<!doctype html><html lang="th"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500&family=Sora:wght@600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1080px}
.card{position:relative;width:1080px;height:1080px;overflow:hidden;font-family:'IBM Plex Sans Thai',sans-serif;color:#fff}
.photo{position:absolute;inset:0;background:url('${data}') center/cover}
.tint{position:absolute;inset:0;background:
  linear-gradient(180deg, rgba(14,29,58,.55) 0%, rgba(14,29,58,.10) 28%, rgba(14,29,58,.80) 64%, rgba(14,29,58,.97) 100%),
  linear-gradient(0deg, rgba(14,29,58,.20), rgba(14,29,58,.20))}
.frame{position:absolute;inset:40px;border:1.5px solid ${ex?'rgba(203,176,111,.40)':'rgba(244,178,35,.40)'};border-radius:24px;pointer-events:none}
.inner{position:absolute;inset:0;padding:84px;display:flex;flex-direction:column;height:100%}
.top{display:flex;align-items:center;justify-content:space-between}
.logo{height:52px}
.eyebrowR{font-family:'Sora',sans-serif;font-weight:600;font-size:20px;letter-spacing:.28em;color:${GOLD};text-transform:uppercase}
.bottom{margin-top:auto}
.kicker{display:inline-flex;align-items:center;gap:14px;margin-bottom:22px}
.kicker .bar{width:58px;height:4px;border-radius:4px;background:linear-gradient(90deg,${GOLD},${GOLD2})}
.kicker .lbl{font-family:'Sora',sans-serif;font-weight:600;font-size:19px;letter-spacing:.24em;color:${GOLD};text-transform:uppercase}
h1{font-family:'Anuphan',sans-serif;font-weight:700;font-size:84px;line-height:1.06;letter-spacing:-.5px;text-shadow:0 2px 22px rgba(0,0,0,.4)}
h1 .g{background:linear-gradient(92deg,${GOLD},${GOLD2});-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.sub{font-weight:400;font-size:31px;line-height:1.5;color:#e6ecf7;max-width:800px;margin-top:26px;text-shadow:0 1px 12px rgba(0,0,0,.45)}
.row{display:flex;align-items:center;justify-content:space-between;margin-top:38px}
.cta{display:inline-flex;align-items:center;gap:14px;background:linear-gradient(92deg,${GOLD},${GOLD2});color:${inkOnGold};
  font-family:'Sora',sans-serif;font-weight:700;font-size:27px;padding:21px 38px;border-radius:999px;box-shadow:0 8px 30px rgba(0,0,0,.4)}
.cta .ic{width:31px;height:31px;border-radius:8px;background:${inkOnGold};display:flex;align-items:center;justify-content:center;color:${GOLD};font-size:17px}
.url{font-family:'Sora',sans-serif;font-weight:600;font-size:22px;color:#cdd6ea}
</style></head><body>
<div class="card">
  <div class="photo"></div><div class="tint"></div><div class="frame"></div>
  <div class="inner">
    <div class="top"><img class="logo" src="${LOGO}" alt="GO PREMIUM">
      <div class="eyebrowR">${ex ? 'EXCLUSIVE' : 'CORPORATE GIFTS'}</div></div>
    <div class="bottom">
      <div class="kicker"><span class="bar"></span><span class="lbl">${p.eyebrow}</span></div>
      <h1>${p.headline}</h1>
      <div class="sub">${p.sub}</div>
      <div class="row"><div class="cta"><span class="ic">↗</span> ${p.cta}</div><div class="url">gopremium.co.th</div></div>
    </div>
  </div>
</div></body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 2 });
for (const p of POSTS) {
  const bgPath = await bg(p);
  await page.setContent(html(bgPath, p), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.locator('.card').screenshot({ path: join(OUT, `post-${p.id}.png`) });
  console.log(`OK post-${p.id} (${p.src})`);
}
await browser.close();

const cards = POSTS.map(p => {
  const d = 'data:image/png;base64,' + readFileSync(join(OUT, `post-${p.id}.png`)).toString('base64');
  return `<figure><img src="${d}"><figcaption><b>Post ${p.id}</b> — ${p.eyebrow}</figcaption></figure>`;
}).join('\n');
writeFileSync(join(OUT, 'review.html'), `<!doctype html><meta charset="utf-8"><title>GO PREMIUM — LINE posts (people)</title>
<style>body{margin:0;background:#0e1d3a;color:#f6f8fc;font-family:system-ui,'Segoe UI',sans-serif;padding:40px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:26px;margin-top:20px}
figure{margin:0;background:#13244a;border:1px solid rgba(244,178,35,.25);border-radius:16px;padding:14px}
img{width:100%;border-radius:10px;display:block}figcaption{margin-top:10px;font-size:15px;color:#cdd6ea}b{color:#f4b223}</style>
<h1>GO PREMIUM — LINE@ Posts · แนวมีคน/ไลฟ์สไตล์ (สต็อกฟรี + overlay แบรนด์)</h1>
<div class="grid">${cards}</div>`);
console.log('OK review.html\nDONE');
