import sharp from 'sharp';
import fs from 'fs';
const DEMO = 'C:/Users/Golf/Documents/Claude/Projects/Gopremium Website LIVE/Demo/';
const OUT = 'C:/Users/Golf/Documents/Claude/Projects/Gopremium Website LIVE/website/public/images/portfolio/';
const BANNER = DEMO + 'final home banner.png';            // 1672x941, 3 presenters
const JOBSDB = DEMO + 'ChatGPT Image Jun 20, 2026, 03_04_05 PM.png'; // 1536x1024

// --- 3 presenter portrait crops (left, top, w, h) on 1672x941 ---
const PEOPLE = [
  { slug: 'team-care',    box: [470, 55, 440, 550] }, // woman  (ใส่ใจ)
  { slug: 'team-trust',   box: [1005, 80, 470, 588] },// businessman (เชื่อถือได้)
  { slug: 'team-fast',    box: [600, 350, 540, 591] },// delivery (รวดเร็ว)
];

const log = [];
for (const p of PEOPLE) {
  const [l, t, w, h] = p.box;
  const buf = await sharp(BANNER).extract({ left: l, top: t, width: w, height: h })
    .resize(600, 750, { fit: 'cover', position: 'top' })
    .modulate({ brightness: 1.02, saturation: 1.04 }).sharpen({ sigma: 0.6 })
    .jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  fs.writeFileSync(OUT + p.slug + '.jpg', buf);
  log.push([p.slug, Math.round(buf.length / 1024) + 'KB']);
}

// --- jobsdb premium set: replace gift-jobsdb card + lg ---
async function emitJ(name, w, h, q = 82) {
  let buf = await sharp(JOBSDB).rotate().modulate({ brightness: 1.02, saturation: 1.04 }).sharpen({ sigma: 0.5 })
    .resize(w, h, { fit: 'cover', position: 'centre' }).jpeg({ quality: q, mozjpeg: true }).toBuffer();
  let qq = q; while (buf.length > 170 * 1024 && qq > 58) { qq -= 6;
    buf = await sharp(JOBSDB).rotate().modulate({ brightness: 1.02, saturation: 1.04 }).sharpen({ sigma: 0.5 })
      .resize(w, h, { fit: 'cover', position: 'centre' }).jpeg({ quality: qq, mozjpeg: true }).toBuffer(); }
  fs.writeFileSync(OUT + name, buf); log.push([name, Math.round(buf.length / 1024) + 'KB']);
}
await emitJ('gift-jobsdb.jpg', 920, 690, 80);
await emitJ('gift-jobsdb-lg.jpg', 1280, 853, 82);

console.log(JSON.stringify(log));

// verification montage of the 3 people
const tiles = await Promise.all(PEOPLE.map(async p => {
  const b = await sharp(OUT + p.slug + '.jpg').resize(300, 375, { fit: 'cover' }).toBuffer();
  const lab = Buffer.from(`<svg width="300" height="405"><rect width="300" height="405" fill="#0d1a36"/><text x="8" y="398" font-family="monospace" font-size="16" fill="#f4b223">${p.slug}</text></svg>`);
  return sharp(lab).composite([{ input: b, top: 0, left: 0 }]).png().toBuffer();
}));
await sharp({ create: { width: 900, height: 405, channels: 3, background: '#0d1a36' } })
  .composite(tiles.map((input, j) => ({ input, left: j * 300, top: 0 }))).png()
  .toFile(DEMO + '_contact/check-people.png');
console.log('montage ok');
