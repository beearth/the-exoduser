"""Compose LOCK | textured A+B board (1x native crops, never upscaled) and the same board 3x nearest. Blender check renders, not game captures."""
import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

p = argparse.ArgumentParser()
p.add_argument("render", type=Path)
p.add_argument("out", type=Path)
a = p.parse_args()
LOCK = Path("I:/EXODUSER-Storage/archive/E/exoduser-wt/_out/unity-charsheet/warrior/views")
meta = json.loads((a.render / "tex_compare_meta.json").read_text(encoding="utf-8"))["idle_front_crop_rows_from_bottom"]
rows = (("idle_front", "대기 정면", "warrior_body_34.png"), ("idle_rear", "대기 뒤", "warrior_body_back.png"),
        ("run", "달리기", "warrior_body_34.png"), ("strike1", "1타", "warrior_body_34.png"),
        ("strike2", "2타", "warrior_body_34.png"), ("strike3", "3타", "warrior_body_34.png"), ("roll_mid", "구르기 중간", "warrior_body_34.png"))
font = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 14)
small = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 12)
W = H = 320
img0 = Image.open(a.render / "idle_front.png")
assert img0.size[0] == 320 and img0.size[1] in (319, 320), img0.size
height_px = meta["height_px"]
feet_row = H - meta["feet_bottom"]       # row index from the crop top where the feet sit


def lock_figure(name):
    im = Image.open(LOCK / name).convert("RGB")
    arr = np.array(im).astype(int)
    bg = np.array([128, 128, 128])
    diff = np.abs(arr - bg).max(-1) > 24
    ys = np.where(diff.sum(1) > 3)[0]; xs = np.where(diff.sum(0) > 3)[0]
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    fig = im.crop(box)
    s = height_px / fig.height
    if name == "warrior_body_34.png":
        a2 = np.array(fig).astype(int); m = np.abs(a2 - 128).max(-1) > 24
        print("LOCK 34 figure mean V", float((a2[m].max(-1) / 255).mean()), "pixels", int(m.sum()))
    return fig.resize((max(1, round(fig.width * s)), round(fig.height * s)), Image.Resampling.LANCZOS)


board = Image.new("RGB", (W * 2, 82 + len(rows) * (H + 26)), (42, 45, 45))
d = ImageDraw.Draw(board)
d.text((10, 8), "34° Blender 검사판 | LOCK / 새 텍스처 조립본 (A+B 베이크)", font=font, fill=(235, 229, 218))
d.text((10, 31), "Blender 검사판, Unity 게임 화면 아님. 1920×1080 원근 1x 크롭. LOCK은 같은 키로 축소해 발 높이를 맞춤(대기 뒤는 LOCK 뒷면).", font=small, fill=(205, 200, 188))
d.text((95, 59), "LOCK", font=font, fill=(235, 229, 218))
d.text((405, 59), "새 텍스처 조립본", font=font, fill=(235, 229, 218))
for i, (key, label, lockname) in enumerate(rows):
    y = 82 + i * (H + 26)
    d.text((10, y + 3), label, font=font, fill=(235, 229, 218))
    cell = Image.new("RGB", (W, H), (128, 128, 128))
    fig = lock_figure(lockname)
    cell.paste(fig, ((W - fig.width) // 2, int(round(feet_row - fig.height))))
    board.paste(cell, (0, y + 24))
    rgba = Image.open(a.render / (key + ".png")).convert("RGBA")
    r = Image.new("RGBA", rgba.size, (128, 128, 128, 255)); r.alpha_composite(rgba); r = r.convert("RGB")
    if key == "idle_front":
        al = np.array(rgba)[..., 3] > 250
        px = np.array(rgba)[..., :3][al].astype(float) / 255
        print("RENDER figure mean V", float(px.max(-1).mean()), "pixels", int(al.sum()))
    board.paste(r, (W, y + 24))
a.out.parent.mkdir(parents=True, exist_ok=True)
board.save(a.out)
board.resize((board.width * 3, board.height * 3), Image.Resampling.NEAREST).save(a.out.with_name(a.out.stem.replace("_1x", "_3x") + ".png"))
print("BOARD", board.size, a.out)
