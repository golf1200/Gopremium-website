# Extract embedded product images from the YW catalogue PDF (real photos of the
# exact YW cups = EX025-EX041). Saves images >=250px to _source/yw-pdf/.
import os, fitz
HERE = os.path.dirname(__file__)
ASSETS = os.path.abspath(os.path.join(HERE, "..", "express-assets"))
PDF = os.path.join(ASSETS, "_source", "_drive", "SUP-00009 YW Premium (แก้วสแตนเลส)",
                   "แคตตาล็อกสินค้า YW - จัดทำแคตตาล็อกสินค้า LINE My.pdf")
OUT = os.path.join(ASSETS, "_source", "yw-pdf")
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)
seen, n = set(), 0
for pno in range(len(doc)):
    for img in doc.get_page_images(pno):
        xref = img[0]
        if xref in seen: continue
        seen.add(xref)
        try:
            d = doc.extract_image(xref)
        except Exception:
            continue
        w, h = d.get("width", 0), d.get("height", 0)
        if min(w, h) < 250:   # skip icons/logos/tiny
            continue
        ext = d.get("ext", "png")
        fn = os.path.join(OUT, f"p{pno+1:02d}-x{xref}-{w}x{h}.{ext}")
        open(fn, "wb").write(d["image"])
        n += 1
print(f"extracted {n} images (>=250px) from {len(doc)} pages -> {OUT}")
