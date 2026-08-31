"""Extract ten aligned transparent Seonhwa brush frames from a generated 5x2 sheet."""
from collections import deque
from pathlib import Path
import sys
from PIL import Image

COLS, ROWS, SIZE = 5, 2, 420

def is_checker(pixel):
    red, green, blue = pixel[:3]
    return min(red, green, blue) >= 222 and max(red, green, blue) - min(red, green, blue) <= 18

def clear_connected_checker(cell):
    rgb = cell.convert("RGB")
    width, height = rgb.size
    seen = bytearray(width * height)
    queue = deque()
    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))
    while queue:
        x, y = queue.popleft(); index = y * width + x
        if seen[index] or not is_checker(rgb.getpixel((x, y))):
            continue
        seen[index] = 1
        if x: queue.append((x - 1, y))
        if x + 1 < width: queue.append((x + 1, y))
        if y: queue.append((x, y - 1))
        if y + 1 < height: queue.append((x, y + 1))
    rgba = rgb.convert("RGBA")
    alpha = Image.new("L", (width, height), 255)
    alpha.putdata([0 if value else 255 for value in seen])
    rgba.putalpha(alpha)
    return rgba

def main():
    source = Image.open(sys.argv[1])
    destination = Path(sys.argv[2]); destination.mkdir(parents=True, exist_ok=True)
    x_edges = [round(index * source.width / COLS) for index in range(COLS + 1)]
    y_edges = [round(index * source.height / ROWS) for index in range(ROWS + 1)]
    cells=[]
    for row in range(ROWS):
        for column in range(COLS):
            cell=clear_connected_checker(source.crop((x_edges[column],y_edges[row],x_edges[column+1],y_edges[row+1])))
            bounds=cell.getchannel("A").getbbox()
            if not bounds: raise ValueError(f"empty frame {len(cells)+1}")
            cells.append(cell.crop(bounds))
    max_width=max(cell.width for cell in cells); max_height=max(cell.height for cell in cells)
    scale=min((SIZE-12)/max_width,(SIZE-12)/max_height,1)
    for index,cell in enumerate(cells,1):
        resized=cell.resize((round(cell.width*scale),round(cell.height*scale)),Image.Resampling.LANCZOS)
        canvas=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0))
        canvas.alpha_composite(resized,((SIZE-resized.width)//2,SIZE-resized.height-6))
        canvas.save(destination/f"frame-{index:02d}.png",optimize=True)

if __name__ == "__main__": main()
