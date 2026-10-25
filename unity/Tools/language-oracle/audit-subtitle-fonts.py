"""Read-only subtitle-body coverage audit; this does not validate shaping or rendering."""
import argparse
import json
from pathlib import Path
import unicodedata

from fontTools.ttLib import TTFont


def visible_characters(text):
    return {c for c in text if not c.isspace() and unicodedata.category(c) not in {"Cc", "Cf"}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    project = args.project.resolve()
    data_path = project / "Assets/Exoduser/Resources/Data/lobby_frontend.json"
    data = json.loads(data_path.read_text())
    fonts_path = project / "Assets/Exoduser/Resources/Art/fonts"
    fonts = {}
    for path in sorted(fonts_path.glob("*.ttf")):
        with TTFont(path) as font:
            cmap = font.getBestCmap()
            fonts[path.name] = {chr(code) for code, glyph in cmap.items() if glyph != ".notdef"}
    primary = "NanumMyeongjo-Regular.ttf"
    combined = set().union(*fonts.values())
    rows = []
    for language in data["captions"]:
        cues = language["cues"]
        required = set().union(*(visible_characters(cue["text"]) for cue in cues))
        coverage = {}
        for name, cmap in fonts.items():
            missing = sorted(required - cmap, key=ord)
            coverage[name] = {
                "missingCount": len(missing),
                "missingChars": "".join(missing),
                "affectedCues": sum(bool(visible_characters(cue["text"]) - cmap) for cue in cues),
            }
        absent = sorted(required - combined, key=ord)
        rows.append({
            "code": language["code"],
            "cueCount": len(cues),
            "uniqueVisibleCharacters": len(required),
            "coverage": coverage,
            "bestExistingFont": min(coverage, key=lambda name: coverage[name]["missingCount"]),
            "missingFromAllBundledFonts": "".join(absent),
            "missingFromAllBundledFontCount": len(absent),
        })
    summary = {
        name: {
            "completeLanguages": [row["code"] for row in rows if row["coverage"][name]["missingCount"] == 0],
            "incompleteLanguages": [row["code"] for row in rows if row["coverage"][name]["missingCount"] > 0],
        } for name in fonts
    }
    result = {
        "scope": "Current 29-language subtitle body versus existing font Unicode cmap only",
        "primaryCaptionFont": primary,
        "source": str(data_path),
        "languageCount": len(rows),
        "cueCount": sum(row["cueCount"] for row in rows),
        "fonts": list(fonts),
        "summary": summary,
        "languages": rows,
        "limits": [
            "No Unity import, Player, GUI, shaping, bidi/RTL, or font fallback execution",
            "Glyph cmap coverage does not prove correct rendering",
            "Whitespace and Cc/Cf controls excluded from visible glyph requirements",
            "No source subtitle, timing, font asset or shared checkout changes",
        ],
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({
        "languages": len(rows), "cues": result["cueCount"],
        "primaryComplete": summary[primary]["completeLanguages"],
        "primaryIncomplete": summary[primary]["incompleteLanguages"],
        "cannotCoverWithExistingFontUnion": [row["code"] for row in rows if row["missingFromAllBundledFontCount"]],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
