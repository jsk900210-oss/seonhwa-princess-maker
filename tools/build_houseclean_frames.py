from pathlib import Path
from PIL import Image

source = Path(r"C:\Users\jsk90\.codex\generated_images\019ff51a-ff1f-7812-bf89-91228268ff1a\exec-14239557-b53b-4641-aadc-76cafecd00a8.png")
out_dir = Path(r"C:\Users\jsk90\Documents\Codex\2026-08-12\referenced-chatgpt-conversation-this-is-an-2\outputs\seonhwa-princess-mvp\assets\characters\seonhwa\age-09\sprites\activities")
sheet = Image.open(source).convert("RGB")
cell_width = sheet.width // 3

for index in range(3):
    left = index * cell_width
    right = sheet.width if index == 2 else (index + 1) * cell_width
    cell = sheet.crop((left, 0, right, sheet.height)).resize((320, 320), Image.Resampling.LANCZOS)
    rgba = cell.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, _ = pixels[x, y]
            dominance = green - max(red, blue)
            if red > 235 and green > 235 and blue > 235:
                pixels[x, y] = (red, green, blue, 0)
            elif green > 120 and dominance > 20:
                pixels[x, y] = (red, min(green, max(red, blue) + 15), blue, 0)
    rgba.save(out_dir / f"houseclean-{index + 1}.png", optimize=True)
