# FREE download of the whole express-image Drive tree via gdown (folder must be
# shared "Anyone with the link -> Viewer"). Mirrors the Drive structure into
#   express-assets/_source/_drive/<supplier folder>/<subfolder>/...
# Run from website/:  python scripts/express-download.py
import os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "express-assets", "_source", "_drive"))
FOLDER_URL = "https://drive.google.com/drive/folders/1eoBeBialsEAvpXJci9WZXMcE0o9lAUGg"

def main():
    import gdown
    os.makedirs(ROOT, exist_ok=True)
    print(f"Downloading Drive folder tree -> {ROOT}")
    try:
        try:
            gdown.download_folder(url=FOLDER_URL, output=ROOT, quiet=False,
                                  use_cookies=False, remaining_ok=True)
        except TypeError:
            # older/newer gdown without remaining_ok
            gdown.download_folder(url=FOLDER_URL, output=ROOT, quiet=False,
                                  use_cookies=False)
    except Exception as e:
        print("DOWNLOAD FAILED:", e)
        print("\nMost likely the folder is not yet shared 'Anyone with the link'.")
        sys.exit(1)
    # quick tally
    n = 0
    for _, _, files in os.walk(ROOT):
        n += len([f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))])
    print(f"\nDone. {n} image file(s) downloaded under {ROOT}")

if __name__ == "__main__":
    main()
