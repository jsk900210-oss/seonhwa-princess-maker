from pathlib import Path
from PIL import Image
from shutil import copyfile

ROOT = Path(__file__).resolve().parents[1]
GENERATED = Path(r"C:\Users\jsk90\.codex\generated_images\01a02236-3c80-7392-a2d3-9bff302ab5bc")
CONFIGS = {
    "farmwork": ("exec-c7291249-ecc1-4627-bb89-87e5020439d8.png", [("npc/farmer","idle"),("props","cabbage-basket"),("effects","growing-field"),("failures","spilled-produce"),("failures","running-chicken")]),
    "swordsmanship": ("exec-082938ce-c093-4c64-bf2d-d1b1f0425ad5.png", [("npc/instructor","idle"),("props","overhead-sword"),("effects","target-cut"),("failures","dropped-sword"),("failures","wobbling-target")]),
    "spellcraft": ("exec-15b5c856-bd8f-44af-bf76-2ed03900ec1c.png", [("npc/mage","idle"),("props","magic-wand"),("effects","beast-target-hit"),("failures","backfire-sparks"),("failures","scorched-target")]),
    "classics": ("exec-3dddd0a2-2c78-4d75-8832-a8db04af9ad6.png", [("npc/tutor","idle"),("props","book-stack"),("effects","open-manuscript"),("failures","scattered-books"),("failures","ink-spill")]),
    "masonry": ("exec-8e305b35-92cc-4299-b6b0-54f9e7fdc248.png", [("npc/mason","idle"),("props","chisel-block"),("effects","fitted-wall"),("failures","cracked-stone"),("failures","wobbling-stack")]),
    "clinichelp": ("exec-5700489c-9862-429b-aa46-2f164e4a8e48.png", [("npc/physician","idle"),("props","herb-mortar"),("effects","medicine-packets"),("failures","spilled-herbs"),("failures","wrong-medicine")]),
    "innhelp": ("exec-b7971756-6f3c-4694-abb3-5dfc2f10ad26.png", [("npc/hostess","idle"),("props","meal-tray"),("effects","payment"),("failures","spilled-tray"),("failures","mixed-orders")]),
    "ferryhelp": ("exec-04f7c942-e9c6-4de3-a91f-df9d386cf008.png", [("npc/ferryman","idle"),("props","boat-cargo"),("effects","stacked-parcels"),("failures","loose-parcel"),("failures","wet-crate")]),
    "merchanthelp": ("exec-602fc731-fd59-4f4d-ad90-55e4813f2267.png", [("npc/merchant","idle"),("props","goods-display"),("effects","coin-exchange"),("failures","toppled-goods"),("failures","wrong-change")]),
    "accounting": ("exec-3dd7ba1e-731a-412f-a8aa-4f4659c3af6b.png", [("npc/accountant","idle"),("props","abacus-ledger"),("effects","balanced-tally"),("failures","scattered-coins"),("failures","wrong-ledger")]),
    "tutoring": ("exec-6d69e35f-7ea9-46ae-a9d7-7aa07ec5a023.png", [("npc/tutor","idle"),("props","writing-desk"),("effects","praised-pages"),("failures","scattered-papers"),("failures","ink-blot")]),
}

def remove_checker(image):
    rgba=image.convert("RGBA"); px=rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r,g,b,_=px[x,y]
            if max(r,g,b)-min(r,g,b)<=7 and min(r,g,b)>=231: px[x,y]=(0,0,0,0)
    return rgba

def remove_speckles(image, minimum=10):
    a=image.getchannel("A"); mask=a.load(); seen=set(); out=image.copy(); opx=out.load()
    for y in range(image.height):
        for x in range(image.width):
            if not mask[x,y] or (x,y) in seen: continue
            stack=[(x,y)]; seen.add((x,y)); component=[]
            while stack:
                px,py=stack.pop(); component.append((px,py))
                for nx,ny in ((px-1,py),(px+1,py),(px,py-1),(px,py+1)):
                    if 0<=nx<image.width and 0<=ny<image.height and mask[nx,ny] and (nx,ny) not in seen: seen.add((nx,ny)); stack.append((nx,ny))
            if len(component)<minimum:
                for px,py in component: opx[px,py]=(0,0,0,0)
    return out

def fit(cell, npc=False):
    bbox=cell.getchannel("A").getbbox(); canvas=Image.new("RGBA",(320,320),(0,0,0,0))
    if not bbox:return canvas
    item=cell.crop(bbox); max_w,max_h=((300,230) if npc else (300,210)); scale=min(max_w/item.width,max_h/item.height)
    size=(round(item.width*scale),round(item.height*scale)); item=item.resize(size,Image.Resampling.LANCZOS)
    canvas.alpha_composite(item,((320-size[0])//2,310-size[1])); clean=remove_speckles(canvas); bbox=clean.getchannel("A").getbbox()
    if not bbox:return clean
    subject=clean.crop(bbox); rebased=Image.new("RGBA",(320,320),(0,0,0,0)); rebased.alpha_composite(subject,((320-subject.width)//2,310-subject.height))
    if npc:
        anchors=rebased.load(); anchors[20,309]=(255,255,255,1); anchors[299,309]=(255,255,255,1)
    return rebased

for activity,(source_name,rows) in CONFIGS.items():
    sheet=remove_checker(Image.open(GENERATED/source_name)); xs=[round(i*sheet.width/3) for i in range(4)]; ys=[round(i*sheet.height/5) for i in range(6)]
    for row,(folder,stem) in enumerate(rows):
        target=ROOT/"assets"/"schedule-layers-v2"/activity/folder; target.mkdir(parents=True,exist_ok=True)
        for column in range(3): fit(sheet.crop((xs[column],ys[row],xs[column+1],ys[row+1])),row==0).save(target/f"{stem}-{column+1}.png")
    print("wrote",activity)

# The merchant atlas's payment row contains a person; reuse the clean accounting
# tally layer so props and NPCs remain strictly separated.
for frame in range(1,4):
    source=ROOT/"assets"/"schedule-layers-v2"/"accounting"/"effects"/f"balanced-tally-{frame}.png"
    target=ROOT/"assets"/"schedule-layers-v2"/"merchanthelp"/"effects"/f"coin-exchange-{frame}.png"
    copyfile(source,target)
