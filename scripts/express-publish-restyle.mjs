// Publish the studio-restyle results (2026-06-30 batch) to the live express squares.
// For each SKU: take the chosen staged variant, stamp the faint V3 wordmark (the
// navy gift icon is already baked by fal-studio), resize 1000x1000, write to the
// public -square.jpg. Then bump IMG_VER + build + push separately.
//   node scripts/express-publish-restyle.mjs --plan   (list only)
//   node scripts/express-publish-restyle.mjs --go      (write files)
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const STAGED = join(REPO, 'scripts', 'image-pipeline', 'staged', 'studio-ab');
const LOGO = 'C:/Users/Golf/Gopremium-website/Gopremium new version/Logo/GoPremium Logo Navy.png';
const SIZE = 1000;
const WM = { width: 0.55, opacity: 0.07 }; // V3
const IMGMAP = JSON.parse(readFileSync(join(REPO, 'src', 'data', 'product-images.generated.json'), 'utf8'));

// SKU -> chosen staged variant filename
const PICK = {
  // A+B+C (exclude EX050, EX090 = unremovable POLO MAKER watermark)
  EX007:'gemini-2.jpg', EX081:'gemini-2.jpg', EX111:'gemini-1.jpg', EX019:'gemini-1.jpg',
  EX096:'gemini-1.jpg', EX098:'gemini-1.jpg', EX100:'gemini-1.jpg', EX009:'gemini-1.jpg',
  EX062:'gemini-1.jpg', EX064:'gemini-1.jpg', EX044:'gemini-1.jpg', EX049:'gemini-1.jpg',
  EX027:'kontext-pro-1.jpg', EX028:'gemini-1.jpg', EX030:'kontext-pro-1.jpg', EX033:'kontext-pro-1.jpg',
  EX037:'gemini-1.jpg', EX038:'kontext-pro-1.jpg', EX039:'gemini-1.jpg', EX040:'kontext-pro-1.jpg',
  EX041:'kontext-pro-1.jpg', EX082:'gemini-1.jpg', EX085:'gemini-1.jpg', EX087:'kontext-pro-1.jpg',
  EX088:'kontext-pro-1.jpg',
  // D garments (Gemini)
  EX042:'gemini-1.jpg', EX048:'gemini-1.jpg', EX079:'gemini-1.jpg', EX080:'gemini-1.jpg',
  EX091:'gemini-1.jpg', EX092:'gemini-1.jpg',
  // D product-only (Flux kontext-pro)
  EX002:'kontext-pro-1.jpg', EX003:'kontext-pro-1.jpg', EX005:'gemini-1.jpg', EX006:'kontext-pro-1.jpg',
  EX011:'kontext-pro-1.jpg', EX012:'kontext-pro-1.jpg', EX013:'kontext-pro-1.jpg', EX014:'kontext-pro-1.jpg',
  EX015:'kontext-pro-1.jpg', EX017:'kontext-pro-1.jpg', EX018:'kontext-pro-1.jpg', EX021:'kontext-pro-1.jpg',
  EX023:'kontext-pro-1.jpg', EX024:'kontext-pro-1.jpg', EX026:'kontext-pro-1.jpg', EX029:'kontext-pro-1.jpg',
  EX031:'kontext-pro-1.jpg', EX032:'kontext-pro-1.jpg', EX034:'kontext-pro-1.jpg', EX035:'kontext-pro-1.jpg',
  EX036:'kontext-pro-1.jpg', EX045:'kontext-pro-1.jpg', EX046:'kontext-pro-1.jpg', EX051:'kontext-pro-1.jpg',
  EX052:'kontext-pro-1.jpg', EX053:'kontext-pro-1.jpg', EX054:'kontext-pro-1.jpg', EX055:'kontext-pro-1.jpg',
  EX057:'kontext-pro-1.jpg', EX058:'kontext-pro-1.jpg', EX059:'kontext-pro-1.jpg', EX060:'kontext-pro-1.jpg',
  EX061:'kontext-pro-1.jpg', EX083:'kontext-pro-1.jpg', EX084:'kontext-pro-1.jpg', EX086:'kontext-pro-1.jpg',
  EX089:'kontext-pro-1.jpg', EX101:'kontext-pro-1.jpg', EX102:'kontext-pro-1.jpg', EX103:'kontext-pro-1.jpg',
  EX104:'kontext-pro-1.jpg', EX105:'kontext-pro-1.jpg', EX106:'kontext-pro-1.jpg',
};
const FALLBACKS = ['gemini-1.jpg','kontext-pro-1.jpg','gemini-2.jpg'];

const GO = process.argv.includes('--go');

async function fadedLogo() {
  const w = Math.round(SIZE * WM.width);
  const { data, info } = await sharp(LOGO).resize({ width: w }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * WM.opacity);
  const buf = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  return { buf, w: info.width, h: info.height };
}

async function main() {
  const lg = await fadedLogo();
  const left = Math.round((SIZE - lg.w) / 2), top = Math.round((SIZE - lg.h) / 2);
  let ok = 0, miss = 0, over = 0;
  for (const [sku, variant] of Object.entries(PICK)) {
    const dir = join(STAGED, sku);
    let src = join(dir, variant);
    if (!existsSync(src)) { src = FALLBACKS.map(f => join(dir, f)).find(existsSync); }
    const rec = IMGMAP[sku];
    if (!src || !rec) { console.log(`MISS ${sku} (src/map)`); miss++; continue; }
    const dest = join(REPO, 'public', 'images', 'products', rec.base, `${rec.base}-square.jpg`);
    if (!GO) { console.log(`${sku} <- ${variant.padEnd(16)} -> ${rec.base}-square.jpg`); ok++; continue; }
    let q = 88, outBuf;
    do {
      outBuf = await sharp(await sharp(src).resize(SIZE, SIZE, { fit: 'cover' }).toBuffer())
        .composite([{ input: lg.buf, left, top }]).jpeg({ quality: q, progressive: true }).toBuffer();
      q -= 6;
    } while (outBuf.length > 170 * 1024 && q > 60);
    writeFileSync(dest, outBuf);
    const kb = Math.round(outBuf.length / 1024);
    if (kb > 170) over++;
    console.log(`OK ${sku} -> ${rec.base}-square.jpg  ${kb}KB`);
    ok++;
  }
  console.log(`\n${GO ? 'WROTE' : 'PLAN'} ${ok} ok, ${miss} miss, ${over} over-170KB. (excluded EX050, EX090)`);
}
main();
