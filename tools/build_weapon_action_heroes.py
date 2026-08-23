from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "assets" / "characters" / "seonhwa" / "schedule-actions"
SHEETS = {
    "sword-strike": Path(r"C:\Users\jsk90\.codex\generated_images\01a02236-3c80-7392-a2d3-9bff302ab5bc\exec-94c597b9-0044-4648-a9f2-f63616c86941.png"),
    "spell-cast": Path(r"C:\Users\jsk90\.codex\generated_images\01a02236-3c80-7392-a2d3-9bff302ab5bc\exec-f276b680-bcae-4498-ad57-2e1472a3d481.png"),
}


def transparent_checker(image):
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, _ = pixels[x, y]
            if max(r, g, b) - min(r, g, b) <= 9 and min(r, g, b) >= 225:
                pixels[x, y] = (0, 0, 0, 0)
    return image


def remove_speckles(image, minimum=24, keep_largest_only=False):
    alpha = image.getchannel("A")
    mask = alpha.load()
    pixels = image.load()
    seen = set()
    components = []
    for y in range(image.height):
        for x in range(image.width):
            if not mask[x, y] or (x, y) in seen:
                continue
            stack = [(x, y)]
            seen.add((x, y))
            component = []
            while stack:
                px, py = stack.pop()
                component.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < image.width and 0 <= ny < image.height and mask[nx, ny] and (nx, ny) not in seen:
                        seen.add((nx, ny))
                        stack.append((nx, ny))
            components.append(component)
    largest = max(components, key=len) if components else []
    for component in components:
        if len(component) < minimum or (keep_largest_only and component is not largest):
            for px, py in component:
                pixels[px, py] = (0, 0, 0, 0)
    return image


for stem, source in SHEETS.items():
    sheet = transparent_checker(Image.open(source))
    xs = [round(i * sheet.width / 3) for i in range(4)]
    for index in range(3):
        cell = sheet.crop((xs[index], 0, xs[index + 1], sheet.height))
        # The generated first sword pose has an unnecessarily long vertical
        # blade. Shorten only its empty/blade-only span so Seonhwa's body keeps
        # the same apparent scale as frames 2 and 3.
        if stem == "sword-strike" and index == 0:
            shortened = Image.new("RGBA", (cell.width, cell.height - 140), (0, 0, 0, 0))
            shortened.alpha_composite(cell.crop((0, 0, cell.width, 70)), (0, 0))
            shortened.alpha_composite(cell.crop((0, 210, cell.width, cell.height)), (0, 70))
            cell = shortened
        bbox = cell.getchannel("A").getbbox()
        subject = cell.crop(bbox)
        scale = min(292 / subject.width, 292 / subject.height)
        size = (round(subject.width * scale), round(subject.height * scale))
        subject = subject.resize(size, Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
        canvas.alpha_composite(subject, ((320 - size[0]) // 2, 310 - size[1]))
        remove_speckles(canvas, keep_largest_only=stem == "sword-strike").save(TARGET / f"{stem}-pixel-{index + 1}.png")
    print(f"wrote {stem}-pixel-1~3.png")
