
/* ===== mockup engine (SVG studio mockups, no real photos) ===== */
const NAVY='#1F3A5F',MUST='#F4BD44';
const TINTS=[['#F4F6F9','#E7ECF3'],['#FBF6EA','#F4E9CF'],['#EFF3F7','#E1EAF4'],['#F3F5F2','#E6EDE6'],['#F8F3EF','#EEE3DA'],['#F2F0F6','#E6E1F0']];
function hsh(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;}
const G={
  drinkware:`<path d='M42 20 H78 V26 H42 Z'/><path d='M44 26 L76 26 L71 100 Q70 108 62 108 L58 108 Q50 108 49 100 Z'/><path d='M47 54 L73 54 L71.5 72 L48.5 72 Z' fill='${MUST}' stroke='none'/>`,
  bags:`<path d='M34 46 L86 46 L80 106 L40 106 Z'/><path d='M46 47 C46 30 58 30 58 47'/><path d='M62 47 C62 30 74 30 74 47'/><rect x='50' y='66' width='20' height='24' rx='3' fill='${MUST}' stroke='none'/>`,
  luggage:`<rect x='34' y='38' width='52' height='68' rx='11'/><path d='M52 38 V28 H68 V38'/><rect x='34' y='62' width='52' height='11' fill='${MUST}' stroke='none'/><circle cx='46' cy='110' r='3.5'/><circle cx='74' cy='110' r='3.5'/>`,
  stationery:`<rect x='36' y='28' width='40' height='60' rx='5'/><path d='M44 28 V88 M50 40 H68 M50 52 H68 M50 64 H62'/><path d='M64 28 V52 L60 46 L56 52 V28' fill='${MUST}' stroke='none'/><path d='M70 70 L96 96' stroke-width='7'/>`,
  fan:`<circle cx='60' cy='50' r='30'/><circle cx='60' cy='50' r='7' fill='${MUST}' stroke='none'/><path d='M60 50 C58 30 80 32 78 48'/><path d='M60 50 C80 52 78 74 62 70'/><path d='M60 50 C40 48 42 26 58 30'/><path d='M60 80 V102 M48 104 H72'/>`,
  powerbank:`<rect x='44' y='22' width='32' height='76' rx='9'/><path d='M62 38 L51 66 H60 L55 86 L72 56 H63 Z' fill='${MUST}' stroke='none'/>`,
  gadget:`<rect x='42' y='24' width='36' height='72' rx='11'/><rect x='49' y='33' width='22' height='38' rx='3' fill='${MUST}' stroke='none'/><circle cx='60' cy='84' r='4'/>`,
  lifestyle:`<rect x='32' y='42' width='56' height='38' rx='7'/><rect x='40' y='52' width='17' height='13' rx='2.5' fill='${MUST}' stroke='none'/><path d='M40 72 H80'/>`,
  kitchen:`<rect x='34' y='50' width='52' height='46' rx='9'/><path d='M34 65 H86'/><path d='M52 50 V44 H68 V50'/><rect x='30' y='70' width='6' height='12' rx='2' fill='${MUST}' stroke='none'/><rect x='84' y='70' width='6' height='12' rx='2' fill='${MUST}' stroke='none'/>`,
  scent:`<rect x='49' y='44' width='22' height='50' rx='7'/><rect x='53' y='32' width='14' height='14' rx='3' fill='${MUST}' stroke='none'/><path d='M55 58 H65'/>`,
  garment:`<path d='M40 42 L52 32 Q60 42 68 32 L80 42 L71 54 L68 51 V96 H52 V51 L49 54 Z'/><path d='M52 33 Q60 44 68 33' fill='${MUST}' stroke='none'/>`,
  hat:`<path d='M40 72 Q42 42 70 45 Q86 47 84 72'/><path d='M34 72 Q60 84 90 72 Q72 78 60 78 Q44 78 34 72 Z' fill='${MUST}' stroke='none'/>`,
  pet:`<ellipse cx='60' cy='74' rx='19' ry='14'/><circle cx='42' cy='52' r='7' fill='${MUST}' stroke='none'/><circle cx='54' cy='44' r='7' fill='${MUST}' stroke='none'/><circle cx='66' cy='44' r='7' fill='${MUST}' stroke='none'/><circle cx='78' cy='52' r='7' fill='${MUST}' stroke='none'/>`,
  'baby-kid':`<path d='M45 50 H75 L71 96 H49 Z'/><path d='M45 56 C34 58 34 78 46 78'/><path d='M75 56 C86 58 86 78 74 78'/><path d='M54 50 Q60 38 70 45' fill='${MUST}' stroke='none'/>`,
  giftset:`<rect x='36' y='52' width='48' height='44' rx='4'/><rect x='31' y='42' width='58' height='14' rx='3'/><rect x='56' y='42' width='8' height='54' fill='${MUST}' stroke='none'/><path d='M60 42 C50 30 40 40 60 42 C70 30 80 40 60 42' fill='${MUST}' stroke='none'/>`,
  packaging:`<path d='M38 50 H82 L86 102 H34 Z'/><path d='M48 50 C48 34 72 34 72 50'/><rect x='34' y='72' width='52' height='11' fill='${MUST}' stroke='none'/>`,
  souvenir:`<path d='M50 30 L60 56 M70 30 L60 56'/><circle cx='60' cy='76' r='20'/><path d='M60 64 L63 72 H71 L65 77 L67 85 L60 80 L53 85 L55 77 L49 72 H57 Z' fill='${MUST}' stroke='none'/>`,
  umbrella:`<path d='M28 62 Q60 24 92 62 Q76 54 60 62 Q44 54 28 62 Z'/><path d='M60 62 V98 Q60 106 52 105'/><path d='M44 58 Q52 46 60 62' fill='${MUST}' stroke='none'/>`,
  _default:`<rect x='36' y='40' width='48' height='56' rx='9'/><path d='M36 58 H84'/><rect x='52' y='30' width='16' height='14' rx='3' fill='${MUST}' stroke='none'/>`,
};
function mock(cat,sku){
  const t=TINTS[hsh(sku||cat)%TINTS.length],g=G[cat]||G._default;
  const svg=`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><defs><radialGradient id='b' cx='50%' cy='34%' r='80%'><stop offset='0' stop-color='${t[0]}'/><stop offset='1' stop-color='${t[1]}'/></radialGradient></defs><rect width='400' height='400' fill='url(#b)'/><circle cx='200' cy='168' r='124' fill='#ffffff' opacity='.45'/><ellipse cx='200' cy='306' rx='112' ry='20' fill='${NAVY}' opacity='.08'/><g transform='translate(88,76) scale(1.86)' fill='none' stroke='${NAVY}' stroke-width='4.4' stroke-linecap='round' stroke-linejoin='round'>${g}</g></svg>`;
  return "data:image/svg+xml,"+encodeURIComponent(svg);
}

/* ===== data ===== */
// ตัด SKU ที่ยังไม่มีชื่อ (master ระบุ "ยังไม่ขึ้นเว็บ") ออกจากทุกหน้า
const P=window.GP_PRODUCTS.filter(p=>p.name&&p.name.trim()),GROUPS=window.GP_GROUPS,CL=window.GP_CATLABELS,TL=window.GP_TIERLABELS;
const byCat={};P.forEach(p=>{(byCat[p.catSlug]??=[]).push(p);});
const catList=Object.keys(CL).filter(c=>byCat[c]).sort((a,b)=>byCat[b].length-byCat[a].length);
const baht=n=>n?('฿'+n.toLocaleString('en-US')):'สอบถามราคา';
const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const grpIcon=c=>{const g=GROUPS.find(x=>x.cats.includes(c));return g?g.icon:'🎁';};
const pimg=p=>p.img||mock(p.catSlug,p.sku);                                   // real photo or mockup fallback
const repImg=cat=>{const a=byCat[cat]||[];const r=a.find(p=>p.img)||a[0];return r?pimg(r):mock(cat,cat);};

/* ===== analytics (GA4 events — SPA) ===== */
function track(ev,params){try{if(window.gtag)gtag('event',ev,params||{});}catch(e){}}
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href*="lin.ee"]');if(a)track('contact_line',{source:(location.hash||'#/').slice(1)});});

/* ===== reusable bits ===== */
const PTIER={value:'เริ่มต้นคุ้ม',smart:'คุ้มค่าน่าเลือก',premium:'พรีเมียม',executive:'ระดับผู้บริหาร'};
function card(p, imgOverride){
  const tier=p.tier?`<span class="ptier">${esc(PTIER[p.tier]||p.tier)}</span>`:'';
  const src=(typeof imgOverride==='string'&&imgOverride)?imgOverride:pimg(p); // guard: .map() passes index as 2nd arg
  return `<a class="pcard" href="#/p/${p.sku}"><div class="pthumb"><span class="pchip">${esc(CL[p.catSlug]||p.cat)}</span>${tier}<img loading="lazy" src="${src}" alt="${esc(p.name)}"></div>
    <div class="pbody"><div class="pname">${esc(p.name)}</div><div class="pfeat">${esc(p.features)}</div>
    <div class="pfoot"><div class="pprice">${baht(p.price)} <small>${p.price?'/ชิ้น':''}</small></div><div class="pmoq">MOQ ${p.moq}</div></div></div></a>`;
}
function ctaBand(){return `<section class="sec" style="background:var(--cloud)"><div class="wrap"><div class="cta-band">
  <div style="position:absolute;right:-60px;top:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,.22)"></div>
  <div style="position:relative;max-width:34ch"><h2>พร้อมเริ่มของขวัญชิ้นต่อไปแล้วหรือยัง</h2><p>ปรึกษาฟรี พร้อม Mockup ก่อนผลิต — หรือให้ AI ช่วยคิดเซ็ตให้ก่อนก็ได้</p></div>
  <div style="position:relative;display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn-secondary btn-lg" href="#/quote">คุยกับเราเลย</a><a class="btn btn-ghost btn-lg" style="border-color:rgba(31,58,95,.3);color:var(--navy)" href="https://lin.ee/z1GT1KR" target="_blank" rel="noopener">ทักทาง LINE</a></div>
</div></div></section>`;}

/* ===== quote form (shared) ===== */
function quoteForm(){return `<form class="qcard" id="quoteForm" novalidate>
  <div id="qbody">
    <h3>แบบฟอร์มขอใบเสนอราคา</h3>
    <p style="font-size:12.5px;color:var(--grey);margin-bottom:18px">ใช้เวลาไม่ถึง 1 นาที · <span class="req">*</span> จำเป็น</p>
    <div class="fgrid">
      <div class="field full"><label class="label">ชื่อ-บริษัท <span class="req">*</span></label><input class="input" name="name" placeholder="เช่น คุณแป้ง · บริษัท ABC"><span class="errmsg" data-e="name" style="display:none">กรุณากรอกชื่อ-บริษัท</span></div>
      <div class="field full"><label class="label">อีเมล หรือ เบอร์โทร <span class="req">*</span></label><input class="input" name="contact" placeholder="you@company.com หรือ 08x-xxx-xxxx"><span class="errmsg" data-e="contact" style="display:none">กรุณากรอกอีเมลหรือเบอร์โทร</span></div>
      <div class="field"><label class="label">โอกาส / งาน</label><select class="select" name="occasion">
        <option>ของขวัญปีใหม่พนักงาน</option><option>ของขวัญลูกค้า / คู่ค้า</option><option>อีเวนต์ / สัมมนา</option><option>ต้อนรับพนักงานใหม่</option><option>ของผู้บริหาร / VIP</option><option>รักษ์โลก / ESG</option><option>อื่น ๆ</option></select></div>
      <div class="field"><label class="label">จำนวน (ชิ้น)</label><input class="input" name="qty" inputmode="numeric" placeholder="เช่น 200"></div>
      <div class="field"><label class="label">ต้องการรับงาน</label><input class="input" name="date" type="date"></div>
      <div class="field"><label class="label">งบ/ชิ้น (฿)</label><input class="input" name="budget" inputmode="numeric" placeholder="เช่น 300"></div>
      <div class="field full"><label class="label">รายละเอียดเพิ่มเติม</label><textarea class="textarea" name="details" placeholder="บอกคอนเซ็ปต์ สินค้าที่สนใจ ตำแหน่งโลโก้ สี แพ็กเกจ..."></textarea></div>
    </div>
    <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:18px">ส่งขอใบเสนอราคา
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    <div style="display:flex;align-items:center;gap:12px;margin:14px 0;color:var(--grey-400);font-size:12.5px"><span style="flex:1;height:1px;background:var(--line)"></span>หรือ<span style="flex:1;height:1px;background:var(--line)"></span></div>
    <a class="btn btn-line-ghost btn-lg" style="width:100%" href="https://lin.ee/z1GT1KR" target="_blank" rel="noopener">ทักมาที่ LINE @gopremium</a>
    <p style="font-size:12px;color:var(--grey);text-align:center;margin-top:12px">ตอบกลับใน 2 ชม. · ปรึกษาฟรี ไม่มีข้อผูกมัด</p>
  </div>
  <div class="qok" id="qok"><div class="ic"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1F3A5F" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg></div>
    <h3 style="font-size:23px">ได้รับคำขอแล้ว ขอบคุณค่ะ</h3>
    <p class="muted" style="font-size:14px;margin-top:10px">ทีม GO PREMIUM จะติดต่อกลับพร้อมไอเดียและช่วงราคาภายใน 2 ชม.</p>
    <button type="button" class="btn btn-ghost" style="margin-top:20px" onclick="resetQuote()">ส่งคำขอใหม่</button></div>
</form>`;}
function quoteSection(){return `<section class="sec quote-sec" id="quote"><div class="dotgrid on-dark" style="position:absolute;inset:0;opacity:.5"></div>
  <div class="wrap quote-grid">
    <div>
      <span class="eyebrow on-dark"><span class="dot"></span>ขอใบเสนอราคา · ปรึกษาฟรี</span>
      <h2 class="h2 on-dark" style="margin-top:14px;max-width:15ch">เริ่มของขวัญชิ้นต่อไปของคุณ</h2>
      <p class="lead on-dark" style="margin-top:12px;max-width:42ch">กรอกข้อมูลสั้นๆ ทีมเราจะตอบกลับพร้อมไอเดียและช่วงราคาภายใน 2 ชม. ปรึกษาฟรี ไม่มีข้อผูกมัด</p>
      <div class="q-feats">
        <div class="q-feat"><span class="qi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>นิติบุคคลจดทะเบียน เชื่อถือได้</div>
        <div class="q-feat"><span class="qi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></span>ตอบกลับ + เสนอราคาใน 2 ชม.</div>
        <div class="q-feat"><span class="qi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg></span>Mockup ก่อนผลิตเสมอ</div>
      </div>
    </div>
    ${quoteForm()}
  </div></section>`;}

/* ===== HOME ===== */
const SVCS=[
  ['Mockup ก่อนผลิต','เห็นภาพงานจริงก่อนเริ่มผลิต ลดความเสี่ยงเรื่องสี โลโก้ และองค์ประกอบแบรนด์',1,'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18"/>'],
  ['พิมพ์โลโก้ & ปรับดีไซน์','ปรับสีและดีไซน์ให้เข้ากับแบรนด์ลูกค้าอย่างพิถีพิถัน ใช้ AI ช่วยขึ้น Mockup ไวขึ้น',0,'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'],
  ['จัดเซ็ตของขวัญ (Curation)','คัดและจัดหลายชิ้นเป็นเซ็ตเดียว เพิ่มมูลค่าและความน่าจดจำ เล่าเรื่องแบรนด์คุณ',0,'<path d="M4 7h16v13H4z"/><path d="M4 7l2-3h12l2 3M12 4v16"/>'],
  ['ออกแบบกล่อง & แพ็กเกจ','กล่อง การ์ดขอบคุณ และแท็กแบรนด์ ให้ของขวัญดูสมบูรณ์และน่าแกะ',0,'<path d="M3 8l9-5 9 5-9 5z"/><path d="M3 8v8l9 5 9-5V8"/>'],
  ['แพ็ก & จัดส่งรายคน','Kitting & fulfillment ส่งตรงถึงพนักงานหรือลูกค้าแต่ละคน หลายสาขาก็ทำได้',0,'<rect x="1" y="6" width="15" height="11"/><path d="M16 10h4l3 3v4h-7"/>'],
  ['งานด่วน 7–14 วัน','สำหรับองค์กรที่มี deadline ชัด พร้อมผลิตและส่งมอบตรงเวลาทุกออเดอร์',0,'<path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1L12 16.8 5.7 21l2.3-7.1-6-4.5h7.6z"/>'],
];
// [label, desc, categorySlug(สำหรับรูป), badge, occasionKey(→ OCC_FILTERS / route #/o/)]
const OCCS=[
  ['ของขวัญปีใหม่','กิฟต์เซ็ตและของพรีเมียมสำหรับมอบพนักงาน ลูกค้า และคู่ค้าช่วงปลายปี','giftset','พีคสุด','newyear'],
  ['ชุดต้อนรับพนักงานใหม่','Welcome kit สร้างความประทับใจวันแรก เสริมภาพลักษณ์องค์กร','drinkware',null,'welcome'],
  ['ของขวัญลูกค้า VIP','ของพรีเมียมระดับผู้บริหาร แพ็กเกจหรู สื่อถึงความใส่ใจ','giftset','Exclusive','vip'],
  ['งานอีเวนต์ & สัมมนา','ของแจกพิมพ์โลโก้ พร้อมส่งทันงาน เหมาะกับงานจำนวนมาก','bags',null,'event'],
  ['ครบรอบ & Milestone','ของที่ระลึกพิเศษเฉพาะวาระ ดีไซน์สั่งทำ สะท้อนความสำเร็จ','drinkware','Custom','milestone'],
  ['ของขวัญรักษ์โลก','วัสดุคุณภาพ เล่าเรื่อง ESG ขององค์กร เทรนด์ 2026','lifestyle','Eco','eco'],
];
const TIERS=[
  ['เริ่มต้น','navy','ไม่เกิน 60 ฿','ของแจกงานอีเวนต์ จำนวนมาก MOQ 300+ ชิ้น',['ปากกาพิมพ์โลโก้','กระเป๋าผ้าสปันบอนด์','พวงกุญแจ','ของชำร่วย'],0],
  ['คุ้มค่า','navy','ไม่เกิน 200 ฿','ของพนักงาน/ลูกค้าทั่วไป ดูดีในงบที่คุมได้ MOQ 100+','กระบอกน้ำสเตนเลส,กระเป๋าผ้าแคนวาส,สมุดโน้ต PU,เซ็ตเครื่องเขียน'.split(','),0],
  ['ระดับกลาง','mustard','300–800 ฿','กิฟต์เซ็ตดีไซน์เฉพาะพร้อมแพ็กเกจ MOQ 50+ ชิ้น','กิฟต์เซ็ตกระบอกน้ำ+สมุด,เซ็ตของใช้สำนักงาน,ถุงของขวัญพรีเมียม,แก้ว Borosilicate'.split(','),1],
  ['ผู้บริหาร','mustard','1,000 ฿ ขึ้นไป','ของขวัญ VIP แพ็กเกจหรู สลักชื่อ MOQ ยืดหยุ่น','กล่องหนังหรูสลักชื่อ,กระเป๋าหนังพรีเมียม,เซ็ตไวน์/ชา,ของที่ระลึกพิเศษ'.split(','),0],
];
const STEPS=[
  ['01','ปรึกษา','บอกโจทย์ โอกาส งบ และจำนวน ทีมเราตอบไวภายใน 2 ชม.',0,'<path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9.1 9.1 0 0 1-3.1-.5L3 21l1.5-4.4A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 21 11.5z"/>'],
  ['02','ดีไซน์ + AI Mockup','เห็นภาพงานจริงก่อนตัดสินใจ ใช้ AI ขึ้น Mockup โลโก้บนสินค้าให้ดูทันที',1,'<circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 2a10 10 0 1 0 0 20 2.5 2.5 0 0 0 2-4 2.5 2.5 0 0 1 2-4h2a4 4 0 0 0 4-4 10 10 0 0 0-10-8z"/>'],
  ['03','ผลิต','ควบคุมคุณภาพทุกชิ้น วัสดุที่สัมผัสได้ถึงความพรีเมียม',0,'<path d="M3 8l9-5 9 5-9 5z"/><path d="M3 8v8l9 5 9-5V8"/>'],
  ['04','ส่งมอบ','ตรงเวลา ทันงาน พร้อมบริการจัดส่งรายคน (kitting) ถ้าต้องการ',0,'<rect x="1" y="6" width="15" height="11"/><path d="M16 10h4l3 3v4h-7"/>'],
];
const CATS=[
  ['ขายดี','mustard','แก้ว & กระบอกน้ำ','drinkware'],
  ['พิมพ์โลโก้ได้','navy','กระเป๋า & ถุงผ้า','bags'],
  ['ออฟฟิศ','navy','เครื่องเขียน & สำนักงาน','stationery'],
  ['ไอที & แกดเจ็ต','navy','พัดลมพกพา & แกดเจ็ต','fan'],
  ['พิมพ์โลโก้ได้','navy','ร่มพรีเมียม','umbrella'],
  ['รักษ์โลก','mustard','ไลฟ์สไตล์ & ของใช้','lifestyle'],
  ['พรีเมียม','mustard','กิฟต์เซ็ต','giftset'],
];
const CASES=[
  ['เซ็ตปีใหม่องค์กร','New Year','กล่อง + การ์ดเฉพาะแบรนด์ จัดเป็นเซ็ตพร้อมมอบ','giftset'],
  ['Welcome Kit พนักงานใหม่','Onboarding','ชุดต้อนรับสาย minimal โทนสีแบรนด์','drinkware'],
  ['Eco Lifestyle Set','รักษ์โลก','ของใช้คุณภาพ เล่าเรื่องความยั่งยืนขององค์กร','lifestyle'],
  ['VIP Gift Box','Client gift','กล่องของขวัญพรีเมียมสำหรับลูกค้าคนสำคัญ','giftset'],
  ['Event Giveaway','Event','ของแจกพิมพ์โลโก้ ถ่ายรูปสวย พร้อมส่งทันงาน','bags'],
  ['Custom Drinkware','Milestone','กระบอกน้ำดีไซน์เฉพาะวาระ สลักโลโก้แบรนด์','drinkware'],
];
const REVS=[
  ['งานดีไซน์เนี้ยบ ส่งตรงเวลา คุยง่าย ทำให้มั่นใจที่จะสั่งต่อในปีถัดไป','ผู้จัดการฝ่าย HR · องค์กรเอกชน · Q4 2025','H',0],
  ['AI ช่วยร่นเวลาเลือกของได้เยอะ ได้ไอเดียเซ็ตที่ตรงโจทย์เร็วขึ้นมาก','ฝ่ายการตลาด · เอเจนซีโฆษณา · Q1 2026','M',1],
  ['เห็น Mockup ก่อนผลิตทำให้ตัดสินใจได้สบายใจ ไม่ต้องลุ้นว่างานจะพลาด','ฝ่ายจัดซื้อ · บริษัทในตลาดหลักทรัพย์ · Q4 2025','P',0],
];
const VALUES=[
  ['1 · Design with intention','ออกแบบอย่างมีเจตนา ทุกชิ้นมีเหตุผล ความเรียบที่ตั้งใจคือความพรีเมียม'],
  ['2 · Quality you can feel','คุณภาพที่สัมผัสได้ เลือกวัสดุและงานผลิตที่ผู้รับรับรู้ได้ตั้งแต่แรกจับ'],
  ['3 · Reliable partner','คู่คิดที่ไว้ใจได้ ตรงเวลา สื่อสารชัด แก้ปัญหาเป็น'],
  ['4 · Meaningful giving','การให้ที่มีความหมาย มองข้ามตัวสินค้าไปสู่ความสัมพันธ์ที่ของขวัญสร้างขึ้น'],
];
const CLIENTS=['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20'];

function viewHome(){
  // ดีไซน์ใหม่ 2026 (อนุมัติจาก mockup v1-warm-linen + พื้นหลังแบบ 4) — CSS namespace .nh
  const slides=[
    ['images/products/gs003-business-executive/gs003-business-executive-hero.jpg?v=3','เซตของขวัญ Business รุ่น Executive — ของพรีเมียมองค์กร GO PREMIUM'],
    ['images/products/bg001-classic/bg001-classic-hero.jpg?v=3','กระเป๋าผ้าพิมพ์โลโก้ รุ่น Classic — GO PREMIUM'],
    ['images/products/dw003-peak/dw003-peak-hero.jpg?v=3','แก้วน้ำสแตนเลสพิมพ์โลโก้ รุ่น Peak — GO PREMIUM'],
  ];
  const heroSlides=slides.map(([src,alt],i)=>`<img src="${src}" alt="${esc(alt)}" loading="${i?'lazy':'eager'}" ${i?'':'fetchpriority="high"'} decoding="async">`).join('');
  const heroDots=slides.map((_,i)=>`<i data-i="${i}" role="button" tabindex="0" aria-label="ไปสไลด์ที่ ${i+1}"></i>`).join('');
  const featSkus=['GS003','DW001','BG003','UM002'];
  let feat=featSkus.map(s=>P.find(p=>p.sku===s)).filter(Boolean);
  if(feat.length<4)feat=catList.slice(0,4).map(c=>byCat[c][0]);
  const clientRow=[...CLIENTS,...CLIENTS].map(c=>`<img src="clients/${c}.png" alt="ลูกค้าองค์กรของ GO PREMIUM" loading="lazy">`).join('');
  const cnt=c=>byCat[c]?byCat[c].length+' รุ่น':'';
  // Covers = REAL product studio photos (the brand's own '-square' master set),
  // not the old AI/3D-rendered cat-*.jpg podium mockups. The -square set shares
  // ONE warm cream/beige mood & tone + the GO PREMIUM gift-box watermark, so the
  // whole row reads as a single cohesive photoshoot.
  // ?v=2 cache-buster: the -square files are served `immutable, max-age=1yr`, so
  // re-printing the logo under the SAME filename would otherwise show a stale
  // cached image. Bump this token whenever a cover image is regenerated.
  // Homepage covers point at the /images/home/covers/ copies (stamped with the
  // frameless "Your Logo"). The shared studio masters stay CLEAN for catalogue /
  // product pages. Express fan+umbrella keep their stamped originals (express photos
  // carry the placeholder catalogue-wide by design).
  const CATS2=[
    ['drinkware','แก้ว &amp; กระบอกน้ำ','DRINKWARE','images/home/covers/dw006-milo-square.jpg?v=2'],
    ['bags','กระเป๋า &amp; ถุงผ้า','BAG','images/home/covers/bg007-rin-square.jpg?v=2'],
    ['stationery','เครื่องเขียน &amp; สำนักงาน','STATIONERY','images/home/covers/st007-folio-square.jpg?v=2'],
    ['fan','พัดลมพกพา &amp; แกดเจ็ต','MINI FAN','images/products/ex022-fan/ex022-fan-square.jpg?v=3'],
    ['umbrella','ร่มพรีเมียม','UMBRELLA','images/products/ex010-umbrella/ex010-umbrella-square.jpg?v=3'],
    ['giftset','กิฟต์เซ็ต','GIFTSET','images/home/covers/gs003-business-executive-square.jpg?v=2'],
    ['lifestyle','ไลฟ์สไตล์ &amp; ของใช้','LIFESTYLE','images/home/covers/ls012-smart-grip-flex-square.jpg?v=2'],
  ];
  // Homepage-only "Your Logo" copies for the featured-product cards (by image base).
  const HOME_COVERS=new Set(['dw006-milo-square','bg007-rin-square','st007-folio-square','gs003-business-executive-square','ls012-smart-grip-flex-square','dw001-loopa-square','bg003-everyday-square','um002-automatic-premium-square']);
  const homeCover=p=>{const b=(p.img||'').split('?')[0].split('/').pop().replace('.jpg','');return HOME_COVERS.has(b)?`images/home/covers/${b}.jpg?v=2`:pimg(p);};
  const OCCS2=[
    ['newyear','ของขวัญปีใหม่','กิฟต์เซ็ตและของพรีเมียมสำหรับมอบพนักงาน ลูกค้า และคู่ค้าช่วงปลายปี','images/home/occ-newyear.jpg','พีคสุด'],
    ['welcome','ชุดต้อนรับพนักงานใหม่','Welcome kit สร้างความประทับใจวันแรก เสริมภาพลักษณ์องค์กร','images/home/occ-welcome.jpg',null],
    ['vip','ของขวัญลูกค้า VIP','ของพรีเมียมระดับผู้บริหาร แพ็กเกจหรู สื่อถึงความใส่ใจ','images/home/occ-vip.jpg','Exclusive'],
    ['event','งานอีเวนต์ &amp; สัมมนา','ของแจกพิมพ์โลโก้ พร้อมส่งทันงาน เหมาะกับงานจำนวนมาก','images/home/occ-event.jpg',null],
    ['milestone','ครบรอบ &amp; Milestone','ของที่ระลึกพิเศษเฉพาะวาระ ดีไซน์สั่งทำ สะท้อนความสำเร็จ','images/home/occ-milestone.jpg',null],
    ['eco','ของขวัญรักษ์โลก','วัสดุคุณภาพ เล่าเรื่อง ESG ขององค์กร เทรนด์ 2026','images/home/occ-eco.jpg','Eco'],
  ];
  const TIERS2=[
    ['value','Value · เริ่มต้น','ไม่เกิน ฿60','ของแจกงานอีเวนต์ จำนวนมาก เช่น ปากกา ถุงผ้าสปันบอนด์ พวงกุญแจ ของชำร่วย',0],
    ['smart','Smart · คุ้มค่า','฿61–150','ของพนักงาน/ลูกค้าทั่วไป ดูดีในงบที่คุมได้ เช่น กระเป๋าผ้าแคนวาส พัดลมพกพา',0],
    ['premium','Premium · ระดับกลาง','฿151–300','ของพรีเมียมคุณภาพสูงพร้อมพิมพ์โลโก้ เช่น กระบอกน้ำสเตนเลส ร่มออโต้ สมุด PU',1],
    ['executive','Executive · ผู้บริหาร','฿300 ขึ้นไป','กิฟต์เซ็ตและของขวัญ VIP แพ็กเกจหรู เช่น เซ็ต Business Executive',0],
  ];
  const STEPS2=[
    ['01','ปรึกษา','บอกโจทย์ โอกาส งบ และจำนวน ทีมเราตอบไวภายใน 2 ชม.'],
    ['02','ดีไซน์ + AI Mockup','เห็นภาพงานจริงก่อนตัดสินใจ ใช้ AI ขึ้น Mockup โลโก้บนสินค้าให้ดูทันที'],
    ['03','ผลิต','ควบคุมคุณภาพทุกชิ้น วัสดุที่สัมผัสได้ถึงความพรีเมียม'],
    ['04','ส่งมอบ','ตรงเวลา ทันงาน พร้อมบริการจัดส่งรายคน (kitting) ถ้าต้องการ'],
  ];
  return `<div class="nh">
  <section class="hero2 hero2-photo">
    <img class="hero2-bg" src="images/home/hero-team.webp?v=4" alt="ทีม GO PREMIUM ส่งมอบของขวัญและของพรีเมียมองค์กร" fetchpriority="high">
    <div class="wrap hero2-in2"><div class="hero2-copy">
      <span class="eyebrow2">Go Beyond The Gift</span>
      <h1>มากกว่าของขวัญ<br>คือ<em>ประสบการณ์</em></h1>
      <p class="sub">ของพรีเมียมและของขวัญองค์กร ครบ จบ ในที่เดียว — ดีไซน์ ผลิต พิมพ์โลโก้ ถึงส่งมอบ พร้อม <b>AI ช่วยคิดเซ็ตของขวัญ</b> ให้ตรงงบและทันเวลา</p>
      <div class="ai-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input id="aiq" placeholder="ของขวัญปีใหม่พนักงาน 300 บาท" onkeydown="if(event.key==='Enter')askAI()">
        <button class="go" onclick="askAI()"><i>✦</i> ให้ AI แนะนำสินค้า</button>
      </div>
      <div class="hero2-actions"><a class="btn btn-primary btn-lg" href="#/quote">ขอใบเสนอราคา <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a><a class="btn btn-ghost btn-lg" href="#/all">ดูแคตตาล็อก ${P.length} รายการ</a></div>
    </div></div>
  </section>

  <section class="trust2">
    <div class="wrap">
      <div class="tgrid">
        <div class="tcard"><span class="ic"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16v12H4z"/><path d="M2 8h20v4H2zM12 8v12"/><path d="M12 8c-2.5 0-5-1.2-5-3.2C7 3 9 2.6 10.2 3.4 11.4 4.2 12 6 12 8zm0 0c2.5 0 5-1.2 5-3.2C17 3 15 2.6 13.8 3.4 12.6 4.2 12 6 12 8z"/></svg></span><span class="n">100,000+</span><span class="l">ชิ้นที่ส่งมอบทั่วไทย</span></div>
        <div class="tcard"><span class="ic"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5h14v12H1z"/><path d="M15 9h4l4 4v4h-8"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg></span><span class="n">7–14 วัน</span><span class="l">งานพร้อมส่ง</span></div>
        <div class="tcard"><span class="ic"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/><path d="M19 5l1.5 1.5"/></svg></span><span class="n">2 ชั่วโมง</span><span class="l">ตอบกลับพร้อมเสนอราคา</span></div>
      </div>
      <p class="cap2">ลูกค้าที่ให้ความไว้วางใจ</p>
    </div>
    <div class="marq"><div class="marq-row">${clientRow}</div></div>
  </section>

  <section class="sec" style="background:#fff"><div class="wrap">
    <div class="shead"><span class="eyebrow2">ประเภทสินค้า</span><h2 class="h2">เลือกหมวดที่ใช่</h2><p class="lead">ทุกชิ้นพิมพ์โลโก้ได้ ปรับสีตามแบรนด์ และมี Mockup ให้ดูก่อนผลิตทุกออเดอร์</p></div>
    <div class="catg">${CATS2.map(c=>`<a class="cat2" href="#/c/${c[0]}"><div class="im"><img loading="lazy" src="${c[3]}" alt="${c[1].replace(/&amp;/g,'&')}"></div><div class="bd"><h4>${c[1]}</h4><small>${c[2]} · ${cnt(c[0])}</small></div></a>`).join('')}<a class="cat2 all" href="#/all"><span class="n">${P.length}</span><h4>ดูสินค้าทั้งหมด →</h4></a></div>
  </div></section>

  <section style="padding:0"><div class="wrap">
    <div class="promo ai">
      <div class="tx"><span class="eyebrow2">AI Gift Finder</span><h3>ยังไม่รู้จะเลือกอะไร?<br>ให้ AI ช่วยคิดหาไอเดีย</h3><p>พิมพ์โจทย์ โอกาส งบ และจำนวน — AI แนะนำเซ็ตของขวัญที่ตรงใจในไม่กี่วินาที พร้อม Mockup โลโก้บนสินค้าให้ดูทันที</p><a class="btn btn-secondary" href="#/all">✦ ลองถาม AI เลย</a></div>
      <div class="im"><img loading="lazy" src="banners/banner2.webp" alt="AI ช่วยคิดหาไอเดียของขวัญ"></div>
    </div>
  </div></section>

  <section class="sec" style="background:#fff"><div class="wrap">
    <div class="shead center"><span class="eyebrow2 center">เลือกตามโอกาส</span><h2 class="h2">ของขวัญองค์กรสำหรับทุกโอกาส</h2><p class="lead" style="text-align:center">ไม่รู้จะเริ่มจากไหน? เลือกโอกาสของคุณ เราแนะนำสินค้าและดีไซน์ที่เหมาะสมให้ทันที</p></div>
    <div class="occg">${OCCS2.map(o=>`<a class="occ2" href="#/o/${o[0]}"><div class="im"><img loading="lazy" src="${o[3]}" alt="${o[1].replace(/&amp;/g,'&')}">${o[4]?`<span class="tagb">${o[4]}</span>`:''}</div><div class="bd"><h4>${o[1]}</h4><p>${o[2]}</p><span class="lnk">ดูไอเดีย →</span></div></a>`).join('')}</div>
  </div></section>

  <section style="padding:0 0 clamp(52px,7.5vw,104px)"><div class="wrap">
    <div class="promo budget">
      <div class="im"><img loading="lazy" src="banners/banner3.webp" alt="ตอบโจทย์ทุกโอกาส ทุกงบประมาณ"></div>
      <div class="tx"><span class="eyebrow2">ทุกโอกาส ทุกงบ</span><h3>ตอบโจทย์ทุกโอกาส<br>ทุกงบประมาณ</h3><p>ตั้งแต่ของแจกอีเวนต์หลักสิบบาท ถึงเซ็ตผู้บริหารระดับ VIP — ปรับดีไซน์และแพ็กเกจให้เข้ากับแบรนด์คุณได้ทั้งหมด</p><a class="btn btn-primary" href="#/quote">ขอใบเสนอราคา →</a></div>
    </div>
  </div></section>

  <section class="sec" style="background:var(--cloud);border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">
    <div class="shead"><span class="eyebrow2">เลือกตามงบ</span><h2 class="h2">งบเท่าไหร่ ก็มีของขวัญที่ใช่</h2></div>
    <div class="tierg">${TIERS2.map(t=>`<a class="tier2 ${t[4]?'hi':''}" href="#/b/${t[0]}"><span class="t">${t[1]}</span><span class="rng">${t[2]}</span><p>${t[3]}</p><span class="lnk2">ดูสินค้าในงบนี้ →</span></a>`).join('')}</div>
  </div></section>

  <section class="sec" style="background:#fff"><div class="wrap">
    <div class="shead center"><span class="eyebrow2 center">วิธีการทำงาน</span><h2 class="h2">4 ขั้นตอน โปร่งใส ไม่ต้องกลัวงานพลาด</h2></div>
    <div class="stepg">${STEPS2.map(s=>`<div class="step2"><span class="nn">${s[0]}</span><h4>${s[1]}</h4><p>${s[2]}</p></div>`).join('')}</div>
  </div></section>

  <section style="padding:0"><div class="wrap">
    <div class="promo express">
      <div class="tx"><span class="eyebrow2">Express Service</span><h3>งานด่วน?<br>พร้อมส่งใน 7–14 วัน</h3><p>สำหรับองค์กรที่มี deadline ชัด — คัดสินค้าพร้อมผลิต พิมพ์โลโก้ และส่งมอบตรงเวลาทุกออเดอร์</p><a class="btn btn-secondary" href="#/express">⚡ ดูสินค้าส่งด่วน</a></div>
      <div class="im"><img loading="lazy" src="banners/banner1.webp" alt="งานด่วนพร้อมส่ง 7–14 วัน"></div>
    </div>
  </div></section>

  <section class="sec" style="background:#fff"><div class="wrap">
    <div class="shead center"><span class="eyebrow2 center">สินค้าแนะนำ</span><h2 class="h2">ยอดนิยมสำหรับองค์กร</h2></div>
    <div class="pgrid">${feat.map(p=>card(p,homeCover(p))).join('')}</div>
    <div style="text-align:center;margin-top:38px"><a class="btn btn-secondary btn-lg" href="#/all">ดูสินค้าทั้งหมด ${P.length} รายการ</a></div>
  </div></section>

  <section class="sec" style="background:#fff;padding-top:0"><div class="wrap">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:38px"><div class="shead" style="margin-bottom:0"><span class="eyebrow2">บทความ &amp; ไอเดีย</span><h2 class="h2">ไอเดีย &amp; ความรู้เรื่องของขวัญองค์กร</h2><p class="lead">คู่มือเลือกของ เทคนิคพิมพ์โลโก้ และไอเดียจัดเซ็ตตามงบ — อัปเดตจากทีม GO PREMIUM</p></div><a class="btn btn-ghost" href="/blog">ดูบทความทั้งหมด</a></div>
    <div class="g-auto occ-grid">
      <a class="occ" href="/blog/ของขวัญปีใหม่องค์กร-2026"><div class="im"><img src="/blog/newyear-2026.jpg" alt="ของขวัญปีใหม่องค์กร 2026" loading="lazy"><span class="badge badge-glass glass">เทรนด์ &amp; ไอเดีย</span></div><div class="bd"><h4>ของขวัญปีใหม่องค์กร 2026: คู่มือเลือกของพรีเมียมให้พนักงานและลูกค้า</h4><p>รวมไอเดีย งบประมาณ และไทม์ไลน์สั่งผลิตให้ทันปีใหม่ 2026 แบบครบจบในที่เดียว</p><span style="font-family:var(--head);font-size:12.5px;color:var(--mustard-deep);margin-top:6px">อ่าน 6 นาที →</span></div></a>
      <a class="occ" href="/blog/ของพรีเมียมพิมพ์โลโก้"><div class="im"><img src="/blog/logo-printing.jpg" alt="ของพรีเมียมพิมพ์โลโก้" loading="lazy"><span class="badge badge-glass glass">ความรู้ &amp; เทคนิค</span></div><div class="bd"><h4>ของพรีเมียมพิมพ์โลโก้: เลือกเทคนิคไหนให้แบรนด์ดูดีและคุ้มงบ</h4><p>สกรีน เลเซอร์ ปัก หรือ UV — แต่ละเทคนิคเหมาะกับวัสดุและงบไม่เหมือนกัน</p><span style="font-family:var(--head);font-size:12.5px;color:var(--mustard-deep);margin-top:6px">อ่าน 6 นาที →</span></div></a>
      <a class="occ" href="/blog/ของขวัญองค์กรตามงบประมาณ"><div class="im"><img src="/blog/by-budget.jpg" alt="ของขวัญองค์กรตามงบประมาณ" loading="lazy"><span class="badge badge-glass glass">เทรนด์ &amp; ไอเดีย</span></div><div class="bd"><h4>จัดของขวัญองค์กรตามงบ: ได้ของดูดีทุกช่วงราคา 60–1,000+ บาท</h4><p>งบเท่าไหร่ก็มีของที่ใช่ แบ่งให้เห็นภาพชัด 4 ช่วงงบพร้อมตัวอย่าง</p><span style="font-family:var(--head);font-size:12.5px;color:var(--mustard-deep);margin-top:6px">อ่าน 6 นาที →</span></div></a>
      <a class="occ" href="/blog/ของพรีเมียมรักษ์โลก"><div class="im"><img src="/blog/eco-gift.jpg" alt="ของพรีเมียมรักษ์โลก ESG" loading="lazy"><span class="badge badge-glass glass">เทรนด์ &amp; ไอเดีย</span></div><div class="bd"><h4>ของพรีเมียมรักษ์โลก: ของขวัญองค์กรสาย ESG ที่เล่าเรื่องแบรนด์ได้</h4><p>วัสดุรีไซเคิล ดีไซน์ยั่งยืน — เลือกของขวัญที่สะท้อนความใส่ใจสิ่งแวดล้อมขององค์กร</p><span style="font-family:var(--head);font-size:12.5px;color:var(--mustard-deep);margin-top:6px">อ่าน 6 นาที →</span></div></a>
      <a class="occ" href="/blog/ของชำร่วยงานอีเวนต์องค์กร"><div class="im"><img src="/blog/event-souvenir.jpg" alt="ของชำร่วยงานอีเวนต์องค์กร" loading="lazy"><span class="badge badge-glass glass">ความรู้ &amp; เทคนิค</span></div><div class="bd"><h4>ของชำร่วยงานอีเวนต์องค์กร: เลือกของแจกให้คนจำแบรนด์ได้</h4><p>ของแจกงานสัมมนา ออกบูธ และอีเวนต์ ที่คุ้มงบและถ่ายรูปขึ้น พร้อมไทม์ไลน์สั่งผลิต</p><span style="font-family:var(--head);font-size:12.5px;color:var(--mustard-deep);margin-top:6px">อ่าน 6 นาที →</span></div></a>
    </div>
  </div></section>

  <section class="sec" style="background:#fff;padding-top:0"><div class="wrap">
    <div class="cta2"><h2>พร้อมเริ่มของขวัญชิ้นต่อไปแล้วหรือยัง</h2><p>ปรึกษาฟรี ไม่มีข้อผูกมัด ตอบกลับพร้อมไอเดียและช่วงราคาภายใน 2 ชั่วโมง</p><div class="row"><a class="btn btn-primary btn-lg" href="#/all">✦ ปรึกษา AI</a><a class="btn btn-line btn-lg" href="https://lin.ee/z1GT1KR" target="_blank" rel="noopener">ทัก LINE เลย</a></div></div>
  </div></section>
  </div>
  ${quoteSection()}`;
}
// กล่อง AI หน้าแรก → พาไปหน้าแคตตาล็อกแล้วรันตัวกรอง AI ทันที (เสนอสินค้าจริง ไม่ใช่แค่ฟอร์ม)
function askAI(){
  const v=((document.getElementById('aiq')||{}).value||'').trim();
  track('ai_search',{query:v,source:'hero'});
  location.hash='#/all';
  setTimeout(()=>{const i=document.getElementById('aifq');if(i&&v){i.value=v;aiFilter();}},80);
}

/* ===== CATALOGUE ===== */
// งบ/ชิ้น คำนวณจากราคาจริง (สินค้าส่วนใหญ่ field tier ว่าง) — ช่วงตรงกับ GP_TIERLABELS
function priceTier(pr){if(!pr)return '';return pr<=60?'value':pr<=150?'smart':pr<=300?'premium':'executive';}
// ตัวกรอง "เลือกตามโอกาส" — แมปโอกาส → หมวดสินค้าที่เหมาะ (และช่วงงบถ้ามี) แก้ไข/เพิ่มได้ที่นี่
const OCC_FILTERS=[
  {k:'newyear',label:'🎁 ปีใหม่',cats:['giftset','drinkware','lifestyle']},
  {k:'welcome',label:'👋 ต้อนรับพนักงานใหม่',cats:['drinkware','bags','stationery']},
  {k:'vip',label:'💎 ลูกค้า / ผู้บริหาร VIP',cats:['giftset','lifestyle','drinkware'],tier:['premium','executive']},
  {k:'event',label:'🎤 อีเวนต์ & สัมมนา',cats:['bags','stationery','fan','umbrella']},
  {k:'eco',label:'🌿 รักษ์โลก / ESG',cats:['lifestyle','bags','drinkware']},
  {k:'milestone',label:'🏆 ครบรอบ & Milestone',cats:['drinkware','giftset','souvenir']},
];
let FILTER={cat:'all',occ:'all',tier:'all',pmax:0,q:'',sort:'pop'};
function viewCatalogue(opts){
  const o=typeof opts==='string'?{cat:opts}:(opts||{});
  FILTER={cat:o.cat||'all',occ:o.occ||'all',tier:o.tier||'all',pmax:0,q:'',sort:'pop'};
  setTimeout(()=>{renderGrid();syncControls();},0);
  const occBtns=[['all','ทุกโอกาส'],...OCC_FILTERS.map(x=>[x.k,x.label])].map(([k,lab])=>`<button data-occ="${k}" class="${k===FILTER.occ?'on':''}"><span class="lbl">${esc(lab)}</span></button>`).join('');
  const catBtns=['all',...catList].map(c=>`<button data-cat="${c}" class="${c===FILTER.cat?'on':''}"><span class="lbl">${c==='all'?'ทั้งหมด':esc(CL[c])}</span><span class="n">${c==='all'?P.length:byCat[c].length}</span></button>`).join('');
  const tierBtns=['all','value','smart','premium','executive'].map(t=>`<button data-tier="${t}" class="${t===FILTER.tier?'on':''}"><span class="lbl">${t==='all'?'ทุกงบ':esc(TL[t])}</span></button>`).join('');
  const aiEx=['ของขวัญปีใหม่สำหรับพนักงาน งบ 150 บาท','ของขวัญลูกค้า VIP ดูพรีเมียม','ของแจกอีเวนต์ จำนวนมาก คุมงบได้','ของขวัญรักษ์โลก / ESG'];
  return `<section class="sec" style="padding-top:34px"><div class="wrap">
    <div class="crumbs"><a href="#/">หน้าแรก</a> / <b id="crumbCat">สินค้าทั้งหมด</b></div>
    <div class="ai-hero">
      <div class="ai-hero-lead">
        <div><h2>✦ ให้ AI ช่วยคิดเซ็ตของขวัญ</h2><p>บอกโอกาส งบ และจำนวน — AI คัดสินค้าที่ตรงโจทย์ให้ทันที</p></div>
      </div>
      <div class="ai-hero-input">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#8A93A2" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
        <input id="aifq" placeholder="ของขวัญปีใหม่สำหรับพนักงาน 300 ชิ้น งบ 150 บาท" onkeydown="if(event.key==='Enter')aiFilter()">
        <button class="btn btn-secondary" onclick="aiFilter()"><i>✦</i> แนะนำสินค้า</button>
      </div>
      <div class="ai-hero-ex"><span>ลองพิมพ์:</span>${aiEx.map(x=>`<button class="ex" onclick="aiExample('${x}')">${x}</button>`).join('')}</div>
    </div>
    <div class="cat-layout">
      <aside class="side" id="side"><h4>เลือกตามโอกาส</h4><div class="flist" id="occFilter">${occBtns}</div><h4>หมวดหมู่</h4><div class="flist scroll" id="catFilter">${catBtns}</div><h4>งบประมาณ / ชิ้น</h4><div class="flist" id="tierFilter">${tierBtns}</div></aside>
      <div>
        <div class="afchips" id="afchips"></div>
        <div class="toolbar"><button class="btn btn-ghost btn-sm filter-toggle" id="ftoggle">ตัวกรอง ▾</button><div class="count-lbl" id="countLbl"></div><select class="sortsel" id="sort"><option value="pop">เรียง: แนะนำ</option><option value="low">ราคาน้อย→มาก</option><option value="high">ราคามาก→น้อย</option><option value="name">ชื่อ A→Z</option></select></div>
        <div class="pgrid" id="grid"></div>
        <div id="empty" style="display:none;text-align:center;padding:60px 0;color:var(--grey)">ไม่พบสินค้าที่ตรงกับตัวกรอง — ลองล้างตัวกรองหรือค้นหาคำอื่น</div>
      </div></div></div></section>${ctaBand()}`;
}
function renderGrid(){
  const grid=document.getElementById('grid');if(!grid)return;
  let l=P.slice();
  if(FILTER.occ&&FILTER.occ!=='all'){const o=OCC_FILTERS.find(x=>x.k===FILTER.occ);if(o)l=l.filter(p=>o.cats.includes(p.catSlug)&&(!o.tier||o.tier.includes(priceTier(p.price))));}
  if(FILTER.cat!=='all')l=l.filter(p=>p.catSlug===FILTER.cat);
  if(FILTER.tier&&FILTER.tier!=='all')l=l.filter(p=>priceTier(p.price)===FILTER.tier);
  if(FILTER.pmax)l=l.filter(p=>p.price&&p.price<=FILTER.pmax);
  if(FILTER.q){const q=FILTER.q.toLowerCase();l=l.filter(p=>(p.name+' '+p.features+' '+p.cat+' '+(p.material||'')+' '+(p.size||'')+' '+p.sku+' '+(p.logo||[]).join(' ')).toLowerCase().includes(q));}
  if(FILTER.sort==='low')l.sort((a,b)=>(a.price||1e9)-(b.price||1e9));
  else if(FILTER.sort==='high')l.sort((a,b)=>(b.price||0)-(a.price||0));
  else if(FILTER.sort==='name')l.sort((a,b)=>a.name.localeCompare(b.name,'th'));
  grid.innerHTML=l.map(p=>card(p)).join('');
  document.getElementById('empty').style.display=l.length?'none':'block';
  document.getElementById('countLbl').innerHTML=`พบ <b>${l.length}</b> รายการ`;
  const cc=document.getElementById('crumbCat');if(cc)cc.textContent=FILTER.cat==='all'?'สินค้าทั้งหมด':CL[FILTER.cat];
}
// แสดง chip ตัวกรองที่ใช้อยู่ + ปุ่มลบ
function renderChips(){
  const box=document.getElementById('afchips');if(!box)return;
  const c=[];
  if(FILTER.occ&&FILTER.occ!=='all'){const o=OCC_FILTERS.find(x=>x.k===FILTER.occ);c.push(['occ','โอกาส: '+(o?o.label:FILTER.occ)]);}
  if(FILTER.cat!=='all')c.push(['cat','หมวด: '+CL[FILTER.cat]]);
  if(FILTER.tier&&FILTER.tier!=='all')c.push(['tier','งบ: '+TL[FILTER.tier]]);
  if(FILTER.pmax)c.push(['pmax','งบไม่เกิน '+FILTER.pmax+' บาท']);
  if(FILTER.q)c.push(['q','คำค้น: '+FILTER.q]);
  box.innerHTML=c.length?c.map(x=>`<span class="afchip"><b>${esc(x[1])}</b><span class="x" data-clr="${x[0]}">✕</span></span>`).join('')+`<span class="afchip" data-clr="all" style="cursor:pointer;background:var(--cloud);color:var(--navy)">ล้างทั้งหมด</span>`:'';
}
// อัปเดตสถานะปุ่ม + input ให้ตรงกับ FILTER (ใช้หลัง AI filter / ลบ chip)
function syncControls(){
  const set=(id,attr,val)=>{const box=document.getElementById(id);if(box)box.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset[attr]===val));};
  set('occFilter','occ',FILTER.occ||'all');
  set('catFilter','cat',FILTER.cat||'all');
  set('tierFilter','tier',FILTER.tier||'all');
  const q=document.getElementById('q');if(q)q.value=FILTER.q||'';
  renderChips();
}
// AI Filter — local heuristic (ไม่เรียก API): แปลงข้อความ → ตัวกรอง
function aiFilter(){
  const s=((document.getElementById('aifq')||{}).value||'').trim();if(!s)return;
  const t=s.toLowerCase();
  FILTER.occ='all';FILTER.cat='all';FILTER.tier='all';FILTER.pmax=0;FILTER.q='';
  let matched=false;
  // งบ/ชิ้น: เลขใกล้คำว่า "งบ/ไม่เกิน/ราคา" > เลขที่ตามด้วย "บาท/฿" > เลขเดี่ยวที่ไม่ใช่จำนวน (คน/ชิ้น/ใบ)
  let bm=t.match(/(\d[\d,]{0,6})\s*(?:-|–|ถึง)\s*(\d[\d,]{0,6})\s*(?:บาท|฿)?/);
  if(bm){const n=Math.max(+bm[1].replace(/,/g,''),+bm[2].replace(/,/g,''));if(n>0&&n<100000){FILTER.pmax=n;matched=true;}}
  else{
    bm=t.match(/(?:งบ(?:ประมาณ)?|ไม่เกิน|budget|ราคา)\D{0,10}(\d[\d,]{0,6})/)||t.match(/(\d[\d,]{0,6})\s*(?:บาท|฿|baht)/);
    if(!bm){const nums=[...t.matchAll(/(\d[\d,]{0,6})(\s*(?:คน|ชิ้น|อัน|ใบ|เซ็ต|กล่อง|ท่าน|ออเดอร์))?/g)].filter(x=>!x[2]);if(nums.length===1)bm=nums[0];}
    if(bm){const n=+bm[1].replace(/,/g,'');if(n>0&&n<100000){FILTER.pmax=n;matched=true;}}
  }
  if(!FILTER.pmax&&/งบน้อย|ประหยัด|ราคาถูก|ถูก ๆ|ถูกๆ/.test(t)){FILTER.tier='value';matched=true;}
  const OCCKW=[
    ['newyear',/ปีใหม่|new ?year|ปลายปี|ส่งท้ายปี|สงกรานต์|ปีเก่า|เทศกาล/],
    ['welcome',/ต้อนรับ|พนักงานใหม่|onboard|welcome|วันแรก|เวลคัม|first ?day/],
    ['vip',/vip|ผู้บริหาร|ลูกค้าคนสำคัญ|ลูกค้าพิเศษ|คู่ค้า|exclusive|หรู|พรีเมียมสุด|ระดับสูง/],
    ['event',/อีเวนต์|สัมมนา|event|ออกบูธ|บูธ|แจกงาน|งานแสดง|ประชุม|expo|งานแฟร์|ออกงาน|seminar/],
    ['eco',/รักษ์โลก|eco|esg|ยั่งยืน|green|รีไซเคิล|สิ่งแวดล้อม|recycle|ใส่ใจโลก/],
    ['milestone',/ครบรอบ|milestone|รางวัล|เกษียณ|ความสำเร็จ|ฉลอง|anniversary|ที่ระลึกบริษัท/],
  ];
  for(const [k,re] of OCCKW){if(re.test(t)){FILTER.occ=k;matched=true;break;}}
  // เรียงหมวดเฉพาะเจาะจงก่อนหมวดกว้าง (luggage/packaging ก่อน bags ฯลฯ) — match แรกชนะ
  const CATKW=[
    ['luggage',/กระเป๋าเดินทาง|ล้อลาก|luggage|trolley|เดินทาง/],
    ['packaging',/กล่องของขวัญ|บรรจุภัณฑ์|แพ็กเกจ|ริบบิ้น|ถุงกระดาษ|ถุงของขวัญ|packaging/],
    ['kitchen',/กล่องข้าว|กล่องอาหาร|ปิ่นโต|ช้อน|ส้อม|จาน|ชาม|เขียง|ครัว|lunch ?box|kitchen/],
    ['scent',/น้ำหอม|เทียนหอม|อโรม่า|ก้านหอม|diffuser|candle|กลิ่น/],
    ['drinkware',/กระบอก|แก้ว|กระติก|ขวดน้ำ|น้ำ|ดื่ม|tumbler|flask|mug/],
    ['powerbank',/พาวเวอร์|powerbank|แบตสำรอง|ที่ชาร์จ/],
    ['fan',/พัดลม|fan/],
    ['umbrella',/ร่ม|umbrella/],
    ['stationery',/ปากกา|สมุด|เครื่องเขียน|โน้ต|ดินสอ|แฟ้ม|post ?it|note|pen/],
    ['souvenir',/ของชำร่วย|ของที่ระลึก|พวงกุญแจ|keychain|เหรียญ|โล่|แม่เหล็ก|magnet/],
    ['pet',/สัตว์เลี้ยง|สุนัข|หมา|แมว|pet/],
    ['baby-kid',/เด็ก|ทารก|baby|kid/],
    ['hat',/หมวก|cap|บักเก็ต/],
    ['garment',/เสื้อ|polo|ยูนิฟอร์ม|แจ็กเก็ต|ฮู้ด|t-?shirt|ทีเชิ้ต|garment/],
    ['bags',/กระเป๋า|เป้|ถุงผ้า|ถุง|tote|bag/],
    ['giftset',/เซ็ต|กิฟต์|กิ๊ฟ|กิฟท์|gift ?set|ชุดของขวัญ/],
    ['lifestyle',/ไลฟ์สไตล์|ของใช้|ผ้าขนหนู|หมอน|lifestyle/],
  ];
  for(const [k,re] of CATKW){if(re.test(t)&&byCat[k]){FILTER.cat=k;matched=true;break;}}
  // กัน occ+cat ที่ขัดกันจนผลว่าง — หมวดเจาะจงชนะ
  if(FILTER.occ!=='all'&&FILTER.cat!=='all'){const o=OCC_FILTERS.find(x=>x.k===FILTER.occ);if(o&&!o.cats.includes(FILTER.cat))FILTER.occ='all';}
  if(!matched)FILTER.q=s;
  track('ai_search',{query:s,source:'catalogue',cat:FILTER.cat,occ:FILTER.occ,pmax:FILTER.pmax});
  renderGrid();syncControls();
}
// คลิกชิปตัวอย่าง → เติมข้อความแล้วกรองด้วย AI ทันที
function aiExample(s){const i=document.getElementById('aifq');if(i){i.value=s;aiFilter();i.scrollIntoView({behavior:'smooth',block:'center'});}}
function clearDim(k){
  if(k==='all'){FILTER.occ='all';FILTER.cat='all';FILTER.tier='all';FILTER.pmax=0;FILTER.q='';const a=document.getElementById('aifq');if(a)a.value='';}
  else if(k==='pmax')FILTER.pmax=0;else if(k==='q')FILTER.q='';else FILTER[k]=k==='cat'?'all':'all';
  renderGrid();syncControls();
}
function bindCatalogue(){
  const cf=document.getElementById('catFilter');if(!cf)return;
  const of=document.getElementById('occFilter'),tf=document.getElementById('tierFilter');
  of.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;FILTER.occ=b.dataset.occ;FILTER.cat='all';mark(of,b);renderGrid();syncControls();});
  cf.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;FILTER.cat=b.dataset.cat;FILTER.occ='all';mark(cf,b);renderGrid();syncControls();});
  tf.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;FILTER.tier=b.dataset.tier;mark(tf,b);renderGrid();syncControls();});
  document.getElementById('afchips').addEventListener('click',e=>{const x=e.target.closest('[data-clr]');if(!x)return;clearDim(x.dataset.clr);});
  document.getElementById('sort').addEventListener('change',e=>{FILTER.sort=e.target.value;renderGrid();});
  document.getElementById('ftoggle').addEventListener('click',()=>document.getElementById('side').classList.toggle('open'));
}
function mark(box,btn){box.querySelectorAll('button').forEach(x=>x.classList.remove('on'));btn.classList.add('on');}

/* ===== PRODUCT ===== */
function viewProduct(sku){
  const p=P.find(x=>x.sku===sku);if(!p)return `<section class="sec"><div class="wrap">ไม่พบสินค้านี้ — <a class="accent" href="#/all">กลับไปแคตตาล็อก</a></div></section>`;
  const logos=(p.logo&&p.logo.length)?p.logo:['สอบถามเทคนิคพิมพ์'];
  const rel=byCat[p.catSlug].filter(x=>x.sku!==p.sku).slice(0,4);
  return `<section class="sec" style="padding-top:30px"><div class="wrap">
    <div class="crumbs"><a href="#/">หน้าแรก</a> / <a href="#/c/${p.catSlug}">${esc(CL[p.catSlug]||p.cat)}</a> / <b>${esc(p.name)}</b></div>
    <div class="pd"><div><div class="pd-img"><img id="pdMain" src="${pimg(p)}" alt="${esc(p.name)}"></div>${(p.gallery&&p.gallery.length>1)?`<div class="pd-thumbs">${p.gallery.map(g=>`<img src="${g}" alt="" onclick="document.getElementById('pdMain').src='${g}'">`).join('')}</div>`:''}</div>
      <div><span class="eyebrow"><span class="dot"></span>${esc(CL[p.catSlug]||p.cat)} · ${esc(p.sku)}</span>
        <h1>${esc(p.name)}</h1><p class="muted" style="font-size:16px;line-height:1.7">${esc(p.features)}</p>
        <div class="pd-price">${baht(p.price)} <small>${p.price?'/ ชิ้น (เริ่มที่ MOQ '+p.moq+' ชิ้น)':''}</small></div>
        <div class="spec">
          ${p.size?`<div><div class="k">ขนาด</div><div class="v">${esc(p.size)}</div></div>`:''}
          ${p.material?`<div><div class="k">วัสดุ</div><div class="v">${esc(p.material)}</div></div>`:''}
          <div><div class="k">ขั้นต่ำ (MOQ)</div><div class="v">${p.moq} ชิ้น</div></div>
          ${p.tier?`<div><div class="k">ระดับงบ</div><div class="v">${esc(TL[p.tier]||p.tier)}</div></div>`:''}
          ${p.logoMax?`<div><div class="k">พื้นที่โลโก้สูงสุด</div><div class="v">${esc(p.logoMax)} ซม.</div></div>`:''}
          <div style="grid-column:1/-1"><div class="k">เทคนิคพิมพ์โลโก้ฟรี</div><div class="chips">${logos.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>
        </div>
        <div class="pd-cta"><a class="btn btn-primary btn-lg" href="#/quote">ขอใบเสนอราคาสินค้านี้</a><a class="btn btn-line-ghost btn-lg" href="https://lin.ee/z1GT1KR" target="_blank" rel="noopener">สอบถามทาง LINE</a></div>
        <p class="muted" style="font-size:12.5px;margin-top:14px">* ราคาอ้างอิงที่ 300 ชิ้น พิมพ์โลโก้ · ทำ Mockup ให้ดูก่อนผลิตจริงทุกงาน · ตอบกลับใน 2 ชม.</p>
      </div></div>
    <div class="related"><div class="shead center" style="margin-bottom:26px"><h2 class="h2" style="font-size:26px">สินค้าอื่นในหมวด ${esc(CL[p.catSlug]||p.cat)}</h2></div><div class="pgrid">${rel.map(p=>card(p)).join('')}</div></div>
  </div></section>`;
}
function viewQuote(){return `<section class="sec" style="padding-bottom:0"><div class="wrap"><div class="crumbs"><a href="#/">หน้าแรก</a> / <b>ขอใบเสนอราคา</b></div></div></section>${quoteSection()}`;}

/* ===== ABOUT (เรื่องราวแบรนด์ — ใช้ทั้งใน section หน้าแรก และหน้า #/about) ===== */
function aboutStory(){return `<div class="story"><div class="dotgrid on-dark" style="position:absolute;inset:0;opacity:.4"></div><div style="position:relative">
    <span class="eyebrow on-dark"><span class="dot"></span>เรื่องราวแบรนด์ · Go beyond the gift</span>
    <h2 class="h2 on-dark" style="margin-top:14px;max-width:24ch">เราไม่ได้ขาย “ของแจก” แต่ออกแบบ “ประสบการณ์การให้”</h2>
    <p class="lead" style="color:#CBD7E8;margin-top:14px">GO PREMIUM โดย Passion Grow Trading คือผู้ออกแบบและผลิตของพรีเมียมและของขวัญองค์กร ที่เชื่อว่าของขวัญที่ดีไม่ได้วัดกันที่ราคา แต่วัดกันที่ “ความรู้สึก” ที่ผู้รับจะจดจำ — เราช่วยให้แบรนด์และองค์กรสร้างความสัมพันธ์ที่ลึกขึ้นกับพนักงาน คู่ค้า และลูกค้า</p>
    <div class="g-auto val-grid">${VALUES.map(v=>`<div class="val"><h4>${v[0]}</h4><p>${v[1]}</p></div>`).join('')}</div>
  </div></div>`;}
function viewAbout(){return `<section class="sec about" style="padding-top:34px"><div class="wrap">
    <div class="crumbs"><a href="#/">หน้าแรก</a> / <b>เกี่ยวกับเรา</b></div>
    ${aboutStory()}
  </div></section>${ctaBand()}`;}

/* ===== EXPRESS (สินค้าส่งด่วน) =====
   รายการ SKU ที่ส่งด่วน — เติม sku ของสินค้าที่ผลิต/ส่งทันงานด่วนได้ที่นี่ เช่น ['DW001','BG002']
   ถ้าปล่อยว่าง หน้าจะแสดงเฉพาะข้อมูลบริการ + CTA (ไม่แสดงสินค้าปลอม) */
const EXPRESS_SKUS=["EX004","EX005","EX006","EX025","EX026","EX027","EX028","EX029","EX030","EX031","EX032","EX033","EX034","EX035","EX036","EX037","EX038","EX039","EX040","EX041","EX082","EX083","EX084","EX085","EX086","EX087","EX088","EX089","EX001","EX002","EX003","EX007","EX042","EX044","EX045","EX046","EX047","EX048","EX049","EX050","EX051","EX052","EX076","EX077","EX078","EX079","EX080","EX081","EX090","EX091","EX092","EX093","EX008","EX009","EX043","EX053","EX054","EX055","EX062","EX064","EX010","EX011","EX012","EX013","EX014","EX015","EX016","EX017","EX018","EX019","EX094","EX095","EX096","EX097","EX098","EX099","EX100","EX020","EX021","EX110","EX111","EX022","EX023","EX024","EX101","EX102","EX103","EX104","EX105","EX106","EX107","EX108","EX109"];
const EXPRESS_CAT_ORDER=['drinkware','garment','hat','umbrella','bags','powerbank','fan','lifestyle'];
function ecard(p){
  const sw=(p.swatches||[]);
  const dots=sw.map(h=>`<span class="edot" style="background:${h}"></span>`).join('');
  const extra=(p.nColors||0)-sw.length;
  const more=extra>0?`<span class="emore">+${extra}</span>`:'';
  const colorRow=(p.nColors>1)?`<div class="eswatches">${dots}${more}<span class="encol">${p.nColors} สี</span></div>`:`<div class="eswatches"></div>`;
  return `<a class="pcard ecard" href="#/p/${p.sku}"><div class="pthumb"><span class="pchip">${esc(CL[p.catSlug]||p.cat)}</span><span class="ebadge"><span class="flash">⚡</span> 7–14 วัน</span><img loading="lazy" src="${pimg(p)}" alt="${esc(p.name)}"></div>
    <div class="pbody"><div class="pname">${esc(p.name)}</div>${colorRow}
    <div class="pfoot"><span class="emoq">MOQ ${p.moq}</span><span class="ecta">ขอราคา →</span></div></div></a>`;
}
const EXPRESS_POINTS=[
  ['ผลิต + ส่งมอบ 7–14 วัน','สำหรับองค์กรที่มี deadline ชัด เราวางแผนการผลิตให้ทันงาน'],
  ['ตอบกลับ + เสนอราคาใน 2 ชม.','แจ้งจำนวนและกำหนดรับงาน เราเช็กคิวผลิตและยืนยันให้ไว'],
  ['Mockup ก่อนผลิตเสมอ','แม้งานด่วนก็ยังเห็นแบบก่อนผลิตจริง ลดความเสี่ยงงานพลาด'],
];
function viewExpress(){
  const list=P.filter(p=>EXPRESS_SKUS.includes(p.sku)&&p.img);
  const groups={};list.forEach(p=>{(groups[p.catSlug]=groups[p.catSlug]||[]).push(p);});
  const cats=EXPRESS_CAT_ORDER.filter(c=>groups[c]).concat(Object.keys(groups).filter(c=>!EXPRESS_CAT_ORDER.includes(c)));
  const chips=cats.map(c=>`<a class="echip" href="#ecat-${c}">${esc(CL[c]||c)} (${groups[c].length})</a>`).join('');
  const sections=cats.map(c=>`<div class="ecat" id="ecat-${c}"><div class="ecat-head"><h3>${esc(CL[c]||c)}</h3><span class="ecat-n">${groups[c].length} รายการ · พร้อมผลิต</span></div><div class="pgrid">${groups[c].map(ecard).join('')}</div></div>`).join('');
  const body=list.length
    ? `<div class="shead" style="margin-top:6px"><span class="eyebrow"><span class="dot"></span>พร้อมผลิตด่วน</span><h2 class="h2">สินค้าพร้อมส่ง · ภาพสินค้าจริงทุกชิ้น</h2><p class="lead">คัดเฉพาะรุ่นที่ผลิตและส่งมอบได้ทันงานด่วน ${list.length} รายการ — เลือกสีได้หลากหลาย พิมพ์โลโก้ และยืนยันคิวผลิตตามจำนวนของคุณ</p><div class="ecount">⚡ <b>${list.length}</b> รุ่นพร้อมผลิต · ตอบกลับใน 2 ชม.</div></div><div class="echips">${chips}</div>${sections}`
    : `<div class="card" style="text-align:center;padding:40px 24px;margin-top:8px"><h4 style="font-size:18px;color:var(--navy);margin-bottom:8px">บอกโจทย์งานด่วนของคุณ เราจัดให้</h4><p class="muted" style="max-width:48ch;margin:0 auto 18px">แจ้งจำนวน กำหนดส่ง และงบ/ชิ้น — ทีมเราจะเสนอรุ่นที่ผลิตได้ทันงานด่วนพร้อมช่วงราคาให้ภายใน 2 ชม.</p></div>`;
  return `<section class="sec" style="padding-top:34px"><div class="wrap">
    <div class="crumbs"><a href="#/">หน้าแรก</a> / <b>สินค้าส่งด่วน</b></div>
    <div class="nh" style="margin-bottom:32px"><div class="promo express">
      <div class="tx">
        <span class="eyebrow2"><span class="flash">⚡</span> Express Service · งานด่วน</span>
        <h2 class="h2" style="margin:0">สินค้าส่งด่วน<br>พร้อมผลิต &amp; ส่งมอบใน 7–14 วัน</h2>
        <p>มี deadline กระชั้น? เราคัดสินค้าพร้อมผลิต พิมพ์โลโก้ และวางแผนส่งมอบให้ทันงาน — พร้อม Mockup ก่อนผลิตทุกออเดอร์ ตอบกลับใน 2 ชม.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:6px"><a class="btn btn-primary" href="https://lin.ee/z1GT1KR" target="_blank" rel="noopener">ทักด่วนทาง LINE →</a><a class="btn btn-ghost" style="border-color:rgba(31,58,95,.3);color:var(--navy)" href="#/quote">ขอใบเสนอราคางานด่วน</a></div>
      </div>
      <div class="im"><img loading="eager" src="banners/banner1.webp" alt="งานด่วนพร้อมส่ง 7–14 วัน — GO PREMIUM"></div>
    </div></div>
    <div class="g-auto svc-grid">${EXPRESS_POINTS.map(s=>`<div class="card svc"><div class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1L12 16.8 5.7 21l2.3-7.1-6-4.5h7.6z"/></svg></div><h4>${s[0]}</h4><p>${s[1]}</p></div>`).join('')}</div>
    ${body}
  </div></section>${ctaBand()}`;
}

/* ===== PORTFOLIO (ผลงานของเรา · Landing Page) =====
   หน้ารวมแนวงาน/ผลงานที่เราออกแบบและผลิตให้องค์กร ใช้ข้อมูลชุดเดียวกับหน้าแรก
   (CASES, OCCS, STEPS, REVS, CLIENTS) — ไม่มีการกล่าวอ้างลูกค้า/ราคาปลอม */
function viewPortfolio(){
  const logoWall=CLIENTS.map(c=>`<div class="logo-cell"><img src="clients/${c}.png" alt="ลูกค้าองค์กรของ GO PREMIUM" loading="lazy"></div>`).join('');
  // ตัวอย่างสินค้าจริง — ดึงสินค้าที่มี "รูปถ่ายจริง" 1 ชิ้นต่อหมวด (สูงสุด 8 หมวด)
  const showcase=catList.map(c=>(byCat[c]||[]).find(p=>p.img)).filter(Boolean).slice(0,8);
  const showCards=showcase.map(p=>`<a class="occ" href="#/p/${p.sku}"><div class="im" style="aspect-ratio:4/3"><img src="${pimg(p)}" alt="${esc(p.name)}" loading="lazy"><span class="badge badge-glass glass">${esc(CL[p.catSlug]||p.cat)}</span></div><div class="bd"><h4>${esc(p.name)}</h4><p>${esc(p.features||'พิมพ์โลโก้ได้ พร้อม Mockup ก่อนผลิต')}</p></div></a>`).join('');
  const caseCards=CASES.map(c=>`<div class="occ"><div class="im" style="aspect-ratio:4/3"><img src="${repImg(c[3])}" alt="${esc(c[0])}" loading="lazy"><span class="badge badge-glass glass">${esc(c[1])}</span></div><div class="bd"><h4>${esc(c[0])}</h4><p>${esc(c[2])}</p></div></div>`).join('');
  const playIcon='<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  return `<section class="sec" style="padding-top:34px"><div class="wrap">
    <div class="crumbs"><a href="#/">หน้าแรก</a> / <b>ผลงานของเรา</b></div>
    <div class="thanks-hero">
      <span class="eyebrow"><span class="dot"></span>ผลงานของเรา · Thank You</span>
      <h1>ขอบคุณทุกองค์กรที่ไว้วางใจ<br>ให้เราเป็นส่วนหนึ่งของการให้</h1>
      <p class="lead">ทุกโลโก้บนหน้านี้คือความไว้วางใจที่เรารู้สึกขอบคุณจริง ๆ — ขอบคุณที่ให้ GO PREMIUM ได้ดูแลของขวัญและของพรีเมียมขององค์กรคุณ ตั้งแต่คอนเซ็ปต์ ดีไซน์ ผลิต จนถึงส่งมอบ เราสัญญาว่าจะตั้งใจกับทุกงานเหมือนเป็นงานแรกเสมอ</p>
      <div class="thanks-stats">
        <div class="st"><div class="n">100,000+</div><div class="l">ชิ้นที่ผลิตและส่งมอบแล้ว</div></div>
        <div class="st"><div class="n">${P.length}+</div><div class="l">รายการสินค้าพร้อมพิมพ์โลโก้</div></div>
        <div class="st"><div class="n">100%</div><div class="l">ทุกงานผ่าน Mockup ก่อนผลิต</div></div>
        <div class="st"><div class="n">2 ชม.</div><div class="l">ตอบกลับทุกคำขอ</div></div>
      </div>
    </div>
  </div></section>

  <section class="sec" style="background:#fff;padding-top:clamp(40px,5vw,72px)"><div class="wrap">
    <div class="shead center"><span class="eyebrow"><span class="dot"></span>ขอบคุณลูกค้าของเรา</span><h2 class="h2">องค์กรที่มอบความไว้วางใจให้เรา</h2><p class="lead" style="text-align:center">ตั้งแต่บริษัทในตลาดหลักทรัพย์ แบรนด์ระดับสากล ไปจนถึงสถาบันการศึกษาชั้นนำ — ขอบคุณที่เลือกเรา</p></div>
    <div class="logo-wall">${logoWall}</div>
  </div></section>

  <section class="sec" style="background:var(--cloud)"><div class="wrap">
    <div class="shead center"><span class="eyebrow"><span class="dot"></span>ตัวอย่างสินค้าจริง</span><h2 class="h2">งานจริงที่เราออกแบบและผลิต</h2><p class="lead" style="text-align:center">ภาพถ่ายสินค้าจริงจากสตูดิโอของเรา — ทุกชิ้นพิมพ์โลโก้ได้ และเห็น Mockup ก่อนผลิตเสมอ คลิกเพื่อดูรายละเอียดสินค้า</p></div>
    <div class="g-auto occ-grid">${showCards}</div>
  </div></section>

  <section class="sec" style="background:#fff"><div class="wrap">
    <div class="shead center"><span class="eyebrow"><span class="dot"></span>วิดีโอเบื้องหลังการผลิต</span><h2 class="h2">เครื่องพิมพ์ของเรา — ทำงานจริงทุกวัน</h2><p class="lead" style="text-align:center">ชมเบื้องหลังการพิมพ์โลโก้ลงบนสินค้าจริง คุมคุณภาพทุกชิ้นด้วยเครื่องพิมพ์ของเราเอง</p></div>
    <div class="video-wrap" id="printVideo">
      <video controls preload="none" playsinline poster="videos/printing-machine-poster.jpg">
        <source src="videos/printing-machine.mp4" type="video/mp4">
      </video>
      <div class="video-ph" id="videoPh">
        <div class="play">${playIcon}</div>
        <div class="cap">วิดีโอสาธิตเครื่องพิมพ์</div>
        <div class="sub" id="videoSub">เบื้องหลังการผลิตและพิมพ์โลโก้ของ GO PREMIUM</div>
      </div>
    </div>
  </div></section>

  <section class="sec" style="background:var(--cloud)"><div class="wrap">
    <div class="shead center"><span class="eyebrow"><span class="dot"></span>แนวงานยอดนิยม</span><h2 class="h2">ไอเดียจัดเซ็ตตามโอกาสสำคัญ</h2><p class="lead" style="text-align:center">รวมแนวงานที่องค์กรเลือกบ่อย — ปรับดีไซน์ วัสดุ และแพ็กเกจได้ตามแบรนด์และงบของคุณ</p></div>
    <div class="g-auto occ-grid">${caseCards}</div>
  </div></section>

  <section class="sec" style="background:#fff"><div class="wrap">
    <div class="shead center"><span class="eyebrow"><span class="dot"></span>ขั้นตอนการทำงาน</span><h2 class="h2" style="max-width:20ch">เบื้องหลังทุกผลงาน — ครบ จบในที่เดียว</h2></div>
    <div class="g-auto step-grid">${STEPS.map(s=>`<div class="step ${s[3]?'ai':''}"><div class="top"><div class="ic"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s[4]}</svg></div><span class="nn">${s[0]}</span></div><h4>${s[1]}${s[3]?' <span class="badge badge-ai">✦ AI</span>':''}</h4><p>${s[2]}</p></div>`).join('')}</div>
  </div></section>

  <section class="sec" style="background:var(--cloud)"><div class="wrap">
    <div class="shead center"><span class="eyebrow"><span class="dot"></span>เสียงจากลูกค้า</span><h2 class="h2">องค์กรที่ไว้ใจให้เราดูแล</h2></div>
    <div class="g-auto rev-grid">${REVS.map(r=>`<div class="rev ${r[3]?'dk':''}"><div class="stars">${'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1L12 16.8 5.7 21l2.3-7.1-6-4.5h7.6z"/></svg>'.repeat(5)}</div><q>"${r[0]}"</q><div class="who"><div class="av">${r[2]}</div><div class="r">${r[1]}</div></div></div>`).join('')}</div>
  </div></section>

  ${ctaBand()}${quoteSection()}`;
}

/* ===== portfolio printing-machine video (graceful placeholder until .mp4 uploaded) ===== */
function initPortfolioVideo(){
  const wrap=document.getElementById('printVideo');if(!wrap)return;
  const v=wrap.querySelector('video'),ph=document.getElementById('videoPh'),sub=document.getElementById('videoSub');
  if(!v||!ph)return;
  let ready=false;
  v.addEventListener('loadeddata',()=>{ready=true;},{once:true});
  // ไฟล์ยังไม่ถูกอัปโหลด → แสดงสถานะ "เร็ว ๆ นี้" แทนที่จะเป็นกล่องว่าง
  v.addEventListener('error',()=>{ph.classList.add('pending');if(sub)sub.textContent='🎬 วิดีโอกำลังจะมาเร็ว ๆ นี้';},true);
  ph.addEventListener('click',()=>{if(ph.classList.contains('pending'))return;if(ready){ph.classList.add('hide');v.play();}else{v.load();v.play().then(()=>ph.classList.add('hide')).catch(()=>{ph.classList.add('pending');if(sub)sub.textContent='🎬 วิดีโอกำลังจะมาเร็ว ๆ นี้';});}});
  v.load();
}

/* ===== quote form binding ===== */
function bindQuote(){
  const f=document.getElementById('quoteForm');if(!f)return;
  f.addEventListener('submit',e=>{e.preventDefault();const el=f.elements;let ok=true;
    const ck={name:el.name.value.trim()!=='',contact:/^[\d\s+\-()]{8,}$/.test(el.contact.value.trim())||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.contact.value.trim())};
    for(const k in ck){const i=el[k],m=f.querySelector('[data-e="'+k+'"]');if(!ck[k]){ok=false;i.classList.add('err');if(m)m.style.display='block';}else{i.classList.remove('err');if(m)m.style.display='none';}}
    if(!ok){f.querySelector('.err').focus();return;}
    const btn=f.querySelector('button[type=submit]');btn.disabled=true;btn.style.opacity='.6';
    // ส่งเข้า Formspree (→ info@passiongrow.co.th) — ID เดียวกับ src/config.js
    fetch('https://formspree.io/f/xbdejbyr',{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}})
      .then(r=>{if(!r.ok)throw new Error('formspree '+r.status);
        track('generate_lead',{source:'v2_quote_form',occasion:el.occasion.value||'',qty:el.qty.value||'',budget:el.budget.value||''});
        document.getElementById('qbody').style.display='none';document.getElementById('qok').classList.add('show');
        const q=document.getElementById('quote');if(q)q.scrollIntoView({behavior:'smooth'});})
      .catch(()=>{alert('ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือทักทาง LINE @gopremium ได้เลยค่ะ');})
      .finally(()=>{btn.disabled=false;btn.style.opacity='';});
  });
}
function resetQuote(){const f=document.getElementById('quoteForm');if(!f)return;f.reset();document.getElementById('qok').classList.remove('show');document.getElementById('qbody').style.display='';}

/* ===== hero carousel (click-to-go, auto-advance, hover-pause) ===== */
function initHero(){
  const slides=document.querySelector('.hero-slides');
  const track=slides&&slides.querySelector('.hero-track');
  const dots=slides?[...slides.querySelectorAll('.hdots i')]:[];
  if(!track||!dots.length) return;
  if(window._heroT){clearInterval(window._heroT);window._heroT=null;}
  const n=dots.length;let i=0;
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const go=(k)=>{i=(k%n+n)%n;track.style.transform=`translateX(-${i*(100/n)}%)`;dots.forEach((d,j)=>d.classList.toggle('on',j===i));};
  const stop=()=>{if(window._heroT){clearInterval(window._heroT);window._heroT=null;}};
  const start=()=>{stop();if(!reduce)window._heroT=setInterval(()=>go(i+1),5500);};
  dots.forEach((d,j)=>{
    d.addEventListener('click',()=>{go(j);start();});
    d.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go(j);start();}});
  });
  slides.addEventListener('mouseenter',stop);
  slides.addEventListener('mouseleave',start);
  go(0);start();
}

/* ===== AI box: minimal typewriter placeholder ===== */
function initAIType(){
  const el=document.getElementById('aiq');
  if(!el) return;
  const full='ของขวัญปีใหม่พนักงาน 300 บาท';
  if(window._aiTypeT){clearTimeout(window._aiTypeT);window._aiTypeT=null;}
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(reduce){el.placeholder=full;return;}
  // split by grapheme so Thai vowels/tone marks stay attached to their consonant
  let units;
  try{const seg=new Intl.Segmenter('th',{granularity:'grapheme'});units=[...seg.segment(full)].map(s=>s.segment);}
  catch(e){units=Array.from(full);}
  const caret='▏';let i=0,dir=1;
  const tick=(d)=>{window._aiTypeT=setTimeout(step,d);};
  function step(){
    if(!document.body.contains(el)){window._aiTypeT=null;return;}      // input gone → stop loop
    if(document.activeElement===el||el.value){return tick(600);}       // pause while user is typing
    i+=dir;
    if(i>=units.length){i=units.length;dir=-1;el.placeholder=units.join('');return tick(2200);} // hold full
    if(i<=0){i=0;dir=1;el.placeholder='';return tick(650);}            // brief blank before retype
    el.placeholder=units.slice(0,i).join('')+caret;
    tick(dir>0?(55+Math.random()*55):30);                              // type slow, erase fast
  }
  step();
}

/* ===== router ===== */
const SITE='https://www.xn--22ck4b1ansahhp4gvdtab7n8e.com';
const DEF_TITLE='ของพรีเมียม ของขวัญองค์กร พิมพ์โลโก้ ครบวงจร | GO PREMIUM';
const DEF_DESC='GO PREMIUM โดย Passion Grow Trading — ออกแบบและผลิตของพรีเมียม ของขวัญองค์กร พิมพ์โลโก้ ครบวงจร ดีไซน์ ผลิต ส่งมอบ · แคตตาล็อก '+P.length+' รายการ · ตอบกลับใน 2 ชม.';
// อัปเดต title/description/canonical/OG รายหน้า + ยิง GA4 page_view (SPA)
function setMeta(title,desc,path){
  document.title=title;
  const url=SITE+(path||'/');
  const put=(sel,attr,v)=>{const el=document.querySelector(sel);if(el&&v)el.setAttribute(attr,v);};
  put('meta[name=description]','content',desc||DEF_DESC);
  put('#canon','href',url);put('#ogUrl','content',url);
  put('#ogTitle','content',title);put('#twTitle','content',title);
  put('#ogDesc','content',desc||DEF_DESC);put('#twDesc','content',desc||DEF_DESC);
  track('page_view',{page_path:path||'/',page_title:title});
}
// JSON-LD Product รายหน้าสินค้า (ล้างเมื่อออกจากหน้า)
function setProductLD(p){
  const el=document.getElementById('ldRoute');if(!el)return;
  if(!p){el.textContent='';return;}
  const ld={'@context':'https://schema.org','@type':'Product','name':p.name,'sku':p.sku,'description':p.features||'','category':CL[p.catSlug]||p.cat,'brand':{'@type':'Brand','name':'GO PREMIUM'},'url':SITE+'/product/'+p.slug};
  if(p.img)ld.image=SITE+p.img.split('?')[0];
  if(p.price)ld.offers={'@type':'Offer','priceCurrency':'THB','price':String(p.price),'availability':'https://schema.org/InStock','url':SITE+'/product/'+p.slug};
  el.textContent=JSON.stringify(ld);
}
// แปลง URL แบบ path (จาก sitemap/ลิงก์ภายนอก เช่น /product/dw001) → route ภายใน เพื่อให้ทุก URL แสดงเนื้อหาที่ถูกต้อง
function routeFromPath(){
  let p;try{p=decodeURIComponent(location.pathname);}catch(e){p=location.pathname;}
  if(p==='/products'||p==='/catalogue')return '/all';
  if(p==='/quote')return '/quote';
  let m;
  if((m=p.match(/^\/category\/([^/]+)\/?$/)))return '/c/'+m[1];
  // alias สำหรับ slug โอกาสของแอปเก่าที่อาจติด index แล้ว
  const OCC_ALIAS={'new-year':'newyear','songkran':'newyear','new-employee':'welcome','esg':'eco','thank-you':'milestone','executive':'vip','mass-staff':'event'};
  if((m=p.match(/^\/occasion\/([^/]+)\/?$/)))return '/o/'+(OCC_ALIAS[m[1]]||m[1]);
  if((m=p.match(/^\/budget\/([^/]+)\/?$/)))return '/b/'+m[1];
  if((m=p.match(/^\/product\/([^/]+)\/?$/))){const s=m[1].toLowerCase();const pr=P.find(x=>(x.slug||'').toLowerCase()===s||x.sku.toLowerCase()===s);if(pr)return '/p/'+pr.sku;}
  return '/';
}
const OCC_TITLE=k=>{const o=OCC_FILTERS.find(x=>x.k===k);return o?o.label.replace(/^[^ก-๙a-zA-Z]+\s*/,''):k;};
function render(){
  const h=location.hash.replace(/^#/,'')||routeFromPath();const app=document.getElementById('app');
  document.getElementById('drawer').classList.remove('open');let m;
  setProductLD(null);
  if(h==='/'){app.innerHTML=viewHome();bindQuote();setMeta(DEF_TITLE,DEF_DESC,'/');}
  else if(h==='/all'){app.innerHTML=viewCatalogue('all');bindCatalogue();setMeta('สินค้าทั้งหมด '+P.length+' รายการ — ของพรีเมียมพิมพ์โลโก้ | GO PREMIUM','แคตตาล็อกของพรีเมียมพิมพ์โลโก้ '+P.length+' รายการ เลือกตามโอกาส งบประมาณ และหมวดสินค้า พร้อม Mockup ก่อนผลิต','/products');}
  else if(h==='/quote'){app.innerHTML=viewQuote();bindQuote();setMeta('ขอใบเสนอราคาของพรีเมียม — ตอบกลับใน 2 ชม. | GO PREMIUM','ขอใบเสนอราคาของขวัญองค์กรและของพรีเมียมพิมพ์โลโก้ ปรึกษาฟรี ตอบกลับพร้อมช่วงราคาภายใน 2 ชม.','/quote');}
  else if((m=h.match(/^\/c\/(.+)$/))){const c=decodeURIComponent(m[1]);app.innerHTML=viewCatalogue({cat:c});bindCatalogue();setMeta((CL[c]||c)+' พิมพ์โลโก้ ราคาขายส่ง | GO PREMIUM',(CL[c]||c)+'สำหรับองค์กร พิมพ์โลโก้ได้ทุกชิ้น '+(byCat[c]?byCat[c].length+' รุ่น ':'')+'พร้อม Mockup ก่อนผลิต ขอใบเสนอราคาฟรี','/category/'+c);}
  else if((m=h.match(/^\/o\/(.+)$/))){const o=decodeURIComponent(m[1]);app.innerHTML=viewCatalogue({occ:o});bindCatalogue();setMeta('ของขวัญ'+OCC_TITLE(o)+' — ของพรีเมียมองค์กร | GO PREMIUM','รวมของพรีเมียมและของขวัญองค์กรสำหรับ'+OCC_TITLE(o)+' พิมพ์โลโก้ จัดเซ็ตได้ พร้อม Mockup ก่อนผลิต','/occasion/'+o);}
  else if((m=h.match(/^\/b\/(.+)$/))){const b=decodeURIComponent(m[1]);app.innerHTML=viewCatalogue({tier:b});bindCatalogue();setMeta('ของพรีเมียมงบ '+(TL[b]||b)+' | GO PREMIUM','ของขวัญองค์กรช่วงงบ '+(TL[b]||b)+' คัดแล้วว่าดูดีในงบ พิมพ์โลโก้ได้ พร้อมใบเสนอราคาใน 2 ชม.','/budget/'+b);}
  else if((m=h.match(/^\/p\/(.+)$/))){const sku=decodeURIComponent(m[1]);app.innerHTML=viewProduct(sku);
    const p=P.find(x=>x.sku===sku);
    if(p){setMeta(p.name+' — '+(CL[p.catSlug]||p.cat)+' พิมพ์โลโก้ | GO PREMIUM',(p.features||p.name)+(p.price?' · ราคา ฿'+p.price.toLocaleString('en-US')+'/ชิ้น (อ้างอิง 300 ชิ้น)':' · สอบถามราคา')+' · MOQ '+p.moq+' ชิ้น · Mockup ก่อนผลิต','/product/'+p.slug);setProductLD(p);track('view_item',{sku:p.sku,item_name:p.name,item_category:p.catSlug,price:p.price||0});}
    else setMeta(DEF_TITLE,DEF_DESC,'/');}
  else if(h==='/about'){app.innerHTML=viewAbout();setMeta('เกี่ยวกับเรา — GO PREMIUM by Passion Grow Trading','GO PREMIUM ผู้ออกแบบและผลิตของพรีเมียมและของขวัญองค์กร เชื่อในการให้ที่มีความหมาย ครบวงจรตั้งแต่ไอเดียถึงส่งมอบ','/about');}
  else if(h==='/portfolio'){app.innerHTML=viewPortfolio();bindQuote();initPortfolioVideo();setMeta('ผลงานของเรา — องค์กรที่ไว้วางใจ ตัวอย่างสินค้าจริง + วิดีโอเครื่องพิมพ์ | GO PREMIUM','ขอบคุณองค์กรชั้นนำที่ไว้วางใจ GO PREMIUM รวมโลโก้ลูกค้า ตัวอย่างสินค้าจริงพร้อม Mockup และวิดีโอเบื้องหลังการพิมพ์','/portfolio');}
  else if(h==='/express'){app.innerHTML=viewExpress();setMeta('สินค้าส่งด่วน 7–14 วัน — ของพรีเมียมงานด่วน | GO PREMIUM','ของพรีเมียมและของขวัญองค์กรงานด่วน ผลิตและส่งมอบใน 7–14 วัน ตอบกลับใน 2 ชม. พร้อม Mockup ก่อนผลิต','/express');}
  else if(h==='about'){app.innerHTML=viewHome();bindQuote();initHero();initAIType();setMeta(DEF_TITLE,DEF_DESC,'/');setTimeout(()=>{const a=document.getElementById('about');if(a)a.scrollIntoView();},60);return;}
  else{app.innerHTML=viewHome();bindQuote();setMeta(DEF_TITLE,DEF_DESC,'/');}
  if(document.querySelector('.hero-slides')){initHero();initAIType();}
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',render);

/* ===== mega + footer + drawer ===== */
function buildChrome(){
  document.getElementById('megaMenu').innerHTML=GROUPS.map(g=>`<div><h5>${g.icon} ${esc(g.group)}</h5>${g.cats.filter(c=>byCat[c]).map(c=>`<a href="#/c/${c}">${esc(CL[c])} <span style="color:var(--grey-400);font-size:12px">(${byCat[c].length})</span></a>`).join('')}</div>`).join('');
  document.getElementById('footCats').innerHTML=catList.slice(0,6).map(c=>`<li><a href="#/c/${c}">${esc(CL[c])}</a></li>`).join('');
  document.getElementById('drawer').innerHTML=`<div class="wrap" style="padding:8px 0 22px"><a href="#/">หน้าแรก</a><a href="#/express">⚡ สินค้าส่งด่วน</a><a href="#/all">สินค้าทั้งหมด (${P.length})</a><a href="/exclusive">✦ Exclusive</a>${catList.map(c=>`<a href="#/c/${c}">${esc(CL[c])} (${byCat[c].length})</a>`).join('')}<a href="#/portfolio">ผลงานของเรา</a><div style="display:flex;flex-direction:column;gap:9px;padding-top:14px"><a class="btn btn-primary" href="#/quote">ขอใบเสนอราคา</a><a class="btn btn-line-ghost" href="https://lin.ee/z1GT1KR" target="_blank" rel="noopener">ทักทาง LINE @gopremium</a></div></div>`;
}
document.getElementById('burger').addEventListener('click',()=>document.getElementById('drawer').classList.toggle('open'));
buildChrome();render();
