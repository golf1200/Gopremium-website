import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC = 'C:/Users/Golf/Documents/Claude/Projects/Gopremium Website LIVE/Demo/รูปถ่ายสินค้าจริง/รูปถ่ายสินค้าจริง/1 รูปที่ใช้ได้';
const OUT = 'C:/Users/Golf/Documents/Claude/Projects/Gopremium Website LIVE/Demo/_contact';
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).filter(f => /\.jpe?g$/i.test(f)).sort();
const TILE = 300, LABEL = 30, COLS = 5, PER = 20;
const cellW = TILE, cellH = TILE + LABEL;

async function tile(file) {
  const buf = await sharp(path.join(SRC, file))
    .rotate()
    .resize(TILE, TILE, { fit: 'cover', position: 'centre' })
    .toBuffer();
  const label = Buffer.from(
    `<svg width="${cellW}" height="${cellH}"><rect width="${cellW}" height="${cellH}" fill="#0d1a36"/>` +
    `<text x="${cellW/2}" y="${TILE+20}" font-family="monospace" font-size="15" fill="#f4b223" text-anchor="middle">${file.replace(/\.JPG$/i,'')}</text></svg>`
  );
  return sharp(label).composite([{ input: buf, top: 0, left: 0 }]).png().toBuffer();
}

let sheet = 0;
for (let i = 0; i < files.length; i += PER) {
  const chunk = files.slice(i, i + PER);
  const tiles = await Promise.all(chunk.map(tile));
  const rows = Math.ceil(chunk.length / COLS);
  const W = COLS * cellW, H = rows * cellH;
  const comp = tiles.map((input, j) => ({ input, left: (j % COLS) * cellW, top: Math.floor(j / COLS) * cellH }));
  sheet++;
  const outPath = path.join(OUT, `sheet-${sheet}.png`);
  await sharp({ create: { width: W, height: H, channels: 3, background: '#0d1a36' } })
    .composite(comp).png().toFile(outPath);
  console.log('wrote', outPath, `(${chunk.length} imgs)`);
}
console.log('total', files.length, 'images,', sheet, 'sheets');
