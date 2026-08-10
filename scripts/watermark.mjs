// FREE faint GO PREMIUM watermark onto generated product images (sharp only).
// DEFAULT = "V3" (user's pick 2026-06-27): faint centered wordmark, navy on cream.
//
// Apply default V3 to one or more images (writes <stem>-wm.jpg):
//   node scripts/watermark.mjs img1.jpg img2.jpg [--out <dir>]
// Tune on the fly:
//   node scripts/watermark.mjs img.jpg --width 0.5 --opacity 0.09 --pos bottom
// Review the 3 placement options instead of applying:
//   node scripts/watermark.mjs img.jpg --variants
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGO = 'C:/Users/Golf/Gopremium-website/Gopremium new version/Logo/GoPremium Logo Navy.png';
const SIZE = 1000;

// ★ DEFAULT WATERMARK = V3 (chosen by user) — faint, centered.
const DEFAULT = { width: 0.55, opacity: 0.07, pos: 'center' };

const argv = process.argv.slice(2);
const flag = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const has = (k) => argv.includes(k);
const inputs = argv.filter(a => !a.startsWith('--') && /\.(jpe?g|png)$/i.test(a) && existsSync(a));
const outDir = flag('--out', null);
const width = parseFloat(flag('--width', DEFAULT.width));
const opacity = parseFloat(flag('--opacity', DEFAULT.opacity));
const position = flag('--pos', DEFAULT.pos);

if (!inputs.length) { console.error('pass at least one <image.jpg>'); process.exit(1); }

// fade a logo: scale to widthFrac of canvas, multiply its alpha by `op`
async function fadedLogo(widthFrac, op) {
  const w = Math.round(SIZE * widthFrac);
  const { data, info } = await sharp(LOGO).resize({ width: w }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * op);
  const buf = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  return { buf, w: info.width, h: info.height };
}
function place(name, W, H) {
  if (name === 'bottom')    return { left: Math.round((SIZE - W) / 2), top: SIZE - H - Math.round(SIZE * 0.12) };
  if (name === 'corner-br') { const m = Math.round(SIZE * 0.06); return { left: SIZE - W - m, top: SIZE - H - m }; }
  return { left: Math.round((SIZE - W) / 2), top: Math.round((SIZE - H) / 2) }; // center
}
async function stamp(baseBuf, wf, op, p) {
  const lg = await fadedLogo(wf, op);
  const { left, top } = place(p, lg.w, lg.h);
  return sharp(baseBuf).composite([{ input: lg.buf, left, top }]).jpeg({ quality: 88 }).toBuffer();
}
const baseOf = (input) => sharp(input).resize(SIZE, SIZE, { fit: 'cover' }).toBuffer();

async function main() {
  if (has('--variants')) {
    // review the 3 options on the first input only
    const input = inputs[0];
    const dir = outDir || join(__dirname, 'image-pipeline', 'staged', 'watermark-test');
    mkdirSync(dir, { recursive: true });
    const base = await baseOf(input);
    const stem = basename(input).replace(/\.(jpe?g|png)$/i, '');
    const VARS = [['v1-center-soft', 0.46, 0.10, 'center'], ['v2-bottom-soft', 0.40, 0.13, 'bottom'], ['v3-center-faint', 0.55, 0.07, 'center']];
    await sharp(base).jpeg({ quality: 88 }).toFile(join(dir, `${stem}-0-original.jpg`));
    const made = [['0-original', `${stem}-0-original.jpg`]];
    for (const [label, wf, op, p] of VARS) {
      writeFileSync(join(dir, `${stem}-${label}.jpg`), await stamp(base, wf, op, p));
      made.push([label, `${stem}-${label}.jpg`]);
    }
    const b64 = (f) => 'data:image/jpeg;base64,' + readFileSync(join(dir, f)).toString('base64');
    const cards = made.map(([l, f]) => `<figure><img src="${b64(f)}"><figcaption>${l}</figcaption></figure>`).join('');
    writeFileSync(join(dir, 'REVIEW-watermark.html'),
      `<!doctype html><meta charset=utf-8><style>body{background:#eceae4;font-family:system-ui;margin:0;padding:24px;color:#13244a}.grid{display:flex;gap:18px;flex-wrap:wrap}figure{margin:0;background:#fff;border-radius:12px;padding:10px}img{width:300px;height:300px;object-fit:cover;border-radius:8px;display:block}figcaption{text-align:center;font-size:13px;margin-top:6px}</style><h1>Watermark options (default = v3)</h1><div class=grid>${cards}</div>`);
    console.log('variants ->', join(dir, 'REVIEW-watermark.html'));
    return;
  }
  // APPLY default (V3) or tuned settings to every input
  console.log(`watermark: width=${width} opacity=${opacity} pos=${position} (default=V3)`);
  for (const input of inputs) {
    const base = await baseOf(input);
    const out = outDir
      ? (mkdirSync(outDir, { recursive: true }), join(outDir, basename(input).replace(/\.(jpe?g|png)$/i, '-wm.jpg')))
      : input.replace(/\.(jpe?g|png)$/i, '-wm.jpg');
    writeFileSync(out, await stamp(base, width, opacity, position));
    console.log('  wrote', out);
  }
}
main();
