from collections import deque
from pathlib import Path
import sys

from PIL import Image


NAMES = [
    "farmwork", "childcare", "kitchenhelp",
    "woodwork", "loomwork", "masonry",
    "clinichelp", "ferryhelp", "merchanthelp",
]


def remove_checkerboard(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    transparent = set()
    for y in range(height):
        for x in range(width):
            red, green, blue, _ = pixels[x, y]
            if min(red, green, blue) > 222 and max(red, green, blue) - min(red, green, blue) < 7:
                pixels[x, y] = (red, green, blue, 0)
                transparent.add((x, y))

    # Restore tiny enclosed light regions such as eye whites; large checker cells remain transparent.
    seen = set()
    for seed in tuple(transparent):
        if seed in seen:
            continue
        queue = deque([seed])
        component = []
        touches_edge = False
        seen.add(seed)
        while queue:
            x, y = queue.popleft()
            component.append((x, y))
            touches_edge |= x == 0 or y == 0 or x == width - 1 or y == height - 1
            for point in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if point in transparent and point not in seen:
                    seen.add(point)
                    queue.append(point)
        if not touches_edge and len(component) < 80:
            for x, y in component:
                red, green, blue, _ = pixels[x, y]
                pixels[x, y] = (red, green, blue, 255)
    return rgba


def main() -> None:
    source = Image.open(sys.argv[1])
    output = Path(sys.argv[2])
    output.mkdir(parents=True, exist_ok=True)
    cell = source.width // 3
    for index, name in enumerate(NAMES):
        row, column = divmod(index, 3)
        crop = source.crop((column * cell + 5, row * cell + 5, (column + 1) * cell - 5, (row + 1) * cell - 5))
        sprite = remove_checkerboard(crop)
        sprite.thumbnail((256, 256), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (256, 256))
        canvas.alpha_composite(sprite, ((256 - sprite.width) // 2, 256 - sprite.height))
        for frame, vertical_offset in enumerate((0, -2, 0), 1):
            framed = Image.new("RGBA", canvas.size)
            framed.alpha_composite(canvas, (0, vertical_offset))
            framed.save(output / f"{name}-{frame}.png", optimize=True)


if __name__ == "__main__":
    main()
