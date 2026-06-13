# Organize + FREE die-cut the downloaded express images (no Gemini).
# Reads  express-assets/_source/_drive/<supplier>/...   (gdown mirror)
# Writes die-cuts to the right place and records everything in express-process-report.json
#
#   - kind=photo  : clean single-product shot -> rembg die-cut (transparent PNG + white-bg JPG)
#   - kind=screenshot/flyer : catalog page -> NOT die-cut (flagged needs-manual)
#
# Confident routing -> express-assets/EX###/{diecut,web}/
# Ambiguous (supplier has many SKUs, can't tell which photo is which) ->
#            express-assets/_unsorted/<SUP>/{diecut,web}/  + candidate SKU list in report
#
# Run from website/:  python scripts/express-process.py
import os, re, json, glob, shutil

HERE = os.path.dirname(__file__)
ROOT = os.path.abspath(os.path.join(HERE, "..", "express-assets"))
SRC = os.path.join(ROOT, "_source", "_drive")
SIZE = 1000
WHITE = (255, 255, 255)

products = json.load(open(os.path.join(HERE, "express-products.json"), encoding="utf-8"))
# supplier code -> list of EX SKUs (in sheet order)
sup_skus = {}
for p in products:
    sup_skus.setdefault(p["sup_code"], []).append(p["sku"])

# Confident Drive-subfolder-name -> exact SKU (only where it's unambiguous)
SUBFOLDER_SKU = {
    "ร่มกอล์ฟ 30นิ้ว 2 ชั้น": "EX019",
    "ร่มพับ 3 ตอน มือเปิด งานซัพ 8  ช่อง": "EX058",
    "ร่มตอนเดียว 22  นิ้ว งานซัพ 8  ช่อง": "EX059",
    "ร่มพับ3ตอนโครงเหล็กงานพิมพ์subทั้งคัน": "EX060",
    "ร่มยาว24นิ้วโครงเหล็กงานพิมพ์subทั้งคัน": "EX061",
    "FluFFy Puffy": "EX056",
}

def sup_from_path(rel):
    m = re.search(r"(SUP-\d{5})", rel)
    return m.group(1) if m else None

def classify(name):
    base = os.path.basename(name)
    stem = os.path.splitext(base)[0]
    if base.lower().startswith("screenshot"):
        return "screenshot"
    if re.fullmatch(r"\d{12,}", stem):     # AnyFlip/flipbook page export = marketing flyer
        return "flyer"
    return "photo"

def main():
    from rembg import remove, new_session
    from PIL import Image
    session = new_session("u2net")

    imgs = []
    for ext in ("jpg", "jpeg", "png", "webp"):
        imgs += glob.glob(os.path.join(SRC, "**", f"*.{ext}"), recursive=True)
        imgs += glob.glob(os.path.join(SRC, "**", f"*.{ext.upper()}"), recursive=True)
    imgs = sorted(set(imgs))

    report = []
    for src in imgs:
        rel = os.path.relpath(src, SRC).replace("\\", "/")
        sup = sup_from_path(rel)
        parts = rel.split("/")
        subfolder = parts[-2] if len(parts) >= 3 else ""   # immediate parent if nested
        kind = classify(src)
        name = re.sub(r"[^A-Za-z0-9ก-๙_-]+", "_", os.path.splitext(os.path.basename(src))[0])[:40]

        # routing
        sku = SUBFOLDER_SKU.get(subfolder)
        confident = sku is not None
        if not sku:
            skus = sup_skus.get(sup, [])
            if len(skus) == 1:
                sku, confident = skus[0], True
            else:
                sku = None  # ambiguous -> _unsorted

        rec = {"src": rel, "sup": sup, "subfolder": subfolder, "kind": kind,
               "sku": sku, "confident": confident,
               "candidate_skus": sup_skus.get(sup, []) if not confident else [sku],
               "diecut": None, "web": None, "coverage": None, "verdict": None}

        if kind != "photo":
            rec["verdict"] = "needs-manual (%s)" % kind
            report.append(rec)
            continue

        # --- die-cut ---
        try:
            img = Image.open(src).convert("RGBA")
        except Exception as e:
            rec["verdict"] = "open-failed: %s" % e
            report.append(rec); continue
        cut = remove(img, session=session)
        # coverage = opaque area / total (low-ish = clean subject on bg; ~1.0 = nothing removed)
        alpha = cut.split()[-1]
        hist = alpha.histogram()
        opaque = sum(hist[200:])           # near-opaque pixels
        total = cut.size[0] * cut.size[1]
        coverage = round(opaque / total, 3)
        bbox = cut.getbbox()
        if bbox:
            cut = cut.crop(bbox)
        rec["coverage"] = coverage
        rec["verdict"] = "good" if 0.05 <= coverage <= 0.90 else "weak-check"

        out_base = (os.path.join(ROOT, sku) if sku else os.path.join(ROOT, "_unsorted", sup or "misc"))
        dcdir = os.path.join(out_base, "diecut"); webdir = os.path.join(out_base, "web")
        os.makedirs(dcdir, exist_ok=True); os.makedirs(webdir, exist_ok=True)
        dc = os.path.join(dcdir, name + ".png")
        cut.save(dc)
        w, h = cut.size; sc = (SIZE * 0.92) / max(w, h)
        nw, nh = max(1, int(w * sc)), max(1, int(h * sc))
        canvas = Image.new("RGB", (SIZE, SIZE), WHITE)
        canvas.paste(cut.resize((nw, nh), Image.LANCZOS), ((SIZE - nw) // 2, (SIZE - nh) // 2), cut.resize((nw, nh), Image.LANCZOS))
        wj = os.path.join(webdir, name + ".jpg")
        canvas.save(wj, quality=86, optimize=True)
        rec["diecut"] = os.path.relpath(dc, ROOT).replace("\\", "/")
        rec["web"] = os.path.relpath(wj, ROOT).replace("\\", "/")
        report.append(rec)

    json.dump(report, open(os.path.join(ROOT, "express-process-report.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    # summary
    photos = [r for r in report if r["kind"] == "photo"]
    good = [r for r in photos if r["verdict"] == "good"]
    conf = [r for r in good if r["confident"]]
    print(f"Total source images: {len(report)}")
    print(f"  photos: {len(photos)} | screenshots+flyers (needs-manual): {len(report)-len(photos)}")
    print(f"  die-cut good: {len(good)}  (confident SKU: {len(conf)}, to _unsorted: {len(good)-len(conf)})")
    print(f"  die-cut weak-check: {len([r for r in photos if r['verdict']=='weak-check'])}")
    print("Report: express-assets/express-process-report.json")

if __name__ == "__main__":
    main()
