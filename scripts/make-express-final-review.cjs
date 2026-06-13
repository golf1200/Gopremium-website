// Final combined catalogue preview: per SKU show the template hero(es) —
// styled/ (Gemini i2i, complex shapes) and/or styled_free/ (free composite, upright).
// Grouped by category. Out: express-assets/EXPRESS-FINAL-REVIEW.html
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "express-assets");
const products = JSON.parse(fs.readFileSync(path.join(__dirname, "express-products.json"), "utf8"));
const b64 = (abs) => `data:image/jpeg;base64,${fs.readFileSync(abs).toString("base64")}`;
const NAVY = "#13244a", GOLD = "#f4b223";
const imgs = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)) : []);
const catTh = { drinkware:"แก้ว & กระบอกน้ำ", umbrella:"ร่ม", garment:"เสื้อผ้า", hat:"หมวก", powerbank:"พาวเวอร์แบงก์", fan:"พัดลม", bags:"กระเป๋า", lifestyle:"ไลฟ์สไตล์" };

const byCat = {};
let doneCount = 0, total = 0;
for (const p of products) {
  const styled = imgs(path.join(ROOT, p.sku, "styled"));
  const free = imgs(path.join(ROOT, p.sku, "styled_free"));
  (byCat[p.category_slug] ??= []).push({ p, styled, free });
  if (styled.length || free.length) doneCount++;
}

let body = "";
for (const cat of Object.keys(byCat).sort((a,b)=>byCat[b].length-byCat[a].length)) {
  let cards = "";
  for (const { p, styled, free } of byCat[cat]) {
    const list = styled.map((f) => ({ f, dir: "styled", tag: "Gemini" }))
      .concat(free.map((f) => ({ f, dir: "styled_free", tag: "ฟรี" })));
    total += list.length;
    const thumbs = list.length
      ? list.map((x) => `<figure><img src="${b64(path.join(ROOT, p.sku, x.dir, x.f))}"><figcaption><span class="b ${x.dir}">${x.tag}</span></figcaption></figure>`).join("")
      : `<div class="none">— ยังไม่มี —</div>`;
    cards += `<div class="card"><div class="sku">${p.sku} <span>${p.name}</span></div><div class="thumbs">${thumbs}</div></div>`;
  }
  body += `<section><h2>${catTh[cat] || cat} <span class="n">${byCat[cat].length} SKU</span></h2>${cards}</section>`;
}

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — Express catalogue (final)</title><style>
*{box-sizing:border-box}body{font-family:'Sora','IBM Plex Sans Thai',system-ui,sans-serif;margin:0;background:#f6f8fb;color:#1a2233}
header{background:${NAVY};color:#fff;padding:22px 28px}header h1{margin:0;font-size:20px}header p{margin:6px 0 0;opacity:.85;font-size:13px}
main{padding:18px 28px;max-width:1180px;margin:0 auto}
section{margin:0 0 22px}h2{color:${NAVY};font-size:16px;border-left:4px solid ${GOLD};padding-left:10px}h2 .n{font-size:12px;color:#888;font-weight:400}
.card{background:#fff;border:1px solid #e3e8ef;border-radius:10px;padding:10px 12px;margin-bottom:10px}
.sku{font-weight:700;color:${NAVY};font-size:13px;margin-bottom:8px}.sku span{font-weight:400;color:#555}
.thumbs{display:flex;flex-wrap:wrap;gap:8px}
figure{margin:0;width:150px}figure img{width:150px;height:150px;object-fit:cover;border-radius:7px;border:1px solid #eee}
figcaption{text-align:center;margin-top:3px}
.b{font-size:10px;font-weight:700;padding:1px 7px;border-radius:20px}.b.styled{background:#13244a;color:#f4b223}.b.styled_free{background:#dff0ff;color:#0b66a3}
.none{color:#bbb;font-size:13px;padding:6px}
</style></head><body>
<header><h1>GO PREMIUM — รูปสินค้าส่งด่วน บน Product Template (สรุปรวม)</h1>
<p>${doneCount}/${products.length} SKU มีรูปแล้ว · ${total} รูป · 🔵 ฟรี (die-cut+composite, ทรงตั้งตรง) · 🔷 Gemini i2i (ทรงซับซ้อน) — ทุกใบเป็นสินค้าจริงบนพื้นครีมสตูดิโอตรงสไตล์เว็บ</p></header>
<main>${body}</main></body></html>`;
const out = path.join(ROOT, "EXPRESS-FINAL-REVIEW.html");
fs.writeFileSync(out, html);
console.log("Wrote", out, "(", (fs.statSync(out).size/1024).toFixed(0), "KB,", total, "imgs,", doneCount+"/"+products.length, "SKUs )");
