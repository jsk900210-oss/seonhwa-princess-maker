from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SPRITES = ROOT / "assets" / "characters" / "seonhwa" / "job-actions"
FILES = sorted(SPRITES.glob("*-v2-[1-3].png"))


def clean_edge(path: Path) -> int:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size
    remove = set()
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            touches_clear = any(
                0 <= nx < width and 0 <= ny < height and pixels[nx, ny][3] == 0
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
            )
            # 생성 과정에서 투명 경계에 남은 순백/회백 매트만 제거한다.
            if touches_clear and min(r, g, b) >= 165 and max(r, g, b) - min(r, g, b) <= 45:
                remove.add((x, y))
    for x, y in remove:
        pixels[x, y] = (0, 0, 0, 0)
    image.save(path, optimize=True)
    return len(remove)


if __name__ == "__main__":
    for sprite in FILES:
        print(f"{sprite.name}: removed {clean_edge(sprite)} matte pixels")
