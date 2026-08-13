from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
folder=ROOT/'assets/characters/seonhwa/age-09/sprites/activities'

def normalize(name,target_height=245):
    for n in range(1,4):
        source=Image.open(folder/f'{name}-{n}.png').convert('RGBA')
        box=source.getbbox()
        subject=source.crop(box)
        scale=min(270/subject.width,target_height/subject.height)
        subject=subject.resize((round(subject.width*scale),round(subject.height*scale)),Image.Resampling.NEAREST)
        canvas=Image.new('RGBA',(320,320),(0,0,0,0))
        x=(320-subject.width)//2;y=285-subject.height
        canvas.alpha_composite(subject,(x,y))
        canvas.save(folder/f'{name}-fixed-{n}.png',optimize=True)

normalize('manners',220)
normalize('errand',250)
