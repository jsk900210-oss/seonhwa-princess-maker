from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT/'assets/reference/wardrobe-age18-corrected-sheet.png').convert('RGB')
names = ['age13-scholar','age13-festival','age13-work','age16-court','age16-art','age16-travel']
target = ROOT/'assets/characters/seonhwa/wardrobe/age-18'

for index, name in enumerate(names):
    left = round(index * source.width / 6)
    right = round((index + 1) * source.width / 6)
    crop = source.crop((left, 0, right, source.height))
    data = np.array(crop).astype(np.int16)
    red, green, blue = data[:,:,0], data[:,:,1], data[:,:,2]
    green_score = green - np.maximum(red, blue)
    alpha = np.where(green_score > 45, 0, np.where(green_score > 12, 255-(green_score-12)*255//33, 255)).astype(np.uint8)
    rgba = np.dstack((data.astype(np.uint8), alpha))
    image = Image.fromarray(rgba, 'RGBA')
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)
    image.thumbnail((480, 720), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (512, 768), (0,0,0,0))
    canvas.alpha_composite(image, ((512-image.width)//2, 768-image.height-12))
    canvas.save(target/f'{name}-v2.png', optimize=True)
    print(target/f'{name}-v2.png')
