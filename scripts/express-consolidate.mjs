// Consolidate the 6 vision-analysis JSONs into ONE process-manifest + reconcile table.
// - merges duplicate real EX ids (umbrellas across suppliers, etc.)
// - splits a few that are genuinely different models -> NEW
// - assigns new EX ids starting at EX082
// - resolves absolute hero/gallery paths from each folder's src_dir_abs
// Reads:  express-realphoto-2026/analysis/G*.json + packets_G*.json
// Writes: express-realphoto-2026/process-manifest.json  (for the python compositor)
//         express-realphoto-2026/reconcile.json         (full table for data update + master)
import fs from 'node:fs';
import path from 'node:path';

const BASE = path.resolve('express-realphoto-2026');
const A = path.join(BASE, 'analysis');
const groups = ['G1','G2','G3','G4','G5','G6'];

// folder -> src_dir_abs (from packets)
const srcDir = {};
for (const g of groups){
  const pk = JSON.parse(fs.readFileSync(path.join(BASE, `packets_${g}.json`),'utf8'));
  for (const f of pk.folders) srcDir[f.folder] = f.src_dir_abs;
}

// category slug normalisation -> website catSlug + label
const CAT = {
  garment:  {slug:'garment',   label:'Garment'},
  drinkware:{slug:'drinkware', label:'Drinkware'},
  hat:      {slug:'hat',       label:'Hat'},
  umbrella: {slug:'umbrella',  label:'Umbrella'},
  bag:      {slug:'bag',       label:'Bag'},
  lifestyle:{slug:'lifestyle', label:'Lifestyle'},
  powerbank:{slug:'powerbank', label:'Powerbank'},
  fan:      {slug:'fan',       label:'Mini Fan'},
};

// entries that LOOK like an existing id but are really a different model -> force NEW
const FORCE_NEW = new Set([
  'G2|แก้วกาแฟสแตนเลสหุ้มไม้ไผ่ มีหูจับ', // bamboo finish, distinct from EX037 metal
]);

let all = [];
for (const g of groups){
  const d = JSON.parse(fs.readFileSync(path.join(A, `${g}.json`),'utf8'));
  for (const s of d.skus){
    const key = `${g}|${s.proposed_name}`;
    let ex = s.ex_id;
    if (FORCE_NEW.has(key)) ex = 'NEW';
    if (ex === null || ex === undefined || ex === '' ) ex = 'NEW';
    const dir = srcDir[s.folder];
    const abs = (o)=> o && o.file ? path.join(dir, o.file) : null;
    all.push({
      g, ex, name: s.proposed_name, cat: s.category, folder: s.folder,
      hero_file: s.hero?.file, hero_abs: abs(s.hero), hero_is_group: !!s.hero_is_group,
      gallery_abs: (s.gallery||[]).map(abs).filter(Boolean),
      color_charts_abs: (s.color_charts||[]).map(abs).filter(Boolean),
      colors: s.colors||[], n_colors: s.n_colors||0,
      confidence: s.confidence||'', notes: s.notes||'',
    });
  }
}

// --- merge duplicate real EX ids ---
const byEx = new Map();
const news = [];
for (const e of all){
  if (e.ex === 'NEW'){ news.push(e); continue; }
  if (!byEx.has(e.ex)) byEx.set(e.ex, []);
  byEx.get(e.ex).push(e);
}
const merged = [];
for (const [ex, list] of byEx){
  if (list.length === 1){ merged.push(list[0]); continue; }
  // primary = non-group with max n_colors
  list.sort((a,b)=> (a.hero_is_group?1:0)-(b.hero_is_group?1:0) || b.n_colors-a.n_colors);
  const p = {...list[0]};
  for (const o of list.slice(1)){
    // fold extra hero+gallery as additional gallery (cap later), union colors
    if (o.hero_abs) p.gallery_abs.push(o.hero_abs);
    p.gallery_abs.push(...o.gallery_abs);
    p.color_charts_abs.push(...o.color_charts_abs);
    p.colors = Array.from(new Set([...p.colors, ...o.colors]));
    p.n_colors = Math.max(p.n_colors, o.n_colors);
    p.notes += ` | merged supplier-variant: ${o.folder}`;
  }
  p.gallery_abs = Array.from(new Set(p.gallery_abs)).slice(0,5);
  merged.push(p);
}

// --- assign new ids EX082+ (stable order: by category then group order) ---
const catOrder = ['drinkware','garment','hat','umbrella','bag','lifestyle','powerbank','fan'];
news.sort((a,b)=> catOrder.indexOf(a.cat)-catOrder.indexOf(b.cat));
let next = 82;
for (const e of news){ e.ex = 'EX'+String(next++).padStart(3,'0'); e.is_new = true; }

const final = [...merged, ...news];
// slug: existing keep ex+cat; build deterministically
for (const e of final){
  const cs = (CAT[e.cat]||CAT.lifestyle).slug;
  e.catSlug = cs; e.catLabel = (CAT[e.cat]||CAT.lifestyle).label;
  e.sku = e.ex;
  e.slug = `${e.ex.toLowerCase()}-${cs}`;
  e.gallery_abs = (e.gallery_abs||[]).slice(0,4);
}
// sort final by ex id num for readability
final.sort((a,b)=> Number(a.ex.slice(2))-Number(b.ex.slice(2)));

// process-manifest = only what the python compositor needs
const manifest = final.map(e=>({
  sku: e.sku, slug: e.slug, category: e.catSlug, name: e.name,
  hero_abs: e.hero_abs, hero_is_group: e.hero_is_group, gallery_abs: e.gallery_abs,
}));
fs.writeFileSync(path.join(BASE,'process-manifest.json'), JSON.stringify(manifest,null,1));
fs.writeFileSync(path.join(BASE,'reconcile.json'), JSON.stringify(final,null,1));

const newCount = final.filter(e=>e.is_new).length;
console.log(`FINAL SKUs: ${final.length}  (existing ${final.length-newCount}, NEW ${newCount})`);
const grp = final.filter(e=>e.hero_is_group).length;
console.log(`hero_is_group (contain, no rembg): ${grp}`);
const byCat = {};
for (const e of final) byCat[e.catSlug]=(byCat[e.catSlug]||0)+1;
console.log('by category:', JSON.stringify(byCat));
console.log('NEW ids:', final.filter(e=>e.is_new).map(e=>`${e.ex}:${e.name.slice(0,22)}`).join('\n  '));
