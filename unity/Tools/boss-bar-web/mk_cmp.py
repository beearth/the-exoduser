"""PC-A23 comparison sheets: web | Unity per state (bar region 1x) + two 3x detail crops (name, poise/status).
usage: python mk_cmp.py <web-cap-dir> <unity-cap-dir> <out-dir>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
web, uni, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
CAP = '왼쪽 웹 / 오른쪽 Unity (A23 보스 바) · 값=웹 캡처 덤프에서 옮긴 테스트 값'
font = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 20)
BOX = (690, 12, 1230, 128)
pairs = [('t0', 'a23_intro_t0', 'unity_boss_intro_t0'), ('t300', 'a23_intro_t300', 'unity_boss_intro_t300'), ('t600', 'a23_intro_t600', 'unity_boss_intro_t600'),
         ('t900', 'a23_intro_t900', 'unity_boss_intro_t900'), ('t1200', 'a23_intro_t1200', 'unity_boss_intro_t1200'), ('t1900', 'a23_intro_t1900', 'unity_boss_intro_t1900'),
         ('steady', 'a23_steady', 'unity_boss_steady'), ('hp80_poise33', 'a23_hp62_poise40', 'unity_boss_hp80_poise33'),
         ('hp40_poise17_status', 'a23_hp25_poise20_status', 'unity_boss_hp40_poise17_status'), ('groggy', 'a23_groggy', 'unity_boss_groggy'), ('immune', 'a23_immune', 'unity_boss_immune')]
def sheet(a, b, name, box, scale, cap):
    A = Image.open(a).convert('RGB').crop(box); B = Image.open(b).convert('RGB').crop(box)
    if scale != 1: A = A.resize((A.width * scale, A.height * scale), Image.LANCZOS); B = B.resize((B.width * scale, B.height * scale), Image.LANCZOS)
    w, h = A.size; gap = 12; capH = 36
    s = Image.new('RGB', (w * 2 + gap, h + capH), (24, 22, 20)); s.paste(A, (0, capH)); s.paste(B, (w + gap, capH))
    ImageDraw.Draw(s).text((10, 7), cap, fill=(223, 214, 194), font=font); s.save(os.path.join(out, name), quality=92)
for key, w, u in pairs:
    sheet(os.path.join(web, w + '.png'), os.path.join(uni, u + '.png'), f'a23_{key}.jpg', BOX, 1, CAP + ' · ' + key)
# 1x-real-size detail crops at 3x zoom: the name and the poise gauge + chips
sheet(os.path.join(web, 'a23_steady.png'), os.path.join(uni, 'unity_boss_steady.png'), 'a23_crop_name_3x.jpg', (850, 24, 1070, 64), 3, CAP + ' · 이름 3x')
sheet(os.path.join(web, 'a23_hp25_poise20_status.png'), os.path.join(uni, 'unity_boss_hp40_poise17_status.png'), 'a23_crop_status_3x.jpg', (760, 78, 1160, 124), 3, CAP + ' · 포이즈·상태 칩 3x')
print('ok')
