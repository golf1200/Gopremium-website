import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('src/data/products-raw.json', 'utf8'));
// Real curated product photos (71 SKUs). Un-mapped SKUs fall back to SVG mockup.
const gen = JSON.parse(fs.readFileSync('src/data/product-images.generated.json', 'utf8'));

// Cache-busting version for product image URLs. Filenames stay fixed but
// /images/* is served immutable for 1 year, so when images are regenerated in
// place we bump this to force browsers/CDN to fetch the new bytes. Bump on every
// in-place image refresh. (v2 = 2026-06-08 studio covers + cleaned galleries.)
const IMG_VER = '4'; // v4 = 2026-06-14 Express photos stamped with "YOUR LOGO" placeholder
const bust = (u) => (u ? u + '?v=' + IMG_VER : u);

// Public fields only (never cost / supplier / 1688)
const products = raw.map(p => {
  const gi = gen[p.sku];
  let img = null, gallery = null;
  if (gi && Array.isArray(gi.gallery) && gi.gallery.length) {
    img = bust(gi.gallery.find(g => g.includes('-square')) || gi.gallery[0]);
    gallery = gi.gallery.map(bust);
  }
  return {
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    cat: p.category,
    catSlug: p.category_slug,
    features: p.features || '',
    size: p.size || '',
    material: p.material || '',
    price: p.price_300_thb || null,
    tier: p.budget_tier || '',
    moq: p.moq || 50,
    logo: Array.isArray(p.free_logo) ? p.free_logo : [],
    logoMax: p.logo_max_cm || '',
    img,        // real photo (square) or null → mockup fallback
    gallery,    // full photo set for product page, or null
  };
});

// Category groups for the mega-menu / browse (mirrors the live site taxonomy)
const groups = [
  { group: 'เครื่องดื่ม', icon: '🥤', cats: ['drinkware'] },
  { group: 'กระเป๋า & เดินทาง', icon: '👜', cats: ['bags', 'luggage'] },
  { group: 'ออฟฟิศ & เครื่องเขียน', icon: '📝', cats: ['stationery'] },
  { group: 'เทคโนโลยี & แกดเจ็ต', icon: '⚡', cats: ['fan', 'powerbank', 'gadget'] },
  { group: 'ไลฟ์สไตล์ & ของใช้', icon: '✨', cats: ['lifestyle', 'kitchen', 'scent', 'garment', 'hat', 'pet', 'baby-kid', 'umbrella'] },
  { group: 'ของขวัญ & บรรจุภัณฑ์', icon: '🎁', cats: ['giftset', 'packaging', 'souvenir'] },
];

// Friendly Thai labels per category slug
const catLabels = {
  drinkware: 'แก้ว & กระบอกน้ำ', bags: 'กระเป๋า', luggage: 'กระเป๋าเดินทาง',
  stationery: 'เครื่องเขียน', fan: 'พัดลมพกพา', powerbank: 'พาวเวอร์แบงก์',
  gadget: 'แกดเจ็ต', lifestyle: 'ไลฟ์สไตล์', kitchen: 'ครัว & กล่องอาหาร',
  scent: 'กลิ่น & สมุนไพร', garment: 'เสื้อผ้า', hat: 'หมวก', pet: 'สัตว์เลี้ยง',
  'baby-kid': 'เด็ก & เบบี๋', giftset: 'กิฟต์เซ็ต', packaging: 'บรรจุภัณฑ์',
  souvenir: 'ของชำร่วย', umbrella: 'ร่ม',
};

const tierLabels = {
  value: 'Value (ไม่เกิน ฿60)', smart: 'Smart (฿61–150)',
  premium: 'Premium (฿151–300)', executive: 'Executive (฿300+)',
};

const out =
  'window.GP_PRODUCTS=' + JSON.stringify(products) + ';\n' +
  'window.GP_GROUPS=' + JSON.stringify(groups) + ';\n' +
  'window.GP_CATLABELS=' + JSON.stringify(catLabels) + ';\n' +
  'window.GP_TIERLABELS=' + JSON.stringify(tierLabels) + ';\n';

fs.writeFileSync('public/catalogue-data.js', out);
const withPhoto = products.filter(p => p.img).length;
console.log('wrote public/catalogue-data.js —', products.length, 'products (' + withPhoto + ' with real photos,', (products.length - withPhoto), 'mockup),', (out.length / 1024).toFixed(1), 'KB');
