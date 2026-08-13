from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
target=ROOT/'assets/events/vacation'
jobs={
 'spring-stream-v2.webp':'vacation-spring-photoreal-v2.png',
 'summer-seaside-v2.webp':'vacation-summer-photoreal-v2.png',
 'autumn-maple-v2.webp':'vacation-autumn-photoreal-v2.png'
}
for out_name,source_name in jobs.items():
    image=Image.open(ROOT/'assets/reference'/source_name).convert('RGB')
    # Keep a high-resolution 4K-class master while remaining practical for browser loading.
    image.thumbnail((2160,3240),Image.Resampling.LANCZOS)
    image.save(target/out_name,'WEBP',quality=95,method=6)
    print(target/out_name,image.size)
