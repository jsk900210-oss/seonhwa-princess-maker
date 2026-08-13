from pathlib import Path
from PIL import Image
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
base=ROOT/'assets/characters/seonhwa/age-09/sprites/activities'

def clear_region(name, x1, y1, x2, y2):
    path=base/name
    data=np.array(Image.open(path).convert('RGBA'))
    data[y1:y2,x1:x2,3]=0
    Image.fromarray(data,'RGBA').save(path,optimize=True)
    print(path)

# Detached heads from the next sheet row.
clear_region('herbs-1.png',0,270,320,320)
clear_region('herbs-2.png',0,270,320,320)
# Sliver from the neighbouring rest panel.
clear_region('rest-3.png',0,0,42,320)
