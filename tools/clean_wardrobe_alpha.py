from pathlib import Path
from PIL import Image
import numpy as np
from collections import deque

ROOT = Path(__file__).resolve().parents[1]
WARDROBE = ROOT / 'assets/characters/seonhwa/wardrobe'

for path in sorted(WARDROBE.rglob('*.png')):
    image = Image.open(path).convert('RGBA')
    data = np.array(image)
    mask = data[:, :, 3] > 12
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    components = []
    for y in range(height):
        for x in range(width):
            if not mask[y, x] or seen[y, x]:
                continue
            queue = deque([(y, x)]); seen[y, x] = True; component = []
            while queue:
                cy, cx = queue.popleft(); component.append((cy, cx))
                for ny, nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
                    if 0 <= ny < height and 0 <= nx < width and mask[ny,nx] and not seen[ny,nx]:
                        seen[ny,nx] = True; queue.append((ny,nx))
            components.append(component)
    if len(components) < 2:
        continue
    largest = max(components, key=len)
    # Preserve the complete character, but discard disconnected sheet fragments.
    keep = np.zeros_like(mask, dtype=bool)
    ys, xs = zip(*largest); keep[ys, xs] = True
    removed = int(mask.sum() - keep.sum())
    if removed > 20:
        data[~keep, 3] = 0
        image = Image.fromarray(data, 'RGBA')
        image.save(path, optimize=True)
        print(f'{path.relative_to(ROOT)}: removed {removed} stray pixels')
