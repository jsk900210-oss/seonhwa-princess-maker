from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
source=Path(r"C:\Users\jsk90\.codex\generated_images\019ff51a-ff1f-7812-bf89-91228268ff1a\exec-37aea8ca-1b01-4506-a6e0-8114f7987aca.png")
out=ROOT/'assets/characters/seonhwa/age-09/sprites/activities'
sheet=Image.open(source).convert('RGB'); cell_width=sheet.width//3
for index in range(3):
    left=index*cell_width;right=sheet.width if index==2 else (index+1)*cell_width
    cell=sheet.crop((left,0,right,sheet.height)).resize((320,320),Image.Resampling.NEAREST).convert('RGBA')
    px=cell.load()
    for y in range(cell.height):
        for x in range(cell.width):
            r,g,b,a=px[x,y]
            if (r>235 and g>235 and b>235) or (g>120 and g-max(r,b)>20):px[x,y]=(r,min(g,max(r,b)+15),b,0)
    box=cell.getbbox();subject=cell.crop(box)
    fixed=Image.new('RGBA',(320,320),(0,0,0,0))
    fixed.alpha_composite(subject,((320-subject.width)//2,42))
    fixed.save(out/f'calligraphy-v2-{index+1}.png',optimize=True)
