from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

REQUIRED_DIRS = (
    "src",
    "assets/audio/music",
    "assets/backgrounds",
    "assets/characters/seonhwa",
    "assets/characters/npcs",
    "assets/events",
    "assets/items/food",
    "assets/ui",
    "assets/reference",
    "assets/source-sheets",
    "docs/story",
    "docs/qa",
    "docs/assets",
    "tools",
)

REQUIRED_FILES = (
    "src/index.html",
    "src/app.js",
    "src/story-data.js",
    "README.md",
    "CHANGELOG.md",
    "UPDATE_ATTEMPTS.md",
    "VERSIONING.md",
    "GAMEPLAY_ROADMAP.md",
    "DIRECTORY_STRUCTURE.md",
)

ASSET_REFERENCE = re.compile(r"(?:\.\./)?assets/[A-Za-z0-9_./${}-]+\.(?:png|webp|jpg|jpeg|mp3)")


def main() -> int:
    errors: list[str] = []

    for relative in REQUIRED_DIRS:
        if not (ROOT / relative).is_dir():
            errors.append(f"missing directory: {relative}")

    for relative in REQUIRED_FILES:
        if not (ROOT / relative).is_file():
            errors.append(f"missing file: {relative}")

    for source in (ROOT / "src").glob("*"):
        if source.suffix.lower() not in {".html", ".css", ".js"}:
            continue
        text = source.read_text(encoding="utf-8")
        for match in ASSET_REFERENCE.findall(text):
            if "${" in match:
                continue
            relative = match.removeprefix("../")
            if not (ROOT / relative).is_file():
                errors.append(f"broken asset reference: {source.relative_to(ROOT)} -> {relative}")

    for path in sorted(ROOT.glob("tmp-*")):
        if path.is_file():
            errors.append(f"temporary file in repository root: {path.name}")

    if errors:
        print("PROJECT STRUCTURE CHECK: FAILED")
        for error in errors:
            print(f"- {error}")
        return 1

    print("PROJECT STRUCTURE CHECK: READY")
    print(f"- required directories: {len(REQUIRED_DIRS)}")
    print(f"- required files: {len(REQUIRED_FILES)}")
    print("- static asset references: OK")
    print("- temporary root files: none")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
