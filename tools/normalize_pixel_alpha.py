"""Remove translucent matte pixels from approved hard-edge pixel sprites."""

import argparse
from pathlib import Path

from PIL import Image


def normalize(path: Path, threshold: int) -> None:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            pixels[x, y] = (red, green, blue, 255 if alpha >= threshold else 0)
    image.save(path, "PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("path", type=Path)
    parser.add_argument("--threshold", type=int, default=128)
    args = parser.parse_args()
    normalize(args.path, args.threshold)


if __name__ == "__main__":
    main()
