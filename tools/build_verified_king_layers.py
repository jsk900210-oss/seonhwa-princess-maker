"""Split the approved Joseon king pose sheet into normalized transparent layers."""

from collections import deque
from pathlib import Path
import sys
from PIL import Image

CANVAS = (512, 640)
NAMES = ("king-seated-v1.png", "king-award-box-v1.png", "king-presenting-v1.png")


def clear_border_background(image):
    rgba = image.convert("RGBA")
    px = rgba.load()
    width, height = rgba.size

    def is_background(x, y):
        r, g, b, _ = px[x, y]
        return min(r, g, b) >= 222 and max(r, g, b) - min(r, g, b) <= 12

    queue = deque([(x, y) for x in range(width) for y in (0, height - 1)] +
                  [(x, y) for y in range(height) for x in (0, width - 1)])
    seen = set()
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen:
            continue
        seen.add((x, y))
        if not is_background(x, y):
            continue
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                queue.append((nx, ny))
    return rgba


def normalize_pose(image):
    bbox = image.getbbox()
    if not bbox:
        raise ValueError("pose cell is empty")
    cropped = image.crop(bbox)
    scale = min(472 / cropped.width, 590 / cropped.height)
    resized = cropped.resize((round(cropped.width * scale), round(cropped.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((CANVAS[0] - resized.width) // 2, 620 - resized.height))
    return canvas


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_verified_king_layers.py SOURCE_SHEET OUTPUT_DIR")
    source, output = Path(sys.argv[1]), Path(sys.argv[2])
    output.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(source).convert("RGBA")
    for index, name in enumerate(NAMES):
        left, right = round(sheet.width * index / 3), round(sheet.width * (index + 1) / 3)
        final = normalize_pose(clear_border_background(sheet.crop((left, 0, right, sheet.height))))
        final.save(output / name, optimize=True)
        print(output / name)


if __name__ == "__main__":
    main()
