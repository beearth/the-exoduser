"""Lay out existing unaltered evidence pixels; does not create or retouch art."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path("I:/EXODUSER-Storage/char-modular")
font = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 17)
small = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 14)

def label(board, xy, text, selected=font):
    ImageDraw.Draw(board).text(xy, text, fill="#eeeae0", font=selected)

board = Image.new("RGB", (1280, 2096), "#292d2d")
label(board, (12, 8), "A Tripo 원본 | B Meshy 조립 — 34° 중립 재질 형상 검토")
label(board, (12, 35), "정사영·키1.85m 정규화. 원본 rest pose가 다름. 게임/리깅/디자인 PASS 아님.", small)
for row, view in enumerate(("front34", "side34", "back34")):
    y = 80 + row * 672
    label(board, (12, y - 24), "A Tripo — " + view)
    label(board, (652, y - 24), "B Meshy 조립 — " + view)
    for col, variant in enumerate(("A_Tripo", "B_Meshy_assembled")):
        with Image.open(root / "ab-shape" / (variant + "_" + view + ".png")) as src:
            board.paste(src.convert("RGB"), (col * 640, y))
board.save(root / "ab-shape" / "warrior_ab_shape.png")

board = Image.new("RGB", (2048, 1192), "#292d2d")
label(board, (12, 8), "전사 측후면 확대 검사 — 팔꿈치 검증 2회 실패, 추가 반복 중단 / RETOUCH")
label(board, (12, 35), "34° 원근·거리5.5. 1x 게임 비교 아님. rear_open은 가림 진단용 망토 숨김이며 완성 외형 아님.", small)
for row, pose in enumerate(("elbow140", "crouch")):
    y = 112 + row * 528
    for col, view in enumerate(("left", "right", "rear", "rear_open")):
        x = col * 512
        label(board, (x + 8, y - 24), pose + " / " + view)
        with Image.open(root / "inspection" / (pose + "_" + view + ".png")) as src:
            board.paste(src.convert("RGB"), (x, y))
label(board, (12, 1160), "금속 강체 수치 PASS와 별개로 팔꿈치 관통/가림 분리 미해결. 관통·틈0 및 실제 Animator는 미판정.", small)
board.save(root / "inspection" / "warrior_joint_inspection.png")
print("EXISTING_EVIDENCE_BOARDS_WRITTEN")
