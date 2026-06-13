// Review of the FREE template composites (styled_free/) — grouped by SKU,
// showing the real input + the free composite output. Out: EXPRESS-FREE-REVIEW.html
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "express-assets");
const products = JSON.parse(fs.readFileSync(path.join(__dirname, "express-products.json"), "utf8"));
const byId = Object.fromEntries(products.map((p) => [p.sku, p]));
const b64 = (abs) => `data:image/jpeg;base64,${fs.readFileSync(abs).toString("base64")}`;
const NAVY = "#13244a", GOLD = "#f4b223";
const imgs = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)) : []);

const skus = fs.readdirSync(ROOT).filter((d) => /^EX\d+$/.test(d) && imgs(path.join(ROOT, d, "styled_free")).length).sort();
let sections = "", total = 0;
for (const sku of skus) {
  const p = byId[sku] || {};
  const sf = path.join(ROOT, sku, "styled_free");
  const cards = imgs(sf).map((f) => { total++; return `<figure><img src="${b64(path.join(sf, f))}"><figcaption>${f.replace(/\.(jpg|jpeg|png)$/i, "")}</figcaption></figure>`; }).join("");
  sections += `<section><h2>${sku} · ${p.name || ""}</h2><div class="grid">${cards}</div></section>`;
}
const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — Free template batch</title><style>
*{box-sizing:border-box}body{font-family:'Sora','IBM Plex Sans Thai',system-ui,sans-serif;margin:0;background:#f6f8fb;color:#1a2233}
header{background:${NAVY};color:#fff;padding:22px 28px}header h1{margin:0;font-size:20px}header p{margin:6px 0 0;opacity:.85;font-size:13px}
main{padding:20px 28px;max-width:1150px;margin:0 auto}
section{margin:0 0 22px;background:#fff;border:1px solid #e3e8ef;border-radius:12px;padding:14px}
h2{color:${NAVY};font-size:15px;margin:0 0 10px;border-left:4px solid ${GOLD};padding-left:10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}
figure{margin:0}figure img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;border:1px solid #eee}
figcaption{font-size:11px;color:#666;text-align:center;margin-top:3px;word-break:break-all}
</style></head><body>
<header><h1>GO PREMIUM — รูปสินค้าส่งด่วน บน Template (เวอร์ชันฟรี · $0)</h1>
<p>${skus.length} SKU (ทรงตั้งตรง) · ${total} รูป · die-cut + วางบน template ด้วย rembg — เลือกรูป "สินค้าเดี่ยว" ที่สวย, ตัวที่เป็นภาพคู่/หลายใบ/ลอย ให้บอกผมตัดทิ้งหรือหาใหม่</p></header>
<main>${sections}</main></body></html>`;
const out = path.join(ROOT, "EXPRESS-FREE-REVIEW.html");
fs.writeFileSync(out, html);
console.log("Wrote", out, "(", (fs.statSync(out).size / 1024).toFixed(0), "KB ,", total, "images,", skus.length, "SKUs )");
