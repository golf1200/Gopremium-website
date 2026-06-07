// Mock the GO PREMIUM Product/Catalogue page with each image-style option,
// so the owner can compare the OVERALL page look. Output: one self-contained HTML.
const fs=require('fs'),path=require('path');
const HERE=__dirname, REPO=path.join(HERE,'..','..'), TPL=path.join(HERE,'staged','_tpl');
const b64=(p,m)=>`data:${m};base64,`+fs.readFileSync(p).toString('base64');
const cut=(c)=>b64(path.join(TPL,`dw-${c}.png`),'image/png');
const iconW=b64(path.join(REPO,'public','icon-white.png'),'image/png');
const iconN=b64(path.join(REPO,'public','icon.png'),'image/png');
const wordW=b64(path.join(REPO,'public','logo-white.png'),'image/png');
const life={
  DW001:b64(path.join(HERE,'staged','DW001','main.jpg'),'image/jpeg'),
  BG001:b64(path.join(HERE,'staged','BG001','main.jpg'),'image/jpeg'),
  ST001:b64(path.join(HERE,'staged','ST001','main.jpg'),'image/jpeg'),
};

// demo products (5 tumbler colours) used for the template sections
const PRODS=[
  {c:'orange',name:'กระบอกน้ำสเตนเลส Loopa · ส้ม',price:159},
  {c:'pink',  name:'กระบอกน้ำสเตนเลส Loopa · ชมพู',price:159},
  {c:'mint',  name:'กระบอกน้ำสเตนเลส Loopa · มินต์',price:159},
  {c:'yellow',name:'กระบอกน้ำสเตนเลส Loopa · เหลือง',price:159},
  {c:'blue',  name:'กระบอกน้ำสเตนเลส Loopa · ฟ้า',price:159},
];

// one card; styleClass sets the image-area background; overlay = corner logo html
const card=(p,styleClass,overlay='')=>`
  <div class="pcard">
    <div class="pthumb ${styleClass}">
      <span class="pchip">Drinkware</span>
      <img class="cut" src="${cut(p.c)}">
      ${overlay}
    </div>
    <div class="pbody"><div class="pname">${p.name}</div><div class="pprice">เริ่ม ฿${p.price} <span>/ MOQ 50</span></div>
      <div class="pbtn">ดูรายละเอียด</div></div>
  </div>`;

const lifeCard=(img,name)=>`
  <div class="pcard">
    <div class="pthumb"><img class="full" src="${img}"></div>
    <div class="pbody"><div class="pname">${name}</div><div class="pprice">เริ่ม ฿159 <span>/ MOQ 50</span></div>
      <div class="pbtn">ดูรายละเอียด</div></div>
  </div>`;

const grid=(cards)=>`<div class="grid">${cards}</div>`;
const section=(id,title,free,desc,cards)=>`
  <section>
    <h2>${title} ${free?'<b class=free>ฟรี $0/รูป</b>':'<b class=paid>AI ~$0.04/รูป</b>'}</h2>
    <p class="d">${desc}</p>
    ${grid(cards)}
  </section>`;

const tplCards=(styleClass,overlay)=>PRODS.map(p=>card(p,styleClass,overlay)).join('');

const html=`<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — Product page · image-style options</title>
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&family=Sarabun:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root{--navy:#1F3A5F;--gold:#F4BD44;--ink:#1A2230;--grey:#5B6472;--line:#E3E7ED;--cloud:#F5F6F8;--head:'Kanit',sans-serif;--body:'Sarabun',sans-serif}
*{box-sizing:border-box}body{margin:0;font-family:var(--body);background:#eef1f5;color:var(--ink)}
.top{position:sticky;top:0;z-index:20;background:#fff;border-bottom:1px solid var(--line);padding:14px 28px;display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.top .lg{font-family:var(--head);font-weight:700;font-size:18px;color:var(--navy)}.top .lg b{color:#E0A92B}
.top nav a{font-family:var(--head);font-size:13px;color:var(--navy);text-decoration:none;padding:4px 8px;border-radius:20px}
.top nav a.cur{background:var(--gold);color:var(--navy)}
.jump{margin-left:auto;font-size:12.5px;color:var(--grey)}.jump a{color:var(--navy);margin-left:8px}
.wrap{max-width:1180px;margin:0 auto;padding:26px}
h1{font-family:var(--head);font-size:22px;margin:6px 0 2px}.lead{color:var(--grey);font-size:14px;margin:0 0 6px;max-width:95ch}
section{margin:34px 0 10px;border-top:1px solid #dde3ec;padding-top:22px}
h2{font-family:var(--head);font-size:18px;color:var(--navy);margin:0 0 2px}
h2 .free{color:#2f7d52;font-size:12px;font-weight:500;border:1px solid #b8dcc6;border-radius:6px;padding:1px 7px;margin-left:6px}
h2 .paid{color:#9a7b1e;font-size:12px;font-weight:500;border:1px solid #e7d59a;border-radius:6px;padding:1px 7px;margin-left:6px}
.d{color:var(--grey);font-size:13px;margin:2px 0 16px}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
@media(max-width:1000px){.grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:620px){.grid{grid-template-columns:repeat(2,1fr)}}
.pcard{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:0 6px 18px -12px rgba(31,58,95,.3)}
.pthumb{position:relative;aspect-ratio:1;display:flex;align-items:center;justify-content:center;overflow:hidden}
.pchip{position:absolute;z-index:4;left:9px;top:9px;font-family:var(--head);font-size:10.5px;background:rgba(255,255,255,.92);color:var(--navy);border-radius:20px;padding:2px 9px}
.cut{position:relative;z-index:2;height:80%;object-fit:contain;filter:drop-shadow(0 12px 14px rgba(0,0,0,.22))}
.full{width:100%;height:100%;object-fit:cover}
.lg-corner{position:absolute;z-index:3;right:9px;bottom:9px;height:20px;opacity:.92}
.lg-word{position:absolute;z-index:3;left:50%;bottom:10px;transform:translateX(-50%);height:18px;opacity:.95}
.kvc{position:absolute;z-index:1;width:66%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#F8D586,#F4BD44);opacity:.5}
.pbody{padding:11px 13px 14px}.pname{font-family:var(--head);font-size:13px;color:var(--navy);font-weight:500;line-height:1.3;min-height:34px}
.pprice{color:#E0A92B;font-family:var(--head);font-weight:600;font-size:14px;margin-top:4px}.pprice span{color:#9aa3b2;font-weight:400;font-size:11px}
.pbtn{margin-top:10px;font-family:var(--head);font-size:12px;text-align:center;border:1.5px solid var(--line);color:var(--navy);border-radius:20px;padding:7px}
/* backgrounds */
.t-white{background:#fff}
.t-grad{background:radial-gradient(60% 90% at 78% 16%,rgba(244,189,68,.26),transparent 60%),linear-gradient(135deg,#1F3A5F,#2C4F7C)}
.t-kv{background:#F4F1EA}
.t-spot{background:radial-gradient(70% 70% at 50% 30%,#33567f,#16293F)}
</style></head><body>
<div class="top">
  <div class="lg">GO<b>PREMIUM</b></div>
  <nav><a>หน้าแรก</a><a class="cur">สินค้าทั้งหมด</a><a>สินค้าส่งด่วน</a><a>เกี่ยวกับเรา</a></nav>
  <div class="jump">ข้ามไป:
    <a href="#s1">ขาว</a><a href="#s2">AI</a><a href="#s3">เกรเดียนต์</a><a href="#s4">KeyVisual</a><a href="#s5">สปอตไลต์</a>
  </div>
</div>
<div class="wrap">
  <h1>หน้าสินค้า — เทียบภาพรวมแต่ละสไตล์รูป</h1>
  <p class="lead">หน้านี้จำลองหน้า “สินค้าทั้งหมด” จริง โดยใส่รูปแต่ละสไตล์ทั้งกริด เพื่อให้เห็นภาพรวมก่อนตัดสินใจเป็นมาตรฐานทั้ง 71 รายการ. (ตัวอย่างใช้กระบอก Loopa 5 สีจริง + รูป AI lifestyle 3 ใบที่ทำไว้)</p>

  <a id="s1"></a>${section('s1','1) พื้นขาวล้วน',true,'สะอาด เป็นกลาง โชว์สีสินค้าชัด — มาตรฐาน e-commerce ทั่วไป',tplCards('t-white',''))}
  <a id="s2"></a>${section('s2','2) AI Gen เป็นพื้นหลัง (lifestyle)',false,'ฉากเสมือนจริงต่อสินค้า ดูมีชีวิต/พรีเมียม แต่ฉากต่างกันทุกใบ และมีค่าใช้จ่ายต่อรูป (ตัวอย่าง 3 ใบจริง)',
     [lifeCard(life.DW001,'กระบอกน้ำ Loopa'),lifeCard(life.BG001,'กระเป๋าผ้า Classic'),lifeCard(life.ST001,'ปากกา Oxygen')].join(''))}
  <a id="s3"></a>${section('s3','3) Template — แบรนด์เกรเดียนต์ + โลโก้มุม',true,'พื้นหลัง navy เกรเดียนต์เดียวกันทุกใบ + ไอคอนแบรนด์มุมขวา → คุมแบรนด์ สม่ำเสมอ ฟรี',tplCards('t-grad',`<img class="lg-corner" src="${iconW}">`))}
  <a id="s4"></a>${section('s4','4) Template — Key Visual ครีม + วงทอง + โลโก้',true,'พื้นครีมอุ่น + วงกลมทองหลังสินค้า (Key Visual reuse ทุกใบ) + ไอคอน navy มุมขวา',tplCards('t-kv',`<div class="kvc"></div><img class="lg-corner" src="${iconN}">`))}
  <a id="s5"></a>${section('s5','5) Template — สปอตไลต์พรีเมียม + wordmark',true,'พื้นเข้มสปอตไลต์ ดูหรู/ดราม่า + โลโก้ wordmark ล่างกลาง',tplCards('t-spot',`<img class="lg-word" src="${wordW}">`))}

  <p class="d" style="margin-top:26px">หมายเหตุ: ขอบกระบอกบางใบยังหยาบนิดหน่อย เพราะตัดพื้นหลังแบบฟรีเร็วๆ — ของจริงจะใช้ตัวตัด (rembg) ที่เนียนกว่า · โลโก้วางที่พื้นหลัง/มุมเท่านั้น ไม่วางบนตัวสินค้า</p>
</div>
</body></html>`;
const out=path.join(HERE,'staged','product-page-options.html');
fs.writeFileSync(out,html);
console.log('wrote',out,(Buffer.byteLength(html)/1024|0)+'KB');
