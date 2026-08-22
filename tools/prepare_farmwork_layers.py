from collections import deque
from pathlib import Path
import sys

from PIL import Image


def transparent_connected_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    seen = bytearray(width * height)
    queue = deque()

    def background_candidate(x: int, y: int) -> bool:
        red, green, blue, _ = pixels[x, y]
        return min(red, green, blue) >= 218 and max(red, green, blue) - min(red, green, blue) <= 22

    for x in range(width):
        if background_candidate(x, 0): queue.append((x, 0))
        if background_candidate(x, height - 1): queue.append((x, height - 1))
    for y in range(height):
        if background_candidate(0, y): queue.append((0, y))
        if background_candidate(width - 1, y): queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        offset = y * width + x
        if seen[offset] or not background_candidate(x, y):
            continue
        seen[offset] = 1
        red, green, blue, _ = pixels[x, y]
        pixels[x, y] = (red, green, blue, 0)
        if x: queue.append((x - 1, y))
        if x + 1 < width: queue.append((x + 1, y))
        if y: queue.append((x, y - 1))
        if y + 1 < height: queue.append((x, y + 1))
    return rgba


def split_sheet(source: Path, output_dir: Path, stem: str, canvas_size: int) -> None:
    sheet = transparent_connected_background(Image.open(source))
    output_dir.mkdir(parents=True, exist_ok=True)
    third = sheet.width / 3
    for index in range(3):
        left = round(index * third)
        right = round((index + 1) * third)
        frame = sheet.crop((left, 0, right, sheet.height))
        alpha_box = frame.getchannel("A").getbbox()
        if not alpha_box:
            raise RuntimeError(f"empty frame {index + 1}: {source}")
        frame = frame.crop(alpha_box)
        padding = max(8, canvas_size // 20)
        scale = min((canvas_size - padding * 2) / frame.width, (canvas_size - padding * 2) / frame.height)
        resized = frame.resize((round(frame.width * scale), round(frame.height * scale)), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        canvas.alpha_composite(resized, ((canvas_size - resized.width) // 2, canvas_size - padding - resized.height))
        canvas.save(output_dir / f"{stem}-{index + 1}.png", optimize=True)


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    split_sheet(Path(sys.argv[1]), root / "assets/schedule-layers/farmwork/npc", "farmer-v3", 320)
    split_sheet(Path(sys.argv[2]), root / "assets/schedule-layers/farmwork/fail-b", "chicken-chase-v3", 192)
