from pathlib import Path

from PIL import Image


GENERATED = Path(r"C:\Users\jsk90\.codex\generated_images\01a02236-3c80-7392-a2d3-9bff302ab5bc")
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets" / "events" / "holidays" / "sehwa-contest"
AGES = ("09", "13", "16", "18")


def remove_checker(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            neutral = max(r, g, b) - min(r, g, b) <= 12
            if neutral and r >= 188 and g >= 188 and b >= 188:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def normalize_cell(cell: Image.Image, size=(512, 640), margin=16) -> Image.Image:
    cell = remove_checker(cell)
    alpha = cell.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise ValueError("empty sprite cell")
    subject = cell.crop(bbox)
    scale = min((size[0] - margin * 2) / subject.width, (size[1] - margin * 2) / subject.height)
    subject = subject.resize((round(subject.width * scale), round(subject.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(subject, ((size[0] - subject.width) // 2, size[1] - margin - subject.height))
    return canvas


def split_grid(source: Path, rows: int, cols: int, output: Path, prefix: str) -> None:
    sheet = Image.open(source).convert("RGBA")
    cell_w, cell_h = sheet.width / cols, sheet.height / rows
    for row in range(rows):
        target = output / (f"age-{AGES[row]}" if rows == 4 else "")
        target.mkdir(parents=True, exist_ok=True)
        for col in range(cols):
            box = (round(col * cell_w), round(row * cell_h), round((col + 1) * cell_w), round((row + 1) * cell_h))
            normalize_cell(sheet.crop(box)).save(target / f"{prefix}-{col + 1}.png", optimize=True)


def main() -> None:
    split_grid(GENERATED / "exec-efe39af4-de5b-4846-8af8-f1236fc2f23f.png", 4, 3, DEST / "seonhwa" / "drawing", "drawing")
    split_grid(GENERATED / "exec-fc00eac5-fff7-4cf0-ba02-3bceb79affc1.png", 4, 3, DEST / "seonhwa" / "award", "award")
    split_grid(GENERATED / "exec-e4e198fa-b419-49dd-a3e5-b2df1ea5898f.png", 4, 3, DEST / "seonhwa" / "opening", "opening")
    split_grid(GENERATED / "exec-3bde41ce-0d29-4d95-a123-bf98825e3d3b.png", 1, 3, DEST / "artist", "process")
    background = Image.open(GENERATED / "exec-82979813-66c5-40cf-90cc-7902779cffa8.png").convert("RGB")
    background.thumbnail((768, 1152), Image.Resampling.LANCZOS)
    (DEST / "background").mkdir(parents=True, exist_ok=True)
    background.save(DEST / "background" / "royal-atelier-v1.webp", "WEBP", quality=90, method=6)


if __name__ == "__main__":
    main()
