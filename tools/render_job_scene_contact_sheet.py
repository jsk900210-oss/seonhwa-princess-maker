from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/qa/job-scene-mobile-contact-sheet.png"
JOBS = (
    ("farmwork", "농가", 0.27, 116),
    ("childcare", "아이 돌보기", 0.33, 132),
    ("kitchenhelp", "주방", 0.51, 132),
    ("woodwork", "목공", 0.48, 128),
    ("loomwork", "베틀", 0.50, 138),
    ("masonry", "기와", 0.46, 118),
    ("clinichelp", "약방", 0.50, 132),
    ("ferryhelp", "나루터", 0.48, 124),
    ("merchanthelp", "판매", 0.50, 132),
)


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    scale = max(target_w / image.width, target_h / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def main() -> None:
    cell_w, cell_h, label_h = 360, 210, 24
    sheet = Image.new("RGB", (cell_w * 3, (cell_h + label_h) * 3), "#21170f")
    draw = ImageDraw.Draw(sheet)
    for index, (job, label, anchor, actor_size) in enumerate(JOBS):
        row, col = divmod(index, 3)
        background = cover(Image.open(ROOT / f"assets/backgrounds/pixel-jobs/{job}.webp").convert("RGB"), (cell_w, cell_h))
        actor = Image.open(ROOT / f"assets/characters/seonhwa/job-actions/{job}-2.png").convert("RGBA")
        actor.thumbnail((actor_size, actor_size), Image.Resampling.LANCZOS)
        x = round(cell_w * anchor - actor.width / 2)
        y = cell_h - actor.height - 3
        background.paste(actor, (x, y), actor)
        ox, oy = col * cell_w, row * (cell_h + label_h)
        sheet.paste(background, (ox, oy))
        draw.text((ox + 8, oy + cell_h + 4), label, fill="#fff2cc")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT, optimize=True)


if __name__ == "__main__":
    main()
