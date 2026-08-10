/**
 * Map SKU -> product image gallery from the live website, patch master-lossless,
 * and emit images-map.json for the internal viewer app.
 */
import fs from 'node:fs';
const SITE='C:/Users/Golf/Documents/Claude/Projects/Gopremium Website LIVE/website';
const DATA='C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data';
const gen=JSON.parse(fs.readFileSync(`${SITE}/src/data/product-images.generated.json`,'utf8'));
const map={};
for(const sku of Object.keys(gen)){const g=gen[sku];const gallery=(g.gallery||[]).filter(Boolean);if(gallery.length)map[sku]={primary:gallery[0],gallery};}
fs.writeFileSync(`${DATA}/images-map.json`,JSON.stringify(map));

const m=JSON.parse(fs.readFileSync(`${DATA}/master-lossless.json`,'utf8'));
let filled=0,catNo=0,pipeNo=0;
for(const row of m.rows){const im=map[row.SKU];if(im){row['รูปภาพ(URL)']=im.primary;filled++;}
 else if(!row['รูปภาพ(URL)']){if(row['สถานะ'].startsWith('Active'))catNo++;else pipeNo++;}}
fs.writeFileSync(`${DATA}/master-lossless.json`,JSON.stringify(m));
console.log('image galleries available:',Object.keys(map).length);
console.log('master rows with image:',filled,'/',m.rows.length);
console.log('  catalog still no-image:',catNo,'| pipeline no-image:',pipeNo,'(pipeline = new, ต้องดึงจากชีต/ขอซัพ)');
