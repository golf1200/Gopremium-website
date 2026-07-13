# -*- coding: utf-8 -*-
"""Recursively pull the Drive folders that are still empty (nested subfolders were
missed on the first pass). FREE via gdown. -> drive-raw/_folders/<id>/..."""
import json, os, sys
os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
import gdown

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
db = json.load(open(os.path.join(ROOT, '../Demo/express-master-DB.json'), encoding='utf-8'))
FOLDERS = os.path.join(ROOT, 'express-realphoto-2026/drive-raw/_folders')
IMGEXT = ('.jpg', '.jpeg', '.png', '.webp', '.jfif')

def imgcount(d):
    n = 0
    for root, _, files in os.walk(d):
        n += sum(1 for f in files if f.lower().endswith(IMGEXT))
    return n

def folder_id(l):
    fid = l.rstrip('/').split('/')[-1]
    return fid.split('?')[0].split('&')[0]  # strip ?usp=sharing etc.

todo = []
for p in db:
    for l in (p.get('img_link_drive') or []):
        fid = folder_id(l)
        d = os.path.join(FOLDERS, fid)
        if imgcount(d) == 0:
            todo.append((p['sku'], fid, d))

print(f'folders needing pull: {len(todo)}', flush=True)
ok = 0
for sku, fid, d in todo:
    os.makedirs(d, exist_ok=True)
    try:
        gdown.download_folder(f'https://drive.google.com/drive/folders/{fid}',
                              output=d, quiet=True, use_cookies=False)
        n = imgcount(d)
        print(f'{sku} {fid}: {n} imgs', flush=True)
        if n: ok += 1
    except Exception as e:
        print(f'{sku} {fid}: ERR {str(e)[:80]}', flush=True)
print(f'\ndone: {ok}/{len(todo)} folders now have images', flush=True)
