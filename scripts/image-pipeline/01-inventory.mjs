// ============================================================
// GO PREMIUM — Image pipeline · Step 1: inventory
// Walks the product-photo source tree and emits a JSON manifest
// of every SKU folder + the image files inside it (recursive).
// ============================================================
import { readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const SRC = 'C:\\Users\\Golf\\Desktop\\Gopremium new version\\รูปสินค้า';
const OUT = 'C:\\Users\\Golf\\Gopremium-website\\scripts\\image-pipeline';
const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const SKU_RE = /^([A-Z]{2}\d{3})\s*-\s*(.+)$/; // "DW001 - Loopa"

function listImagesRecursive(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) out.push(...listImagesRecursive(full));
    else if (IMG_EXT.has(extname(name).toLowerCase())) out.push({ path: full, name, bytes: st.size });
  }
  return out;
}

// ASCII-only slug: drop Thai noise words, strip all Thai chars, keep English/digits.
function kebab(s) {
  let m = s
    .normalize('NFC')
    .replace(/เซตของขวัญ/g, ' ')
    .replace(/รุ่น/g, ' ')
    .replace(/\bAW\b/gi, ' ')
    .replace(/[฀-๿]/g, ' ')   // strip all Thai characters
    .replace(/\+/g, ' plus ')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
  return m || 'item';
}

const catalog = [];
for (const cat of readdirSync(SRC)) {
  const catPath = join(SRC, cat);
  let st; try { st = statSync(catPath); } catch { continue; }
  if (!st.isDirectory()) continue;

  for (const folder of readdirSync(catPath)) {
    const folderPath = join(catPath, folder);
    let fst; try { fst = statSync(folderPath); } catch { continue; }
    if (!fst.isDirectory()) continue;

    const m = folder.match(SKU_RE);
    const images = listImagesRecursive(folderPath);
    if (images.length === 0) continue;

    if (m) {
      const sku = m[1];
      const model = m[2].trim();
      // base = sku-lower + kebab(model), strip leading thai words like "รุ่น"
      const modelClean = model.replace(/^(รุ่น|AW)\s*/i, '');
      const base = `${sku.toLowerCase()}-${kebab(modelClean)}`.replace(/-$/, '');
      catalog.push({
        category: cat,
        sku,
        model: modelClean,
        base,
        folder: folderPath,
        imageCount: images.length,
        images: images.map((i) => i.path),
      });
    } else {
      // non-SKU product folder (no catalog code) — recorded but not auto-mapped
      catalog.push({
        category: cat,
        sku: null,
        model: folder,
        base: `x-${kebab(folder)}`,
        folder: folderPath,
        imageCount: images.length,
        images: images.map((i) => i.path),
      });
    }
  }
}

catalog.sort((a, b) => (a.sku || 'zzz').localeCompare(b.sku || 'zzz'));
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'inventory.json'), JSON.stringify(catalog, null, 2), 'utf8');

const skuFolders = catalog.filter((c) => c.sku);
console.log(`Folders with images: ${catalog.length}`);
console.log(`  SKU-coded:     ${skuFolders.length}`);
console.log(`  non-SKU:       ${catalog.length - skuFolders.length}`);
console.log(`Total images:    ${catalog.reduce((n, c) => n + c.imageCount, 0)}`);
console.log(`\nBy category:`);
for (const cat of [...new Set(catalog.map((c) => c.category))]) {
  const rows = catalog.filter((c) => c.category === cat);
  console.log(`  ${cat}: ${rows.length} folders, ${rows.reduce((n, c) => n + c.imageCount, 0)} images`);
}
