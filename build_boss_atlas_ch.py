#!/usr/bin/env python3
"""
build_boss_atlas_ch.py — 챕터별 보스 스프라이트 → atlas_bosses.png + atlas_bosses.json
img/bosses/boss_ch{N}_*/ 의 PixelLab 데이터 → 단일 아틀라스
"""
import os, json
from PIL import Image

BASE = os.path.dirname(os.path.abspath(__file__))
CELL = 64  # PixelLab 64x64 캔버스

# 챕터 보스 → stage index 매핑
BOSSES = [
    ('boss_ch1_forest', 0),   # 숲의 감시자
    ('boss_ch2_bug',    4),   # 벌레 수호자
    ('boss_ch3_ice',   10),   # 얼음 망령
    ('boss_ch4_flame', 14),   # 화염 악마
    ('boss_ch5_war',   21),   # 전쟁의 잔해
    ('boss_ch6_flesh', 26),   # 살점의 수호자
    ('boss_ch7_hell',  32),   # 검은 성의 수호자
]

# PixelLab 애니메이션 → 게임 상태 매핑
# _getBossAnimState 반환값: idle, attack, rage_attack, windup, rage_windup, stagger, breath, death, rage
ANIM_MAP = {
    'fight-stance-idle-8-frames': 'idle',
    'cross-punch': 'attack',
    'high-kick': 'windup',
    'taking-punch': 'stagger',
    'walking-4-frames': 'walk',
}

# 방향 우선순위: south 먼저 (facing 방향은 코드에서 flip으로 처리)
DIR_PRIO = ['south', 'east', 'west', 'north']

def load_anim_frames(boss_dir, anim_folder, direction):
    """애니메이션 프레임 로드"""
    anim_path = os.path.join(boss_dir, 'animations', anim_folder, direction)
    if not os.path.isdir(anim_path):
        return []
    frames = []
    i = 0
    while True:
        p = os.path.join(anim_path, f'frame_{i:03d}.png')
        if not os.path.exists(p):
            break
        frames.append(Image.open(p).convert('RGBA'))
        i += 1
    return frames

def build():
    all_boss_data = {}  # {si: {state: [PIL frames]}}

    for folder, si in BOSSES:
        boss_dir = os.path.join(BASE, 'img', 'bosses', folder)
        if not os.path.isdir(boss_dir):
            print(f'  [{folder}] 디렉토리 없음, 스킵')
            continue

        states = {}
        for anim_folder, game_state in ANIM_MAP.items():
            frames = []
            # south 방향 우선, 없으면 다른 방향
            for d in DIR_PRIO:
                frames = load_anim_frames(boss_dir, anim_folder, d)
                if frames:
                    break
            if frames:
                states[game_state] = frames
                print(f'  [{folder}] {game_state}: {len(frames)} frames')
            else:
                print(f'  [{folder}] {game_state}: 프레임 없음!')

        if states:
            all_boss_data[si] = states

    if not all_boss_data:
        print('빌드할 보스 데이터 없음')
        return

    # 아틀라스 크기 계산
    # 각 보스의 모든 상태의 모든 프레임을 한 줄에 배치, 보스별로 행 분리
    max_cols = 0
    rows_info = []  # [(si, total_frames, states_data)]

    for si in sorted(all_boss_data.keys()):
        states = all_boss_data[si]
        total = sum(len(f) for f in states.values())
        max_cols = max(max_cols, total)
        rows_info.append((si, total, states))

    atlas_w = max_cols * CELL
    atlas_h = len(rows_info) * CELL
    atlas = Image.new('RGBA', (atlas_w, atlas_h), (0, 0, 0, 0))

    json_data = {}

    for row_idx, (si, total, states) in enumerate(rows_info):
        col = 0
        y = row_idx * CELL
        boss_key = f'boss_{si}'
        json_data[boss_key] = {}

        for state_name in ['idle', 'walk', 'attack', 'windup', 'stagger']:
            if state_name not in states:
                continue
            frames = states[state_name]
            frame_rects = []
            for img in frames:
                x = col * CELL
                # 리사이즈 (필요시)
                if img.size != (CELL, CELL):
                    img = img.resize((CELL, CELL), Image.NEAREST)
                atlas.paste(img, (x, y), img)
                frame_rects.append({'x': x, 'y': y, 'w': CELL, 'h': CELL})
                col += 1
            json_data[boss_key][state_name] = frame_rects
            # rage variants → 같은 프레임 공유
            if state_name == 'attack':
                json_data[boss_key]['rage_attack'] = frame_rects
            if state_name == 'windup':
                json_data[boss_key]['rage_windup'] = frame_rects
            if state_name == 'idle':
                json_data[boss_key]['rage'] = frame_rects
                json_data[boss_key]['breath'] = frame_rects
                json_data[boss_key]['death'] = frame_rects

    out_png = os.path.join(BASE, 'atlas_bosses.png')
    out_json = os.path.join(BASE, 'atlas_bosses.json')
    atlas.save(out_png, optimize=True)
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

    print(f'\n✅ atlas_bosses.png: {atlas_w}x{atlas_h}')
    print(f'✅ atlas_bosses.json: {len(json_data)} bosses')
    for k, v in json_data.items():
        states_str = ', '.join(f'{s}({len(fr)})' for s, fr in v.items() if not s.startswith('rage'))
        print(f'   {k}: {states_str}')

if __name__ == '__main__':
    build()
