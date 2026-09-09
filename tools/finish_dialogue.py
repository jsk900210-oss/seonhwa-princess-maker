from pathlib import Path
from collections import deque
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
import shutil

root=Path(__file__).resolve().parents[1]
generated=Path('C:/Users/user/.codex/generated_images/01a03638-5b2b-7732-8896-7bcc4501aeb0')
items={
'neutral':'89d5bbfc-0c78-4613-8ab1-f4a45c3aaff9',
'happy':'0f0cde9a-250a-49e8-8e69-9aebc9d6976f',
'worried':'03a8d8c8-5341-42a3-94e5-6f32b4d85713',
'sad':'00e62adc-9ffb-4523-88fb-a8ecf9cda134',
'displeased':'47497690-e88a-48f4-8ed4-e2207ce58b00',
'surprised':'570e0aa7-55ce-469f-ab9f-e75ced4c1305',
'shy':'fe63258e-1d6c-4043-b440-6a67188365f1'}
folder=root/'assets/characters/seonhwa/dialogue/age-09-12'
folder.mkdir(parents=True,exist_ok=True)
for emotion,uid in items.items():
    source=folder/f'{emotion}-v1-source.png'
    shutil.copy2(generated/f'exec-{uid}.png',source)
    im=Image.open(source).convert('RGBA');rgb=np.array(im)[:,:,:3].astype(np.int16)
    h,w=rgb.shape[:2];bg=(rgb.max(2)-rgb.min(2)<=17)&(rgb.min(2)>95)
    protect=Image.new('L',(w,h));ImageDraw.Draw(protect).polygon([(433,418),(594,427),(638,508),(534,649),(416,561)],fill=255)
    bg[np.array(protect)>0]=False
    seen=np.zeros((h,w),bool);q=deque()
    def add(y,x):
        if 0<=y<h and 0<=x<w and bg[y,x] and not seen[y,x]:
            seen[y,x]=True;q.append((y,x))
    for x in range(w):add(0,x);add(h-1,x)
    for y in range(h):add(y,0);add(y,w-1)
    # Enclosed neutral backdrop inside loose hair loops beside the ears.
    for y in range(320,470):
        for x in list(range(300,370))+list(range(660,720)):
            add(y,x)
    while q:
        y,x=q.popleft()
        for dy,dx in [(1,0),(-1,0),(0,1),(0,-1)]:add(y+dy,x+dx)
    alpha=Image.fromarray((~seen).astype('uint8')*255).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.4))
    im.putalpha(alpha);im.save(folder/f'{emotion}-v1.png')
    print(emotion,alpha.getextrema())
