#!/usr/bin/env python3
"""
보스 아틀라스 빌드: atlas_boss_walk.png
레이아웃: idle(4) + walk(4) + attack(6) + hit(6) = 20cols, 64px
7행 (장별 1보스)
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

BOSSES = [
    'boss_ch1_forest',
    'boss_ch2_bug',
    'boss_ch3_ice',
    'boss_ch4_flame',
    'boss_ch5_war',
    'boss_ch6_flesh',
    'boss_ch7_hell',
]

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

def tint(img, rgb, strength):
    arr = np.array(img).astype(np.float32)
    for c in range(3):
        arr[:,:,c] = arr[:,:,c] * (1-strength) + rgb[c] * strength
    arr[:,:,:3] = np.clip(arr[:,:,:3], 0, 255)
    return Image.fromarray(arr.astype(np.uint8))

def main():
    W = COLS * CELL  # 1280
    H = len(BOSSES) * CELL  # 448
    atlas = Image.new('RGBA', (W, H), (0,0,0,0))

    fallback_row = None  # ch1 row for palette swap

    for row, bname in enumerate(BOSSES):
        bdir = os.path.join(BOSS_DIR, bname)
        y = row * CELL

        if not os.path.isdir(bdir) or not os.path.exists(os.path.join(bdir, 'rotations')):
            # ch5 등 실패한 보스 → ch1 팔레트 스왑
            if fallback_row is not None:
                print(f'  {bname}: MISSING → palette swap from ch1')
                src = atlas.crop((0, 0, W, CELL))
                tinted = tint(src, (100,40,40), 0.4)  # 어두운 적색
                atlas.paste(tinted, (0, y))
            continue

        rot = load_rot(bdir)
        walk = load_frames(bdir, 'walking-4-frames', ['walk-4-frames'])
        attack = load_frames(bdir, 'cross-punch')
        hit = load_frames(bdir, 'taking-punch')

        idle_img = fit(rot) if rot else (fit(walk[0]) if walk else None)
        if not idle_img:
            print(f'  {bname}: NO sprites, skip')
            continue

        # idle (0-3)
        for i in range(4):
            atlas.paste(idle_img, (i*CELL, y))

        # walk (4-7)
        src = walk if walk else [idle_img]
        for i in range(4):
            atlas.paste(fit(src[i%len(src)]), ((4+i)*CELL, y))

        # attack (8-13)
        src = attack if attack else (walk if walk else [idle_img])
        for i in range(6):
            atlas.paste(fit(src[i%len(src)]), ((8+i)*CELL, y))

        # hit (14-19)
        src = hit if hit else [idle_img]
        for i in range(6):
            atlas.paste(fit(src[i%len(src)]), ((14+i)*CELL, y))

        status = f'walk({len(walk)})' if walk else 'walk(fb)'
        status += f' atk({len(attack)})' if attack else ' atk(fb)'
        status += f' hit({len(hit)})' if hit else ' hit(fb)'
        print(f'  {bname}: {status}')

        if row == 0:
            fallback_row = True

    atlas.save(OUT, optimize=True)
    print(f'\nSaved: {OUT} ({W}x{H})')

if __name__ == '__main__':
    main()
