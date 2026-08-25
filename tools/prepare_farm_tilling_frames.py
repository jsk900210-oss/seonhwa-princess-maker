from collections import deque
from pathlib import Path
import sys

from PIL import Image


def clear_connected_light_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    px = rgba.load()
    width, height = rgba.size
    queue = deque()
    seen = set()

    def is_background(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return min(r, g, b) >= 220 and max(r, g, b) - min(r, g, b) <= 18

    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))

    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or not (0 <= x < width and 0 <= y < height):
            continue
        seen.add((x, y))
        if not is_background(x, y):
            continue
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        queue.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))
    return rgba


def main() -> None:
    source = Image.open(sys.argv[1])
    output = Path(sys.argv[2])
    output.mkdir(parents=True, exist_ok=True)
    cell = source.height
    if source.width != cell * 3:
        raise SystemExit(f"expected horizontal 3-frame sheet, got {source.size}")
    for index in range(3):
        frame = source.crop((index * cell, 0, (index + 1) * cell, cell))
        frame = clear_connected_light_background(frame)
        frame = frame.resize((320, 320), Image.Resampling.LANCZOS)
        frame.save(output / f"farm-tilling-v1-{index + 1}.png", optimize=True)


if __name__ == "__main__":
    main()
