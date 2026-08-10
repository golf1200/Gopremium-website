# FREE post-rembg cleaner: strip baked-in text/labels/swatch-cards/promo-buttons
# from a cutout, keeping ONLY the real product part(s). Uses cv2 + numpy only.
#
# Strategy (no OCR / no paid model):
#   1. connected components on the rembg alpha
#   2. always keep the largest (= main product)
#   3. keep other components ONLY if they look like a real product part:
#        - big enough relative to main, AND
#        - low "text/graphic" score (edge-density + colour-variance)
#      -> a 2nd bottle / extra umbrella survives; a swatch card / CLICK button
#         / floating text gets dropped.
#   4. harden alpha a touch to kill ghosting (semi-transparent whole product)
#
# Tunables exposed so the main pipeline (or a smoke test) can sweep them.
import sys, os
import numpy as np
from PIL import Image

KEEP_FRAC   = 0.045   # comp must be >= this * main area to even be considered
PART_FRAC   = 0.014   # below this => always drop (tiny stray: dots, thin text)
TEXT_EDGE   = 0.135   # edge-density above this (on a mid/large comp) => text/graphic card -> drop
PART_MAXREL = 0.55    # only side-comps smaller than this*main get the text test (a near-equal twin is a real part)

def _text_score(rgb, mask):
    import cv2
    ys, xs = np.where(mask)
    if len(xs) < 30:
        return 1.0  # too small to be product -> treat as droppable
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    crop = rgb[y0:y1 + 1, x0:x1 + 1]
    m = mask[y0:y1 + 1, x0:x1 + 1]
    gray = cv2.cvtColor(crop, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 60, 160)
    area = max(1, int(m.sum()))
    edge_density = float((edges > 0).sum()) / area
    return edge_density

def inpaint_text(src_path, out_path=None, dilate=9, debug=False):
    """Detect baked-in text (MSER) + isolated saturated graphic blobs (e.g. red
    CLICK button) in the ORIGINAL photo and inpaint them away BEFORE rembg.
    Returns a PIL RGB image with text/graphics filled from surroundings."""
    import cv2
    bgr = cv2.imread(src_path)
    h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    mask = np.zeros((h, w), np.uint8)

    # --- text via MSER (free, no model) ---
    mser = cv2.MSER_create()
    mser.setMinArea(40); mser.setMaxArea(int(w * h * 0.04))
    regions, _ = mser.detectRegions(gray)
    for r in regions:
        x, y, bw, bh = cv2.boundingRect(r.reshape(-1, 1, 2))
        ar = bw / max(1, bh)
        # text-glyph-ish: not too thin, not huge, plausible aspect
        if 0.12 < ar < 9 and 6 < bh < h * 0.16 and 4 < bw < w * 0.5:
            cv2.rectangle(mask, (x, y), (x + bw, y + bh), 255, -1)

    # --- isolated highly-saturated graphic blobs (promo buttons/badges) ---
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    sat = hsv[:, :, 1]; val = hsv[:, :, 2]
    hot = ((sat > 150) & (val > 120)).astype(np.uint8) * 255
    hot = cv2.morphologyEx(hot, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    nb, lb, st, _ = cv2.connectedComponentsWithStats(hot, 8)
    for i in range(1, nb):
        a = st[i, cv2.CC_STAT_AREA]
        bw, bh = st[i, cv2.CC_STAT_WIDTH], st[i, cv2.CC_STAT_HEIGHT]
        # small compact saturated badge (not a big product surface)
        if 400 < a < w * h * 0.02 and 0.4 < bw / max(1, bh) < 2.5:
            mask[lb == i] = 255

    mask = cv2.dilate(mask, np.ones((dilate, dilate), np.uint8))
    out = cv2.inpaint(bgr, mask, 6, cv2.INPAINT_TELEA)
    if debug and out_path:
        cv2.imwrite(out_path.replace(".jpg", "-mask.jpg"), mask)
    rgb = cv2.cvtColor(out, cv2.COLOR_BGR2RGB)
    im = Image.fromarray(rgb, "RGB")
    if out_path:
        im.save(out_path, "JPEG", quality=90)
    return im


def clean(cut, kf=KEEP_FRAC, pf=PART_FRAC, te=TEXT_EDGE, harden=True, debug=False):
    """cut: RGBA PIL (rembg output). returns cleaned RGBA PIL."""
    import cv2
    arr = np.array(cut)
    rgb = arr[:, :, :3]
    a = arr[:, :, 3]
    binary = (a > 40).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(binary, 8)
    if n <= 1:
        return cut
    areas = stats[:, cv2.CC_STAT_AREA].copy()
    areas[0] = 0  # background label
    main = int(np.argmax(areas))
    main_area = areas[main]
    keep = np.zeros(n, bool)
    keep[main] = True
    log = [f"main=#{main} area={main_area}"]
    for i in range(1, n):
        if i == main:
            continue
        rel = areas[i] / main_area
        if rel < pf:
            log.append(f"#{i} rel={rel:.3f} DROP(tiny)"); continue
        if rel < kf:
            log.append(f"#{i} rel={rel:.3f} DROP(<keep_frac)"); continue
        # mid/large side component: keep only if it doesn't look like text/graphic
        if rel < PART_MAXREL:
            score = _text_score(rgb, labels == i)
            if score > te:
                log.append(f"#{i} rel={rel:.3f} edge={score:.3f} DROP(text/graphic)"); continue
            log.append(f"#{i} rel={rel:.3f} edge={score:.3f} KEEP(part)")
        else:
            log.append(f"#{i} rel={rel:.3f} KEEP(twin)")
        keep[i] = True
    keep_mask = keep[labels]
    new_a = np.where(keep_mask, a, 0).astype(np.uint8)
    if harden:
        # lift mid alphas to remove ghosting, preserve soft edge falloff
        f = new_a.astype(np.float32) / 255.0
        new_a = np.clip((f ** 0.72) * 255.0, 0, 255).astype(np.uint8)
    out = arr.copy(); out[:, :, 3] = new_a
    res = Image.fromarray(out, "RGBA")
    if debug:
        print("\n".join(log))
    return res

if __name__ == "__main__":
    # smoke test: clean a raw rembg cutout file and save before/after PNGs
    from rembg import remove, new_session
    src = sys.argv[1]
    sess = new_session("u2net")
    raw = Image.open(src).convert("RGBA")
    cut = remove(raw, session=sess)
    bbox = cut.getbbox()
    if bbox: cut = cut.crop(bbox)
    cleaned = clean(cut, debug=True)
    base = os.path.splitext(os.path.basename(src))[0]
    outdir = sys.argv[2] if len(sys.argv) > 2 else "."
    os.makedirs(outdir, exist_ok=True)
    # flatten on white for easy viewing
    for tag, im in (("raw", cut), ("clean", cleaned)):
        bg = Image.new("RGB", im.size, (245, 243, 238))
        bg.paste(im, (0, 0), im)
        bg.save(os.path.join(outdir, f"{base}-{tag}.jpg"), "JPEG", quality=88)
    print("wrote", outdir)
