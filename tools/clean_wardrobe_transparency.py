from collections import deque
from pathlib import Path

from PIL import Image


FILES = (
    "age18-cash-ember-ethnic.png",
    "age18-cash-ink-scholar.png",
    "age18-cash-rose-paisley.png",
    "age18-cash-solar-ceremony.png",
    "age18-cash-starlight-pink.png",
    "age18-ethnic-stage-v3.png",
)
ROOT = Path(__file__).resolve().parents[1] / "assets/characters/seonhwa/wardrobe/age-09"


def clear_light_edge(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    queue = deque((x, y) for x in range(width) for y in (0, height - 1))
    queue.extend((x, y) for y in range(height) for x in (0, width - 1))
    seen = set()
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen:
            continue
        seen.add((x, y))
        r, g, b, alpha = pixels[x, y]
        if alpha < 8:
            pass
        elif min(r, g, b) < 178 or max(r, g, b) - min(r, g, b) > 24:
            continue
        pixels[x, y] = (r, g, b, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in seen:
                queue.append((nx, ny))
    return rgba


for filename in FILES:
    path = ROOT / filename
    cleaned = clear_light_edge(Image.open(path))
    cleaned.save(path, optimize=True)
    print(filename, cleaned.size, cleaned.getchannel("A").getextrema())
