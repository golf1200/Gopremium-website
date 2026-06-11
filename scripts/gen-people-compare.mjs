// ============================================================
// GO PREMIUM — "people" LINE post: Gemini vs Free comparison
// Same copy + same brand overlay on two backgrounds:
//   A) Gemini 2.5 Flash Image (photoreal people)   [paid free-tier]
//   B) Free Unsplash stock photo (real people)      [$0]
// Output: content/line-posts/_compare/out-gemini.png, out-free.png, compare.html
// Run: node scripts/gen-people-compare.mjs
// ============================================================
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const OUT = join(REPO, 'content', 'line-posts', '_compare');
mkdirSync(OUT, { recursive: true });

// --- env ---
for (const line of readFileSync(join(REPO, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const LOGO_DIR = 'C:/Users/Golf/Gopremium-website/Gopremium new version/Logo/';
const LOGO_WY = 'data:image/png;base64,' + readFileSync(LOGO_DIR + 'GoPremium Logo white-yellow.png').toString('base64');

// shared post copy
const POST = {
  eyebrow: 'WELCOME KIT',
  headline: 'ของขวัญต้อนรับ<br>พนักงานใหม่<br><span class="gold">ที่เขาจะจำได้</span>',
  sub: 'ชุดของขวัญพรีเมียมพร้อมโลโก้บริษัท สร้างความประทับใจตั้งแต่วันแรก',
  cta: 'ทักแชทจัดชุดให้เลย',
};

// ---------- A) Gemini background ----------
async function genGeminiBg() {
  const out = join(OUT, 'bg-gemini.jpg');
  if (existsSync(out)) { console.log('skip gemini bg (exists)'); return out; }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt =
    'A warm, candid editorial photograph of a small diverse team of young professionals in a bright modern office, ' +
    'smiling and welcoming a new colleague who is holding a premium gift box wrapped with a navy-blue and gold ribbon. ' +
    'Genuine happy expressions, business-casual attire, soft natural window light, shallow depth of field, candid corporate lifestyle. ' +
    'Subtle navy and warm-gold accents in the scene. The lower portion of the frame is calmer and slightly darker, leaving negative space. ' +
    'Absolutely NO text, NO letters, NO logos, NO watermark anywhere. Photorealistic. Square composition.';
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  const img = (res?.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData?.data);
  if (!img) throw new Error('Gemini returned no image');
  await sharp(Buffer.from(img.inlineData.data, 'base64'))
    .resize(1080, 1080, { fit: 'cover', position: 'top' }).jpeg({ quality: 88 }).toFile(out);
  console.log('OK gemini bg ->', out);
  return out;
}

// ---------- A2) Pollinations.ai background (FREE, no key) ----------
async function genPollinationsBg() {
  const out = join(OUT, 'bg-pollinations.jpg');
  if (existsSync(out)) { console.log('skip pollinations bg (exists)'); return out; }
  const prompt =
    'Candid editorial photograph of a small diverse team of young professionals in a bright modern office, ' +
    'smiling and welcoming a new colleague who holds a premium gift box wrapped with navy-blue and gold ribbon, ' +
    'genuine happy expressions, business-casual attire, soft natural window light, shallow depth of field, ' +
    'corporate lifestyle, subtle navy and warm gold accents, calmer darker lower area, photorealistic, no text, no logo, no watermark';
  // seed fixed for reproducibility (Math.random is unavailable in some harness contexts)
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1080&model=flux&nologo=true&seed=72`;
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`pollinations HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) throw new Error('pollinations tiny/empty response');
  await sharp(buf).resize(1080, 1080, { fit: 'cover', position: 'top' }).jpeg({ quality: 88 }).toFile(out);
  console.log('OK pollinations bg ->', out, `(${(buf.length / 1024).toFixed(0)}KB src)`);
  return out;
}

// ---------- B) Free stock background ----------
async function freeBg() {
  const src = join(OUT, 'cand', 'cand-d.jpg');
  const out = join(OUT, 'bg-free.jpg');
  await sharp(src).resize(1080, 1080, { fit: 'cover', position: 'attention' }).jpeg({ quality: 88 }).toFile(out);
  console.log('OK free bg ->', out);
  return out;
}

// ---------- shared brand overlay ----------
function html(bgPath, badge) {
  const bg = 'data:image/jpeg;base64,' + readFileSync(bgPath).toString('base64');
  return `<!doctype html><html lang="th"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500&family=Sora:wght@600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1080px}
.card{position:relative;width:1080px;height:1080px;overflow:hidden;font-family:'IBM Plex Sans Thai',sans-serif;color:#fff}
.photo{position:absolute;inset:0;background:url('${bg}') center/cover}
.tint{position:absolute;inset:0;background:
  linear-gradient(180deg, rgba(14,29,58,.55) 0%, rgba(14,29,58,.12) 30%, rgba(14,29,58,.80) 66%, rgba(14,29,58,.97) 100%),
  linear-gradient(0deg, rgba(14,29,58,.18), rgba(14,29,58,.18));}
.frame{position:absolute;inset:40px;border:1.5px solid rgba(244,178,35,.40);border-radius:24px;pointer-events:none}
.badge{position:absolute;top:64px;right:64px;font-family:'Sora',sans-serif;font-weight:700;font-size:18px;letter-spacing:.06em;
  color:#0e1d3a;background:#f4b223;padding:8px 16px;border-radius:8px}
.inner{position:absolute;inset:0;padding:88px 84px;display:flex;flex-direction:column;height:100%}
.top{display:flex;align-items:center;justify-content:space-between}
.logo{height:54px}
.eyebrow{font-family:'Sora',sans-serif;font-weight:600;font-size:22px;letter-spacing:.30em;color:#f4b223;text-transform:uppercase}
.mid{flex:1}
.bottom-block{margin-top:auto}
.kicker{display:inline-flex;align-items:center;gap:14px;margin-bottom:24px}
.kicker .bar{width:60px;height:4px;border-radius:4px;background:linear-gradient(90deg,#f4b223,#f8ce5a)}
.kicker .lbl{font-family:'Sora',sans-serif;font-weight:600;font-size:20px;letter-spacing:.26em;color:#f4b223;text-transform:uppercase}
h1{font-family:'Anuphan',sans-serif;font-weight:700;font-size:92px;line-height:1.05;letter-spacing:-.5px;text-shadow:0 2px 24px rgba(0,0,0,.35)}
h1 .gold{background:linear-gradient(92deg,#f4b223,#f8ce5a);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.sub{font-weight:400;font-size:32px;line-height:1.5;color:#e6ecf7;max-width:780px;margin-top:28px;text-shadow:0 1px 12px rgba(0,0,0,.4)}
.row{display:flex;align-items:center;justify-content:space-between;margin-top:40px}
.cta{display:inline-flex;align-items:center;gap:14px;background:linear-gradient(92deg,#f4b223,#f8ce5a);color:#0e1d3a;
  font-family:'Sora',sans-serif;font-weight:700;font-size:28px;padding:22px 40px;border-radius:999px;box-shadow:0 8px 30px rgba(0,0,0,.35)}
.cta .ic{width:32px;height:32px;border-radius:8px;background:#0e1d3a;display:flex;align-items:center;justify-content:center;color:#f4b223;font-size:18px}
.url{font-family:'Sora',sans-serif;font-weight:600;font-size:23px;color:#cdd6ea}
</style></head><body>
<div class="card">
  <div class="photo"></div><div class="tint"></div><div class="frame"></div>
  <div class="badge">${badge}</div>
  <div class="inner">
    <div class="top"><img class="logo" src="${LOGO_WY}" alt="GO PREMIUM"></div>
    <div class="mid"></div>
    <div class="bottom-block">
      <div class="kicker"><span class="bar"></span><span class="lbl">${POST.eyebrow}</span></div>
      <h1>${POST.headline}</h1>
      <div class="sub">${POST.sub}</div>
      <div class="row">
        <div class="cta"><span class="ic">↗</span> ${POST.cta}</div>
        <div class="url">gopremium.co.th</div>
      </div>
    </div>
  </div>
</div></body></html>`;
}

// ---------- run ----------
let geminiBg = null;
try { geminiBg = await genGeminiBg(); }
catch (e) { console.error('Gemini FAILED:', e.status || '', (e.message || '').slice(0, 200)); }
let pollBg = null;
try { pollBg = await genPollinationsBg(); }
catch (e) { console.error('Pollinations FAILED:', (e.message || '').slice(0, 200)); }
const freeBgPath = await freeBg();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 2 });

async function render(bgPath, badge, file) {
  await page.setContent(html(bgPath, badge), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.locator('.card').screenshot({ path: join(OUT, file) });
  console.log('OK ->', file);
}

if (geminiBg) await render(geminiBg, 'AI · GEMINI', 'out-gemini.png');
if (pollBg) await render(pollBg, 'AI · ฟรี (FLUX)', 'out-pollinations.png');
await render(freeBgPath, 'FREE · STOCK', 'out-free.png');
await browser.close();

// compare.html
const imgTag = (f, label, note) => existsSync(join(OUT, f))
  ? `<figure><img src="data:image/png;base64,${readFileSync(join(OUT, f)).toString('base64')}"><figcaption><b>${label}</b><br><span>${note}</span></figcaption></figure>` : '';
const review = `<!doctype html><meta charset="utf-8"><title>GO PREMIUM — People post: Gemini vs Free</title>
<style>body{margin:0;background:#0e1d3a;color:#f6f8fc;font-family:system-ui,'Segoe UI',sans-serif;padding:40px}
h1{font-weight:700}.grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:24px;max-width:1300px}
figure{margin:0;background:#13244a;border:1px solid rgba(244,178,35,.25);border-radius:16px;padding:16px}
img{width:100%;border-radius:12px;display:block}figcaption{margin-top:12px;font-size:15px;color:#cdd6ea}
b{color:#f4b223;font-size:18px}span{color:#9fb0d0}</style>
<h1>GO PREMIUM — โพสต์แบบมีคน (เนื้อหา/เลย์เอาต์เดียวกัน · เทียบแหล่งภาพ)</h1>
<div class="grid">
${imgTag('out-pollinations.png', 'A · AI ฟรี — Pollinations / FLUX', 'AI สร้างฉากคนเอง คุมบริบท/พร็อพ/โทนแบรนด์ได้ — ฟรี 100% ไม่ต้องมี API key')}
${imgTag('out-free.png', 'B · ฟรี — Unsplash stock', 'ภาพคนจริงสัญญาอนุญาตฟรี ($0) — หน้าคนคมจริง แต่บริบทตามที่มีในคลัง')}
${imgTag('out-gemini.png', 'C · Gemini 2.5 Flash Image', '(ต้องเติมเครดิตก่อน — ตอนนี้ 429 credits depleted)')}
</div>`;
writeFileSync(join(OUT, 'compare.html'), review);
console.log('OK compare.html ->', join(OUT, 'compare.html'));
console.log('DONE');
