from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
base=ROOT/'assets/backgrounds/pixel-activities'

# Remove white separator bars and neighbouring-sheet slivers, then restore 4:3 game framing.
jobs={
    'market-errand.webp':(24,0,540,720),
    'herb-field.webp':(4,0,520,720),
}
for name,box in jobs.items():
    image=Image.open(base/name).convert('RGB').crop(box)
    image=image.resize((640,480),Image.Resampling.LANCZOS)
    out=base/name.replace('.webp','-v2.webp')
    image.save(out,'WEBP',quality=92,method=6)
    print(out,image.size)

close=base/'close'
market=Image.open(close/'market-errand.webp').convert('RGB')
market.save(close/'market-errand-v2.webp','WEBP',quality=94,method=6)
herbs=Image.open(base/'herb-field-v2.webp').convert('RGB')
herbs=herbs.crop((0,38,640,398)).resize((640,360),Image.Resampling.LANCZOS)
herbs.save(close/'herb-field-v2.webp','WEBP',quality=94,method=6)
print(close/'market-errand-v2.webp',market.size)
print(close/'herb-field-v2.webp',herbs.size)
