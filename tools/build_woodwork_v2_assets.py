from pathlib import Path
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
NPC_SHEET = Path(r"C:\Users\jsk90\.codex\generated_images\01a02236-3c80-7392-a2d3-9bff302ab5bc\exec-3948449e-2aaa-4fea-99da-6bf176a4c34b.png")
PROP_SHEET = Path(r"C:\Users\jsk90\.codex\generated_images\01a02236-3c80-7392-a2d3-9bff302ab5bc\exec-675857d0-9a48-488d-8d47-7b0b654dd608.png")
ACTION_SHEET = Path(sys.argv[1]) if len(sys.argv) > 1 else None
OUT = ROOT / "assets" / "schedule-layers-v2" / "woodwork"


def transparent_checker(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = pixels[x, y]
            neutral = max(r, g, b) - min(r, g, b) <= 7
            if neutral and min(r, g, b) >= 231:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def fit_cell(cell: Image.Image, max_width: int, max_height: int, floor: int = 310) -> Image.Image:
    alpha = cell.getchannel("A")
    bbox = alpha.getbbox()
    canvas = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
    if not bbox:
        return canvas
    item = cell.crop(bbox)
    scale = min(max_width / item.width, max_height / item.height)
    size = (max(1, round(item.width * scale)), max(1, round(item.height * scale)))
    item = item.resize(size, Image.Resampling.LANCZOS)
    canvas.alpha_composite(item, ((320 - size[0]) // 2, floor - size[1]))
    return canvas


def split_npc() -> None:
    sheet = transparent_checker(Image.open(NPC_SHEET))
    edges = [round(i * sheet.width / 3) for i in range(4)]
    target = OUT / "npc" / "master"
    target.mkdir(parents=True, exist_ok=True)
    for index in range(3):
        cell = sheet.crop((edges[index], 0, edges[index + 1], sheet.height))
        fit_cell(cell, 280, 300).save(target / f"idle-{index + 1}.png")


def split_props() -> None:
    sheet = transparent_checker(Image.open(PROP_SHEET))
    x_edges = [round(i * sheet.width / 3) for i in range(4)]
    y_edges = [round(i * sheet.height / 4) for i in range(5)]
    rows = [
        ("props", "saw-bench"),
        ("effects", "hammer-joint"),
        ("failures", "splinters"),
        ("failures", "dropped-plank"),
    ]
    for row, (folder, stem) in enumerate(rows):
        target = OUT / folder
        target.mkdir(parents=True, exist_ok=True)
        for column in range(3):
            cell = sheet.crop((x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1]))
            fit_cell(cell, 306, 220).save(target / f"{stem}-{column + 1}.png")


def split_action_sheet() -> None:
    if ACTION_SHEET is None:
        return
    sheet = transparent_checker(Image.open(ACTION_SHEET))
    x_edges = [round(i * sheet.width / 3) for i in range(4)]
    y_edges = [round(i * sheet.height / 2) for i in range(3)]
    target = OUT / "hero-actions"
    target.mkdir(parents=True, exist_ok=True)
    for row, stem in enumerate(("sawing", "hammering")):
        for column in range(3):
            cell = sheet.crop((x_edges[column] + 14, y_edges[row] + 12,
                               x_edges[column + 1] - 14, y_edges[row + 1] - 12))
            fit_cell(cell, 310, 278, floor=310).save(target / f"{stem}-{column + 1}.png", optimize=True)


if __name__ == "__main__":
    if ACTION_SHEET is None:
        split_npc()
        split_props()
    split_action_sheet()
