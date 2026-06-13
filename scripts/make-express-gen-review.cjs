// Self-contained review of the Gemini-generated express product shots.
// Scans express-assets/EX###/gen/*.jpg, groups by SKU. Out: express-assets/EXPRESS-GEN-REVIEW.html
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "express-assets");
const products = JSON.parse(fs.readFileSync(path.join(__dirname, "express-products.json"), "utf8"));
const byId = Object.fromEntries(products.map((p) => [p.sku, p]));

const b64 = (abs) => `data:image/jpeg;base64,${fs.readFileSync(abs).toString("base64")}`;
const NAVY = "#13244a", GOLD = "#f4b223";

const skus = fs.readdirSync(ROOT).filter((d) => /^EX\d+$/.test(d) && fs.existsSync(path.join(ROOT, d, "gen")));
let sections = "", total = 0;
for (const sku of skus.sort()) {
  const gdir = path.join(ROOT, sku, "gen");
  const imgs = fs.readdirSync(gdir).filter((f) => f.endsWith(".jpg"));
  if (!imgs.length) continue;
  let mode = "t2i";
  try { mode = JSON.parse(fs.readFileSync(path.join(gdir, "_review.json"), "utf8")).images?.[0]?.mode || "t2i"; } catch {}
  const p = byId[sku] || {};
  let cards = imgs.map((f) => {
    total++;
    const color = f.replace(sku + "-", "").replace(".jpg", "");
    return `<figure><img src="${b64(path.join(gdir, f))}"><figcaption>${color}</figcaption></figure>`;
  }).join("");
  sections += `<section><h2>${sku} · ${p.name || ""} <span class="tag ${mode}">${mode === "i2i" ? "อ้างอิงรูปจริง" : "gen ใหม่"}</span></h2>
    <div class="grid">${cards}</div></section>`;
}

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — Express gen review</title><style>
*{box-sizing:border-box}body{font-family:'Sora','IBM Plex Sans Thai',system-ui,sans-serif;margin:0;background:#f6f8fb;color:#1a2233}
header{background:${NAVY};color:#fff;padding:22px 28px}header h1{margin:0;font-size:20px}header p{margin:6px 0 0;opacity:.85;font-size:13px}
main{padding:20px 28px;max-width:1100px;margin:0 auto}
section{margin:0 0 26px;background:#fff;border:1px solid #e3e8ef;border-radius:12px;padding:16px}
h2{color:${NAVY};font-size:15px;margin:0 0 12px}
.tag{font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px}
.tag.t2i{background:#e3f4e8;color:#1b7a3d}.tag.i2i{background:#fdf3d6;color:#9a6b00}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
figure{margin:0}figure img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;border:1px solid #eee}
figcaption{font-size:12px;color:#555;text-align:center;margin-top:4px}
</style></head><body>
<header><h1>GO PREMIUM — รีวิวรูปสินค้าส่งด่วน (Gemini 2.5 Flash Image · ทดสอบ 5 SKU)</h1>
<p>mood &amp; tone เดียวกับหน้าแรก/หมวดหมู่ · เน้นตัวสินค้า · ไม่มีโลโก้/ตัวอักษร · gen หลายสี — ${total} รูป</p></header>
<main>${sections}</main></body></html>`;
const out = path.join(ROOT, "EXPRESS-GEN-REVIEW.html");
fs.writeFileSync(out, html);
console.log("Wrote", out, "(", (fs.statSync(out).size / 1024).toFixed(0), "KB ,", total, "images )");
