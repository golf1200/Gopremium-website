import fs from 'node:fs';
const DIR = 'C:/Users/Golf/Documents/Claude/Projects/COWORK Agent/GoPremium-Platform/data/_raw';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const t = (s, n = 22) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const skuRe = /^[A-Z]{2,3}[-_]?\d{2,4}$/;

for (const f of files) {
  const v = JSON.parse(fs.readFileSync(`${DIR}/${f}`, 'utf8'));
  console.log(`\n========== ${f}  (${v.length} rows x ${(v[0]||[]).length} cols) ==========`);
  // print first 3 rows with column indices
  for (let r = 0; r < Math.min(3, v.length); r++) {
    const cells = (v[r] || []).map((c, i) => c !== '' && c != null ? `[${i}]${t(c)}` : null).filter(Boolean);
    console.log(`r${r}: ${cells.slice(0, 28).join(' ')}`);
  }
  // find SKU-like column
  const ncol = (v[0] || []).length;
  let best = { col: -1, n: 0, ex: [] };
  for (let c = 0; c < ncol; c++) {
    const vals = v.map(row => String(row[c] ?? '').trim()).filter(x => skuRe.test(x));
    if (vals.length > best.n) best = { col: c, n: vals.length, ex: [...new Set(vals)].slice(0, 6) };
  }
  if (best.n > 3) console.log(`  -> SKU-like col [${best.col}]: ${best.n} matches, eg ${best.ex.join(', ')}`);
  else console.log('  -> no SKU-like column (name-keyed)');
}
