from pathlib import Path
from PIL import Image
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
source=Image.open(ROOT/'assets/reference/teacher-desk-tap-sheet.png').convert('RGB')
target=ROOT/'assets/characters/npcs/activity'
for i in range(3):
    crop=source.crop((round(i*source.width/3),0,round((i+1)*source.width/3),source.height))
    data=np.array(crop).astype(np.int16);r,g,b=data[:,:,0],data[:,:,1],data[:,:,2];score=g-np.maximum(r,b)
    alpha=np.where(score>46,0,np.where(score>10,255-(score-10)*255//36,255)).astype(np.uint8)
    image=Image.fromarray(np.dstack((data.astype(np.uint8),alpha)),'RGBA');bbox=image.getbbox()
    if bbox:image=image.crop(bbox)
    image.thumbnail((300,300),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(320,320),(0,0,0,0));canvas.alpha_composite(image,((320-image.width)//2,320-image.height-5))
    canvas.save(target/f'teacher-reading-{i+1}.png',optimize=True)
    print(target/f'teacher-reading-{i+1}.png')
