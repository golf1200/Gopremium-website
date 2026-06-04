// ============================================================
// GO PREMIUM — Image pipeline · Step 3: merge picks -> manifest
// Reads scripts/image-pipeline/picks/*.json (one per SKU, written
// by the curation agents) + inventory.json, and emits manifest.json
// with the authoritative ASCII base looked up by SKU.
//
//   picks/<sku>.json : { "sku":"GS001", "picks":[absPath, ...] }
// ============================================================
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PIPE = 'C:\\Users\\Golf\\Gopremium-website\\scripts\\image-pipeline';
const inv = JSON.parse(readFileSync(join(PIPE, 'inventory.json'), 'utf8'));
const bySku = Object.fromEntries(inv.filter((x) => x.sku).map((x) => [x.sku, x]));

const picksDir = join(PIPE, 'picks');
const manifest = [];
const problems = [];

for (const f of readdirSync(picksDir).filter((n) => n.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(picksDir, f), 'utf8'));
  const inq = bySku[data.sku];
  if (!inq) { problems.push(`${f}: sku ${data.sku} not in inventory`); continue; }
  const picks = (data.picks || []).filter(Boolean);
  if (picks.length === 0) { problems.push(`${f}: no picks`); continue; }
  // sanity: every pick path must exist in that SKU's inventory image list
  const known = new Set(inq.images);
  const bad = picks.filter((p) => !known.has(p));
  if (bad.length) problems.push(`${f}: ${bad.length} pick(s) not in inventory list`);
  manifest.push({
    sku: data.sku,
    base: inq.base,
    category: inq.category,
    model: inq.model,
    picks: picks.slice(0, 5),
  });
}

manifest.sort((a, b) => a.sku.localeCompare(b.sku));
writeFileSync(join(PIPE, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Merged ${manifest.length} SKUs into manifest.json`);
if (problems.length) { console.log('\nProblems:'); problems.forEach((p) => console.log('  ! ' + p)); }
