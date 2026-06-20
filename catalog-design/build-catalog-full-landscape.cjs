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
// Curated quick-ship set (~71 SKUs from the original Google-Drive batch). Intentionally NOT the full 253-photo catalogue.
// Backup was relocated to the project archive during the folder reorg.
require(path.join(ROOT, '..', '90-ARCHIVE/website-temp/catalogue-data.BACKUP-2026-06-09.js'));
const ALL = global.window.GP_PRODUCTS;

const relOf = (p) => (p.img || '').split('?')[0].replace(/^\//, '');
const fileOf = (p) => path.join(ROOT, 'public', relOf(p));
const relU = (u) => (u || '').split('?')[0].replace(/^\//, '');
const existsU = (u) => { const r = relU(u); return r && !/placeholder/.test(r) && fs.existsSync(path.join(ROOT, 'public', r)); };
const hasImg = (p) => { const r = relOf(p); return r && !/placeholder/.test(r) && fs.existsSync(path.join(ROOT, 'public', r)); };
// up to 3 extra gallery views (excludes the main image), as abs paths
const thumbFilesOf = (p) => (p.gallery || []).filter(existsU)
  .filter(u => relU(u) !== relOf(p)).slice(0, 3)
  .map(u => path.join(ROOT, 'public', relU(u)));

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
  woman:  b64('public/banners/banner3-cover.jpg'),   // gold gift-glyph baked out (replaced by GO PREMIUM icon overlay)
};

// ---------- official logo (trimmed PNG, transparent) ----------
const logoURI = (rel) => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, rel)).toString('base64');
const LOGO_NAVY  = logoURI('assets/logo-navy.png');
const LOGO_WHITE = logoURI('assets/logo-white.png');
const ICON_NAVY  = logoURI('assets/icon-navy.png');
const ICON_WHITE = logoURI('assets/icon-white.png');

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
  <span class="yr-corner">CATALOGUE · ${YEAR}</span>
  <div class="txt">
    <div class="top">${LOGO('navy')}</div>
    <span class="eyebrow">Corporate Gifts</span>
    <h1>ของขวัญองค์กร<br>ที่เป็น<em>มากกว่า</em><br>ของขวัญ</h1>
    <div class="rule"></div>
    <p class="sub">คัดสรร ออกแบบ และผลิตของพรีเมียมที่สะท้อนแบรนด์ของคุณ — ครบจบในที่เดียว</p>
  </div>
  <div class="photo"><img src="${PEOPLE.woman}" alt="GO PREMIUM"><img class="boxlogo" src="${ICON_WHITE}" alt="GO PREMIUM"></div>
  <div class="foot"><span class="g">โทร ${PHONE}</span><span>LINE ${LINEID}</span><span class="sp"></span><span>${WEB}</span></div>
</section>`;

// ----- about / intro -----
const aboutPage = (pageNo) => `
<section class="sheet about">
  <div class="main">
    <div class="txt">
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
  <div class="hd"><span class="eyebrow">Contents</span><span class="pgmark">${YEAR}</span></div>
  <h2 class="toc-h">สารบัญ</h2><div class="rule"></div>
  <div class="toc-list">
    ${entries.map((e, i) => `
      <a class="toc-row${e.exclusive?' ex-row':''}">
        <span class="no">${e.exclusive?'✦':String(i+1).padStart(2,'0')}</span>
        <span class="nm"><b>${e.en}</b><small>${e.th}</small></span>
        <span class="cnt">${e.exclusive?e.count:`${e.count} รายการ`}</span>
        <span class="dots"></span>
        <span class="pg">${String(e.page).padStart(2,'0')}</span>
      </a>`).join('')}
  </div>
  <div class="toc-note"><img class="ic" src="${ICON_NAVY}"> ทุกชิ้นพิมพ์โลโก้ได้ · ปรับสีตามแบรนด์ · มี Mockup ก่อนผลิตทุกออเดอร์ · ราคาเริ่มต้นต่อชิ้นคำนวณจากยอดสั่งซื้อ 300 ชิ้น (ปรับตามจำนวน/งานพิมพ์)</div>
  ${footer(pageNo)}
</section>`;

// "YOUR LOGO" placeholder spot per category (tuned to sit on the product's screen area)
// Real imprint area per product type, mapped onto each hero photo's angle (top/left % of the cropped photo).
const LOGO_SPOT = {
  Drinkware:{t:50,l:52},   // bottle: center of body front
  Bag:{t:58,l:47},         // tote: center of front panel, below handles
  Stationery:{t:60,l:33},  // pen: middle of the barrel (lies diagonally)
  Fan:{t:67,l:50},         // mini fan: flat of the handle, below the button
  Umbrella:{t:44,l:33},    // umbrella: an outer canopy panel
  Giftset:{t:42,l:40},     // notebook: cover, above the elastic strap
  Lifestyle:{t:60,l:33},   // card holder: front lower panel
};
// ----- category divider -----
const dividerPage = (pageNo, cat, idx, count, heroImg) => {
  const sp = LOGO_SPOT[cat.key] || {t:50,l:54};
  return `
<section class="sheet divider">
  <div class="txt">
    <div class="top"><img class="mono" src="${ICON_NAVY}" alt="GO PREMIUM"><span class="yr">หมวด ${String(idx).padStart(2,'0')} / 07</span></div>
    <span class="bignum">${String(idx).padStart(2,'0')}</span>
    <span class="eyebrow">${cat.en}</span>
    <h1>${cat.th}</h1>
    <div class="rule"></div>
    <p class="sub">${cat.tag}</p>
    <span class="cntchip">${count} รายการในหมวดนี้</span>
  </div>
  <div class="photo"><img src="${heroImg}" alt="${cat.en}"><span class="logospot" style="top:${sp.t}%;left:${sp.l}%">YOUR<br>LOGO</span></div>
  ${footer(pageNo, cat.en)}
</section>`;
};

// ----- product card · "Elevated" (white card, soft shadow, no stroke) + gallery thumbnails -----
const card = (p) => {
  const thumbs = thumbFilesOf(p).map(f => `<span class="t"><img src="${dataURI(f)}" alt=""></span>`).join('');
  return `
<div class="card">
  <div class="im">
    <div class="main"><img src="${dataURI(fileOf(p))}" alt="${esc(p.name)}"></div>
    ${thumbs ? `<div class="th">${thumbs}</div>` : ''}
  </div>
  <div class="bd">
    <span class="sku">${p.sku}</span>
    <h3>${esc(p.name)}</h3>
    <div class="specs">${[primarySize(p.size), condenseMaterial(p.material)].filter(Boolean).map(s=>esc(trim(s,26))).join('  ·  ')}</div>
    <div class="cfoot">
      <div class="price"><span>เริ่มต้น/ชิ้น*</span><b><i>฿</i>${p.price||'—'}</b></div>
      <div class="moq"><span>ขั้นต่ำ</span><b>${p.moq||'—'} ชิ้น</b></div>
    </div>
  </div>
</div>`;
};

// ----- grid page -----
const gridPage = (pageNo, cat, items, partLabel) => `
<section class="sheet grid-pg">
  <div class="rhead"><span class="rcat"><b>${cat.en}</b><small>${cat.th}${partLabel?` · ${partLabel}`:''}</small></span><img class="mono" src="${ICON_NAVY}" alt="GO PREMIUM"></div>
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
    <span class="eyebrow">Free Consultation</span>
    <h1><em>ปรึกษาฟรี</em><br>ทุกขั้นตอน ไม่มีค่าใช้จ่าย</h1>
    <p class="sub">ตั้งแต่ไอเดีย คัดสินค้า ออกแบบโลโก้ จนถึงผลิต — ปรึกษาเราได้ฟรี · ติดต่อทันทีผ่าน 4 ช่องทางด้านล่าง ตอบกลับพร้อมเสนอราคาภายใน 2 ชั่วโมง</p>
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

// =====================================================================
//  GO PREMIUM · EXCLUSIVE  (top-tier sub-brand spread — back of book)
//  Palette: Exclusive Navy #0B1D3A · Champagne Gold #CAA14E · Silver #C2CAD6
//  Standalone source of truth: public/exclusive.html
// =====================================================================
const EX_PILLARS = [
  { no:'I',  t:'งานสั่งทำพิเศษ',       d:'Tailor Made แท้จริง — ปรับได้ตั้งแต่วัสดุ สี โครงสร้าง จนถึงบรรจุภัณฑ์ ให้เข้ากับแบรนด์และโอกาสของลูกค้าคนสำคัญ' },
  { no:'II', t:'คุณภาพระดับสูง',        d:'วัสดุและงานผลิตคัดสรรเหนือไลน์ปกติ ตรวจงานทุกชิ้นด้วยมือ เพื่อความประทับใจขั้นสูงสุดของผู้รับ' },
  { no:'III',t:'ความร่วมมือกับแบรนด์',  d:'Co-brand กับแบรนด์ชั้นนำ สร้างคอลเลกชันพิเศษเฉพาะกลุ่มลูกค้าคนสำคัญ — งานที่หาไม่ได้จากที่อื่น' },
];
const EX_STEPS = [
  { n:'01', t:'ปรึกษาส่วนตัว',        d:'เข้าใจแบรนด์ โอกาส งบประมาณ และกลุ่มผู้รับ' },
  { n:'02', t:'คัดสรรวัสดุ',          d:'เลือกวัสดุ สี เมทัลทอง–เงิน และพื้นผิว' },
  { n:'03', t:'ออกแบบ & Mockup',      d:'ออกแบบเฉพาะราย เห็นภาพจริงก่อนผลิต 100%' },
  { n:'04', t:'ผลิตงานฝีมือ',         d:'ผลิตประณีต ตรวจคุณภาพทุกชิ้นด้วยมือ' },
  { n:'05', t:'ส่งมอบประสบการณ์',     d:'ส่งตรงเวลาในบรรจุภัณฑ์สั่งทำ ดูแลแบบ Private' },
];
const EX_CRAFT = [
  { t:'วัสดุชั้นเยี่ยม',        d:'ทองเมทัลลิกฟอยล์และเงินเมทัลรอง สัมผัสหรูแบบเครื่องประดับชั้นดี' },
  { t:'งานเนี้ยบทุกมิลลิเมตร',  d:'ตรวจงานทุกชิ้นด้วยมือ ใส่ใจรายละเอียดที่มองข้ามไม่ได้' },
  { t:'บรรจุภัณฑ์สั่งทำ',       d:'กล่อง ริบบิน ดีเทลเฉพาะแบรนด์ เปลี่ยนการแกะกล่องเป็นประสบการณ์' },
];

// ----- Exclusive intro (dark hero + 3 pillars) -----
const exclusiveIntroPage = (pageNo) => `
<section class="sheet ex ex-intro">
  <div class="ex-dot"></div><div class="ex-glow g1"></div><div class="ex-glow g2"></div>
  <div class="ex-hd">
    <img class="ex-logo" src="${LOGO_WHITE}" alt="GO PREMIUM">
    <span class="ex-tier">Exclusive · Top Tier ${YEAR}</span>
  </div>
  <div class="ex-hero">
    <div class="ex-crest"><span class="ln"></span><span class="gp">GO PREMIUM</span><span class="ln"></span></div>
    <h1 class="ex-word foil">EXCLUSIVE</h1>
    <p class="ex-sub">ของขวัญพรีเมียม <b>สำหรับคนสำคัญ</b></p>
    <p class="ex-lead">เทียร์บนสุดของ GO PREMIUM — ไม่ใช่แบรนด์ใหม่ แต่คือดีเอ็นเอเดียวกันที่ประณีตและพิเศษกว่าทุกขั้น คัดสรรสำหรับลูกค้า VIP คู่ค้าคนสำคัญ และแคมเปญ co-brand</p>
    <svg class="ex-orn" width="200" height="14" viewBox="0 0 200 14" fill="none"><path d="M0 7h84M200 7h-84" stroke="var(--ex-gold)" stroke-width="1" opacity=".5"/><path d="M100 1l4 6-4 6-4-6 4-6Z" stroke="var(--ex-gold)" stroke-width="1"/></svg>
  </div>
  <div class="ex-pillars">
    ${EX_PILLARS.map(p=>`<div class="ex-pl"><span class="rn">${p.no}</span><h3>${p.t}</h3><p>${p.d}</p></div>`).join('')}
  </div>
  <div class="ex-foot"><span class="g">EXCLUSIVE</span><span>โทร ${PHONE}</span><span>LINE ${LINEID}</span><span class="sp"></span><span class="ctx">By Appointment Only</span><span class="pg">${String(pageNo).padStart(2,'0')}</span></div>
</section>`;

// ----- Exclusive process + craft + consult CTA -----
const exclusiveProcessPage = (pageNo) => `
<section class="sheet ex ex-proc">
  <div class="ex-dot"></div><div class="ex-glow g2"></div>
  <div class="ex-hd">
    <span class="ex-eyebrow">Tailor Made · งานสั่งทำพิเศษ</span>
    <span class="ex-tier">By Appointment Only</span>
  </div>
  <h2 class="ex-h2">กระบวนการที่พิถีพิถัน <em>ทีละขั้น</em></h2>
  <div class="ex-rule"></div>
  <div class="ex-steps">
    ${EX_STEPS.map((s,i)=>`<div class="ex-step"><span class="sn serif">${s.n}</span><div class="sln${i===EX_STEPS.length-1?' last':''}"></div><h4>${s.t}</h4><p>${s.d}</p></div>`).join('')}
  </div>
  <div class="ex-craft">
    ${EX_CRAFT.map(c=>`<div class="ex-cf"><span class="dia"></span><div><b>${c.t}</b><span>${c.d}</span></div></div>`).join('')}
  </div>
  <div class="ex-cta">
    <div class="l">
      <span class="lab">Private Consultation</span>
      <h3>เริ่มงานสั่งทำพิเศษของคุณวันนี้</h3>
      <p>ที่ปรึกษาส่วนตัวดูแลตั้งแต่แนวคิดถึงส่งมอบ · ตอบกลับพร้อมเสนอราคาเบื้องต้นภายใน 2 ชั่วโมง</p>
    </div>
    <div class="r">
      <div class="ch"><span>โทรศัพท์</span><b>${PHONE}</b></div>
      <div class="ch"><span>LINE Official</span><b>${LINEID}</b></div>
      <div class="ch"><span>อีเมล</span><b>${EMAIL}</b></div>
      <div class="ch"><span>เว็บไซต์ · /exclusive</span><b>${WEB}</b></div>
    </div>
  </div>
  <div class="ex-foot"><span class="g">EXCLUSIVE</span><span>by GO PREMIUM</span><span class="sp"></span><span class="ctx">Go beyond the gift</span><span class="pg">${String(pageNo).padStart(2,'0')}</span></div>
</section>`;

// ---------- helpers ----------
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function trim(s,n=34){ s=String(s); return s.length>n ? s.slice(0,n-1)+'…' : s; }
// Product Detail consistency: collapse multi-size lists to ONE primary size, and shorten verbose materials.
function primarySize(s){ if(!s) return ''; return String(s).split(/\n|\s\/\s/)[0].replace(/\s+/g,' ').trim(); }
function condenseMaterial(s){
  if(!s) return '';
  s = String(s).replace(/\s+/g,' ').trim();
  s = s.replace('ด้านในสแตนเลส 304 ด้านนอกสแตนเลส 201','สแตนเลส 304/201');
  s = s.replace('ผ้า Pongee เคลือบไวนิล','ผ้า Pongee');
  s = s.replace(/\s*\/\s*กระดาษ.*$/,'');   // drop trailing "/ กระดาษ NN แกรม"
  return s;
}
function chunk(arr,n){ const o=[]; for(let i=0;i<arr.length;i+=n)o.push(arr.slice(i,i+n)); return o; }
// split into balanced pages (no near-empty trailing page): e.g. 10 items, max 8 -> [5,5]; 11/8 -> [6,5]
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
// ---- GO PREMIUM Exclusive (back-of-book sub-brand spread) ----
const exclusiveNo = ++n;
tocEntries.push({ en:'Exclusive', th:'เทียร์บนสุด · งานสั่งทำพิเศษ', count:'Top Tier', page:exclusiveNo, exclusive:true });
plan.push({ kind:'excl-intro', no:exclusiveNo });
plan.push({ kind:'excl-proc',  no:++n });
plan.push({ kind:'closing', no:++n });

// pass 2 — render
const body = plan.map(pg => {
  switch (pg.kind) {
    case 'cover':   return coverPage();
    case 'about':   return aboutPage(pg.no);
    case 'toc':     return tocPage(pg.no, tocEntries);
    case 'divider': return dividerPage(pg.no, pg.cat, pg.idx, pg.count, pg.hero);
    case 'grid':    return gridPage(pg.no, pg.cat, pg.items, pg.part);
    case 'excl-intro': return exclusiveIntroPage(pg.no);
    case 'excl-proc':  return exclusiveProcessPage(pg.no);
    case 'closing': return closingPage(pg.no);
  }
}).join('\n');

// =====================================================================
//  STYLES
// =====================================================================
// ----- product-card CSS · "Elevated" (white card, soft shadow, no stroke) + gallery thumbs -----
const CARD_CSS = `
.card{position:relative;display:flex;flex-direction:column;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 12px 30px -15px rgba(15,30,60,.32),0 3px 8px -4px rgba(15,30,60,.12)}
.card .im{height:43mm;min-height:0;display:flex;gap:9px;padding:11px 13px;background:#fff}
.card .main{flex:1;min-width:0;display:flex;align-items:center;justify-content:center}
.card .main img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}
.card .th{width:70px;flex:none;display:flex;flex-direction:column;gap:7px}
.card .th .t{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
.card .th .t img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}
.card .bd{padding:4px 15px 14px;display:flex;flex-direction:column;flex:1}
.card .sku{font-family:var(--disp);font-weight:700;font-size:9px;letter-spacing:.12em;color:var(--gold-deep);display:block;margin-bottom:3px}
.card h3{font-family:var(--thai);font-weight:600;color:var(--navy);font-size:13.5px;line-height:1.26;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .specs{font-family:var(--disp);font-size:11px;color:var(--grey);margin:3px 0 0;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card .cfoot{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;border-top:1px solid var(--line);padding-top:10px}
.card .cfoot .price span{display:block;font-family:var(--disp);font-size:9px;color:var(--grey)}
.card .cfoot .price b{font-family:var(--disp);font-weight:800;font-size:23px;color:var(--navy);line-height:1}
.card .cfoot .price b i{font-style:normal;font-size:14px;color:var(--gold-deep);font-weight:700;margin-right:1px}
.card .cfoot .moq{text-align:right}
.card .cfoot .moq span{display:block;font-family:var(--disp);font-size:9px;color:var(--grey)}
.card .cfoot .moq b{font-family:var(--disp);font-weight:600;font-size:12px;color:var(--navy)}`;

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

.sheet{width:297mm;height:210mm;background:#fff;position:relative;overflow:hidden;box-shadow:0 20px 50px -22px rgba(15,30,60,.45)}

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
.c1{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr auto;position:relative}
.c1 .yr-corner{position:absolute;top:13mm;right:13mm;z-index:6;font-family:var(--disp);font-weight:600;font-size:10px;letter-spacing:.2em;color:var(--navy-2);text-align:right}
.c1 .txt{padding:15mm 8mm 0 18mm;display:flex;flex-direction:column}
.c1 .txt .top{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:auto}
.c1 .txt .top .yr{font-family:var(--disp);font-weight:600;color:var(--navy-2);font-size:10px;letter-spacing:.12em;text-align:right;line-height:1.5}
.c1 .txt .eyebrow{margin-bottom:14px;display:block}
.c1 h1{font-family:var(--thai);font-weight:700;color:var(--navy);font-size:43px;line-height:1.08;letter-spacing:-.01em}
.c1 h1 em{color:var(--gold)}
.c1 .rule{margin:20px 0}
.c1 .sub{color:var(--grey);font-size:15px;max-width:32ch;margin-bottom:14mm}
.c1 .photo{grid-row:1 / span 2;grid-column:2;position:relative;overflow:hidden;background:var(--cloud)}
.c1 .photo img{width:100%;height:100%;object-fit:cover;object-position:48% center;transform:scale(1.36);transform-origin:48% center;filter:saturate(.72) brightness(.99) contrast(1.02)}
.c1 .photo:after{content:"";position:absolute;left:0;top:0;bottom:0;width:150px;background:linear-gradient(90deg,#fff 52%,transparent);z-index:2}
.c1 .photo:before{content:"";position:absolute;right:0;top:0;bottom:0;width:250px;background:linear-gradient(270deg,#fff 64%,transparent);z-index:2}
.c1 .photo .boxlogo{position:absolute;z-index:3;left:27.5%;top:77%;width:52px;height:auto;filter:none;transform:translate(-50%,-50%) rotate(7deg) skewX(-4deg)}
.c1 .foot{position:static;grid-column:1 / -1}

/* ============ ABOUT ============ */
.about{display:flex;flex-direction:column}
.about .main{flex:1;display:grid;grid-template-columns:1.12fr .88fr;min-height:0}
.about .txt{padding:13mm 12mm 6mm 18mm;display:flex;flex-direction:column}
.about .top{margin-bottom:14px}
.about .eyebrow{display:block;margin-bottom:10px}
.about h2{font-family:var(--thai);font-weight:700;color:var(--navy);font-size:31px;line-height:1.14}
.about h2 em{color:var(--gold)}
.about .rule{margin:16px 0}
.about .sub{color:var(--grey);font-size:14px;max-width:42ch}
.about .vals{margin:16px 0 auto;display:grid;grid-template-columns:1fr 1fr;gap:13px 16px}
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
.about .photo img{width:100%;height:100%;object-fit:cover;object-position:52% 26%;transform:scale(1.34);transform-origin:52% 26%}
.about .photo:after{content:"";position:absolute;left:0;top:0;bottom:0;width:150px;background:linear-gradient(90deg,#fff 52%,transparent);z-index:2}
.about .photo:before{content:"";position:absolute;right:0;top:0;bottom:0;width:140px;background:linear-gradient(270deg,#fff 40%,transparent);z-index:2}
.about .clients{padding:12px 16mm 17mm;border-top:1px solid var(--line);background:#fff}
.about .clabel{display:flex;align-items:center;justify-content:center;gap:14px;font-family:var(--disp);font-weight:600;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--grey);margin-bottom:10px}
.about .clabel .ln{height:1px;width:42px;background:var(--line)}
.about .cgrid{display:grid;grid-template-columns:repeat(10,1fr);gap:11px 18px;align-items:center}
.about .cc{display:flex;align-items:center;justify-content:center;height:24px}
.about .cc img{max-width:100%;max-height:100%;width:auto;object-fit:contain}

/* ============ TOC ============ */
.toc{padding:11mm 18mm 0}
.toc .hd{display:flex;align-items:center;justify-content:space-between}
.toc .hd .pgmark{font-family:var(--disp);font-weight:600;font-size:10px;letter-spacing:.2em;color:var(--grey)}
.toc-h{font-family:var(--thai);font-weight:700;color:var(--navy);font-size:32px;margin-top:8px}
.toc .rule{margin:12px 0 8px}
.toc-list{margin-top:10px}
.toc-row{display:flex;align-items:center;gap:16px;padding:7px 4px;border-bottom:1px solid var(--line)}
.toc-row .no{font-family:var(--disp);font-weight:800;font-size:18px;color:var(--gold-deep);width:34px}
.toc-row .nm b{font-family:var(--disp);font-weight:700;font-size:18px;color:var(--navy)}
.toc-row .nm small{display:block;font-size:13px;color:var(--grey)}
.toc-row .cnt{font-family:var(--disp);font-size:12px;color:var(--grey);white-space:nowrap}
.toc-row .dots{flex:1;border-bottom:2px dotted var(--line);height:1px;margin-bottom:5px}
.toc-row .pg{font-family:var(--disp);font-weight:800;font-size:18px;color:var(--navy)}
.toc-note{margin-top:12px;background:var(--cloud);border-left:3px solid var(--gold);border-radius:8px;padding:11px 15px;font-size:12px;color:var(--grey);display:flex;align-items:center;gap:10px;line-height:1.45}
.toc-note .ic{height:26px;width:auto;flex:none}

/* ============ DIVIDER ============ */
.divider{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr auto}
.divider .txt{padding:14mm 8mm 0 18mm;display:flex;flex-direction:column;position:relative}
.divider .top{display:flex;align-items:center;gap:14px;margin-bottom:auto}
.divider .top .mono{height:30px;width:auto;display:block}
.divider .top .yr{font-family:var(--disp);font-weight:600;color:var(--gold-deep);font-size:10.5px;letter-spacing:.1em;padding-left:14px;border-left:1px solid var(--line)}
.divider .bignum{font-family:var(--disp);font-weight:800;font-size:92px;line-height:.8;color:var(--cloud);letter-spacing:-.04em;margin-bottom:-6px}
.divider .eyebrow{display:block;margin-bottom:6px}
.divider h1{font-family:var(--thai);font-weight:700;color:var(--navy);font-size:40px;line-height:1.06}
.divider .rule{margin:18px 0}
.divider .sub{color:var(--grey);font-size:15px;max-width:30ch}
.divider .cntchip{margin:16px 0 14mm;align-self:flex-start;font-family:var(--disp);font-weight:600;font-size:12px;color:var(--navy);background:var(--cloud);border:1px solid var(--line);border-radius:99px;padding:7px 15px}
.divider .photo{grid-row:1 / span 2;grid-column:2;position:relative;overflow:hidden;background:var(--cloud)}
.divider .photo img{width:100%;height:100%;object-fit:cover;object-position:center}
.divider .photo:after{content:"";position:absolute;left:0;top:0;bottom:0;width:80px;background:linear-gradient(90deg,#fff,transparent)}
.divider .photo .logospot{position:absolute;transform:translate(-50%,-50%);z-index:4;width:74px;height:74px;border-radius:50%;border:1.5px dashed var(--gold-deep);background:rgba(255,255,255,.82);display:flex;align-items:center;justify-content:center;text-align:center;font-family:var(--disp);font-weight:800;font-size:12px;line-height:1.12;letter-spacing:.1em;color:var(--navy);box-shadow:0 6px 18px -8px rgba(15,30,60,.45)}
.divider .foot{grid-column:1 / -1}

/* ============ GRID PAGE ============ */
.grid-pg{display:flex;flex-direction:column;background:#f6f7f9}
.rhead{padding:7mm 16mm 0;display:flex;align-items:center;justify-content:space-between}
.rhead .rcat{text-align:left}
.rhead .rcat b{font-family:var(--disp);font-weight:700;color:var(--navy);font-size:17px}
.rhead .rcat small{display:block;font-size:12px;color:var(--grey)}
.rhead .mono{height:23px;width:auto;display:block;opacity:.85}
.rrule{margin:5mm 16mm 0;height:2px;background:linear-gradient(90deg,var(--navy) 0 56px,var(--line) 56px)}
.grid{flex:1;padding:5mm 16mm 18mm;display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:max-content;gap:5mm;align-content:start}
${CARD_CSS}
.pricenote{position:absolute;right:12mm;left:16mm;bottom:9.5mm;text-align:right;font-family:var(--disp);font-size:8.5px;color:#b3bac4;letter-spacing:.01em}

/* ============ CLOSING ============ */
.closing{background:radial-gradient(130% 90% at 30% 0%,var(--navy-2) 0%,var(--navy) 46%,var(--navy-deep) 100%);color:#fff;display:grid;grid-template-columns:1.05fr .95fr;position:relative}
.closing .pat{position:absolute;inset:0;opacity:.05;color:var(--gold);background-image:radial-gradient(circle,currentColor 1px,transparent 1.4px);background-size:26px 26px}
.closing .inner{padding:14mm 10mm 14mm 18mm;display:flex;flex-direction:column;position:relative;z-index:2}
.closing .inner .logo-img{align-self:flex-start;width:auto;height:40px;flex:none}
.closing .eyebrow{color:var(--gold);display:block;margin:16px 0 10px}
.closing h1{font-family:var(--thai);font-weight:700;font-size:31px;line-height:1.12}
.closing h1 em{color:var(--gold)}
.closing .sub{color:#c7d2e6;font-size:14.5px;margin:16px 0 26px;max-width:42ch}
.closing .contact{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:auto}
.closing .cc{border-top:1px solid rgba(255,255,255,.18);padding-top:11px}
.closing .cc .cl{font-family:var(--disp);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.closing .cc b{display:block;font-family:var(--disp);font-weight:700;font-size:17px;margin-top:3px}
.closing .photo{position:relative;overflow:hidden;z-index:2}
.closing .photo img{width:100%;height:100%;object-fit:cover;object-position:45% 22%;transform:scale(1.3);transform-origin:45% 22%}
.closing .photo:after{content:"";position:absolute;left:0;top:0;bottom:0;width:110px;background:linear-gradient(90deg,var(--navy) 16%,transparent);z-index:2}
.closing .photo:before{content:"";position:absolute;right:0;top:0;bottom:0;width:175px;background:linear-gradient(270deg,var(--navy-deep) 30%,transparent);z-index:2}
.closing .brandfoot{position:absolute;bottom:0;left:0;right:0;z-index:3;background:rgba(0,0,0,.25);color:rgba(255,255,255,.7);font-family:var(--disp);font-size:10.5px;letter-spacing:.06em;padding:8px 18mm;text-align:center}
.closing .brandfoot span{color:var(--gold);font-weight:700}

/* ============ TOC · Exclusive row ============ */
.toc-row.ex-row{border-bottom-color:transparent;background:linear-gradient(90deg,rgba(202,161,78,.10),rgba(202,161,78,0));border:1px solid rgba(202,161,78,.35);border-radius:10px;margin-top:7px;padding:9px 12px}
.toc-row.ex-row .no{color:#b8851c;font-size:20px}
.toc-row.ex-row .nm b{color:#0B1D3A}
.toc-row.ex-row .cnt{font-weight:700;color:#9a7634;letter-spacing:.08em;text-transform:uppercase;font-size:11px}

/* ====================================================================
   GO PREMIUM · EXCLUSIVE — back-of-book sub-brand spread (scoped .ex)
   ==================================================================== */
.ex{
  --ex-navy:#0B1D3A; --ex-navy-deep:#06122A; --ex-soft:#11294B; --ex-line:#1C3559;
  --ex-gold:#CAA14E; --ex-gold-light:#EAD09A; --ex-silver:#C2CAD6; --ex-silver-deep:#8C97A8;
  --ex-foil:linear-gradient(110deg,#8A6A2E 0%,#CAA14E 22%,#F4E2B0 42%,#CAA14E 60%,#9A7634 78%,#EAD09A 100%);
  --ex-serif:'Cormorant Garamond',serif;
  background:radial-gradient(120% 90% at 50% -10%,#11294B 0%,#0B1D3A 48%,#06122A 100%);
  color:var(--ex-silver);position:relative;overflow:hidden;
  display:flex;flex-direction:column
}
.ex .ex-dot{position:absolute;inset:0;opacity:.5;background-image:radial-gradient(var(--ex-line) 1px,transparent 1.2px);background-size:24px 24px;-webkit-mask-image:radial-gradient(120% 80% at 50% 30%,#000,transparent 78%);mask-image:radial-gradient(120% 80% at 50% 30%,#000,transparent 78%)}
.ex .ex-glow{position:absolute;border-radius:50%;filter:blur(80px);opacity:.5;pointer-events:none}
.ex .ex-glow.g1{width:520px;height:520px;left:-130px;top:-160px;background:radial-gradient(circle,rgba(202,161,78,.22),transparent 70%)}
.ex .ex-glow.g2{width:560px;height:560px;right:-160px;bottom:-200px;background:radial-gradient(circle,rgba(194,202,214,.10),transparent 70%)}
.ex .foil{background:var(--ex-foil);-webkit-background-clip:text;background-clip:text;color:transparent}
.ex .serif{font-family:var(--ex-serif)}
.ex em{font-style:normal;color:var(--ex-gold)}

.ex .ex-hd{position:relative;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:11mm 18mm 0}
.ex .ex-logo{height:26px;width:auto;filter:brightness(0) invert(1)}
.ex .ex-tier{font-family:var(--disp);font-weight:600;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--ex-gold)}
.ex .ex-eyebrow{font-family:var(--disp);font-weight:600;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--ex-gold);display:inline-flex;align-items:center;gap:.7em}
.ex .ex-eyebrow:before{content:"";width:30px;height:1px;background:linear-gradient(90deg,transparent,var(--ex-gold))}

/* footer (dark) */
.ex .ex-foot{position:absolute;bottom:0;left:0;right:0;z-index:4;display:flex;align-items:center;gap:16px;padding:9px 18mm;background:rgba(4,13,32,.55);border-top:1px solid var(--ex-line);font-family:var(--disp);font-size:10.5px;letter-spacing:.06em;color:var(--ex-silver-deep)}
.ex .ex-foot .g{color:var(--ex-gold);font-weight:700;letter-spacing:.16em}
.ex .ex-foot .sp{flex:1}
.ex .ex-foot .ctx{letter-spacing:.16em;text-transform:uppercase;font-size:9.5px}
.ex .ex-foot .pg{background:var(--ex-foil);color:var(--ex-navy-deep);font-weight:800;border-radius:6px;padding:2px 9px}

/* ---- intro page ---- */
.ex-intro .ex-hero{position:relative;z-index:3;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4mm 24mm 0}
.ex-intro .ex-crest{display:flex;align-items:center;gap:16px;color:var(--ex-gold);font-family:var(--disp);font-weight:600;font-size:12px;letter-spacing:.4em;text-transform:uppercase}
.ex-intro .ex-crest .ln{height:1px;width:54px;background:linear-gradient(90deg,transparent,var(--ex-gold))}
.ex-intro .ex-crest .ln:last-child{background:linear-gradient(90deg,var(--ex-gold),transparent)}
.ex-intro .ex-word{font-family:var(--disp);font-weight:800;font-size:84px;line-height:1;letter-spacing:.06em;margin:14px 0 10px}
.ex-intro .ex-sub{font-family:var(--ex-serif);font-style:italic;font-size:26px;color:var(--ex-silver);font-weight:500}
.ex-intro .ex-sub b{font-style:normal;font-weight:600;color:#fff}
.ex-intro .ex-lead{margin-top:14px;max-width:62ch;font-size:13.5px;line-height:1.75;color:var(--ex-silver-deep);font-weight:300}
.ex-intro .ex-orn{margin-top:16px}
.ex-intro .ex-pillars{position:relative;z-index:3;display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid var(--ex-line);margin:6mm 18mm 13mm}
.ex-intro .ex-pl{padding:13px 22px;border-left:1px solid var(--ex-line)}
.ex-intro .ex-pl:first-child{border-left:0;padding-left:0}
.ex-intro .ex-pl:last-child{padding-right:0}
.ex-intro .ex-pl .rn{font-family:var(--ex-serif);font-weight:500;font-size:30px;color:var(--ex-gold);line-height:1;display:block;margin-bottom:6px}
.ex-intro .ex-pl h3{font-family:var(--disp);font-weight:700;font-size:16px;color:#fff;margin-bottom:5px}
.ex-intro .ex-pl p{font-size:11.5px;line-height:1.6;color:var(--ex-silver-deep);font-weight:300}

/* ---- process page ---- */
.ex-proc{padding-bottom:0}
.ex-proc .ex-h2{position:relative;z-index:3;font-family:var(--disp);font-weight:700;color:#fff;font-size:30px;padding:8mm 18mm 0}
.ex-proc .ex-rule{position:relative;z-index:3;height:3px;width:64px;background:var(--ex-foil);border-radius:2px;margin:12px 18mm 0}
.ex-proc .ex-steps{position:relative;z-index:3;display:grid;grid-template-columns:repeat(5,1fr);gap:14px;padding:8mm 18mm 0}
.ex-proc .ex-step{position:relative}
.ex-proc .ex-step .sn{font-family:var(--ex-serif);font-weight:600;font-size:34px;color:var(--ex-gold);line-height:1;display:block}
.ex-proc .ex-step .sln{position:absolute;top:16px;left:42px;right:-14px;height:1px;background:linear-gradient(90deg,var(--ex-gold),var(--ex-line))}
.ex-proc .ex-step .sln.last{display:none}
.ex-proc .ex-step h4{font-family:var(--disp);font-weight:700;font-size:14px;color:#fff;margin:10px 0 4px}
.ex-proc .ex-step p{font-size:11px;line-height:1.55;color:var(--ex-silver-deep);font-weight:300}
.ex-proc .ex-craft{position:relative;z-index:3;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:9mm 18mm 0}
.ex-proc .ex-cf{display:flex;gap:11px;align-items:flex-start;border-top:1px solid var(--ex-line);padding-top:12px}
.ex-proc .ex-cf .dia{flex:none;width:12px;height:12px;margin-top:4px;transform:rotate(45deg);background:var(--ex-foil);border-radius:2px}
.ex-proc .ex-cf b{display:block;font-family:var(--disp);font-weight:700;font-size:13.5px;color:#fff;margin-bottom:3px}
.ex-proc .ex-cf span{font-size:11px;line-height:1.55;color:var(--ex-silver-deep);font-weight:300}
.ex-proc .ex-cta{position:relative;z-index:3;margin:9mm 18mm 16mm;display:grid;grid-template-columns:1.2fr 1fr;gap:24px;align-items:center;background:linear-gradient(120deg,rgba(202,161,78,.10),rgba(17,41,75,.4));border:1px solid rgba(202,161,78,.4);border-radius:14px;padding:16px 22px}
.ex-proc .ex-cta .lab{font-family:var(--disp);font-weight:600;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--ex-gold)}
.ex-proc .ex-cta h3{font-family:var(--disp);font-weight:700;font-size:19px;color:#fff;margin:6px 0 6px}
.ex-proc .ex-cta .l p{font-size:11.5px;line-height:1.6;color:var(--ex-silver);font-weight:300}
.ex-proc .ex-cta .r{display:grid;grid-template-columns:1fr 1fr;gap:11px 18px}
.ex-proc .ex-cta .ch span{font-family:var(--disp);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--ex-gold);display:block}
.ex-proc .ex-cta .ch b{font-family:var(--disp);font-weight:700;font-size:13px;color:#fff;margin-top:2px;display:block;white-space:nowrap}

@media print{
  @page{size:A4 landscape;margin:0}
  body{background:#fff}
  .toolbar,.stage>.lbl{display:none!important}
  .stage{padding:0;gap:0}
  .sheet{box-shadow:none;page-break-after:always}
}`;

const html = `<!doctype html><html lang="th"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — Corporate Gift Catalogue ${YEAR}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@300;400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<div class="toolbar"><span class="glyph">${GIFT()}</span><b>GO PREMIUM</b> · Corporate Gift Catalogue ${YEAR} <span class="pill">${plan.length} หน้า A4</span><span class="pill">${TOTAL} รายการ</span><span class="pill">Elevated</span><span class="sp"></span><button onclick="window.print()">⬇ บันทึกเป็น PDF</button></div>
<div class="stage">
${body}
</div></body></html>`;

const OUT = path.join(__dirname, 'catalog-full-landscape.html');
fs.writeFileSync(OUT, html);
console.log('✓ wrote', OUT, '('+(fs.statSync(OUT).size/1024/1024).toFixed(2)+' MB) ·', plan.length, 'pages ·', TOTAL, 'products · card style Elevated');
