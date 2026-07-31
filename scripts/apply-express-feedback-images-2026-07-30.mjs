// Image half of the 2026-07-30 express feedback round.
// FREE path only (sharp: crop / pad / resize / optimise) — no paid AI generation.
// Sources: 10-DECISIONS-PENDING/EXPRESS-2026-07-30-รูปอ้างอิง/ (รูปที่ทีมแนบในเอกสาร)
//          express-realphoto-2026/drive-2026-07-30/ (ดาวน์โหลดจาก Drive ลิงก์ในเอกสาร)
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF = path.join(REPO, '../10-DECISIONS-PENDING/EXPRESS-2026-07-30-รูปอ้างอิง');
const DRIVE = path.join(REPO, 'express-realphoto-2026/drive-2026-07-30');
const IMGJSON = path.join(REPO, 'src/data/product-images.generated.json');
const images = JSON.parse(readFileSync(IMGJSON, 'utf8'));
const log = [];

const CREAM = { r: 244, b: 233, g: 239 };

// เขียนไฟล์ 1000x1000 คุณภาพเว็บ (<170KB ตาม CLAUDE.md)
async function emit(src, slug, name, { crop = null, fit = 'contain' } = {}) {
  const dir = path.join(REPO, 'public/images/products', slug);
  mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${slug}-${name}.jpg`);
  let img = sharp(src);
  if (crop) img = img.extract(crop);
  await img
    .resize(1000, 1000, { fit, background: CREAM })
    .flatten({ background: CREAM })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  const kb = Math.round(statSync(out).size / 1024);
  log.push(`   ${slug}-${name}.jpg  ${kb}KB${kb > 170 ? '  ⚠ over 170KB' : ''}`);
  return `/images/products/${slug}/${slug}-${name}.jpg`;
}

const setGallery = (sku, paths) => {
  const gallery = [...new Set(paths.filter(Boolean))];
  images[sku] = { base: images[sku]?.base || gallery[0].split('/')[3], gallery };
  log.push(`   ${sku} gallery -> ${gallery.map((p) => p.split('/').pop()).join(', ')}`);
};
const keep = (sku, i) => images[sku].gallery[i];

log.push('== EX116 หมวกปีกแข็ง — รูปสินค้าจริง 6 สีจาก Drive (รูปเดิมเป็นทรง bucket ผิดรุ่น) ==');
{
  // 1536x2048 แนวตั้ง — ครอปสี่เหลี่ยมจัตุรัสเยื้องขึ้นให้หมวกอยู่กลางเฟรม
  const crop = { left: 0, top: 300, width: 1536, height: 1536 };
  const picks = ['ex116-1', 'ex116-2', 'ex116-3', 'ex116-5'];
  const out = [];
  for (let i = 0; i < picks.length; i++) {
    out.push(await emit(path.join(DRIVE, picks[i] + '.bin'), 'ex116-garment', `real${i + 1}`, { crop, fit: 'cover' }));
  }
  setGallery('EX116', out);
}

log.push('== EX117 หมวกบักเก็ต — รับรูปสตูดิโอที่เคยอยู่บน EX116 (ทรง bucket ตรงรุ่นนี้) ==');
{
  const src = path.join(REPO, 'public/images/products/ex116-garment/ex116-garment-square.jpg');
  const moved = await emit(src, 'ex117-garment', 'bucket-studio');
  setGallery('EX117', [keep('EX117', 0), moved, keep('EX117', 1)].filter(Boolean));
}

log.push('== EX015 ร่มไม้เท้า / EX017 ร่มกอล์ฟ — รูปจริงจาก Drive ==');
{
  const a = await emit(path.join(DRIVE, 'ex015-1.bin'), 'ex015-umbrella', 'real1');
  setGallery('EX015', [a, keep('EX015', 0)]);
  const b = await emit(path.join(DRIVE, 'ex017-1.bin'), 'ex017-umbrella', 'real1');
  setGallery('EX017', [b, keep('EX017', 0), keep('EX017', 1)].filter(Boolean));
}

log.push('== EX175 / EX176 Griptok — mockup แบรนด์ GO PREMIUM จาก Drive (ทีมบอกใช้ได้เลย) ==');
{
  const a = [];
  for (let i = 1; i <= 4; i++) a.push(await emit(path.join(DRIVE, `ex175-${i}.bin`), 'ex175-lifestyle', `real${i}`));
  setGallery('EX175', a);
  const b = [];
  for (let i = 1; i <= 4; i++) b.push(await emit(path.join(DRIVE, `ex176-${i}.bin`), 'ex176-lifestyle', `real${i}`));
  setGallery('EX176', b);
}

log.push('== EX177 Magsafe wallet — เพิ่มรูปที่สองให้เห็นกางขาตั้ง ==');
{
  const p = await emit(path.join(REF, 'EX177-กางขาตั้ง.png'), 'ex177-lifestyle', 'stand');
  setGallery('EX177', [keep('EX177', 0), p]);
}

log.push('== EX028 — รูปเดิมทั้งสองใบเป็นรุ่นผิด แทนด้วยรูปสินค้าจริงจากเอกสาร ==');
{
  const p = await emit(path.join(REF, 'EX028-รูปจริง.png'), 'ex028-drinkware', 'real1');
  setGallery('EX028', [p]);
}

log.push('== เพิ่มรูป "สีจริง" เป็นรูปที่สอง (รูปหลักสตูดิโอถูกรุ่นอยู่แล้ว) ==');
{
  const add = async (sku, slug, file) => {
    const p = await emit(path.join(REF, file), slug, 'colours');
    setGallery(sku, [keep(sku, 0), p]);
  };
  await add('EX010', 'ex010-umbrella', 'EX010-12สี.jpg');
  await add('EX011', 'ex011-umbrella', 'EX011-9สี.jpg');
  await add('EX039', 'ex039-drinkware', 'EX039-รูปจริง-6สี.png');
  await add('EX124', 'ex124-drinkware', 'EX124-รูปจริง-สีถูกต้อง.png');
  await add('EX126', 'ex126-drinkware', 'EX126-รูปรวมสี.png');
}

writeFileSync(IMGJSON, JSON.stringify(images, null, 2) + '\n');
console.log(log.join('\n'));
