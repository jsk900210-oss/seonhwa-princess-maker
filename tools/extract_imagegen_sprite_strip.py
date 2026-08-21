from collections import deque
from pathlib import Path
import sys

from PIL import Image


def is_background(pixel):
    r, g, b = pixel[:3]
    return min(r, g, b) >= 226 and max(r, g, b) - min(r, g, b) <= 15


def extract(cell):
    rgb = cell.convert("RGB")
    width, height = rgb.size
    seen = bytearray(width * height)
    queue = deque()
    for x in range(width):
        queue.append((x, 0)); queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y)); queue.append((width - 1, y))
    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if seen[index] or not is_background(rgb.getpixel((x, y))):
            continue
        seen[index] = 1
        if x: queue.append((x - 1, y))
        if x + 1 < width: queue.append((x + 1, y))
        if y: queue.append((x, y - 1))
        if y + 1 < height: queue.append((x, y + 1))
    rgba = rgb.convert("RGBA")
    alpha = Image.new("L", (width, height), 255)
    alpha.putdata([
        0 if value or is_background(rgb.getpixel((index % width, index // width))) else 255
        for index, value in enumerate(seen)
    ])
    rgba.putalpha(alpha)
    bbox = rgba.getbbox()
    if not bbox:
        raise ValueError("empty frame")
    return rgba.crop(bbox)


def main():
    source = Image.open(sys.argv[1])
    destination = Path(sys.argv[2])
    stem = sys.argv[3]
    destination.mkdir(parents=True, exist_ok=True)
    cell_width = source.width // 3
    frames = []
    for index in range(3):
        left = index * cell_width
        right = source.width if index == 2 else (index + 1) * cell_width
        frames.append(extract(source.crop((left, 0, right, source.height))))
    max_width = max(frame.width for frame in frames)
    max_height = max(frame.height for frame in frames)
    canvas_width = min(320, max_width + 24)
    canvas_height = min(320, max_height + 24)
    scale = min((canvas_width - 16) / max_width, (canvas_height - 16) / max_height, 1)
    for index, frame in enumerate(frames, 1):
        size = (max(1, round(frame.width * scale)), max(1, round(frame.height * scale)))
        frame = frame.resize(size, Image.Resampling.NEAREST)
        canvas = Image.new("RGBA", (canvas_width, canvas_height), (0, 0, 0, 0))
        canvas.alpha_composite(frame, ((canvas_width - frame.width) // 2, canvas_height - frame.height - 8))
        canvas.save(destination / f"{stem}-{index}.png", optimize=True)


if __name__ == "__main__":
    main()
