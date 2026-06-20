/* Build GO PREMIUM Commercial Roadmap workbook (Thai). Run: node scripts/build-commercial-roadmap.cjs */
const ExcelJS = require('exceljs');
const path = require('path');

const NAVY = 'FF13244A', GOLD = 'FFF4B223', WHITE = 'FFFFFFFF';
const P = { P0:'FFE2574C', P1:'FFF4B223', P2:'FF4F86C6', P3:'FF9AA3B2' }; // priority fills
const ZEBRA = 'FFF5F6F8';

const wb = new ExcelJS.Workbook();
wb.creator = 'Claude (GO PREMIUM)';
wb.created = new Date(2026, 5, 20);

// ---------- helpers ----------
function headerRow(ws, rowNum) {
  const r = ws.getRow(rowNum);
  r.eachCell(c => {
    c.fill = { type:'pattern', pattern:'solid', fgColor:{argb:NAVY} };
    c.font = { bold:true, color:{argb:WHITE}, size:11, name:'Tahoma' };
    c.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
    c.border = thin();
  });
  r.height = 30;
}
function thin(){const s={style:'thin',color:{argb:'FFD0D5DD'}};return{top:s,left:s,bottom:s,right:s};}
function bodyStyle(ws, startRow){
  for(let i=startRow;i<=ws.rowCount;i++){
    const r=ws.getRow(i);
    r.eachCell(c=>{c.alignment={vertical:'top',wrapText:true,...(c.alignment||{})};c.border=thin();c.font=c.font||{name:'Tahoma',size:10};if(!c.font.name)c.font={...c.font,name:'Tahoma',size:10};});
    if((i-startRow)%2===1) r.eachCell(c=>{if(!c.fill||c.fill.fgColor?.argb===undefined)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:ZEBRA}};});
  }
}
function titleBanner(ws, text, sub, span){
  ws.mergeCells(1,1,1,span); const t=ws.getCell(1,1);
  t.value=text; t.font={bold:true,size:16,color:{argb:WHITE},name:'Tahoma'};
  t.fill={type:'pattern',pattern:'solid',fgColor:{argb:NAVY}}; t.alignment={vertical:'middle',horizontal:'left',indent:1};
  ws.getRow(1).height=34;
  ws.mergeCells(2,1,2,span); const s=ws.getCell(2,1);
  s.value=sub; s.font={italic:true,size:10,color:{argb:NAVY},name:'Tahoma'};
  s.fill={type:'pattern',pattern:'solid',fgColor:{argb:GOLD}}; s.alignment={vertical:'middle',horizontal:'left',indent:1};
  ws.getRow(2).height=20;
}

// ============================================================ 0. README
(() => {
  const ws = wb.addWorksheet('0 · เริ่มที่นี่', {properties:{tabColor:{argb:GOLD}}});
  ws.columns=[{width:3},{width:30},{width:95}];
  titleBanner(ws,'GO PREMIUM — แผนพัฒนาเว็บไซต์สู่ Commercial จริง','AI สำหรับ โฆษณา/SEO · ฝ่ายการตลาด · ท่อเก็บ Lead & ตีลูกค้า B2B พรีเมียม   |   จัดทำ 20 มิ.ย. 2026',3);
  const rows=[
    ['','',''],
    ['🎯 เป้าหมายหลัก','สร้างระบบให้เว็บนี้ทำเงินได้จริง: (1) AI ช่วยทำโฆษณา+SEO  (2) AI เป็นฝ่ายการตลาด  (3) ท่อเก็บ Lead อัตโนมัติ + ปิดลูกค้าธุรกิจพรีเมียม'],
    ['📂 วิธีใช้ไฟล์นี้','แต่ละชีตด้านล่างคือมุมมองต่างกัน เริ่มอ่านตามนี้:'],
    ['  ชีต 1 · Roadmap','รายการงานทั้งหมด (~45 งาน) แบ่งเป็น 6 เฟส — คอลัมน์ Priority/Effort/ใครทำ/ค่าใช้จ่าย/KPI ครบ ใช้กรอง (filter) ได้'],
    ['  ชีต 2 · ภาพรวมเฟส','เป้าหมาย+ระยะเวลา+เงื่อนไขจบของแต่ละเฟส (Phase 0–5)'],
    ['  ชีต 3 · Quick Wins','สิ่งที่ควรทำใน 2 สัปดาห์แรก ก่อนเสียเงินค่าแอด'],
    ['  ชีต 4 · KPI & เป้า','ตัววัดผล + เป้า 3/6/12 เดือน'],
    ['  ชีต 5 · เครื่องมือ+งบ','Stack ที่แนะนำ + ประมาณการค่าใช้จ่ายต่อเดือน (บาท)'],
    ['  ชีต 6 · ความเสี่ยง/ตัวบล็อก','สิ่งที่ขวางการเป็น Commercial ตอนนี้ ต้องเคลียร์ก่อน'],
    ['','',''],
    ['🚦 สถานะปัจจุบัน (ของจริง)','ประเมินจากโค้ดเว็บวันนี้:'],
    ['  ✅ มีแล้ว','เว็บ live 2 โดเมน · แคตตาล็อก 356 SKU · GA4 ติดตั้ง (G-JTMVQM245Y) · ฟอร์มขอใบเสนอราคาส่งจริง (Formspree) · LINE OA · บล็อก SEO 5 บทความ · sitemap/schema เบื้องต้น'],
    ['  ⚠️ ช่องโหว่ใหญ่','สินค้ามีราคาแค่ 71/356 (อีก 285 ยังไม่มีราคา) · ไม่มีฐานข้อมูล/CRM เก็บ lead · "AI" ปัจจุบันเป็นแค่ keyword (ยังไม่ใช่ AI จริง) · ยังไม่มี PDPA/cookie consent · ยังไม่มี FB/IG · ยังไม่ได้ยิงแอด/ไม่มี pixel'],
    ['','',''],
    ['💡 หลักคิด','อย่าเพิ่งจ่ายค่าแอดจนกว่าจะเคลียร์ "เฟส 0 (รากฐาน)" + "เฟส 1 (ท่อเก็บ Lead)" ก่อน ไม่งั้นจ่ายเงินดึงคนเข้ามาแล้ว lead รั่ว/ปิดไม่ได้'],
  ];
  rows.forEach(r=>ws.addRow(r));
  ws.getColumn(2).font={bold:true,name:'Tahoma',size:10}; ws.getColumn(2).alignment={vertical:'top',wrapText:true};
  ws.getColumn(3).font={name:'Tahoma',size:10}; ws.getColumn(3).alignment={vertical:'top',wrapText:true};
  for(let i=3;i<=ws.rowCount;i++){ws.getRow(i).height=28;ws.getRow(i).getCell(2).border=thin();ws.getRow(i).getCell(3).border=thin();}
  ws.views=[{showGridLines:false}];
})();

// ============================================================ 1. ROADMAP (master)
const COLS=[
  {header:'ID',key:'id',width:7},
  {header:'เฟส',key:'phase',width:9},
  {header:'หมวด (Pillar)',key:'pillar',width:20},
  {header:'งานที่ต้องทำ',key:'task',width:46},
  {header:'ทำไปทำไม / Impact',key:'why',width:44},
  {header:'Priority',key:'pri',width:9},
  {header:'งาน',key:'eff',width:7},
  {header:'ใครทำ',key:'owner',width:16},
  {header:'ขึ้นกับ',key:'dep',width:9},
  {header:'ค่าใช้จ่าย (บาท)',key:'cost',width:16},
  {header:'เครื่องมือ/Stack',key:'tool',width:26},
  {header:'วัดผล (KPI)',key:'kpi',width:30},
  {header:'สถานะ',key:'status',width:12},
];
const T=[
// PHASE 0 — Foundation
['F01','0','🏛️ รากฐาน','เติมราคา/ช่วงราคาให้สินค้า 285 SKU ที่ยังไม่มีราคา (ตอนนี้มีแค่ 71/356)','ขาย/เสนอราคา/ยิง Google Shopping ไม่ได้ถ้าไม่มีราคา = บล็อกใหญ่สุด','P0','L','คุณ + ซัพพลายเออร์','—','เวลา (มี PRODUCT-MASTER อยู่แล้ว)','Excel master + import-prices script','สินค้ามีราคา ≥ 95%','Not started'],
['F02','0','🏛️ รากฐาน','ตั้ง GA4 Key Events เป็น Conversions (quote_submit, contact_line, ai_search)','ถ้าไม่ตั้ง = วัดยอด lead/แอดไม่ได้ ปรับแคมเปญไม่ได้','P0','S','คุณ (ใน GA4 UI)','—','ฟรี','GA4 Admin','เห็น conversions นับใน GA4','Not started'],
['F03','0','🏛️ รากฐาน','เชื่อม Google Search Console + ยืนยันโดเมน + ส่ง sitemap','ให้ Google เก็บหน้าเว็บ = ฐานของ SEO ฟรี','P0','S','คุณ','—','ฟรี','Search Console','หน้าเว็บถูก index, มี impressions','Not started'],
['F04','0','🏛️ รากฐาน','ทำ PDPA: หน้านโยบายความเป็นส่วนตัว + cookie consent + ข้อความยินยอมในฟอร์ม','กฎหมายไทยบังคับเมื่อเก็บข้อมูลลูกค้า — เสี่ยงปรับถ้าไม่มี','P0','M','คุณ/Dev + Claude ร่างให้','—','ฟรี–น้อย','หน้า static + consent banner','มีหน้า + consent ทำงาน','Not started'],
['F05','0','🏛️ รากฐาน','สร้าง/เคลม Google Business Profile (Local SEO + รีวิว)','โผล่ใน Google Maps/Search + เก็บรีวิว = ความน่าเชื่อถือ B2B','P1','S','คุณ','—','ฟรี','GBP','โปรไฟล์ verified + รีวิวแรก','Not started'],
['F06','0','🏛️ รากฐาน','สร้างเพจ Facebook/Instagram + ใส่ลิงก์ใน config (ตอนนี้ว่าง)','ช่องทาง social + ฐานสำหรับ Meta Ads/retargeting','P1','S','คุณ','—','ฟรี','config.js','เพจ live + ลิงก์ขึ้นเว็บ','Not started'],
['F07','0','🏛️ รากฐาน','หน้าความน่าเชื่อถือ: เลขนิติบุคคล/ที่อยู่/เงื่อนไขผลิต-ชำระ-ส่งมอบ + FAQ','ลูกค้าองค์กรต้องเช็คความน่าเชื่อถือก่อนสั่งล็อตใหญ่','P1','M','คุณ + Claude เขียน','—','ฟรี','v2.html','มีหน้า + FAQ schema','Not started'],
['F08','0','🏛️ รากฐาน','ตรวจ deliverability อีเมล Formspree + ตั้ง auto-reply ถึงลูกค้า','กัน lead ตกถังขยะ/ลูกค้าเงียบ = เสียดีลฟรีๆ','P0','S','คุณ','—','ฟรี','Formspree','อีเมลเข้า inbox 100% + ลูกค้าได้ auto-reply','Not started'],
['F09','0','🏛️ รากฐาน','ติด Meta Pixel + TikTok Pixel + Google Ads tag (เตรียม remarketing)','ต้องเก็บ audience ก่อน ถึงจะ retarget ตอนยิงแอดได้','P1','S','Dev/Claude','F06','ฟรี','GTM / inline tag','pixel ยิง event ได้','Not started'],
['F10','0','🏛️ รากฐาน','ทำ Looker Studio dashboard เชื่อม GA4 (traffic/lead/source)','เห็นภาพรวมที่เดียว ไม่ต้องเดา','P2','S','Claude/คุณ','F02','ฟรี','Looker Studio','dashboard ใช้งานได้','Not started'],
// PHASE 1 — Lead & CRM
['L01','1','📥 ท่อเก็บ Lead','ยกระดับฟอร์ม RFQ: เก็บ งบ/จำนวน/โอกาส/เดดไลน์/อัปโหลดโลโก้/ช่องทางติดต่อ','ข้อมูลครบ = เซลส์ qualify+เสนอราคาได้เร็ว ปิดง่ายขึ้น','P0','M','Dev/Claude','F04','ฟรี','v2.html form','lead มีข้อมูลครบ ≥ 80%','Not started'],
['L02','1','📥 ท่อเก็บ Lead','ทำฐานข้อมูล Lead จริง (Supabase) ผ่าน Vercel function — เก็บทุก lead ลง DB','ตอนนี้พึ่งอีเมลอย่างเดียว เสี่ยงตก/ค้นย้อนไม่ได้/วิเคราะห์ไม่ได้','P0','M','Dev/Claude','—','ฟรี (Supabase free)','Supabase + Vercel API','100% lead ถูกเก็บลง DB','Not started'],
['L03','1','📥 ท่อเก็บ Lead','LINE OA Messaging API: webhook เก็บแชทเป็น lead + แจ้งเตือนเซลส์ทันที','คนไทยซื้อผ่าน LINE เยอะสุด — ต้องจับ lead จาก LINE ให้ได้','P0','M','Dev/Claude','L02','ฟรี–ตามวอลุ่ม','LINE Messaging API','แชท LINE → lead ใน DB','Not started'],
['L04','1','📥 ท่อเก็บ Lead','ระบบแจ้งเตือน+มอบหมายเซลส์ (อีเมล/LINE) เมื่อมี lead ใหม่ (SLA ตอบ ≤2 ชม.)','ตอบเร็ว = ปิดได้สูงขึ้นมาก (B2B ตอบช้าแพ้คู่แข่ง)','P1','S','Dev/Claude','L02','ฟรี','Supabase trigger / Make','% lead ตอบใน 2 ชม.','Not started'],
['L05','1','📥 ท่อเก็บ Lead','Lead pipeline + lead scoring (งบสูง/จำนวนมาก/ด่วน = ร้อน)','โฟกัสดีลที่ปิดง่าย+คุ้ม ก่อนดีลเล็ก','P1','M','Dev/Claude','L02','ฟรี','Supabase + Looker','pipeline มีสถานะครบทุก lead','Not started'],
['L06','1','📥 ท่อเก็บ Lead','Instant Quote Estimator: คำนวณช่วงราคาจาก SKU+จำนวน+วิธีพิมพ์','ให้ราคาทันที = จับ lead ที่ไม่อยากรอ + กรองคนงบไม่ถึง','P2','M','Dev/Claude','F01','ฟรี','JS + ข้อมูลราคา','% ใช้ estimator → ส่งฟอร์ม','Not started'],
['L07','1','📥 ท่อเก็บ Lead','Thank-you + ส่งแคตตาล็อก PDF อัตโนมัติ + ปุ่มนัดคุย','ต่อบทสนทนาทันทีหลังได้ lead = โอกาสปิดสูงขึ้น','P2','S','Dev/Claude','L01','ฟรี','Email/LINE auto','% lead เปิดแคตตาล็อก/นัดคุย','Not started'],
// PHASE 2 — AI Product
['A01','2','🤖 AI Product','อัปเกรด AI Gift Finder: heuristic → LLM จริง (Claude API) + RAG บนแคตตาล็อก รู้ราคา/งบ/โอกาส','"AI" ตอนนี้แค่จับคีย์เวิร์ด — ของจริงจะแนะนำเซ็ตตรงใจ → lead คุณภาพ','P1','L','Dev/Claude','F01,L02','~฿1,000–8,000/ด.','Claude API + RAG','% AI session → lead, ความพอใจ','Not started'],
['A02','2','🤖 AI Product','AI Chatbot บนเว็บ + LINE: ตอบสเปก/MOQ/ลีดไทม์/ราคาเบื้องต้น + เก็บ lead 24/7','รับลูกค้าได้นอกเวลาทำการ ไม่พลาด lead กลางคืน/เสาร์อาทิตย์','P1','L','Dev/Claude','A01,L03','รวมในงบ Claude API','Claude API + LINE','lead จาก bot/เดือน','Not started'],
['A03','2','🤖 AI Product','AI Mockup โลโก้บนสินค้า on-demand (ลูกค้าอัปโลโก้ → เห็น mockup ทันที)','เห็นภาพก่อนสั่ง = มั่นใจ+ปิดเร็ว (มี skill logo-placement อยู่แล้ว)','P2','L','Dev/Claude','—','ตามการใช้รูป','logo-placement + image API','% ลูกค้าทำ mockup → ขอราคา','Not started'],
['A04','2','🤖 AI Product','Guardrails + คุมต้นทุน AI (rate limit, cache, fallback heuristic, กันราคามั่ว)','กันบิลบาน + กัน AI ตอบผิด/หลุดราคา','P1','M','Dev/Claude','A01','ฟรี','โค้ด + cache','ต้นทุน AI/lead อยู่ในงบ','Not started'],
['A05','2','🤖 AI Product','เก็บบทสนทนา AI เป็น insight → ป้อนกลับ SEO/สินค้า/คอนเทนต์','ลูกค้าถามอะไรบ่อย = หัวข้อคอนเทนต์+สินค้าที่ควรเพิ่ม','P2','S','Claude','A01','ฟรี','Supabase log','รายงาน insight รายเดือน','Not started'],
// PHASE 3 — AI Marketing & SEO
['M01','3','📣 AI Marketing/SEO','Programmatic SEO: สร้างหน้า Landing อัตโนมัติ หมวด×โอกาส×อุตสาหกรรม','เช่น "ของพรีเมียมปีใหม่ธนาคาร" — ได้ traffic ฟรีจาก long-tail จำนวนมาก','P1','L','Dev/Claude','F03','ฟรี (เวลา/AI)','Template + Claude','จำนวนหน้า index + organic clicks','Not started'],
['M02','3','📣 AI Marketing/SEO','AI Content Pipeline: ผลิตบทความ SEO ไทยต่อเนื่อง + internal linking (ต่อยอดบล็อก 5 บทความ)','คอนเทนต์สม่ำเสมอ = อันดับ SEO + อำนาจโดเมน','P1','M','Claude','F03','ฟรี (Claude)','Claude + บล็อก static','บทความ/เดือน, อันดับคีย์เวิร์ด','Not started'],
['M03','3','📣 AI Marketing/SEO','Keyword research + แผนคอนเทนต์ (high-intent: "ของพรีเมียม พิมพ์โลโก้" ฯลฯ)','รู้ว่าลูกค้าเสิร์ชอะไร = ทำคอนเทนต์/แอดให้ตรง','P1','S','Claude/คุณ','—','ฟรี–เครื่องมือ','GSC + Claude + คู่แข่ง','ตารางคีย์เวิร์ด + ปริมาณ','Not started'],
['M04','3','📣 AI Marketing/SEO','AI สร้าง Ad Creative + Copy หลายเวอร์ชัน (Google/Meta/TikTok)','เทสต์หลายแบบเร็ว = หา creative ที่เวิร์กถูกลง','P2','M','Claude','M03','ฟรี (Claude) + ผลิตรูป','Claude + image gen','CTR, CPA ต่อ creative','Not started'],
['M05','3','📣 AI Marketing/SEO','ตั้งแคมเปญ Google Ads Search (high-intent) + Performance Max','จับคนที่ "พร้อมซื้อ" กำลังเสิร์ชหาของพรีเมียม','P1','M','คุณ/เอเจนซี','F01,F09,L01','฿20,000–100,000/ด. (งบสื่อ)','Google Ads','ROAS, Cost/Lead','Not started'],
['M06','3','📣 AI Marketing/SEO','Meta/TikTok Ads: awareness + retargeting จาก pixel','ตามตื๊อคนที่เคยเข้าเว็บ = ปิดถูกลง','P2','M','คุณ/เอเจนซี','F09','฿10,000–50,000/ด. (งบสื่อ)','Meta/TikTok Ads','ROAS, frequency','Not started'],
['M07','3','📣 AI Marketing/SEO','ขยาย Schema (Product+ราคา, FAQ, Breadcrumb, Organization) + auto alt-text รูป','rich results ใน Google = CTR สูงขึ้น','P2','M','Dev/Claude','F01','ฟรี','JSON-LD + script','rich result valid, CTR','Not started'],
['M08','3','📣 AI Marketing/SEO','Marketing dashboard รวม (traffic→lead→ปิดการขาย ต่อ channel) + รายงาน AI รายสัปดาห์','รู้ว่าช่องทางไหนคุ้ม = ทุ่มงบถูกที่','P2','M','Claude','F10,L02','ฟรี','Looker + Claude','รายงานอัตโนมัติ/สัปดาห์','Not started'],
['M09','3','📣 AI Marketing/SEO','เพิ่มเนื้อหา conversion: case study/ผลงาน/รีวิว/โลโก้ลูกค้าจริง','social proof = เพิ่ม conversion ทั้งเว็บและแอด','P1','M','คุณ + Claude','—','ฟรี','v2.html','จำนวน case study + conversion lift','Not started'],
// PHASE 4 — Growth & CRO
['G01','4','📈 Growth/CRO','A/B test hero/ฟอร์ม/ปุ่ม (funnel ขอใบเสนอราคา)','รีดอัตราปิดจาก traffic เท่าเดิม = กำไรฟรี','P2','M','Dev/Claude','L01','ฟรี–น้อย','GA4 / split test','conversion rate เพิ่ม','Not started'],
['G02','4','📈 Growth/CRO','Email/LINE nurture sequence (AI-personalized) สำหรับ lead ที่ยังไม่ปิด','lead ส่วนใหญ่ไม่ปิดครั้งแรก — ตื๊ออัตโนมัติ = ปิดเพิ่ม','P2','M','Dev/Claude','L02,A02','รวมงบ AI','Make/Supabase + Claude','% lead กลับมาปิด','Not started'],
['G03','4','📈 Growth/CRO','Retargeting + Lookalike audience','ขยายไปคนคล้ายลูกค้าเดิม = scale ได้','P2','S','คุณ/เอเจนซี','F09,M06','รวมงบสื่อ','Meta/Google','CPA ของ lookalike','Not started'],
['G04','4','📈 Growth/CRO','ระบบขอรีวิว/Social proof อัตโนมัติหลังส่งมอบ','รีวิวจริง = ความน่าเชื่อถือ + Local SEO','P3','S','Dev/Claude','F05','ฟรี','Email/LINE auto','รีวิวใหม่/เดือน','Not started'],
['G05','4','📈 Growth/CRO','Referral/Partner program (B2B แนะนำต่อ)','ลูกค้าองค์กรแนะนำกันเอง = lead คุณภาพ ต้นทุนต่ำ','P3','M','คุณ','—','ค่าคอม/ของรางวัล','หน้า + tracking','lead จาก referral','Not started'],
// PHASE 5 — Scale & Ops
['S01','5','⚙️ Scale/Ops','CRM เต็มรูปแบบ + automation follow-up','เมื่อ lead เยอะ ต้องมีระบบจัดการจริงจัง','P3','L','Dev','L02,L05','฿0–ตาม CRM','Supabase/HubSpot','sales cycle สั้นลง','Not started'],
['S02','5','⚙️ Scale/Ops','Quote-to-order + เชื่อมซัพพลายเออร์/สต็อก','ลดงานมือ ตั้งแต่เสนอราคา→สั่งผลิต','P3','L','Dev','S01','ตามระบบ','API/ระบบหลังบ้าน','% ออเดอร์อัตโนมัติ','Not started'],
['S03','5','⚙️ Scale/Ops','Multi-touch attribution + optimize งบสื่อ','รู้ว่าทุกบาทค่าแอดสร้างยอดตรงไหน','P3','M','Claude/เอเจนซี','M08','ฟรี–เครื่องมือ','GA4 + Looker','ROAS รวมดีขึ้น','Not started'],
['S04','5','⚙️ Scale/Ops','AI Agents ฝ่ายการตลาด/เซลส์ (รายงาน/ตอบ/ติดตามอัตโนมัติ)','ขยายทีมการตลาดด้วย AI โดยไม่เพิ่มคน','P3','L','Dev/Claude','A02,G02','งบ AI','Claude Agents','งานที่ AI ทำแทน/สัปดาห์','Not started'],
['S05','5','⚙️ Scale/Ops','SOP + คู่มือทีม + training','ระบบอยู่ได้แม้คนเปลี่ยน','P3','M','คุณ','—','ฟรี','เอกสาร','ทีมทำตาม SOP ได้','Not started'],
];
(() => {
  const ws=wb.addWorksheet('1 · Roadmap',{properties:{tabColor:{argb:NAVY}},views:[{state:'frozen',ySplit:3,xSplit:0}]});
  titleBanner(ws,'แผนงานทั้งหมด (Roadmap)','กรองด้วยหัวคอลัมน์ได้ · Priority: P0=ทำก่อนเลย P1=สำคัญ P2=ตามมา P3=ทีหลัง · งาน: S/M/L=เล็ก/กลาง/ใหญ่',COLS.length);
  ws.columns=COLS.map(c=>({key:c.key,width:c.width}));
  const hr=ws.addRow(COLS.map(c=>c.header)); headerRow(ws,hr.number);
  T.forEach(row=>ws.addRow(Object.fromEntries(COLS.map((c,i)=>[c.key,row[i]]))));
  bodyStyle(ws,4);
  // color the Priority cell
  for(let i=4;i<=ws.rowCount;i++){
    const cell=ws.getRow(i).getCell('pri'); const v=cell.value;
    if(P[v]){cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:P[v]}};cell.font={bold:true,color:{argb:v==='P1'?NAVY:WHITE},name:'Tahoma',size:10};cell.alignment={horizontal:'center',vertical:'middle'};}
    ws.getRow(i).getCell('id').font={bold:true,name:'Tahoma',size:10};
    ws.getRow(i).getCell('phase').alignment={horizontal:'center',vertical:'top'};
    ws.getRow(i).getCell('eff').alignment={horizontal:'center',vertical:'top'};
  }
  ws.autoFilter={from:{row:3,column:1},to:{row:3,column:COLS.length}};
  // status dropdown
  for(let i=4;i<=ws.rowCount;i++){
    ws.getRow(i).getCell('status').dataValidation={type:'list',allowBlank:true,formulae:['"Not started,In progress,Done,Blocked,Skip"']};
  }
})();

// ============================================================ 2. Phases overview
(() => {
  const ws=wb.addWorksheet('2 · ภาพรวมเฟส',{properties:{tabColor:{argb:NAVY}}});
  const C=[{h:'เฟส',w:8},{h:'ชื่อเฟส',w:30},{h:'เป้าหมาย',w:50},{h:'ช่วงเวลา (แนะนำ)',w:18},{h:'เงื่อนไขว่า "จบเฟส"',w:46}];
  titleBanner(ws,'ภาพรวม 6 เฟส','ทำเรียงเฟส 0→1 ก่อนเสมอ เฟส 2/3 เริ่มคู่ขนานได้เมื่อรากฐานพร้อม',C.length);
  ws.columns=C.map(c=>({width:c.w}));
  const hr=ws.addRow(C.map(c=>c.h)); headerRow(ws,hr.number);
  [
    ['เฟส 0','รากฐานเชิงพาณิชย์','เคลียร์สิ่งที่ทำให้ "ขายได้จริง" — ราคา, วัดผล, กฎหมาย, ความน่าเชื่อถือ','สัปดาห์ 1–3','ราคาครบ ≥95% · GA4 conversions ทำงาน · PDPA ขึ้น · GSC เชื่อม'],
    ['เฟส 1','ท่อเก็บ Lead & CRM','ทุก lead จากทุกช่องทางถูกเก็บ-แจ้งเตือน-ติดตามอัตโนมัติ','สัปดาห์ 2–6','100% lead ลง DB · LINE+ฟอร์มเข้าระบบ · เซลส์ได้แจ้งเตือน ≤2 ชม.'],
    ['เฟส 2','AI Product (จริง)','เปลี่ยน AI หลอกๆ เป็น AI จริงที่แนะนำ+ตอบ+เก็บ lead 24/7','สัปดาห์ 5–10','AI Finder ใช้ LLM+ราคา · Chatbot เว็บ+LINE เก็บ lead ได้'],
    ['เฟส 3','AI Marketing & SEO','เครื่องจักรหา traffic: SEO อัตโนมัติ + คอนเทนต์ + ยิงแอด','สัปดาห์ 6–14','หน้า pSEO+บทความ index · แอด Google live มี ROAS วัดได้'],
    ['เฟส 4','Growth & CRO','รีดอัตราปิด + ตื๊อ lead + ขยาย audience','สัปดาห์ 12–20','conversion rate เพิ่ม · nurture อัตโนมัติ · retargeting live'],
    ['เฟส 5','Scale & Ops','ระบบหลังบ้าน+AI agents รองรับการโต','สัปดาห์ 18+','CRM/automation เต็ม · attribution ครบ · SOP ทีม'],
  ].forEach(r=>ws.addRow(r));
  bodyStyle(ws,4);
  for(let i=4;i<=ws.rowCount;i++){ws.getRow(i).getCell(1).font={bold:true,name:'Tahoma',size:11,color:{argb:NAVY}};ws.getRow(i).height=46;}
})();

// ============================================================ 3. Quick wins
(() => {
  const ws=wb.addWorksheet('3 · Quick Wins',{properties:{tabColor:{argb:GOLD}}});
  const C=[{h:'ลำดับ',w:8},{h:'ทำใน 14 วันแรก',w:50},{h:'อ้างอิง ID',w:12},{h:'ทำไมรีบ',w:55}];
  titleBanner(ws,'Quick Wins — 2 สัปดาห์แรก','งานเร็ว/ฟรี ที่ปลดล็อกทุกอย่างต่อจากนี้ — ทำก่อนเสียเงินค่าแอด',C.length);
  ws.columns=C.map(c=>({width:c.w}));
  const hr=ws.addRow(C.map(c=>c.h)); headerRow(ws,hr.number);
  [
    ['1','เริ่มเติมราคาสินค้า (อย่างน้อยหมวดขายดี) ให้มีช่วงราคา','F01','ไม่มีราคา = ยิงแอด/Shopping/quote ไม่ได้ บล็อกทุกอย่าง'],
    ['2','ตั้ง GA4 Key Events เป็น Conversions','F02','ไม่งั้นวัด lead/แอดไม่ได้เลย'],
    ['3','เชื่อม Google Search Console + ส่ง sitemap','F03','เปิดทาง SEO ฟรี ทันที'],
    ['4','เช็คอีเมล Formspree เข้า inbox + ตั้ง auto-reply','F08','กัน lead ตกหล่น = เสียดีลฟรีๆ'],
    ['5','ขึ้นหน้า PDPA + cookie consent (Claude ร่างให้ได้)','F04','เก็บ lead โดยไม่มี = เสี่ยงผิดกฎหมายไทย'],
    ['6','ทำ Keyword research + แผนคอนเทนต์','M03','รู้คำที่ลูกค้าเสิร์ช = ทำ SEO/แอดให้ตรง'],
    ['7','เคลม Google Business Profile + เปิดเพจ FB/IG','F05,F06','ฐานความน่าเชื่อถือ + เตรียม retargeting'],
    ['8','สรุป requirement ฟอร์ม RFQ ใหม่ (ฟิลด์ที่อยากเก็บ)','L01','เป็นอินพุตให้เริ่มเฟส 1 ได้ทันที'],
  ].forEach(r=>ws.addRow(r));
  bodyStyle(ws,4);
  for(let i=4;i<=ws.rowCount;i++){ws.getRow(i).getCell(1).font={bold:true,name:'Tahoma',size:11};ws.getRow(i).height=34;}
})();

// ============================================================ 4. KPI
(() => {
  const ws=wb.addWorksheet('4 · KPI & เป้า',{properties:{tabColor:{argb:NAVY}}});
  const C=[{h:'ด้าน',w:18},{h:'ตัวชี้วัด (KPI)',w:38},{h:'ตอนนี้',w:14},{h:'เป้า 3 เดือน',w:16},{h:'เป้า 6 เดือน',w:16},{h:'เป้า 12 เดือน',w:16}];
  titleBanner(ws,'KPI & เป้าหมาย','ตัวเลขจริงให้เติมเองหลังตั้งระบบวัดผล (เฟส 0) — ช่องเป้าเป็นตัวอย่างให้ปรับ',C.length);
  ws.columns=C.map(c=>({width:c.w}));
  const hr=ws.addRow(C.map(c=>c.h)); headerRow(ws,hr.number);
  [
    ['Traffic','ผู้เข้าชม/เดือน (sessions)','(ตั้งวัด)','+50%','x2','x4'],
    ['Traffic','สัดส่วน Organic (SEO ฟรี)','(ตั้งวัด)','30%','45%','60%'],
    ['Lead','Lead/เดือน (ฟอร์ม+LINE+chatbot)','(ตั้งวัด)','—','x2','x4'],
    ['Lead','Lead → Qualified %','—','40%','50%','60%'],
    ['Lead','Cost per Lead (จากแอด)','—','วัด baseline','-20%','-40%'],
    ['Lead','% lead ตอบกลับใน 2 ชม.','—','80%','95%','99%'],
    ['Sales','Quote → Won %','(ขอจากทีมขาย)','+5%','+10%','+15%'],
    ['Sales','ROAS (ยอด/ค่าแอด)','—','≥3x','≥4x','≥5x'],
    ['AI','AI session → lead %','—','10%','15%','20%'],
    ['AI','Lead จาก chatbot/เดือน','0','—','เพิ่มขึ้น','สัดส่วนมีนัย'],
    ['SEO','หน้าเว็บถูก index','(ดู GSC)','+100','+500','+1,000'],
    ['SEO','คีย์เวิร์ดติด Top 10','(ดู GSC)','10','30','80'],
  ].forEach(r=>ws.addRow(r));
  bodyStyle(ws,4);
  for(let i=4;i<=ws.rowCount;i++){ws.getRow(i).getCell(1).font={bold:true,name:'Tahoma',size:10,color:{argb:NAVY}};ws.getRow(i).height=24;}
})();

// ============================================================ 5. Tools & budget
(() => {
  const ws=wb.addWorksheet('5 · เครื่องมือ+งบ',{properties:{tabColor:{argb:NAVY}}});
  const C=[{h:'เครื่องมือ',w:24},{h:'ใช้ทำอะไร',w:40},{h:'แพ็กเริ่ม',w:16},{h:'ค่าใช้จ่าย/เดือน (บาท)',w:24},{h:'หมายเหตุ',w:40}];
  titleBanner(ws,'Stack เครื่องมือ + ประมาณการงบ','เริ่มฟรีได้เกือบทั้งหมด งบจริงไปโตที่ "ค่าสื่อโฆษณา" — ปรับตามกำลัง',C.length);
  ws.columns=C.map(c=>({width:c.w}));
  const hr=ws.addRow(C.map(c=>c.h)); headerRow(ws,hr.number);
  [
    ['Vercel','โฮสต์เว็บ + serverless API','Free → Pro','0 – ~700','ตอนนี้ใช้ free อยู่แล้ว'],
    ['Supabase','ฐานข้อมูล Lead/CRM + auth','Free → Pro','0 – ~900','เชื่อมต่อพร้อมใช้แล้ว เหมาะมาก'],
    ['Claude API','AI Finder/Chatbot/คอนเทนต์/แอด','ตามใช้','~1,000 – 10,000','คุมด้วย cache+rate limit (A04)'],
    ['LINE OA Messaging API','แชท+เก็บ lead จาก LINE','Free → ตามวอลุ่ม','0 – ตามข้อความ','ช่องทางหลักคนไทย'],
    ['Formspree','รับฟอร์ม (ชั่วคราว)','Free','0 – ~350','ย้ายไป Supabase เมื่อพร้อม (L02)'],
    ['Google Ads','แอด Search/PMax (high-intent)','งบสื่อ','20,000 – 100,000','งบจริงอยู่ตรงนี้ ปรับตามผล'],
    ['Meta / TikTok Ads','awareness + retargeting','งบสื่อ','10,000 – 50,000','เริ่มหลังมี pixel+audience'],
    ['Google Search Console','ข้อมูล SEO','Free','0','ต้องเชื่อม (F03)'],
    ['Looker Studio','Dashboard รายงาน','Free','0','เชื่อม GA4'],
    ['Make / Zapier','เชื่อมระบบ/automation','Free → Pro','0 – ~700','สำหรับแจ้งเตือน/nurture'],
    ['Google Business Profile','Local SEO + รีวิว','Free','0','เคลมโปรไฟล์ (F05)'],
    ['รวม (ไม่รวมค่าสื่อ)','— เครื่องมือ/ระบบ','—','~2,000 – 13,000','ค่าสื่อแยกตามงบแอด'],
  ].forEach(r=>ws.addRow(r));
  bodyStyle(ws,4);
  for(let i=4;i<=ws.rowCount;i++){ws.getRow(i).getCell(1).font={bold:true,name:'Tahoma',size:10};ws.getRow(i).height=26;}
  const last=ws.getRow(ws.rowCount); last.eachCell(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:GOLD}};c.font={bold:true,name:'Tahoma',size:10,color:{argb:NAVY}};});
})();

// ============================================================ 6. Risks
(() => {
  const ws=wb.addWorksheet('6 · ความเสี่ยง-บล็อก',{properties:{tabColor:{argb:'FFE2574C'}}});
  const C=[{h:'#',w:5},{h:'ความเสี่ยง / ตัวบล็อก',w:42},{h:'ระดับ',w:12},{h:'ผลกระทบ',w:42},{h:'ทางแก้',w:40}];
  titleBanner(ws,'ความเสี่ยง & ตัวบล็อกที่ต้องเคลียร์','สิ่งที่ขวางไม่ให้เว็บเป็น Commercial จริงตอนนี้',C.length);
  ws.columns=C.map(c=>({width:c.w}));
  const hr=ws.addRow(C.map(c=>c.h)); headerRow(ws,hr.number);
  [
    ['1','สินค้า 285/356 ยังไม่มีราคา','สูงมาก','quote/Google Shopping/แอดทำไม่ได้เต็มที่ ลูกค้าตัดสินใจยาก','เฟส F01 — เติมราคา/ช่วงราคาก่อนเป็นอันดับแรก'],
    ['2','ไม่มีฐานข้อมูล/CRM เก็บ lead','สูง','พึ่ง Formspree อย่างเดียว เสี่ยง lead ตก/วิเคราะห์ไม่ได้','เฟส L02 — Supabase เก็บทุก lead'],
    ['3','ยังไม่มี PDPA/cookie consent','สูง','เก็บข้อมูลลูกค้าโดยไม่มี = เสี่ยงผิดกฎหมายไทย','เฟส F04 — ขึ้นหน้า+consent ก่อนดันทราฟฟิก'],
    ['4','"AI" ปัจจุบันเป็นแค่ keyword (ไม่ใช่ AI จริง)','กลาง','คำแนะนำจำกัด ไม่รู้ราคา/บริบท = lead คุณภาพต่ำ','เฟส A01 — เปลี่ยนเป็น Claude API + RAG'],
    ['5','ยังไม่มี pixel/แอด/FB-IG','กลาง','ยิงแอด/retarget ไม่ได้ทันที','เฟส F06+F09 ก่อนเริ่มแอด'],
    ['6','ตอบ lead ช้า/ไม่มี SLA','กลาง','B2B ตอบช้าแพ้คู่แข่ง เสียดีล','เฟส L04 — แจ้งเตือน+SLA ≤2 ชม.'],
    ['7','ต้นทุน AI/แอดบานปลาย','กลาง','ค่าใช้จ่ายเกินงบถ้าไม่คุม','เฟส A04 + ตั้งเพดานงบ + ดู ROAS'],
    ['8','พึ่งคนเดียว/ไม่มี SOP','ต่ำ-กลาง','ระบบสะดุดถ้าคนเปลี่ยน','เฟส S05 — ทำ SOP'],
  ].forEach(r=>ws.addRow(r));
  bodyStyle(ws,4);
  const lv={'สูงมาก':'FFE2574C','สูง':'FFE2574C','กลาง':'FFF4B223','ต่ำ-กลาง':'FF9AA3B2'};
  for(let i=4;i<=ws.rowCount;i++){
    ws.getRow(i).getCell(1).font={bold:true,name:'Tahoma',size:10};
    const lc=ws.getRow(i).getCell(3);const c=lv[lc.value];
    if(c){lc.fill={type:'pattern',pattern:'solid',fgColor:{argb:c}};lc.font={bold:true,name:'Tahoma',size:10,color:{argb:c==='FFF4B223'?NAVY:WHITE}};lc.alignment={horizontal:'center',vertical:'middle'};}
    ws.getRow(i).height=40;
  }
})();

const out = path.join('C:/Users/Golf/Documents/Claude/Projects/Gopremium Website LIVE', 'GoPremium-แผนงานเว็บ-Commercial-Roadmap.xlsx');
wb.xlsx.writeFile(out).then(()=>console.log('WROTE:', out));
