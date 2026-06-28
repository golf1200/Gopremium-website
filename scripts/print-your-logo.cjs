// ============================================================
// GO PREMIUM — print a realistic "YOUR LOGO" mock-up onto Express product photos
// ------------------------------------------------------------
// Looks like the wordmark is actually PRINTED on the material (not a sticker badge):
//   - no dashed box; clean one-colour wordmark lockup
//   - ink colour auto-picked from the surface luminance (white ink on dark, navy on light)
//   - blends INTO the material: fabric -> multiply/screen (absorbed); hard glossy -> crisp screen-print
//   - cylinders (bottle/tumbler/fan) -> text on a shallow arc (wraps the curve)
//   - umbrella -> tilted to the canopy panel (rot from coords)
//
//   node scripts/print-your-logo.cjs [coords.json] [--review <dir>] [--sku EX004] [--dry]
//
// Default coords = scripts/_logo-coords.json. Live mode writes to public/ from the clean
// backup (idempotent). --review writes before/after pairs into <dir> and builds review.html
// WITHOUT touching the live files.
// ============================================================
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.resolve(__dirname, '..', 'public');
const BACKUP_ROOT = path.resolve(__dirname, '..', 'express-logo-backup');

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const reviewIdx = args.indexOf('--review');
const REVIEW = reviewIdx >= 0 ? path.resolve(args[reviewIdx + 1]) : null;
const skuIdx = args.indexOf('--sku');
const ONLY_SKU = skuIdx >= 0 ? args[skuIdx + 1].toLowerCase() : null;
const coordsPath = args.find(a => a.endsWith('.json')) || path.join(__dirname, '_logo-coords.json');
const coords = JSON.parse(fs.readFileSync(coordsPath, 'utf8'));

const NAVY = '#13244a';
const WHITE = '#ffffff';
// GO PREMIUM gift-box brand watermark (bottom-right), cropped from the lockup.
// Only stamped where a coord has `watermark:true` (the express covers that lack the
// baked-in mark); the brand '-square' masters already carry it.
const WATERMARK = path.join(__dirname, '_giftbox-navy.png');

// ---- surface model per category (parsed from path ex###-CATEGORY) ----
function surfaceOf(rel) {
  // umbrella canopy tilts away from the camera -> always perspective-warp, regardless of
  // SKU prefix (ex###-umbrella OR catalogue um###-… which the ex-regex would miss).
  if (/umbrella/i.test(rel)) return { kind: 'fabric', persp: true };
  const cat = (rel.match(/ex\d+-([a-z]+)/) || [, ''])[1];
  switch (cat) {
    case 'drinkware': return { kind: 'hard', persp: false };   // glossy cylinder, crisp screen/UV print
    case 'fan':       return { kind: 'hard', persp: false };   // plastic handle
    case 'powerbank': return { kind: 'hard', persp: false };   // flat glossy face
    case 'umbrella':  return { kind: 'fabric', persp: true };  // canopy panel tilts away -> perspective warp
    case 'garment':   return { kind: 'fabric', persp: false };
    case 'bags':      return { kind: 'fabric', persp: false };
    case 'hat':       return { kind: 'fabric', persp: false };
    default:          return { kind: 'fabric', persp: false };
  }
}

// ---- frameless wordmark: a single clean "Your Logo" line, NO box / NO brackets. ----
// Reads like the wordmark is actually screen-printed on the material: solid opaque ink
// in the colour that best contrasts the surface, plus a soft opposite-colour halo so it
// stays legible on busy fabric. The svg width == w (the requested wordmark width) and the
// font size is derived from w so "Your Logo" always fits exactly.
function logoSvg(w, ink, shadow) {
  const fsMain = Math.round(w * 0.175);            // "Your Logo" single line
  const padY = Math.round(fsMain * 0.45);
  const padX = Math.round(w * 0.06);               // side padding so glyphs+shadow never touch the edge
  const h = fsMain + padY * 2;
  const yMain = Math.round(h / 2);
  const sd = Math.max(2, Math.round(fsMain * 0.11));
  // FIX (2026-06-27): the text used to render slightly WIDER than the svg viewport (width=w),
  // so the centred "Your Logo" got clipped at both edges — the trailing "o" most visibly.
  // Lock the rendered advance to (w - 2*padX) with textLength so it always fits with margin.
  const tl = w - padX * 2;

  return Buffer.from(
`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><filter id="g" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="0" stdDeviation="${sd}" flood-color="${shadow}" flood-opacity="0.6"/>
  </filter></defs>
  <text x="50%" y="${yMain}" dominant-baseline="middle" text-anchor="middle" filter="url(#g)"
        font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${fsMain}"
        textLength="${tl}" lengthAdjust="spacingAndGlyphs" fill="${ink}">Your Logo</text>
</svg>`);
}

// ---- mean colour + luminance of a region in the source image (to pick ink colour) ----
async function regionStats(img, W, H, left, top, w, h) {
  const x = Math.max(0, Math.min(W - 1, left));
  const y = Math.max(0, Math.min(H - 1, top));
  const ww = Math.max(1, Math.min(W - x, w));
  const hh = Math.max(1, Math.min(H - y, h));
  // NOTE: .extract().stats() reports stats for the WHOLE image, not the crop.
  // Materialise the crop to a buffer first so stats() sees only the region.
  const crop = await sharp(img).extract({ left: x, top: y, width: ww, height: hh }).toBuffer();
  const st = await sharp(crop).stats();
  const [r, g, b] = st.channels.map(c => c.mean);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const sat = mx > 0 ? (mx - mn) / mx : 0;   // 0 = neutral grey, ->1 = vivid colour
  return { luma, sat };
}

// pick ink so the wordmark always contrasts AND reads like a real print
function pickInk(luma, sat) {
  if (sat >= 0.20 && luma < 205) return WHITE;  // saturated colour (red tee, green umbrella) -> white print
  return luma >= 150 ? NAVY : WHITE;            // light surface -> navy, dark -> white (max contrast)
}
const SHADOW = { '#13244a': '#ffffff', '#ffffff': '#0a1424' };

// ===== perspective warp (lay the mark onto a tilted panel, e.g. an umbrella canopy) =====
// Solve 8-param homography mapping `from` 4 pts -> `to` 4 pts (x'=(ax+by+c)/(gx+hy+1), ...).
function solveHomography(from, to) {
  const A = [], B = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = from[i], [X, Y] = to[i];
    A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); B.push(X);
    A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); B.push(Y);
  }
  const n = 8;
  for (let i = 0; i < n; i++) {
    let p = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k;
    [A[i], A[p]] = [A[p], A[i]]; [B[i], B[p]] = [B[p], B[i]];
    const d = A[i][i] || 1e-9;
    for (let j = i; j < n; j++) A[i][j] /= d; B[i] /= d;
    for (let k = 0; k < n; k++) if (k !== i) { const f = A[k][i]; for (let j = i; j < n; j++) A[k][j] -= f * A[i][j]; B[k] -= f * B[i]; }
  }
  return B; // [a,b,c,d,e,f,g,h]
}

// Build the destination quad for an overlay (ow x oh) centred at (cx,cy) of a W x H image:
// top edge recedes (narrower + slightly shorter) = foreshortening toward the canopy apex,
// then rotate by rotDeg (clockwise) to follow the panel slope.
function panelQuad(cx, cy, W, H, ow, oh, rotDeg, tilt) {
  const hw = ow / 2, hh = oh / 2;
  let pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];       // TL,TR,BR,BL
  pts = pts.map(([x, y], i) => (i < 2) ? [x * (1 - tilt), y * (1 - tilt * 0.45)] : [x, y]);
  const a = rotDeg * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
  const ccx = cx * W, ccy = cy * H;
  return pts.map(([x, y]) => [ccx + x * cs - y * sn, ccy + x * sn + y * cs]);
}

// Warp the overlay SVG into the quad; returns a raw RGBA region ready to composite.
async function perspWarp(svgBuf, ow, oh, quad, W, H, alphaScale) {
  const { data } = await sharp(svgBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const xs = quad.map(p => p[0]), ys = quad.map(p => p[1]);
  let L = Math.max(0, Math.floor(Math.min(...xs))), T = Math.max(0, Math.floor(Math.min(...ys)));
  let R = Math.min(W, Math.ceil(Math.max(...xs))), Bm = Math.min(H, Math.ceil(Math.max(...ys)));
  const Wd = Math.max(1, R - L), Hd = Math.max(1, Bm - T);
  const Hm = solveHomography(quad, [[0, 0], [ow, 0], [ow, oh], [0, oh]]);  // image px -> overlay px
  const [a, b, c, d, e, f, g, h] = Hm;
  const out = Buffer.alloc(Wd * Hd * 4, 0);
  for (let py = 0; py < Hd; py++) {
    for (let px = 0; px < Wd; px++) {
      const X = L + px + 0.5, Y = T + py + 0.5;
      const w = g * X + h * Y + 1;
      const u = (a * X + b * Y + c) / w, v = (d * X + e * Y + f) / w;
      if (u < 0 || v < 0 || u >= ow - 1 || v >= oh - 1) continue;
      const x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0;
      const o = (py * Wd + px) * 4;
      for (let ch = 0; ch < 4; ch++) {
        const i00 = data[(y0 * ow + x0) * 4 + ch], i10 = data[(y0 * ow + x0 + 1) * 4 + ch];
        const i01 = data[((y0 + 1) * ow + x0) * 4 + ch], i11 = data[((y0 + 1) * ow + x0 + 1) * 4 + ch];
        const tp = i00 + (i10 - i00) * fx, bt = i01 + (i11 - i01) * fx;
        let val = tp + (bt - tp) * fy;
        if (ch === 3 && alphaScale) val *= alphaScale;
        out[o + ch] = Math.round(val);
      }
    }
  }
  return { data: out, width: Wd, height: Hd, left: L, top: T };
}

async function renderOne(c) {
  const abs = path.join(PUBLIC, c.rel);
  // `out` (optional) = write the result to a DIFFERENT path (a homepage-only copy),
  // leaving the shared catalogue source `rel` untouched. Without it, writes in-place.
  const dest = path.join(PUBLIC, c.out || c.rel);
  const backup = path.join(BACKUP_ROOT, c.rel);
  // ensure clean backup exists
  if (!fs.existsSync(backup) && fs.existsSync(abs)) {
    fs.mkdirSync(path.dirname(backup), { recursive: true });
    if (!DRY) fs.copyFileSync(abs, backup);
  }
  const source = fs.existsSync(backup) ? backup : abs;
  if (!fs.existsSync(source)) { console.error('MISSING', c.rel); return null; }

  const surf = surfaceOf(c.rel);
  const meta = await sharp(source).metadata();
  const W = meta.width, H = meta.height;
  const bw = Math.max(80, Math.round(W * c.w));
  const bhApprox = Math.round(bw * 0.32);   // for the colour-sampling window only

  // pick ink from what is actually under the wordmark (sample a tight central window,
  // so we don't catch the floor/edges around the product)
  const sw = Math.round(bw * 0.55), sh = Math.round(bhApprox * 0.7);
  const sl = Math.round(c.cx * W - sw / 2), stp = Math.round(c.cy * H - sh / 2);
  const { luma, sat } = await regionStats(source, W, H, sl, stp, sw, sh);
  // optional per-coord override ("navy" | "white") when auto-pick misjudges a
  // saturated surface (e.g. bright-yellow tote where white would be low-contrast)
  const ink = c.ink === 'navy' ? NAVY : c.ink === 'white' ? WHITE : pickInk(luma, sat);

  // Solid, opaque print (clear screen-print look, never a faint watermark).
  const blend = 'over';
  const svgBuf = logoSvg(bw, ink, SHADOW[ink]);
  const om = await sharp(svgBuf).metadata();
  const ow = om.width, oh = om.height;

  let comp;
  if (surf.persp) {
    // umbrella: warp onto the tilted canopy panel (true perspective) + 95% opacity
    const quad = panelQuad(c.cx, c.cy, W, H, ow, oh, c.rot || 0, 0.20);
    const wrp = await perspWarp(svgBuf, ow, oh, quad, W, H, 0.95);
    comp = { input: wrp.data, raw: { width: wrp.width, height: wrp.height, channels: 4 }, left: wrp.left, top: wrp.top, blend };
  } else {
    // flat surfaces: optional in-plane rotation only
    let overlay = sharp(svgBuf).png(); let rw = ow, rh = oh;
    if (c.rot) {
      const rot = await overlay.rotate(c.rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
      const rm = await sharp(rot).metadata(); overlay = sharp(rot); rw = rm.width; rh = rm.height;
    }
    let left = Math.max(0, Math.min(W - rw, Math.round(c.cx * W - rw / 2)));
    let top = Math.max(0, Math.min(H - rh, Math.round(c.cy * H - rh / 2)));
    comp = { input: await overlay.toBuffer(), left, top, blend };
  }
  const composites = [comp];
  let wm = false;
  if (c.watermark) {
    const wmW = Math.round(W * 0.10);                       // ~10% of width, matches masters
    const wmBuf = await sharp(WATERMARK).resize({ width: wmW }).toBuffer();
    const wmH = (await sharp(wmBuf).metadata()).height;
    const margin = Math.round(W * 0.025);
    composites.push({ input: wmBuf, left: W - wmW - margin, top: H - wmH - margin });
    wm = true;
  }
  const out = await sharp(source).composite(composites).jpeg({ quality: 90 }).toBuffer();
  return { abs: dest, source, out, ink: ink === NAVY ? 'navy' : 'white', blend, luma: Math.round(luma), surf: surf.kind, persp: !!surf.persp, wm };
}

(async () => {
  let done = 0, skipped = 0, errors = 0;
  const reviewRows = [];
  if (REVIEW && !DRY) fs.mkdirSync(REVIEW, { recursive: true });

  for (const c of coords) {
    if (ONLY_SKU && !c.rel.includes(ONLY_SKU)) continue;
    if (c.place === false) {
      if (!REVIEW && !DRY && fs.existsSync(path.join(BACKUP_ROOT, c.rel)))
        fs.copyFileSync(path.join(BACKUP_ROOT, c.rel), path.join(PUBLIC, c.rel));
      skipped++; continue;
    }
    try {
      const r = await renderOne(c);
      if (!r) { errors++; continue; }
      if (REVIEW) {
        const base = c.rel.replace(/[\/]/g, '__').replace(/^__/, '');
        const beforeName = 'before__' + base, afterName = 'after__' + base;
        if (!DRY) {
          fs.copyFileSync(r.source, path.join(REVIEW, beforeName));
          fs.writeFileSync(path.join(REVIEW, afterName), r.out);
        }
        reviewRows.push({ rel: c.rel, beforeName, afterName, ...r, note: c.note });
      } else if (!DRY) {
        fs.mkdirSync(path.dirname(r.abs), { recursive: true });
        await sharp(r.out).toFile(r.abs);
      }
      console.log('print', c.rel, `ink=${r.ink} blend=${r.blend} luma=${r.luma}${r.persp ? ' persp' : ''}`);
      done++;
    } catch (e) { errors++; console.error('ERROR', c.rel, e.message); }
  }

  if (REVIEW && !DRY) {
    const cards = reviewRows.map(r => `
      <div class="card">
        <div class="pair">
          <figure><img src="${r.beforeName}"><figcaption>before</figcaption></figure>
          <figure><img src="${r.afterName}"><figcaption>after (printed)</figcaption></figure>
        </div>
        <div class="meta"><b>${r.rel.split('/').pop()}</b> · ink ${r.ink} · ${r.blend} · luma ${r.luma} · ${r.surf}${r.persp ? ' · persp' : ''}<br><span>${r.note || ''}</span></div>
      </div>`).join('');
    const html = `<!doctype html><meta charset="utf-8"><title>YOUR LOGO — printed mock-up review</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;background:#f5f3ee;margin:0;padding:24px;color:#13244a}
    h1{font-size:20px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:18px}
    .card{background:#fff;border-radius:12px;padding:10px;box-shadow:0 2px 8px rgba(0,0,0,.07)}
    .pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pair img{width:100%;border-radius:8px;display:block}
    figcaption{font-size:11px;text-align:center;color:#888;margin-top:4px}
    .meta{font-size:12px;margin-top:8px;line-height:1.5}.meta span{color:#888}</style>
    <h1>GO PREMIUM — realistic “YOUR LOGO” print · ${reviewRows.length} images</h1>
    <div class="grid">${cards}</div>`;
    fs.writeFileSync(path.join(REVIEW, 'review.html'), html);
    console.log('\nReview written:', path.join(REVIEW, 'review.html'));
  }
  console.log(`\nDone${DRY ? ' (dry)' : ''}${REVIEW ? ' (review)' : ' (LIVE)'}: printed=${done} skipped=${skipped} errors=${errors}`);
})();
