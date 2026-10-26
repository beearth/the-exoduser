"""PC-A16 comparison sheets: web | Unity per state. Full list pane (scaled 0.5) plus 1x crops of 3 rows, the waiting button + hint, the alternate key + x, the reset button, the toast.
usage: python mk_cmp.py <web-cap-dir> <unity-cap-dir> <out-dir>   (web: a16_*.png, unity: unity_kb_*.png, both 1920x1080)"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
web, uni, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
CAP = '왼쪽 웹 / 오른쪽 Unity (A16 키 바인딩) · Unity 쪽 배경은 검정(웹은 설정 창 프레임)'
font = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 20)
PANE = (45, 325, 1875, 977)

def sheet(w, u, name, box, scale=1.0, cap=CAP):
    A = Image.open(os.path.join(web, w + '.png')).convert('RGB').crop(box)
    B = Image.open(os.path.join(uni, u + '.png')).convert('RGB').crop(box)
    if scale != 1.0:
        A = A.resize((int(A.width * scale), int(A.height * scale)), Image.LANCZOS); B = B.resize((int(B.width * scale), int(B.height * scale)), Image.LANCZOS)
    gap, capH = 12, 36
    s = Image.new('RGB', (A.width * 2 + gap, A.height + capH), (24, 22, 20)); s.paste(A, (0, capH)); s.paste(B, (A.width + gap, capH))
    ImageDraw.Draw(s).text((10, 7), cap, fill=(223, 214, 194), font=font); s.save(os.path.join(out, name), quality=92)

states = [('1_default', 'a16_1_default', 'unity_kb_1_default'), ('1_default_bottom', 'a16_1_default_bottom', 'unity_kb_1_default_bottom'),
          ('2_listening', 'a16_2_listening_main', 'unity_kb_2_listening_main'), ('2_listening_bottom', 'a16_2_listening_main_bottom', 'unity_kb_2_listening_main_bottom'),
          ('3_alt_set', 'a16_3_alt_set', 'unity_kb_3_alt_set'), ('4_chain_conflict', 'a16_4_chain_conflict', 'unity_kb_4_chain_conflict'),
          ('5_gamepad', 'a16_5_gamepad_tab', 'unity_kb_5_gamepad_tab'), ('5_gamepad_bottom', 'a16_5_gamepad_tab_bottom', 'unity_kb_5_gamepad_tab_bottom'),
          ('6_after_reset', 'a16_6_after_reset', 'unity_kb_6_after_reset'), ('6_after_reset_bottom', 'a16_6_after_reset_bottom', 'unity_kb_6_after_reset_bottom'),
          ('6_reset_notif', 'a16_6_after_reset_notif', 'unity_kb_6_after_reset_notif')]
for key, w, u in states:
    sheet(w, u, f'a16_{key}.jpg', PANE, 0.5, CAP + ' · ' + key + ' (0.5x)')
# 1x crops
sheet('a16_1_default', 'unity_kb_1_default', 'a16_crop_rows3.jpg', (87, 625, 953, 860), 1.0, CAP + ' · 탭 + 행 3개 1x')
sheet('a16_2_listening_main_bottom', 'unity_kb_2_listening_main_bottom', 'a16_crop_waiting_button.jpg', (87, 390, 953, 460), 1.0, CAP + ' · 입력 대기 버튼 1x')
sheet('a16_2_listening_main_bottom', 'unity_kb_2_listening_main_bottom', 'a16_crop_waiting_hint.jpg', (420, 855, 1500, 965), 1.0, CAP + ' · 초기화 버튼 + 대기 안내 1x')
sheet('a16_3_alt_set', 'unity_kb_3_alt_set', 'a16_crop_alt_delete.jpg', (87, 795, 953, 860), 1.0, CAP + ' · 보조 키 + ✕ 1x')
sheet('a16_1_default_bottom', 'unity_kb_1_default_bottom', 'a16_crop_reset_button.jpg', (87, 840, 1830, 960), 1.0, CAP + ' · 초기화 버튼 1x')
sheet('a16_4_chain_conflict', 'unity_kb_4_chain_conflict', 'a16_crop_toast_ph.jpg', (560, 840, 1360, 920), 1.0, CAP + ' · 사슬 거부 문구 1x')
sheet('a16_6_after_reset_notif', 'unity_kb_6_after_reset_notif', 'a16_crop_toast_notif.jpg', (760, 760, 1160, 840), 1.0, CAP + ' · 초기화 완료 알림 1x')
sheet('a16_5_gamepad_tab_bottom', 'unity_kb_5_gamepad_tab_bottom', 'a16_crop_pad_rows.jpg', (87, 330, 953, 570), 1.0, CAP + ' · 패드 행 1x')
print('ok')
