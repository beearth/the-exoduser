# 실습창 세로 프레임(2026-11-02): 승인 원화 img/ui/silver_hell/panel_frame_20261029.png(1024x768, 4:3)를
# 세로로 긴 실습창(#parryLesson, 400px 폭 x 약 670px 높이)용 9-slice로 다시 조립한다. 새 그림은 그리지 않는다.
#
# 원본을 그대로 border-image에 걸면 문제 두 가지가 생긴다.
#  1) 옆 레일 가운데 마름모가 세로로 4배 늘어나 찌그러진다(원본 옆 가운데 468px -> 화면 약 580px 필요).
#  2) 위 가운데 지옥의 눈이 창 폭에 맞춰 가로로 늘어난다.
# 그래서
#  - 모서리 4개: 원본 모서리 160px 그대로(가시 끝이 158px 안에서 끝남, 실측).
#  - 위/아래 띠: 눈(위)·가시(아래)는 원본 위치 그대로 두고, 양옆 레일에 같은 간격(46px)의 별 장식 3개 구간을
#    한 번씩 더 이어 붙여 980px로 넓힌다 -> 400px 창에서 늘임 약 1.03배.
#  - 옆 띠: 별 하나가 가운데 있는 민 레일 74px(원본 y231~305) 한 칸. CSS에서 round로 반복하므로 창 높이와 무관하게
#    별 간격이 고르고 찌그러지지 않는다(옆 가운데 큰 마름모는 쓰지 않음).
# 결과 1300x394 RGBA. CSS: border-image: url(...) 160 / 48px / 0 stretch round.
# 사용: python3 tools/make_lesson_frame.py [출력경로]
import sys
from PIL import Image

SRC = 'img/ui/silver_hell/panel_frame_20261029.png'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'img/ui/silver_hell/lesson_frame_20261102.png'
C = 160              # 모서리 크기(=CSS slice)
TILE = (231, 305)    # 옆 레일 한 칸(별 y=268 가운데)
# 위/아래 띠 가로 이어붙이기: [160,360) + [222,754) + [616,864) -> 980px, 눈 중심(원본 512)이 정확히 가운데(490)
SPANS = [(160, 360), (222, 754), (616, 864)]

src = Image.open(SRC).convert('RGBA')
W, H = src.size
assert (W, H) == (1024, 768), (W, H)
mid_w = sum(b - a for a, b in SPANS)
tile_h = TILE[1] - TILE[0]
out = Image.new('RGBA', (C * 2 + mid_w, C * 2 + tile_h), (0, 0, 0, 0))
OW, OH = out.size

def band(y0, y1, dy):
    out.paste(src.crop((0, y0, C, y1)), (0, dy))
    x = C
    for a, b in SPANS:
        out.paste(src.crop((a, y0, b, y1)), (x, dy)); x += b - a
    out.paste(src.crop((W - C, y0, W, y1)), (OW - C, dy))

band(0, C, 0)                       # 위: 모서리 + 눈 띠 + 모서리
band(H - C, H, OH - C)              # 아래: 모서리 + 가시 띠 + 모서리
out.paste(src.crop((0, TILE[0], C, TILE[1])), (0, C))          # 왼쪽 레일 한 칸
out.paste(src.crop((W - C, TILE[0], W, TILE[1])), (OW - C, C))  # 오른쪽 레일 한 칸
out.save(OUT, optimize=True)
print(OUT, out.size)
