from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/qa/job-motion-3frame-contact-sheet.png"
JOBS = (
    ("farmwork", "FARM", .27, 124), ("childcare", "CHILDCARE", .33, 132),
    ("kitchenhelp", "KITCHEN", .51, 132), ("woodwork", "WOOD", .48, 128),
    ("loomwork", "LOOM", .50, 138), ("masonry", "MASONRY", .46, 124),
    ("clinichelp", "CLINIC", .50, 132), ("ferryhelp", "FERRY", .48, 132),
    ("merchanthelp", "MERCHANT", .50, 132),
)


def cover(image, size):
    scale = max(size[0] / image.width, size[1] / image.height)
    image = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    left, top = (image.width - size[0]) // 2, (image.height - size[1]) // 2
    return image.crop((left, top, left + size[0], top + size[1]))


def main():
    cell_w, scene_h, label_h = 300, 175, 22
    sheet = Image.new("RGB", (cell_w * 3, (scene_h + label_h) * len(JOBS)), "#21170f")
    draw = ImageDraw.Draw(sheet)
    for row, (job, label, anchor, actor_size) in enumerate(JOBS):
        source_bg = Image.open(ROOT / f"assets/backgrounds/pixel-jobs/{job}.webp").convert("RGB")
        for frame in range(1, 4):
            scene = cover(source_bg.copy(), (cell_w, scene_h))
            actor = Image.open(ROOT / f"assets/characters/seonhwa/job-actions/{job}-v2-{frame}.png").convert("RGBA")
            actor.thumbnail((actor_size, actor_size), Image.Resampling.LANCZOS)
            x, y = round(cell_w * anchor - actor.width / 2), scene_h - actor.height - 2
            scene.paste(actor, (x, y), actor)
            ox, oy = (frame - 1) * cell_w, row * (scene_h + label_h)
            sheet.paste(scene, (ox, oy))
            draw.text((ox + 7, oy + scene_h + 4), f"{label}  {frame}/3", fill="#fff1cb")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT, optimize=True)


if __name__ == "__main__":
    main()
