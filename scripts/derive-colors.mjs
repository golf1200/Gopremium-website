// Derive the colour swatches for each product from its published gallery images.
// Each gallery photo of these SKUs is a real colour variant, so we sample the
// dominant product colour from the centre of each image (ignoring the cream
// backdrop + the navy gift icon), dedupe near-identical colours, map each to the
// nearest Thai colour name in color-map.json, and write the swatch list.
//   node scripts/derive-colors.mjs BG017 BG018 ...   (default: every SKU in restyle-picklist.json)
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const REPO = process.cwd(); // run from website/
const IMGMAP = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/product-images.generated.json'), 'utf8'));
const COLORMAP = JSON.parse(fs.readFileSync(path.join(REPO, 'src/data/color-map.json'), 'utf8'));
const OUT = path.join(REPO, 'src/data/product-colors.generated.json');
const named = Object.entries(COLORMAP).filter(([k]) => !k.startsWith('_'))
  .map(([name, hex]) => ({ name, rgb: hexToRgb(hex) }));

function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbToHex([r, g, b]) { return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); }
const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
function nearestName(rgb) { let best = null, bd = 1e9; for (const c of named) { const d = dist2(rgb, c.rgb); if (d < bd) { bd = d; best = c.name; } } return best; }

// average product colour from the centre of one image
async function productColor(file) {
  const S = 48;
  const sq = await sharp(file).resize(1000, 1000, { fit: 'cover' }).toBuffer();
  const { data } = await sharp(sq)
    .extract({ left: 300, top: 260, width: 400, height: 400 }) // centre, above the bottom-right icon
    .resize(S, S).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = [];
  for (let i = 0; i < data.length; i += 3) px.push([data[i], data[i + 1], data[i + 2]]);
  // background = warm cream: high luminance + low saturation. Drop it unless it dominates (pale product).
  const lum = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
  const sat = ([r, g, b]) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx ? (mx - mn) / mx : 0; };
  const isBg = (p) => lum(p) > 205 && sat(p) < 0.14;
  let prod = px.filter(p => !isBg(p));
  if (prod.length < px.length * 0.25) prod = px; // pale/white product: keep all
  const avg = prod.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map(v => v / prod.length);
  return avg;
}

const SKUS = process.argv.slice(2).length ? process.argv.slice(2).map(s => s.toUpperCase())
  : JSON.parse(fs.readFileSync(path.join(REPO, 'scripts/restyle-picklist.json'), 'utf8')) && Object.keys(JSON.parse(fs.readFileSync(path.join(REPO, 'scripts/restyle-picklist.json'), 'utf8')));

const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
for (const sku of SKUS) {
  const rec = IMGMAP[sku];
  if (!rec) { console.log(`skip ${sku} (no imgmap)`); continue; }
  const colors = [];
  for (const g of rec.gallery) {
    const file = path.join(REPO, 'public', g.replace(/^\//, ''));
    if (!fs.existsSync(file)) continue;
    const rgb = await productColor(file);
    // dedupe near-identical colours already collected
    if (colors.some(c => dist2(c.rgb, rgb) < 900)) continue;
    colors.push({ rgb, hex: rgbToHex(rgb), name: nearestName(rgb) });
  }
  out[sku] = colors.map(c => ({ hex: c.hex, name: c.name }));
  console.log(`${sku}: ${out[sku].length} colours -> ${out[sku].map(c => c.name + ' ' + c.hex).join(', ')}`);
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`\nwrote ${path.relative(REPO, OUT)} (${Object.keys(out).length} SKUs)`);
