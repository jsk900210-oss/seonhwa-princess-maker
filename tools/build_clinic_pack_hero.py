from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(r"C:\Users\jsk90\.codex\generated_images\01a02236-3c80-7392-a2d3-9bff302ab5bc\exec-8af89056-eb61-4af7-8d6f-690ec1f0c5b2.png")
TARGET=ROOT/"assets"/"characters"/"seonhwa"/"schedule-actions"

def transparent_checker(image):
    image=image.convert("RGBA")
    pixels=image.load()
    for y in range(image.height):
        for x in range(image.width):
            r,g,b,_=pixels[x,y]
            if max(r,g,b)-min(r,g,b)<=7 and min(r,g,b)>=231:
                pixels[x,y]=(0,0,0,0)
    return image

def remove_speckles(image, minimum=30):
    alpha=image.getchannel("A")
    mask=alpha.load()
    output=image.copy()
    pixels=output.load()
    seen=set()
    for y in range(image.height):
        for x in range(image.width):
            if not mask[x,y] or (x,y) in seen:
                continue
            stack=[(x,y)]
            seen.add((x,y))
            component=[]
            while stack:
                px,py=stack.pop()
                component.append((px,py))
                for nx,ny in ((px-1,py),(px+1,py),(px,py-1),(px,py+1)):
                    if 0<=nx<image.width and 0<=ny<image.height and mask[nx,ny] and (nx,ny) not in seen:
                        seen.add((nx,ny))
                        stack.append((nx,ny))
            if len(component)<minimum:
                for px,py in component:
                    pixels[px,py]=(0,0,0,0)
    return output

sheet=transparent_checker(Image.open(SOURCE))
xs=[round(i*sheet.width/3) for i in range(4)]
for index in range(3):
    cell=sheet.crop((xs[index],0,xs[index+1],sheet.height))
    bbox=cell.getchannel("A").getbbox()
    subject=cell.crop(bbox)
    scale=min(292/subject.width,292/subject.height)
    size=(round(subject.width*scale),round(subject.height*scale))
    subject=subject.resize(size,Image.Resampling.LANCZOS)
    canvas=Image.new("RGBA",(320,320),(0,0,0,0))
    canvas.alpha_composite(subject,((320-size[0])//2,310-size[1]))
    remove_speckles(canvas).save(TARGET/f"clinic-pack-pixel-{index+1}.png")
print("wrote clinic-pack-pixel-1~3.png")
