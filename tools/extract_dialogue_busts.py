from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "characters" / "dialogue-busts" / "seonhwa"
EXPRESSIONS = ("neutral", "smile", "joyful", "nervous", "startled", "sad", "determined", "shy")


def connected_background(rgb: np.ndarray) -> np.ndarray:
    height, width, _ = rgb.shape
    dark = rgb.max(axis=2) < 92
    warm = (rgb[:, :, 0] >= rgb[:, :, 1] * 1.05) & (rgb[:, :, 1] >= rgb[:, :, 2] * .92)
    eligible = dark & warm
    seen = np.zeros((height, width), dtype=bool)
    queue = deque()
    for x in range(width):
        for y in (0, height - 1):
            if eligible[y, x] and not seen[y, x]:
                seen[y, x] = True; queue.append((y, x))
    for y in range(height):
        for x in (0, width - 1):
            if eligible[y, x] and not seen[y, x]:
                seen[y, x] = True; queue.append((y, x))
    while queue:
        y, x = queue.popleft()
        current = rgb[y, x].astype(np.int16)
        for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0 <= ny < height and 0 <= nx < width and eligible[ny, nx] and not seen[ny, nx]:
                if np.linalg.norm(rgb[ny, nx].astype(np.int16) - current) <= 7:
                    seen[ny, nx] = True; queue.append((ny, nx))
    return seen


def fill_silhouette(foreground: np.ndarray) -> np.ndarray:
    closed = Image.fromarray((foreground * 255).astype(np.uint8), "L")
    closed = closed.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.MinFilter(25))
    solid = np.asarray(closed) > 127
    height, width = solid.shape
    outside = np.zeros_like(solid)
    queue = deque()
    for x in range(width):
        for y in (0, height - 1):
            if not solid[y, x] and not outside[y, x]: outside[y, x] = True; queue.append((y, x))
    for y in range(height):
        for x in (0, width - 1):
            if not solid[y, x] and not outside[y, x]: outside[y, x] = True; queue.append((y, x))
    while queue:
        y, x = queue.popleft()
        for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0 <= ny < height and 0 <= nx < width and not solid[ny, nx] and not outside[ny, nx]:
                outside[ny, nx] = True; queue.append((ny, nx))
    return foreground | ~outside


def modeled_foreground(rgb: np.ndarray) -> np.ndarray:
    return fill_silhouette(rgb.max(axis=2) >= 58)


def trim_top_spikes(foreground: np.ndarray) -> np.ndarray:
    result = foreground.copy(); height, width = result.shape
    tops = np.array([np.argmax(result[:, x]) if result[:, x].any() else height for x in range(width)])
    smoothed = tops.copy()
    for x in range(width):
        left, right = max(0, x - 14), min(width, x + 15)
        smoothed[x] = int(np.median(tops[left:right]))
    for x in range(width):
        if tops[x] + 10 < smoothed[x]: result[:max(0, smoothed[x] - 4), x] = False
    return result


def largest_component(foreground: np.ndarray) -> np.ndarray:
    height, width = foreground.shape; seen = np.zeros_like(foreground); best = []
    for y in range(height):
        for x in range(width):
            if not foreground[y, x] or seen[y, x]: continue
            queue = deque([(y, x)]); seen[y, x] = True; component = []
            while queue:
                cy, cx = queue.popleft(); component.append((cy, cx))
                for ny, nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
                    if 0 <= ny < height and 0 <= nx < width and foreground[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True; queue.append((ny, nx))
            if len(component) > len(best): best = component
    result = np.zeros_like(foreground)
    for y, x in best: result[y, x] = True
    return result


def clear_dark_sheet_edges(foreground: np.ndarray, rgb: np.ndarray) -> np.ndarray:
    result = foreground.copy(); height, width = result.shape
    edge = np.zeros_like(result); side = max(3, int(width * .045)); bottom = max(3, int(height * .035))
    edge[:, :side] = True; edge[:, width-side:] = True; edge[height-bottom:, :] = True
    top = max(3, int(height * .035)); edge[:top, :int(width * .18)] = True; edge[:top, int(width * .82):] = True
    result[edge & (rgb.max(axis=2) < 90)] = False
    return result


def extract(sheet_path: Path, age: str) -> None:
    sheet = Image.open(sheet_path).convert("RGB")
    cell_w, cell_h = sheet.width // 4, sheet.height // 2
    for index, expression in enumerate(EXPRESSIONS):
        col, row = index % 4, index // 4
        cell = sheet.crop((col * cell_w, row * cell_h, (col + 1) * cell_w, (row + 1) * cell_h))
        rgb = np.asarray(cell).copy()
        foreground = clear_dark_sheet_edges(largest_component(trim_top_spikes(modeled_foreground(rgb))), rgb)
        alpha = Image.fromarray(np.where(foreground, 255, 0).astype(np.uint8), "L")
        alpha = alpha.filter(ImageFilter.GaussianBlur(.7))
        rgba = cell.convert("RGBA")
        rgba.putalpha(alpha)
        rgba.save(SOURCE / f"age-{age}-{expression}-v1.png", optimize=True)


for age in ("09", "13", "16", "18"):
    extract(SOURCE / f"age-{age}-expression-sheet-v1.png", age)
