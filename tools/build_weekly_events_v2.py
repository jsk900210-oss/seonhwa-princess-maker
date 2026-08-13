from pathlib import Path
from PIL import Image
import json

ROOT=Path(__file__).resolve().parents[1]
GEN=Path(r"C:\Users\jsk90\.codex\generated_images\019ff51a-ff1f-7812-bf89-91228268ff1a")
OUT=ROOT/'assets/events/weekly-v2'; OUT.mkdir(parents=True,exist_ok=True)
names=['spring-flower-market','summer-flood','autumn-festival','first-snow','traveling-scholar','lost-pouch','sick-neighbor','rare-silk','writing-contest','kitchen-fire','royal-procession','sealed-letter']

def split(src,offset):
    image=Image.open(GEN/src).convert('RGB'); cw,ch=image.width//3,image.height//2
    for i in range(6):
        x,y=i%3,i//3
        cell=image.crop((x*cw,y*ch,image.width if x==2 else (x+1)*cw,image.height if y==1 else (y+1)*ch))
        cell.resize((768,432),Image.Resampling.LANCZOS).save(OUT/f'{names[offset+i]}.webp','WEBP',quality=90,method=6)

split('exec-7f867014-f7ed-412e-b008-0cf00ce37777.png',0)
split('exec-0146a0dd-2479-4b7d-bed0-91525ff5bd5d.png',6)
manifest=json.loads((ROOT/'assets/future-assets-manifest.json').read_text(encoding='utf-8'))
manifest['weeklyEventsVersion']='v2'
manifest['weeklyEventsPath']='assets/events/weekly-v2'
(ROOT/'assets/future-assets-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
