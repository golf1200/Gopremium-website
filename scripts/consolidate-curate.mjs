// Consolidate the 10 per-supplier curate-*.json into one master proposal.
// Owner-priority: each SKU is taken from its assigned supplier file; stray
// picks of the same SKU by other agents are ignored. Reports coverage + gaps.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'express-realphoto-2026');

// SKU owner = the file that is authoritative for that SKU
const OWNER = {
  'curate-samarn-shirt.json':       ['EX001','EX002','EX003'],
  'curate-love-bottle.json':        ['EX004','EX005','EX006'],
  'curate-remax.json':              ['EX020','EX021','EX022','EX023','EX024','EX110','EX111'],
  'curate-mpkj-bags.json':          ['EX056','EX057','EX095','EX096','EX097','EX098','EX099','EX100'],
  'curate-pmk.json':                ['EX042','EX044','EX045','EX046','EX047','EX048','EX049','EX050','EX051','EX052','EX053','EX054','EX055','EX076','EX077','EX078','EX079','EX080','EX081','EX090','EX091','EX092','EX093'],
  'curate-homescreen-hats.json':    ['EX008','EX009','EX043','EX062','EX063','EX064','EX065'],
  'curate-newfly-umbrella.json':    ['EX010','EX011','EX012','EX013','EX014','EX015','EX016','EX017','EX018','EX019','EX066','EX067','EX068','EX069','EX070','EX071','EX072','EX073','EX074'],
  'curate-siribuathong-umbrella.json':['EX058','EX059'],
  'curate-raka-umbrella.json':      ['EX060','EX061','EX094'],
  'curate-pamatoy-lifestyle.json':  ['EX007','EX101','EX102','EX103','EX104','EX105','EX106','EX107','EX108','EX109'],
};

const detail = JSON.parse(readFileSync(join(DIR, 'express-skus-detail.json'), 'utf8'));
const allExpress = detail.map(d => d.sku);
const nameOf = Object.fromEntries(detail.map(d => [d.sku, d.name]));
const slugOf = Object.fromEntries(detail.map(d => [d.sku, d.slug]));
const colorsOf = Object.fromEntries(detail.map(d => [d.sku, d.nColors]));

const master = {};      // SKU -> {supplier, slug, name, nColors, images:[{order,role,driveFileId,title,note}]}
const flags = [];

for (const [file, skus] of Object.entries(OWNER)) {
  let j;
  try { j = JSON.parse(readFileSync(join(DIR, file), 'utf8')); }
  catch (e) { flags.push(`${file}: unreadable (${e.message})`); continue; }
  if (Array.isArray(j.flags)) flags.push(...j.flags.map(f => `[${j.supplier}] ${f}`));
  for (const sku of skus) {
    const imgs = (j.skus && j.skus[sku]) || [];
    if (imgs.length) {
      master[sku] = { supplier: j.supplier, slug: slugOf[sku], name: nameOf[sku],
        nColors: colorsOf[sku], images: imgs.map(x => ({ order: x.order, role: x.role,
          driveFileId: x.driveFileId, title: x.title, note: x.note })) };
    }
  }
}

// coverage
const covered = Object.keys(master).sort();
const notCovered = allExpress.filter(s => !master[s]).sort();
const totalImgs = covered.reduce((n, s) => n + master[s].images.length, 0);

const out = { generated: 'consolidate-curate', counts: {
  expressTotal: allExpress.length, covered: covered.length,
  notCovered: notCovered.length, totalImages: totalImgs },
  notCoveredSkus: notCovered, master, flags };
writeFileSync(join(DIR, 'curate-master.json'), JSON.stringify(out, null, 1));

console.log(`covered ${covered.length}/${allExpress.length} SKUs, ${totalImgs} images total`);
console.log('NOT covered (need supplier photos):', notCovered.join(',') || '(none)');
console.log('flags:', flags.length);
// per-supplier coverage
const bySup = {};
for (const s of covered) { const k = master[s].supplier; (bySup[k] = bySup[k] || []).push(s + '(' + master[s].images.length + ')'); }
for (const k of Object.keys(bySup)) console.log('  ' + k + ': ' + bySup[k].join(' '));
