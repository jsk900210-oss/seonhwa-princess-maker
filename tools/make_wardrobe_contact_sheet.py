from pathlib import Path
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
files=sorted((ROOT/'assets/characters/seonhwa/wardrobe').rglob('*.png'))
thumb_w,thumb_h=180,270
sheet=Image.new('RGB',(thumb_w*6,thumb_h*5),(224,214,194));draw=ImageDraw.Draw(sheet)
for i,path in enumerate(files):
    image=Image.open(path).convert('RGBA'); background=Image.new('RGBA',(thumb_w,thumb_h),(238,231,215,255))
    image.thumbnail((thumb_w-12,thumb_h-30),Image.Resampling.LANCZOS);background.alpha_composite(image,((thumb_w-image.width)//2,2))
    x,y=(i%6)*thumb_w,(i//6)*thumb_h;sheet.paste(background.convert('RGB'),(x,y));draw.text((x+4,y+thumb_h-22),f'{path.parent.name}/{path.stem}',fill=(35,26,19))
sheet.save(ROOT/'tmp-wardrobe-contact-sheet.jpg',quality=90)

for age_dir in sorted((ROOT/'assets/characters/seonhwa/wardrobe').glob('age-*')):
    age_files=sorted(age_dir.glob('*.png'))
    rows=(len(age_files)+5)//6
    age_sheet=Image.new('RGB',(thumb_w*6,thumb_h*rows),(224,214,194));age_draw=ImageDraw.Draw(age_sheet)
    for i,path in enumerate(age_files):
        image=Image.open(path).convert('RGBA');background=Image.new('RGBA',(thumb_w,thumb_h),(238,231,215,255))
        image.thumbnail((thumb_w-12,thumb_h-30),Image.Resampling.LANCZOS);background.alpha_composite(image,((thumb_w-image.width)//2,2))
        x,y=(i%6)*thumb_w,(i//6)*thumb_h;age_sheet.paste(background.convert('RGB'),(x,y));age_draw.text((x+4,y+thumb_h-22),path.stem,fill=(35,26,19))
    age_sheet.save(ROOT/f'tmp-wardrobe-{age_dir.name}.jpg',quality=94)
