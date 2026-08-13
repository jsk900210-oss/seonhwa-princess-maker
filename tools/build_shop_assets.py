from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
GEN=Path(r"C:\Users\jsk90\.codex\generated_images\019ff51a-ff1f-7812-bf89-91228268ff1a")

def key(im):
    im=im.convert('RGBA'); px=im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=px[x,y]
            if (r>235 and g>235 and b>235) or (g>120 and g-max(r,b)>20): px[x,y]=(r,min(g,max(r,b)+15),b,0)
    return im

def split(src,cols,rows,names,out,size):
    im=Image.open(GEN/src); out.mkdir(parents=True,exist_ok=True)
    cw,ch=im.width//cols,im.height//rows
    for i,name in enumerate(names):
        x,y=i%cols,i//cols
        cell=im.crop((x*cw,y*ch,im.width if x==cols-1 else (x+1)*cw,im.height if y==rows-1 else (y+1)*ch))
        key(cell.resize(size,Image.Resampling.LANCZOS)).save(out/f'{name}.png',optimize=True)

foods=['bunsik','gimbap','bulgogi','bibimbap','gukbap','japchae','tteokguk','samgyetang','galbijjim','jeongol']
split('exec-186f185e-6c56-4590-af9f-108246aa6377.png',5,2,foods,ROOT/'assets/items/food',(256,256))
split('exec-a9bfb68f-3d70-4a56-bb13-694b2abf64b6.png',3,1,[f'eating-{i}' for i in range(1,4)],ROOT/'assets/characters/seonhwa/age-09/sprites/activities',(320,320))
ids09=['age09-neat','age09-flower','age09-active']
ids13=ids09+['age13-scholar','age13-festival','age13-work']
ids16=ids13+['age16-court','age16-art','age16-travel']
ids18=ids16+['age18-ceremony','age18-silk','age18-simple']
split('exec-1b5e4ba5-0db6-419c-8ed8-519687d0589a.png',3,1,ids09,ROOT/'assets/characters/seonhwa/wardrobe/age-09',(512,768))
split('exec-6d34f3df-3b01-4baf-b6c9-c03f09172ffe.png',6,1,ids13,ROOT/'assets/characters/seonhwa/wardrobe/age-13',(512,768))
split('exec-dec3c88b-33f5-4a2d-9d41-e8ef7dc699f6.png',3,3,ids16,ROOT/'assets/characters/seonhwa/wardrobe/age-16',(512,768))
split('exec-5fe6cb71-8a1d-428e-9956-40b630408f5c.png',4,3,ids18,ROOT/'assets/characters/seonhwa/wardrobe/age-18',(512,768))
# The fourth generated age-18 cell drifted to male clothing; preserve the correct
# scholar outfit and heroine identity by promoting the validated age-16 variant.
scholar=Image.open(ROOT/'assets/characters/seonhwa/wardrobe/age-16/age13-scholar.png').resize((512,768),Image.Resampling.LANCZOS)
scholar.save(ROOT/'assets/characters/seonhwa/wardrobe/age-18/age13-scholar.png',optimize=True)
