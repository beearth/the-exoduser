#!/usr/bin/env python3
"""
보스 35종 아틀라스: atlas_boss_walk.png
레이아웃: 35행 × 20칸, 64px 셀 (idle4 + walk4 + attack6 + hit6)
행 = 스테이지 인덱스 (si 0-34)
장별 대표 보스 PixelLab + 나머지 팔레트 변형
"""
import os, glob
import numpy as np
from PIL import Image

BASE = os.path.dirname(__file__)
BOSS_DIR = os.path.join(BASE, 'img', 'bosses')
OUT = os.path.join(BASE, 'img', 'mobs', 'atlas_boss_walk.png')
CELL = 64
COLS = 20
DIR_PRIO = ['south','east','west','north']

# 장별 대표 보스 폴더명
CH_BASE = {
    0: 'boss_ch1_forest',   # si 0-3
    1: 'boss_ch2_bug',      # si 4-9
    2: 'boss_ch3_ice',      # si 10-13
    3: 'boss_ch4_flame',    # si 14-20
    4: 'boss_ch5_war',      # si 21-25
    5: 'boss_ch6_flesh',    # si 26-31
    6: 'boss_ch7_hell',     # si 32-34
}

# 스테이지 → 장 매핑
SI_TO_HELL = [0]*4 + [1]*6 + [2]*4 + [3]*7 + [4]*5 + [5]*6 + [6]*3

# 장 내 보스별 틴트 (si → tint RGB, strength)
# 첫 보스는 원본(None), 나머지는 변형
BOSS_TINTS = {
    # 1장 숲 (si 0-3)
    0: None,                              # 숲의 감시자 (원본)
    1: ((80, 180, 60), 0.3),             # 독버섯 거인 — 독녹
    2: ((140, 100, 40), 0.3),            # 숲의 사냥꾼 — 갈색
    3: ((60, 40, 80), 0.35),             # 숲의 기생수 — 암보라

    # 2장 벌레 (si 4-9)
    4: None,                              # 벌레 수호자 (원본)
    5: ((120, 200, 80), 0.3),            # 점액 괴수 — 점액녹
    6: ((180, 80, 60), 0.3),             # 기생충 모체 — 붉은갈
    7: ((200, 180, 100), 0.25),          # 거대 알주머니 — 연황
    8: ((140, 40, 40), 0.35),            # 살벽의 군주 — 암적
    9: ((180, 160, 120), 0.3),           # 여왕 구더기 — 회갈

    # 3장 얼음 (si 10-13)
    10: None,                             # 얼음 망령 (원본)
    11: ((120, 160, 220), 0.25),         # 서리의 기사 — 밝은 청
    12: ((60, 100, 160), 0.3),           # 얼어붙은 감시자 — 짙은 청
    13: ((40, 60, 100), 0.4),            # 얼음 속 봉인 괴물 — 암청

    # 4장 화염 (si 14-20)
    14: None,                             # 화염 악마 (원본)
    15: ((220, 160, 40), 0.25),          # 불기둥 수호자 — 황금
    16: ((200, 60, 20), 0.3),            # 용암의 심장 — 진홍
    17: ((220, 120, 40), 0.25),          # 화염 전사 — 주황
    18: ((180, 40, 80), 0.3),            # 화염 쌍두 — 자적
    19: ((140, 80, 20), 0.3),            # 불벌레 군주 — 갈적
    20: ((100, 40, 40), 0.35),           # 화염 감옥지기 — 암적

    # 5장 전쟁 (si 21-25)
    21: None,                             # 전쟁의 잔해 (원본/팔레트스왑)
    22: ((200, 200, 180), 0.25),         # 뼈산의 왕 — 백골
    23: ((80, 40, 40), 0.3),             # 악마 사령관 — 암적
    24: ((140, 140, 160), 0.25),         # 철벽 기사단장 — 철색
    25: ((60, 30, 60), 0.35),            # 군단 지휘관 — 암보라

    # 6장 살점 (si 26-31)
    26: None,                             # 살점의 수호자 (원본)
    27: ((200, 180, 160), 0.25),         # 인간뼈 감시자 — 백골
    28: ((120, 60, 80), 0.3),            # 뒤틀린 자 — 암적
    29: ((80, 120, 60), 0.3),            # 촉수의 어미 — 독녹
    30: ((160, 80, 120), 0.3),           # 불완전 사도 — 보라적
    31: ((40, 20, 40), 0.4),             # 대사도 — 암흑

    # 7장 지옥 (si 32-34)
    32: None,                             # 검은 성의 수호자 (원본)
    33: ((180, 20, 20), 0.35),           # Killu — 핏빛
    34: ((20, 10, 30), 0.5),             # 지옥 군주 — 칠흑
}

def load_frames(bdir, anim_name, alts=None):
    names = [anim_name] + (alts or [])
    for name in names:
        for d in DIR_PRIO:
            path = os.path.join(bdir, 'animations', name, d)
            if os.path.isdir(path):
                pngs = sorted(glob.glob(os.path.join(path, 'frame_*.png')))
                if pngs:
                    return [Image.open(p).convert('RGBA') for p in pngs]
    return []

def load_rot(bdir):
    for d in DIR_PRIO:
        p = os.path.join(bdir, 'rotations', f'{d}.png')
        if os.path.exists(p):
            return Image.open(p).convert('RGBA')
    return None

def fit(img, sz=CELL):
    if img.size == (sz, sz): return img
    w, h = img.size
    scale = min(sz/w, sz/h)
    nw, nh = int(w*scale), int(h*scale)
    r = img.resize((nw, nh), Image.NEAREST)
    out = Image.new('RGBA', (sz, sz), (0,0,0,0))
    out.paste(r, ((sz-nw)//2, (sz-nh)//2))
    return out

def build_row(bdir):
    """보스 폴더에서 1행(20칸) 이미지 생성"""
    rot = load_rot(bdir)
    walk = load_frames(bdir, 'walking-4-frames', ['walk-4-frames'])
    attack = load_frames(bdir, 'cross-punch')
    hit = load_frames(bdir, 'taking-punch')

    idle_img = fit(rot) if rot else (fit(walk[0]) if walk else None)
    if not idle_img:
        return None

    row = Image.new('RGBA', (COLS * CELL, CELL), (0,0,0,0))

    # idle (0-3)
    for i in range(4):
        row.paste(idle_img, (i*CELL, 0))
    # walk (4-7)
    src = walk if walk else [idle_img]
    for i in range(4):
        row.paste(fit(src[i%len(src)]), ((4+i)*CELL, 0))
    # attack (8-13)
    src = attack if attack else (walk if walk else [idle_img])
    for i in range(6):
        row.paste(fit(src[i%len(src)]), ((8+i)*CELL, 0))
    # hit (14-19)
    src = hit if hit else [idle_img]
    for i in range(6):
        row.paste(fit(src[i%len(src)]), ((14+i)*CELL, 0))

    return row

def tint_row(row_img, rgb, strength):
    arr = np.array(row_img).astype(np.float32)
    for c in range(3):
        arr[:,:,c] = arr[:,:,c] * (1-strength) + rgb[c] * strength
    arr[:,:,:3] = np.clip(arr[:,:,:3], 0, 255)
    return Image.fromarray(arr.astype(np.uint8))

def main():
    W = COLS * CELL   # 1280
    H = 35 * CELL     # 2240
    atlas = Image.new('RGBA', (W, H), (0,0,0,0))

    # 장별 베이스 행 캐시
    ch_base_rows = {}

    for hell, bname in CH_BASE.items():
        bdir = os.path.join(BOSS_DIR, bname)
        row = build_row(bdir) if os.path.isdir(bdir) else None
        ch_base_rows[hell] = row
        if row:
            print(f'  ch{hell+1} base: {bname} OK')
        else:
            print(f'  ch{hell+1} base: {bname} MISSING')

    # 5장 없으면 1장 팔레트스왑
    if not ch_base_rows[4] and ch_base_rows[0]:
        ch_base_rows[4] = tint_row(ch_base_rows[0], (100, 40, 40), 0.4)
        print(f'  ch5 base: fallback from ch1 (palette swap)')

    # 35행 채우기
    for si in range(35):
        hell = SI_TO_HELL[si]
        base = ch_base_rows.get(hell)
        if not base:
            print(f'  si {si}: NO base for hell {hell}, blank')
            continue

        tint_info = BOSS_TINTS.get(si)
        if tint_info is None:
            # 원본
            atlas.paste(base, (0, si * CELL))
            print(f'  si {si}: original')
        else:
            rgb, strength = tint_info
            tinted = tint_row(base, rgb, strength)
            atlas.paste(tinted, (0, si * CELL))
            print(f'  si {si}: tint {rgb} s={strength}')

    atlas.save(OUT, optimize=True)
    print(f'\nSaved: {OUT} ({W}x{H}, 35 rows)')

if __name__ == '__main__':
    main()
