"""Build pageant background and enlarged contestant layers from generated sheets."""

from collections import deque
from pathlib import Path
import sys
from PIL import Image

SHEETS = {
    "09": "exec-2ea888eb-d508-4604-9030-264a18f08a34.png",
    "13": "exec-8a1fe19a-9b56-452a-999e-4cfeaf1e899e.png",
    "16": "exec-0256165e-495e-42cf-82f9-57005f218c3e.png",
    "18": "exec-7db14c5c-5ec2-405c-acf6-69df5a39bc79.png",
}
BACKGROUND = "exec-9733fe80-2f5d-4af8-870e-88f1b76540fe.png"


def clear_border(image):
    image = image.convert("RGBA")
    px = image.load(); width, height = image.size
    def background(x, y):
        r, g, b, _ = px[x, y]
        return min(r, g, b) >= 220 and max(r, g, b) - min(r, g, b) <= 15
    queue = deque([(x, y) for x in range(width) for y in (0, height - 1)] + [(x, y) for y in range(height) for x in (0, width - 1)])
    seen = set()
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen: continue
        seen.add((x, y))
        if not background(x, y): continue
        r, g, b, _ = px[x, y]; px[x, y] = (r, g, b, 0)
        for nx, ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            if 0 <= nx < width and 0 <= ny < height: queue.append((nx, ny))
    return image


def normalize(image, size=(512, 640), max_size=(450, 580)):
    bbox = image.getbbox()
    if not bbox: raise ValueError("empty contestant cell")
    image = image.crop(bbox)
    scale = min(max_size[0] / image.width, max_size[1] / image.height)
    image = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(image, ((size[0]-image.width)//2, size[1]-18-image.height))
    return canvas


def main():
    if len(sys.argv) != 3: raise SystemExit("usage: build_moonlight_pageant_assets.py GENERATED_DIR PROJECT_ROOT")
    source, root = Path(sys.argv[1]), Path(sys.argv[2])
    base = root / "assets/events/holidays/moonlight-pageant"
    (base / "background").mkdir(parents=True, exist_ok=True)
    bg = Image.open(source / BACKGROUND).convert("RGB")
    bg.thumbnail((1080, 1920), Image.Resampling.LANCZOS)
    bg.save(base / "background/moonlight-courtyard-v1.webp", "WEBP", quality=90, method=6)
    for age, filename in SHEETS.items():
        sheet = Image.open(source / filename).convert("RGBA")
        output = base / "contestants" / f"age-{age}"
        output.mkdir(parents=True, exist_ok=True)
        for index in range(7):
            left, right = round(sheet.width * index / 7), round(sheet.width * (index + 1) / 7)
            contestant = normalize(clear_border(sheet.crop((left, 0, right, sheet.height))))
            contestant.save(output / f"contestant-{index+1}-winner-v1.png", optimize=True)
            print(output / f"contestant-{index+1}-winner-v1.png")
        hero_source = root / f"assets/characters/seonhwa/age-{age}/base/seonhwa-age{age}-base.png"
        hero_output = base / "seonhwa" / f"age-{age}"
        hero_output.mkdir(parents=True, exist_ok=True)
        # Background extraction only: the character pixels are not regenerated or repainted.
        hero = normalize(clear_border(Image.open(hero_source).convert("RGBA")))
        hero.save(hero_output / "seonhwa-winner-v1.png", optimize=True)
        print(hero_output / "seonhwa-winner-v1.png")


if __name__ == "__main__": main()
