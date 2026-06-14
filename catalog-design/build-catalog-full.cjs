/* GO PREMIUM — FULL Corporate Gift Catalogue (A4, print-ready, self-contained)
 * Style: "Editorial Light" (Concept 1)  ·  CI: Master Final
 *   Navy #13244a · Gold #f4b223 · Anuphan / IBM Plex Sans Thai / Sora
 * Source: real catalogue-data.js — only the 71 SKUs that have real photos.
 * Build:  node catalog-design/build-catalog-full.cjs    (run from website/)
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// ---------- data ----------
global.window = {};
// "ของเก่า" — original 71-photo set (06-09 backup). The newer 194-photo batch is intentionally NOT used yet.
require(path.join(ROOT, 'public/catalogue-data.BACKUP-2026-06-09.js'));
const ALL = global.window.GP_PRODUCTS;

const relOf = (p) => (p.img || '').split('?')[0].replace(/^\//, '');
const fileOf = (p) => path.join(ROOT, 'public', relOf(p));
const hasImg = (p) => { const r = relOf(p); return r && !/placeholder/.test(r) && fs.existsSync(path.join(ROOT, 'public', r)); };

const imgCache = new Map();
const dataURI = (absPath) => {
  if (imgCache.has(absPath)) return imgCache.get(absPath);
  const u = 'data:image/jpeg;base64,' + fs.readFileSync(absPath).toString('base64');
  imgCache.set(absPath, u);
  return u;
};
const b64 = (rel) => dataURI(path.join(ROOT, rel));

const PEOPLE = {
  runner: b64('public/banners/banner1.jpg'),
  ai:     b64('public/banners/banner2.jpg'),
  woman:  b64('public/banners/banner3.jpg'),
};

// ---------- official logo (trimmed PNG, transparent) ----------
const logoURI = (rel) => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, rel)).toString('base64');
const LOGO_NAVY  = logoURI('assets/logo-navy.png');
const LOGO_WHITE = logoURI('assets/logo-white.png');
const ICON_NAVY  = logoURI('assets/icon-navy.png');

// ---------- client logos (trusted-by wall) ----------
const CLIENTS = Array.from({length:20},(_,i)=>b64('public/clients/c'+(i+1)+'.png'));

// ---------- category config (fixed brand order) ----------
const CATS = [
  { key:'Drinkware',  en:'Drinkware',  th:'กระบอกน้ำ & แก้ว',      tag:'แก้วเก็บอุณหภูมิ กระบอกน้ำสแตนเลส ดื่มได้ทุกวัน ทุกที่' },
  { key:'Bag',        en:'Bags',       th:'กระเป๋า',               tag:'เป้ กระเป๋าผ้า ถุงผ้า ดีไซน์ใช้งานจริงในทุกโอกาส' },
  { key:'Stationery', en:'Stationery', th:'เครื่องเขียน & สมุด',    tag:'ปากกา สมุดโน้ต ของบนโต๊ะทำงานที่สะท้อนแบรนด์' },
  { key:'Fan',        en:'Mini Fan',   th:'พัดลมพกพา',             tag:'พัดลมมือถือและตั้งโต๊ะ ดีไซน์เรียบหรู พกง่าย' },
  { key:'Umbrella',   en:'Umbrella',   th:'ร่ม',                   tag:'ร่มพับ ร่มตรง กันแดดกันฝน พิมพ์โลโก้คมชัด' },
  { key:'Giftset',    en:'Gift Sets',  th:'เซ็ตของขวัญ',           tag:'เซ็ตจัดพร้อมกล่อง พร้อมมอบในโอกาสพิเศษ' },
  { key:'Lifestyle',  en:'Lifestyle',  th:'ไลฟ์สไตล์',             tag:'ของใช้ใกล้ตัว เพิ่มคุณภาพชีวิตในทุกวัน' },
];

const byCat = {};
for (const p of ALL) if (hasImg(p)) (byCat[p.cat] = byCat[p.cat] || []).push(p);
const TOTAL = CATS.reduce((s, c) => s + ((byCat[c.key] || []).length), 0); // count only categories rendered in the book

// ---------- brand glyphs ----------
const GIFT = (cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8"/><path d="M2 8.5h20V12H2z"/><path d="M12 8.5V21"/><path d="M12 8.5S10.5 4 7.8 4C6.2 4 5.5 5.2 5.5 6.2 5.5 7.7 7 8.5 12 8.5Z"/><path d="M12 8.5S13.5 4 16.2 4C17.8 4 18.5 5.2 18.5 6.2 18.5 7.7 17 8.5 12 8.5Z"/></svg>`;
const LOGO = (variant='navy', small=false) => `<img class="logo-img${small?' sm':''}" src="${variant==='white'?LOGO_WHITE:LOGO_NAVY}" alt="GO PREMIUM logo">`;
const ICON = {
  fast:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.5 13.2h6L9 22l8.5-11.2h-6L13 2Z"/></svg>`,
  full:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 2.5 2.5L11 4"/><path d="m4 14 2.5 2.5L11 12"/><path d="M14 6h6M14 14h6"/></svg>`,
  star:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 9.5 8.5 3 9l5 4.5L6.5 20 12 16.3 17.5 20 16 13.5 21 9l-6.5-.5L12 2Z"/></svg>`,
  mock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>`,
};
const YEAR = '2026';
const WEB = 'www.ผลิตของพรีเมี่ยม.com';
const PHONE = '02-096-6465';
const LINEID = '@GOPREMIUM';
const EMAIL = 'info@passiongrow.co.th';

// ---------- footer ----------
const footer = (pageNo, ctx='') => `<div class="foot">
  <span class="g">โทร ${PHONE}</span><span>LINE ${LINEID}</span><span>${WEB}</span>
  <span class="sp"></span>${ctx?`<span class="ctx">${ctx}</span>`:''}<span class="pg">${String(pageNo).padStart(2,'0')}</span>
</div>`;

// =====================================================================
//  PAGE BUILDERS
// =====================================================================

// ----- cover (Editorial Light) -----
const coverPage = () => `
<section class="sheet c1">
  <div class="txt">
    <div class="top">${LOGO('navy')}<span class="yr">CORPORATE GIFT<br>CATALOGUE · ${YEAR}</span></div>
    <span class="eyebrow">Corporate Gifts</span>
    <h1>ของขวัญองค์กร<br>ที่เป็น<em>มากกว่า</em><br>ของขวัญ</h1>
    <div class="rule"></div>
    <p class="sub">คัดสรร ออกแบบ และผลิตของพรีเมียมที่สะท้อนแบรนด์ของคุณ — ครบจบในที่เดียว</p>
  </div>
  <div class="photo"><img src="${PEOPLE.woman}" alt="GO PREMIUM"></div>
  <div class="foot"><span class="g">โทร ${PHONE}</span><span>LINE ${LINEID}</span><span class="sp"></span><span>${WEB}</span></div>
</section>`;

// ----- about / intro -----
const aboutPage = (pageNo) => `
<section class="sheet about">
  <div class="main">
    <div class="txt">
      <div class="top">${LOGO('navy')}</div>
      <span class="eyebrow">About GO PREMIUM</span>
      <h2>เราไม่ใช่แค่ร้านขายของ<br>เราคือ<em>คู่คิดด้านของขวัญ</em><br>ขององค์กรคุณ</h2>
      <div class="rule"></div>
      <p class="sub">GO PREMIUM ดูแลตั้งแต่ไอเดีย คัดสินค้า ออกแบบโลโก้ ผลิต แพ็ก จนถึงจัดส่งถึงมือผู้รับ — ครบจบในที่เดียว ด้วยมาตรฐานที่องค์กรชั้นนำไว้วางใจ</p>
      <div class="vals">
        <div class="val"><span class="ic">${ICON.fast}</span><div><b>เร็ว</b><span>งานพร้อมส่ง 7–14 วัน ทันทุกเดดไลน์</span></div></div>
        <div class="val"><span class="ic">${ICON.full}</span><div><b>ครบ</b><span>คัด ออกแบบ ผลิต แพ็ก ส่ง จบที่เดียว</span></div></div>
        <div class="val"><span class="ic">${ICON.star}</span><div><b>พรีเมียม</b><span>สินค้าคัดเกรด คุณภาพระดับองค์กร</span></div></div>
        <div class="val"><span class="ic">${ICON.mock}</span><div><b>เห็นก่อนผลิต</b><span>Mockup ทุกออเดอร์ ไม่มีเซอร์ไพรส์</span></div></div>
      </div>
      <div class="stats">
        <div><b>100,000+</b><span>ชิ้นที่ส่งมอบ</span></div>
        <div><b>${TOTAL}</b><span>รายการในเล่มนี้</span></div>
        <div><b>7–14</b><span>วัน งานพร้อมส่ง</span></div>
      </div>
    </div>
    <div class="photo"><img src="${PEOPLE.runner}" alt="GO PREMIUM"></div>
  </div>
  <div class="clients">
    <div class="clabel"><span class="ln"></span>ได้รับความไว้วางใจจากองค์กรชั้นนำ<span class="ln"></span></div>
    <div class="cgrid">${CLIENTS.map(s=>`<div class="cc"><img src="${s}" alt="ลูกค้าองค์กรของ GO PREMIUM"></div>`).join('')}</div>
  </div>
  ${footer(pageNo)}
</section>`;

// ----- table of contents -----
const tocPage = (pageNo, entries) => `
<section class="sheet toc">
  <div class="hd"><div>${LOGO('navy', true)}</div><span class="eyebrow">Contents</span></div>
  <h2 class="toc-h">สารบัญ</h2><div class="rule"></div>
  <div class="toc-list">
    ${entries.map((e, i) => `
      <a class="toc-row">
        <span class="no">${String(i+1).padStart(2,'0')}</span>
        <span class="nm"><b>${e.en}</b><small>${e.th}</small></span>
        <span class="cnt">${e.count} รายการ</span>
        <span class="dots"></span>
        <span class="pg">${String(e.page).padStart(2,'0')}</span>
      </a>`).join('')}
  </div>
  <div class="toc-note"><img class="ic" src="${ICON_NAVY}"> ทุกชิ้นพิมพ์โลโก้ได้ · ปรับสีตามแบรนด์ · มี Mockup ก่อนผลิตทุกออเดอร์ · ราคาเริ่มต้นต่อชิ้นคำนวณจากยอดสั่งซื้อ 300 ชิ้น (ปรับตามจำนวน/งานพิมพ์)</div>
  ${footer(pageNo)}
</section>`;

// ----- category divider -----
const dividerPage = (pageNo, cat, idx, count, heroImg) => `
<section class="sheet divider">
  <div class="txt">
    <div class="top">${LOGO('navy', true)}<span class="yr">หมวด ${String(idx).padStart(2,'0')} / 07</span></div>
    <span class="bignum">${String(idx).padStart(2,'0')}</span>
    <span class="eyebrow">${cat.en}</span>
    <h1>${cat.th}</h1>
    <div class="rule"></div>
    <p class="sub">${cat.tag}</p>
    <span class="cntchip">${count} รายการในหมวดนี้</span>
  </div>
  <div class="photo"><img src="${heroImg}" alt="${cat.en}"></div>
  ${footer(pageNo, cat.en)}
</section>`;

// ----- product card -----
const card = (p) => `
<div class="card">
  <div class="im"><span class="sku">${p.sku}</span><img src="${dataURI(fileOf(p))}" alt="${esc(p.name)}"></div>
  <div class="bd">
    <h3>${esc(p.name)}</h3>
    <div class="specs">${[p.size, p.material].filter(Boolean).map(s=>`<span>${esc(trim(s))}</span>`).join('')}${p.logo&&p.logo.length?`<span>โลโก้: ${esc(p.logo.join('/'))}</span>`:''}</div>
    <div class="bottom">
      <div class="price"><div class="l">เริ่มต้น / ชิ้น*</div><div class="v">฿${p.price||'—'}</div></div>
      <div class="moq">ขั้นต่ำ<b>${p.moq||'—'} ชิ้น</b></div>
    </div>
  </div>
</div>`;

// ----- grid page -----
const gridPage = (pageNo, cat, items, partLabel) => `
<section class="sheet grid-pg">
  <div class="rhead">${LOGO('navy', true)}<span class="rcat"><b>${cat.en}</b><small>${cat.th}${partLabel?` · ${partLabel}`:''}</small></span></div>
  <div class="rrule"></div>
  <div class="grid">${items.map(card).join('')}</div>
  <div class="pricenote">* ราคาเริ่มต้นต่อชิ้น คำนวณจากยอดสั่งซื้อ 300 ชิ้น · ปรับตามจำนวนและรูปแบบงานพิมพ์ · ทุกชิ้นพิมพ์โลโก้ได้</div>
  ${footer(pageNo, cat.en)}
</section>`;

// ----- closing -----
const closingPage = (pageNo) => `
<section class="sheet closing">
  <div class="pat"></div>
  <div class="inner">
    ${LOGO('white')}
    <span class="eyebrow">Let's create something memorable</span>
    <h1>พร้อมเริ่ม<em>โปรเจกต์ของขวัญ</em><br>ขององค์กรคุณแล้วหรือยัง?</h1>
    <p class="sub">ส่งโจทย์มาได้เลย — เราตอบกลับพร้อมเสนอราคาภายใน 2 ชั่วโมง และมี Mockup ให้ดูก่อนผลิตทุกออเดอร์</p>
    <div class="contact">
      <div class="cc"><span class="cl">โทรศัพท์</span><b>${PHONE}</b></div>
      <div class="cc"><span class="cl">LINE Official</span><b>${LINEID}</b></div>
      <div class="cc"><span class="cl">อีเมล</span><b>${EMAIL}</b></div>
      <div class="cc"><span class="cl">เว็บไซต์</span><b>${WEB}</b></div>
    </div>
  </div>
  <div class="photo"><img src="${PEOPLE.ai}" alt="GO PREMIUM"></div>
  <div class="brandfoot"><span>GO PREMIUM</span> · by PASSION GROW TRADING CO., LTD. · Corporate Gift Catalogue ${YEAR}</div>
</section>`;

// ---------- helpers ----------
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function trim(s){ s=String(s); return s.length>34 ? s.slice(0,32)+'…' : s; }
function chunk(arr,n){ const o=[]; for(let i=0;i<arr.length;i+=n)o.push(arr.slice(i,i+n)); return o; }
// split into balanced pages (no near-empty trailing page): e.g. 10 items, max 6 -> [5,5]; 16/6 -> [6,5,5]
function balancedChunk(arr,maxPer){
  const n=arr.length; if(!n) return [];
  const pages=Math.ceil(n/maxPer), base=Math.floor(n/pages), rem=n%pages;
  const out=[]; let i=0;
  for(let p=0;p<pages;p++){ const size=base+(p<rem?1:0); out.push(arr.slice(i,i+size)); i+=size; }
  return out;
}

// =====================================================================
//  ASSEMBLE  (two-pass: compute page numbers, then render)
// =====================================================================
const PER = 6;
// pass 1 — plan pages & numbers
let n = 0;
const plan = [];
plan.push({ kind:'cover' }); n=1;                       // cover = page 1 (number hidden)
plan.push({ kind:'about', no:++n });
const tocIndex = plan.push({ kind:'toc', no:++n }) - 1;  // placeholder, fill entries later
const tocEntries = [];
CATS.forEach((cat, i) => {
  const items = byCat[cat.key] || [];
  if (!items.length) return;
  const dividerNo = ++n;
  tocEntries.push({ en:cat.en, th:cat.th, count:items.length, page:dividerNo });
  plan.push({ kind:'divider', no:dividerNo, cat, idx:i+1, count:items.length, hero:dataURI(fileOf(items[0])) });
  const pagesOfItems = balancedChunk(items, PER);
  pagesOfItems.forEach((chunkItems, ci) => {
    plan.push({ kind:'grid', no:++n, cat, items:chunkItems, part: pagesOfItems.length>1 ? `${ci+1}/${pagesOfItems.length}` : '' });
  });
});
plan.push({ kind:'closing', no:++n });

// pass 2 — render
const body = plan.map(pg => {
  switch (pg.kind) {
    case 'cover':   return coverPage();
    case 'about':   return aboutPage(pg.no);
    case 'toc':     return tocPage(pg.no, tocEntries);
    case 'divider': return dividerPage(pg.no, pg.cat, pg.idx, pg.count, pg.hero);
    case 'grid':    return gridPage(pg.no, pg.cat, pg.items, pg.part);
    case 'closing': return closingPage(pg.no);
  }
}).join('\n');

// =====================================================================
//  STYLES
// =====================================================================
const CSS = `
:root{
  --navy:#13244a; --navy-2:#1c3566; --navy-deep:#0c1730;
  --gold:#f4b223; --gold-2:#ffcf5a; --gold-deep:#b8851c;
  --cloud:#f5f6f8; --line:#e3e7ed; --ink:#1a2230; --grey:#5b6472;
  --thai:'Anuphan','IBM Plex Sans Thai',sans-serif;
  --disp:'Sora','Anuphan',sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#dfe2e8;font-family:var(--thai);color:var(--ink);-webkit-font-smoothing:antialiased;line-height:1.55}
.toolbar{position:sticky;top:0;z-index:50;background:var(--navy);color:#fff;padding:13px 22px;display:flex;align-items:center;gap:14px;font-family:var(--disp);box-shadow:0 6px 20px -8px rgba(0,0,0,.4)}
.toolbar b{font-weight:700}.toolbar .sp{flex:1}
.toolbar .pill{font-size:12px;background:rgba(255,255,255,.12);padding:5px 12px;border-radius:99px;color:#dbe3f2}
.toolbar .glyph{width:26px;height:26px;border-radius:7px;background:var(--gold);color:var(--navy);display:inline-flex;align-items:center;justify-content:center}
.toolbar .glyph svg{width:16px;height:16px}
.toolbar button{font-family:var(--disp);font-weight:600;font-size:13px;border:0;border-radius:99px;padding:9px 18px;background:var(--gold);color:var(--navy);cursor:pointer}
.toolbar button:hover{background:var(--gold-2)}
.stage{padding:30px 16px 60px;display:flex;flex-direction:column;align-items:center;gap:26px}

.sheet{width:210mm;height:297mm;background:#fff;position:relative;overflow:hidden;box-shadow:0 20px 50px -22px rgba(15,30,60,.45)}

/* logo (official wordmark PNG) */
.logo-img{height:33px;width:auto;display:block}
.logo-img.sm{height:25px}

.eyebrow{font-family:var(--disp);font-weight:600;font-size:13px;letter-spacing:.26em;text-transform:uppercase;color:var(--navy-2)}
.rule{height:3px;width:64px;background:var(--gold);border-radius:2px}
em{font-style:normal}

/* shared footer bar */
.foot{position:absolute;bottom:0;left:0;right:0;background:var(--navy);color:#fff;padding:8px 18mm;display:flex;align-items:center;gap:16px;font-family:var(--disp);font-size:11px;letter-spacing:.04em;z-index:6}
.foot .g{color:var(--gold)}.foot .sp{flex:1}.foot .ctx{color:#aeb9cc;letter-spacing:.14em;text-transform:uppercase;font-size:10px}
.foot .pg{background:var(--gold);color:var(--navy);font-weight:800;border-radius:6px;padding:2px 9px;letter-spacing:0}

/* ============ COVER (c1) ============ */
.c1{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr auto}
.c1 .txt{padding:20mm 6mm 0 18mm;display:flex;flex-direction:column}
.c1 .txt .top{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:auto}
.c1 .txt .top .yr{font-family:var(--disp);font-weight:600;color:var(--navy-2);font-size:10px;letter-spacing:.12em;text-align:right;line-height:1.5}
.c1 .txt .eyebrow{margin-bottom:14px;display:block}
.c1 h1{font-family:var(--thai);font-weight:700;color:var(--navy);font-size:43px;line-height:1.08;letter-spacing:-.01em}
.c1 h1 em{color:var(--gold)}
.c1 .rule{margin:20px 0}
.c1 .sub{color:var(--grey);font-size:15px;max-width:32ch;margin-bottom:26mm}
.c1 .photo{grid-row:1 / span 2;grid-column:2;position:relative;overflow:hidden;background:var(--cloud)}
.c1 .photo img{width:100%;height:100%;object-fit:cover;object-position:39% center}
.c1 .photo:after{content:"";position:absolute;left:0;top:0;bottom:0;width:104px;background:linear-gradient(90deg,#fff 22%,transparent)}
.c1 .foot{position:static;grid-column:1 / -1}

/* ============ ABOUT ============ */
.about{display:flex;flex-direction:column}
.about .main{flex:1;display:grid;grid-template-columns:1.12fr .88fr;min-height:0}
.about .txt{padding:20mm 12mm 8mm 18mm;display:flex;flex-direction:column}
.about .top{margin-bottom:24px}
.about .eyebrow{display:block;margin-bottom:10px}
.about h2{font-family:var(--thai);font-weight:700;color:var(--navy);font-size:31px;line-height:1.14}
.about h2 em{color:var(--gold)}
.about .rule{margin:16px 0}
.about .sub{color:var(--grey);font-size:14px;max-width:42ch}
.about .vals{margin:22px 0 auto;display:grid;grid-template-columns:1fr 1fr;gap:16px}
.about .val{display:flex;gap:11px;align-items:flex-start}
.about .val .ic{width:36px;height:36px;border-radius:10px;background:var(--cloud);color:var(--gold-deep);display:flex;align-items:center;justify-content:center;flex:none}
.about .val .ic svg{width:19px;height:19px}
.about .val b{display:block;font-family:var(--disp);font-weight:700;color:var(--navy);font-size:15px}
.about .val span{font-size:12px;color:var(--grey);line-height:1.4}
.about .stats{display:flex;gap:10px;border-top:1px solid var(--line);padding-top:16px;margin-top:16px}
.about .stats>div{flex:1}
.about .stats b{font-family:var(--disp);font-weight:800;color:var(--navy);font-size:23px;display:block;line-height:1}
.about .stats span{font-size:11px;color:var(--grey)}
.about .photo{position:relative;overflow:hidden;background:var(--cloud)}
.about .photo img{width:100%;height:100%;object-fit:cover;object-position:52% 28%}
.about .photo:after{content:"";position:absolute;left:0;top:0;bottom:0;width:96px;background:linear-gradient(90deg,#fff 24%,transparent)}
.about .clients{padding:15px 18mm 14mm;border-top:1px solid var(--line);background:#fff}
.about .clabel{display:flex;align-items:center;justify-content:center;gap:14px;font-family:var(--disp);font-weight:600;font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--grey);margin-bottom:14px}
.about .clabel .ln{height:1px;width:42px;background:var(--line)}
.about .cgrid{display:grid;grid-template-columns:repeat(10,1fr);gap:14px 16px;align-items:center}
.about .cc{display:flex;align-items:center;justify-content:center;height:27px}
.about .cc img{max-width:100%;max-height:100%;width:auto;object-fit:contain}

/* ============ TOC ============ */
.toc{padding:20mm 18mm 0}
.toc .hd{display:flex;align-items:center;justify-content:space-between}
.toc-h{font-family:var(--thai);font-weight:700;color:var(--navy);font-size:38px;margin-top:24px}
.toc .rule{margin:14px 0 10px}
.toc-list{margin-top:14px}
.toc-row{display:flex;align-items:center;gap:16px;padding:17px 4px;border-bottom:1px solid var(--line)}
.toc-row .no{font-family:var(--disp);font-weight:800;font-size:18px;color:var(--gold-deep);width:34px}
.toc-row .nm b{font-family:var(--disp);font-weight:700;font-size:18px;color:var(--navy)}
.toc-row .nm small{display:block;font-size:13px;color:var(--grey)}
.toc-row .cnt{font-family:var(--disp);font-size:12px;color:var(--grey);white-space:nowrap}
.toc-row .dots{flex:1;border-bottom:2px dotted var(--line);height:1px;margin-bottom:5px}
.toc-row .pg{font-family:var(--disp);font-weight:800;font-size:18px;color:var(--navy)}
.toc-note{margin-top:26px;background:var(--cloud);border-left:3px solid var(--gold);border-radius:8px;padding:13px 16px;font-size:12.5px;color:var(--grey);display:flex;align-items:center;gap:10px;line-height:1.5}
.toc-note .ic{height:26px;width:auto;flex:none}

/* ============ DIVIDER ============ */
.divider{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr auto}
.divider .txt{padding:20mm 6mm 0 18mm;display:flex;flex-direction:column;position:relative}
.divider .top{display:flex;align-items:center;gap:14px;margin-bottom:auto}
.divider .top .yr{font-family:var(--disp);font-weight:600;color:var(--gold-deep);font-size:10.5px;letter-spacing:.1em;padding-left:14px;border-left:1px solid var(--line)}
.divider .bignum{font-family:var(--disp);font-weight:800;font-size:120px;line-height:.8;color:var(--cloud);letter-spacing:-.04em;margin-bottom:-10px}
.divider .eyebrow{display:block;margin-bottom:6px}
.divider h1{font-family:var(--thai);font-weight:700;color:var(--navy);font-size:46px;line-height:1.06}
.divider .rule{margin:18px 0}
.divider .sub{color:var(--grey);font-size:15px;max-width:30ch}
.divider .cntchip{margin:18px 0 26mm;align-self:flex-start;font-family:var(--disp);font-weight:600;font-size:12px;color:var(--navy);background:var(--cloud);border:1px solid var(--line);border-radius:99px;padding:7px 15px}
.divider .photo{grid-row:1 / span 2;grid-column:2;position:relative;overflow:hidden;background:var(--cloud)}
.divider .photo img{width:100%;height:100%;object-fit:cover;object-position:center}
.divider .photo:after{content:"";position:absolute;left:0;top:0;bottom:0;width:80px;background:linear-gradient(90deg,#fff,transparent)}
.divider .foot{grid-column:1 / -1}

/* ============ GRID PAGE ============ */
.grid-pg{display:flex;flex-direction:column}
.rhead{padding:14mm 18mm 0;display:flex;align-items:center;justify-content:space-between}
.rhead .rcat{text-align:right}
.rhead .rcat b{font-family:var(--disp);font-weight:700;color:var(--navy);font-size:17px}
.rhead .rcat small{display:block;font-size:12px;color:var(--grey)}
.rrule{margin:9mm 18mm 0;height:2px;background:linear-gradient(90deg,var(--navy) 0 56px,var(--line) 56px)}
.grid{flex:1;padding:7mm 18mm 18mm;display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:max-content;gap:6mm;align-content:start}
.card{border:1px solid var(--line);border-radius:13px;overflow:hidden;display:flex;flex-direction:column;background:#fff}
.card .im{position:relative;aspect-ratio:1;background:var(--cloud)}
.card .im img{width:100%;height:100%;object-fit:cover}
.card .sku{position:absolute;top:8px;left:8px;font-family:var(--disp);font-weight:700;font-size:10px;letter-spacing:.05em;color:#fff;background:var(--navy);padding:4px 9px;border-radius:99px}
.card .bd{padding:10px 12px 12px;display:flex;flex-direction:column;flex:1}
.card h3{font-family:var(--thai);font-weight:600;color:var(--navy);font-size:13.5px;line-height:1.25;min-height:2.4em}
.card .specs{margin:6px 0;display:flex;flex-wrap:wrap;gap:4px}
.card .specs span{font-size:9.5px;color:var(--grey);background:var(--cloud);border-radius:6px;padding:3px 7px;font-family:var(--disp);font-weight:500}
.card .bottom{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;padding-top:8px;border-top:1px dashed var(--line)}
.card .price .l{font-size:9px;color:var(--grey);font-family:var(--disp);letter-spacing:.04em}
.card .price .v{font-family:var(--disp);font-weight:800;color:var(--gold-deep);font-size:18px;line-height:1}
.card .moq{text-align:right;font-family:var(--disp);font-size:9.5px;color:var(--grey)}
.card .moq b{display:block;color:var(--navy);font-size:12.5px}
.pricenote{position:absolute;left:18mm;right:18mm;bottom:11mm;font-family:var(--disp);font-size:9.5px;color:var(--grey);letter-spacing:.01em}

/* ============ CLOSING ============ */
.closing{background:radial-gradient(130% 90% at 30% 0%,var(--navy-2) 0%,var(--navy) 46%,var(--navy-deep) 100%);color:#fff;display:grid;grid-template-columns:1.05fr .95fr;position:relative}
.closing .pat{position:absolute;inset:0;opacity:.05;color:var(--gold);background-image:radial-gradient(circle,currentColor 1px,transparent 1.4px);background-size:26px 26px}
.closing .inner{padding:22mm 10mm 16mm 18mm;display:flex;flex-direction:column;position:relative;z-index:2}
.closing .eyebrow{color:var(--gold);display:block;margin:28px 0 10px}
.closing h1{font-family:var(--thai);font-weight:700;font-size:36px;line-height:1.12}
.closing h1 em{color:var(--gold)}
.closing .sub{color:#c7d2e6;font-size:14.5px;margin:16px 0 26px;max-width:42ch}
.closing .contact{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:auto}
.closing .cc{border-top:1px solid rgba(255,255,255,.18);padding-top:11px}
.closing .cc .cl{font-family:var(--disp);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.closing .cc b{display:block;font-family:var(--disp);font-weight:700;font-size:17px;margin-top:3px}
.closing .photo{position:relative;overflow:hidden;z-index:2}
.closing .photo img{width:100%;height:100%;object-fit:cover;object-position:43% 16%;transform:scale(1.3);transform-origin:43% 16%}
.closing .photo:after{content:"";position:absolute;left:0;top:0;bottom:0;width:110px;background:linear-gradient(90deg,var(--navy) 18%,transparent);z-index:2}
.closing .photo:before{content:"";position:absolute;right:0;top:0;bottom:0;width:90px;background:linear-gradient(270deg,var(--navy-deep) 10%,transparent);z-index:2}
.closing .brandfoot{position:absolute;bottom:0;left:0;right:0;z-index:3;background:rgba(0,0,0,.25);color:rgba(255,255,255,.7);font-family:var(--disp);font-size:10.5px;letter-spacing:.06em;padding:8px 18mm;text-align:center}
.closing .brandfoot span{color:var(--gold);font-weight:700}

@media print{
  @page{size:A4;margin:0}
  body{background:#fff}
  .toolbar,.stage>.lbl{display:none!important}
  .stage{padding:0;gap:0}
  .sheet{box-shadow:none;page-break-after:always}
}`;

const html = `<!doctype html><html lang="th"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — Corporate Gift Catalogue ${YEAR}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<div class="toolbar"><span class="glyph">${GIFT()}</span><b>GO PREMIUM</b> · Corporate Gift Catalogue ${YEAR} <span class="pill">${plan.length} หน้า A4</span><span class="pill">${TOTAL} รายการ</span><span class="pill">Editorial Light</span><span class="sp"></span><button onclick="window.print()">⬇ บันทึกเป็น PDF</button></div>
<div class="stage">
${body}
</div></body></html>`;

const OUT = path.join(__dirname, 'catalog-full.html');
fs.writeFileSync(OUT, html);
console.log('✓ wrote', OUT, '('+(fs.statSync(OUT).size/1024/1024).toFixed(2)+' MB) ·', plan.length, 'pages ·', TOTAL, 'products');
