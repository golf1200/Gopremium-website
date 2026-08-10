// Download all proposed Drive images from curate-master.json (FREE, public uc?export),
// resize to a review-friendly size, and stage them for review + later publish.
// Output: express-realphoto-2026/staged-curate/<SKU>/<order>-<role>.jpg
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'express-realphoto-2026');
const OUT = join(DIR, 'staged-curate');
const master = JSON.parse(readFileSync(join(DIR, 'curate-master.json'), 'utf8')).master;

const driveUrl = (id) => `https://drive.google.com/uc?export=download&id=${id}`;
const safe = (s) => (s || '').replace(/[^a-z0-9]+/gi, '-').slice(0, 24);

async function fetchImage(id) {
  const r = await fetch(driveUrl(id), { redirect: 'follow' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const buf = Buffer.from(await r.arrayBuffer());
  // Drive sometimes returns an HTML "virus scan" page for big files; images are small so check magic bytes
  if (buf.length < 2000 || (buf[0] === 0x3c)) throw new Error('not-an-image (got HTML, ' + buf.length + 'B)');
  return buf;
}

const tasks = [];
for (const [sku, rec] of Object.entries(master)) {
  rec.images.forEach((im, i) => tasks.push({ sku, slug: rec.slug, im, idx: i + 1 }));
}
console.log(`downloading ${tasks.length} images for ${Object.keys(master).length} SKUs...`);

let ok = 0, fail = 0; const fails = [];
const POOL = 8;
async function worker(queue) {
  while (queue.length) {
    const t = queue.shift();
    const dir = join(OUT, t.sku); mkdirSync(dir, { recursive: true });
    const fn = `${String(t.idx).padStart(2, '0')}-${t.im.role || 'img'}.jpg`;
    const path = join(dir, fn);
    if (existsSync(path)) { ok++; continue; }
    try {
      const buf = await fetchImage(t.im.driveFileId);
      await sharp(buf).resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82 }).toFile(path);
      ok++;
    } catch (e) { fail++; fails.push(`${t.sku} #${t.idx} ${t.im.driveFileId}: ${e.message}`); }
    if ((ok + fail) % 25 === 0) console.log(`  ${ok + fail}/${tasks.length} (ok=${ok} fail=${fail})`);
  }
}
const q = tasks.slice();
await Promise.all(Array.from({ length: POOL }, () => worker(q)));
writeFileSync(join(DIR, 'download-fails.json'), JSON.stringify(fails, null, 1));
console.log(`\ndone: ${ok} ok, ${fail} fail -> ${OUT}`);
if (fails.length) console.log('fails (see download-fails.json):\n  ' + fails.slice(0, 8).join('\n  '));
