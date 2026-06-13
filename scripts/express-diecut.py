# FREE die-cut (background removal) for express product images — no Gemini, no paid API.
# Uses rembg (u2net) loaded ONCE, then trims to the product bbox and emits:
#   express-assets/EX###/diecut/<name>.png   transparent cut-out (true die-cut)
#   express-assets/EX###/web/<name>.jpg       1000x1000 padded on white (web-ready)
#
# Source images go in:  express-assets/EX###/raw/*.{jpg,jpeg,png,webp}
# Run from website/:  python scripts/express-diecut.py            (process all SKUs)
#                     python scripts/express-diecut.py EX004 EX025 (only these SKUs)
import sys, os, glob, json, io

ROOT = os.path.join(os.path.dirname(__file__), "..", "express-assets")
ROOT = os.path.abspath(ROOT)
SIZE = 1000
WHITE = (255, 255, 255)

def main():
    from rembg import remove, new_session
    from PIL import Image
    only = set(a.upper() for a in sys.argv[1:])
    session = new_session("u2net")

    map_path = os.path.join(ROOT, "EXPRESS-IMAGE-MAP.json")
    imap = json.load(open(map_path, encoding="utf-8")) if os.path.exists(map_path) else []
    by_sku = {m["sku"]: m for m in imap}

    sku_dirs = sorted(d for d in os.listdir(ROOT) if d.startswith("EX") and os.path.isdir(os.path.join(ROOT, d)))
    done_files = 0
    done_skus = 0
    for sku in sku_dirs:
        if only and sku not in only:
            continue
        raw_dir = os.path.join(ROOT, sku, "raw")
        srcs = []
        for ext in ("jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"):
            srcs += glob.glob(os.path.join(raw_dir, f"*.{ext}"))
        srcs = sorted(set(srcs))
        if not srcs:
            continue
        diecut_dir = os.path.join(ROOT, sku, "diecut")
        web_dir = os.path.join(ROOT, sku, "web")
        os.makedirs(diecut_dir, exist_ok=True)
        os.makedirs(web_dir, exist_ok=True)
        n = 0
        for src in srcs:
            name = os.path.splitext(os.path.basename(src))[0]
            try:
                img = Image.open(src).convert("RGBA")
            except Exception as e:
                print(f"  !! {sku} {name}: cannot open ({e})")
                continue
            cut = remove(img, session=session)            # RGBA with alpha
            bbox = cut.getbbox()                            # crop to non-transparent content
            if bbox:
                cut = cut.crop(bbox)
            # true die-cut transparent PNG
            cut.save(os.path.join(diecut_dir, f"{name}.png"))
            # web-ready: paste onto white square, contain
            w, h = cut.size
            scale = (SIZE * 0.92) / max(w, h)
            nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
            resized = cut.resize((nw, nh), Image.LANCZOS)
            canvas = Image.new("RGB", (SIZE, SIZE), WHITE)
            canvas.paste(resized, ((SIZE - nw) // 2, (SIZE - nh) // 2), resized)
            canvas.save(os.path.join(web_dir, f"{name}.jpg"), quality=86, optimize=True)
            n += 1
            done_files += 1
        if n:
            done_skus += 1
            if sku in by_sku:
                by_sku[sku]["image_status"] = "diecut"
            print(f"OK {sku}: {n} image(s) die-cut")

    if imap:
        json.dump(imap, open(map_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"\nDie-cut {done_files} image(s) across {done_skus} SKU(s). Output in express-assets/EX###/diecut + web")

if __name__ == "__main__":
    main()
