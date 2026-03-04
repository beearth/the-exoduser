#!/usr/bin/env python3
"""
build_atlas.py — PixelLab 캐릭터 스프라이트 → 8방향 아틀라스 빌더
출력: atlas_player.png + atlas_player.json
"""
import os, json
from PIL import Image

SRC = os.path.join(os.path.dirname(__file__), 'tmp_sprites', 'player')
OUT_PNG = os.path.join(os.path.dirname(__file__), 'atlas_player.png')
OUT_JSON = os.path.join(os.path.dirname(__file__), 'atlas_player.json')
CELL = 48

# 8방향 순서 (PixelLab 디렉토리명 → JSON 접미사)
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

# 애니메이션 정의: (게임키, 소스폴더, 프레임수, 폴백방향)
# 폴백방향: 해당 방향 폴더가 없으면 이 방향의 프레임을 대신 사용
ANIMS = [
    ('idle',   'rotations',          1, None),    # rotations/는 프레임이 1개 (파일명이 다름)
    ('run',    'walking-4-frames',   4, None),    # 8방향 완전
    ('attack', 'cross-punch',        6, None),    # 8방향 완전
    ('hurt',   'taking-punch',       6, 'south'), # south+north만 있음
    ('die',    'falling-back-death', 7, 'south'), # south만 있음
]

def load_frames(anim_folder, direction, n_frames, fallback_dir):
    """프레임 이미지 리스트를 로드. 디렉토리 없으면 폴백."""
    frames = []

    if anim_folder == 'rotations':
        # rotations/는 animations가 아닌 최상위 폴더, 방향별 단일 PNG
        path = os.path.join(SRC, 'rotations', f'{direction}.png')
        if os.path.exists(path):
            frames.append(Image.open(path).convert('RGBA'))
        elif fallback_dir:
            fb_path = os.path.join(SRC, 'rotations', f'{fallback_dir}.png')
            if os.path.exists(fb_path):
                frames.append(Image.open(fb_path).convert('RGBA'))
        return frames

    # animations/ 폴더
    anim_dir = os.path.join(SRC, 'animations', anim_folder, direction)
    if not os.path.isdir(anim_dir):
        if fallback_dir:
            anim_dir = os.path.join(SRC, 'animations', anim_folder, fallback_dir)
        if not os.path.isdir(anim_dir):
            return frames

    for i in range(n_frames):
        path = os.path.join(anim_dir, f'frame_{i:03d}.png')
        if os.path.exists(path):
            frames.append(Image.open(path).convert('RGBA'))
    return frames


def build():
    # 각 애니메이션의 최대 프레임 수 계산 → 행 폭
    max_frames = max(a[2] for a in ANIMS)  # 7 (die)
    row_width = max_frames * len(DIRS)      # 7 * 8 = 56 cells
    atlas_w = row_width * CELL              # 2688px
    atlas_h = len(ANIMS) * CELL             # 240px

    atlas = Image.new('RGBA', (atlas_w, atlas_h), (0, 0, 0, 0))
    frame_map = {}

    for row_idx, (game_key, folder, n_frames, fallback) in enumerate(ANIMS):
        for dir_idx, (dir_name, dir_suffix) in enumerate(DIRS):
            frames = load_frames(folder, dir_name, n_frames, fallback)
            if not frames:
                print(f"  WARNING: No frames for {game_key}/{dir_name}, skipping")
                continue

            json_key = f'{game_key}_{dir_suffix}'
            frame_map[json_key] = []

            for f_idx, img in enumerate(frames):
                # 48x48로 리사이즈 (이미 48x48이면 무변경)
                if img.size != (CELL, CELL):
                    img = img.resize((CELL, CELL), Image.NEAREST)

                x = (dir_idx * max_frames + f_idx) * CELL
                y = row_idx * CELL
                atlas.paste(img, (x, y))
                frame_map[json_key].append({
                    'x': x, 'y': y, 'w': CELL, 'h': CELL
                })

            print(f"  {json_key}: {len(frames)} frames")

    atlas.save(OUT_PNG, optimize=True)
    print(f"\nAtlas saved: {OUT_PNG} ({atlas_w}x{atlas_h})")

    with open(OUT_JSON, 'w') as f:
        json.dump(frame_map, f, indent=2)
    print(f"JSON saved: {OUT_JSON} ({len(frame_map)} keys)")


if __name__ == '__main__':
    build()
