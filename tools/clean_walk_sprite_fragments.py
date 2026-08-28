from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "characters" / "seonhwa" / "schedule-base"


def connected_components(alpha: Image.Image):
    pixels = alpha.load()
    seen = set()
    components = []
    for y in range(alpha.height):
        for x in range(alpha.width):
            if not pixels[x, y] or (x, y) in seen:
                continue
            queue = deque([(x, y)])
            seen.add((x, y))
            component = []
            while queue:
                px, py = queue.pop()
                component.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < alpha.width and 0 <= ny < alpha.height and pixels[nx, ny] and (nx, ny) not in seen:
                        seen.add((nx, ny))
                        queue.append((nx, ny))
            components.append(component)
    return sorted(components, key=len, reverse=True)


def clean(source_name: str, output_name: str):
    image = Image.open(ASSET_DIR / source_name).convert("RGBA")
    components = connected_components(image.getchannel("A"))
    # The complete character is the largest connected component. Other large
    # components at the right edge are fragments of the adjacent source frame.
    for component in components[1:]:
        if min(x for x, _ in component) < 190:
            continue
        for x, y in component:
            image.putpixel((x, y), (0, 0, 0, 0))
    image.save(ASSET_DIR / output_name, optimize=True)


clean("walk-1.png", "walk-1-v2.png")
clean("walk-2.png", "walk-2-v2.png")
