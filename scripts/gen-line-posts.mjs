// ============================================================
// GO PREMIUM — LINE OA (Line@) post graphics generator  [FREE]
// 5 square 1080x1080 posts, exact Master Final CI, rendered HTML->PNG.
// Maps to the 5 differentiation wedges in docs/MARKETING-STRATEGY.md.
// Fonts (CI): Anuphan (display) · IBM Plex Sans Thai (body) · Sora (eyebrow)
// Output: content/line-posts/post-N.png + review.html
// Run: node scripts/gen-line-posts.mjs
// ============================================================
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const OUT = join(REPO, 'content', 'line-posts');
mkdirSync(OUT, { recursive: true });

const LOGO_DIR = 'C:/Users/Golf/Gopremium-website/Gopremium new version/Logo/';
const b64 = (f) => 'data:image/png;base64,' + readFileSync(LOGO_DIR + f).toString('base64');
const LOGO_WY = b64('GoPremium Logo white-yellow.png'); // white wordmark + gold

// --- CI tokens (Master Final) ---
const NAVY900 = '#0e1d3a', NAVY800 = '#13244a', NAVY600 = '#1d3568';
const GOLD = '#f4b223', GOLD400 = '#f8ce5a', GOLD100 = '#fbe6bd';
const PAPER = '#f6f8fc', SLATE = '#5c6884';
// Exclusive sub-brand
const ROYAL = '#0a1530', CHAMP = '#cbb06f', CHAMP_SOFT = '#e6d6a8';

const POSTS = [
  {
    id: 1, theme: 'navy',
    eyebrow: 'TRANSPARENT PRICING',
    headline: 'เห็นราคา<br>เห็นงานจริง<br><span class="gold">สั่งได้เลย</span>',
    sub: 'ของขวัญองค์กรพรีเมียม ที่ไม่ต้องรอใบเสนอราคาเป็นวัน',
    chips: ['ราคาชัดทุกชิ้น', 'บอก MOQ ตรงไปตรงมา', 'ตอบไว'],
  },
  {
    id: 2, theme: 'split',
    eyebrow: 'GO PREMIUM EXPRESS',
    headline: 'ของด่วน?<br><span class="gold">เราส่งทันงาน</span>',
    sub: 'คัดสินค้าพร้อมส่ง สกรีนโลโก้ไว ทันทุกอีเวนต์สำคัญ',
    chips: ['สินค้าพร้อมส่ง', 'สกรีนโลโก้ด่วน', 'ทันเดดไลน์'],
  },
  {
    id: 3, theme: 'navy',
    eyebrow: 'CURATED COLLECTIONS',
    headline: 'ชุดของขวัญ<br><span class="gold">จัดมาตามโอกาส</span>',
    sub: 'ไม่ต้องเริ่มจากศูนย์ — เลือกคอลเลกชันที่ใช่ได้เลย',
    chips: ['Welcome Kit พนักงานใหม่', 'ปีใหม่ลูกค้า VIP', 'ของที่ระลึกอีเวนต์'],
  },
  {
    id: 4, theme: 'split',
    eyebrow: 'YOUR BRAND, ELEVATED',
    headline: 'ใส่โลโก้คุณ<br><span class="gold">เห็นภาพก่อนผลิต</span>',
    sub: 'ขอ mockup งานจริงก่อนตัดสินใจ ดีไซน์คมทุกชิ้น',
    chips: ['Mockup โลโก้ฟรี', 'แกลเลอรีงานจริง', 'ดีไซน์พรีเมียม'],
  },
  {
    id: 5, theme: 'exclusive',
    eyebrow: 'GO PREMIUM EXCLUSIVE',
    headline: 'งานบีสโปก<br><span class="gold">ระดับ Super-VIP</span>',
    sub: 'Royal Navy + Champagne Gold ออกแบบเฉพาะแบรนด์คุณ',
    chips: ['ออกแบบเฉพาะแบรนด์', 'งานคู่แบรนด์ (Co-brand)', 'ของขวัญที่ไม่เหมือนใคร'],
  },
];

function html(p) {
  const ex = p.theme === 'exclusive';
  const bgGold = ex ? CHAMP : GOLD;
  const bgGold2 = ex ? CHAMP_SOFT : GOLD400;
  const navyA = ex ? ROYAL : NAVY900;
  const navyB = ex ? '#142244' : NAVY600;
  const chipBorder = ex ? 'rgba(203,176,111,.45)' : 'rgba(244,178,35,.4)';
  const chipText = ex ? CHAMP_SOFT : GOLD100;

  // split theme: gold panel at bottom; navy/exclusive: full dark
  const split = p.theme === 'split';

  return `<!doctype html><html lang="th"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600&family=Sora:wght@500;600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1080px;height:1080px}
  .card{position:relative;width:1080px;height:1080px;overflow:hidden;
    background:linear-gradient(150deg,${navyA} 0%,${navyB} 100%);
    font-family:'IBM Plex Sans Thai',sans-serif;color:#fff}
  /* subtle diagonal gold glow */
  .card::before{content:'';position:absolute;inset:0;
    background:radial-gradient(120% 80% at 85% 8%, ${ex?'rgba(203,176,111,.22)':'rgba(244,178,35,.20)'} 0%, transparent 55%);}
  .frame{position:absolute;inset:48px;border:2px solid ${ex?'rgba(203,176,111,.30)':'rgba(244,178,35,.28)'};border-radius:28px;pointer-events:none}
  .inner{position:absolute;inset:0;padding:108px 96px;display:flex;flex-direction:column;height:100%}
  .top{display:flex;align-items:center;justify-content:space-between}
  .logo{height:60px}
  .eyebrow{font-family:'Sora',sans-serif;font-weight:600;font-size:24px;letter-spacing:.32em;
    color:${bgGold};text-transform:uppercase}
  .mid{flex:1;display:flex;flex-direction:column;justify-content:center}
  .kicker{display:inline-flex;align-items:center;gap:14px;margin-bottom:30px}
  .kicker .bar{width:64px;height:4px;border-radius:4px;background:linear-gradient(90deg,${bgGold},${bgGold2})}
  .kicker .lbl{font-family:'Sora',sans-serif;font-weight:600;font-size:22px;letter-spacing:.28em;color:${bgGold};text-transform:uppercase}
  h1{font-family:'Anuphan',sans-serif;font-weight:700;font-size:104px;line-height:1.04;letter-spacing:-.5px}
  h1 .gold{color:${bgGold};background:linear-gradient(92deg,${bgGold},${bgGold2});-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
  .sub{font-family:'IBM Plex Sans Thai',sans-serif;font-weight:400;font-size:34px;line-height:1.5;
    color:#cdd6ea;max-width:760px;margin-top:34px}
  .chips{display:flex;flex-wrap:wrap;gap:16px;margin-top:46px}
  .chip{font-family:'IBM Plex Sans Thai',sans-serif;font-weight:500;font-size:26px;
    color:${chipText};border:1.5px solid ${chipBorder};border-radius:999px;padding:14px 28px;
    background:${ex?'rgba(203,176,111,.06)':'rgba(244,178,35,.06)'}}
  .bottom{display:flex;align-items:center;justify-content:space-between;margin-top:10px}
  .cta{display:inline-flex;align-items:center;gap:16px;
    background:linear-gradient(92deg,${bgGold},${bgGold2});color:${ex?ROYAL:NAVY900};
    font-family:'Sora',sans-serif;font-weight:700;font-size:30px;letter-spacing:.01em;
    padding:24px 44px;border-radius:999px}
  .cta .ic{width:34px;height:34px;border-radius:8px;background:${ex?ROYAL:NAVY900};display:flex;align-items:center;justify-content:center;
    color:${bgGold};font-size:20px;font-weight:700}
  .url{font-family:'Sora',sans-serif;font-weight:500;font-size:24px;color:${ex?CHAMP_SOFT:'#9fb0d0'};letter-spacing:.04em}
</style></head>
<body>
  <div class="card">
    <div class="frame"></div>
    <div class="inner">
      <div class="top">
        <img class="logo" src="${LOGO_WY}" alt="GO PREMIUM">
        <div class="eyebrow">${ex ? 'EXCLUSIVE' : 'CORPORATE GIFTS'}</div>
      </div>
      <div class="mid">
        <div class="kicker"><span class="bar"></span><span class="lbl">${p.eyebrow}</span></div>
        <h1>${p.headline}</h1>
        <div class="sub">${p.sub}</div>
        <div class="chips">${p.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>
      </div>
      <div class="bottom">
        <div class="cta"><span class="ic">↗</span> ${ex ? 'ปรึกษางานบีสโปก' : 'ทักแชทรับราคาเลย'}</div>
        <div class="url">gopremium.co.th</div>
      </div>
    </div>
  </div>
</body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 2 });
const made = [];
for (const p of POSTS) {
  await page.setContent(html(p), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  const file = join(OUT, `post-${p.id}.png`);
  await page.locator('.card').screenshot({ path: file });
  console.log(`OK post-${p.id} -> ${file}`);
  made.push(p.id);
}
await browser.close();

// --- self-contained review HTML (per standing request) ---
const cards = POSTS.map(p => {
  const data = 'data:image/png;base64,' + readFileSync(join(OUT, `post-${p.id}.png`)).toString('base64');
  return `<figure><img src="${data}" alt="post ${p.id}"><figcaption><b>Post ${p.id}</b> — ${p.eyebrow}</figcaption></figure>`;
}).join('\n');
const review = `<!doctype html><meta charset="utf-8"><title>GO PREMIUM — LINE@ posts review</title>
<style>body{margin:0;background:#0e1d3a;font-family:system-ui,'Segoe UI',sans-serif;color:#f6f8fc;padding:40px}
h1{font-weight:700}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:28px;margin-top:24px}
figure{margin:0;background:#13244a;border:1px solid rgba(244,178,35,.25);border-radius:16px;padding:14px}
img{width:100%;border-radius:10px;display:block}figcaption{margin-top:10px;font-size:15px;color:#cdd6ea}b{color:#f4b223}</style>
<h1>GO PREMIUM — LINE@ Posts (5) · Master Final CI</h1>
<p>1080×1080 · Navy #13244a / Gold #f4b223 · Anuphan · IBM Plex Sans Thai · Sora</p>
<div class="grid">${cards}</div>`;
writeFileSync(join(OUT, 'review.html'), review);
console.log(`OK review.html -> ${join(OUT, 'review.html')}`);
console.log('DONE', made.length, 'posts');
