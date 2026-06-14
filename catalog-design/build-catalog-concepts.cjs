/* GO PREMIUM — Catalog cover concepts + sample product page (A4, print-ready, self-contained)
 * CI: Master Final brand book — Navy #13244a · Gold #f4b223 · Anuphan / Sora / IBM Plex Sans Thai
 * Build:  node catalog-design/build-catalog-concepts.cjs   (run from website/)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const b64 = (rel) => {
  const p = path.join(ROOT, rel);
  const data = fs.readFileSync(p).toString('base64');
  return `data:image/jpeg;base64,${data}`;
};

// ---- people images (the homepage heroes the client loves) ----
const PEOPLE = {
  runner:   b64('public/banners/banner1.jpg'), // navy-polo delivery man, running, speed lines
  ai:       b64('public/banners/banner2.jpg'), // navy-polo man + gift box + AI glyphs
  woman:    b64('public/banners/banner3.jpg'), // businesswoman in beige suit + navy gift box
};

// ---- sample products (real catalogue data — Drinkware) ----
const PRODUCTS = [
  { sku:'DW001', name:'กระบอกน้ำสแตนเลส รุ่น Loopa', size:'500 ml', material:'สแตนเลส 304', price:170, moq:50,  logo:'เลเซอร์', img:b64('public/images/products/dw001-loopa/dw001-loopa-square.jpg') },
  { sku:'DW002', name:'แก้วน้ำสแตนเลส รุ่น Brewy',   size:'500 ml', material:'สแตนเลส 304 / 201', price:155, moq:50,  logo:'เลเซอร์', img:b64('public/images/products/dw002-brewy/dw002-brewy-square.jpg') },
  { sku:'DW003', name:'แก้วน้ำสแตนเลส รุ่น Peak',    size:'500 ml', material:'สแตนเลส 304', price:135, moq:100, logo:'เลเซอร์', img:b64('public/images/products/dw003-peak/dw003-peak-square.jpg') },
  { sku:'DW004', name:'แก้วน้ำสแตนเลส รุ่น Cupsy',   size:'350 ml', material:'สแตนเลส 304', price:117, moq:100, logo:'เลเซอร์', img:b64('public/images/products/dw004-cupsy/dw004-cupsy-square.jpg') },
  { sku:'DW005', name:'แก้วน้ำสแตนเลส รุ่น Sip',     size:'590 ml', material:'สแตนเลส 304', price:126, moq:100, logo:'เลเซอร์', img:b64('public/images/products/dw005-sip/dw005-sip-square.jpg') },
  { sku:'DW006', name:'แก้วน้ำสแตนเลส รุ่น Milo',    size:'350 ml', material:'สแตนเลส 304', price:140, moq:100, logo:'เลเซอร์', img:b64('public/images/products/dw006-milo/dw006-milo-square.jpg') },
];

// ---- reusable brand glyph (gold gift, matches the banner glyphs) ----
const GIFT = (cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8"/><path d="M2 8.5h20V12H2z"/><path d="M12 8.5V21"/><path d="M12 8.5S10.5 4 7.8 4C6.2 4 5.5 5.2 5.5 6.2 5.5 7.7 7 8.5 12 8.5Z"/><path d="M12 8.5S13.5 4 16.2 4C17.8 4 18.5 5.2 18.5 6.2 18.5 7.7 17 8.5 12 8.5Z"/></svg>`;
const SPARK = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z"/></svg>`;
const LOGO = (variant='navy') => `<span class="logo logo-${variant}"><span class="logo-mark">${GIFT()}</span><span class="logo-word">GO<b>PREMIUM</b><small>CORPORATE GIFTS</small></span></span>`;

const YEAR = '2026';

// ============================================================ STYLES
const CSS = `
:root{
  --navy:#13244a; --navy-2:#1c3566; --navy-deep:#0c1730;
  --gold:#f4b223; --gold-2:#ffcf5a; --gold-deep:#c9962e;
  --cloud:#f5f6f8; --line:#e3e7ed; --ink:#1a2230; --grey:#5b6472;
  --thai:'Anuphan','IBM Plex Sans Thai',sans-serif;
  --disp:'Sora','Anuphan',sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#dfe2e8;font-family:var(--thai);color:var(--ink);-webkit-font-smoothing:antialiased;line-height:1.55}
.toolbar{position:sticky;top:0;z-index:50;background:var(--navy);color:#fff;padding:13px 22px;display:flex;align-items:center;gap:16px;font-family:var(--disp);box-shadow:0 6px 20px -8px rgba(0,0,0,.4)}
.toolbar b{font-weight:700;letter-spacing:.02em}
.toolbar .sp{flex:1}
.toolbar .pill{font-size:12px;background:rgba(255,255,255,.12);padding:5px 12px;border-radius:99px;color:#dbe3f2}
.toolbar button{font-family:var(--disp);font-weight:600;font-size:13px;border:0;border-radius:99px;padding:9px 18px;background:var(--gold);color:var(--navy);cursor:pointer}
.toolbar button:hover{background:var(--gold-2)}
.stage{padding:34px 16px 60px;display:flex;flex-direction:column;align-items:center;gap:40px}
.label{font-family:var(--disp);font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#5b6472;align-self:center;margin-bottom:-22px;display:flex;align-items:center;gap:10px}
.label .n{display:inline-flex;width:24px;height:24px;border-radius:50%;background:var(--navy);color:#fff;align-items:center;justify-content:center;font-size:12px}
.label .desc{color:#98a0ad;font-weight:500;letter-spacing:.02em;text-transform:none;font-size:12.5px}

/* ---- A4 sheet ---- */
.sheet{width:210mm;height:297mm;background:#fff;position:relative;overflow:hidden;box-shadow:0 24px 60px -24px rgba(15,30,60,.45);border-radius:2px}

/* ---- shared bits ---- */
.logo{display:inline-flex;align-items:center;gap:11px}
.logo-mark{width:34px;height:34px;border-radius:9px;background:var(--gold);display:flex;align-items:center;justify-content:center;color:var(--navy);flex:none}
.logo-mark svg{width:21px;height:21px}
.logo-word{font-family:var(--disp);font-weight:800;font-size:19px;letter-spacing:.04em;line-height:.95;color:var(--navy)}
.logo-word b{font-weight:800;color:var(--gold-deep)}
.logo-word small{display:block;font-weight:600;font-size:8px;letter-spacing:.34em;color:var(--grey);margin-top:3px}
.logo-navy .logo-word{color:var(--navy)}
.logo-white .logo-word{color:#fff} .logo-white .logo-word b{color:var(--gold)} .logo-white .logo-word small{color:rgba(255,255,255,.65)}
.eyebrow{font-family:var(--disp);font-weight:600;font-size:13px;letter-spacing:.26em;text-transform:uppercase}
.rule{height:3px;width:64px;background:var(--gold);border-radius:2px}

/* ===================================================== CONCEPT 1 — Editorial Light */
.c1{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr auto}
.c1 .txt{padding:20mm 6mm 0 18mm;display:flex;flex-direction:column}
.c1 .txt .top{display:flex;align-items:center;gap:14px;margin-bottom:auto}
.c1 .txt .top .yr{font-family:var(--disp);font-weight:700;color:var(--gold-deep);font-size:13px;letter-spacing:.1em;padding-left:14px;border-left:1px solid var(--line)}
.c1 .txt .eyebrow{color:var(--navy-2);margin-bottom:14px;display:block}
.c1 h1{font-family:var(--thai);font-weight:700;color:var(--navy);font-size:43px;line-height:1.08;letter-spacing:-.01em;margin:0}
.c1 h1 em{font-style:normal;color:var(--gold-deep)}
.c1 .rule{margin:20px 0}
.c1 .sub{color:var(--grey);font-size:15px;max-width:32ch;margin-bottom:30mm}
.c1 .photo{grid-row:1 / span 2;grid-column:2;position:relative;overflow:hidden;background:var(--cloud)}
.c1 .photo img{width:100%;height:100%;object-fit:cover;object-position:58% center}
.c1 .photo:after{content:"";position:absolute;left:0;top:0;bottom:0;width:80px;background:linear-gradient(90deg,#fff,transparent)}
.c1 .foot{grid-column:1 / -1;background:var(--navy);color:#fff;padding:9px 18mm;display:flex;align-items:center;gap:18px;font-family:var(--disp);font-size:11.5px;letter-spacing:.04em}
.c1 .foot .g{color:var(--gold)}
.c1 .foot .sp{flex:1}

/* ===================================================== CONCEPT 2 — Two-band Spotlight */
.c2{display:flex;flex-direction:column;background:#fff}
.c2 .band{position:relative;height:60%;background:linear-gradient(135deg,var(--navy) 0%,var(--navy-deep) 100%);color:#fff;padding:18mm 18mm 0;overflow:hidden}
.c2 .band .wm{position:absolute;right:-30px;top:-30px;width:280px;height:280px;color:rgba(244,178,35,.10)}
.c2 .band .wm svg{width:100%;height:100%}
.c2 .streak{position:absolute;inset:0;background:
  linear-gradient(74deg,transparent 46%,rgba(244,178,35,.16) 50%,transparent 54%),
  linear-gradient(78deg,transparent 60%,rgba(120,170,255,.18) 64%,transparent 67%);}
.c2 .band .top{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2}
.c2 .band .yr{font-family:var(--disp);font-weight:700;color:var(--gold);font-size:14px;letter-spacing:.14em}
.c2 .band .eyebrow{color:var(--gold);margin:54px 0 16px;display:block;position:relative;z-index:2}
.c2 .band h1{position:relative;z-index:2;font-family:var(--thai);font-weight:700;font-size:50px;line-height:1.05;letter-spacing:-.01em;max-width:15ch}
.c2 .band h1 em{font-style:normal;color:var(--gold)}
.c2 .band .sub{position:relative;z-index:2;margin-top:18px;color:#c7d2e6;font-size:15.5px;max-width:40ch}
.c2 .lower{flex:1;position:relative;display:grid;grid-template-columns:1.15fr .85fr}
.c2 .lower .person{position:relative;overflow:hidden;background:#fff}
.c2 .lower .person img{width:100%;height:100%;object-fit:cover;object-position:70% 28%;transform:scale(1.16);transform-origin:70% 28%}
.c2 .lower .person:after{content:"";position:absolute;left:0;top:0;bottom:0;width:100px;background:linear-gradient(90deg,#fff 30%,transparent);z-index:2}
.c2 .lower .info{padding:9mm 18mm 0 6mm;display:flex;flex-direction:column;justify-content:center;gap:14px}
.c2 .kv{display:flex;align-items:center;gap:12px}
.c2 .kv .ic{width:38px;height:38px;border-radius:11px;background:var(--cloud);color:var(--gold-deep);display:flex;align-items:center;justify-content:center;flex:none}
.c2 .kv .ic svg{width:20px;height:20px}
.c2 .kv b{display:block;font-family:var(--disp);font-weight:700;color:var(--navy);font-size:16px}
.c2 .kv span{font-size:13px;color:var(--grey)}
.c2 .foot{position:absolute;bottom:0;left:0;right:0;background:var(--gold);color:var(--navy);font-family:var(--disp);font-weight:600;font-size:12px;letter-spacing:.05em;padding:8px 18mm;display:flex;gap:16px;align-items:center;z-index:5}
.c2 .foot .sp{flex:1}

/* ===================================================== CONCEPT 3 — Dark Premium Frame */
.c3{background:radial-gradient(130% 90% at 50% -10%,var(--navy-2) 0%,var(--navy) 42%,var(--navy-deep) 100%);color:#fff;padding:18mm 16mm;display:flex;flex-direction:column;align-items:center;text-align:center}
.c3 .corner{position:absolute;width:46px;height:46px;border:2px solid var(--gold)}
.c3 .corner.tl{top:11mm;left:11mm;border-right:0;border-bottom:0}
.c3 .corner.tr{top:11mm;right:11mm;border-left:0;border-bottom:0}
.c3 .corner.bl{bottom:11mm;left:11mm;border-right:0;border-top:0}
.c3 .corner.br{bottom:11mm;right:11mm;border-left:0;border-top:0}
.c3 .pat{position:absolute;inset:0;opacity:.05;color:var(--gold);
  background-image:radial-gradient(circle, currentColor 1px, transparent 1.4px);background-size:26px 26px}
.c3 .logo{position:relative;z-index:2}
.c3 .eyebrow{color:var(--gold);margin:30px 0 8px;position:relative;z-index:2}
.c3 h1{position:relative;z-index:2;font-family:var(--thai);font-weight:700;font-size:44px;line-height:1.08;background:linear-gradient(180deg,#fff 30%,var(--gold-2) 130%);-webkit-background-clip:text;background-clip:text;color:transparent;max-width:18ch}
.c3 .ydot{position:relative;z-index:2;display:flex;align-items:center;gap:14px;color:var(--gold);font-family:var(--disp);font-weight:700;letter-spacing:.2em;margin:14px 0 22px}
.c3 .ydot i{display:block;width:36px;height:1.5px;background:var(--gold);opacity:.6}
.c3 .frame{position:relative;z-index:2;flex:1;width:100%;max-width:150mm;border-radius:18px;overflow:hidden;border:1.5px solid rgba(244,178,35,.35);box-shadow:0 30px 60px -28px rgba(0,0,0,.6);background:#fff}
.c3 .frame img{width:100%;height:100%;object-fit:cover;object-position:center top}
.c3 .sub{position:relative;z-index:2;color:#c7d2e6;font-size:15px;margin-top:20px;max-width:46ch}
.c3 .tag{position:relative;z-index:2;margin-top:14px;font-family:var(--disp);font-size:11px;letter-spacing:.3em;color:rgba(255,255,255,.55)}

/* ===================================================== CONCEPT 4 — Diagonal Dynamic */
.c4{background:#fff;position:relative;overflow:hidden}
.c4 .navy{position:absolute;inset:0;background:linear-gradient(135deg,var(--navy) 0%,var(--navy-deep) 100%);
  clip-path:polygon(0 0,100% 0,100% 38%,0 70%)}
.c4 .streak{position:absolute;inset:0;clip-path:polygon(0 0,100% 0,100% 38%,0 70%);
  background:linear-gradient(72deg,transparent 40%,rgba(244,178,35,.20) 44%,transparent 47%),
  linear-gradient(72deg,transparent 55%,rgba(120,170,255,.22) 59%,transparent 62%),
  linear-gradient(72deg,transparent 68%,rgba(244,178,35,.14) 71%,transparent 74%)}
.c4 .top{position:relative;z-index:3;padding:16mm 16mm 0;display:flex;justify-content:space-between;align-items:flex-start}
.c4 .top .yr{font-family:var(--disp);font-weight:700;color:var(--gold);font-size:14px;letter-spacing:.14em}
.c4 .head{position:relative;z-index:3;color:#fff;padding:18px 16mm 0}
.c4 .eyebrow{color:var(--gold);display:block;margin-bottom:12px}
.c4 h1{font-family:var(--thai);font-weight:700;font-size:48px;line-height:1.06;letter-spacing:-.01em;max-width:16ch}
.c4 h1 em{font-style:normal;color:var(--gold)}
.c4 .person{position:absolute;right:-4%;bottom:0;width:56%;height:74%;z-index:2;overflow:hidden}
.c4 .person img{width:100%;height:100%;object-fit:cover;object-position:60% bottom;transform:scale(1.22);transform-origin:60% bottom}
.c4 .sub{position:absolute;left:16mm;bottom:30mm;z-index:3;max-width:30ch;color:var(--navy);font-size:15.5px}
.c4 .sub .rule{margin-bottom:14px}
.c4 .sub b{color:var(--navy);font-family:var(--disp)}
.c4 .foot{position:absolute;bottom:0;left:0;right:0;z-index:4;background:var(--navy);color:#fff;font-family:var(--disp);font-size:11.5px;letter-spacing:.05em;padding:8px 16mm;display:flex;gap:16px;align-items:center}
.c4 .foot .g{color:var(--gold)} .c4 .foot .sp{flex:1}

/* ===================================================== PRODUCT PAGE */
.pp{display:flex;flex-direction:column;background:#fff}
.pp .head{padding:14mm 16mm 0;display:flex;align-items:flex-end;justify-content:space-between}
.pp .head .cat{text-align:right}
.pp .head .cat .eyebrow{color:var(--gold-deep);display:block;margin-bottom:4px}
.pp .head .cat h2{font-family:var(--thai);font-weight:700;color:var(--navy);font-size:26px}
.pp .headrule{margin:10mm 16mm 0;height:2px;background:linear-gradient(90deg,var(--navy) 0 64px,var(--line) 64px)}
.pp .grid{flex:1;padding:8mm 16mm 0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:7mm}
.card{border:1px solid var(--line);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;background:#fff}
.card .im{position:relative;aspect-ratio:1;background:var(--cloud)}
.card .im img{width:100%;height:100%;object-fit:cover}
.card .sku{position:absolute;top:9px;left:9px;font-family:var(--disp);font-weight:700;font-size:10.5px;letter-spacing:.06em;color:#fff;background:var(--navy);padding:4px 9px;border-radius:99px}
.card .bd{padding:11px 13px 13px;display:flex;flex-direction:column;flex:1}
.card h3{font-family:var(--thai);font-weight:600;color:var(--navy);font-size:14.5px;line-height:1.25;min-height:2.5em}
.card .specs{margin:7px 0;display:flex;flex-wrap:wrap;gap:5px}
.card .specs span{font-size:10.5px;color:var(--grey);background:var(--cloud);border-radius:6px;padding:3px 8px;font-family:var(--disp);font-weight:500}
.card .bottom{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;padding-top:8px;border-top:1px dashed var(--line)}
.card .price .l{font-size:9.5px;color:var(--grey);font-family:var(--disp);letter-spacing:.05em}
.card .price .v{font-family:var(--disp);font-weight:800;color:var(--gold-deep);font-size:19px;line-height:1}
.card .price .v small{font-weight:600;font-size:11px;color:var(--grey)}
.card .moq{text-align:right;font-family:var(--disp);font-size:10px;color:var(--grey)}
.card .moq b{display:block;color:var(--navy);font-size:13px}
.pp .foot{margin-top:8mm;background:var(--navy);color:#fff;padding:9px 16mm;display:flex;align-items:center;gap:16px;font-family:var(--disp);font-size:11.5px;letter-spacing:.04em}
.pp .foot .g{color:var(--gold)} .pp .foot .sp{flex:1}
.pp .foot .pg{background:var(--gold);color:var(--navy);font-weight:700;border-radius:99px;padding:3px 11px}

/* ---- print ---- */
@media print{
  @page{size:A4;margin:0}
  body{background:#fff}
  .toolbar,.label{display:none!important}
  .stage{padding:0;gap:0}
  .sheet{box-shadow:none;border-radius:0;page-break-after:always;width:210mm;height:297mm}
}`;

// ============================================================ PAGES
const ICON = {
  fast:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.5 13.2h6L9 22l8.5-11.2h-6L13 2Z"/></svg>`,
  full:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 2.5 2.5L11 4"/><path d="m4 14 2.5 2.5L11 12"/><path d="M14 6h6M14 14h6"/></svg>`,
  star:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 9.5 8.5 3 9l5 4.5L6.5 20 12 16.3 17.5 20 16 13.5 21 9l-6.5-.5L12 2Z"/></svg>`,
};
const FOOTLINE = `<span class="g">โทร 02-096-6465</span><span>LINE @gopremium</span><span class="sp"></span><span>gopremium.com</span>`;

// ---- Concept 1 — Editorial Light ----
const cover1 = `
<section class="sheet c1">
  <div class="txt">
    <div class="top">${LOGO('navy')}<span class="yr">CATALOGUE ${YEAR}</span></div>
    <span class="eyebrow">Corporate Gifts</span>
    <h1>ของขวัญองค์กร<br>ที่เป็น<em>มากกว่า</em><br>ของขวัญ</h1>
    <div class="rule"></div>
    <p class="sub">คัดสรร ออกแบบ และผลิตของพรีเมียมที่สะท้อนแบรนด์ของคุณ — ครบจบในที่เดียว</p>
  </div>
  <div class="photo"><img src="${PEOPLE.woman}" alt="GO PREMIUM"></div>
  <div class="foot">${FOOTLINE}</div>
</section>`;

// ---- Concept 2 — Two-band Spotlight ----
const cover2 = `
<section class="sheet c2">
  <div class="band">
    <div class="streak"></div>
    <div class="wm">${GIFT()}</div>
    <div class="top">${LOGO('white')}<span class="yr">VOL. ${YEAR}</span></div>
    <span class="eyebrow">Premium Corporate Gifts</span>
    <h1>ส่งมอบ<em>ความประทับใจ</em><br>ในทุกชิ้นงาน</h1>
    <p class="sub">บริการของขวัญองค์กรครบวงจร · งานด่วนพร้อมส่ง · Mockup ก่อนผลิตทุกออเดอร์</p>
  </div>
  <div class="lower">
    <div class="person"><img src="${PEOPLE.runner}" alt="GO PREMIUM"></div>
    <div class="info">
      <div class="kv"><span class="ic">${ICON.fast}</span><div><b>7–14 วัน</b><span>งานพร้อมส่ง ทันทุกเดดไลน์</span></div></div>
      <div class="kv"><span class="ic">${ICON.full}</span><div><b>ครบ จบในที่เดียว</b><span>คัด ออกแบบ ผลิต แพ็ก ส่ง</span></div></div>
      <div class="kv"><span class="ic">${ICON.star}</span><div><b>พรีเมียม คัดเกรด</b><span>คุณภาพระดับองค์กรชั้นนำ</span></div></div>
    </div>
  </div>
  <div class="foot"><span>โทร 02-096-6465</span><span>LINE @gopremium</span><span class="sp"></span><span>gopremium.com</span></div>
</section>`;

// ---- Concept 3 — Dark Premium Frame ----
const cover3 = `
<section class="sheet c3">
  <div class="pat"></div>
  <span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>
  ${LOGO('white')}
  <span class="eyebrow">The ${YEAR} Collection</span>
  <h1>ของขวัญที่ส่ง<br>มากกว่าคำขอบคุณ</h1>
  <div class="ydot"><i></i>CORPORATE GIFT CATALOGUE<i></i></div>
  <div class="frame"><img src="${PEOPLE.ai}" alt="GO PREMIUM"></div>
  <p class="sub">ตั้งแต่ไอเดียจนถึงมือผู้รับ — GO PREMIUM คือคู่คิดด้านของขวัญองค์กรที่องค์กรชั้นนำไว้วางใจ</p>
  <span class="tag">PASSION GROW TRADING CO., LTD.</span>
</section>`;

// ---- Concept 4 — Diagonal Dynamic ----
const cover4 = `
<section class="sheet c4">
  <div class="navy"></div><div class="streak"></div>
  <div class="top">${LOGO('white')}<span class="yr">CATALOGUE ${YEAR}</span></div>
  <div class="head">
    <span class="eyebrow">Go beyond the gift</span>
    <h1>เร็ว · ครบ · พรีเมียม<br>ของขวัญองค์กร<em>ครบวงจร</em></h1>
  </div>
  <div class="person"><img src="${PEOPLE.runner}" alt="GO PREMIUM"></div>
  <div class="sub"><div class="rule"></div>ของพรีเมียมกว่า <b>245 รายการ</b> พร้อมพิมพ์โลโก้ ปรับสีตามแบรนด์ และ Mockup ก่อนผลิตทุกงาน</div>
  <div class="foot">${FOOTLINE}</div>
</section>`;

// ---- Product page ----
const card = (p) => `
<div class="card">
  <div class="im"><span class="sku">${p.sku}</span><img src="${p.img}" alt="${p.name}"></div>
  <div class="bd">
    <h3>${p.name}</h3>
    <div class="specs"><span>${p.size}</span><span>${p.material}</span><span>โลโก้: ${p.logo}</span></div>
    <div class="bottom">
      <div class="price"><div class="l">เริ่มต้น / ชิ้น</div><div class="v">฿${p.price}<small></small></div></div>
      <div class="moq">ขั้นต่ำ<b>${p.moq} ชิ้น</b></div>
    </div>
  </div>
</div>`;

const productPage = `
<section class="sheet pp">
  <div class="head">
    ${LOGO('navy')}
    <div class="cat"><span class="eyebrow">หมวดหมู่ 01</span><h2>Drinkware · กระบอกน้ำ &amp; แก้ว</h2></div>
  </div>
  <div class="headrule"></div>
  <div class="grid">${PRODUCTS.map(card).join('')}</div>
  <div class="foot"><span class="g">โทร 02-096-6465</span><span>LINE @gopremium</span><span>info@passiongrow.co.th</span><span class="sp"></span><span>GO PREMIUM Catalogue ${YEAR}</span><span class="pg">01</span></div>
</section>`;

// ============================================================ ASSEMBLE
const lbl = (n,t,d) => `<div class="label"><span class="n">${n}</span>${t}<span class="desc">— ${d}</span></div>`;

const html = `<!doctype html><html lang="th"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — Catalogue Cover Concepts ${YEAR}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body>
<div class="toolbar">${GIFT_INLINE()}<b>GO PREMIUM</b> · Catalogue Design Concepts <span class="pill">A4 · พิมพ์/PDF</span><span class="pill">CI: Master Final</span><span class="sp"></span><button onclick="window.print()">⬇ บันทึกเป็น PDF</button></div>
<div class="stage">
  ${lbl('1','Editorial Light','ขาวสะอาด พรีเมียมแบบนิตยสาร · รูปผู้บริหารหญิง')}
  ${cover1}
  ${lbl('2','Two-band Spotlight','แถบกรมท่า + แถบขาว · จุดเด่นบริการ + พนักงานวิ่งส่ง')}
  ${cover2}
  ${lbl('3','Dark Premium Frame','กรมท่าเข้ม กรอบทอง หรูระดับ Exclusive')}
  ${cover3}
  ${lbl('4','Diagonal Dynamic','เส้นทแยงพลังงาน เส้นแสงพุ่ง · พลังความเร็ว')}
  ${cover4}
  ${lbl('P','Sample Product Page','ตัวอย่างหน้าสินค้า · Drinkware 6 รายการ (ข้อมูลจริง)')}
  ${productPage}
</div>
</body></html>`;

function GIFT_INLINE(){ return `<span style="width:26px;height:26px;border-radius:7px;background:#f4b223;color:#13244a;display:inline-flex;align-items:center;justify-content:center">${GIFT()}</span>`; }

const OUT = path.join(__dirname, 'catalog-concepts.html');
fs.writeFileSync(OUT, html.replace('${GIFT_INLINE()}', GIFT_INLINE()));
const kb = (fs.statSync(OUT).size/1024).toFixed(0);
console.log('✓ wrote', OUT, '('+kb+' KB)');
