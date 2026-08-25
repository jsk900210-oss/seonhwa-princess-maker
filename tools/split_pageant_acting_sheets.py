from argparse import ArgumentParser
from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
AGES = ("09", "13", "16", "18")


def remove_connected_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = pixels[x, y]
            high = min(r, g, b)
            spread = max(r, g, b) - high
            if high >= 226 and spread <= 10:
                alpha = max(0, min(255, (226 - high) * 18))
                pixels[x, y] = (r, g, b, alpha)
    return rgba


def remove_neighbor_fragments(image: Image.Image) -> Image.Image:
    """Drop pieces from figures that cross a neighboring contact-sheet cell."""
    pixels = image.load()
    width, height = image.size
    seen = bytearray(width * height)
    components = []
    for start_y in range(height):
        for start_x in range(width):
            start = start_y * width + start_x
            if seen[start] or pixels[start_x, start_y][3] <= 8:
                continue
            queue = deque([(start_x, start_y)])
            component = []
            touches_edge = False
            while queue:
                x, y = queue.popleft()
                index = y * width + x
                if seen[index] or pixels[x, y][3] <= 8:
                    continue
                seen[index] = 1
                component.append((x, y))
                touches_edge = touches_edge or x <= 1 or y <= 1 or x >= width - 2 or y >= height - 2
                if x:
                    queue.append((x - 1, y))
                if x + 1 < width:
                    queue.append((x + 1, y))
                if y:
                    queue.append((x, y - 1))
                if y + 1 < height:
                    queue.append((x, y + 1))
            components.append((component, touches_edge))
    largest = max((len(component) for component, _ in components), default=0)
    for component, touches_edge in components:
        if touches_edge and len(component) < largest * .7:
            for x, y in component:
                r, g, b, _ = pixels[x, y]
                pixels[x, y] = (r, g, b, 0)
    return image


def normalize_frame(cell: Image.Image) -> Image.Image:
    cleaned = remove_neighbor_fragments(remove_connected_background(cell))
    bbox = cleaned.getbbox()
    if not bbox:
        raise RuntimeError("Empty generated acting cell")
    figure = cleaned.crop(bbox)
    scale = min(448 / figure.width, 580 / figure.height)
    figure = figure.resize(
        (round(figure.width * scale), round(figure.height * scale)),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (512, 640))
    canvas.alpha_composite(figure, ((512 - figure.width) // 2, 620 - figure.height))
    return canvas


def main() -> None:
    parser = ArgumentParser(description="Split four age-specific 4x4 pageant acting sheets.")
    for age in AGES:
        parser.add_argument(f"--age-{age}", required=True, type=Path)
    args = parser.parse_args()

    for age in AGES:
        source = getattr(args, f"age_{age}")
        sheet = Image.open(source)
        cell_width, cell_height = sheet.width / 4, sheet.height / 4
        destination = (
            ROOT
            / "assets"
            / "events"
            / "holidays"
            / "moonlight-pageant"
            / "seonhwa"
            / f"age-{age}"
            / "acting-v4"
        )
        destination.mkdir(parents=True, exist_ok=True)
        for row in range(4):
            for column in range(4):
                bounds = (
                    round(column * cell_width),
                    round(row * cell_height),
                    round((column + 1) * cell_width),
                    round((row + 1) * cell_height),
                )
                frame = row * 4 + column + 1
                normalize_frame(sheet.crop(bounds)).save(
                    destination / f"seonhwa-acting-{frame:02d}-v4.png", optimize=True
                )


if __name__ == "__main__":
    main()
