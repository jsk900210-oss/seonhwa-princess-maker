from pathlib import Path
from collections import deque
from PIL import Image, ImageFilter, ImageDraw, ImageFont
import numpy as np
import shutil

root=Path(__file__).resolve().parents[1]
base=root/'assets/characters/seonhwa/home'
generated=Path('C:/Users/user/.codex/generated_images/01a03638-5b2b-7732-8896-7bcc4501aeb0')
items=[('13-15','895b34d6-f186-495c-80f8-6a9dbc6ca370'),('16-17','a88b5c63-99ab-4bbd-9efb-2c04b472814b'),('18-plus','949ea247-4f05-41fc-9dc2-e4f70fc07569')]
for age,uid in items:
    folder=base/f'age-{age}'
    source=folder/f'seonhwa-home-age{age}-review-v4-source.png'
    shutil.copy2(generated/f'exec-{uid}.png',source)
    im=Image.open(source).convert('RGBA'); rgb=np.array(im)[:,:,:3].astype(np.int16)
    h,w=rgb.shape[:2]; bg=(rgb.max(2)-rgb.min(2)<=14)&(rgb.min(2)>105)
    if age=='18-plus':
        protect=Image.new('L',(w,h)); ImageDraw.Draw(protect).polygon([(446,239),(560,235),(580,285),(521,366),(438,294)],fill=255)
        bg[np.array(protect)>0]=False
    seen=np.zeros((h,w),bool); q=deque()
    def add(y,x):
        if 0<=y<h and 0<=x<w and bg[y,x] and not seen[y,x]:seen[y,x]=True;q.append((y,x))
    for x in range(w):add(0,x);add(h-1,x)
    for y in range(h):add(y,0);add(y,w-1)
    while q:
        y,x=q.popleft()
        for dy,dx in [(1,0),(-1,0),(0,1),(0,-1)]:add(y+dy,x+dx)
    a=Image.fromarray((~seen).astype('uint8')*255).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.4))
    im.putalpha(a);im.save(folder/f'seonhwa-home-age{age}-review-v4.png')
    print(age,im.mode,a.getextrema())
ages=['09-12','13-15','16-17','18-plus']
sheet=Image.new('RGB',(1640,700),'#eee8de');d=ImageDraw.Draw(sheet)
font=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf',22)
for i,age in enumerate(ages):
    path=base/f'age-{age}'/(f'seonhwa-home-age{age}-transparent-v1.png' if i==0 else f'seonhwa-home-age{age}-review-v4.png')
    im=Image.open(path);im.thumbnail((390,610))
    tile=Image.new('RGBA',im.size,'#303846');tile.alpha_composite(im)
    sheet.paste(tile.convert('RGB'),(15+i*410,65));d.text((18+i*410,20),age.replace('-plus','세 이상').replace('-','~'),font=font,fill='#332b24')
sheet.save(base/'seonhwa-home-all-ages-review-v4.jpg',quality=95)
