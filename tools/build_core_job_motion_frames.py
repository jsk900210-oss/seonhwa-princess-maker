from pathlib import Path
from collections import deque

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/characters/seonhwa/job-actions/core-job-motion-atlas-source.png"
OUTPUT = ROOT / "assets/characters/seonhwa/job-actions"
NAMES = ("farmwork", "childcare", "kitchenhelp")


def clear_checkerboard(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    queue = deque()
    visited = set()

    def is_background(x: int, y: int) -> bool:
        red, green, blue, alpha = pixels[x, y]
        spread = max(red, green, blue) - min(red, green, blue)
        return alpha == 0 or (spread < 20 and min(red, green, blue) >= 174)

    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))
    while queue:
        x, y = queue.popleft()
        if (x, y) in visited or not is_background(x, y):
            continue
        visited.add((x, y))
        red, green, blue, _ = pixels[x, y]
        pixels[x, y] = (red, green, blue, 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                queue.append((nx, ny))
    return rgba


def content_bounds(image: Image.Image):
    alpha = image.getchannel("A")
    return alpha.point(lambda value: 255 if value > 20 else 0).getbbox()


def main() -> None:
    atlas = clear_checkerboard(Image.open(SOURCE))
    cell_width = atlas.width // 3
    cell_height = atlas.height // 3
    OUTPUT.mkdir(parents=True, exist_ok=True)

    for row, name in enumerate(NAMES):
        for column in range(3):
            cell = atlas.crop((
                column * cell_width,
                row * cell_height,
                (column + 1) * cell_width,
                (row + 1) * cell_height,
            ))
            bounds = content_bounds(cell)
            if bounds:
                cell = cell.crop(bounds)
            # A common square canvas keeps every action on the same baseline and
            # prevents mobile clipping when a prop or the toddler widens a frame.
            cell.thumbnail((232, 220), Image.Resampling.LANCZOS)
            frame = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
            frame.alpha_composite(cell, ((256 - cell.width) // 2, 244 - cell.height))
            frame.save(OUTPUT / f"{name}-{column + 1}.png", optimize=True)


if __name__ == "__main__":
    main()
