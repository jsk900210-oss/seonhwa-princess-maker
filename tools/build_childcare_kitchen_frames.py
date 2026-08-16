from pathlib import Path

from PIL import Image

from build_core_job_motion_frames import clear_checkerboard, content_bounds


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets/characters/seonhwa/job-actions"
SOURCE = OUTPUT / "childcare-kitchen-correction-atlas-source.png"
NAMES = ("childcare", "kitchenhelp")


def main() -> None:
    atlas = clear_checkerboard(Image.open(SOURCE))
    cell_width, cell_height = atlas.width // 3, atlas.height // 2
    for row, name in enumerate(NAMES):
        for column in range(3):
            # The generator may let a neighbouring pose touch a grid boundary.
            # Trim a small gutter before finding the subject bounds so fragments
            # from the next cell never enter an exported animation frame.
            gutter_x, gutter_y = 46, 10
            cell = atlas.crop((column * cell_width + gutter_x, row * cell_height + gutter_y,
                               (column + 1) * cell_width - gutter_x, (row + 1) * cell_height - gutter_y))
            bounds = content_bounds(cell)
            if bounds:
                cell = cell.crop(bounds)
            cell.thumbnail((232, 220), Image.Resampling.LANCZOS)
            frame = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
            frame.alpha_composite(cell, ((256 - cell.width) // 2, 244 - cell.height))
            frame.save(OUTPUT / f"{name}-{column + 1}.png", optimize=True)


if __name__ == "__main__":
    main()
