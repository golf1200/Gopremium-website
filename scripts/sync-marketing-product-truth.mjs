/**
 * Exports the approved public subset of Platform Marketing Product Truth.
 * This is data only: pages decide presentation, and must not turn a reference
 * or internal concept asset into production/QC/delivery proof.
 *
 * Run from website/: node scripts/sync-marketing-product-truth.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(here, '../../../COWORK Agent/GoPremium-Platform/data/marketing-product-truth.json');
const output = path.resolve(here, '../public/marketing-product-truth.js');
const websiteProductsSource = path.resolve(here, '../src/data/products-raw.json');
const assetStatus = {
  EX176: { class: 'approved_logo_mockup', label: 'ภาพจำลองตำแหน่งโลโก้', publishable: true },
  EX163: { class: 'catalogue_reference', label: 'ภาพสินค้าอ้างอิง', publishable: true },
  EX129: { class: 'internal_concept_only', label: 'ภาพแนวคิดภายใน', publishable: false },
  EX117: { class: 'internal_concept_only', label: 'ภาพแนวคิดภายใน', publishable: false },
  EX122: { class: 'internal_concept_only', label: 'ภาพแนวคิดภายใน', publishable: false },
};

const truth = JSON.parse(fs.readFileSync(source, 'utf8'));
const websiteProducts = JSON.parse(fs.readFileSync(websiteProductsSource, 'utf8'));
const websiteProductBySku = new Map(websiteProducts.map((product) => [product.sku, product]));
const products = truth.products.map((product) => {
  const websiteProduct = websiteProductBySku.get(product.sku);
  if (!product.sku || !product.name || !product.moq || !product.master_unit_price_thb || !product.image_url) {
    throw new Error(`Incomplete Product Truth record: ${product.sku || 'unknown'}`);
  }
  if (!websiteProduct?.express || !websiteProduct.ship_label) {
    throw new Error(`Missing Website Express ship_label: ${product.sku}`);
  }
  return {
    sku: product.sku,
    name: product.name,
    category: product.category,
    status: product.status,
    moq: product.moq,
    unit_price_thb: product.master_unit_price_thb,
    // Delivery copy must stay aligned with the Website catalogue's per-SKU
    // shipping contract; never replace it with one blanket Express promise.
    express_message: websiteProduct.ship_label,
    image_url: product.image_url,
    asset_status: assetStatus[product.sku] || { class: 'not_approved', label: 'รอตรวจภาพ', publishable: false },
  };
});
const payload = {
  schema_version: truth.schema_version,
  captured_at: truth.captured_at,
  authority: {
    source: truth.authority.source,
    price_field: truth.authority.price_field,
    express_message: 'src/data/products-raw.json:ship_label',
  },
  products,
};
const forbidden = /cost|supplier|logo_method|@300/i;
if (forbidden.test(JSON.stringify(payload))) throw new Error('Unsafe field reached Website public payload');

fs.writeFileSync(
  output,
  `/* AUTO-GENERATED. Source: Gopremium Dev Master via Marketing Product Truth. */\nwindow.GOPREMIUM_MARKETING_PRODUCT_TRUTH = Object.freeze(${JSON.stringify(payload, null, 2)});\n`,
  'utf8',
);
console.log(`Website Product Truth export: ${products.length} SKU → ${path.relative(path.resolve(here, '..'), output)}`);
