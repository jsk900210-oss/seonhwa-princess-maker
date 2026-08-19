from pathlib import Path

from PIL import Image


SOURCE = Path(
    r"C:\Users\jsk90\Documents\Codex\2026-08-12\referenced-chatgpt-conversation-this-is-an-2\outputs\seonhwa-princess-mvp\assets\characters\seonhwa\schedule-actions\seonhwa-schedule-actions-job-sheet-v2.png"
)
TARGET = SOURCE.parent

ROWS = [
    "childcare",
    "kitchenhelp",
    "woodwork",
    "loomwork",
    "masonry",
    "clinichelp",
    "ferryhelp",
    "merchanthelp",
]


def main() -> None:
    image = Image.open(SOURCE).convert("RGBA")
    width, height = image.size
    cell_w = width // 3
    cell_h = height // len(ROWS)
    for row_index, name in enumerate(ROWS):
        for col_index in range(3):
            left = col_index * cell_w
            top = row_index * cell_h
            right = width if col_index == 2 else (col_index + 1) * cell_w
            bottom = height if row_index == len(ROWS) - 1 else (row_index + 1) * cell_h
            frame = image.crop((left, top, right, bottom))
            frame.save(TARGET / f"{name}-{col_index + 1}.png", optimize=True)
            print(TARGET / f"{name}-{col_index + 1}.png")


if __name__ == "__main__":
    main()
