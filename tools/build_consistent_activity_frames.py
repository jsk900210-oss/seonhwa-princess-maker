from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "assets" / "characters" / "seonhwa" / "activity-consistent"
SOURCE = BASE / "source"
AGES = ("09", "13", "16", "18")
ROWS = ("calligraphy", "arithmetic", "manners", "houseclean", "errand", "rest")
CELL_SIZE = 296


def remove_edge_checker(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    queue = deque()
    seen = set()
    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen:
            continue
        seen.add((x, y))
        r, g, b, _ = pixels[x, y]
        if max(r, g, b) - min(r, g, b) > 13 or min(r, g, b) < 185:
            continue
        pixels[x, y] = (r, g, b, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in seen:
                queue.append((nx, ny))
    return rgba


def remove_green(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = pixels[x, y]
            strength = g - max(r, b)
            if g > 105 and strength > 34:
                alpha = max(0, 255 - min(255, (strength - 28) * 8))
                pixels[x, y] = (r, min(g, max(r, b)), b, alpha)
    return rgba


def clear_border_spill(frame: Image.Image) -> Image.Image:
    alpha = frame.getchannel("A")
    width, height = frame.size
    visited = set()
    components = []
    for y in range(height):
        for x in range(width):
            origin = (x, y)
            if origin in visited or alpha.getpixel(origin) <= 20:
                continue
            points = set()
            stack = [origin]
            touches_border = False
            while stack:
                px, py = stack.pop()
                if (px, py) in visited:
                    continue
                visited.add((px, py))
                points.add((px, py))
                touches_border |= px in (0, width - 1) or py in (0, height - 1)
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited and alpha.getpixel((nx, ny)) > 20:
                        stack.append((nx, ny))
            components.append((points, touches_border))
    largest = max((len(points) for points, _ in components), default=0)
    pixels = frame.load()
    for points, touches_border in components:
        if touches_border and len(points) < largest * 0.55:
            for x, y in points:
                pixels[x, y] = (0, 0, 0, 0)
    return frame


def save_cell(sheet: Image.Image, columns: int, rows: int, column: int, row: int, path: Path, mode: str) -> None:
    left = round(column * sheet.width / columns)
    right = round((column + 1) * sheet.width / columns)
    top = round(row * sheet.height / rows)
    bottom = round((row + 1) * sheet.height / rows)
    frame = sheet.crop((left, top, right, bottom))
    frame = remove_green(frame) if mode == "green" else remove_edge_checker(frame)
    frame = clear_border_spill(frame)
    frame.thumbnail((CELL_SIZE, CELL_SIZE), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (CELL_SIZE, CELL_SIZE))
    canvas.alpha_composite(frame, ((CELL_SIZE - frame.width) // 2, (CELL_SIZE - frame.height) // 2))
    path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(path, optimize=True)


for age in AGES:
    sheet = Image.open(SOURCE / f"age{age}-eyes-v2.png")
    for row, activity in enumerate(ROWS):
        for column in range(3):
            save_cell(sheet, 3, 6, column, row, BASE / f"age-{age}" / f"{activity}-{column + 1}.png", "checker")

core = Image.open(SOURCE / "age09-core-eyes-v2.png")
for row, activity in enumerate(("sweeping", "manners", "calligraphy")):
    for column in range(3):
        save_cell(core, 3, 3, column, row, BASE / "age-09" / f"{activity}-legacy-{column + 1}.png", "green")

remaining = Image.open(SOURCE / "age09-remaining-eyes-v2.png")
for row, activity in enumerate(("arithmetic", "errand", "herbs", "rest")):
    for column in range(3):
        save_cell(remaining, 3, 4, column, row, BASE / "age-09" / f"{activity}-legacy-{column + 1}.png", "green")

print("Built face-consistent activity frames for ages 09, 13, 16 and 18.")
