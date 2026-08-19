from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SEONHWA = ROOT / "assets" / "characters" / "seonhwa"
SCHEDULE_BASE = SEONHWA / "schedule-base"
SCHEDULE_ACTIONS = SEONHWA / "schedule-actions"

BASE_SHEET = SCHEDULE_BASE / "seonhwa-schedule-base-pose-sheet-v1.png"
CORE_SHEET = SCHEDULE_ACTIONS / "seonhwa-schedule-actions-core-sheet-v1.png"
LIFE_SHEET = SCHEDULE_ACTIONS / "seonhwa-schedule-actions-life-sheet-v1.png"
JOB_SHEET = SCHEDULE_ACTIONS / "seonhwa-schedule-actions-job-sheet-v1.png"

CANVAS_SIZE = 296


def clear_checkerboard(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    transparent = set()
    for y in range(height):
        for x in range(width):
            red, green, blue, _ = pixels[x, y]
            if min(red, green, blue) > 222 and max(red, green, blue) - min(red, green, blue) < 9:
                pixels[x, y] = (red, green, blue, 0)
                transparent.add((x, y))

    seen = set()
    for seed in tuple(transparent):
        if seed in seen:
            continue
        queue = deque([seed])
        component = []
        touches_edge = False
        seen.add(seed)
        while queue:
            x, y = queue.popleft()
            component.append((x, y))
            touches_edge |= x == 0 or y == 0 or x == width - 1 or y == height - 1
            for point in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if point in transparent and point not in seen:
                    seen.add(point)
                    queue.append(point)
        if not touches_edge and len(component) < 120:
            for x, y in component:
                red, green, blue, _ = pixels[x, y]
                pixels[x, y] = (red, green, blue, 255)
    return rgba


def content_bounds(image: Image.Image):
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    return bounds


def export_cell(source: Path, columns: int, index: int, target: Path, mode: str = "default") -> None:
    sheet = clear_checkerboard(Image.open(source))
    cell_width = sheet.width // columns
    left = index * cell_width
    right = sheet.width if index == columns - 1 else (index + 1) * cell_width
    cell = sheet.crop((left, 0, right, sheet.height))
    bounds = content_bounds(cell)
    if bounds:
        cell = cell.crop(bounds)

    if mode == "sleep":
        cell.thumbnail((250, 190), Image.Resampling.LANCZOS)
        frame = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
        frame.alpha_composite(cell, ((CANVAS_SIZE - cell.width) // 2, 234 - cell.height))
    else:
        cell.thumbnail((232, 232), Image.Resampling.LANCZOS)
        frame = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
        frame.alpha_composite(cell, ((CANVAS_SIZE - cell.width) // 2, 252 - cell.height))

    target.parent.mkdir(parents=True, exist_ok=True)
    frame.save(target, optimize=True)


def main() -> None:
    # Base walk/idle/sleep
    export_cell(BASE_SHEET, 4, 0, SCHEDULE_BASE / "stand-1.png")
    export_cell(BASE_SHEET, 4, 1, SCHEDULE_BASE / "walk-1.png")
    export_cell(BASE_SHEET, 4, 2, SCHEDULE_BASE / "walk-2.png")
    export_cell(BASE_SHEET, 4, 3, SCHEDULE_BASE / "sleep-1.png", mode="sleep")

    # Core actions
    export_cell(CORE_SHEET, 3, 0, SCHEDULE_ACTIONS / "sit-1.png")
    export_cell(CORE_SHEET, 3, 1, SCHEDULE_ACTIONS / "study-1.png")
    export_cell(CORE_SHEET, 3, 2, SCHEDULE_ACTIONS / "houseclean-1.png")

    # Life actions
    export_cell(LIFE_SHEET, 3, 0, SCHEDULE_ACTIONS / "errand-1.png")
    export_cell(LIFE_SHEET, 3, 1, SCHEDULE_ACTIONS / "herbs-1.png")
    export_cell(LIFE_SHEET, 3, 2, SCHEDULE_ACTIONS / "sweeping-1.png")

    # Job actions
    export_cell(JOB_SHEET, 3, 0, SCHEDULE_ACTIONS / "kitchenhelp-1.png")
    export_cell(JOB_SHEET, 3, 1, SCHEDULE_ACTIONS / "childcare-1.png")
    export_cell(JOB_SHEET, 3, 2, SCHEDULE_ACTIONS / "merchanthelp-1.png")

    print("Built schedule-base and schedule-actions frame assets from the new approved sheets.")


if __name__ == "__main__":
    main()
