"""PC-A25 comparison sheets: web | Unity, full window and the 1x preview-panel crop.
usage: python mk_cmp.py <web-cap-dir> <unity-caps-root> <out-dir>   (unity-caps-root/s1..s5/unity-inventory-default.png)"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

web, uni, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
CAP = '왼쪽 웹 / 오른쪽 Unity (A25 툴팁·비교) · 수치 차이=무작위 롤'
try:
    font = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 22)
except Exception:
    font = ImageFont.load_default()

def sheet(a, b, name, box=None):
    A = Image.open(a).convert('RGB'); B = Image.open(b).convert('RGB')
    if box:
        A = A.crop(box); B = B.crop(box)
    w, h = A.size; gap = 16; cap = 44
    s = Image.new('RGB', (w * 2 + gap, h + cap), (24, 22, 20))
    s.paste(A, (0, cap)); s.paste(B, (w + gap, cap))
    ImageDraw.Draw(s).text((10, 9), CAP, fill=(223, 214, 194), font=font)
    s.save(os.path.join(out, name), quality=92)

states = [('1_bag_weapon', 's1', '1_hover_bag_weapon'), ('2_equip', 's2', '2_hover_equip'), ('3_bag_armor', 's3', '3_hover_bag_armor'),
          ('4_selected', 's4', '4_selected'), ('5_wheel_end', 's5', '5_wheel_end')]
for wname, sdir, label in states:
    w = os.path.join(web, f'web_cmp_{wname}.png'); u = os.path.join(uni, sdir, 'unity-inventory-default.png')
    sheet(w, u, f'a25_cmp_{label}.jpg')
    sheet(w, u, f'a25_crop_{label}.jpg', (1395, 183, 1880, 990))
print('ok')
