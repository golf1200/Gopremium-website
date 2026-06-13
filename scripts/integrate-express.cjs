// Integrate express products (EX###) into the LIVE catalogue:
//  - pick hero + gallery from styled/ (Gemini) or styled_free/ (free composite)
//  - copy images into public/images/products/<base>/  (-square, -02..)
//  - register in src/data/product-images.generated.json
//  - append public product records to src/data/products-raw.json (price = null)
//  - set EXPRESS_SKUS in public/v2.html to genuine ≤14-day SKUs that have an image
// Run from website/:  node scripts/integrate-express.cjs
const fs = require("fs");
const path = require("path");

const REPO = path.join(__dirname, "..");
const ASSETS = path.join(REPO, "express-assets");
const PROD_DIR = path.join(REPO, "public", "images", "products");
const RAW_PATH = path.join(REPO, "src", "data", "products-raw.json");
const GEN_PATH = path.join(REPO, "src", "data", "product-images.generated.json");
const V2 = path.join(REPO, "public", "v2.html");

const express = JSON.parse(fs.readFileSync(path.join(__dirname, "express-products.json"), "utf8"));
const raw = JSON.parse(fs.readFileSync(RAW_PATH, "utf8"));
const gen = JSON.parse(fs.readFileSync(GEN_PATH, "utf8"));

const catTitle = { drinkware: "Drinkware", umbrella: "Umbrella", garment: "Garment",
  hat: "Hat", powerbank: "Powerbank", fan: "Mini Fan", bags: "Bag", lifestyle: "Lifestyle" };
const imgs = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)) : []);
const BAD = /pair|lineup|group|inset|back|side|-top|detail|closeup|close-up|underside|skeleton|-2\.|open-2/i;

// pick hero + gallery: prefer Gemini styled/, else filtered free composites
function pickImages(sku) {
  const sDir = path.join(ASSETS, sku, "styled");
  const fDir = path.join(ASSETS, sku, "styled_free");
  let dir, files = imgs(sDir);
  if (files.length) { dir = sDir; }
  else {
    files = imgs(fDir);
    const good = files.filter((f) => !BAD.test(f));
    files = good.length ? good : files;     // fall back to all if filter empties it
    dir = fDir;
  }
  return files.length ? { dir, files: files.slice(0, 5) } : null;
}

const rawBySku = new Map(raw.map((p) => [p.sku, p]));
let added = 0, imgCount = 0;
const expressSkusForTab = [];

for (const p of express) {
  const picked = pickImages(p.sku);
  if (!picked) continue;                    // no image (EX043/EX007) -> skip
  const base = `${p.sku.toLowerCase()}-${p.category_slug}`;
  const outDir = path.join(PROD_DIR, base);
  fs.mkdirSync(outDir, { recursive: true });
  const gallery = [];
  picked.files.forEach((f, i) => {
    const name = i === 0 ? `${base}-square.jpg` : `${base}-${String(i + 1).padStart(2, "0")}.jpg`;
    fs.copyFileSync(path.join(picked.dir, f), path.join(outDir, name));
    gallery.push(`/images/products/${base}/${name}`);
    imgCount++;
  });
  gen[p.sku] = { base, gallery };

  // public product record (NO cost/supplier; price null -> "ขอใบเสนอราคา")
  const rec = {
    sku: p.sku, slug: base, name: p.name.replace(/\s+/g, " ").trim(),
    category: catTitle[p.category_slug] || "Lifestyle", category_slug: p.category_slug,
    features: (p.feature || "").trim() || (p.material ? `วัสดุ ${p.material}` : "สินค้าพร้อมส่งด่วน"),
    size: p.size || "", material: p.material || "",
    price_300_thb: null, budget_tier: "", moq: p.moq || 50,
    free_logo: p.custom_method ? [p.custom_method.replace(/\s+/g, " ").trim()] : [],
    logo_max_cm: "", occasions: [], express: true, lead_time: p.lead_time_raw || "",
  };
  if (rawBySku.has(p.sku)) Object.assign(rawBySku.get(p.sku), rec);
  else { raw.push(rec); rawBySku.set(p.sku, rec); }
  added++;

  if (p.is_express) expressSkusForTab.push(p.sku);   // genuine ≤14-day -> express tab
}

fs.writeFileSync(GEN_PATH, JSON.stringify(gen, null, 2), "utf8");
fs.writeFileSync(RAW_PATH, JSON.stringify(raw, null, 2), "utf8");

// patch EXPRESS_SKUS in v2.html
let html = fs.readFileSync(V2, "utf8");
const arr = "[" + expressSkusForTab.map((s) => `'${s}'`).join(",") + "]";
html = html.replace(/const EXPRESS_SKUS=\[[^\]]*\];/, `const EXPRESS_SKUS=${arr};`);
fs.writeFileSync(V2, html, "utf8");

console.log(`Integrated ${added} express SKUs · copied ${imgCount} images`);
console.log(`EXPRESS_SKUS (genuine ≤14-day, with image): ${expressSkusForTab.length}`);
console.log(expressSkusForTab.join(" "));
