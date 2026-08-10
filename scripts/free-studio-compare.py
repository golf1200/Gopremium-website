# FREE studio-look generator for A/B comparison.
# Takes a real product photo, rembg-cuts it ONCE, then composites onto
# 5 different code-generated studio backdrops. 100% free (rembg + PIL only,
# no paid API, no external assets). Brand: navy #13244a, gold #f4b223.
#
# Usage:
#   python scripts/free-studio-compare.py DW001 BG001 FN001 ...
#   (reads the live square.jpg for each SKU from public/images/products)
#
# Output: scripts/image-pipeline/staged/free-studio-compare/<SKU>/
#   real.jpg  v1-bright.jpg  v2-podium.jpg  v3-reflection.jpg
#   v4-editorial.jpg  v5-warm.jpg
import sys, os, json, math
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

NAVY = (19, 36, 74)      # #13244a
GOLD = (244, 178, 35)    # #f4b223
SIZE = 1100

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB  = os.path.join(ROOT, "public", "images", "products")
IMGMAP = json.load(open(os.path.join(ROOT, "src", "data",
                   "product-images.generated.json"), encoding="utf-8"))
OUT = os.path.join(ROOT, "scripts", "image-pipeline", "staged",
                   "free-studio-compare")

_session = None
def _sess():
    global _session
    if _session is None:
        from rembg import new_session
        _session = new_session("u2net")
    return _session

# ---------- backgrounds (all procedural) ----------
def _vgrad(w, h, top, bot, curve=1.0):
    t = np.linspace(0.0, 1.0, h) ** curve
    top = np.array(top, np.float32); bot = np.array(bot, np.float32)
    col = top[None, :] + (bot - top)[None, :] * t[:, None]
    return np.repeat(col[:, None, :], w, axis=1).astype(np.uint8)

def bg_bright(w, h):
    # clean off-white studio, the existing express look
    return Image.fromarray(_vgrad(w, h, (248, 246, 241), (235, 231, 223), 1.6), "RGB")

def bg_warm(w, h):
    # diagonal warm-grey gradient, soft and editorial
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = (xx / w * 0.5 + yy / h * 0.5)
    top = np.array((250, 248, 244), np.float32)
    bot = np.array((228, 222, 213), np.float32)
    col = top[None, None, :] + (bot - top)[None, None, :] * d[:, :, None]
    return Image.fromarray(np.clip(col, 0, 255).astype(np.uint8), "RGB")

def _radial(w, h, cx, cy, inner, outer, radius):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / radius
    dist = np.clip(dist, 0, 1)
    inner = np.array(inner, np.float32); outer = np.array(outer, np.float32)
    col = inner[None, None, :] + (outer - inner)[None, None, :] * dist[:, :, None]
    return np.clip(col, 0, 255).astype(np.uint8)

def bg_podium(w, h):
    # clean bright backdrop only; the real navy podium is drawn under the
    # product in v_podium() so it stays anchored to the product base.
    return Image.fromarray(_vgrad(w, h, (246, 244, 239), (231, 227, 219), 1.4), "RGB")

def bg_editorial(w, h):
    # dramatic navy spotlight; product gets a bright halo, dark vignette edges
    inner = (44, 79, 124)   # #2c4f7c lifted center
    outer = (12, 23, 47)    # deep navy edge
    arr = _radial(w, h, w * 0.5, h * 0.42, inner, outer, radius=h * 0.72)
    return Image.fromarray(arr, "RGB")

# ---------- product placement helpers ----------
def cutout(src):
    from rembg import remove
    raw = Image.open(src).convert("RGBA")
    cut = remove(raw, session=_sess())
    bbox = cut.getbbox()
    if bbox:
        cut = cut.crop(bbox)
    return cut

def fit(cut, fill):
    cw, ch = cut.size
    scale = (SIZE * fill) / max(cw, ch)
    return cut.resize((max(1, int(cw * scale)), max(1, int(ch * scale))), Image.LANCZOS)

def defringe(c):
    # FIX #5: kill the matte halo by eroding the alpha edge ~1px so leftover
    # background-coloured fringe pixels turn transparent.
    a = c.split()[3]
    eroded = a.filter(ImageFilter.MinFilter(3))
    out = c.copy(); out.putalpha(eroded)
    return out

def silhouette_shadow(canvas, c, ox, oy, nw, nh, alpha=110, tint=NAVY, squash=0.13):
    # FIX #1: shadow follows the product silhouette (per-column footprint),
    # squashed flat and tucked under the true contact pixels -> no floating,
    # works for angled & multi-object layouts (each object grounds itself).
    a = c.split()[3]
    sh_h = max(6, int(nh * squash))
    squ = a.resize((nw, sh_h), Image.LANCZOS)
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    tinted = Image.new("RGBA", (nw, sh_h), tuple(tint) + (alpha,))
    top = oy + nh - int(sh_h * 0.5)
    lx = ox + int(nw * 0.03)            # light from upper-left -> nudge shadow right
    layer.paste(tinted, (lx, top), squ)
    layer = layer.filter(ImageFilter.GaussianBlur(max(8, int(sh_h * 0.8))))
    canvas.alpha_composite(layer)

def rim_light(canvas, c, ox, oy, nw, nh, alpha=70):
    # FIX #5: faint light halo behind dark products so they separate from navy.
    a = c.split()[3]
    halo = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    glow = Image.new("RGBA", (nw, nh), (210, 222, 240, alpha))
    halo.paste(glow, (ox, oy), a)
    halo = halo.filter(ImageFilter.GaussianBlur(int(max(nw, nh) * 0.06)))
    canvas.alpha_composite(halo)

def draw_podium(canvas, ox, oy, nw, nh):
    # FIX #2 (v2): a SOFT navy riser glow anchored under the product base —
    # blurred + semi-transparent so it reads as a raised studio platform, not a
    # flat sticker plate. Width is capped so it never dominates wide products.
    cx = ox + nw // 2
    pw = min(int(nw * 1.12), int(SIZE * 0.62)); ph = int(nh * 0.12) + 14
    cy = oy + nh - int(ph * 0.30)
    disc = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(disc)
    # stacked ellipses -> soft radial falloff toward the rim
    for k, a in ((1.00, 150), (0.80, 70), (0.58, 40)):
        ew, eh = int(pw * k), int(ph * k)
        d.ellipse([cx - ew // 2, cy - eh // 2, cx + ew // 2, cy + eh // 2], fill=NAVY + (a,))
    disc = disc.filter(ImageFilter.GaussianBlur(int(ph * 0.55)))
    canvas.alpha_composite(disc)
    # short, soft gold accent arc at the very front of the riser
    g = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    dg = ImageDraw.Draw(g)
    gw = int(pw * 0.46)
    dg.arc([cx - gw // 2, cy - ph // 2, cx + gw // 2, cy + ph // 2],
           35, 145, fill=GOLD + (180,), width=3)
    canvas.alpha_composite(g.filter(ImageFilter.GaussianBlur(1.2)))

def place(bg, cut, fill=0.72, yc=0.46):
    c = defringe(fit(cut, fill)); nw, nh = c.size
    canvas = bg.convert("RGBA")
    ox = (SIZE - nw) // 2
    oy = max(int(SIZE * 0.06), int(SIZE * yc) - nh // 2)
    return canvas, c, ox, oy, nw, nh

def v_bright(cut):
    canvas, c, ox, oy, nw, nh = place(bg_bright(SIZE, SIZE), cut)
    silhouette_shadow(canvas, c, ox, oy, nw, nh, 105)
    canvas.alpha_composite(c, (ox, oy)); return canvas.convert("RGB")

def v_podium(cut):
    canvas, c, ox, oy, nw, nh = place(bg_podium(SIZE, SIZE), cut, fill=0.62, yc=0.42)
    draw_podium(canvas, ox, oy, nw, nh)
    # soft dark contact under the base, ON the navy disc, for grounding
    silhouette_shadow(canvas, c, ox, oy, nw, nh, 90, tint=(8, 16, 36), squash=0.10)
    canvas.alpha_composite(c, (ox, oy)); return canvas.convert("RGB")

def v_reflection(cut):
    canvas, c, ox, oy, nw, nh = place(bg_bright(SIZE, SIZE), cut, fill=0.60, yc=0.38)
    # mirror reflection anchored exactly at the product base (single ground line)
    refl = c.transpose(Image.FLIP_TOP_BOTTOM)
    grad = np.linspace(60, 0, nh).astype(np.uint16)
    a = (np.array(refl.split()[3], np.uint16) * grad[:, None] // 255).astype(np.uint8)
    refl.putalpha(Image.fromarray(a))
    canvas.alpha_composite(refl, (ox, oy + nh))
    canvas.alpha_composite(c, (ox, oy)); return canvas.convert("RGB")

def v_editorial(cut):
    canvas, c, ox, oy, nw, nh = place(bg_editorial(SIZE, SIZE), cut, fill=0.64, yc=0.44)
    rim_light(canvas, c, ox, oy, nw, nh, 70)      # separate dark products from navy
    silhouette_shadow(canvas, c, ox, oy, nw, nh, 130, tint=(0, 0, 0))
    canvas.alpha_composite(c, (ox, oy)); return canvas.convert("RGB")

def v_warm(cut):
    canvas, c, ox, oy, nw, nh = place(bg_warm(SIZE, SIZE), cut, fill=0.72, yc=0.46)
    silhouette_shadow(canvas, c, ox, oy, nw, nh, 95)
    canvas.alpha_composite(c, (ox, oy)); return canvas.convert("RGB")

VARIANTS = [
    ("v1-bright", v_bright),
    ("v2-podium", v_podium),
    ("v3-reflection", v_reflection),
    ("v4-editorial", v_editorial),
    ("v5-warm", v_warm),
]

def save(im, path, q=88):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, "JPEG", quality=q, optimize=True, progressive=True)

def real_square(sku):
    rec = IMGMAP[sku]
    rel = rec["gallery"][0].lstrip("/").replace("images/products/", "")
    return os.path.join(PUB, rel)

def main():
    skus = [a.upper() for a in sys.argv[1:]]
    for sku in skus:
        if sku not in IMGMAP:
            print("SKIP (no map):", sku); continue
        src = real_square(sku)
        if not os.path.exists(src):
            print("SKIP (no file):", sku, src); continue
        outdir = os.path.join(OUT, sku)
        # copy real for the comparison row
        Image.open(src).convert("RGB").save(
            os.path.join(_mk(outdir), "real.jpg"), "JPEG", quality=90)
        cut = cutout(src)
        for name, fn in VARIANTS:
            try:
                save(fn(cut.copy()), os.path.join(outdir, name + ".jpg"))
            except Exception as e:
                print("  var fail", sku, name, e)
        print("OK", sku)
    print("done ->", OUT)

def _mk(d):
    os.makedirs(d, exist_ok=True); return d

if __name__ == "__main__":
    main()
