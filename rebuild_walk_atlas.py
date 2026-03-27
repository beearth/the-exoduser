#!/usr/bin/env python3
"""
atlas_walk.png 재빌드 (south + north + east 3방향)
레이아웃: 20cols x 285행 (13680px)
  행 0~94:   south
  행 95~189: north
  행 190~284: east (west는 게임에서 east를 좌우반전)
"""
import os, glob
from PIL import Image

BASE = os.path.dirname(__file__)
ATLAS_PATH = os.path.join(BASE, 'img', 'mobs', 'atlas_walk.png')
MONSTERS = os.path.join(BASE, 'img', 'monsters')
ALL_ASSETS_MONSTERS = os.path.join(BASE, 'img', 'all_assets', 'monsters')
CELL = 48
COLS = 20

WA_ROW = {0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,12:10,13:11,18:12,41:13,44:14,49:15,56:16,50:17,51:18,52:19,53:20,54:21,57:22,58:23,59:24,55:25,14:26,15:27,16:28,17:29,19:30,40:31,42:32,43:33,45:34,46:35,47:36,48:37,10:38,11:39,22:40,23:41,20:42,21:43,60:44,61:45,62:46,63:47,64:48,65:49,66:50,67:51,68:52,69:53,70:54,71:55,72:56,73:57,74:58,75:59,76:60,77:61,78:62,79:63,80:64,81:65,82:66,83:67,84:68,24:69,25:70,26:71,27:72,28:73,29:74,30:75,31:76,32:77,33:78,34:79,35:80,36:81,37:82,38:83,39:84,90:85,91:86,92:87,93:88,94:89,95:90,96:91,97:92,98:93,99:94}

ROWS_PER_DIR = 95
DIRS = ['south', 'north', 'east']  # west = east flipped in game
TOTAL_ROWS = ROWS_PER_DIR * len(DIRS)  # 285

ANIM_IDLE = ['breathing-idle', 'fight-stance-idle-8-frames']
ANIM_WALK = ['walking-4-frames', 'walk-4-frames', 'running-4-frames']
ANIM_ATK = ['cross-punch', 'fireball', 'flying-kick', 'throw-object', 'lead-jab', 'high-kick', 'bark']
ANIM_HIT = ['taking-punch', 'falling-back-death']

def find_monster_dir(et):
    legacy = os.path.join(MONSTERS, f'etype{et}_full')
    if os.path.isdir(legacy):
        return legacy
    for root in [ALL_ASSETS_MONSTERS, MONSTERS]:
        matches = glob.glob(os.path.join(root, f'mon_*_et{et}_*'))
        if matches:
            px48 = os.path.join(matches[0], '48px')
            return px48 if os.path.isdir(px48) else matches[0]
    return None

def find_anim_for_dir(et, candidates, direction):
    mdir = find_monster_dir(et)
    if not mdir:
        return []
    base = os.path.join(mdir, 'animations')
    # 1: 요청 방향
    for name in candidates:
        dp = os.path.join(base, name, direction)
        if os.path.isdir(dp):
            frames = sorted(f for f in os.listdir(dp) if f.endswith('.png'))
            if frames:
                return [Image.open(os.path.join(dp, f)).convert('RGBA') for f in frames]
    # 2: west 요청 시 east 폴백 (게임에서 반전하므로)
    if direction == 'east':
        for fallback in ['west', 'south']:
            for name in candidates:
                dp = os.path.join(base, name, fallback)
                if os.path.isdir(dp):
                    frames = sorted(f for f in os.listdir(dp) if f.endswith('.png'))
                    if frames:
                        return [Image.open(os.path.join(dp, f)).convert('RGBA') for f in frames]
    # 3: south 폴백
    if direction != 'south':
        for name in candidates:
            dp = os.path.join(base, name, 'south')
            if os.path.isdir(dp):
                frames = sorted(f for f in os.listdir(dp) if f.endswith('.png'))
                if frames:
                    return [Image.open(os.path.join(dp, f)).convert('RGBA') for f in frames]
    # 4: 아무 방향
    for name in candidates:
        anim_dir = os.path.join(base, name)
        if os.path.isdir(anim_dir):
            for d in ['south', 'east', 'west', 'north']:
                dp = os.path.join(anim_dir, d)
                if os.path.isdir(dp):
                    frames = sorted(f for f in os.listdir(dp) if f.endswith('.png'))
                    if frames:
                        return [Image.open(os.path.join(dp, f)).convert('RGBA') for f in frames]
    return []

def load_rotation_for_dir(et, direction):
    mdir = find_monster_dir(et)
    if not mdir:
        return None
    for d in [direction, 'south', 'east', 'west', 'north']:
        p = os.path.join(mdir, 'rotations', f'{d}.png')
        if os.path.exists(p):
            return Image.open(p).convert('RGBA')
    return None

def fit(img, size=CELL):
    if img.size == (size, size):
        return img
    w, h = img.size
    scale = min(size / w, size / h)
    nw, nh = int(w * scale), int(h * scale)
    resized = img.resize((nw, nh), Image.NEAREST)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.paste(resized, ((size - nw) // 2, (size - nh) // 2))
    return out

def fill_row(atlas, y, idle, walk, atk, hit, rot):
    src = [(range(4), idle, walk, rot, True),
           (range(4,8), walk, None, rot, False),
           (range(8,14), atk, walk, rot, False),
           (range(14,20), hit, idle, rot, False)]
    for cols, primary, secondary, fallback, use_first in src:
        data = primary or secondary
        if not data and fallback:
            img = fit(fallback)
            for i in cols:
                atlas.paste(img, (i * CELL, y))
        elif data:
            for i in cols:
                idx = 0 if (use_first and not primary and secondary) else (i - cols.start) % len(data)
                atlas.paste(fit(data[idx]), (i * CELL, y))

def main():
    import shutil
    if os.path.exists(ATLAS_PATH):
        bak = ATLAS_PATH + '.bak7'
        if not os.path.exists(bak):
            shutil.copy2(ATLAS_PATH, bak)

    atlas = Image.new('RGBA', (COLS * CELL, TOTAL_ROWS * CELL), (0, 0, 0, 0))
    updated = 0; skipped = 0

    for et, row in sorted(WA_ROW.items(), key=lambda x: x[1]):
        folder = find_monster_dir(et)
        if not folder:
            skipped += 1; continue
        info = []
        for di, direction in enumerate(DIRS):
            idle = find_anim_for_dir(et, ANIM_IDLE, direction)
            walk = find_anim_for_dir(et, ANIM_WALK, direction)
            atk  = find_anim_for_dir(et, ANIM_ATK, direction)
            hit  = find_anim_for_dir(et, ANIM_HIT, direction)
            rot  = load_rotation_for_dir(et, direction)
            if not walk and not rot and not idle:
                continue
            y = (di * ROWS_PER_DIR + row) * CELL
            fill_row(atlas, y, idle, walk, atk, hit, rot)
            has = ''.join(c for c, v in [('i',idle),('w',walk),('a',atk),('h',hit)] if v) or 'r'
            info.append(f'{direction[0]}:{has}')
        if info:
            updated += 1
            print(f'  et{et:>2d}→r{row:>2d}: {" ".join(info)}')
        else:
            skipped += 1

    atlas.save(ATLAS_PATH, optimize=True)
    print(f'\n✅ {atlas.size[0]}x{atlas.size[1]} ({TOTAL_ROWS}rows, s+n+e)')
    print(f'Updated:{updated} Skipped:{skipped}')

if __name__ == '__main__':
    main()
