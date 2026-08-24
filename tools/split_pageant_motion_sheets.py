from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GENERATED = Path(r"C:\Users\jsk90\.codex\generated_images\01a02236-3c80-7392-a2d3-9bff302ab5bc")
SHEETS = {
    "09": GENERATED / "exec-14972024-c154-4457-b094-db696973d7c8.png",
    "13": GENERATED / "exec-120ae5c6-afc5-4850-96a1-e1bb324ea07d.png",
    "16": GENERATED / "exec-a4ba6bd9-bd1f-459e-b542-e696e44f9998.png",
    "18": GENERATED / "exec-9dc0dc89-b5bc-4edf-a13b-8ad96aa9ed3a.png",
}


def remove_checker(image: Image.Image) -> Image.Image:
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


def normalize_frame(cell: Image.Image) -> Image.Image:
    cleaned = remove_checker(cell)
    bbox = cleaned.getbbox()
    if not bbox:
        raise RuntimeError("Empty generated motion cell")
    figure = cleaned.crop(bbox)
    scale = min(448 / figure.width, 580 / figure.height)
    figure = figure.resize((round(figure.width * scale), round(figure.height * scale)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (512, 640))
    canvas.alpha_composite(figure, ((512 - figure.width) // 2, 620 - figure.height))
    return canvas


for age, source in SHEETS.items():
    sheet = Image.open(source)
    cell_width, cell_height = sheet.width / 3, sheet.height / 2
    destination = ROOT / "assets" / "events" / "holidays" / "moonlight-pageant" / "seonhwa" / f"age-{age}"
    destination.mkdir(parents=True, exist_ok=True)
    for row, motion in enumerate(("walk", "dance")):
        for column in range(3):
            bounds = (
                round(column * cell_width),
                round(row * cell_height),
                round((column + 1) * cell_width),
                round((row + 1) * cell_height),
            )
            normalize_frame(sheet.crop(bounds)).save(destination / f"seonhwa-{motion}-{column + 1}-v2.png", optimize=True)
