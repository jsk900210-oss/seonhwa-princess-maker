from pathlib import Path
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
source=Image.open(ROOT/'assets/reference/vacation-collectibles-sheet.png').convert('RGB')
out=ROOT/'assets/events/vacation';out.mkdir(parents=True,exist_ok=True)
names=['spring-stream','summer-seaside','autumn-maple']
for i,name in enumerate(names):
    left=round(i*source.width/3);right=round((i+1)*source.width/3)
    scene=source.crop((left,0,right,source.height)).resize((768,1152),Image.Resampling.LANCZOS)
    scene.save(out/f'{name}.webp','WEBP',quality=92,method=6)

icons=ROOT/'assets/ui/activity-icons'
icon_jobs={
 'activity-houseclean.png':ROOT/'assets/characters/seonhwa/age-09/sprites/activities/houseclean-2.png',
 'activity-shopping.png':ROOT/'assets/backgrounds/pixel-activities/close/market-errand-v2.webp',
 'activity-vacation.png':out/'summer-seaside.webp'
}
for name,path in icon_jobs.items():
    image=Image.open(path).convert('RGBA')
    size=min(image.width,image.height);left=(image.width-size)//2;top=(image.height-size)//2
    image=image.crop((left,top,left+size,top+size)).resize((192,192),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(192,192),(244,235,211,255));canvas.alpha_composite(image)
    draw=ImageDraw.Draw(canvas);draw.rounded_rectangle((3,3,188,188),18,outline=(112,75,43,255),width=6)
    canvas.save(icons/name,optimize=True)
    print(icons/name)
