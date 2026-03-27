#!/usr/bin/env python3
"""
atlas_walk.png 재빌드 (south + north 2방향)
레이아웃: 20cols x 190행 (9120px)
  행 0~94:  south 방향
  행 95~189: north 방향
게임에서: east/west는 south를 좌우반전하여 사용
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
TOTAL_ROWS = ROWS_PER_DIR * 2  # south + north = 190

ANIM_IDLE = ['breathing-idle', 'fight-stance-idle-8-frames']
ANIM_WALK = ['walking-4-frames', 'walk-4-frames', 'running-4-frames']
ANIM_ATK = ['cross-punch', 'fireball', 'flying-kick', 'throw-object', 'lead-jab', 'high-kick', 'bark']
ANIM_HIT = ['taking-punch', 'falling-back-death']

def find_monster_dir(et):
    legacy = os.path.join(MONSTERS, f'etype{et}_full')
    if os.path.isdir(legacy):
        return legacy
    pattern = os.path.join(ALL_ASSETS_MONSTERS, f'mon_*_et{et}_*')
    matches = glob.glob(pattern)
    if matches:
        px48 = os.path.join(matches[0], '48px')
        if os.path.isdir(px48):
            return px48
        return matches[0]
    pattern2 = os.path.join(MONSTERS, f'mon_*_et{et}_*')
    matches2 = glob.glob(pattern2)
    if matches2:
        px48 = os.path.join(matches2[0], '48px')
        if os.path.isdir(px48):
            return px48
        return matches2[0]
    return None

def find_anim_for_dir(et, candidates, direction):
    """특정 방향의 애니 프레임 찾기. 없으면 south 폴백."""
    mdir = find_monster_dir(et)
    if not mdir:
        return []
    base = os.path.join(mdir, 'animations')
    # 1차: 요청 방향
    for name in candidates:
        dp = os.path.join(base, name, direction)
        if os.path.isdir(dp):
            frames = sorted([f for f in os.listdir(dp) if f.endswith('.png')])
            if frames:
                return [Image.open(os.path.join(dp, f)).convert('RGBA') for f in frames]
    # 2차: south 폴백
    if direction != 'south':
        for name in candidates:
            dp = os.path.join(base, name, 'south')
            if os.path.isdir(dp):
                frames = sorted([f for f in os.listdir(dp) if f.endswith('.png')])
                if frames:
                    return [Image.open(os.path.join(dp, f)).convert('RGBA') for f in frames]
    # 3차: 아무 방향
    for name in candidates:
        anim_dir = os.path.join(base, name)
        if os.path.isdir(anim_dir):
            for d in ['south', 'east', 'west', 'north']:
                dp = os.path.join(anim_dir, d)
                if os.path.isdir(dp):
                    frames = sorted([f for f in os.listdir(dp) if f.endswith('.png')])
                    if frames:
                        return [Image.open(os.path.join(dp, f)).convert('RGBA') for f in frames]
    return []

def load_rotation_for_dir(et, direction):
    mdir = find_monster_dir(et)
    if not mdir:
        return None
    p = os.path.join(mdir, 'rotations', f'{direction}.png')
    if os.path.exists(p):
        return Image.open(p).convert('RGBA')
    for d in ['south', 'east', 'west', 'north']:
        p2 = os.path.join(mdir, 'rotations', f'{d}.png')
        if os.path.exists(p2):
            return Image.open(p2).convert('RGBA')
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
    if idle:
        for i in range(4):
            atlas.paste(fit(idle[i % len(idle)]), (i * CELL, y))
    elif walk:
        for i in range(4):
            atlas.paste(fit(walk[0]), (i * CELL, y))
    elif rot:
        img = fit(rot)
        for i in range(4):
            atlas.paste(img, (i * CELL, y))

    if walk:
        for i in range(4):
            atlas.paste(fit(walk[i % len(walk)]), ((4 + i) * CELL, y))
    elif rot:
        img = fit(rot)
        for i in range(4):
            atlas.paste(img, ((4 + i) * CELL, y))

    if atk:
        for i in range(6):
            atlas.paste(fit(atk[i % len(atk)]), ((8 + i) * CELL, y))
    elif walk:
        for i in range(6):
            atlas.paste(fit(walk[i % len(walk)]), ((8 + i) * CELL, y))
    elif rot:
        img = fit(rot)
        for i in range(6):
            atlas.paste(img, ((8 + i) * CELL, y))

    if hit:
        for i in range(6):
            atlas.paste(fit(hit[i % len(hit)]), ((14 + i) * CELL, y))
    elif idle:
        for i in range(6):
            atlas.paste(fit(idle[0]), ((14 + i) * CELL, y))
    elif rot:
        img = fit(rot)
        for i in range(6):
            atlas.paste(img, ((14 + i) * CELL, y))

def main():
    import shutil
    if os.path.exists(ATLAS_PATH):
        backup = ATLAS_PATH + '.bak6'
        if not os.path.exists(backup):
            shutil.copy2(ATLAS_PATH, backup)

    atlas = Image.new('RGBA', (COLS * CELL, TOTAL_ROWS * CELL), (0, 0, 0, 0))
    updated = 0; skipped = 0

    for et, row in sorted(WA_ROW.items(), key=lambda x: x[1]):
        folder = find_monster_dir(et)
        if not folder:
            skipped += 1; continue

        info = []
        for di, direction in enumerate(['south', 'north']):
            idle = find_anim_for_dir(et, ANIM_IDLE, direction)
            walk = find_anim_for_dir(et, ANIM_WALK, direction)
            atk  = find_anim_for_dir(et, ANIM_ATK, direction)
            hit  = find_anim_for_dir(et, ANIM_HIT, direction)
            rot  = load_rotation_for_dir(et, direction)

            if not walk and not rot and not idle:
                continue

            y = (di * ROWS_PER_DIR + row) * CELL
            fill_row(atlas, y, idle, walk, atk, hit, rot)
            has = []
            if idle: has.append('i')
            if walk: has.append('w')
            if atk: has.append('a')
            if hit: has.append('h')
            info.append(f'{direction[0]}:{"".join(has) if has else "r"}')

        if info:
            updated += 1
            print(f'  et{et:>2d}→row{row:>2d}: {" ".join(info)}')
        else:
            skipped += 1

    atlas.save(ATLAS_PATH, optimize=True)
    print(f'\n✅ Saved: {atlas.size[0]}x{atlas.size[1]} ({TOTAL_ROWS} rows, south+north)')
    print(f'Updated: {updated}, Skipped: {skipped}')

if __name__ == '__main__':
    main()
