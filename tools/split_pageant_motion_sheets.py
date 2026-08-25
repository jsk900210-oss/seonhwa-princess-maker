from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GENERATED = Path(r"C:\Users\user\.codex\generated_images\01a03638-5b2b-7732-8896-7bcc4501aeb0")
SHEETS = {
    "09": GENERATED / "exec-01abe451-a5ec-47cd-8751-5e30b1dfb124.png",
    "13": GENERATED / "exec-469959e5-5644-4ea7-ac48-80227f0e411a.png",
    "16": GENERATED / "exec-74c78d82-9000-4daa-82ab-bd279eb8619c.png",
    "18": GENERATED / "exec-8d2a66d2-7c98-4955-8e18-acd707001d63.png",
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
    for row in range(2):
        for column in range(3):
            bounds = (
                round(column * cell_width),
                round(row * cell_height),
                round((column + 1) * cell_width),
                round((row + 1) * cell_height),
            )
            frame = row * 3 + column + 1
            normalize_frame(sheet.crop(bounds)).save(destination / f"seonhwa-dance-{frame}-v3.png", optimize=True)
