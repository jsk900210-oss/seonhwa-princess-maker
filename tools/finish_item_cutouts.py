"""User-approved checkerboard extraction for six individually generated items.
Preserve draft originals; write versioned transparent game icons and QA views.
"""
from pathlib import Path
from collections import deque
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import json

ROOT=Path(__file__).resolve().parents[1]
IDS=['clear-mind-tonic','ginseng-tonic','hemp-rope','mountain-map','oil-lantern','protective-charm']
OUT=ROOT/'assets/items/illustrated'
QA=ROOT/'tmp/item-audit';OUT.mkdir(parents=True,exist_ok=True);QA.mkdir(parents=True,exist_ok=True)
report=[]
for name in IDS:
    source=Image.open(ROOT/f'output/item-rebuild-drafts/{name}.png').convert('RGBA')
    data=np.array(source);rgb=data[:,:,:3].astype(np.int16)
    candidate=(rgb.max(2)-rgb.min(2)<=20)&(rgb.min(2)>=85)
    h,w=candidate.shape;seen=np.zeros((h,w),bool);remove=np.zeros((h,w),bool)
    # Checkerboard regions have neutral colors with repeating dark/light cells.
    # Inspect each connected region, including holes in handles and rope loops.
    for sy,sx in zip(*np.where(candidate)):
        if seen[sy,sx]:continue
        queue=deque([(sy,sx)]);seen[sy,sx]=True;points=[];border=False
        while queue:
            y,x=queue.popleft();points.append((y,x))
            border|=y==0 or x==0 or y==h-1 or x==w-1
            for ny,nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
                if 0<=ny<h and 0<=nx<w and candidate[ny,nx] and not seen[ny,nx]:
                    seen[ny,nx]=True;queue.append((ny,nx))
        yy,xx=zip(*points);values=rgb[yy,xx,0]
        if border or (len(points)>=100 and float(values.std())>=18 and int(values.max()-values.min())>=45):
            remove[yy,xx]=True
    data[remove,3]=0
    data[:,:,3]=np.array(Image.fromarray(data[:,:,3]).filter(ImageFilter.MinFilter(3)))
    cut=Image.fromarray(data)
    box=cut.getchannel('A').getbbox();assert box
    cut=cut.crop(box);cut.thumbnail((276,276),Image.Resampling.LANCZOS)
    icon=Image.new('RGBA',(320,320));icon.alpha_composite(cut,((320-cut.width)//2,(320-cut.height)//2))
    icon.save(OUT/f'{name}.png')
    alpha=np.array(icon.getchannel('A'));assert (alpha[0]==0).all() and (alpha[-1]==0).all()
    report.append({'id':name,'mode':icon.mode,'size':icon.size,'bbox':icon.getbbox(),'transparent_fraction':float((alpha==0).mean())})
sheet=Image.new('RGB',(960,720),'#eee6d4');draw=ImageDraw.Draw(sheet)
for i,name in enumerate(IDS):
    x=i%3*320;y=i//3*360
    tile=Image.new('RGBA',(320,320),'#272727' if i%2 else '#eee6d4')
    tile.alpha_composite(Image.open(OUT/f'{name}.png'));sheet.paste(tile.convert('RGB'),(x,y))
    draw.text((x+8,y+330),name,fill='black')
sheet.save(QA/'rebuilt-cutouts.jpg')
print(json.dumps(report))
