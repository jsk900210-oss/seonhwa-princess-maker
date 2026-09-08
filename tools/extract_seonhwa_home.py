"""Extract the approved neutral-background concept without regenerating its face."""
from pathlib import Path
from collections import deque
import json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'assets/characters/seonhwa/home/age-09-12'
source = Image.open(BASE / 'seonhwa-home-age09-12-concept-v1.png').convert('RGB')
rgb = np.array(source).astype(np.int16)
h, w = rgb.shape[:2]
# Only exterior-connected neutral gray is background; warm ivory fabric stays.
candidate = (rgb.max(2) - rgb.min(2) <= 14) & (rgb.min(2) >= 95) & (rgb.max(2) < 210)
# Protect the two approved shoes while removing warm-tinted cast shadow.
feet = Image.new('L', (w, h)); draw = ImageDraw.Draw(feet)
draw.polygon([(435,1350),(492,1350),(495,1400),(490,1459),(478,1475),(451,1479),(431,1470),(419,1458),(420,1436),(427,1410)], fill=255)
draw.polygon([(513,1350),(565,1350),(575,1390),(586,1430),(591,1452),(580,1473),(558,1480),(532,1474),(518,1462),(514,1415)], fill=255)
lower = np.indices((h,w))[0] >= 1370
candidate[lower & (np.array(feet) == 0)] = True
candidate[lower & (np.array(feet) > 0)] = False
removed = np.zeros((h, w), bool)
queue = deque()
def add(y, x):
    if 0 <= y < h and 0 <= x < w and candidate[y, x] and not removed[y, x]:
        removed[y, x] = True
        queue.append((y, x))
for x in range(w):
    add(0, x); add(h-1, x)
for y in range(h):
    add(y, 0); add(y, w-1)
while queue:
    y, x = queue.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        add(y+dy, x+dx)
alpha = Image.fromarray(np.uint8(~removed)*255)
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.45))
cut = source.convert('RGBA'); cut.putalpha(alpha)
target = BASE / 'seonhwa-home-age09-12-transparent-v1.png'
cut.save(target)
qa = ROOT / 'tmp/seonhwa-home-qa'; qa.mkdir(parents=True, exist_ok=True)
sheet = Image.new('RGB', (1024, 768))
for i, color in enumerate(('#f7f2e8', '#222938')):
    tile = Image.new('RGBA', cut.size, color); tile.alpha_composite(cut)
    tile.thumbnail((512, 768)); sheet.paste(tile.convert('RGB'), (i*512, 0))
sheet.save(qa / 'transparency-preview.jpg')
a = np.array(alpha)
assert (a[0] == 0).all() and (a[-1] == 0).all()
print(json.dumps({'path': str(target), 'mode': cut.mode, 'size': cut.size,
                  'alpha_range': alpha.getextrema(), 'transparent_fraction': float((a == 0).mean())}))
