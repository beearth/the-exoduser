#!/usr/bin/env python3
"""
atlas_walk.png에 누락된 etype 행 추가 (10, 11, 22, 23)
레이아웃: 20cols x 48px (idle4 + walk4 + atk6 + hit6)
- walking 프레임 있으면 walk 슬롯에 배치
- rotations만 있으면 idle 슬롯에만 정적 배치 (나머지는 idle 복제)
"""
import os, sys
from PIL import Image

BASE = os.path.dirname(__file__)
ATLAS_PATH = os.path.join(BASE, 'img', 'mobs', 'atlas_walk.png')
MONSTERS = os.path.join(BASE, 'img', 'monsters')
CELL = 48
COLS = 20  # idle4 + walk4 + atk6 + hit6

# 추가할 etype → 새 행 번호
NEW_ETYPES = [20, 21]

# 방향 매핑 (atlas_walk는 south 기준 단방향)
DIR_PRIORITY = ['south', 'east', 'west', 'north']

def load_rotation(et):
    """rotations/south.png 로드 (없으면 아무 방향)"""
    for d in DIR_PRIORITY:
        p = os.path.join(MONSTERS, f'etype{et}_full', 'rotations', f'{d}.png')
        if os.path.exists(p):
            return Image.open(p).convert('RGBA')
    return None

def load_walk_frames(et):
    """walking-4-frames/south/ 에서 4프레임 로드"""
    frames = []
    for d in DIR_PRIORITY:
        d_path = os.path.join(MONSTERS, f'etype{et}_full', 'animations', 'walking-4-frames', d)
        if os.path.isdir(d_path):
            for i in range(4):
                fp = os.path.join(d_path, f'frame_{i:03d}.png')
                if os.path.exists(fp):
                    frames.append(Image.open(fp).convert('RGBA'))
            if frames:
                return frames
    return frames

def fit(img, size=CELL):
    """이미지를 CELL 크기에 맞게 리사이즈 (비율 유지, 센터)"""
    if img.size == (size, size):
        return img
    # 비율 유지 축소
    w, h = img.size
    scale = min(size / w, size / h)
    nw, nh = int(w * scale), int(h * scale)
    resized = img.resize((nw, nh), Image.NEAREST)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.paste(resized, ((size - nw) // 2, (size - nh) // 2))
    return out

def main():
    if not os.path.exists(ATLAS_PATH):
        print(f'ERROR: {ATLAS_PATH} not found')
        sys.exit(1)

    atlas = Image.open(ATLAS_PATH).convert('RGBA')
    aw, ah = atlas.size
    cur_rows = ah // CELL
    print(f'Current atlas: {aw}x{ah} ({cur_rows} rows)')

    added = 0
    for et in NEW_ETYPES:
        walk = load_walk_frames(et)
        rot = load_rotation(et)

        if not walk and not rot:
            print(f'  etype {et}: NO sprites found, skipping')
            continue

        new_row = cur_rows + added
        print(f'  etype {et}: row {new_row}', end='')

        # 아틀라스 높이 확장
        new_h = (new_row + 1) * CELL
        if new_h > atlas.size[1]:
            expanded = Image.new('RGBA', (aw, new_h), (0, 0, 0, 0))
            expanded.paste(atlas, (0, 0))
            atlas = expanded

        y = new_row * CELL

        if walk and len(walk) >= 4:
            # idle = walk[0] 정적 4회 반복
            idle_img = fit(walk[0])
            for i in range(4):
                atlas.paste(idle_img, (i * CELL, y))
            # walk = 4프레임
            for i, fr in enumerate(walk[:4]):
                atlas.paste(fit(fr), ((4 + i) * CELL, y))
            # attack = walk 프레임 반복 (6칸)
            for i in range(6):
                atlas.paste(fit(walk[i % len(walk)]), ((8 + i) * CELL, y))
            # hit = idle 반복 (6칸)
            for i in range(6):
                atlas.paste(fit(idle_img), ((14 + i) * CELL, y))
            print(f' (walk 4frames + idle)')
        elif rot:
            # 정적: 모든 슬롯에 rotation 이미지 배치
            img = fit(rot)
            for i in range(COLS):
                atlas.paste(img, (i * CELL, y))
            print(f' (rotation only, static)')

        added += 1

    if added > 0:
        atlas.save(ATLAS_PATH, optimize=True)
        print(f'\nSaved: {atlas.size[0]}x{atlas.size[1]} ({cur_rows + added} rows)')
        print(f'Added {added} rows: {[et for et in NEW_ETYPES if load_walk_frames(et) or load_rotation(et)]}')
        # _WA_ROW 매핑 출력
        print('\n_WA_ROW 추가 매핑:')
        idx = 0
        for et in NEW_ETYPES:
            if load_walk_frames(et) or load_rotation(et):
                print(f'  {et}:{cur_rows + idx}')
                idx += 1
    else:
        print('Nothing to add')

if __name__ == '__main__':
    main()
