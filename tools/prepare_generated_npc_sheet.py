from collections import deque
from pathlib import Path
import sys

from PIL import Image


def clear_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    px = rgba.load()
    width, height = rgba.size
    queue = deque([(x, y) for x in range(width) for y in (0, height - 1)])
    queue.extend((x, y) for y in range(height) for x in (0, width - 1))
    seen = set()
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or not (0 <= x < width and 0 <= y < height):
            continue
        seen.add((x, y))
        r, g, b, _ = px[x, y]
        if min(r, g, b) < 220 or max(r, g, b) - min(r, g, b) > 18:
            continue
        px[x, y] = (r, g, b, 0)
        queue.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))
    return rgba


def main() -> None:
    source = Image.open(sys.argv[1])
    output = Path(sys.argv[2])
    prefix = sys.argv[3]
    output.mkdir(parents=True, exist_ok=True)
    cell_width = source.width // 3
    for index in range(3):
        frame = source.crop((index * cell_width, 0, (index + 1) * cell_width, source.height))
        frame = clear_background(frame)
        bbox = frame.getchannel("A").getbbox()
        if not bbox:
            raise SystemExit(f"empty frame {index + 1}")
        subject = frame.crop(bbox)
        subject.thumbnail((304, 304), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        x = (320 - subject.width) // 2
        y = 312 - subject.height
        canvas.alpha_composite(subject, (x, y))
        canvas.save(output / f"{prefix}-{index + 1}.png", optimize=True)


if __name__ == "__main__":
    main()
