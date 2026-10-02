"""Génère le site dans _site/ : photos optimisées, miniatures et data/photos.json.
Dossier = catégorie (préfixe "01 " pour l'ordre). Fichier = [AAAA-MM-JJ_]Titre.jpg"""
import json, re, shutil, hashlib
from pathlib import Path
from PIL import Image, ImageOps

OUT = Path("_site")
shutil.rmtree(OUT, ignore_errors=True)
OUT.mkdir()
shutil.copy("index.html", OUT)
for d in ("css", "js", "data"):
    shutil.copytree(d, OUT / d)
(OUT / "photos").mkdir()
(OUT / "thumbs").mkdir()

cats, photos = [], []
for folder in sorted(p for p in Path("photos").iterdir() if p.is_dir()):
    label = re.sub(r"^\d+[\s_.-]+", "", folder.name)
    files = [f for f in sorted(folder.iterdir()) if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
    if not files:
        continue
    cats.append(label)
    for f in files:
        m = re.match(r"(\d{4}-\d{2}-\d{2})(?:[\s_]+(.*))?$", f.stem)
        date, title = (m.group(1), m.group(2) or "") if m else ("", f.stem)
        if re.fullmatch(r"[A-Za-z]{0,5}[_\- ]?[\d_\- ()]+", title):  # IMG_1234 => pas de titre
            title = ""
        try:
            im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
            h = hashlib.md5(str(f).encode()).hexdigest()[:10]
            big = im.copy()
            big.thumbnail((1800, 1800))
            big.save(OUT / "photos" / f"{h}.webp", quality=80)
            im.thumbnail((600, 600))
            im.save(OUT / "thumbs" / f"{h}.webp", quality=75)
            photos.append({"id": h, "cat": label, "date": date, "title": title.strip(), "w": im.width, "h": im.height})
        except Exception as e:
            print("IGNORÉE :", f, "-", e)

photos.sort(key=lambda p: p["date"] or "9999")  # chronologique, sans date à la fin
(OUT / "data" / "photos.json").write_text(json.dumps({"categories": cats, "photos": photos}, ensure_ascii=False), encoding="utf-8")
print(len(photos), "photos,", len(cats), "catégories")
