from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/schedule-layers-v2/farmwork/npc/farmer-tilling-v1"
DESTINATION = ROOT / "assets/schedule-layers-v2/farmwork/npc/farmer-tilling-v4"


def is_neutral_matte(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    return alpha > 0 and min(red, green, blue) >= 210 and max(red, green, blue) - min(red, green, blue) <= 28


def connected_components(image: Image.Image) -> list[set[tuple[int, int]]]:
    pixels = image.load()
    width, height = image.size
    remaining = {
        (x, y)
        for y in range(height)
        for x in range(width)
        if is_neutral_matte(pixels[x, y])
    }
    components: list[set[tuple[int, int]]] = []

    while remaining:
        seed = remaining.pop()
        queue = deque([seed])
        component = {seed}
        while queue:
            x, y = queue.popleft()
            for neighbor in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if neighbor in remaining:
                    remaining.remove(neighbor)
                    component.add(neighbor)
                    queue.append(neighbor)
        components.append(component)
    return components


def remove_bottom_matte(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    pixels = image.load()
    removed = 0

    for component in connected_components(image):
        top = min(y for _, y in component)
        if len(component) < 900 or top < 190:
            continue
        for x, y in component:
            pixels[x, y] = (0, 0, 0, 0)
            removed += 1

    if removed == 0:
        raise RuntimeError(f"No residual matte was found in {source}")

    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, optimize=True)
    print(f"{destination.relative_to(ROOT)}: removed {removed} matte pixels")


def main() -> None:
    for frame in range(1, 4):
        remove_bottom_matte(
            SOURCE / f"farmer-tilling-v1-{frame}.png",
            DESTINATION / f"farmer-tilling-v4-{frame}.png",
        )


if __name__ == "__main__":
    main()
