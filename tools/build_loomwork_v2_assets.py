from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\jsk90\.codex\generated_images\01a02236-3c80-7392-a2d3-9bff302ab5bc\exec-6f993a52-166a-472d-ad0a-6c0dea53a8d5.png")
OUT = ROOT / "assets" / "schedule-layers-v2" / "loomwork"

def remove_checker(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA"); pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = pixels[x, y]
            if max(r, g, b) - min(r, g, b) <= 7 and min(r, g, b) >= 231: pixels[x, y] = (r, g, b, 0)
    return rgba

def fit(cell: Image.Image, max_width: int, max_height: int) -> Image.Image:
    bbox = cell.getchannel("A").getbbox(); canvas = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
    if not bbox: return canvas
    item = cell.crop(bbox); scale = min(max_width / item.width, max_height / item.height)
    size = (round(item.width * scale), round(item.height * scale)); item = item.resize(size, Image.Resampling.LANCZOS)
    canvas.alpha_composite(item, ((320 - size[0]) // 2, 310 - size[1]))
    cleaned = remove_speckles(canvas); clean_bbox = cleaned.getchannel("A").getbbox()
    if not clean_bbox: return cleaned
    rebased = Image.new("RGBA", (320, 320), (0, 0, 0, 0)); subject = cleaned.crop(clean_bbox)
    rebased.alpha_composite(subject, ((320 - subject.width) // 2, 310 - subject.height)); return rebased

def remove_speckles(image: Image.Image, minimum: int = 12) -> Image.Image:
    alpha = image.getchannel("A"); mask = alpha.load(); seen = set(); remove = []
    for y in range(image.height):
        for x in range(image.width):
            if mask[x, y] == 0 or (x, y) in seen: continue
            stack = [(x, y)]; seen.add((x, y)); component = []
            while stack:
                px, py = stack.pop(); component.append((px, py))
                for nx, ny in ((px-1,py),(px+1,py),(px,py-1),(px,py+1)):
                    if 0 <= nx < image.width and 0 <= ny < image.height and mask[nx, ny] and (nx, ny) not in seen:
                        seen.add((nx, ny)); stack.append((nx, ny))
            if len(component) < minimum: remove.extend(component)
    pixels = image.load()
    for x, y in remove: pixels[x, y] = (0, 0, 0, 0)
    return image

sheet = remove_checker(Image.open(SOURCE)); x_edges = [round(i * sheet.width / 3) for i in range(4)]
y_edges = [round(sheet.height * ratio) for ratio in (0, .263, .449, .634, .813, 1)]
rows = [("npc/artisan", "idle", 310, 218), ("props", "loom-shuttle", 300, 205), ("effects", "woven-cloth", 300, 220), ("failures", "tangled-yarn", 300, 190), ("failures", "broken-thread", 300, 190)]
for row, (folder, stem, width, height) in enumerate(rows):
    target = OUT / folder; target.mkdir(parents=True, exist_ok=True)
    for column in range(3):
        cell = sheet.crop((x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1])); fit(cell, width, height).save(target / f"{stem}-{column + 1}.png")
print("wrote loomwork v2 assets")
