from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "characters" / "seonhwa" / "activity-modular"
ROWS = ("calligraphy", "arithmetic", "manners", "houseclean", "errand", "rest")


def clear_border_spill(frame: Image.Image) -> Image.Image:
    """Remove fragments from neighbouring grid cells that cross a crop edge."""
    alpha = frame.getchannel("A")
    width, height = frame.size
    visited = set()
    components = []
    for y in range(height):
        for x in range(width):
            origin = (x, y)
            if origin in visited or alpha.getpixel(origin) <= 12:
                continue
            component = set()
            stack = [origin]
            touches_border = False
            while stack:
                point = stack.pop()
                if point in visited:
                    continue
                visited.add(point)
                component.add(point)
                px, py = point
                touches_border |= px in (0, width - 1) or py in (0, height - 1)
                for neighbour in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    nx, ny = neighbour
                    if 0 <= nx < width and 0 <= ny < height and neighbour not in visited and alpha.getpixel(neighbour) > 12:
                        stack.append(neighbour)
            components.append((component, touches_border))
    largest = max((len(points) for points, _ in components), default=0)
    remove = set().union(*(points for points, border in components if border and len(points) < largest))
    if remove:
        pixels = frame.load()
        for x, y in remove:
            pixels[x, y] = (0, 0, 0, 0)
    return frame


def slice_sheet(age: str) -> None:
    sheet = Image.open(SOURCE / f"age{age}-master.png").convert("RGBA")
    cell = 296
    output = SOURCE / f"age-{age}"
    output.mkdir(parents=True, exist_ok=True)
    for row, activity in enumerate(ROWS):
        for column in range(3):
            left = round(column * sheet.width / 3)
            right = round((column + 1) * sheet.width / 3)
            top = round(row * sheet.height / 6)
            bottom = round((row + 1) * sheet.height / 6)
            frame = clear_border_spill(sheet.crop((left, top, right, bottom)))
            canvas = Image.new("RGBA", (cell, cell))
            canvas.alpha_composite(frame, ((cell - frame.width) // 2, (cell - frame.height) // 2))
            canvas.save(output / f"{activity}-{column + 1}.png", optimize=True)


for target_age in ("09", "13", "16", "18"):
    slice_sheet(target_age)
