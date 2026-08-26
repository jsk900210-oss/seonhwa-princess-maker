"""Build normalized transparent dialogue cutouts from approved character sources."""

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "characters" / "dialogue-fullbody"
CANVAS = (640, 960)


def largest_alpha_component(image: Image.Image) -> Image.Image:
    rgba = np.asarray(image.convert("RGBA")).copy()
    mask = rgba[:, :, 3] > 8
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    best = []
    for start_y, start_x in zip(*np.where(mask & ~seen)):
        if seen[start_y, start_x]:
            continue
        queue = deque([(start_y, start_x)])
        seen[start_y, start_x] = True
        component = []
        while queue:
            y, x = queue.popleft()
            component.append((y, x))
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= ny < height and 0 <= nx < width and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    queue.append((ny, nx))
        if len(component) > len(best):
            best = component
    keep = np.zeros_like(mask)
    if best:
        ys, xs = zip(*best)
        keep[np.asarray(ys), np.asarray(xs)] = True
    rgba[~keep, 3] = 0
    return Image.fromarray(rgba, "RGBA")


def remove_baked_checker(image: Image.Image) -> Image.Image:
    rgba = np.asarray(image.convert("RGBA")).copy()
    rgb = rgba[:, :, :3].astype(np.int16)
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    value = rgb.mean(axis=2)
    baked_background = (rgba[:, :, 3] > 0) & (spread <= 8) & (value >= 214)
    rgba[baked_background, 3] = 0
    return largest_alpha_component(Image.fromarray(rgba, "RGBA"))


def normalize(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise ValueError("empty alpha channel")
    subject = image.crop(bbox)
    max_width, max_height = CANVAS[0] - 60, CANVAS[1] - 30
    scale = min(max_width / subject.width, max_height / subject.height)
    subject = subject.resize((round(subject.width * scale), round(subject.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(subject, ((CANVAS[0] - subject.width) // 2, CANVAS[1] - subject.height - 12))
    return canvas


def save(source: Path, destination: Path, checker=False):
    image = Image.open(source).convert("RGBA")
    image = remove_baked_checker(image) if checker else largest_alpha_component(image)
    destination.parent.mkdir(parents=True, exist_ok=True)
    normalize(image).save(destination, optimize=True)
    print(destination.relative_to(ROOT))


def main():
    seonhwa_sources = {
        9: ROOT / "assets/characters/seonhwa/age-09/base/seonhwa-age09-home-main-v6-semi-real-transparent.png",
        13: ROOT / "assets/characters/seonhwa/age-13/base/seonhwa-age13-base-v2-semi-real-transparent.png",
        16: ROOT / "assets/characters/seonhwa/age-16/base/seonhwa-age16-base-v2-semi-real-transparent.png",
        18: ROOT / "assets/characters/seonhwa/age-18/base/seonhwa-age18-base-v2-semi-real-transparent.png",
    }
    for age, source in seonhwa_sources.items():
        save(source, OUT / "seonhwa" / f"age-{age:02d}.png", checker=age != 9)
    for person in ("doyun", "seojin", "yeonwoo", "taegyeom", "hyeon"):
        save(
            ROOT / "assets" / "characters" / "romance" / person / "vacation.png",
            OUT / "romance" / f"{person}.png",
        )


if __name__ == "__main__":
    main()
