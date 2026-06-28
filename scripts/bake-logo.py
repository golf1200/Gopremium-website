#!/usr/bin/env python3
# ============================================================
# GO PREMIUM - bake "Your Logo" onto covers from the drag-editor's coords.
# Reads the JSON the editor exports (out/src/cx/cy/w/rot/ink/watermark),
# renders the SAME wordmark style as the editor, WYSIWYG.
#   python scripts/bake-logo.py [coords.json] [--apply]
#   default coords = ../MARKETING/logo-placement-reference/home-cover-coords.json
#   default = preview into ../MARKETING/logo-placement-reference/_baked-preview
# ============================================================
import sys, os, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
BACKUP = os.path.join(ROOT, 'express-logo-backup')
REFDIR = os.path.abspath(os.path.join(ROOT, '..', 'MARKETING', 'logo-placement-reference'))
PREVIEW = os.path.join(REFDIR, '_baked-preview')
GIFTBOX = os.path.join(os.path.dirname(os.path.abspath(__file__)), '_giftbox-navy.png')
FONT_PATH = 'C:/Windows/Fonts/arialbd.ttf'
NAVY = (19, 36, 74); WHITE = (255, 255, 255)

APPLY = '--apply' in sys.argv
args = [a for a in sys.argv[1:] if not a.startswith('--')]
COORDS = args[0] if args else os.path.join(REFDIR, 'home-cover-coords.json')

def src_path(rel):
    b = os.path.join(BACKUP, rel)
    return b if os.path.exists(b) else os.path.join(PUBLIC, rel)

def fit_font(text, target_w):
    base = ImageFont.truetype(FONT_PATH, 100)
    return ImageFont.truetype(FONT_PATH, max(10, int(100 * target_w / base.getlength(text))))

def logo_layer(text, font, ink):
    shadow = (10, 20, 36) if ink == WHITE else (255, 255, 255)
    asc, desc = font.getmetrics(); tw = int(font.getlength(text)); th = asc + desc
    pad = int(th * 0.6)
    L = Image.new('RGBA', (tw + pad * 2, th + pad * 2), (0, 0, 0, 0))
    sh = Image.new('RGBA', L.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((pad, pad), text, font=font, fill=shadow + (190,))
    sh = sh.filter(ImageFilter.GaussianBlur(max(2, th // 18)))
    L = Image.alpha_composite(L, sh)
    ImageDraw.Draw(L).text((pad, pad), text, font=font, fill=ink + (255,))
    return L

def main():
    items = json.load(open(COORDS, encoding='utf-8'))
    out_dir = PUBLIC if APPLY else PREVIEW
    if not APPLY: os.makedirs(PREVIEW, exist_ok=True)
    rows = []
    for c in items:
        img = Image.open(src_path(c['src'])).convert('RGBA')
        W, H = img.size
        ink = NAVY if c.get('ink') == 'navy' else WHITE
        font = fit_font('Your Logo', c['w'] * W)
        lay = logo_layer('Your Logo', font, ink)
        rot = float(c.get('rot', 0))
        if abs(rot) > 0.5:
            lay = lay.rotate(-rot, expand=True, resample=Image.BICUBIC)  # editor=CW positive, PIL=CCW
        px = int(c['cx'] * W - lay.width / 2); py = int(c['cy'] * H - lay.height / 2)
        img.alpha_composite(lay, (px, py))
        if c.get('watermark') and os.path.exists(GIFTBOX):
            wm = Image.open(GIFTBOX).convert('RGBA'); ww = int(W * 0.10)
            wm = wm.resize((ww, int(wm.height * ww / wm.width)))
            m = int(W * 0.025); img.alpha_composite(wm, (W - ww - m, H - wm.height - m))
        dest = os.path.join(out_dir, c['out']) if APPLY else os.path.join(PREVIEW, os.path.basename(c['out']))
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        img.convert('RGB').save(dest, quality=90)
        print(f'{"APPLY" if APPLY else "prev"} {os.path.basename(c["out"]):42s} cx={c["cx"]} cy={c["cy"]} w={c["w"]} rot={rot:+} ink={c.get("ink")}')
        rows.append(c)
    if not APPLY:
        html = "<!doctype html><meta charset=utf-8><style>body{background:#f5f3ee;font-family:Arial;padding:20px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px}figure{background:#fff;border-radius:10px;padding:8px;margin:0}img{width:100%;border-radius:6px}figcaption{font-size:12px;color:#13244a}</style><h2 style=color:#13244a>baked preview</h2><div class=g>"
        for r in rows: html += f'<figure><img src="{os.path.basename(r["out"])}"><figcaption>{os.path.basename(r["out"])}</figcaption></figure>'
        html += "</div>"
        open(os.path.join(PREVIEW, 'preview.html'), 'w', encoding='utf-8').write(html)
        print('\nPreview:', os.path.join(PREVIEW, 'preview.html'))

if __name__ == '__main__':
    main()
