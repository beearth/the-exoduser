#!/usr/bin/env python3
"""
build_atlas_boss01.py — Boss01 Ice Knight 스프라이트 아틀라스 빌더
출력: atlas_boss01.png + atlas_boss01.json
누락 방향은 수평반전(mirror)으로 보완:
  east←west, south-east←south-west, north-east←north-west, north←south(anim only)
"""
import os, json
from PIL import Image

SRC = os.path.join(os.path.dirname(__file__), 'img', 'boss01', 'extracted')
OUT_PNG = os.path.join(os.path.dirname(__file__), 'atlas_boss01.png')
OUT_JSON = os.path.join(os.path.dirname(__file__), 'atlas_boss01.json')
CELL = 48

DIRS = [
    ('south',      's'),
    ('south-east', 'se'),
    ('east',       'e'),
    ('north-east', 'ne'),
    ('north',      'n'),
    ('north-west', 'nw'),
    ('west',       'w'),
    ('south-west', 'sw'),
]

# mirror: target_dir -> source_dir (horizontal flip)
MIRROR = {
    'east':       'west',
    'south-east': 'south-west',
    'north-east': 'north-west',
}
# fallback chain: if mirror source also missing, try these (with flip)
FALLBACK = {
    'north-west': [('west', True), ('south-west', False)],
    'north-east': [('east', True), ('west', True), ('south-west', True)],
    'north':      [('south', False)],
}

ANIMS = [
    ('idle',   'fight-stance-idle-8-frames', 8),
    ('punch',  'cross-punch',               6),
    ('kick',   'high-kick',                 7),
    ('hit',    'taking-punch',              6),
]


def load_frames(folder, direction, n_frames):
    """Load animation frames; mirror from counterpart if missing."""
    if folder == 'rotations':
        path = os.path.join(SRC, 'rotations', f'{direction}.png')
        if os.path.exists(path):
            return [Image.open(path).convert('RGBA')], False
        # mirror
        src = MIRROR.get(direction)
        if src:
            mp = os.path.join(SRC, 'rotations', f'{src}.png')
            if os.path.exists(mp):
                return [Image.open(mp).convert('RGBA').transpose(Image.FLIP_LEFT_RIGHT)], True
        return [], False

    anim_dir = os.path.join(SRC, 'animations', folder, direction)
    mirrored = False

    if not os.path.isdir(anim_dir):
        # Try mirror source
        src = MIRROR.get(direction)
        if src:
            candidate = os.path.join(SRC, 'animations', folder, src)
            if os.path.isdir(candidate):
                anim_dir = candidate
                mirrored = True

    if not os.path.isdir(anim_dir):
        # Try fallback chain
        for fb_dir, fb_flip in FALLBACK.get(direction, []):
            candidate = os.path.join(SRC, 'animations', folder, fb_dir)
            if os.path.isdir(candidate):
                anim_dir = candidate
                mirrored = fb_flip
                break

    if not os.path.isdir(anim_dir):
        return [], False

    frames = []
    for i in range(n_frames):
        path = os.path.join(anim_dir, f'frame_{i:03d}.png')
        if os.path.exists(path):
            img = Image.open(path).convert('RGBA')
            if mirrored:
                img = img.transpose(Image.FLIP_LEFT_RIGHT)
            frames.append(img)
    return frames, mirrored


def build():
    max_frames = max(a[2] for a in ANIMS)  # 8
    n_anims = 1 + len(ANIMS)  # rotation row + 4 anim groups
    row_width = max_frames * len(DIRS)  # 8*8 = 64 cells
    atlas_w = row_width * CELL
    atlas_h = n_anims * CELL

    atlas = Image.new('RGBA', (atlas_w, atlas_h), (0, 0, 0, 0))
    frame_map = {}

    # Row 0: rotations
    for dir_idx, (dir_name, dir_suffix) in enumerate(DIRS):
        frames, mir = load_frames('rotations', dir_name, 1)
        key = f'rot_{dir_suffix}'
        if frames:
            img = frames[0]
            if img.size != (CELL, CELL):
                img = img.resize((CELL, CELL), Image.NEAREST)
            x = dir_idx * max_frames * CELL
            atlas.paste(img, (x, 0), img)
            frame_map[key] = [{'x': x, 'y': 0, 'w': CELL, 'h': CELL}]
            print(f'  {key}: 1 frame {"(mirrored)" if mir else ""}')
        else:
            print(f'  WARNING: no rotation for {dir_name}')

    # Animation rows
    for anim_idx, (game_key, folder, n_frames) in enumerate(ANIMS):
        row = anim_idx + 1
        for dir_idx, (dir_name, dir_suffix) in enumerate(DIRS):
            frames, mir = load_frames(folder, dir_name, n_frames)
            key = f'{game_key}_{dir_suffix}'

            if not frames:
                print(f'  WARNING: no frames for {key}')
                continue

            frame_map[key] = []
            for f_idx, img in enumerate(frames):
                if img.size != (CELL, CELL):
                    img = img.resize((CELL, CELL), Image.NEAREST)
                x = (dir_idx * max_frames + f_idx) * CELL
                y = row * CELL
                atlas.paste(img, (x, y), img)
                frame_map[key].append({'x': x, 'y': y, 'w': CELL, 'h': CELL})

            tag = ' (mirrored)' if mir else ''
            print(f'  {key}: {len(frames)} frames{tag}')

    atlas.save(OUT_PNG, optimize=True)
    print(f'\nAtlas: {OUT_PNG} ({atlas_w}x{atlas_h})')

    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(frame_map, f, indent=2, ensure_ascii=False)
    print(f'JSON: {OUT_JSON} ({len(frame_map)} keys)')


if __name__ == '__main__':
    build()
