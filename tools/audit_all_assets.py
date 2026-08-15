from __future__ import annotations

import hashlib
import sys
from collections import Counter, defaultdict
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "assets"
RASTER_EXTENSIONS = {".png", ".webp", ".jpg", ".jpeg"}
ALPHA_HINTS = ("characters", "sprites", "fullbody-expressions", "activity-icons")
ALPHA_EXCEPTIONS = ("source-sheets", "reference", "photoreal", "backgrounds", "cinematics")


def expects_alpha(path: Path) -> bool:
    normalized = path.as_posix().lower()
    return path.suffix.lower() == ".png" and any(hint in normalized for hint in ALPHA_HINTS) and not any(
        exception in normalized for exception in ALPHA_EXCEPTIONS
    )


def main() -> int:
    files = sorted(path for path in ASSET_ROOT.rglob("*") if path.suffix.lower() in RASTER_EXTENSIONS)
    errors: list[str] = []
    warnings: list[str] = []
    formats: Counter[str] = Counter()
    dimensions: Counter[tuple[int, int]] = Counter()
    hashes: defaultdict[str, list[str]] = defaultdict(list)
    alpha_count = 0

    for path in files:
        relative = path.relative_to(ROOT).as_posix()
        if path.stat().st_size == 0:
            errors.append(f"zero-byte file: {relative}")
            continue
        try:
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            hashes[digest].append(relative)
            with Image.open(path) as image:
                image.verify()
            with Image.open(path) as image:
                width, height = image.size
                formats[image.format or path.suffix.upper().lstrip(".")] += 1
                dimensions[(width, height)] += 1
                has_alpha = image.mode in {"RGBA", "LA"} or "transparency" in image.info
                alpha_count += int(has_alpha)
                if width < 32 or height < 32:
                    warnings.append(f"very small raster: {relative} ({width}x{height})")
                if width > 8192 or height > 8192:
                    warnings.append(f"very large raster: {relative} ({width}x{height})")
                if expects_alpha(path) and not has_alpha:
                    errors.append(f"transparent layer expected: {relative} ({image.mode})")
        except Exception as exc:
            errors.append(f"unreadable image: {relative}: {exc}")

    duplicate_groups = [paths for paths in hashes.values() if len(paths) > 1]
    print("FULL ASSET AUDIT")
    print(f"- raster files: {len(files)}")
    print(f"- formats: {dict(sorted(formats.items()))}")
    print(f"- alpha-capable files: {alpha_count}")
    print(f"- distinct dimensions: {len(dimensions)}")
    print(f"- exact duplicate groups: {len(duplicate_groups)}")
    for paths in duplicate_groups[:20]:
        print(f"DUPLICATE {' | '.join(paths)}")
    for warning in warnings:
        print(f"WARNING {warning}")
    for error in errors:
        print(f"ERROR {error}")
    if errors:
        print(f"RESULT FAILED ({len(errors)} errors, {len(warnings)} warnings)")
        return 1
    print(f"RESULT READY (0 errors, {len(warnings)} warnings)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
