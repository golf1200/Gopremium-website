// รอบ 2 ของ feedback 2026-07-30 — ปิด 3 เรื่องที่ค้าง (Golf อนุมัติใช้ Gemini gen รูป 2026-07-31)
//   1. merge EX031 + EX034  → เก็บ EX031 ตัวเดียว 2 ขนาด + redirect
//   2. EX099 ลบลายพิมพ์บนกระเป๋าออก (Gemini) → กระเป๋าเปล่าพร้อมสกรีนโลโก้ลูกค้า
//   3. EX131 ไม่มีรูปที่ถูกรุ่น → พักออกจากเว็บจนกว่าซัพจะส่งรูป (ตามแบบ commit daf8715)
// + ติดตั้งรูป Gemini ที่ผ่าน QA และรับรูปสตูดิโอแทนรูปซัพดิบ
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(REPO, 'src/data/products-raw.json');
const IMGJSON = path.join(REPO, 'src/data/product-images.generated.json');
const AB = path.join(REPO, 'scripts/image-pipeline/staged/studio-ab');
const products = JSON.parse(readFileSync(RAW, 'utf8'));
const images = JSON.parse(readFileSync(IMGJSON, 'utf8'));
const log = [];
const bySku = (s) => products.find((p) => p.sku === s);

// ---------- รูป ----------
async function install(genDir, slug, name) {
  const src = path.join(AB, genDir, 'gemini-1.jpg');
  if (!existsSync(src)) { log.push(`!! missing ${src}`); return null; }
  const dir = path.join(REPO, 'public/images/products', slug);
  mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${slug}-${name}.jpg`);
  await sharp(src).resize(1000, 1000, { fit: 'cover' }).jpeg({ quality: 84, mozjpeg: true }).toFile(out);
  log.push(`   ${slug}-${name}.jpg  ${Math.round((await sharp(out).metadata()).size / 1024 || 0)}KB`);
  return `/images/products/${slug}/${slug}-${name}.jpg`;
}
const setGallery = (sku, paths) => {
  const gallery = [...new Set(paths.filter(Boolean))];
  images[sku] = { base: images[sku]?.base || gallery[0].split('/')[3], gallery };
  log.push(`   ${sku} -> ${gallery.map((p) => p.split('/').pop()).join(', ')}`);
};
const keep = (sku, i) => images[sku]?.gallery[i];

log.push('== รูปสตูดิโอใหม่จาก Gemini (ผ่าน QA) ==');
const ex031 = await install('EX031', 'ex031-drinkware', 'studio');
const ex099 = await install('EX099', 'ex099-bags', 'plain');
const ex028 = await install('EX028', 'ex028-drinkware', 'studio');
const ex028g = await install('EX028G', 'ex028-drinkware', 'colours');
const ex116 = await install('EX116', 'ex116-garment', 'studio');
const ex010 = await install('EX010G', 'ex010-umbrella', 'colours-studio');
const ex039 = await install('EX039G', 'ex039-drinkware', 'colours-studio');
const ex126 = await install('EX126G', 'ex126-drinkware', 'colours-studio');
const ex015 = await install('EX015G', 'ex015-umbrella', 'studio');
const ex017 = await install('EX017S', 'ex017-umbrella', 'studio');

setGallery('EX099', [ex099]);
setGallery('EX028', [ex028, ex028g]);
setGallery('EX116', [ex116, keep('EX116', 1), keep('EX116', 2), keep('EX116', 3)]);
setGallery('EX010', [keep('EX010', 0), ex010]);
setGallery('EX039', [keep('EX039', 0), ex039]);
setGallery('EX126', [keep('EX126', 0), ex126]);
setGallery('EX015', [ex015, keep('EX015', 1)]);
setGallery('EX017', [ex017, keep('EX017', 1), keep('EX017', 2)]);
// EX011 / EX124: Gemini ทำสีเพี้ยน (navy→น้ำตาล / แดงเพี้ยน) → คงรูปซัพจริงไว้ ความถูกต้องของสีสำคัญกว่าความสวย

log.push('== 1) merge EX031 + EX034 → เก็บ EX031 ==');
{
  const p = bySku('EX031');
  p.name = 'แก้วเก็บความเย็น รุ่นหูเหลี่ยม 20/30 oz';
  p.size = '600 ml (20 oz) / 890 ml (30 oz)';
  p.price_300_thb = 142; // เริ่มต้นที่ไซส์ 20 oz
  p.features = 'หูหิ้วทรงเหลี่ยม ฝาสไลด์ เก็บความเย็นได้นาน · มี 2 ขนาด 20 oz (฿142) และ 30 oz (฿150) ราคาต่อชิ้นที่ 300 ชิ้น';
  setGallery('EX031', [ex031]);
  log.push(`   EX031 -> ${p.name} · ${p.size} · เริ่ม ฿${p.price_300_thb} · ${(p.colors || []).length} สี`);
  const i = products.findIndex((x) => x.sku === 'EX034');
  if (i >= 0) {
    products.splice(i, 1); delete images.EX034;
    const d = path.join(REPO, 'public/product/ex034-drinkware');
    if (existsSync(d)) rmSync(d, { recursive: true, force: true });
    log.push('   EX034 ลบแล้ว (รวมเข้า EX031) + redirect');
  } else log.push('   EX034 ลบไปแล้ว');
}

log.push('== 3) EX131 พักออกจากเว็บ (ยังไม่มีรูปที่ถูกรุ่น) ==');
{
  const i = products.findIndex((x) => x.sku === 'EX131');
  if (i >= 0) {
    products.splice(i, 1); delete images.EX131;
    const d = path.join(REPO, 'public/product/ex131-drinkware');
    if (existsSync(d)) rmSync(d, { recursive: true, force: true });
    log.push('   EX131 ถอดออกจาก catalogue — ใส่กลับได้ทันทีเมื่อได้รูปจริง');
  } else log.push('   EX131 ถอดไปแล้ว');
}

writeFileSync(RAW, JSON.stringify(products, null, 2) + '\n');
writeFileSync(IMGJSON, JSON.stringify(images, null, 2) + '\n');
console.log(log.join('\n'));
console.log(`\nproducts: ${products.length} · express: ${products.filter((p) => p.express).length}`);
