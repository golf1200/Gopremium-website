// Apply the consolidated real-photo set (reconcile.json) to the website SOURCE data.
//  1. src/data/product-images.generated.json  -> point all 71 SKUs at new studio photos
//  2. src/data/products-raw.json               -> ensure express flag; insert NEW EX082+ records
// Then run build-catalogue-data.mjs separately to regenerate public/catalogue-data.js.
import fs from 'node:fs';
import path from 'node:path';

const BASE = path.resolve('express-realphoto-2026');
const recon = JSON.parse(fs.readFileSync(path.join(BASE,'reconcile.json'),'utf8'));
const GEN = 'src/data/product-images.generated.json';
const RAW = 'src/data/products-raw.json';
const PUB = 'public/images/products';

const gen = JSON.parse(fs.readFileSync(GEN,'utf8'));
const raw = JSON.parse(fs.readFileSync(RAW,'utf8'));
const bySku = new Map(raw.map(p=>[p.sku,p]));

// category slug remap to live taxonomy
const CATSLUG = { bag:'bags', lifestyle:'lifestyle', garment:'garment', drinkware:'drinkware',
  hat:'hat', umbrella:'umbrella', powerbank:'powerbank', fan:'fan' };
const CATTITLE = { bags:'Bag', lifestyle:'Lifestyle', garment:'Garment', drinkware:'Drinkware',
  hat:'Hat', umbrella:'Umbrella', powerbank:'Powerbank', fan:'Mini Fan' };

const galleryFor = (slug) => {
  const dir = path.join(PUB, slug);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f=>/\.jpg$/i.test(f));
  const sq = files.find(f=>f.includes('-square'));
  const rest = files.filter(f=>!f.includes('-square')).sort();
  const ordered = [sq, ...rest].filter(Boolean).map(f=>`/images/products/${slug}/${f}`);
  return ordered.length ? ordered : null;
};

let updImg=0, newRec=0, updColors=0;
for (const e of recon){
  const sku = e.sku;
  const cs = CATSLUG[e.catSlug] || e.catSlug;
  const slug = `${sku.toLowerCase()}-${cs}`;
  const gal = galleryFor(slug);
  if (gal){ gen[sku] = { base: slug, gallery: gal }; updImg++; }

  let rec = bySku.get(sku);
  if (rec){
    rec.express = true;
    if ((!rec.colors || rec.colors.length===0) && e.colors && e.colors.length){
      rec.colors = e.colors; updColors++;
    }
  } else {
    rec = {
      sku, slug,
      name: e.name,
      category: CATTITLE[cs] || e.catLabel || 'Lifestyle',
      category_slug: cs,
      features: e.notes && e.notes.length < 90 ? '' : '',
      size: '', material: '',
      price_300_thb: null, budget_tier: '',
      moq: 50,
      free_logo: [],
      logo_max_cm: '',
      colors: e.colors || [],
      occasions: [],
      lead_time: '7-14 วัน',
      express: true,
    };
    raw.push(rec); bySku.set(sku, rec); newRec++;
  }
}

fs.writeFileSync(GEN, JSON.stringify(gen,null,1));
fs.writeFileSync(RAW, JSON.stringify(raw,null,1));
console.log(`images updated: ${updImg} | new raw records: ${newRec} | colors filled: ${updColors}`);
console.log(`raw total now: ${raw.length} | EX total: ${raw.filter(p=>p.sku.startsWith('EX')).length}`);
