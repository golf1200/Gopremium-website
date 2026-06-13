// Side-by-side compare: Gemini-gen (gen/) vs real web photos (real/) per pilot SKU.
// Out: express-assets/EXPRESS-COMPARE.html (self-contained base64)
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "express-assets");
const products = JSON.parse(fs.readFileSync(path.join(__dirname, "express-products.json"), "utf8"));
const byId = Object.fromEntries(products.map((p) => [p.sku, p]));
const SKUS = process.argv.slice(2).length ? process.argv.slice(2) : ["EX001", "EX004", "EX019", "EX020", "EX025"];
const b64 = (abs) => `data:image/jpeg;base64,${fs.readFileSync(abs).toString("base64")}`;
const NAVY = "#13244a", GOLD = "#f4b223";

const imgsIn = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)) : []);
const row = (dir, files) => files.map((f) => `<figure><img src="${b64(path.join(dir, f))}"><figcaption>${f.replace(/\.(jpg|jpeg|png)$/i, "")}</figcaption></figure>`).join("") || `<div class="none">— ไม่มี —</div>`;

let sections = "";
for (const sku of SKUS) {
  const p = byId[sku] || {};
  const gd = path.join(ROOT, sku, "gen"), rd = path.join(ROOT, sku, "real"),
        sd = path.join(ROOT, sku, "styled"), sf = path.join(ROOT, sku, "styled_free");
  sections += `<section><h2>${sku} · ${p.name || ""}</h2>
    <div class="block real"><span class="lab lab-real">1) รูปสินค้าจริง (จากเว็บ · ไม่ติดแบรนด์)</span><div class="grid">${row(rd, imgsIn(rd))}</div></div>
    <div class="block free"><span class="lab lab-free">2) 🆓 รูปจริง + Template (ฟรี · die-cut+composite)</span><div class="grid">${row(sf, imgsIn(sf))}</div></div>
    <div class="block styled"><span class="lab lab-styled">3) 💲 รูปจริง + Template (Gemini i2i · $0.039/รูป)</span><div class="grid">${row(sd, imgsIn(sd))}</div></div>
    <div class="block ai"><span class="lab lab-ai">4) gen ใหม่ทั้งใบจาก AI (อ้างอิง)</span><div class="grid">${row(gd, imgsIn(gd))}</div></div>
  </section>`;
}
const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — AI vs รูปจริง</title><style>
*{box-sizing:border-box}body{font-family:'Sora','IBM Plex Sans Thai',system-ui,sans-serif;margin:0;background:#f6f8fb;color:#1a2233}
header{background:${NAVY};color:#fff;padding:22px 28px}header h1{margin:0;font-size:20px}header p{margin:6px 0 0;opacity:.85;font-size:13px}
main{padding:20px 28px;max-width:1100px;margin:0 auto}
section{margin:0 0 24px;background:#fff;border:1px solid #e3e8ef;border-radius:12px;padding:16px}
h2{color:${NAVY};font-size:16px;margin:0 0 12px;border-left:4px solid ${GOLD};padding-left:10px}
.block{margin-bottom:12px}.lab{display:inline-block;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;margin-bottom:8px}
.lab-ai{background:#eef0f3;color:#888}.lab-real{background:#e3f4e8;color:#1b7a3d}.lab-styled{background:#13244a;color:#f4b223}.lab-free{background:#dff0ff;color:#0b66a3}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
figure{margin:0}figure img{width:100%;aspect-ratio:1;object-fit:contain;background:#fafafa;border-radius:8px;border:1px solid #eee}
figcaption{font-size:11px;color:#666;text-align:center;margin-top:3px;word-break:break-all}
.none{color:#bbb;font-size:13px;padding:8px}
</style></head><body>
<header><h1>GO PREMIUM — เทียบรูป AI กับรูปสินค้าจริง (pilot 5 SKU)</h1>
<p>แถวเหลือง = รูป Gemini gen · แถวเขียว = รูปสินค้าจริงจากเว็บ (สินค้าเปล่า ไม่ติดแบรนด์). เลือกแนวทางที่ชอบ</p></header>
<main>${sections}</main></body></html>`;
const out = path.join(ROOT, "EXPRESS-COMPARE.html");
fs.writeFileSync(out, html);
console.log("Wrote", out, "(", (fs.statSync(out).size / 1024).toFixed(0), "KB )");
