"""Extract and normalize ten transparent RPG Maker dance frames from a 5x2 sheet."""

from collections import deque
from pathlib import Path
import sys

from PIL import Image


def background_candidate(pixel):
    red, green, blue = pixel[:3]
    return min(red, green, blue) >= 210 and max(red, green, blue) - min(red, green, blue) <= 22


def clear_connected_background(image):
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    seen = bytearray(width * height)
    queue = deque()
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
    while queue:
        x, y = queue.popleft()
        offset = y * width + x
        if seen[offset] or not background_candidate(pixels[x, y]):
            continue
        seen[offset] = 1
        pixels[x, y] = (0, 0, 0, 0)
        if x: queue.append((x - 1, y))
        if x + 1 < width: queue.append((x + 1, y))
        if y: queue.append((x, y - 1))
        if y + 1 < height: queue.append((x, y + 1))
    return rgba


def normalize_frame(frame, output_path):
    alpha = frame.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise RuntimeError(f"empty frame: {output_path}")
    subject = frame.crop(bbox)
    max_width, max_height = 276, 276
    scale = min(max_width / subject.width, max_height / subject.height)
    size = (max(1, round(subject.width * scale)), max(1, round(subject.height * scale)))
    subject = subject.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (300, 300), (0, 0, 0, 0))
    canvas.alpha_composite(subject, ((300 - size[0]) // 2, 288 - size[1]))
    canvas.save(output_path, optimize=True)


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: build_moonlight_dance_v5.py SOURCE_SHEET OUTPUT_DIR")
    source = clear_connected_background(Image.open(sys.argv[1]))
    output_dir = Path(sys.argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)
    width, height = source.size
    for index in range(10):
        column, row = index % 5, index // 5
        box = (
            round(column * width / 5), round(row * height / 2),
            round((column + 1) * width / 5), round((row + 1) * height / 2),
        )
        normalize_frame(source.crop(box), output_dir / f"seonhwa-dance-{index + 1:02d}-v5.png")


if __name__ == "__main__":
    main()
