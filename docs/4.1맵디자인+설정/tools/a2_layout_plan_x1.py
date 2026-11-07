"""1-1 2단계 배치 (A)안: 시안 v2(×2, study/map/scripts/plan_v2.py)를 현재 3D 1-1(×1, 80 m)에 맞춘 배치도. 시안만, Core 무수정.
python plan_x1.py  → I:/EXODUSER-Storage/map11/plan/plan_x1.png, plan_x1.json
좌표: m, x 동쪽, y 남쪽(북쪽 = 작은 y = 화면 위). Core px = m × 100.
"""
import json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
M = 'I:/EXODUSER-Storage/study/map/raw/ours/'; O = 'I:/EXODUSER-Storage/map11/plan/'
F = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 15); FS = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 12); FB = ImageFont.truetype('C:/Windows/Fonts/malgunbd.ttf', 18)
wk = json.load(open(M + 'ch1_1_walk.json', encoding='utf-8')); sp = json.load(open(M + 'ch1_1_spawns.json', encoding='utf-8'))
G0 = np.array([[c == '0' for c in r] for r in wk['rows']])            # 200×200, .4 m
R = .4; N = 200; SIZE = 80.0
yy, xx = np.mgrid[0:N, 0:N] * R + R / 2
# ---- 설계 (v2 좌표 ÷ 2). 길 폭은 반으로 줄이지 않는다(영웅 1.61 m, 무리 전투 공간)
MAIN = [('시작', 40, 75), ('r1', 40, 62), ('대장간', 40, 49), ('굽힘 W', 25, 42), ('r2', 30, 33), ('굽힘 E', 55, 26), ('r3', 50, 19), ('보스문', 40, 13), ('보스', 40, 7)]
MAINW = 6.0; CHOKEW = 3.5
CHOKES = [(40, 55.5, 'S1 목'), (27.5, 37.5, 'S2 목'), (40, 13, '보스문 목')]
FIELDS = [(40, 62, 7.5, 'r1 개활지 15 m'), (30, 33, 8.0, 'r2 개활지 16 m'), (50, 19, 7.5, 'r3 개활지 15 m')]
SPURS = [((40, 62), (14, 56), 3.5, 'D1 서쪽 벽감(보물)'), ((40, 49), (66, 44), 3.5, 'D2 동쪽 벽감(제단)'), ((30, 33), (20, 26), 3.5, 'D3 북서 벽감(보물)')]
BOSS = (40, 7, 8, 5)
pts = [(x, y) for _, x, y in MAIN]
S = [0.0]
for i in range(1, len(pts)): S.append(S[-1] + math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
L = S[-1]
def at(s):
    for i in range(1, len(pts)):
        if s <= S[i]:
            t = (s - S[i - 1]) / (S[i] - S[i - 1]); a, b = pts[i - 1], pts[i]
            return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t), i - 1
    return pts[-1], len(pts) - 2
def normal(i):
    a, b = pts[i], pts[i + 1]; dx, dy = b[0] - a[0], b[1] - a[1]; n = math.hypot(dx, dy); return (-dy / n, dx / n)
walk = np.zeros((N, N), bool)
def capsule(a, b, w):
    ax, ay = a; bx, by = b; dx, dy = bx - ax, by - ay; l2 = max(dx * dx + dy * dy, 1e-9)
    t = np.clip(((xx - ax) * dx + (yy - ay) * dy) / l2, 0, 1); d = np.hypot(xx - (ax + t * dx), yy - (ay + t * dy)); return d <= w / 2
for i in range(len(pts) - 1): walk |= capsule(pts[i], pts[i + 1], MAINW)
for a, b, w, _ in SPURS: walk |= capsule(a, b, w) | capsule(b, b, 7)
for x, y, r, _ in FIELDS: walk |= np.hypot(xx - x, yy - y) <= r
bx, by, brx, bry = BOSS; walk |= ((xx - bx) / brx) ** 2 + ((yy - by) / bry) ** 2 <= 1
walk |= capsule((40, 75), (40, 75), 10)                                  # 시작 터
for x, y, _ in CHOKES:                                                     # 목: 띠를 비우고 좁은 폭만 다시
    band = (np.abs(yy - y) < 1.5) & (np.abs(xx - x) < 8)
    keep = np.zeros_like(walk)
    for f in FIELDS: keep |= np.hypot(xx - f[0], yy - f[1]) <= f[2]
    walk[band & ~keep] = False; walk |= capsule((x, y - 1.5), (x, y + 1.5), CHOKEW)
walk_m2 = walk.sum() * R * R; cur_m2 = G0.sum() * R * R; on_cur = (walk & G0).sum() / walk.sum()
path_on_cur = np.mean([G0[min(N - 1, int(at(s)[0][1] / R)), min(N - 1, int(at(s)[0][0] / R))] for s in np.arange(0, L, .5)])
# ---- 무리: 주 경로 약 11 m 간격, 기본 3(2~4), 큰 무리 8은 r2·r3 개활지
PACK_S = [9, 20, 31, 42, 53, 62, 73, 84, 93, 101]; SIZES = [2, 3, 3, 4, 3, 8, 3, 4, 8, 3]
packs = []
for k, (s, n) in enumerate(zip(PACK_S, SIZES)):
    (x, y), i = at(s); nx, ny = normal(i); off = (1.8 if k % 2 else -1.8) if n < 8 else 0
    packs.append({'id': 'P%d' % (k + 1), 's': s, 'x': round(x + nx * off, 1), 'y': round(y + ny * off, 1), 'n': n})
for k, (a, b, w, lab) in enumerate(SPURS[:2]):
    packs.append({'id': 'D%dg' % (k + 1), 's': None, 'x': round(b[0] + (a[0] - b[0]) * .15, 1), 'y': round(b[1] + (a[1] - b[1]) * .15, 1), 'n': 3})
ELITE = {'P2', 'P6', 'P8', 'P9', 'D1g'}
for p in packs: p['elite'] = 1 if p['id'] in ELITE else 0; p['onWalk'] = bool(walk[int(p['y'] / R), int(p['x'] / R)]); p['onCurrent'] = bool(G0[int(p['y'] / R), int(p['x'] / R)])
gaps = [PACK_S[i + 1] - PACK_S[i] for i in range(len(PACK_S) - 1)]
# ---- 소환굴 14: 새 걷는 면 밖이면 가장 가까운 걷는 칸(가장자리에서 1.2 m 이상 안쪽)으로 옮긴다
from scipy import ndimage
inner = ndimage.binary_erosion(walk, iterations=3) & G0
iy, ix = np.nonzero(inner)
holes = []
for h in sp['holesRuntime']:
    x, y = h['px'][0] / 100, h['px'][1] / 100; ok = bool(inner[int(y / R), int(x / R)])
    if ok: nxp, nyp, d = x, y, 0.0
    else:
        dd = (ix * R + R / 2 - x) ** 2 + (iy * R + R / 2 - y) ** 2; j = int(dd.argmin()); nxp, nyp, d = ix[j] * R + R / 2, iy[j] * R + R / 2, math.sqrt(dd[j])
    holes.append({'tile': [h['tx'], h['ty']], 'from_m': [round(x, 1), round(y, 1)], 'to_m': [round(nxp, 1), round(nyp, 1)], 'moved_m': round(d, 1), 'size': h['size']})
# ---- 34° 카메라 시야(×1 실측 카메라 16.5u·FOV 46.9°): 영웅 뒤 6.3 m(폭 15.5) ~ 앞 37.4 m(폭 71.5). 북쪽을 보고 선다.
def in_view(hx, hy, px, py):
    ahead = hy - py; side = abs(px - hx)
    if ahead < -6.3 or ahead > 37.4: return False
    half = 7.75 + (35.75 - 7.75) * (ahead + 6.3) / 43.7; return side <= half
VIEWS = [('시작', 40, 75), ('S1 목', 40, 55.5), ('굽힘 W', 25, 42), ('굽힘 E', 55, 26)]
views = []
for name, hx, hy in VIEWS:
    vis = [p for p in packs if in_view(hx, hy, p['x'], p['y'])]
    far = [p['id'] for p in vis if 25 <= hy - p['y'] + 0 <= 37.4]
    views.append({'at': name, 'visible': [p['id'] for p in vis], 'far25_37m': far})
# ---- 그림: 10 px/m + 오른쪽 표
P = 10; W, H = int(SIZE * P), int(SIZE * P)
img = Image.new('RGB', (W + 520, H + 60), (16, 17, 20)); d = ImageDraw.Draw(img)
base = np.zeros((N, N, 3), np.uint8); base[G0] = (58, 60, 64); base[~G0] = (24, 26, 30); base[walk & G0] = (150, 140, 112); base[walk & ~G0] = (190, 110, 80)
img.paste(Image.fromarray(base).resize((W, H), Image.NEAREST), (0, 40))
def p2(x, y): return (x * P, 40 + y * P)
d.line([p2(*q) for q in pts], fill=(240, 220, 160), width=3)
for x, y, lab in CHOKES: d.text(p2(x + 2.2, y - 1), lab, fill=(255, 210, 120), font=FS)
for x, y, r, lab in FIELDS: d.text(p2(x - r, y - r - 1.8), lab, fill=(230, 230, 230), font=FS)
for a, b, w, lab in SPURS: d.text(p2(b[0] - 4, b[1] + 3.5), lab, fill=(200, 200, 255), font=FS)
for name, hx, hy in VIEWS:   # 시야 사다리꼴
    poly = [p2(hx - 7.75, hy + 6.3), p2(hx + 7.75, hy + 6.3), p2(hx + 35.75, hy - 37.4), p2(hx - 35.75, hy - 37.4)]
    d.line(poly + [poly[0]], fill=(90, 150, 220), width=1)
for p in packs:
    r = 6 + p['n'] * 1.3; cx, cy = p2(p['x'], p['y'])
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(255, 90, 90) if p['elite'] else (240, 160, 70), width=3 if p['elite'] else 2)
    d.text((cx + r + 2, cy - 8), '%s·%d' % (p['id'], p['n']), fill=(255, 235, 200), font=FS)
for h in holes:
    fx, fy = p2(*h['from_m']); tx, ty = p2(*h['to_m'])
    if h['moved_m'] > 0: d.line([fx, fy, tx, ty], fill=(220, 80, 220), width=2); d.line([fx - 4, fy - 4, fx + 4, fy + 4], fill=(220, 80, 220), width=2); d.line([fx - 4, fy + 4, fx + 4, fy - 4], fill=(220, 80, 220), width=2)
    d.ellipse([tx - 4, ty - 4, tx + 4, ty + 4], fill=(220, 80, 220))
for k, s in enumerate((0, 52, L - 8)):
    (x, y), _ = at(s); cx, cy = p2(x, y); d.rectangle([cx - 5, cy - 5, cx + 5, cy + 5], fill=(120, 220, 255)); d.text((cx + 8, cy - 6), 'CP%d' % (k + 1), fill=(120, 220, 255), font=FS)
d.text((8, 8), '1-1 2단계 배치 (A)안 — ×1(80 m) 3D 1-1에 맞춘 시안 v2, 위에서 본 그림, 10 px = 1 m, 북쪽 위', fill=(240, 240, 240), font=FB)
d.line([p2(2, 78), p2(12, 78)], fill=(255, 255, 255), width=3); d.text(p2(2, 78.4), '10 m', fill=(255, 255, 255), font=FS)
lx = W + 16; ly = 50
for line in ['범례', '회색 = 현재 걷기 칸   검정 = 막힘', '베이지 = 새 걷는 면(현재 걷기 칸 안)', '주황 = 새 걷는 면(현재 막힘 → 열어야 함)',
             '노란 선 = 주 경로   하늘 사각 = 체크포인트', '원 = 무리(크기 ∝ 마리), 빨강 = 엘리트 포함', '보라 × → ● = 소환굴 옮김', '파랑 사다리꼴 = 34° 카메라 화면',
             '', '수치', '주 경로 %.1f m (현재 직선 약 75 m)' % L, '걷는 면 %.0f m² (현재 %.0f m²)' % (walk_m2, cur_m2),
             '새 걷는 면 중 현재 걷기 칸 %.0f%%' % (on_cur * 100), '경로가 현재 걷기 칸 위 %.0f%%' % (path_on_cur * 100),
             '무리 %d (주 경로 %d + 막다른 곳 2), 적 %d' % (len(packs), len(PACK_S), sum(p['n'] for p in packs)),
             '엘리트 무리 %d, 주 경로 간격 %d~%d m' % (len(ELITE), min(gaps), max(gaps)), '갈림길 3 / 막다른 곳 3, 목 3곳 폭 %.1f m' % CHOKEW,
             '소환굴 14 중 옮김 %d (최대 %.1f m)' % (sum(h['moved_m'] > 0 for h in holes), max(h['moved_m'] for h in holes)), '', '화면 안 무리']:
    d.text((lx, ly), line, fill=(230, 230, 230) if line not in ('범례', '수치', '화면 안 무리') else (255, 210, 120), font=F if line not in ('범례', '수치', '화면 안 무리') else FB); ly += 22
for v in views: d.text((lx, ly), '%s: %s (먼 25~37 m: %s)' % (v['at'], ','.join(v['visible']), ','.join(v['far25_37m']) or '-'), fill=(200, 220, 255), font=FS); ly += 20
img.save(O + 'plan_x1.png')
json.dump({'pathM': round(L, 1), 'walkM2': round(walk_m2), 'currentWalkM2': round(cur_m2), 'onCurrent': round(on_cur, 3), 'pathOnCurrent': round(float(path_on_cur), 3),
           'packs': packs, 'gaps': gaps, 'holes': holes, 'views': views}, open(O + 'plan_x1.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('path %.1f walk %.0f/%.0f on_cur %.2f path_on %.2f packs %d enemies %d holes moved %d' % (L, walk_m2, cur_m2, on_cur, path_on_cur, len(packs), sum(p['n'] for p in packs), sum(h['moved_m'] > 0 for h in holes)))
for v in views: print(v)
