from pathlib import Path
from PIL import Image, ImageDraw
import json
root=Path(__file__).resolve().parents[1]
files=sorted((root/'assets/items/illustrated').glob('*.png'))
out=root/'tmp/item-audit';out.mkdir(parents=True,exist_ok=True)
report=[]
for page in range((len(files)+23)//24):
    sheet=Image.new('RGB',(1000,960),'#c8b99d');draw=ImageDraw.Draw(sheet)
    for i,path in enumerate(files[page*24:(page+1)*24]):
        im=Image.open(path).convert('RGBA');alpha=im.getchannel('A')
        report.append({'file':path.name,'size':im.size,'bbox':alpha.getbbox(),'alpha_extrema':alpha.getextrema()})
        im.thumbnail((150,125));x=(i%5)*200;y=(i//5)*190
        sheet.paste(im,(x+(200-im.width)//2,y+10),im)
        draw.text((x+4,y+142),path.stem,fill='black')
    sheet.save(out/f'contact-{page+1}.jpg')
print(json.dumps(report))
