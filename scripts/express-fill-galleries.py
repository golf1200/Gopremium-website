# -*- coding: utf-8 -*-
"""
Fill multi-photo galleries for EXPRESS SKUs that currently show only 1 photo.
Source = express-realphoto-2026/staged-curate/<SKU>/*.jpg  (already studio-curated).
FREE — PIL only, no API.

For each target SKU:
  - keep the existing live <slug>-square.jpg untouched
  - take the remaining staged photos, skip any that visually duplicate the square
    (or each other) via an 8x8 average-hash, square them to 1000x1000 (<170 KB)
  - write them as <slug>-2.jpg, <slug>-3.jpg ... (cap MAX_EXTRA)
  - rewrite that SKU's gallery in src/data/product-images.generated.json
After this: bump IMG_VER + node scripts/build-catalogue-data.mjs

Usage:
  python scripts/express-fill-galleries.py              # all fillable SKUs
  python scripts/express-fill-galleries.py EX054 EX003  # only these
"""
import os, io, sys, re, json, glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGED = os.path.join(ROOT, "express-realphoto-2026", "staged-curate")
PUB    = os.path.join(ROOT, "public", "images", "products")
GEN    = os.path.join(ROOT, "src", "data", "product-images.generated.json")
V2     = os.path.join(ROOT, "public", "v2.html")

SIZE = 1000
PAD  = 0.06
MAX_EXTRA = 4          # gallery = square + up to 4 = max 5 photos
DUP_DIST  = 6          # hamming distance under which two photos count as duplicates
EXTS = (".jpg", ".jpeg", ".png", ".webp")

# ---- reused squaring logic (mirrors express-raw-to-catalog.py) ----
def near_white(im):
    w, h = im.size; s = 12
    pts = [(0, 0), (w - s, 0), (0, h - s), (w - s, h - s)]
    vals = []
    for x, y in pts:
        c = im.crop((x, y, x + s, y + s)).resize((1, 1)).getpixel((0, 0))
        vals.append(sum(c[:3]) / 3)
    return min(vals) >= 232

def to_square(path):
    im = Image.open(path)
    alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    if alpha:
        rgba = im.convert("RGBA"); bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
        bg.alpha_composite(rgba); im = bg.convert("RGB"); white = True
    else:
        im = im.convert("RGB"); white = near_white(im)
    if white:
        inner = int(SIZE * (1 - 2 * PAD))
        c = im.copy(); c.thumbnail((inner, inner), Image.LANCZOS)
        canvas = Image.new("RGB", (SIZE, SIZE), (255, 255, 255))
        canvas.paste(c, ((SIZE - c.width) // 2, (SIZE - c.height) // 2))
        return canvas
    w, h = im.size; m = min(w, h)
    im = im.crop(((w - m) // 2, (h - m) // 2, (w - m) // 2 + m, (h - m) // 2 + m)).resize((SIZE, SIZE), Image.LANCZOS)
    return im

def save_under_170kb(img, dst):
    for q in (86, 82, 78, 74, 70, 66, 62):
        buf = io.BytesIO(); img.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
        if buf.tell() <= 170 * 1024 or q == 62:
            with open(dst, "wb") as f: f.write(buf.getvalue())
            return buf.tell(), q
    return None, None

def ahash(path_or_img):
    im = (path_or_img if isinstance(path_or_img, Image.Image) else Image.open(path_or_img)).convert("L").resize((8, 8), Image.LANCZOS)
    px = list(im.getdata()); avg = sum(px) / 64
    bits = 0
    for i, p in enumerate(px):
        if p >= avg: bits |= (1 << i)
    return bits

def hamming(a, b):
    return bin(a ^ b).count("1")

# ---- figure out which SKUs are live express + currently single-photo ----
def live_express_skus():
    html = open(V2, encoding="utf-8").read()
    m = re.search(r"EXPRESS_SKUS\s*=\s*(\[[\s\S]*?\]);", html)
    return json.loads(m.group(1))

def main():
    gen = json.load(io.open(GEN, encoding="utf-8"))
    wanted = [a.upper() for a in sys.argv[1:]]
    express = set(live_express_skus())

    targets = []
    for sku in sorted(express):
        if wanted and sku not in wanted:
            continue
        gi = gen.get(sku)
        if not gi:
            continue
        gal = gi.get("gallery") or []
        if len(gal) > 1 and not wanted:
            continue  # already multi-photo
        sdir = os.path.join(STAGED, sku)
        if not os.path.isdir(sdir):
            continue
        staged = sorted(f for f in os.listdir(sdir) if f.lower().endswith(EXTS))
        if len(staged) < 2:
            continue
        targets.append((sku, gi, sdir, staged))

    print("%-7s %-16s %-7s %s" % ("SKU", "SLUG", "ADDED", "FILES"))
    print("-" * 70)
    total_added = 0
    for sku, gi, sdir, staged in targets:
        slug = gi.get("base")
        outdir = os.path.join(PUB, slug)
        os.makedirs(outdir, exist_ok=True)
        square = os.path.join(outdir, slug + "-square.jpg")
        hashes = [ahash(square)] if os.path.exists(square) else []

        added = []
        n = 1
        for fname in staged:
            if n > MAX_EXTRA:
                break
            src = os.path.join(sdir, fname)
            try:
                sq = to_square(src)
            except Exception as e:
                print("  ! skip %s/%s (%s)" % (sku, fname, e)); continue
            h = ahash(sq)
            if any(hamming(h, prev) < DUP_DIST for prev in hashes):
                continue  # duplicate of square or an already-added shot
            n += 1
            dst = os.path.join(outdir, "%s-%d.jpg" % (slug, n))
            size, q = save_under_170kb(sq, dst)
            hashes.append(h)
            added.append("%s-%d.jpg(%dKB)" % (slug, n, round(size / 1024)))

        # rebuild gallery: square first, then the new -N files sorted
        files = [f for f in os.listdir(outdir) if f.lower().endswith(".jpg")]
        sqf = [f for f in files if "-square" in f]
        rest = sorted(f for f in files if "-square" not in f)
        gallery = ["/images/products/%s/%s" % (slug, f) for f in (sqf + rest)]
        gen[sku]["gallery"] = gallery
        total_added += len(added)
        print("%-7s %-16s %-7d %s" % (sku, slug, len(added), ", ".join(added) or "(no new)"))

    json.dump(gen, io.open(GEN, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("-" * 70)
    print("SKUs touched: %d | new photos added: %d" % (len(targets), total_added))
    print("next: bump IMG_VER in scripts/build-catalogue-data.mjs, then node scripts/build-catalogue-data.mjs")

if __name__ == "__main__":
    main()
