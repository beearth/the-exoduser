#!/usr/bin/env python3
"""
atlas_walk.png의 etype 10,11,20,21,22,23 행을
공격/피격 프레임으로 재빌드
레이아웃: idle(4) + walk(4) + attack(6) + hit(6) = 20cols, 48px
"""
import os, glob
import numpy as np
from PIL import Image

BASE = os.path.dirname(__file__)
ATLAS_PATH = os.path.join(BASE, 'img', 'mobs', 'atlas_walk.png')
MONSTERS = os.path.join(BASE, 'img', 'monsters')
CELL = 48

# 대상 etype → atlas row
TARGETS = {10:38, 11:39, 20:42, 21:43, 22:40, 23:41}

# 프레임 로드 유틸
DIR_PRIO = ['south','east','west','north']

def load_frames(et, anim_name, alt_names=None):
    """_anim/animations/{anim_name}/south/ 에서 프레임 로드"""
    names = [anim_name] + (alt_names or [])
    for name in names:
        for d in DIR_PRIO:
            path = os.path.join(MONSTERS, f'etype{et}_full', '_anim', 'animations', name, d)
            if os.path.isdir(path):
                pngs = sorted(glob.glob(os.path.join(path, 'frame_*.png')))
                if pngs:
                    return [Image.open(p).convert('RGBA') for p in pngs]
    # 기존 폴더에서도 시도
    for name in names:
        for d in DIR_PRIO:
            path = os.path.join(MONSTERS, f'etype{et}_full', 'animations', name, d)
            if os.path.isdir(path):
                pngs = sorted(glob.glob(os.path.join(path, 'frame_*.png')))
                if pngs:
                    return [Image.open(p).convert('RGBA') for p in pngs]
    return []

def load_rotation(et):
    """rotation 이미지 로드"""
    for src in ['_anim/rotations', 'rotations']:
        for d in DIR_PRIO:
            p = os.path.join(MONSTERS, f'etype{et}_full', src, f'{d}.png')
            if os.path.exists(p):
                return Image.open(p).convert('RGBA')
    return None

def fit(img):
    if img.size == (CELL, CELL): return img
    w, h = img.size
    scale = min(CELL/w, CELL/h)
    nw, nh = int(w*scale), int(h*scale)
    resized = img.resize((nw, nh), Image.NEAREST)
    out = Image.new('RGBA', (CELL, CELL), (0,0,0,0))
    out.paste(resized, ((CELL-nw)//2, (CELL-nh)//2))
    return out

def main():
    atlas = Image.open(ATLAS_PATH).convert('RGBA')
    print(f'Atlas: {atlas.size[0]}x{atlas.size[1]}')

    for et, row in TARGETS.items():
        y = row * CELL

        # idle 프레임
        rot = load_rotation(et)
        idle_img = fit(rot) if rot else None

        # walk 프레임
        walk = load_frames(et, 'walking-4-frames', ['walk-4-frames'])

        # attack 프레임
        attack = load_frames(et, 'cross-punch', ['bark'])

        # hit 프레임
        hit = load_frames(et, 'taking-punch')

        # 폴백: idle 없으면 walk[0], walk 없으면 idle
        if not idle_img and walk:
            idle_img = fit(walk[0])
        if not walk and idle_img:
            walk = [idle_img]
        if not idle_img:
            print(f'  etype {et}: NO sprites at all, skip')
            continue

        changes = []

        # idle: 4슬롯 (col 0-3)
        for i in range(4):
            atlas.paste(idle_img, (i * CELL, y))

        # walk: 4슬롯 (col 4-7)
        if walk:
            for i in range(4):
                atlas.paste(fit(walk[i % len(walk)]), ((4+i) * CELL, y))
            changes.append(f'walk({len(walk)})')

        # attack: 6슬롯 (col 8-13)
        if attack:
            for i in range(6):
                atlas.paste(fit(attack[i % len(attack)]), ((8+i) * CELL, y))
            changes.append(f'atk({len(attack)})')
        else:
            # 폴백: walk 프레임으로 채움
            src = walk if walk else [idle_img]
            for i in range(6):
                atlas.paste(fit(src[i % len(src)]), ((8+i) * CELL, y))
            changes.append('atk(fallback)')

        # hit: 6슬롯 (col 14-19)
        if hit:
            for i in range(6):
                atlas.paste(fit(hit[i % len(hit)]), ((14+i) * CELL, y))
            changes.append(f'hit({len(hit)})')
        else:
            # 폴백: idle로 채움
            for i in range(6):
                atlas.paste(idle_img, ((14+i) * CELL, y))
            changes.append('hit(fallback)')

        print(f'  etype {et} row {row}: {", ".join(changes)}')

    atlas.save(ATLAS_PATH, optimize=True)
    print('Done!')

if __name__ == '__main__':
    main()
