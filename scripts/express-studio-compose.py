# FREE express hero compositor: rembg cutout -> uniform off-white STUDIO background.
# Produces a cohesive single-theme look for every express product card.
#
# Pipeline per hero image:
#   1. rembg (u2net) remove background -> RGBA cutout
#   2. trim to product bbox
#   3. scale to fit FILL% of the square canvas, center (slightly high)
#   4. soft elliptical contact shadow under the product
#   5. flatten onto an off-white radial-gradient studio backdrop (CI off-white)
#
# Outputs (per SKU):
#   public/images/products/<slug>/<slug>-square.jpg   1000x1000  (card/main)
#   public/images/products/<slug>/<slug>-02..NN.jpg   1200x1200  (gallery)
#
# Usage:
#   python scripts/express-studio-compose.py            # process manifest
#   python scripts/express-studio-compose.py --test IN OUT   # one image smoke-test
import sys, os, io, json, math

BG_TOP    = (248, 246, 241)   # off-white, CI "studio bright"
BG_BOT    = (236, 232, 224)   # slightly deeper at the floor
SHADOW    = (19, 36, 74)      # navy-tinted shadow
SIZE      = 1000
GAL_SIZE  = 1200
FILL      = 0.80              # product occupies ~80% of canvas

_session = None
def _sess():
    global _session
    if _session is None:
        from rembg import new_session
        _session = new_session("u2net")
    return _session

_bg_cache = {}
def studio_bg(w, h):
    import numpy as np
    from PIL import Image
    key = (w, h)
    if key in _bg_cache:
        return _bg_cache[key].copy()
    t = np.linspace(0.0, 1.0, h)
    e = t * t * 0.55 + t * 0.45
    top = np.array(BG_TOP, dtype=np.float32)
    bot = np.array(BG_BOT, dtype=np.float32)
    col = (top[None, :] + (bot - top)[None, :] * e[:, None])  # (h,3)
    arr = np.repeat(col[:, None, :], w, axis=1).astype(np.uint8)  # (h,w,3)
    bg = Image.fromarray(arr, "RGB")
    _bg_cache[key] = bg
    return bg.copy()

def compose(src_path, size=SIZE, fill=FILL):
    from rembg import remove
    from PIL import Image, ImageFilter
    raw = Image.open(src_path).convert("RGBA")
    cut = remove(raw, session=_sess())
    # trim to alpha bbox
    bbox = cut.getbbox()
    if bbox:
        cut = cut.crop(bbox)
    cw, ch = cut.size
    scale = (size * fill) / max(cw, ch)
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    cut = cut.resize((nw, nh), Image.LANCZOS)

    canvas = studio_bg(size, size)
    ox = (size - nw) // 2
    oy = int(size * 0.46) - nh // 2      # sit slightly above center
    oy = max(int(size * 0.06), oy)

    # contact shadow: soft ellipse beneath product
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    from PIL import ImageDraw
    d = ImageDraw.Draw(shadow)
    sw = int(nw * 0.72); sh = int(nh * 0.10) + 10
    cx = ox + nw // 2; cy = oy + nh - int(sh * 0.4)
    d.ellipse([cx - sw // 2, cy - sh // 2, cx + sw // 2, cy + sh // 2],
              fill=SHADOW + (95,))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    canvas = canvas.convert("RGBA")
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(cut, (ox, oy))
    return canvas.convert("RGB")

def save_jpg(im, path, q=86):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, "JPEG", quality=q, optimize=True, progressive=True)

def main():
    if len(sys.argv) >= 4 and sys.argv[1] == "--test":
        out = compose(sys.argv[2])
        save_jpg(out, sys.argv[3])
        print("wrote", sys.argv[3], out.size)
        return
    # manifest mode
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    manifest = json.load(open(os.path.join(root, "express-realphoto-2026", "process-manifest.json"), encoding="utf-8"))
    pub = os.path.join(root, "public", "images", "products")
    only = set(a.upper() for a in sys.argv[1:])
    done = 0
    for it in manifest:
        sku = it["sku"]
        if only and sku not in only:
            continue
        slug = it["slug"]
        outdir = os.path.join(pub, slug)
        # hero -> square
        try:
            hero = compose(it["hero_abs"])
            save_jpg(hero, os.path.join(outdir, f"{slug}-square.jpg"))
        except Exception as e:
            print("HERO FAIL", sku, e); continue
        # gallery
        n = 2
        for gp in it.get("gallery_abs", [])[:4]:
            try:
                g = compose(gp, size=GAL_SIZE)
                save_jpg(g, os.path.join(outdir, f"{slug}-{n:02d}.jpg"))
                n += 1
            except Exception as e:
                print("gal fail", sku, gp, e)
        done += 1
        print(f"OK {sku} {slug} ({n-1} imgs)")
    print("done", done)

if __name__ == "__main__":
    main()
