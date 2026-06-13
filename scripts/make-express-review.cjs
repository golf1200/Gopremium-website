// Self-contained (base64) review of the express die-cut pass.
// Shows every photo candidate: original -> die-cut, verdict, supplier, candidate EX SKUs.
// Plus the needs-manual (screenshot/flyer) tally. Out: express-assets/EXPRESS-REVIEW.html
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "express-assets");
const SRC = path.join(ROOT, "_source", "_drive");
const report = JSON.parse(fs.readFileSync(path.join(ROOT, "express-process-report.json"), "utf8"));
const products = JSON.parse(fs.readFileSync(path.join(__dirname, "express-products.json"), "utf8"));
const nameBySku = Object.fromEntries(products.map((p) => [p.sku, p.name]));

const b64 = (abs) => {
  try {
    const ext = path.extname(abs).slice(1).toLowerCase();
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return `data:${mime};base64,${fs.readFileSync(abs).toString("base64")}`;
  } catch { return ""; }
};

const NAVY = "#13244a", GOLD = "#f4b223";
const photos = report.filter((r) => r.kind === "photo");
const manual = report.filter((r) => r.kind !== "photo");

// group photos by supplier
const bySup = {};
photos.forEach((r) => (bySup[r.sup] = bySup[r.sup] || []).push(r));

const supLabel = (sup) => {
  const skus = products.filter((p) => p.sup_code === sup);
  return skus.length ? `${sup} · ${skus[0].sup_name}` : sup;
};
const verdictBadge = (v) => {
  const c = v === "good" ? "#1b7a3d" : v.startsWith("weak") ? "#9a6b00" : "#c0162c";
  const bg = v === "good" ? "#e3f4e8" : v.startsWith("weak") ? "#fdf3d6" : "#fbe0e0";
  return `<span class="badge" style="color:${c};background:${bg}">${v}</span>`;
};

let cards = "";
for (const sup of Object.keys(bySup).sort()) {
  const skus = products.filter((p) => p.sup_code === sup).map((p) => `${p.sku} ${nameBySku[p.sku]}`);
  cards += `<section><h2>${supLabel(sup)}</h2>
    <p class="cand">ใส่รูปได้ที่ SKU: ${skus.map((s) => `<code>${s}</code>`).join(" · ")}</p>
    <div class="grid">`;
  for (const r of bySup[sup].sort((a, b) => (a.verdict > b.verdict ? 1 : -1))) {
    const orig = b64(path.join(SRC, r.src));
    const cut = r.web ? b64(path.join(ROOT, r.web)) : "";
    cards += `<div class="card">
      <div class="pair">
        <figure><figcaption>ต้นฉบับ</figcaption><img src="${orig}"></figure>
        <figure class="checker"><figcaption>die-cut (rembg ฟรี)</figcaption>${cut ? `<img src="${cut}">` : "<div class='x'>—</div>"}</figure>
      </div>
      <div class="meta">${verdictBadge(r.verdict)} <span class="cov">coverage ${r.coverage}</span>
      <div class="fn">${path.basename(r.src)}</div></div>
    </div>`;
  }
  cards += `</div></section>`;
}

// needs-manual summary
const nmBySup = {};
manual.forEach((r) => { const k = `${r.sup}|${r.kind}`; nmBySup[k] = (nmBySup[k] || 0) + 1; });
let nmRows = Object.entries(nmBySup).sort().map(([k, n]) => {
  const [sup, kind] = k.split("|");
  return `<tr><td>${supLabel(sup)}</td><td>${kind}</td><td>${n}</td></tr>`;
}).join("");

const goodN = photos.filter((r) => r.verdict === "good").length;
const weakN = photos.filter((r) => r.verdict && r.verdict.startsWith("weak")).length;

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GO PREMIUM — Express die-cut review</title>
<style>
*{box-sizing:border-box}body{font-family:'Sora','IBM Plex Sans Thai',system-ui,sans-serif;margin:0;background:#f6f8fb;color:#1a2233}
header{background:${NAVY};color:#fff;padding:22px 28px}header h1{margin:0;font-size:20px}
header p{margin:6px 0 0;opacity:.85;font-size:13px}
.bar{display:flex;gap:18px;flex-wrap:wrap;padding:14px 28px;background:#fff;border-bottom:3px solid ${GOLD};font-size:14px}
.bar b{color:${NAVY}}
main{padding:20px 28px;max-width:1200px;margin:0 auto}
section{margin:0 0 30px}h2{color:${NAVY};font-size:16px;border-left:4px solid ${GOLD};padding-left:10px}
.cand{font-size:12px;color:#555;margin:-4px 0 12px}.cand code{background:#eef2f7;padding:2px 6px;border-radius:4px;margin:2px;display:inline-block}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.card{background:#fff;border:1px solid #e3e8ef;border-radius:10px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}
figure{margin:0}figcaption{font-size:11px;color:#888;margin-bottom:4px;text-align:center}
.pair img{width:100%;aspect-ratio:1;object-fit:contain;background:#fafafa;border-radius:6px}
.checker img,.checker .x{background:conic-gradient(#eee 90deg,#fff 0 180deg,#eee 0 270deg,#fff 0)0/16px 16px}
.x{width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;color:#bbb;border-radius:6px}
.meta{margin-top:10px;font-size:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.badge{font-weight:700;padding:2px 8px;border-radius:20px;font-size:11px}
.cov{color:#888}.fn{font-size:10px;color:#aaa;width:100%;word-break:break-all}
table{border-collapse:collapse;background:#fff;width:100%;max-width:560px;font-size:13px;border-radius:8px;overflow:hidden}
th,td{border:1px solid #e3e8ef;padding:8px 12px;text-align:left}th{background:${NAVY};color:#fff}
</style></head><body>
<header><h1>GO PREMIUM — รีวิว Die-cut สินค้าส่งด่วน (rembg ฟรี · ไม่ใช้ Gemini)</h1>
<p>ตรวจรูปที่ตัดพื้นหลังแล้ว → เลือกอันที่ดี แล้วบอกผมว่ารูปไหนเป็นของ SKU ไหน (ภายในซัพพลายเออร์เดียวกันมีหลาย SKU ผมจึงยังจับคู่ตายตัวให้ไม่ได้)</p></header>
<div class="bar">
<span><b>${photos.length}</b> รูปสินค้า (photo)</span>
<span>✅ ตัดสวย: <b>${goodN}</b></span>
<span>⚠️ ต้องเช็ก: <b>${weakN}</b></span>
<span>📄 แคตตาล็อก/สกรีนช็อต (ตัดไม่ได้ด้วยตัวฟรี): <b>${manual.length}</b></span>
</div>
<main>
${cards}
<section><h2>รูปที่ตัด die-cut ด้วยตัวฟรีไม่ได้ (ต้อง crop เอง หรือใช้ Gemini ภายหลัง)</h2>
<table><tr><th>ซัพพลายเออร์</th><th>ชนิด</th><th>จำนวนรูป</th></tr>${nmRows}</table>
<p class="cand">screenshot = สกรีนช็อตแคตตาล็อก (มีราคา/ข้อความ) · flyer = หน้าโบรชัวร์ (โลโก้+หลายสินค้าในรูปเดียว). รูปพวกนี้ rembg ตัดไม่ได้เพราะไม่ใช่รูปสินค้าเดี่ยวบนพื้นเรียบ — ต้อง crop ด้วยมือ หรือรอใช้ Gemini แยกสินค้า/ลบโลโก้</p></section>
</main></body></html>`;

const out = path.join(ROOT, "EXPRESS-REVIEW.html");
fs.writeFileSync(out, html, "utf8");
console.log("Wrote", out, "(", (fs.statSync(out).size / 1024).toFixed(0), "KB )");
