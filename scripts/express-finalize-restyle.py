# -*- coding: utf-8 -*-
"""
Finalize QA-approved restyle outputs into the live express galleries.
For each PASS sku: apply V3 watermark, back up the old square, then REPLACE the
square with the chosen clean restyle (old squares carried supplier watermarks /
the supplier's own model -> not brand-safe). People SKUs that passed on all 3
variants get a 2nd model shot as -2.jpg (2-photo gallery).
After this: node scripts/express-regen-galleries.mjs ; node scripts/build-catalogue-data.mjs
Run from website/ root.
"""
import os, io, json, shutil, subprocess
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AB   = os.path.join(ROOT, "scripts", "image-pipeline", "staged", "studio-ab")
PUB  = os.path.join(ROOT, "public", "images", "products")
GEN  = os.path.join(ROOT, "src", "data", "product-images.generated.json")
BK   = os.path.join(ROOT, "express-template-mockups", "_backup-pre-restyle")
WMIN = os.path.join(ROOT, "scripts", "image-pipeline", "staged", "_wm-in")
os.makedirs(BK, exist_ok=True); os.makedirs(WMIN, exist_ok=True)

# sku -> [variant filenames]; first = new square, rest = extra gallery shots
PASS = {
    # worn garments (Gemini) — all 3 passed -> 2-photo gallery
    "EX047": ["gemini-1", "gemini-2"],
    "EX093": ["gemini-1", "gemini-2"],
    "EX077": ["gemini-1", "gemini-2"],
    "EX076": ["gemini-1", "gemini-2"],
    "EX078": ["gemini-1", "gemini-2"],
    # objects (Gemini)
    "EX043": ["gemini-1"], "EX094": ["gemini-2"], "EX095": ["gemini-1"], "EX107": ["gemini-1"],
    # objects (Flux pro)
    "EX062": ["kontext-pro-1"], "EX064": ["kontext-pro-1"], "EX016": ["kontext-pro-3"],
    "EX097": ["kontext-pro-1"], "EX099": ["kontext-pro-1"], "EX110": ["kontext-pro-1"],
    "EX108": ["kontext-pro-1"], "EX109": ["kontext-pro-1"],
}

gen = json.load(io.open(GEN, encoding="utf-8"))

def under170(src, dst):
    im = Image.open(src).convert("RGB")
    if im.size != (1000, 1000):
        im = im.resize((1000, 1000), Image.LANCZOS)
    for q in (88, 84, 80, 76, 72, 68):
        buf = io.BytesIO(); im.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
        if buf.tell() <= 170 * 1024 or q == 68:
            open(dst, "wb").write(buf.getvalue()); return buf.tell()

# 1) stage chosen variants under unique names so watermark --out won't collide
staged = []   # (sku, role_index, wm_in_path)
for sku, variants in PASS.items():
    for i, v in enumerate(variants):
        src = os.path.join(AB, sku, v + ".jpg")
        if not os.path.exists(src):
            print("  ! missing", sku, v); continue
        wmin = os.path.join(WMIN, f"{sku}-{i}.jpg")
        shutil.copyfile(src, wmin); staged.append((sku, i, wmin))

# 2) apply V3 watermark (writes <stem>-wm.jpg next to input)
inputs = [p for _, _, p in staged]
subprocess.run(["node", os.path.join(ROOT, "scripts", "watermark.mjs"), *inputs], check=True, cwd=ROOT)

# 3) backup old squares + place final files
placed = 0
for sku, i, wmin in staged:
    slug = gen[sku]["base"]
    dstdir = os.path.join(PUB, slug); os.makedirs(dstdir, exist_ok=True)
    role = "square" if i == 0 else str(i + 1)          # square, 2, 3...
    dst = os.path.join(dstdir, f"{slug}-{role}.jpg")
    if i == 0 and os.path.exists(dst):                 # back up the square we're replacing
        b = os.path.join(BK, f"{slug}-square.jpg")
        if not os.path.exists(b): shutil.copyfile(dst, b)
    wm = wmin[:-4] + "-wm.jpg"
    size = under170(wm if os.path.exists(wm) else wmin, dst)
    placed += 1
    print(f"{sku:7} {slug:18} -> {os.path.basename(dst):26} {round(size/1024)}KB")

print(f"\nplaced {placed} files for {len(PASS)} SKUs. backups -> {BK}")
print("next: node scripts/express-regen-galleries.mjs ; node scripts/build-catalogue-data.mjs")
