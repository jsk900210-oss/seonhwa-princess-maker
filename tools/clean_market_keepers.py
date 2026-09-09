from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

root = Path(__file__).resolve().parents[1]
folder = root / 'assets/characters/npcs/shops'
for shop in ['tavern', 'cloth', 'goods']:
    source = folder / f'market-{shop}-keeper-v2.png'
    im = Image.open(source).convert('RGBA')
    rgb = np.array(im)[:,:,:3].astype(np.int16)
    # These originals contain a neutral white checkerboard, not alpha.
    # Include enclosed table-leg gaps; warm ivory clothing is not neutral.
    background = (rgb.max(2)-rgb.min(2) < 14) & (rgb.min(2) > 175)
    alpha = Image.fromarray(np.where(background,0,255).astype('uint8'))
    alpha = alpha.filter(ImageFilter.MinFilter(3))
    im.putalpha(alpha)
    bounds = alpha.getbbox()
    im = im.crop(bounds)
    im.save(folder / f'market-{shop}-keeper-v3.png')
    print(shop, im.size, im.getchannel('A').getextrema())
