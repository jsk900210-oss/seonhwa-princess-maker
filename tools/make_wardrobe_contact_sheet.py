from pathlib import Path

from PIL import Image, ImageDraw


source = Path("assets/characters/seonhwa/wardrobe/age-09")
files = sorted(source.glob("*.png"))
cell_width, image_height, cell_height = 220, 300, 340
sheet = Image.new("RGB", (cell_width * 4, cell_height * ((len(files) + 3) // 4)), "white")
draw = ImageDraw.Draw(sheet)

for index, path in enumerate(files):
    image = Image.open(path).convert("RGBA")
    image.thumbnail((cell_width, image_height))
    x = index % 4 * cell_width + (cell_width - image.width) // 2
    y = index // 4 * cell_height
    sheet.paste(image, (x, y), image)
    draw.text((index % 4 * cell_width + 5, y + image_height + 5), path.stem, fill="black")

Path("tmp").mkdir(exist_ok=True)
sheet.save("tmp/age09-wardrobe-contact.jpg", quality=92)
