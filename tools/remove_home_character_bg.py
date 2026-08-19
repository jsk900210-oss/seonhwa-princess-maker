from collections import deque
from pathlib import Path

from PIL import Image


SOURCE = Path(
    r"C:\Users\jsk90\Documents\Codex\2026-08-12\referenced-chatgpt-conversation-this-is-an-2\outputs\seonhwa-princess-mvp\assets\characters\seonhwa\age-09\base\seonhwa-age09-home-main-v4-transparent.png"
)
TARGET = Path(
    r"C:\Users\jsk90\Documents\Codex\2026-08-12\referenced-chatgpt-conversation-this-is-an-2\outputs\seonhwa-princess-mvp\assets\characters\seonhwa\age-09\base\seonhwa-age09-home-main-v5-transparent.png"
)


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a < 240:
        return False
    hi = max(r, g, b)
    lo = min(r, g, b)
    return lo >= 236 and (hi - lo) <= 18


def main() -> None:
    image = Image.open(SOURCE).convert("RGBA")
    width, height = image.size
    pixels = image.load()
    seen: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= width or y >= height:
            return
        if (x, y) in seen:
            return
        if not is_background(pixels[x, y]):
            return
        seen.add((x, y))
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        enqueue(x + 1, y)
        enqueue(x - 1, y)
        enqueue(x, y + 1)
        enqueue(x, y - 1)

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    image.save(TARGET)
    print(TARGET)


if __name__ == "__main__":
    main()
