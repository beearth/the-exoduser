#!/usr/bin/env python3
"""
atlas_walk.png에 etype 60-84 추가 (기존 스프라이트 팔레트 스왑)
"""
import os
import numpy as np
from PIL import Image

BASE = os.path.dirname(__file__)
ATLAS_PATH = os.path.join(BASE, 'img', 'mobs', 'atlas_walk.png')
CELL = 48
COLS = 20

# 기존 _WA_ROW 매핑
WA_ROW = {0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,
          12:10,13:11,18:12,41:13,44:14,49:15,56:16,
          50:17,51:18,52:19,53:20,54:21,57:22,58:23,59:24,55:25,
          14:26,15:27,16:28,17:29,19:30,40:31,42:32,43:33,
          45:34,46:35,47:36,48:37,10:38,11:39,22:40,23:41,20:42,21:43}

# etype → (소스 etype, tint RGB, tint strength)
REMAP = {
    # 5장 심해길 (60-69) - 푸른/청록 톤
    60: (0,  (40, 100, 180), 0.45),   # deepWalker ← melee, 짙은 파랑
    61: (4,  (30, 60, 140), 0.5),     # anglerDevil ← tank, 어두운 파랑
    62: (1,  (60, 180, 200), 0.45),   # jellyApostle ← archer, 시안
    63: (12, (40, 140, 140), 0.45),   # crabHorror ← berserker, 청록
    64: (3,  (70, 120, 160), 0.4),    # drownedSwarm ← swarm, 회청
    65: (8,  (30, 100, 120), 0.45),   # eelApostle ← alchemist, 암청
    66: (17, (50, 160, 140), 0.45),   # coralHorror ← mother, 산호청
    67: (16, (80, 150, 200), 0.4),    # sirenApostle ← trapper, 하늘
    68: (19, (20, 60, 120), 0.5),     # abyssalFish ← giant, 심해
    69: (49, (15, 40, 100), 0.5),     # abyssArchApostle ← 보스급, 심연

    # 6장 화산길 (70-79) - 붉은/주황 톤
    70: (0,  (200, 80, 30), 0.45),    # flameWalker ← melee, 주황
    71: (2,  (180, 50, 30), 0.45),    # volcDemon ← charger, 붉은
    72: (5,  (220, 140, 30), 0.4),    # lavaSlime ← suicide, 용암
    73: (1,  (200, 120, 40), 0.4),    # fireBat ← archer, 화염
    74: (6,  (100, 30, 20), 0.45),    # obsidianKnight ← shield, 암적
    75: (8,  (200, 60, 20), 0.45),    # fireSnake ← alchemist, 적색
    76: (3,  (180, 120, 60), 0.4),    # ashSwarm ← swarm, 재색
    77: (19, (200, 60, 20), 0.5),     # lavaGiant ← giant, 용암
    78: (9,  (220, 100, 30), 0.45),   # flamePriest ← sorcerer, 화염
    79: (49, (180, 30, 10), 0.5),     # dragonApostle ← 보스급, 용적

    # 7장 스킨변형 (80-84)
    80: (0,  (60, 140, 60), 0.35),    # bugSkin ← melee, 벌레녹
    81: (0,  (80, 160, 220), 0.35),   # iceSkin ← melee, 얼음청
    82: (0,  (220, 100, 30), 0.35),   # lavaSkin ← melee, 용암주황
    83: (0,  (60, 30, 120), 0.4),     # abyssSkin ← melee, 심연보라
    84: (0,  (220, 200, 100), 0.35),  # lightSkin ← melee, 빛황금
}

def tint_row(atlas_arr, src_row, tint_rgb, strength):
    """소스 행을 복사해서 틴트 적용, 새 행 반환"""
    y = src_row * CELL
    row_data = atlas_arr[y:y+CELL, :, :].copy().astype(np.float32)

    # RGB 채널만 틴트 (알파 보존)
    for c in range(3):
        row_data[:, :, c] = row_data[:, :, c] * (1 - strength) + tint_rgb[c] * strength

    row_data[:, :, :3] = np.clip(row_data[:, :, :3], 0, 255)
    return row_data.astype(np.uint8)

def main():
    atlas = Image.open(ATLAS_PATH).convert('RGBA')
    aw, ah = atlas.size
    cur_rows = ah // CELL
    print(f'Current atlas: {aw}x{ah} ({cur_rows} rows)')

    arr = np.array(atlas)

    # 새 행들 생성
    new_rows = []
    row_map = {}  # etype → new row number

    for et in sorted(REMAP.keys()):
        src_et, tint, strength = REMAP[et]
        src_row = WA_ROW.get(src_et)
        if src_row is None:
            print(f'  etype {et}: source etype {src_et} not in WA_ROW, skipping')
            continue

        new_row_data = tint_row(arr, src_row, tint, strength)
        new_rows.append(new_row_data)
        row_idx = cur_rows + len(new_rows) - 1
        row_map[et] = row_idx
        print(f'  etype {et} ← etype {src_et} (row {src_row}) tint={tint} → row {row_idx}')

    if not new_rows:
        print('Nothing to add')
        return

    # 새 아틀라스 생성
    new_h = (cur_rows + len(new_rows)) * CELL
    new_atlas = np.zeros((new_h, aw, 4), dtype=np.uint8)
    new_atlas[:ah, :, :] = arr

    for i, row_data in enumerate(new_rows):
        y = (cur_rows + i) * CELL
        new_atlas[y:y+CELL, :, :] = row_data

    result = Image.fromarray(new_atlas, 'RGBA')
    result.save(ATLAS_PATH, optimize=True)
    print(f'\nSaved: {aw}x{new_h} ({cur_rows + len(new_rows)} rows)')

    # _WA_ROW 코드 출력
    parts = []
    for et in sorted(row_map.keys()):
        parts.append(f'{et}:{row_map[et]}')
    print(f'\n_WA_ROW 추가: ,{",".join(parts)}')

if __name__ == '__main__':
    main()
