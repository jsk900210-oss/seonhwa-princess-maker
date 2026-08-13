from pathlib import Path
from PIL import Image
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
out=ROOT/'assets/characters/seonhwa/age-09/sprites/activities'
jobs=[('arithmetic-fixed-v2-sheet.png','arithmetic-v2'),('errand-stall-v2-sheet.png','errand-v2')]
for source_name,prefix in jobs:
    source=Image.open(ROOT/'assets/reference'/source_name).convert('RGB')
    for i in range(3):
        left=round(i*source.width/3);right=round((i+1)*source.width/3)
        crop=source.crop((left,0,right,source.height))
        data=np.array(crop).astype(np.int16);r,g,b=data[:,:,0],data[:,:,1],data[:,:,2]
        score=g-np.maximum(r,b)
        alpha=np.where(score>48,0,np.where(score>10,255-(score-10)*255//38,255)).astype(np.uint8)
        rgba=np.dstack((data.astype(np.uint8),alpha));image=Image.fromarray(rgba,'RGBA')
        bbox=image.getbbox()
        if bbox:image=image.crop(bbox)
        image.thumbnail((300,300),Image.Resampling.LANCZOS)
        canvas=Image.new('RGBA',(320,320),(0,0,0,0));canvas.alpha_composite(image,((320-image.width)//2,320-image.height-4))
        canvas.save(out/f'{prefix}-{i+1}.png',optimize=True)
        print(out/f'{prefix}-{i+1}.png')
