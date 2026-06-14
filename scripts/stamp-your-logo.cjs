// ============================================================
// GO PREMIUM — stamp "YOUR LOGO" placeholder onto Express product photos
// ------------------------------------------------------------
// Idempotent: the first run copies each original into BACKUP_ROOT, and every
// run composites onto the CLEAN backup -> writes to the live file. Re-running
// with adjusted coordinates never stacks stamps.
//
//   node scripts/stamp-your-logo.cjs <coords.json> [--dry]
//
// coords.json: [{ rel, place, cx, cy, w, rot?, note? }, ...]
//   rel  : public-relative image path (matches express-images.json)
//   place: false -> skip (e.g. multi-item group shots)
//   cx,cy: screening-center as fraction of image (0..1)
//   w    : badge width as fraction of image width (0..1)
//   rot  : optional degrees (clockwise) for angled print surfaces
// ============================================================
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.resolve(__dirname, '..', 'public');
const BACKUP_ROOT = path.resolve(__dirname, '..', 'express-logo-backup');

const coordsPath = process.argv[2];
const DRY = process.argv.includes('--dry');
if (!coordsPath) { console.error('usage: node stamp-your-logo.cjs <coords.json> [--dry]'); process.exit(1); }
const coords = JSON.parse(fs.readFileSync(coordsPath, 'utf8'));

function badgeSvg(w, h) {
  const fs1 = Math.round(h * 0.30);
  const fs2 = Math.round(h * 0.20);
  const r = Math.round(Math.min(w, h) * 0.12);
  const sw = Math.max(2, Math.round(h * 0.045));
  const dash = Math.round(h * 0.13);
  return Buffer.from(
`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="1" stdDeviation="${Math.max(1,Math.round(h*0.03))}" flood-color="#000" flood-opacity="0.35"/>
  </filter></defs>
  <rect x="${sw}" y="${sw}" width="${w-2*sw}" height="${h-2*sw}" rx="${r}" ry="${r}"
        fill="rgba(255,255,255,0.82)" stroke="#0f2a4a" stroke-width="${sw}"
        stroke-dasharray="${dash} ${Math.round(dash*0.7)}" filter="url(#s)"/>
  <text x="50%" y="42%" dominant-baseline="central" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="700"
        font-size="${fs1}" fill="#0f2a4a" letter-spacing="1">YOUR LOGO</text>
  <text x="50%" y="70%" dominant-baseline="central" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="500"
        font-size="${fs2}" fill="#0f2a4a" opacity="0.7" letter-spacing="2">โลโก้คุณตรงนี้</text>
</svg>`);
}

(async () => {
  let stamped = 0, skipped = 0, errors = 0;
  for (const c of coords) {
    const abs = path.join(PUBLIC, c.rel);
    if (!fs.existsSync(abs)) { console.error('MISSING', c.rel); errors++; continue; }

    // 1) ensure a clean backup of the original exists
    const backup = path.join(BACKUP_ROOT, c.rel);
    if (!fs.existsSync(backup)) {
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      if (!DRY) fs.copyFileSync(abs, backup);
    }
    const source = fs.existsSync(backup) ? backup : abs;

    if (c.place === false) {
      // restore clean original (in case a prior run stamped it), then leave alone
      if (!DRY && fs.existsSync(backup)) fs.copyFileSync(backup, abs);
      skipped++; console.log('skip ', c.rel, c.note ? '(' + c.note + ')' : '');
      continue;
    }

    try {
      const meta = await sharp(source).metadata();
      const W = meta.width, H = meta.height;
      const bw = Math.max(70, Math.round(W * c.w));
      const bh = Math.round(bw * 0.46);
      let overlay = sharp(badgeSvg(bw, bh)).png();
      let ow = bw, oh = bh;
      if (c.rot) {
        const rotated = await overlay.rotate(c.rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
        const rm = await sharp(rotated).metadata();
        overlay = sharp(rotated); ow = rm.width; oh = rm.height;
      }
      let left = Math.round(c.cx * W - ow / 2);
      let top = Math.round(c.cy * H - oh / 2);
      left = Math.max(0, Math.min(W - ow, left));
      top = Math.max(0, Math.min(H - oh, top));
      const ovBuf = await overlay.toBuffer();
      if (!DRY) {
        await sharp(source).composite([{ input: ovBuf, left, top }]).jpeg({ quality: 88 }).toFile(abs);
      }
      stamped++; console.log('stamp', c.rel, `cx=${c.cx} cy=${c.cy} w=${c.w}${c.rot?' rot='+c.rot:''}`);
    } catch (e) {
      errors++; console.error('ERROR', c.rel, e.message);
    }
  }
  console.log(`\nDone${DRY?' (dry)':''}: stamped=${stamped} skipped=${skipped} errors=${errors}`);
})();
