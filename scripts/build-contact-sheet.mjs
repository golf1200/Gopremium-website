// Build a labelled contact sheet of a SKU's raw-1688 images, for picking which
// 4-5 to restyle. One JPG per SKU in scripts/raw-1688/_contact/<SKU>.jpg
//   node scripts/build-contact-sheet.mjs BG018 BG019 ...
//   node scripts/build-contact-sheet.mjs --file scripts/_batch1.json
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
let skus = [];
const fi = argv.indexOf('--file');
if (fi >= 0) skus = JSON.parse(fs.readFileSync(argv[fi + 1], 'utf8'));
else skus = argv.filter(a => !a.startsWith('--'));

const RAW = 'scripts/raw-1688';
const OUT = path.join(RAW, '_contact');
fs.mkdirSync(OUT, { recursive: true });
const cell = 300, cols = 5;

for (const sku of skus) {
  const dir = path.join(RAW, sku);
  if (!fs.existsSync(dir)) { console.log(`skip ${sku} (no folder)`); continue; }
  const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).sort();
  if (!files.length) { console.log(`skip ${sku} (no imgs)`); continue; }
  const rows = Math.ceil(files.length / cols);
  const comps = [];
  for (let i = 0; i < files.length; i++) {
    const label = files[i].replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const buf = await sharp(path.join(dir, files[i])).resize(cell - 8, cell - 8, { fit: 'contain', background: '#fff' })
      .composite([{ input: Buffer.from(`<svg width="${cell - 8}" height="24"><rect width="100%" height="24" fill="#000a"/><text x="6" y="17" fill="#fff" font-size="15" font-family="sans-serif">${label}</text></svg>`), top: 0, left: 0 }])
      .toBuffer();
    comps.push({ input: buf, left: (i % cols) * cell + 4, top: Math.floor(i / cols) * cell + 4 });
  }
  await sharp({ create: { width: cols * cell, height: rows * cell, channels: 3, background: '#222' } })
    .composite(comps).jpeg({ quality: 80 }).toFile(path.join(OUT, `${sku}.jpg`));
  console.log(`wrote _contact/${sku}.jpg (${files.length} imgs)`);
}
