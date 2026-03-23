#!/usr/bin/env python3
"""
보스 35종 아틀라스: atlas_boss_walk.png
레이아웃: 35행 × 20칸, 64px 셀 (idle4 + walk4 + attack6 + hit6)
행 = 스테이지 인덱스 (si 0-34)
개별 si 폴더 우선 → 없으면 장 대표 + 팔레트 틴트 폴백
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

# 장별 대표 보스 폴더명 (폴백용)
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

# 장 내 보스별 틴트 (폴백 시에만 사용)
BOSS_TINTS = {
    0: None, 1: ((80, 180, 60), 0.3), 2: ((140, 100, 40), 0.3), 3: ((60, 40, 80), 0.35),
    4: None, 5: ((120, 200, 80), 0.3), 6: ((180, 80, 60), 0.3), 7: ((200, 180, 100), 0.25),
    8: ((140, 40, 40), 0.35), 9: ((180, 160, 120), 0.3),
    10: None, 11: ((120, 160, 220), 0.25), 12: ((60, 100, 160), 0.3), 13: ((40, 60, 100), 0.4),
    14: None, 15: ((220, 160, 40), 0.25), 16: ((200, 60, 20), 0.3), 17: ((220, 120, 40), 0.25),
    18: ((180, 40, 80), 0.3), 19: ((140, 80, 20), 0.3), 20: ((100, 40, 40), 0.35),
    21: None, 22: ((200, 200, 180), 0.25), 23: ((80, 40, 40), 0.3),
    24: ((140, 140, 160), 0.25), 25: ((60, 30, 60), 0.35),
    26: None, 27: ((200, 180, 160), 0.25), 28: ((120, 60, 80), 0.3),
    29: ((80, 120, 60), 0.3), 30: ((160, 80, 120), 0.3), 31: ((40, 20, 40), 0.4),
    32: None, 33: ((180, 20, 20), 0.35), 34: ((20, 10, 30), 0.5),
}

def find_si_dir(si):
    """si 번호로 개별 보스 폴더 찾기 (boss_si{N}_*)"""
    pattern = os.path.join(BOSS_DIR, f'boss_si{si}_*')
    matches = glob.glob(pattern)
    if matches and os.path.isdir(matches[0]):
        return matches[0]
    return None

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
    attack = load_frames(bdir, 'cross-punch', ['high-kick'])
    hit = load_frames(bdir, 'taking-punch', ['falling-back-death'])

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

    # 장별 베이스 행 캐시 (폴백용)
    ch_base_rows = {}
    for hell, bname in CH_BASE.items():
        bdir = os.path.join(BOSS_DIR, bname)
        row = build_row(bdir) if os.path.isdir(bdir) else None
        ch_base_rows[hell] = row

    # 35행 채우기: 개별 si 폴더 우선 → 장 대표+틴트 폴백
    for si in range(35):
        hell = SI_TO_HELL[si]

        # 1순위: 개별 si 폴더
        si_dir = find_si_dir(si)
        if si_dir:
            row = build_row(si_dir)
            if row:
                atlas.paste(row, (0, si * CELL))
                print(f'  si {si}: {os.path.basename(si_dir)} (개별)')
                continue

        # 2순위: 장 대표 + 틴트
        base = ch_base_rows.get(hell)
        if not base:
            print(f'  si {si}: NO base for hell {hell}, blank')
            continue

        tint_info = BOSS_TINTS.get(si)
        if tint_info is None:
            atlas.paste(base, (0, si * CELL))
            print(f'  si {si}: ch{hell+1} base (폴백)')
        else:
            rgb, strength = tint_info
            tinted = tint_row(base, rgb, strength)
            atlas.paste(tinted, (0, si * CELL))
            print(f'  si {si}: ch{hell+1} tint {rgb} (폴백)')

    atlas.save(OUT, optimize=True)
    print(f'\nSaved: {OUT} ({W}x{H}, 35 rows)')

if __name__ == '__main__':
    main()
