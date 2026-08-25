from __future__ import annotations

import hashlib
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "assets"
RASTER_EXTENSIONS = {".png", ".webp", ".jpg", ".jpeg"}
ALPHA_HINTS = (
    "sprites",
    "fullbody-expressions",
    "dialogue-fullbody",
    "activity-icons",
    "schedule-actions",
    "schedule-layers",
)
ALPHA_EXCEPTIONS = (
    "source-sheets",
    "source-pixel",
    "reference",
    "photoreal",
    "background",
    "cinematics",
    "chroma",
    "-sheet",
)


def expects_alpha(path: Path) -> bool:
    normalized = path.as_posix().lower()
    return path.suffix.lower() == ".png" and any(hint in normalized for hint in ALPHA_HINTS) and not any(
        exception in normalized for exception in ALPHA_EXCEPTIONS
    )


def declared_frame_sequences(value: object, base: Path):
    """Yield runtime frame lists declared by a v2 schedule manifest."""
    if isinstance(value, dict):
        for key, child in value.items():
            if key in {
                "frames",
                "heroFrames",
                "npcFrames",
                "failureHeroFrames",
                "npcFailureFallFrames",
                "existingHeroFrames",
            } and isinstance(child, list) and len(child) >= 2 and all(isinstance(item, str) for item in child):
                yield [((base / item).resolve()) for item in child]
            else:
                yield from declared_frame_sequences(child, base)
    elif isinstance(value, list):
        for child in value:
            yield from declared_frame_sequences(child, base)


def main() -> int:
    files = sorted(path for path in ASSET_ROOT.rglob("*") if path.suffix.lower() in RASTER_EXTENSIONS)
    errors: list[str] = []
    warnings: list[str] = []
    formats: Counter[str] = Counter()
    dimensions: Counter[tuple[int, int]] = Counter()
    hashes: defaultdict[str, list[str]] = defaultdict(list)
    alpha_count = 0
    runtime_sequences: list[list[Path]] = []
    active_runtime_files: set[Path] = set()
    binary_alpha_files: set[Path] = set()

    for manifest_path in sorted((ASSET_ROOT / "schedule-layers-v2").glob("*/manifest.json")):
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        runtime_sequences.extend(declared_frame_sequences(manifest, manifest_path.parent))
    for sequence in runtime_sequences:
        active_runtime_files.update(path for path in sequence if path.suffix.lower() == ".png")
    herb_startle = (ASSET_ROOT / "characters/seonhwa/schedule-actions/herbs-startle-arms-up-v1.png").resolve()
    active_runtime_files.add(herb_startle)
    binary_alpha_files.add(herb_startle)

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
                if path.resolve() in active_runtime_files and path.suffix.lower() == ".png":
                    rgba = image.convert("RGBA")
                    alpha = rgba.getchannel("A")
                    border = (
                        list(alpha.crop((0, 0, width, 1)).get_flattened_data())
                        + list(alpha.crop((0, height - 1, width, height)).get_flattened_data())
                        + list(alpha.crop((0, 0, 1, height)).get_flattened_data())
                        + list(alpha.crop((width - 1, 0, width, height)).get_flattened_data())
                    )
                    if max(border, default=0) > 20:
                        errors.append(f"active layer touches canvas edge: {relative}")
                    if path.resolve() in binary_alpha_files:
                        translucent = sum(
                            0 < alpha_value < 255
                            for _, _, _, alpha_value in rgba.get_flattened_data()
                        )
                        if translucent:
                            errors.append(f"hard-edge layer has translucent matte: {relative} ({translucent} pixels)")
        except Exception as exc:
            errors.append(f"unreadable image: {relative}: {exc}")

    for sequence in runtime_sequences:
        existing = [path for path in sequence if path.exists()]
        if len(existing) != len(sequence):
            continue
        sequence_hashes = [hashlib.sha256(path.read_bytes()).hexdigest() for path in existing]
        if len(set(sequence_hashes)) == 1:
            relative = [path.relative_to(ROOT).as_posix() for path in existing]
            errors.append(f"static runtime frame sequence: {' | '.join(relative)}")

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
