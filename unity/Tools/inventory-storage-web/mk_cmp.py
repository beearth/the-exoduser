"""PC-A11 comparison sheets: web | Unity stills side by side, caption on top.
usage: python mk_cmp.py <web.png> <unity.png> <out-dir> [web-scrolled.png unity-scrolled.png]"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

web, uni, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
CAPTION = '왼쪽 웹 / 오른쪽 Unity (A10 보관함) · 수치 차이=무작위 롤'
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
    ImageDraw.Draw(s).text((10, 9), CAPTION, fill=(223, 214, 194), font=font)
    s.save(os.path.join(out, name), quality=92)

sheet(web, uni, 'a10_cmp.jpg')
crops = {'left': (42, 182, 962, 1000), 'right': (962, 182, 1880, 700), 'head': (0, 90, 1920, 330)}
for k, box in crops.items():
    sheet(web, uni, f'a10_crop_{k}.jpg', box)
if len(sys.argv) >= 6:
    sheet(sys.argv[4], sys.argv[5], 'a10_cmp_scrolled.jpg')
print('ok')
