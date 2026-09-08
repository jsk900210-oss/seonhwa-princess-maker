"""Remove border-connected checkerboard from the approved age-09 hair edit.

Usage: python tools/prepare_home_black_hair.py INPUT OUTPUT
Never overwrites the original source. Keeps the source canvas proportions.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

source, target = map(Path, sys.argv[1:])
assert source.resolve() != target.resolve()
im = Image.open(source).convert('RGBA')
pixels = np.array(im)
rgb = pixels[:, :, :3].astype(np.int16)
neutral = (rgb.max(2) - rgb.min(2) <= 18) & (rgb.min(2) >= 85)
seed = np.zeros(neutral.shape, dtype=bool)
seed[0, :] = seed[-1, :] = True
seed[:, 0] = seed[:, -1] = True
background = seed & neutral
queue = deque(zip(*np.where(background)))
height, width = neutral.shape
while queue:
    y, x = queue.popleft()
    for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
        if 0 <= ny < height and 0 <= nx < width and neutral[ny,nx] and not background[ny,nx]:
            background[ny,nx] = True
            queue.append((ny,nx))
pixels[background, 3] = 0
# Trim one source pixel of checkerboard-contaminated edge before downsampling.
pixels[:, :, 3] = np.array(Image.fromarray(pixels[:, :, 3]).filter(ImageFilter.MinFilter(3)))
target.parent.mkdir(parents=True, exist_ok=True)
Image.fromarray(pixels).resize((627, 627), Image.Resampling.LANCZOS).save(target)
check = np.array(Image.open(target))
assert check.shape == (627, 627, 4)
assert check[0, 0, 3] == 0
assert (check[:, :, 3] == 0).mean() > .6
print(f'Saved {target}: transparent background verified')
