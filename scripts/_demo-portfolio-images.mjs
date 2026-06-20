import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC = 'C:/Users/Golf/Documents/Claude/Projects/Gopremium Website LIVE/Demo/รูปถ่ายสินค้าจริง/รูปถ่ายสินค้าจริง/1 รูปที่ใช้ได้';
const OUT = 'C:/Users/Golf/Documents/Claude/Projects/Gopremium Website LIVE/website/public/images/portfolio';
fs.mkdirSync(OUT, { recursive: true });

// curated selection: src file, slug, category key, Thai title, brand, feature?
// NOTE: captions verified against ACTUAL rendered content (see Demo/_contact/named-*.png)
const ITEMS = [
  { f: 'IMG_6122', slug: 'drink-chococrm-gold', cat: 'drinkware', title: 'กระบอกน้ำเก็บอุณหภูมิ สกรีนโลโก้', brand: 'ChocoCRM',       feature: true },
  { f: 'IMG_6084', slug: 'drink-tumbler-copper',cat: 'drinkware', title: 'แก้วทัมเบลอร์สแตนเลส โทนทองแดง',  brand: 'ChocoCRM' },
  { f: 'IMG_6643', slug: 'drink-bottle-gift',   cat: 'drinkware', title: 'ขวดน้ำพร้อมกล่องของขวัญ',          brand: 'jobsdb' },
  { f: 'IMG_6071', slug: 'drink-tumbler-white', cat: 'drinkware', title: 'แก้วทัมเบลอร์ฝาหลอด มินิมอล',      brand: 'NSC PR' },
  { f: 'IMG_6190', slug: 'drink-bottles-pair',  cat: 'drinkware', title: 'ขวดน้ำแก้วใสสกรีนโลโก้',           brand: '' },
  { f: 'IMG_6005', slug: 'cap-lenso',           cat: 'cap',       title: 'หมวกแก๊ปปักโลโก้',                 brand: 'LENSO' },
  { f: 'IMG_5984', slug: 'cap-duo',             cat: 'cap',       title: 'หมวกแก๊ปทรงพรีเมียม',              brand: 'LENSO · LION' },
  { f: 'IMG_6056', slug: 'bag-phoenix',         cat: 'bag',       title: 'กระเป๋าผ้าดีไซน์เฉพาะแบรนด์',      brand: 'Phoenix' },
  { f: 'IMG_6613', slug: 'bag-lingoace',        cat: 'bag',       title: 'กระเป๋าหูรูดดีไซน์สนุก',           brand: 'LingoAce Zoo', feature: true },
  { f: 'IMG_6487', slug: 'bag-duffel',          cat: 'bag',       title: 'กระเป๋า Duffel พร้อมเซ็ตของขวัญ',  brand: 'PBL',          feature: true },
  { f: 'IMG_6597', slug: 'umb-vora-red',        cat: 'umbrella',  title: 'ร่มพับสกรีนโลโก้รอบปลอก',          brand: 'VORACHAIYONT', feature: true },
  { f: 'IMG_6230', slug: 'umb-folded',          cat: 'umbrella',  title: 'ร่มพับทรงพรีเมียม',                brand: 'KYONT' },
  { f: 'IMG_6267', slug: 'note-choco',          cat: 'stationery',title: 'สมุดโน้ตปกสกรีนโลโก้',            brand: 'ChocoCRM' },
  { f: 'IMG_6302', slug: 'pen-teal',            cat: 'stationery',title: 'ปากกาโลหะสลักโลโก้',              brand: 'GO PREMIUM' },
  { f: 'IMG_5965', slug: 'pillow-grey',         cat: 'lifestyle', title: 'หมอนอิงสกรีนโลโก้แบรนด์',         brand: 'OMODA · JAECOO' },
  { f: 'IMG_5930', slug: 'pillow-cream',        cat: 'lifestyle', title: 'หมอนอิงปักโลโก้',                 brand: 'OMODA · JAECOO' },
  { f: 'IMG_6336', slug: 'gift-baankhanyt',     cat: 'giftset',   title: 'ชุดของขวัญงานหนังในกล่องไม้',      brand: 'BAANKHANYT',   feature: true },
  { f: 'IMG_6675', slug: 'gift-jobsdb',         cat: 'giftset',   title: 'เซ็ตของขวัญต้อนรับพนักงาน',         brand: 'jobsdb',       feature: true },
];

const HERO = 'IMG_6122'; // gold tumbler — on-brand

// free, tasteful enhancement
const enhance = (img) => img.rotate().modulate({ brightness: 1.045, saturation: 1.07 }).sharpen({ sigma: 0.7 });

async function emit(srcFile, outName, w, h, q = 80) {
  srcFile = srcFile + '.JPG';
  const out = path.join(OUT, outName);
  let buf = await enhance(sharp(path.join(SRC, srcFile)))
    .resize(w, h, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: q, mozjpeg: true }).toBuffer();
  // keep under ~170KB
  let qq = q;
  while (buf.length > 170 * 1024 && qq > 58) {
    qq -= 6;
    buf = await enhance(sharp(path.join(SRC, srcFile)))
      .resize(w, h, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: qq, mozjpeg: true }).toBuffer();
  }
  fs.writeFileSync(out, buf);
  return { outName, kb: Math.round(buf.length / 1024), q: qq };
}

const log = [];
// hero (portrait 4:5)
log.push(await emit(HERO, 'hero.jpg', 1040, 1300, 82));
// gallery cards (4:3) for all
for (const it of ITEMS) log.push(await emit(it.f, `${it.slug}.jpg`, 920, 690, 80));
// large feature (3:2) for features
for (const it of ITEMS.filter(i => i.feature)) log.push(await emit(it.f, `${it.slug}-lg.jpg`, 1280, 853, 82));

console.log(JSON.stringify(log, null, 0));
console.log('done:', log.length, 'files →', OUT);
fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(ITEMS, null, 2));
