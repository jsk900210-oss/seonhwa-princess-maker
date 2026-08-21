import hashlib
import json
from datetime import date
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = ROOT / "assets" / "schedule-layers-v2"
JSON_REPORT = ROOT / "docs" / "qa" / "SCHEDULE_LAYER_V2_VERIFICATION.json"
MD_REPORT = ROOT / "docs" / "qa" / "SCHEDULE_LAYER_V2_VERIFICATION.md"


def inspect_png(path):
    with Image.open(path) as image:
        rgba = image.convert("RGBA")
        alpha = rgba.getchannel("A")
        bbox = alpha.getbbox()
        return {
            "size": list(rgba.size),
            "mode": image.mode,
            "hasTransparency": alpha.getextrema()[0] < 255,
            "bbox": list(bbox) if bbox else None,
            "floor": bbox[3] - 1 if bbox else None,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        }


def add_check(checks, activity, name, passed, detail):
    checks.append({"activity": activity, "check": name, "passed": bool(passed), "detail": detail})


def verify_manifest(path, checks, files):
    spec = json.loads(path.read_text(encoding="utf-8"))
    activity = spec["activityId"]
    folder = path.parent
    add_check(checks, activity, "manifest activity folder", folder.name == activity, folder.name)
    hero_paths = spec.get("existingHeroFrames", [])
    add_check(checks, activity, "hero frame count", len(hero_paths) == 3, str(len(hero_paths)))
    for relative in hero_paths:
        resolved = (folder / relative).resolve()
        valid = resolved.exists() and "schedule-layers-v2" not in resolved.parts and "schedule-actions" in resolved.parts
        add_check(checks, activity, "existing hero preserved", valid, str(resolved.relative_to(ROOT)) if resolved.exists() else str(resolved))

    groups = {"npc": spec.get("npc", {}).get("frames", [])}
    groups.update({key: value.get("frames", []) for key, value in spec.get("patterns", {}).items()})
    for group, relatives in groups.items():
        add_check(checks, activity, f"{group} frame count", len(relatives) == 3, str(len(relatives)))
        metrics = []
        for relative in relatives:
            png = folder / relative
            exists = png.exists()
            add_check(checks, activity, "path exists", exists, str(png.relative_to(ROOT)))
            if not exists:
                continue
            try:
                metric = inspect_png(png)
                files[str(png.relative_to(ROOT)).replace("\\", "/")] = metric
                metrics.append(metric)
                add_check(checks, activity, "PNG opens", True, relative)
                add_check(checks, activity, "RGBA/transparency", metric["mode"] == "RGBA" and metric["hasTransparency"], f'{relative}: {metric["mode"]}')
                add_check(checks, activity, "not empty", metric["bbox"] is not None, relative)
                bad_name = any(token in png.name.lower() for token in ("sheet", "guide", "atlas", "chroma", "contact"))
                add_check(checks, activity, "production filename", not bad_name, relative)
            except Exception as error:
                add_check(checks, activity, "PNG opens", False, f"{relative}: {error}")
        if len(metrics) == 3:
            sizes = {tuple(metric["size"]) for metric in metrics}
            hashes = {metric["sha256"] for metric in metrics}
            floors = [metric["floor"] for metric in metrics]
            add_check(checks, activity, f"{group} canvas match", len(sizes) == 1, str(sorted(sizes)))
            add_check(checks, activity, f"{group} frames differ", len(hashes) == 3, f"unique={len(hashes)}")
            add_check(checks, activity, f"{group} floor tolerance", max(floors) - min(floors) <= 2, str(floors))
            if group == "npc":
                widths = [metric["bbox"][2] - metric["bbox"][0] for metric in metrics]
                heights = [metric["bbox"][3] - metric["bbox"][1] for metric in metrics]
                width_ratio = max(widths) / max(1, min(widths))
                height_ratio = max(heights) / max(1, min(heights))
                add_check(checks, activity, "npc bbox consistency", width_ratio <= 1.45 and height_ratio <= 1.08, f"widths={widths}, heights={heights}")


def main():
    checks, files = [], {}
    manifests = sorted(ASSET_ROOT.glob("*/manifest.json"))
    for manifest in manifests:
        verify_manifest(manifest, checks, files)
    passed = sum(check["passed"] for check in checks)
    report = {
        "generatedAt": date.today().isoformat(),
        "scope": "schedule-layers-v2 discovered manifests",
        "manifests": len(manifests),
        "summary": {"passed": passed, "failed": len(checks) - passed, "total": len(checks)},
        "checks": checks,
        "files": files,
    }
    JSON_REPORT.parent.mkdir(parents=True, exist_ok=True)
    JSON_REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    failures = [check for check in checks if not check["passed"]]
    lines = [
        "# 일정 레이어 v2 자동 검증",
        "",
        f"- 검사일: {report['generatedAt']}",
        f"- 발견 manifest: {len(manifests)}",
        f"- 통과: {passed}",
        f"- 실패: {len(failures)}",
        "",
        "## 실패 항목",
        "",
    ]
    lines.extend([f"- `{item['activity']}` · {item['check']}: {item['detail']}" for item in failures] or ["- 없음"])
    lines.extend(["", "## 범위", "", "현재는 `kitchenhelp` 파일럿만 검사한다. 나머지 일정은 파일럿 승인 후 manifest가 추가되는 즉시 같은 검사에 자동 포함된다.", ""])
    MD_REPORT.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(report["summary"], ensure_ascii=False))
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
