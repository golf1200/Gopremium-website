// Build the customer-safe slim catalog used by the LINE chatbot.
//   input : scripts/catalog-master.json  (full master, incl. supplier links + cost)
//   output: api/_data/products.js         (ESM module, onWeb products, safe fields only)
// Run: node scripts/build-line-catalog.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const raw = JSON.parse(fs.readFileSync(path.join(root, 'scripts/catalog-master.json'), 'utf8'));
const arr = Array.isArray(raw) ? raw : (raw.products || Object.values(raw));

const clean = (s) => (s == null ? '' : String(s)).trim();
const num = (s) => { const n = parseInt(String(s).replace(/[^0-9]/g, ''), 10); return Number.isFinite(n) ? n : null; };

const out = arr
  .filter((p) => p.onWeb)
  .map((p) => ({
    sku: clean(p.sku),
    name: clean(p.name),
    category: clean(p.category),
    features: clean(p.features),
    size: clean(p.size),
    material: clean(p.material),
    colors: num(p.color),      // number of colour options
    price: num(p.price300),    // บาท/ชิ้น @ 300 ชิ้น
    moq: num(p.moq),
    logo: clean(p.logoTechniques),
    logoSize: clean(p.logoSize),
  }))
  .filter((p) => p.sku && p.name);

const banner =
  '// AUTO-GENERATED from scripts/catalog-master.json (onWeb products, customer-safe fields only).\n' +
  '// Regenerate: node scripts/build-line-catalog.mjs\n' +
  '// price = บาท/ชิ้น @ 300 ชิ้น. NO supplier links / cost data here.\n';
fs.writeFileSync(path.join(root, 'api/_data/products.js'), banner + 'export default ' + JSON.stringify(out) + ';\n');

console.log(`wrote api/_data/products.js — ${out.length} products`);
