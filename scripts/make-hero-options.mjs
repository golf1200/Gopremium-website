// Build a self-contained review page comparing the current hero left-column
// layout against 3 cleaner options. Embeds a real banner as base64 so the file
// opens with no server. Output: website/hero-firstimpression-options.html
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Downscale the embedded banner to roughly the size it renders at (~620px wide,
// 2x for retina) so the review file stays light.
const buf = await sharp(join(root, 'public/banners/banner3.jpg'))
  .resize({ width: 760 })
  .jpeg({ quality: 70, mozjpeg: true })
  .toBuffer();
const IMG = `data:image/jpeg;base64,${buf.toString('base64')}`;

// ---- shared building blocks (mirrors the live hero markup) ----
const slide = `<div class="hero-slides"><div class="hero-track"><img src="${IMG}" alt="GO PREMIUM hero"></div><div class="hdots"><i class="on"></i><i></i><i></i></div></div>`;
const tag = `<span class="tag"><span class="flash" style="font-size:15px;line-height:1">🔥</span>ผู้ผลิตของพรีเมียมตัวจริง · ผลิตแล้วกว่า <b>100,000 ชิ้น</b> ทั่วไทย</span>`;
const en = `<div class="en">Go beyond the gift</div>`;
const h1 = `<h1><span class="pre">มากกว่าของขวัญ</span>คือ<em>ประสบการณ์</em></h1>`;
const lead = `<p class="lead">บริการของขวัญองค์กรครบจบในที่เดียว พร้อม <b style="color:var(--navy)">AI ช่วยคิดเซ็ตของขวัญ</b> ให้ตรงงบ ตรงโจทย์ และทันเวลา</p>`;
const aiBox = (cap = false) => `<div class="ai-box">${cap ? '<div class="cap">✦ ให้ AI ช่วยคิดเซ็ตของขวัญให้คุณ</div>' : ''}<div class="ai-row"><input placeholder="เช่น ของขวัญปีใหม่พนักงาน 200 คน งบ 300฿ สายมินิมอล"><button class="btn btn-secondary">✦ ถาม AI</button></div></div>`;
const stats = `<div class="hstats"><div><div class="n">7–14 วัน</div><div class="l">งานพร้อมส่ง</div></div><div><div class="n">2 ชม.</div><div class="l">ตอบกลับ + เสนอราคา</div></div><div><div class="n">100%</div><div class="l">Mockup ก่อนผลิต</div></div></div>`;
const actions = `<div class="hero-actions"><a class="btn btn-primary btn-lg">ขอใบเสนอราคา <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a><a class="btn btn-ghost btn-lg">ดูแคตตาล็อก 245 รายการ</a></div>`;

// ---- the four variants ----
const CURRENT = `${tag}${en}${h1}${lead}${aiBox()}${stats}${actions}`;
const OPT_A = `${tag}${en}${h1}${lead}${aiBox()}${stats}${actions}`;        // spacing-only
const OPT_B = `${tag}${h1}${lead}${aiBox()}${actions}${stats}`;            // declutter + stats strip
const OPT_C = `${tag}${h1}${lead}${aiBox(true)}${actions}${stats}`;        // spotlight AI card

const panel = (cls, label, note, inner) => `
<section class="panel">
  <div class="panel-head"><span class="chip">${label}</span><p>${note}</p></div>
  <div class="${cls}"><section class="hero"><div class="glow"></div><div class="wrap hero-in">
    <div class="hero-left">${inner}</div>
    ${slide}
  </div></section></div>
</section>`;

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — Hero First Impression · 3 Options</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --navy:#1F3A5F; --navy-700:#16293F; --navy-soft:#2C4F7C;
  --mustard:#F4BD44; --mustard-deep:#E0A92B; --mustard-soft:#F8D586;
  --ink:#1A2230; --grey:#5B6472; --grey-400:#8A93A2; --line:#E3E7ED;
  --cloud:#F5F6F8; --cloud-2:#EEF1F5;
  --r:16px; --r-lg:24px; --r-xl:32px; --r-sm:10px; --pill:999px;
  --sh:0 18px 50px -18px rgba(31,58,95,.30); --sh-md:0 12px 34px -14px rgba(31,58,95,.22); --sh-sm:0 4px 16px -6px rgba(31,58,95,.16);
  --maxw:1240px; --gut:clamp(20px,5vw,64px);
  --head:'Kanit',sans-serif; --body:'Sarabun',sans-serif;
}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:var(--body);color:var(--ink);background:#EDEFF3;line-height:1.65;-webkit-font-smoothing:antialiased}
h1{font-family:var(--head);margin:0}
p{margin:0}img{display:block;max-width:100%}button{font-family:inherit;cursor:pointer}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 var(--gut)}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:var(--head);font-weight:500;font-size:15px;padding:12px 23px;border-radius:var(--pill);border:1.5px solid transparent;line-height:1;white-space:nowrap}
.btn svg{width:17px;height:17px}
.btn-primary{background:var(--mustard);color:var(--navy);box-shadow:0 10px 24px -10px rgba(244,189,68,.8)}
.btn-secondary{background:var(--navy);color:#fff}
.btn-ghost{background:transparent;color:var(--navy);border-color:var(--line)}
.btn-lg{font-size:16px;padding:15px 30px}

/* ===== hero (shared base, mirrors live site) ===== */
.hero{position:relative;overflow:hidden;background:linear-gradient(180deg,#FBFCFD,var(--cloud));border-radius:18px}
.hero .glow{position:absolute;right:-8%;top:-20%;width:540px;height:540px;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(244,189,68,.28),transparent 60%);pointer-events:none}
.hero-in{position:relative;z-index:1;display:grid;grid-template-columns:.92fr 1.18fr;gap:clamp(28px,4vw,56px);align-items:stretch;padding:clamp(22px,2.6vw,40px) 0 clamp(30px,3.4vw,50px)}
.tag{display:inline-flex;align-items:center;gap:8px;font-family:var(--head);background:var(--mustard-soft);color:#6B4E08;font-weight:500;font-size:13.5px;padding:8px 16px;border-radius:var(--pill);margin-bottom:18px;border:1px solid rgba(244,189,68,.55);box-shadow:0 2px 10px -4px rgba(244,189,68,.6)}
.tag b{font-weight:700;color:#5A3F00}
.hero h1{font-size:clamp(31px,4.4vw,52px);font-weight:700;color:var(--navy);letter-spacing:-.025em;line-height:1.08;margin-bottom:10px;text-wrap:balance}
.hero h1 em{font-style:normal;color:var(--mustard-deep)}
.hero h1 .pre{display:block;font-size:.62em;font-weight:600;color:var(--navy-soft);letter-spacing:0;margin-bottom:3px}
.hero .en{font-family:var(--head);font-weight:300;font-size:clamp(16px,1.6vw,20px);letter-spacing:.04em;color:var(--navy-soft);margin-bottom:16px}
.lead{font-size:clamp(15px,1.25vw,18px);color:var(--grey);line-height:1.75;max-width:42ch}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.ai-box{margin-top:20px;max-width:540px}
.ai-box .cap{display:flex;align-items:center;gap:7px;margin-bottom:8px;font-size:12.5px;color:var(--mustard-deep);font-family:var(--head);font-weight:500}
.ai-row{display:flex;gap:8px;background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:7px;box-shadow:var(--sh-sm)}
.ai-row input{border:none;outline:none;flex:1;min-width:0;padding:8px 10px;font-size:14.5px;background:none}
.hstats{display:flex;gap:28px;flex-wrap:wrap;margin-top:22px}
.hstats>div{text-align:center}
.hstats .n{font-family:var(--head);font-weight:700;font-size:24px;color:var(--navy)}
.hstats .l{font-size:12.5px;color:var(--grey)}
.hero-slides{position:relative;height:100%;min-height:340px;width:100%;border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh-md);background:var(--cloud)}
.hero-track{display:flex;height:100%}
.hero-track img{width:100%;height:100%;object-fit:cover}
.hdots{position:absolute;left:0;right:0;bottom:14px;z-index:2;display:flex;justify-content:center;gap:8px}
.hdots i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.55);box-shadow:0 1px 3px rgba(31,58,95,.45)}
.hdots i.on{background:var(--mustard);width:22px;border-radius:4px}

/* ====================================================================
   OPTION A — โปร่งขึ้น (Airy): spacing-only, keeps every element.
   Even vertical rhythm + vertical centering + wider column gap.
==================================================================== */
.opt-A .hero-in{align-items:center;gap:clamp(40px,5vw,76px);padding-top:clamp(34px,3.4vw,52px);padding-bottom:clamp(34px,3.4vw,52px)}
.opt-A .hero-left{display:flex;flex-direction:column}
.opt-A .hero-left>*{margin:0!important;max-width:46ch}
.opt-A .hero-left>*+*{margin-top:clamp(20px,2.2vw,26px)!important}
.opt-A .tag{align-self:flex-start}

/* ====================================================================
   OPTION B — กระชับ (Streamlined): drops the "Go beyond the gift"
   eyebrow, groups the heading tightly, turns the 3 stats into a slim
   single-line trust strip below the buttons. 7 blocks → 5 groups.
==================================================================== */
.opt-B .hero-in{align-items:center;gap:clamp(40px,5vw,72px)}
.opt-B .hero-left{display:flex;flex-direction:column}
.opt-B .hero-left>*{margin:0!important}
.opt-B .tag{margin-bottom:20px!important}
.opt-B h1{margin-bottom:14px!important}
.opt-B .lead{max-width:44ch}
.opt-B .ai-box{margin-top:24px!important}
.opt-B .hero-actions{margin-top:20px!important}
.opt-B .hstats{margin-top:26px!important;gap:0;border-top:1px solid var(--line);padding-top:18px;flex-wrap:nowrap}
.opt-B .hstats>div{text-align:left;padding:0 22px;border-left:1px solid var(--line)}
.opt-B .hstats>div:first-child{padding-left:0;border-left:none}
.opt-B .hstats .n{font-size:19px}
.opt-B .hstats .l{font-size:11.5px}

/* ====================================================================
   OPTION C — พรีเมียมโฟกัส (Spotlight): drops the eyebrow, narrows the
   copy for readability, elevates the AI box into a captioned card as the
   hero CTA, and reduces the stats to a minimal gold-accent row.
==================================================================== */
.opt-C .hero-in{align-items:center;gap:clamp(44px,5vw,80px);padding-top:clamp(36px,3.6vw,56px);padding-bottom:clamp(36px,3.6vw,56px)}
.opt-C .hero-left{display:flex;flex-direction:column}
.opt-C .hero-left>*{margin:0!important}
.opt-C .tag{margin-bottom:22px!important}
.opt-C h1{margin-bottom:16px!important}
.opt-C .lead{max-width:40ch}
.opt-C .ai-box{margin-top:26px!important;background:#fff;border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--sh-md);padding:16px}
.opt-C .ai-box .ai-row{box-shadow:none;border-color:var(--line)}
.opt-C .hero-actions{margin-top:22px!important}
.opt-C .hstats{margin-top:28px!important;gap:26px}
.opt-C .hstats>div{text-align:left;position:relative;padding-left:16px}
.opt-C .hstats>div::before{content:"";position:absolute;left:0;top:3px;bottom:3px;width:3px;border-radius:2px;background:var(--mustard)}
.opt-C .hstats .n{font-size:20px;color:var(--mustard-deep)}
.opt-C .hstats .l{font-size:11.5px}

/* ===== review page chrome ===== */
.head{max-width:var(--maxw);margin:0 auto;padding:40px var(--gut) 8px}
.head h2{font-family:var(--head);color:var(--navy);font-size:30px;margin:0 0 6px}
.head .sub{color:var(--grey);font-size:15px;max-width:80ch}
.diag{max-width:var(--maxw);margin:18px auto 8px;padding:18px var(--gut)}
.diag .box{background:#fff;border:1px solid var(--line);border-left:4px solid var(--mustard);border-radius:12px;padding:16px 20px}
.diag h3{font-family:var(--head);color:var(--navy);font-size:16px;margin:0 0 8px}
.diag ul{margin:0;padding-left:20px;color:var(--grey);font-size:14px;line-height:1.9}
.panel{max-width:var(--maxw);margin:0 auto;padding:26px var(--gut) 10px}
.panel-head{margin:0 0 14px;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
.chip{font-family:var(--head);font-weight:600;font-size:13px;color:#fff;background:var(--navy);padding:6px 14px;border-radius:var(--pill)}
.panel:nth-of-type(1) .chip{background:var(--grey-400)}
.panel-head p{color:var(--grey);font-size:14px;margin:0}
.foot{max-width:var(--maxw);margin:0 auto;padding:30px var(--gut) 60px;color:var(--grey-400);font-size:13px}
@media(max-width:860px){
  .hero-in,.opt-A .hero-in,.opt-B .hero-in,.opt-C .hero-in{grid-template-columns:1fr;gap:30px!important}
  .hero-slides{aspect-ratio:3/2;min-height:0}
  .opt-B .hstats{flex-wrap:wrap}
}
</style></head>
<body>
<div class="head">
  <h2>Hero — First Impression · 3 Options</h2>
  <p class="sub">เทียบเลย์เอาต์คอลัมน์ซ้ายของ Hero: ของปัจจุบัน vs. 3 แนวทางที่จัดให้ “คลีน/โปร่ง” ขึ้น (ภาพ &amp; ฟอนต์เป็นของจริงจากเว็บ)</p>
</div>
<div class="diag"><div class="box">
  <h3>ทำไมตอนนี้ถึงรู้สึกแน่น</h3>
  <ul>
    <li>คอลัมน์ซ้ายอัด <b>7 องค์ประกอบ</b>ซ้อนกัน: แท็ก → “Go beyond the gift” → หัวข้อ → คำโปรย → กล่อง AI → สถิติ 3 ตัว → ปุ่ม 2 ปุ่ม</li>
    <li>ระยะห่างแนวตั้งถี่และ<b>ไม่สม่ำเสมอ</b> (10–24px) ทำให้จังหวะการอ่านสะดุด</li>
    <li>มีบรรทัด “Go beyond the gift” ซ้ำกับสารในแท็ก/แบรนด์ → เพิ่มความหนาแน่นโดยไม่จำเป็น</li>
    <li>คอลัมน์ตั้ง <code>align-items:stretch</code> ทำให้เนื้อหาดันชิดบน ไม่ได้สมดุลกับภาพ</li>
  </ul>
</div></div>

${panel('', 'ปัจจุบัน (Current)', 'เลย์เอาต์ที่ใช้งานจริงตอนนี้ — ไว้เทียบ baseline', CURRENT)}
${panel('opt-A', 'Option A · โปร่งขึ้น (Airy)', 'แก้เฉพาะระยะห่าง — ความเสี่ยงต่ำสุด คงครบทุกองค์ประกอบ จัดจังหวะแนวตั้งให้สม่ำเสมอ + จัดกึ่งกลางแนวตั้งให้สมดุลกับภาพ', OPT_A)}
${panel('opt-B', 'Option B · กระชับ (Streamlined)', 'ตัด “Go beyond the gift” ออก, รวบหัวข้อให้กระชับ, แปลงสถิติ 3 ตัวเป็นแถบ trust บรรทัดเดียวใต้ปุ่ม — ลดจาก 7 บล็อกเหลือ 5 กลุ่ม', OPT_B)}
${panel('opt-C', 'Option C · พรีเมียมโฟกัส (Spotlight)', 'ตัด eyebrow, ย่อความกว้างข้อความให้อ่านง่าย, ยกกล่อง AI เป็นการ์ดเด่นเป็น CTA หลัก, สถิติเป็นแถวมินิมอลตัวเลขสีทอง', OPT_C)}

<div class="foot">
  GO PREMIUM v2.0 · mockup เปรียบเทียบ Hero · ไฟล์นี้ self-contained (เปิดได้เลยไม่ต้องต่อเซิร์ฟเวอร์) · ภาพ banner ฝังแบบ base64
</div>
</body></html>`;

const out = join(root, 'hero-firstimpression-options.html');
writeFileSync(out, html);
console.log('wrote', out, '(' + Math.round(html.length / 1024) + ' KB)');
