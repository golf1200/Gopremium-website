// ============================================================
// GO PREMIUM — Image pipeline · Step 2: process
// Reads manifest.json (curated picks per SKU) and produces the
// 3 masters from the cover + square gallery images, padded on
// white so nothing is cropped. Emits product-images.generated.json
// for the data layer.
//
//   manifest.json entry:
//     { sku, base, category, model, picks: [absPath, ...] }  // picks[0] = cover
//
// Output per base -> public/images/products/<base>/ :
//     <base>-square.jpg     1000x1000   (cover, gallery #1)
//     <base>-landscape.jpg  1280x720    (cover)
//     <base>-hero.jpg       1050x1200   (cover)
//     <base>-02.jpg ...     1000x1000   (gallery #2..N, square)
// ============================================================
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PIPE = 'C:\\Users\\Golf\\Gopremium-website\\scripts\\image-pipeline';
const OUT_ROOT = 'C:\\Users\\Golf\\Gopremium-website\\public\\images\\products';
const DATA_OUT = 'C:\\Users\\Golf\\Gopremium-website\\src\\data\\product-images.generated.json';
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

const SIZES = {
  square:    [1000, 1000],
  landscape: [1280, 720],
  hero:      [1050, 1200],
};

async function pad(src, w, h, outFile) {
  await sharp(src)
    .flatten({ background: WHITE })                 // PNG alpha -> white
    .resize(w, h, { fit: 'contain', background: WHITE }) // pad, never crop
    .jpeg({ quality: 84, progressive: true, mozjpeg: true })
    .toFile(outFile);
}

const onlyBase = process.argv[2] || null; // optional: process a single base
const manifest = JSON.parse(readFileSync(join(PIPE, 'manifest.json'), 'utf8'));
const generated = existsSync(DATA_OUT)
  ? JSON.parse(readFileSync(DATA_OUT, 'utf8'))
  : {};

let done = 0;
for (const entry of manifest) {
  if (onlyBase && entry.base !== onlyBase) continue;
  const { sku, base, picks } = entry;
  if (!picks || picks.length === 0) { console.warn(`SKIP ${base}: no picks`); continue; }

  const dir = join(OUT_ROOT, base);
  mkdirSync(dir, { recursive: true });

  const cover = picks[0];
  await pad(cover, ...SIZES.square,    join(dir, `${base}-square.jpg`));
  await pad(cover, ...SIZES.landscape, join(dir, `${base}-landscape.jpg`));
  await pad(cover, ...SIZES.hero,      join(dir, `${base}-hero.jpg`));

  const gallery = [`/images/products/${base}/${base}-square.jpg`];
  for (let i = 1; i < picks.length; i++) {
    const n = String(i + 1).padStart(2, '0');
    await pad(picks[i], ...SIZES.square, join(dir, `${base}-${n}.jpg`));
    gallery.push(`/images/products/${base}/${base}-${n}.jpg`);
  }

  if (sku) generated[sku] = { base, gallery };
  done++;
  console.log(`OK ${base}  (${picks.length} imgs)`);
}

writeFileSync(DATA_OUT, JSON.stringify(generated, null, 2), 'utf8');
console.log(`\nProcessed ${done} products. Map entries: ${Object.keys(generated).length}`);
console.log(`Wrote ${DATA_OUT}`);
