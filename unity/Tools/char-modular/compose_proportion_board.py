"""Compose the arm proportion comparison board (plain Python + Pillow, no Blender).
Panels, same body height and the same horizontal guide lines in every panel:
  1 before A+B (A pose)   2 after A+B (A pose)   3 LOCK warrior_body_front   4 8-head human guide figure
  5 after A+B with arms hanging (static fixture: shoulder->wrist straight down).
Guide lines come from the hanging arm landmarks of the AFTER model (shoulder, elbow, wrist, fingertip) and from its hip and knee joints.
Usage: compose_proportion_board.py --dir <render dir> --lock <png> --measure <proportion.json> --out <png>
"""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

p = argparse.ArgumentParser()
p.add_argument("--dir", type=Path, required=True)
p.add_argument("--lock", type=Path, required=True)
p.add_argument("--measure", type=Path, required=True)
p.add_argument("--out", type=Path, required=True)
a = p.parse_args()
FONT = "C:/Windows/Fonts/malgun.ttf"
f_small, f_mid, f_big = (ImageFont.truetype(FONT, s) for s in (20, 24, 30))
meas = json.loads(a.measure.read_text(encoding="utf-8"))
before, after = meas["before"], meas["after"]
H = 1.85
down = json.loads((a.dir / "after_down.json").read_text(encoding="utf-8"))
rest_b = json.loads((a.dir / "before_rest.json").read_text(encoding="utf-8"))
rest_a = json.loads((a.dir / "after_rest.json").read_text(encoding="utf-8"))
PW, PH, TOP, FOOT = 700, 960, 96, 930           # panel size; the body spans TOP..FOOT rows inside the panel
ROW_TOP, ROW_FLOOR = rest_a["rowTop"], rest_a["rowFloor"]
scale = (FOOT - TOP) / (ROW_FLOOR - ROW_TOP)    # render pixels -> panel pixels (1000 px render = 2.1 m)
ppm = rest_a["pxPerMetre"] * scale              # panel pixels per metre


def row(z):                                     # height in metres -> panel row
    return FOOT - z * ppm


def render_panel(name, meta):
    im = Image.open(a.dir / name).convert("RGBA")
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    cx = round(meta["centreX"] * scale)
    cy0 = round(meta["rowTop"] * scale) - TOP
    panel = Image.new("RGBA", (PW, PH), (92, 92, 94, 255))
    panel.alpha_composite(im, (PW // 2 - cx, -cy0))
    return panel


panels = []
panels.append(("1  수정 전 A+B (A포즈)", render_panel("before_rest.png", rest_b)))
panels.append(("2  수정 후 A+B (A포즈)", render_panel("after_rest.png", rest_a)))
lock = Image.open(a.lock).convert("RGBA")
lock_top, lock_bottom = 75, 950                 # figure rows read from the 1024 px LOCK sheet
ls = (FOOT - TOP) / (lock_bottom - lock_top)
lock = lock.resize((round(lock.width * ls), round(lock.height * ls)), Image.LANCZOS)
lp = Image.new("RGBA", (PW, PH), (128, 128, 128, 255))
lp.alpha_composite(lock, (PW // 2 - lock.width // 2, TOP - round(lock_top * ls)))
panels.append(("3  LOCK 원화 (warrior_body_front)", lp))
# 8-head guide figure (Drillis-Contini style): arms hanging, drawn from landmarks in fractions of H
gp = Image.new("RGBA", (PW, PH), (92, 92, 94, 255))
g = ImageDraw.Draw(gp)
cx = PW // 2
hw = 0.125 * H * ppm / 2
g.ellipse((cx - hw * .85, row(1.0 * H), cx + hw * .85, row(0.875 * H)), outline=(230, 230, 230, 255), width=3)
shoulder_half = 0.2195 * ppm
for sign in (-1, 1):
    sx, sy = cx + sign * shoulder_half, row(0.82 * H)
    elbow = (cx + sign * shoulder_half * 1.05, row(0.63 * H))
    wrist = (cx + sign * shoulder_half * 1.1, row(0.485 * H))
    tip = (cx + sign * shoulder_half * 1.12, row(0.375 * H))
    g.line((sx, sy, *elbow, *wrist, *tip), fill=(235, 235, 235, 255), width=7)
g.line((cx - shoulder_half, row(0.82 * H), cx + shoulder_half, row(0.82 * H)), fill=(235, 235, 235, 255), width=7)
g.line((cx, row(0.875 * H), cx, row(0.5 * H)), fill=(235, 235, 235, 255), width=7)
for sign in (-1, 1):
    g.line((cx + sign * 0.08 * ppm, row(0.5 * H), cx + sign * 0.095 * ppm, row(0.25 * H), cx + sign * 0.09 * ppm, row(0.04 * H)), fill=(235, 235, 235, 255), width=7)
panels.append(("4  8등신 사람 기준 (참고 선화)", gp))
panels.append(("5  수정 후, 팔 내림 (정적 고정구)", render_panel("after_down.png", down)))

# guide lines (same rows in every panel) from the AFTER model hanging-arm landmarks
ls_ = down["Left"]
rows = {"어깨 관절": ls_["shoulderRow"], "팔꿈치": ls_["elbowRow"], "손목": ls_["wristRow"], "손끝": ls_["fingertipRow"],
        "고관절": ls_["hipRow"], "무릎": ls_["kneeRow"]}
colors = {"어깨 관절": (80, 200, 255), "팔꿈치": (90, 230, 120), "손목": (250, 220, 70), "손끝": (255, 90, 80), "고관절": (255, 160, 60), "무릎": (200, 140, 255)}
board = Image.new("RGBA", (PW * 5 + 6 * 12, PH + 330), (30, 30, 32, 255))
d = ImageDraw.Draw(board)
for i, (title, panel) in enumerate(panels):
    x0 = 12 + i * (PW + 12)
    pd = ImageDraw.Draw(panel)
    for name, r in rows.items():
        y = FOOT - (ROW_FLOOR - r) * scale
        pd.line((0, y, PW, y), fill=colors[name] + (255,), width=2)
        if i == 0:
            pd.text((6, y - 24), "%s %.3fH" % (name, (ROW_FLOOR - r) * scale / ppm / H), font=f_small, fill=colors[name] + (255,))
    pd.line((0, FOOT, PW, FOOT), fill=(255, 255, 255, 255), width=1)
    board.alpha_composite(panel, (x0, 60))
    d.text((x0 + 8, 14), title, font=f_big, fill=(240, 240, 240, 255))


def fmt(x, key):
    return "%.3f" % (x[key] / H)


L, R = "Left", "Right"
notes = [
    ["위팔 %.3fH  아래팔 %.3fH  손 %.3fH" % (before[L]["upperM"] / H, (before[L]["foreM"] + before[R]["foreM"]) / 2 / H, before[L]["handM"] / H),
     "팔 내린 손끝 높이 %.3fH" % (before[L]["fingertipHeightArmsDownChordM"] / H),
     "A포즈 손끝 높이 %.3fH / 팔 벌린 폭 %.3fH" % (rest_b["Left"]["fingertipHeightH"], before["armSpanM"] / H)],
    ["위팔 %.3fH  아래팔 %.3fH  손 %.3fH" % (after[L]["upperM"] / H, after[L]["foreM"] / H, after[L]["handM"] / H),
     "팔 내린 손끝 높이 %.3fH" % (after[L]["fingertipHeightArmsDownChordM"] / H),
     "A포즈 손끝 높이 %.3fH / 팔 벌린 폭 %.3fH" % (rest_a["Left"]["fingertipHeightH"], after["armSpanM"] / H)],
    ["원화 A포즈 (눈금으로 읽음, 오차 약 0.01H)", "손끝 높이 약 0.46H, 어깨 관절→손끝 약 0.40H",
     "수정 후 A포즈 손끝 %.3fH 와 같은 높이" % rest_a["Left"]["fingertipHeightH"]],
    ["8등신 기준 (Drillis-Contini 비율)", "위팔 0.186H 아래팔 0.146H 손 0.108H", "손끝 약 0.375H(허벅지 중간), 팔꿈치약 배꼽"],
    ["수정 후 팔을 수직으로 내린 모습", "손끝 %.3fH (손목선 수직, 어깨 관절 중심)" % (down["Left"]["fingertipHeightH"]),
     "선은 이 칸의 팔꿈치·손목·손끝 높이"],
]
for i, lines in enumerate(notes):
    x0 = 12 + i * (PW + 12)
    for k, text in enumerate(lines):
        d.text((x0 + 8, 60 + PH + 10 + k * 30), text, font=f_mid, fill=(235, 235, 235, 255))
legend = "가로선(모든 칸 같은 높이, 수정 후 팔 내림 기준): " + "  ".join("%s %.3fH" % (n, (ROW_FLOOR - r) * scale / ppm / H) for n, r in rows.items())
d.text((20, 60 + PH + 130), legend, font=f_mid, fill=(235, 235, 235, 255))
d.text((20, 60 + PH + 170), "허용 비교: 위팔 0.180~0.190H / 아래팔 0.145~0.155H / 손 0.100~0.110H / 팔 내린 손끝 0.36~0.40H / 팔 벌린 폭 0.98~1.05H "
       "(위팔·아래팔·손은 합쳐서 팔 벌린 폭 1.05H를 넘지 않도록 허용 범위 아래쪽 값 사용)", font=f_small, fill=(200, 200, 200, 255))
d.text((20, 60 + PH + 205), "아래팔 굵기/위팔 굵기 %.2f(L) %.2f(R), 건틀릿/위팔 %.2f(L) %.2f(R), 기준 1.1 이하. 텍스처 없는 회색 정사영 렌더, 대검 숨김, 게임 캡처 아님." % (
    after[L]["widthsM"]["forearm"] / after[L]["widthsM"]["upperArm"], after[R]["widthsM"]["forearm"] / after[R]["widthsM"]["upperArm"],
    after[L]["widthsM"]["gauntlet"] / after[L]["widthsM"]["upperArm"], after[R]["widthsM"]["gauntlet"] / after[R]["widthsM"]["upperArm"]),
       font=f_small, fill=(200, 200, 200, 255))
d.text((20, 60 + PH + 240), "4칸 기준: 사람 비례 기준선(No Rest for the Wicked 스크린샷 21장 중 주인공이 서서 팔 길이가 보이는 장면 없음). 판단용 내부 비교판, 게임 반입 아님.",
       font=f_small, fill=(200, 200, 200, 255))
a.out.parent.mkdir(parents=True, exist_ok=True)
board.convert("RGB").save(a.out)
print("BOARD_WRITTEN", board.size)
