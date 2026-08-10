// Finalize a reviewed express batch (FREE — no API):
//   pick the chosen model per SKU from staged/studio-ab, apply the V3 watermark,
//   stage to staged/express-publish/<SKU>.jpg, and build a BEFORE→AFTER review.
// With --publish: back up the live square.jpg and replace it with the new image.
//
// Usage:
//   node scripts/express-finalize.mjs EX022:gemini EX004:flux EX020:flux ...
//   node scripts/express-finalize.mjs EX022:gemini ... --publish
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const AB = join(REPO, 'scripts', 'image-pipeline', 'staged', 'studio-ab');
const OUT = join(REPO, 'scripts', 'image-pipeline', 'staged', 'express-publish');
const PUB = join(REPO, 'public', 'images', 'products');
const LOGO = 'C:/Users/Golf/Gopremium-website/Gopremium new version/Logo/GoPremium Logo Navy.png';
const IMGMAP = JSON.parse(readFileSync(join(REPO, 'src', 'data', 'product-images.generated.json'), 'utf8'));
const SIZE = 1000;
const WM = { width: 0.55, opacity: 0.07 }; // V3 default

const argv = process.argv.slice(2);
const publish = argv.includes('--publish');
const sels = argv.filter(a => a.includes(':')).map(a => {
  const [sku, model] = a.split(':');
  return { sku: sku.toUpperCase(), file: (model === 'flux' ? 'kontext-pro-1' : 'gemini-1') + '.jpg', model };
});
if (!sels.length) { console.error('pass SKU:model pairs e.g. EX022:gemini EX004:flux'); process.exit(1); }

async function v3(srcBuf) {
  const w = Math.round(SIZE * WM.width);
  const { data, info } = await sharp(LOGO).resize({ width: w }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * WM.opacity);
  const logo = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  const left = Math.round((SIZE - info.width) / 2), top = Math.round((SIZE - info.height) / 2);
  return sharp(srcBuf).resize(SIZE, SIZE, { fit: 'cover' }).composite([{ input: logo, left, top }]).jpeg({ quality: 88 }).toBuffer();
}

function liveSquare(sku) {
  const rec = IMGMAP[sku];
  const rel = rec.gallery[0].replace(/^\//, '').replace('images/products/', '');
  return join(PUB, rel);
}

mkdirSync(OUT, { recursive: true });
const rows = [];
for (const { sku, file, model } of sels) {
  const gen = join(AB, sku, file);
  if (!existsSync(gen)) { console.log(`SKIP ${sku}: ${file} not found`); continue; }
  const finalBuf = await v3(readFileSync(gen));
  const staged = join(OUT, `${sku}.jpg`);
  writeFileSync(staged, finalBuf);
  rows.push({ sku, model, before: liveSquare(sku), after: staged });
  console.log(`staged ${sku} (${model}) -> ${staged}`);
  if (publish) {
    const live = liveSquare(sku);
    const bak = live.replace(/\.jpg$/i, `.pre-restyle.jpg`);
    if (!existsSync(bak)) copyFileSync(live, bak);  // backup original once
    writeFileSync(live, finalBuf);
    console.log(`  PUBLISHED -> ${live} (backup: ${bak})`);
  }
}

// before -> after review HTML
const b64 = (p) => 'data:image/jpeg;base64,' + readFileSync(p).toString('base64');
const cards = rows.map(r => `
  <div class="row"><div class="sku">${r.sku}<br><small>${r.model}</small></div>
    <figure><img src="${b64(r.before)}"><figcaption>เดิม (รูปจริง)</figcaption></figure>
    <div class="arrow">→</div>
    <figure class="new"><img src="${b64(r.after)}"><figcaption>ใหม่ + ลายน้ำ V3</figcaption></figure>
  </div>`).join('');
const html = `<!doctype html><meta charset=utf-8><title>Express finalize — before/after</title>
<style>body{background:#eceae4;font-family:"IBM Plex Sans Thai",system-ui;margin:0;padding:24px;color:#13244a}
h1{font-size:19px}h1 b{color:#f4b223}.row{display:flex;align-items:center;gap:16px;background:#fff;border-radius:14px;padding:12px;margin-bottom:14px;box-shadow:0 2px 10px rgba(19,36,74,.08)}
.sku{width:90px;font-weight:700;font-size:14px;text-align:center}.arrow{font-size:26px;color:#f4b223}
figure{margin:0}img{width:260px;height:260px;object-fit:cover;border-radius:9px;display:block}
figure.new img{outline:2px solid #f4b223}figcaption{text-align:center;font-size:12px;margin-top:5px;color:#5b647a}</style>
<h1>GO <b>PREMIUM</b> — Express finalize ${publish ? '(เผยแพร่แล้ว)' : '(staging — ยังไม่เปลี่ยนของจริง)'}</h1>
${cards}`;
const out = join(OUT, 'REVIEW-before-after.html');
writeFileSync(out, html);
console.log('\nreview ->', out);
