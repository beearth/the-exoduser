#!/usr/bin/env python3
"""
atlas_walk.png 전체 재빌드
img/monsters/etype{N}_full/ 폴더에서 스프라이트를 읽어
_WA_ROW 순서대로 95행 아틀라스 생성
레이아웃: 20cols x 48px (idle4 + walk4 + atk6 + hit6)
"""
import os, json
from PIL import Image

BASE = os.path.dirname(__file__)
ATLAS_PATH = os.path.join(BASE, 'img', 'mobs', 'atlas_walk.png')
MONSTERS = os.path.join(BASE, 'img', 'monsters')
CELL = 48
COLS = 20  # idle4 + walk4 + atk6 + hit6

# _WA_ROW 매핑 (game.html과 동일) — etype → row
WA_ROW = {0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,12:10,13:11,18:12,41:13,44:14,49:15,56:16,50:17,51:18,52:19,53:20,54:21,57:22,58:23,59:24,55:25,14:26,15:27,16:28,17:29,19:30,40:31,42:32,43:33,45:34,46:35,47:36,48:37,10:38,11:39,22:40,23:41,20:42,21:43,60:44,61:45,62:46,63:47,64:48,65:49,66:50,67:51,68:52,69:53,70:54,71:55,72:56,73:57,74:58,75:59,76:60,77:61,78:62,79:63,80:64,81:65,82:66,83:67,84:68,24:69,25:70,26:71,27:72,28:73,29:74,30:75,31:76,32:77,33:78,34:79,35:80,36:81,37:82,38:83,39:84,90:85,91:86,92:87,93:88,94:89,95:90,96:91,97:92,98:93,99:94}

TOTAL_ROWS = 95
DIR_PRIORITY = ['south', 'east', 'west', 'north']

# 애니메이션 이름 매핑
ANIM_IDLE = ['breathing-idle', 'fight-stance-idle-8-frames']
ANIM_WALK = ['walking-4-frames', 'walk-4-frames', 'running-4-frames']
ANIM_ATK = ['cross-punch', 'fireball', 'flying-kick', 'throw-object', 'lead-jab', 'high-kick', 'bark']
ANIM_HIT = ['taking-punch', 'falling-back-death']

def find_anim(et, candidates):
    base = os.path.join(MONSTERS, f'etype{et}_full', 'animations')
    for name in candidates:
        for d in DIR_PRIORITY:
            dp = os.path.join(base, name, d)
            if os.path.isdir(dp):
                frames = sorted([f for f in os.listdir(dp) if f.endswith('.png')])
                if frames:
                    return [Image.open(os.path.join(dp, f)).convert('RGBA') for f in frames]
    return []

def load_rotation(et):
    for d in DIR_PRIORITY:
        p = os.path.join(MONSTERS, f'etype{et}_full', 'rotations', f'{d}.png')
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

def main():
    # 기존 아틀라스 백업
    if os.path.exists(ATLAS_PATH):
        backup = ATLAS_PATH + '.bak'
        if not os.path.exists(backup):
            import shutil
            shutil.copy2(ATLAS_PATH, backup)
            print(f'Backup: {backup}')

    # 기존 아틀라스 로드 (플레이스홀더 유지용)
    old_atlas = None
    if os.path.exists(ATLAS_PATH):
        old_atlas = Image.open(ATLAS_PATH).convert('RGBA')

    atlas = Image.new('RGBA', (COLS * CELL, TOTAL_ROWS * CELL), (0, 0, 0, 0))

    # 기존 아틀라스 복사 (기본값)
    if old_atlas:
        atlas.paste(old_atlas, (0, 0))

    updated = 0
    skipped = 0

    for et, row in sorted(WA_ROW.items(), key=lambda x: x[1]):
        folder = os.path.join(MONSTERS, f'etype{et}_full')
        if not os.path.isdir(folder):
            skipped += 1
            continue

        idle = find_anim(et, ANIM_IDLE)
        walk = find_anim(et, ANIM_WALK)
        atk = find_anim(et, ANIM_ATK)
        hit = find_anim(et, ANIM_HIT)
        rot = load_rotation(et)

        if not walk and not rot and not idle:
            skipped += 1
            continue

        y = row * CELL

        # idle (4칸)
        if idle:
            for i in range(4):
                atlas.paste(fit(idle[i % len(idle)]), (i * CELL, y))
        elif walk:
            img = fit(walk[0])
            for i in range(4):
                atlas.paste(img, (i * CELL, y))
        elif rot:
            img = fit(rot)
            for i in range(4):
                atlas.paste(img, (i * CELL, y))

        # walk (4칸)
        if walk:
            for i in range(4):
                atlas.paste(fit(walk[i % len(walk)]), ((4 + i) * CELL, y))
        elif rot:
            img = fit(rot)
            for i in range(4):
                atlas.paste(img, ((4 + i) * CELL, y))

        # attack (6칸)
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

        # hit (6칸)
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

        updated += 1
        has = []
        if idle: has.append('idle')
        if walk: has.append('walk')
        if atk: has.append('atk')
        if hit: has.append('hit')
        print(f'  etype{et:>2d} → row{row:>2d}: {",".join(has) if has else "rot only"}')

    atlas.save(ATLAS_PATH, optimize=True)
    print(f'\n✅ Saved: {atlas.size[0]}x{atlas.size[1]} ({TOTAL_ROWS} rows)')
    print(f'Updated: {updated}, Skipped: {skipped}')

if __name__ == '__main__':
    main()
