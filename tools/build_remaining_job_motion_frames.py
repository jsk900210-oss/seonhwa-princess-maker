from pathlib import Path

from PIL import Image

from build_core_job_motion_frames import clear_checkerboard, content_bounds


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets/characters/seonhwa/job-actions"
ATLASES = (
    (OUTPUT / "craft-job-motion-atlas-source.png", ("woodwork", "loomwork", "masonry")),
    (OUTPUT / "service-job-motion-atlas-source.png", ("clinichelp", "ferryhelp", "merchanthelp")),
)


def render_atlas(source: Path, names: tuple[str, ...]) -> None:
    atlas = clear_checkerboard(Image.open(source))
    cell_width, cell_height = atlas.width // 3, atlas.height // 3
    for row, name in enumerate(names):
        for column in range(3):
            cell = atlas.crop((column * cell_width, row * cell_height,
                               (column + 1) * cell_width, (row + 1) * cell_height))
            bounds = content_bounds(cell)
            if bounds:
                cell = cell.crop(bounds)
            cell.thumbnail((232, 220), Image.Resampling.LANCZOS)
            frame = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
            frame.alpha_composite(cell, ((256 - cell.width) // 2, 244 - cell.height))
            frame.save(OUTPUT / f"{name}-{column + 1}.png", optimize=True)


def main() -> None:
    for source, names in ATLASES:
        render_atlas(source, names)


if __name__ == "__main__":
    main()
