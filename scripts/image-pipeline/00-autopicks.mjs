// ============================================================
// GO PREMIUM — Image pipeline · Step 0: auto-picks
// Generates picks/<SKU>.json for every catalog SKU that has source
// photos in inventory.json but no HAND-CURATED pick file yet.
//
// Selection heuristic (cover = picks[0]):
//   1. numbered files (1.png, 2.png …) sorted NUMERICALLY  -> "1" is cover
//   2. hashed product shots (O1CN…-cib.jpg)                -> listed order
//   3. timestamp/banner files (e.g. 1748338134538.png)     -> deprioritized
//   4. screenshots (Screenshot …)                          -> last resort
// Takes up to 5 picks. Existing picks/*.json are NEVER overwritten,
// so manual curation (GS001-003, BG013, …) is preserved.
//
// Run:  node scripts/image-pipeline/00-autopicks.mjs
// ============================================================
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const PIPE = 'C:\\Users\\Golf\\Gopremium-website\\scripts\\image-pipeline';
const inv = JSON.parse(readFileSync(join(PIPE, 'inventory.json'), 'utf8'));
const raw = JSON.parse(
  readFileSync('C:\\Users\\Golf\\Gopremium-website\\src\\data\\products-raw.json', 'utf8')
);

const catalogSkus = new Set(
  raw.filter((p) => p.name && p.name.trim() && p.sku).map((p) => p.sku)
);
const picksDir = join(PIPE, 'picks');
const existing = new Set(
  readdirSync(picksDir)
    .filter((n) => n.endsWith('.json'))
    .map((n) => n.replace(/\.json$/, ''))
);

const NUM_RE = /^(\d{1,3})\.(png|jpe?g|webp)$/i;   // 1.png, 02.jpg
const TS_RE = /^\d{10,}/;                          // 1748338134538.png (epoch-ish)
const SHOT_RE = /^screenshot/i;                    // Screenshot 2568-…png

// rank: lower = better cover candidate
function rank(p) {
  const b = basename(p);
  if (NUM_RE.test(b)) return 0;
  if (SHOT_RE.test(b)) return 3;
  if (TS_RE.test(b)) return 2;
  return 1; // hashed product shot / other
}
function numOf(p) {
  const m = basename(p).match(NUM_RE);
  return m ? parseInt(m[1], 10) : Infinity;
}

let written = 0,
  skipped = 0;
const summary = [];

for (const entry of inv) {
  if (!entry.sku) continue;
  if (!catalogSkus.has(entry.sku)) continue;     // not a real catalog product
  if (!entry.images || entry.images.length === 0) continue;
  if (existing.has(entry.sku)) { skipped++; continue; } // preserve curation

  const ordered = [...entry.images].sort((a, b) => {
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    if (ra === 0) return numOf(a) - numOf(b);     // numeric order within numbered
    return a.localeCompare(b);                    // stable for the rest
  });

  const picks = ordered.slice(0, 5);
  writeFileSync(
    join(picksDir, `${entry.sku}.json`),
    JSON.stringify({ sku: entry.sku, picks, _auto: true }, null, 2),
    'utf8'
  );
  written++;
  summary.push(`${entry.sku} <- ${basename(picks[0])} (+${picks.length - 1})`);
}

console.log(`Auto-picks written: ${written}`);
console.log(`Preserved (already curated): ${skipped}`);
console.log('');
summary.forEach((s) => console.log('  ' + s));
