#!/usr/bin/env python3
"""atlas_walk.png에 레어몹 etype 90-99 추가 (팔레트 스왑)"""
import os
import numpy as np
from PIL import Image

BASE = os.path.dirname(__file__)
ATLAS_PATH = os.path.join(BASE, 'img', 'mobs', 'atlas_walk.png')
CELL = 48

WA_ROW = {0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,
          12:10,13:11,18:12,41:13,44:14,49:15,56:16,
          50:17,51:18,52:19,53:20,54:21,57:22,58:23,59:24,55:25,
          14:26,15:27,16:28,17:29,19:30,40:31,42:32,43:33,
          45:34,46:35,47:36,48:37,10:38,11:39,22:40,23:41,20:42,21:43}

# 레어몹 col 기준 틴트
REMAP = {
    90: (6,  (153,153,153), 0.4),   # 방랑기사 ← shield, 회색
    91: (3,  (221,170,0),   0.5),   # 보물악마 ← swarm, 금색
    92: (9,  (204,204,221), 0.4),   # 거울사도 ← sorcerer, 은빛
    93: (0,  (136,102,68),  0.35),  # 상인악마 ← melee, 갈색
    94: (4,  (85,85,102),   0.5),   # 사슬죄수 ← tank, 철색
    95: (8,  (170,187,153), 0.4),   # 시간사도 ← alchemist, 연녹
    96: (2,  (221,204,0),   0.5),   # 탐욕사도 ← charger, 황금
    97: (0,  (68,51,85),    0.45),  # 저주쌍둥이 ← melee, 보라
    98: (1,  (34,0,51),     0.5),   # 차원균열 ← archer, 암자
    99: (49, (10,10,10),    0.6),   # 죽음 ← boss급, 검정
}

def tint_row(arr, src_row, tint_rgb, strength):
    y = src_row * CELL
    row_data = arr[y:y+CELL, :, :].copy().astype(np.float32)
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
    new_rows = []
    row_map = {}
    for et in sorted(REMAP.keys()):
        src_et, tint, strength = REMAP[et]
        src_row = WA_ROW.get(src_et)
        if src_row is None:
            print(f'  etype {et}: source {src_et} missing, skip')
            continue
        new_rows.append(tint_row(arr, src_row, tint, strength))
        row_idx = cur_rows + len(new_rows) - 1
        row_map[et] = row_idx
        print(f'  etype {et} ← etype {src_et} (row {src_row}) → row {row_idx}')
    new_h = (cur_rows + len(new_rows)) * CELL
    new_atlas = np.zeros((new_h, aw, 4), dtype=np.uint8)
    new_atlas[:ah, :, :] = arr
    for i, rd in enumerate(new_rows):
        y = (cur_rows + i) * CELL
        new_atlas[y:y+CELL, :, :] = rd
    Image.fromarray(new_atlas).save(ATLAS_PATH, optimize=True)
    print(f'\nSaved: {aw}x{new_h} ({cur_rows+len(new_rows)} rows)')
    parts = [f'{et}:{row_map[et]}' for et in sorted(row_map.keys())]
    print(f'_WA_ROW 추가: ,{",".join(parts)}')

if __name__ == '__main__':
    main()
