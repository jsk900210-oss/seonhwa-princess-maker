from pathlib import Path
from collections import deque
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
import shutil
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--age', choices=['09-12', '13-15', '16-17', '18-plus'], default='09-12')
parser.add_argument('--version', default='v2')
parser.add_argument('--input', default='C:/Users/user/.codex/generated_images/01a03638-5b2b-7732-8896-7bcc4501aeb0/exec-d2daafe1-7222-4bdf-9c10-ebfdf5c20f4e.png')
args = parser.parse_args()

root = Path(__file__).resolve().parents[1]
folder = root / f'assets/characters/seonhwa/home/age-{args.age}'
source = folder / f'seonhwa-home-age{args.age}-skin-{args.version}-source.png'
shutil.copy2(Path(args.input), source)
im = Image.open(source).convert('RGBA')
rgb = np.array(im)[:, :, :3].astype(np.int16)
h, w = rgb.shape[:2]
bg = (rgb.max(2) - rgb.min(2) <= 17) & (rgb.min(2) > 95)
protect = Image.new('L', (w, h))
collar = [(459,274),(558,276),(582,339),(501,399),(441,338)]
if args.age in ['16-17', '18-plus']:
    collar = [(461,208),(550,211),(574,279),(514,350),(445,271)]
ImageDraw.Draw(protect).polygon(collar, fill=255)
bg[np.array(protect) > 0] = False
seen = np.zeros((h, w), bool)
q = deque()
def add(y, x):
    if 0 <= y < h and 0 <= x < w and bg[y, x] and not seen[y, x]:
        seen[y, x] = True
        q.append((y, x))
for x in range(w):
    add(0,x); add(h-1,x)
for y in range(h):
    add(y,0); add(y,w-1)
while q:
    y,x = q.popleft()
    for dy,dx in [(1,0),(-1,0),(0,1),(0,-1)]:
        add(y+dy,x+dx)
a = Image.fromarray((~seen).astype('uint8')*255).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.4))
im.putalpha(a)
im.save(folder / f'seonhwa-home-age{args.age}-skin-{args.version}.png')
preview = Image.new('RGBA', im.size, '#49392e')
preview.alpha_composite(im)
preview.thumbnail((512,768))
preview.save(folder / f'seonhwa-home-age{args.age}-skin-{args.version}-preview.png')
print(im.mode, im.size, a.getextrema())
