"""Repair border artifacts and enforce transparent margins on farm sprites."""

from collections import deque
from io import BytesIO
from pathlib import Path
import subprocess

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
FILES = (
    ROOT / "assets/schedule-layers-v2/farmwork/hero-actions/chicken-chase-v2/seonhwa-chicken-chase-2.png",
    ROOT / "assets/schedule-layers-v2/farmwork/hero-actions/chicken-chase-v2/seonhwa-chicken-chase-3.png",
    ROOT / "assets/schedule-layers-v2/farmwork/npc/farmer-tilling-v3/farmer-tilling-v3-2.png",
    ROOT / "assets/schedule-layers-v2/farmwork/npc/farmer-tilling-v3/farmer-tilling-v3-3.png",
)


def approved_image(path: Path) -> Image.Image:
    relative = path.relative_to(ROOT).as_posix()
    result = subprocess.run(
        ["git", "show", f"HEAD:{relative}"],
        cwd=ROOT,
        check=True,
        stdout=subprocess.PIPE,
    )
    return Image.open(BytesIO(result.stdout)).convert("RGBA")


def keep_large_components(image: Image.Image, minimum_pixels: int = 80) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    width, height = rgba.size
    seen = set()
    for y in range(height):
        for x in range(width):
            if (x, y) in seen or alpha.getpixel((x, y)) == 0:
                continue
            queue = deque(((x, y),))
            component = []
            seen.add((x, y))
            while queue:
                px, py = queue.popleft()
                component.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in seen and alpha.getpixel((nx, ny)) > 0:
                        seen.add((nx, ny))
                        queue.append((nx, ny))
            if len(component) < minimum_pixels:
                for px, py in component:
                    rgba.putpixel((px, py), (0, 0, 0, 0))
    return rgba


def normalize(path: Path) -> None:
    image = keep_large_components(approved_image(path))
    bounds = image.getchannel("A").getbbox()
    if not bounds:
        raise RuntimeError(f"empty sprite: {path}")
    sprite = image.crop(bounds)

    max_size = 296
    scale = min(1, max_size / sprite.width, max_size / sprite.height)
    if scale < 1:
        sprite = sprite.resize((round(sprite.width * scale), round(sprite.height * scale)), Image.Resampling.NEAREST)

    canvas = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
    left = (320 - sprite.width) // 2
    if "farmer-tilling" in path.name:
        top = 304 - sprite.height
    else:
        top = max(12, min(320 - 12 - sprite.height, bounds[1]))
    canvas.alpha_composite(sprite, (left, top))
    if path.name == "seonhwa-chicken-chase-3.png" and bounds[0] == 0:
        reference_path = path.with_name("seonhwa-chicken-chase-1.png")
        reference = approved_image(reference_path).crop((35, 145, 92, 202))
        reference_bounds = reference.getchannel("A").getbbox()
        if reference_bounds:
            foot = reference.crop(reference_bounds)
            canvas.alpha_composite(foot, (left - 4, top + sprite.height - foot.height - 4))
    canvas.save(path, "PNG", optimize=True)


def main() -> None:
    for path in FILES:
        normalize(path)


if __name__ == "__main__":
    main()
