from pathlib import Path
from PIL import Image, ImageDraw
import json

ROOT=Path(__file__).resolve().parents[1]
GEN=Path(r"C:\Users\jsk90\.codex\generated_images\019ff51a-ff1f-7812-bf89-91228268ff1a")

def key(im):
    im=im.convert('RGBA'); px=im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=px[x,y]
            if (r>235 and g>235 and b>235) or (g>120 and g-max(r,b)>20): px[x,y]=(r,min(g,max(r,b)+15),b,0)
    return im

def split(src,cols,rows,names,out,size,fmt='PNG',transparent=False):
    im=Image.open(GEN/src); out.mkdir(parents=True,exist_ok=True); cw,ch=im.width//cols,im.height//rows
    for i,name in enumerate(names):
        x,y=i%cols,i//cols; box=(x*cw,y*ch,im.width if x==cols-1 else (x+1)*cw,im.height if y==rows-1 else (y+1)*ch)
        cell=im.crop(box).resize(size,Image.Resampling.LANCZOS)
        if transparent: cell=key(cell)
        cell.save(out/f'{name}.{fmt.lower()}',fmt,quality=88,method=6)

companions=['nanny','teacher','dolsoe','herbalist','merchant','etiquette-tutor','sewing-friend','martial-instructor']
events=['spring-flower-market','summer-flood','autumn-festival','first-snow','traveling-scholar','lost-pouch','sick-neighbor','rare-silk','writing-contest','kitchen-fire','royal-procession','sealed-letter']
endings=['scholar','court-artist','healer','merchant-master','village-teacher','royal-reunion','peaceful-life','lost-memory','overwork','true-princess']
split('exec-e9f59273-30ff-4d17-a93d-cf746c258b47.png',4,2,companions,ROOT/'assets/characters/companions/portraits',(384,384),transparent=True)
split('exec-ccb58f06-985e-4146-8670-1eda48793c7c.png',4,3,events,ROOT/'assets/events/weekly',(768,432),'WEBP')
split('exec-cfc6e508-4378-4ed3-b71d-9a299575c3c7.png',5,2,endings,ROOT/'assets/endings/gallery',(432,648),'WEBP')

colors={'study':'#486a76','manners':'#8a5865','work':'#76563f','medicine':'#59724d','commerce':'#916b35','arts':'#695682'}
badge_dir=ROOT/'assets/ui/mastery'; badge_dir.mkdir(parents=True,exist_ok=True)
for skill,color in colors.items():
    for level in range(1,6):
        im=Image.new('RGBA',(128,128),(0,0,0,0)); d=ImageDraw.Draw(im)
        d.ellipse((10,10,118,118),fill=color,outline='#e7cf91',width=6); d.ellipse((25,25,103,103),outline='#fff4cf',width=3)
        for n in range(level): d.polygon([(64+n*12-level*6,36),(68+n*12-level*6,47),(80+n*12-level*6,47),(70+n*12-level*6,54),(74+n*12-level*6,66),(64+n*12-level*6,59),(54+n*12-level*6,66),(58+n*12-level*6,54),(48+n*12-level*6,47),(60+n*12-level*6,47)],fill='#ffe4７f'.replace('７','7'))
        im.save(badge_dir/f'{skill}-level-{level}.png',optimize=True)

manifest={'companions':companions,'weeklyEvents':events,'endings':endings,'mastery':{k:[f'{k}-level-{n}' for n in range(1,6)] for k in colors}}
(ROOT/'assets/future-assets-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
