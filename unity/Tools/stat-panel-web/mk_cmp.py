"""PC-A13 comparison sheets: web | Unity stills side by side (1x crops), caption on top.
usage: python mk_cmp.py <web-dir> <unity-dir> <out-dir>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

web, uni, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
CAPTION = '왼쪽 웹 / 오른쪽 Unity (A13 능력치) · 수치 차이=무작위 롤'
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

W = lambda n: os.path.join(web, n)
U = lambda n: os.path.join(uni, n)
sheet(W('web_stat_default.png'), U('unity-stat-default.png'), 'stat_cmp.jpg')
sheet(W('web_stat_node_pDot.png'), U('unity-stat-node.png'), 'stat_cmp_node.jpg')
sheet(W('web_stat_node_str.png'), U('unity-stat-node-stat.png'), 'stat_cmp_node_stat.jpg')
sheet(W('web_stat_path_survival.png'), U('unity-stat-path-survival.png'), 'stat_cmp_path.jpg')
sheet(W('web_stat_tab_learned.png'), U('unity-stat-tab-learned.png'), 'stat_cmp_tab_learned.jpg')
sheet(W('web_stat_zoom125.png'), U('unity-stat-zoom125.png'), 'stat_cmp_zoom125.jpg')
crops = {'left': (30, 310, 262, 960), 'tree': (480, 320, 1240, 940), 'right': (1465, 317, 1885, 993), 'bottom': (0, 985, 1920, 1065)}
for k, box in crops.items():
    sheet(W('web_stat_default.png'), U('unity-stat-default.png'), f'stat_crop_{k}.jpg', box)
print('ok')
