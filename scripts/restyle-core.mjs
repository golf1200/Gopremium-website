// Shared restyle engine — the ONE prompt + gen/finish/icon used by both
// fal-studio.mjs (A/B compare) and restyle-batch.mjs (multi-image publish).
// Turns a real supplier photo into a GO PREMIUM catalogue studio shot and, in the
// same edit, removes Chinese/foreign text, supplier logos/watermarks, size codes,
// collages/montages/spec-sheets (-> one clean unit) and background clutter.
import { readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';

export const GEMINI_PRICE = 0.039;
export const FAL_MODELS = {
  'kontext-pro': { id: 'fal-ai/flux-pro/kontext',     price: 0.04 },
  'kontext-max': { id: 'fal-ai/flux-pro/kontext/max', price: 0.08 },
  'flux2-pro':   { id: 'fal-ai/flux-2-pro',           price: 0.03 },
};
export const ICON = 'C:/Users/Golf/Gopremium-website/Gopremium new version/Logo/GoPremium Icon logo - navy.png';

// load KEY=VALUE lines from .env into process.env (only if not already set)
export function loadEnv(repo) {
  try {
    for (const line of readFileSync(`${repo}/.env`, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
}

// ---- THE prompt: matches the live catalogue anchor + faithful, brand-safe edit ----
export const PROMPT =
  `Re-photograph this exact product as a high-end GO PREMIUM catalogue studio shot. ` +
  `STUDIO STYLE (match it precisely so the photo blends into the existing catalogue): ` +
  `a seamless warm off-white / soft cream studio backdrop, bright high-key and airy, ` +
  `soft diffused daylight from the upper-left, a soft natural contact shadow under the ` +
  `product, calm minimal-classic premium mood, no harsh ` +
  `shadows, no coloured light, generous negative space, slightly elevated three-quarter ` +
  `camera angle, square 1:1 framing, product centered and filling most of the frame.\n\n` +
  `CRITICAL COLOUR RULE: use neutral, accurate, true-to-life white balance. Reproduce the ` +
  `product's ORIGINAL colours EXACTLY as in the input photo — do NOT add any warm, yellow, ` +
  `amber or sepia tint to the product. The soft warm-cream tone is ONLY for the background ` +
  `backdrop, never on the product itself; the product must keep its real hue and saturation.\n\n` +
  `Keep the PRODUCT ITSELF faithful to the input: same shape, proportions, base ` +
  `COLOUR (identical hue/saturation), material and finish.\n\n` +
  `BRAND-SAFE RULES (anti-plagiarism — these are blank promo products):\n` +
  `• SINGLE UNIT: if the input shows the SAME product repeated (a colour montage, size ` +
  `line-up, wreath/collage, or supplier spec sheet), output ONLY ONE single clean ` +
  `representative unit as the hero — NEVER a collage, grid or multiple copies. ` +
  `(Exception: a product genuinely sold as a set/pair stays together.)\n` +
  `• WORN GARMENTS: if it is a wearable garment (apron/polo/shirt/jacket/cap) shown ON a ` +
  `person, KEEP it worn — but COMPLETELY REPLACE the person with a DIFFERENT, brand-new ` +
  `realistic THAI model. This must look like a totally different individual photographed in ` +
  `a separate session: change the FACE SHAPE, the HAIRSTYLE and hair length/colour, the ` +
  `apparent age, the body build, and the POSE so there is NO resemblance to the original ` +
  `person. Do NOT copy or lightly retouch the original face — regenerate it from scratch. ` +
  `The new model must be clearly recognisable as a different person side-by-side with the ` +
  `input. Do NOT strip the garment off and show it empty. Show it worn naturally. ` +
  `FRAMING: show the model's FULL HEAD and hair with comfortable empty headroom ABOVE the ` +
  `head — NEVER crop or cut off the top of the head, forehead or hair at the top edge; the ` +
  `whole head must sit inside the frame with space above it.\n` +
  `• CLIENT ARTWORK: if the product carries a CUSTOMER's printed logo/graphic/branded ` +
  `pattern (printed umbrella canopy, logo cushion), do NOT reproduce it. Replace with a ` +
  `SUBTLE NEUTRAL generic pattern (soft abstract/geometric, no real brand), keeping the ` +
  `BASE COLOUR EXACTLY the same. (Base colour = fabric/canopy/body colour; artwork = ` +
  `graphics on top — change only the artwork, never the colour.)\n` +
  `• BLANK = TRULY BLANK: if the product has no customer print, keep it COMPLETELY plain — ` +
  `absolutely NO logo, emblem, monogram, motif, pattern, text, letters or numbers anywhere ` +
  `on it. NEVER invent or add a logo/brand/design of your own.\n\n` +
  `REMOVE every distraction AND all text on/around the product: supplier logos/brand ` +
  `names/watermarks, contact info (LINE id, phone, QR), promo buttons, colour-swatch cards, ` +
  `printed/embossed words on the product itself (incl. generic words like "thank you", ` +
  `"Size S/L", size codes, measurements), foreign/Chinese/Thai overlay text, price tags, ` +
  `stickers, mannequins, stands, stray hands, background clutter — keep ONLY the bare ` +
  `product.\n` +
  `• UPRIGHT ORIENTATION: show the product STANDING in its natural upright display ` +
  `orientation. Bottles, tumblers, flasks, cups, mugs and jars must stand VERTICAL on ` +
  `their base — NEVER lying on their side, tipped over, fallen, floating or horizontal ` +
  `(unless the item genuinely has no upright form). If the source shows it lying down, ` +
  `re-orient it to stand upright like a normal e-commerce product hero.\n` +
  `Photorealistic, sharp focus, absolutely no text or watermark anywhere.`;

// navy gift icon, bottom-right, ~8.5% of frame (matches the live catalogue)
export async function loadIcon(noIcon = false) {
  if (noIcon || !existsSync(ICON)) return null;
  const target = Math.round(1000 * 0.085);
  const buf = await sharp(ICON).trim().resize({ width: target, height: target, fit: 'inside' }).png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, width: meta.width, height: meta.height };
}

// 1000x1000, add icon, jpeg — writes outPath (kept ≤170KB by quality 88)
export async function finish(rawBuf, outPath, iconBuf) {
  let base = await sharp(rawBuf).resize(1000, 1000, { fit: 'cover' }).toBuffer();
  if (iconBuf) {
    const margin = Math.round(1000 * 0.038);
    base = await sharp(base).composite([{ input: iconBuf.buf,
      top: 1000 - iconBuf.height - margin, left: 1000 - iconBuf.width - margin }]).toBuffer();
  }
  await sharp(base).jpeg({ quality: 88, progressive: true }).toFile(outPath);
}

export async function genGemini(srcPath) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const b64 = readFileSync(srcPath).toString('base64');
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ role: 'user', parts: [
      { inlineData: { mimeType: 'image/jpeg', data: b64 } }, { text: PROMPT }] }],
  });
  const part = (res?.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data);
  if (!part) throw new Error('gemini returned no image');
  return Buffer.from(part.inlineData.data, 'base64');
}

let falMod = null; const falImageUrlCache = {};
export async function genFal(srcPath, modelId, seed) {
  if (!falMod) { falMod = (await import('@fal-ai/client')).fal; falMod.config({ credentials: process.env.FAL_KEY }); }
  if (!falImageUrlCache[srcPath]) {
    falImageUrlCache[srcPath] = await falMod.storage.upload(new Blob([readFileSync(srcPath)], { type: 'image/jpeg' }));
  }
  const res = await falMod.subscribe(modelId, {
    input: { prompt: PROMPT, image_url: falImageUrlCache[srcPath], seed, num_images: 1, output_format: 'jpeg' },
    logs: false,
  });
  const url = res?.data?.images?.[0]?.url;
  if (!url) throw new Error('fal returned no image');
  return Buffer.from(await (await fetch(url)).arrayBuffer());
}
