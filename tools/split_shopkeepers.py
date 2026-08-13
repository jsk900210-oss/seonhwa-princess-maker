from pathlib import Path
from PIL import Image
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
source=Image.open(ROOT/'assets/reference/market-shopkeepers-sheet.png').convert('RGB')
target=ROOT/'assets/characters/npcs/shops'
for i,name in enumerate(['tavern-hostess','hanbok-owner']):
    crop=source.crop((round(i*source.width/2),0,round((i+1)*source.width/2),source.height))
    data=np.array(crop).astype(np.int16);r,g,b=data[:,:,0],data[:,:,1],data[:,:,2];score=g-np.maximum(r,b)
    alpha=np.where(score>45,0,np.where(score>10,255-(score-10)*255//35,255)).astype(np.uint8)
    image=Image.fromarray(np.dstack((data.astype(np.uint8),alpha)),'RGBA');bbox=image.getbbox()
    if bbox:image=image.crop(bbox)
    image.thumbnail((300,300),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(320,320),(0,0,0,0));canvas.alpha_composite(image,((320-image.width)//2,320-image.height-6))
    canvas.save(target/f'{name}.png',optimize=True)
    print(target/f'{name}.png')
