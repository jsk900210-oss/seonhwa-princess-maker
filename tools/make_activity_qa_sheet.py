from pathlib import Path
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
sprite_root=ROOT/'assets/characters/seonhwa/age-09/sprites/activities'
groups={
 '글읽기':'calligraphy-v2-*.png','산술':'arithmetic-*.png','예절':'manners-fixed-*.png',
 '장보기':'errand-fixed-*.png','마당쓸기':'sweeping-*.png','약초':'herbs-*.png',
 '집청소':'houseclean-*.png','휴식':'rest-*.png','식사':'eating-*.png'}
cell_w,cell_h=210,250
sheet=Image.new('RGB',(cell_w*3,cell_h*len(groups)),(229,220,202));draw=ImageDraw.Draw(sheet)
for row,(label,pattern) in enumerate(groups.items()):
    for col,path in enumerate(sorted(sprite_root.glob(pattern))[:3]):
        image=Image.open(path).convert('RGBA'); image.thumbnail((190,215),Image.Resampling.LANCZOS)
        tile=Image.new('RGBA',(cell_w,cell_h),(244,239,225,255));tile.alpha_composite(image,((cell_w-image.width)//2,20))
        x,y=col*cell_w,row*cell_h;sheet.paste(tile.convert('RGB'),(x,y));draw.text((x+5,y+4),f'{label} {col+1}',fill=(38,28,20))
output = ROOT / 'docs' / 'qa' / 'activity-qa-sheet.jpg'
output.parent.mkdir(parents=True, exist_ok=True)
sheet.save(output, quality=94)
