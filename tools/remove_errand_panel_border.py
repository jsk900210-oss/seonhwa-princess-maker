from pathlib import Path
from PIL import Image
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
base=ROOT/'assets/characters/seonhwa/age-09/sprites/activities'
for index in (1,2,3):
    path=base/f'errand-v2-{index}.png'
    data=np.array(Image.open(path).convert('RGBA'))
    rgb=data[:,:,:3]
    # Remove only pale near-neutral separator pixels connected to the canvas edge.
    pale=(rgb.min(axis=2)>185)&((rgb.max(axis=2)-rgb.min(axis=2))<28)&(data[:,:,3]>0)
    edge=np.zeros(pale.shape,dtype=bool);edge[:8,:]=True;edge[-8:,:]=True;edge[:,:8]=True;edge[:,-8:]=True
    seeds=np.argwhere(pale&edge);seen=np.zeros(pale.shape,dtype=bool);stack=[tuple(x) for x in seeds]
    while stack:
        y,x=stack.pop()
        if seen[y,x] or not pale[y,x]:continue
        seen[y,x]=True
        for ny,nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0<=ny<pale.shape[0] and 0<=nx<pale.shape[1] and not seen[ny,nx] and pale[ny,nx]:stack.append((ny,nx))
    data[seen,3]=0
    # The source sheet also baked a thin grey rectangular frame just inside the crop.
    data[:28,:,3]=0
    data[306:,:,3]=0
    data[:,:12,3]=0
    data[:,302:,3]=0
    Image.fromarray(data,'RGBA').save(path,optimize=True)
    Image.fromarray(data,'RGBA').save(base/f'errand-v3-{index}.png',optimize=True)
    print(path,int(seen.sum()))
