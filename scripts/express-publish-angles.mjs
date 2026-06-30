// Publish generated angle shots into each express SKU's gallery.
// For each SKU: delete the OLD gallery extras (non-square), then write the 3 new
// angles (front, back|side, detail) as -02/-03/-04.jpg with the faint V3 wordmark
// (the navy gift icon is already baked by express-gen-angles). Then run
// express-regen-galleries.mjs + build-catalogue-data + build + push separately.
//   node scripts/express-publish-angles.mjs --plan
//   node scripts/express-publish-angles.mjs --go
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const STAGED = join(REPO, 'scripts', 'image-pipeline', 'staged', 'studio-ab');
const LOGO = 'C:/Users/Golf/Gopremium-website/Gopremium new version/Logo/GoPremium Logo Navy.png';
const SIZE = 1000, WM = { width: 0.55, opacity: 0.07 };
const IMGMAP = JSON.parse(readFileSync(join(REPO, 'src', 'data', 'product-images.generated.json'), 'utf8'));
const GO = process.argv.includes('--go');

const PUB = 'EX007 EX081 EX111 EX019 EX096 EX098 EX100 EX009 EX062 EX064 EX044 EX049 EX027 EX028 EX030 EX033 EX037 EX038 EX039 EX040 EX041 EX082 EX085 EX087 EX088 EX042 EX048 EX079 EX080 EX091 EX092 EX002 EX003 EX005 EX006 EX011 EX012 EX013 EX014 EX015 EX017 EX018 EX021 EX023 EX024 EX026 EX029 EX031 EX032 EX034 EX035 EX036 EX045 EX046 EX051 EX052 EX053 EX054 EX055 EX057 EX058 EX059 EX060 EX061 EX083 EX084 EX086 EX089 EX101 EX102 EX103 EX104 EX105 EX106'.split(' ');
// angle order in gallery: front, then back OR side, then detail
const pickAngles = (dir) => {
  const seq = ['angle-front.jpg', existsSync(join(dir,'angle-back.jpg')) ? 'angle-back.jpg' : 'angle-side.jpg', 'angle-detail.jpg'];
  return seq.filter(f => existsSync(join(dir, f)));
};

async function fadedLogo() {
  const w = Math.round(SIZE * WM.width);
  const { data, info } = await sharp(LOGO).resize({ width: w }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * WM.opacity);
  const buf = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  return { buf, w: info.width, h: info.height };
}
async function stamp(src, lg, dest) {
  let q = 88, out;
  do { out = await sharp(await sharp(src).resize(SIZE, SIZE, { fit: 'cover' }).toBuffer())
    .composite([{ input: lg.buf, left: Math.round((SIZE-lg.w)/2), top: Math.round((SIZE-lg.h)/2) }])
    .jpeg({ quality: q, progressive: true }).toBuffer(); q -= 6; } while (out.length > 170*1024 && q > 60);
  writeFileSync(dest, out); return Math.round(out.length/1024);
}

async function main() {
  const lg = await fadedLogo();
  let ok = 0, skip = 0, totalImgs = 0;
  for (const sku of PUB) {
    const sdir = join(STAGED, sku); const rec = IMGMAP[sku];
    if (!rec) { console.log(`SKIP ${sku} (no map)`); skip++; continue; }
    const angles = pickAngles(sdir);
    if (angles.length === 0) { console.log(`SKIP ${sku} (no angles staged)`); skip++; continue; }
    const pdir = join(REPO, 'public', 'images', 'products', rec.base);
    if (!GO) { console.log(`${sku}: ${angles.length} angles -> ${rec.base}-02..0${angles.length+1}.jpg`); ok++; totalImgs += angles.length; continue; }
    // delete OLD gallery extras (keep -square)
    for (const f of readdirSync(pdir)) if (/\.jpg$/i.test(f) && !f.includes('-square')) rmSync(join(pdir, f));
    let n = 2;
    for (const a of angles) {
      const kb = await stamp(join(sdir, a), lg, join(pdir, `${rec.base}-0${n}.jpg`));
      n++; totalImgs++;
    }
    ok++; console.log(`OK ${sku}  +${angles.length} angles`);
  }
  console.log(`\n${GO ? 'WROTE' : 'PLAN'} ${ok} SKUs, ${skip} skipped, ${totalImgs} gallery imgs.`);
}
main();
