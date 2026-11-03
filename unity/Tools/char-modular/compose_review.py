"""Compose native-size Blender fixture crops. Never upscale the 1x board."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

p = argparse.ArgumentParser()
p.add_argument("root", type=Path)
a = p.parse_args()
left = json.loads((a.root / "legacy/receipt.json").read_text(encoding="utf-8"))
right = json.loads((a.root / "modular/receipt.json").read_text(encoding="utf-8"))
assert [row["pose"] for row in left["poses"]] == [row["pose"] for row in right["poses"]]
for key in ("pitch", "verticalFov", "distance", "viewport", "scale"):
    assert left[key] == right[key], key
font = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 14)
small = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 12)
labels = {"idle": "대기 검사", "run": "달리기 검사", "arm90": "팔90도", "elbow140": "팔꿈치140도",
          "knee120": "무릎120도", "crouch": "웅크림", "twist45": "허리45도", "strike1": "1타 검사",
          "strike2": "2타 검사", "strike3": "3타 검사", "roll_mid": "구르기 중간 검사"}
rows = left["poses"]
native = Image.open(a.root / "legacy" / (rows[0]["pose"] + ".png")).size
width, height = native
if width != 320 or height not in (319, 320):
    raise RuntimeError("unexpected native render border: %s" % (native,))
board = Image.new("RGB", (width * 2, 82 + len(rows) * (height + 26)), (42, 45, 45))
draw = ImageDraw.Draw(board)
draw.text((10, 8), "34° Blender 형상 검사 | 기존 / 모듈 조립", font=font, fill=(235, 229, 218))
draw.text((10, 31), "1920×1080 원근의 1x 크롭. 실제 Animator·Unity 게임 캡처 아님.", font=small, fill=(205, 200, 188))
draw.text((95, 59), "기존 리그", font=font, fill=(235, 229, 218))
draw.text((405, 59), "새 파트 조립 리그", font=font, fill=(235, 229, 218))
for index, row in enumerate(rows):
    label = row["pose"]
    y = 82 + index * (height + 26)
    for column, variant in enumerate(("legacy", "modular")):
        image = Image.open(a.root / variant / (label + ".png")).convert("RGB")
        if image.size != native:
            raise RuntimeError("native crop size mismatch: %s" % (image.size,))
        board.paste(image, (column * width, y + 24))
    draw.text((10, y + 3), labels[label], font=font, fill=(235, 229, 218))
board.save(a.root / "warrior_compare_34_1x.png")
board.resize((board.width * 3, board.height * 3), Image.Resampling.NEAREST).save(a.root / "warrior_compare_34_3x.png")
detail_labels = ("idle", "arm90", "elbow140", "crouch", "roll_mid")
details = Image.new("RGB", (len(detail_labels) * 420, 420), (42, 45, 45))
detail_draw = ImageDraw.Draw(details)
for index, label in enumerate(detail_labels):
    source = Image.open(a.root / "modular" / (label + ".png")).convert("RGB")
    details.paste(source.crop((90, 105, 230, 235)).resize((420, 390), Image.Resampling.NEAREST), (index * 420, 30))
    detail_draw.text((index * 420 + 8, 5), labels[label] + " · 3x", font=font, fill=(235, 229, 218))
details.save(a.root / "warrior_modular_details_3x.png")
(a.root / "comparison-receipt.json").write_text(json.dumps({"nativeCropActual": list(native),
    "note": "Blender floating border truncation can yield 319 rows; source PNG pixels are pasted without resizing",
    "scope": "Blender geometry fixtures, not Animator or Unity gameplay", "visualPassed": False}, indent=2) + "\n", encoding="utf-8")
print("COMPARE_BOARD", board.size, "native crops; 3x nearest companion; game QA pending")
