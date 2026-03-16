#!/usr/bin/env python3
"""atlas_walk.png에 etype 24-39 추가 (팔레트 스왑)"""
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

# 1장 얼음길 잔여 (24-29) - 얼음/하늘 톤, 기존 1장 몬스터 리스킨
# 2장 야생악마길 (30-39) - 녹/갈색 톤
REMAP = {
    # 1장 얼음길 (24-29)
    24: (0,  (100, 160, 220), 0.4),   # frostZombie ← melee, 얼음
    25: (5,  (120, 200, 240), 0.4),   # iceSlime ← suicide, 빙하
    26: (9,  (80, 140, 220), 0.45),   # blizzardMage ← sorcerer, 눈보라
    27: (1,  (100, 180, 240), 0.4),   # icicleBat ← archer, 고드름
    28: (4,  (60, 120, 180), 0.45),   # glacierGolem ← tank, 빙하
    29: (19, (50, 100, 180), 0.5),    # iceDevil ← giant, 얼음악마

    # 2장 야생악마길 (30-39)
    30: (2,  (120, 80, 40), 0.4),     # huntDog ← charger, 갈색
    31: (0,  (80, 120, 50), 0.4),     # thornApostle ← melee, 가시녹
    32: (4,  (100, 80, 50), 0.45),    # boulderApostle ← tank, 바위갈
    33: (3,  (140, 60, 40), 0.4),     # miniDemon ← swarm, 붉은소형
    34: (8,  (60, 140, 30), 0.4),     # corrosiveApostle ← alchemist, 독녹
    35: (2,  (100, 60, 30), 0.4),     # beastApostle ← charger, 야수갈
    36: (1,  (60, 100, 40), 0.4),     # serpentApostle ← archer, 뱀녹
    37: (0,  (80, 60, 40), 0.35),     # predatorApostle ← melee, 어두운갈
    38: (17, (90, 70, 40), 0.45),     # broodApostle ← mother, 둥지갈
    39: (49, (60, 80, 30), 0.5),      # wildElderApostle ← boss급, 야생녹
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
