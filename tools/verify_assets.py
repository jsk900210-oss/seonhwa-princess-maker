import json
import re
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "manifest.json"
VALID_NAME = re.compile(r"^[a-z0-9][a-z0-9-]*\.(png|webp)$")

def main():
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    errors, skipped = [], []
    for item in data["assets"]:
        path = ROOT / item["path"]
        if item["status"] != "ready":
            skipped.append(f'{item["id"]}: {item["status"]}')
            continue
        if not path.is_file():
            errors.append(f"누락: {item['path']}")
            continue
        if not VALID_NAME.match(path.name):
            errors.append(f"파일명 규칙 위반: {path.name}")
        try:
            with Image.open(path) as image:
                image.verify()
            with Image.open(path) as image:
                if image.size != (item["width"], item["height"]):
                    errors.append(f"해상도 불일치: {path.name} {image.size}")
                has_alpha = image.mode in ("RGBA", "LA") or "transparency" in image.info
                if item["alphaRequired"] and not has_alpha:
                    errors.append(f"투명도 없음: {path.name}")
                print(f"OK {path.name}: {image.format} {image.size} {image.mode}")
        except Exception as exc:
            errors.append(f"손상 또는 판독 실패: {path.name}: {exc}")
    for item in skipped:
        print(f"WAIT {item}")
    if errors:
        print("\n".join(f"ERROR {e}" for e in errors))
        return 1
    print("READY 자산 검사 통과")
    return 0

if __name__ == "__main__":
    sys.exit(main())

