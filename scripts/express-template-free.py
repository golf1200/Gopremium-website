# FREE Product-Template shots — NO Gemini, NO per-image cost.
# Builds the studio template backdrop ONCE (code-drawn: off-white gradient +
# matte navy #13244a podium + gold #f4b223 accent), then for each product:
#   rembg die-cut (free) -> drop a soft contact shadow -> composite on the podium.
# Reusable forever at $0.
#
#   python scripts/express-template-free.py --sku EX025         # all real/ imgs of a SKU
#   python scripts/express-template-free.py --sku EX019 --max 1
#   python scripts/express-template-free.py --backdrop-only      # just (re)build the backdrop
import os, sys, glob
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(__file__)
ASSETS = os.path.abspath(os.path.join(HERE, "..", "express-assets"))
BACKDROP = os.path.join(ASSETS, "_template-backdrop.png")
S = 1000
NAVY = (19, 36, 74)        # #13244a
GOLD = (244, 178, 35)      # #f4b223

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def build_backdrop():
    # "Cream studio" backdrop matching the live site product heroes:
    # warm cream diagonal gradient + soft draped-cloth shadows upper-left +
    # a gentle light pool on the surface where the product sits.
    import numpy as np
    yy, xx = np.mgrid[0:S, 0:S].astype("float32")
    tx, ty = xx / S, yy / S
    t = np.clip(0.50 * tx + 0.50 * ty, 0, 1)            # diagonal light->deep
    light = np.array([247, 243, 230], "float32")        # upper-left
    deep = np.array([213, 201, 179], "float32")         # lower-right / floor
    base = light[None, None, :] * (1 - t[..., None]) + deep[None, None, :] * t[..., None]
    # surface: bottom ~30% reads as a tabletop — very soft horizon a touch lighter
    horizon = 0.66
    floor = (ty > horizon)
    base[floor] += np.array([4, 4, 3], "float32")
    # soft light pool centred where the product stands
    cx, cy = 0.50 * S, 0.60 * S
    r = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (0.55 * S)
    pool = np.clip(1 - r, 0, 1) ** 2.2
    base += pool[..., None] * np.array([9, 9, 8], "float32")
    img = Image.fromarray(np.clip(base, 0, 255).astype("uint8"), "RGB")
    # draped-cloth soft shadows in the upper-left (blurred dark-cream blobs)
    sh = Image.new("L", (S, S), 0)
    ds = ImageDraw.Draw(sh)
    ds.ellipse([-260, -200, 360, 540], fill=46)
    ds.ellipse([-160, 120, 230, 760], fill=34)
    ds.ellipse([60, -180, 560, 200], fill=26)
    sh = sh.filter(ImageFilter.GaussianBlur(110))
    shadow = Image.new("RGB", (S, S), (150, 138, 116))   # darker cream
    img = Image.composite(shadow, img, sh.point(lambda v: int(v * 0.55)))
    img.save(BACKDROP)
    print("backdrop ->", BACKDROP)
    return img

def composite(product_path, backdrop, session):
    from rembg import remove
    src = Image.open(product_path).convert("RGBA")
    cut = remove(src, session=session)
    bb = cut.getbbox()
    if bb: cut = cut.crop(bb)
    # scale product to ~58% of canvas height
    target_h = int(S * 0.58)
    w, h = cut.size
    sc = target_h / h
    nw, nh = max(1, int(w * sc)), target_h
    if nw > S * 0.72:  # cap width too
        sc = (S * 0.72) / w; nw, nh = int(w * sc), int(h * sc)
    cut = cut.resize((nw, nh), Image.LANCZOS)
    canvas = backdrop.convert("RGBA").copy()
    cx = S // 2
    base_y = int(S * 0.79)             # product base sits on the studio surface
    px0 = cx - nw // 2
    py0 = base_y - nh
    # soft warm contact shadow hugging the base, offset right (light from upper-left)
    sh = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sw = int(nw * 0.55)
    ImageDraw.Draw(sh).ellipse([cx - sw + 16, base_y - 18, cx + sw + 26, base_y + 18],
                               fill=(74, 60, 44, 150))
    canvas = Image.alpha_composite(canvas, sh.filter(ImageFilter.GaussianBlur(15)))
    canvas.alpha_composite(cut, (px0, py0))
    return canvas.convert("RGB")

def main():
    argv = sys.argv[1:]
    def val(f, d=None):
        return argv[argv.index(f) + 1] if f in argv else d
    if not os.path.exists(BACKDROP) or "--backdrop-only" in argv:
        build_backdrop()
        if "--backdrop-only" in argv: return
    backdrop = Image.open(BACKDROP)
    sku = val("--sku")
    mx = int(val("--max", 99))
    from rembg import new_session
    session = new_session("u2net")
    skus = [sku] if sku else [d for d in os.listdir(ASSETS) if d.startswith("EX") and os.path.isdir(os.path.join(ASSETS, d, "real"))]
    n = 0
    for s in skus:
        rd = os.path.join(ASSETS, s, "real")
        if not os.path.isdir(rd): continue
        imgs = sorted(f for f in os.listdir(rd) if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")))[:mx]
        if not imgs: continue
        out = os.path.join(ASSETS, s, "styled_free"); os.makedirs(out, exist_ok=True)
        for f in imgs:
            try:
                composite(os.path.join(rd, f), backdrop, session).save(
                    os.path.join(out, os.path.splitext(f)[0] + ".jpg"), quality=88, optimize=True)
                n += 1; print(f"  OK {s} {f}")
            except Exception as e:
                print(f"  ERR {s} {f}: {e}")
    print(f"\nDONE (FREE) — {n} composited. In express-assets/EX###/styled_free/  ·  cost $0")

if __name__ == "__main__":
    main()
