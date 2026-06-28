#!/usr/bin/env python3
# ============================================================
# GO PREMIUM - AUTO logo placement
# New logic: DETECT the product (rembg -> largest blob -> bbox), then place
# "Your Logo" RELATIVE TO THE PRODUCT (not the whole image). One rule per
# category works on any photo regardless of how big/where the product sits.
#   - position: rx,ry  = fraction WITHIN the product's bounding box
#   - size:     rw     = logo width as fraction of the product's WIDTH
#   - tilt:     rot=0, or auto_rot=True -> use the product's principal axis (PCA)
#
#   python scripts/auto-logo.py [--apply]    (default = preview into ../MARKETING/.../_auto-preview)
# ============================================================
import sys, os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy import ndimage
from rembg import remove, new_session

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # website/
PUBLIC = os.path.join(ROOT, 'public')
BACKUP = os.path.join(ROOT, 'express-logo-backup')
PREVIEW = os.path.abspath(os.path.join(ROOT, '..', 'MARKETING', 'logo-placement-reference', '_auto-preview'))
GIFTBOX = os.path.join(os.path.dirname(os.path.abspath(__file__)), '_giftbox-navy.png')
FONT_PATH = 'C:/Windows/Fonts/arialbd.ttf'
NAVY = (19, 36, 74); WHITE = (255, 255, 255)
APPLY = '--apply' in sys.argv

# Per-cover config. rx/ry/rw are RELATIVE TO THE DETECTED PRODUCT BBOX.
# (rule of thumb per category baked in; tweak one row and it holds for any photo of that type.)
COVERS = [
  # rel(source under public or backup), out, rx, ry, rw, rot, auto_rot, ink, watermark
  {"rel":"images/products/dw006-milo/dw006-milo-square.jpg","out":"images/home/covers/dw006-milo-square.jpg",
   "rx":0.40,"ry":0.45,"rw":0.46,"ink":"auto","note":"mug: body left-of-handle, upper-mid"},
  {"rel":"images/products/dw001-loopa/dw001-loopa-square.jpg","out":"images/home/covers/dw001-loopa-square.jpg",
   "rx":0.50,"ry":0.52,"rw":0.42,"ink":"auto","note":"bottle: body centre"},
  {"rel":"images/products/bg003-everyday/bg003-everyday-square.jpg","out":"images/home/covers/bg003-everyday-square.jpg",
   "rx":0.48,"ry":0.62,"rw":0.52,"ink":"auto","note":"tote: front panel centre, lower-mid"},
  {"rel":"images/products/bg007-rin/bg007-rin-square.jpg","out":"images/home/covers/bg007-rin-square.jpg",
   "rx":0.50,"ry":0.60,"rw":0.55,"ink":"auto","note":"jute tote: front panel centre"},
  {"rel":"images/products/st007-folio/st007-folio-square.jpg","out":"images/home/covers/st007-folio-square.jpg",
   "rx":0.40,"ry":0.42,"rw":0.42,"ink":"auto","note":"notebook: cover centre, clear of strap"},
  {"rel":"images/products/gs003-business-executive/gs003-business-executive-square.jpg","out":"images/home/covers/gs003-business-executive-square.jpg",
   "rx":0.27,"ry":0.40,"rw":0.20,"ink":"auto","note":"giftset: hero notebook upper cover (left item)"},
  {"rel":"images/products/ls012-smart-grip-flex/ls012-smart-grip-flex-square.jpg","out":"images/home/covers/ls012-smart-grip-flex-square.jpg",
   "rx":0.50,"ry":0.57,"rw":0.46,"auto_rot":True,"ink":"auto","note":"card-holder: below cutout, tilt follows the stand"},
  {"rel":"images/products/ex023-fan/ex023-fan-square.jpg","out":"images/home/covers/ex023-fan-square.jpg",
   "rx":0.50,"ry":0.68,"rw":0.30,"ink":"auto","watermark":True,"note":"fan: handle body (lower)"},
]

session = new_session("u2net")

def source_path(rel):
    b = os.path.join(BACKUP, rel)
    return b if os.path.exists(b) else os.path.join(PUBLIC, rel)

def product_mask_bbox(img_rgb):
    """rembg -> alpha -> largest connected blob -> (mask, bbox x0,y0,x1,y1)."""
    cut = remove(img_rgb, session=session)            # RGBA
    alpha = np.array(cut.split()[-1])
    binm = alpha > 110
    lbl, n = ndimage.label(binm)
    if n == 0:
        h, w = binm.shape; return binm, (0, 0, w, h)
    sizes = ndimage.sum(np.ones_like(lbl), lbl, range(1, n + 1))
    big = (np.argmax(sizes) + 1)
    comp = lbl == big
    ys, xs = np.where(comp)
    return comp, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)

def principal_tilt(comp):
    """Signed tilt (deg) of the product's long axis away from vertical. +=top leans right."""
    ys, xs = np.where(comp)
    xs = xs - xs.mean(); ys = ys - ys.mean()
    cov = np.cov(np.vstack([xs, ys]))
    vals, vecs = np.linalg.eigh(cov)
    vx, vy = vecs[:, np.argmax(vals)]          # major axis
    if vy > 0: vx, vy = -vx, -vy               # point "up"
    return float(np.degrees(np.arctan2(vx, -vy)))  # 0 = vertical

def pick_ink(img_rgb, cx, cy, w, h):
    x0 = max(0, int(cx - w * 0.3)); y0 = max(0, int(cy - h * 0.3))
    crop = np.array(img_rgb.crop((x0, y0, int(cx + w * 0.3), int(cy + h * 0.3))).convert('RGB'))
    r, g, b = crop[..., 0].mean(), crop[..., 1].mean(), crop[..., 2].mean()
    luma = 0.299 * r + 0.587 * g + 0.114 * b
    # luma-based: dark/mid surface -> white ink, light surface (incl. yellow) -> navy.
    return WHITE if luma < 155 else NAVY

def fit_font(text, target_w):
    base = ImageFont.truetype(FONT_PATH, 100)
    w0 = base.getlength(text)
    return ImageFont.truetype(FONT_PATH, max(12, int(100 * target_w / w0)))

def render_logo_layer(text, font, ink):
    shadow = (10, 20, 36) if ink == WHITE else (255, 255, 255)
    asc, desc = font.getmetrics(); tw = int(font.getlength(text)); th = asc + desc
    pad = int(th * 0.6)
    L = Image.new('RGBA', (tw + pad * 2, th + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    # soft halo for legibility
    sh = Image.new('RGBA', L.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((pad, pad), text, font=font, fill=shadow + (180,))
    sh = sh.filter(ImageFilter.GaussianBlur(max(2, th // 18)))
    L = Image.alpha_composite(L, sh)
    d = ImageDraw.Draw(L)
    d.text((pad, pad), text, font=font, fill=ink + (255,))
    return L

def main():
    out_root = PUBLIC if APPLY else PREVIEW
    if not APPLY: os.makedirs(PREVIEW, exist_ok=True)
    rows = []
    for c in COVERS:
        src = source_path(c["rel"])
        img = Image.open(src).convert('RGB')
        W, H = img.size
        comp, (x0, y0, x1, y1) = product_mask_bbox(img)
        bw, bh = x1 - x0, y1 - y0
        cx = x0 + c["rx"] * bw; cy = y0 + c["ry"] * bh
        target_w = c["rw"] * bw
        rot = c.get("rot", 0.0)
        if c.get("auto_rot"):
            rot = principal_tilt(comp)
            rot = max(-20, min(20, rot))
        ink = {"navy": NAVY, "white": WHITE}.get(c.get("ink"), None) or pick_ink(img, cx, cy, target_w, target_w * 0.3)
        font = fit_font("Your Logo", target_w)
        layer = render_logo_layer("Your Logo", font, ink)
        if abs(rot) > 0.5:
            layer = layer.rotate(rot, expand=True, resample=Image.BICUBIC)
        out_img = img.convert('RGBA')
        px = int(cx - layer.width / 2); py = int(cy - layer.height / 2)
        out_img.alpha_composite(layer, (px, py))
        if c.get("watermark") and os.path.exists(GIFTBOX):
            wm = Image.open(GIFTBOX).convert('RGBA'); ww = int(W * 0.10)
            wm = wm.resize((ww, int(wm.height * ww / wm.width)))
            m = int(W * 0.025); out_img.alpha_composite(wm, (W - ww - m, H - wm.height - m))
        dest = os.path.join(out_root, c["out"]) if APPLY else os.path.join(PREVIEW, os.path.basename(c["out"]))
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        out_img.convert('RGB').save(dest, quality=90)
        ink_name = 'navy' if ink == NAVY else 'white'
        print(f'{"APPLY" if APPLY else "prev"} {os.path.basename(c["out"]):42s} bbox=({x0},{y0},{bw}x{bh}) rot={rot:+.1f} ink={ink_name}')
        rows.append({**c, "bbox": [int(x0), int(y0), int(bw), int(bh)], "rot": round(rot, 1), "ink": ink_name})
    if not APPLY:
        html = "<!doctype html><meta charset=utf-8><title>auto-logo preview</title>"
        html += "<style>body{background:#f5f3ee;font-family:Arial;padding:20px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px}figure{background:#fff;border-radius:10px;padding:8px;margin:0;box-shadow:0 2px 8px #0001}img{width:100%;border-radius:6px}figcaption{font-size:12px;color:#13244a;margin-top:6px}</style>"
        html += "<h2 style=color:#13244a>auto-logo (bbox-relative) preview</h2><div class=g>"
        for r in rows:
            html += f'<figure><img src="{os.path.basename(r["out"])}"><figcaption><b>{os.path.basename(r["out"])}</b><br>{r["note"]}<br>rot {r["rot"]} · ink {r["ink"]}</figcaption></figure>'
        html += "</div>"
        open(os.path.join(PREVIEW, 'preview.html'), 'w', encoding='utf-8').write(html)
        print('\nPreview:', os.path.join(PREVIEW, 'preview.html'))

if __name__ == '__main__':
    main()
