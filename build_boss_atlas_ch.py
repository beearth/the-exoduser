#!/usr/bin/env python3
"""
build_boss_atlas_ch.py — 챕터별 보스 스프라이트 → atlas_bosses.png + atlas_bosses.json
img/bosses/boss_ch{N}_*/ 의 PixelLab 데이터 → 단일 아틀라스
"""
import os, json
from PIL import Image

BASE = os.path.dirname(os.path.abspath(__file__))
CELL = 64  # PixelLab 64x64 캔버스 (기본)
# 128px 보스는 빌드 시 64px로 리사이즈 (아틀라스 통일)
BOSS_128 = {34}  # si34 지옥 군주만 128px 원본

# 전체 보스 35종 → stage index 매핑 (폴더명, 스테이지)
# PixelLab character ID → 폴더명 매핑은 download_bosses.py에서 처리
BOSSES = [
    # ── 1장 썩은 숲 (si 0~3) ──
    ('boss_si0_forest_watcher',   0),   # 숲의 감시자
    ('boss_si1_mushroom_giant',   1),   # 독버섯 거인
    ('boss_si2_forest_hunter',    2),   # 숲의 사냥꾼
    ('boss_si3_parasitic_tree',   3),   # 숲의 기생수 (장보스)
    # ── 2장 벌레굴 (si 4~9) ──
    ('boss_si4_worm_guard',       4),   # 벌레 수호자
    ('boss_si5_slime_beast',      5),   # 점액 괴수
    ('boss_si6_parasite_mother',  6),   # 기생충 모체
    ('boss_si7_egg_sac',          7),   # 거대 알주머니
    ('boss_si8_flesh_lord',       8),   # 살벽의 군주
    ('boss_si9_queen_maggot',     9),   # 여왕 구더기 (장보스)
    # ── 3장 얼음굴 (si 10~13) ──
    ('boss_si10_ice_wraith',     10),   # 얼음 망령
    ('boss_si11_frost_knight',   11),   # 서리의 기사
    ('boss_si12_frozen_guard',   12),   # 얼어붙은 감시자
    ('boss_si13_sealed_ice',     13),   # 얼음 속 봉인 괴물 (장보스)
    # ── 4장 화염지대 (si 14~20) ──
    ('boss_si14_flame_demon',    14),   # 화염 악마
    ('boss_si15_fire_pillar',    15),   # 불기둥 수호자
    ('boss_si16_lava_heart',     16),   # 용암의 심장
    ('boss_si17_flame_warrior',  17),   # 화염 전사
    ('boss_si18_twin_flame',     18),   # 화염 쌍두
    ('boss_si19_fire_bug_lord',  19),   # 불벌레 군주
    ('boss_si20_flame_jailer',   20),   # 화염 감옥지기 (장보스)
    # ── 5장 지옥 군단 (si 21~25) ──
    ('boss_si21_war_remnant',    21),   # 전쟁의 잔해
    ('boss_si22_bone_king',      22),   # 뼈산의 왕
    ('boss_si23_demon_commander',23),   # 악마 사령관
    ('boss_si24_iron_knight',    24),   # 철벽 기사단장
    ('boss_si25_legion_commander',25),  # 군단 지휘관 (장보스)
    # ── 6장 사도의 마굴 (si 26~31) ──
    ('boss_si26_flesh_guard',    26),   # 살점의 수호자
    ('boss_si27_bone_watcher',   27),   # 인간뼈 감시자
    ('boss_si28_twisted',        28),   # 뒤틀린 자
    ('boss_si29_tentacle_mother',29),   # 촉수의 어미
    ('boss_si30_imperfect_apostle',30), # 불완전 사도
    ('boss_si31_grand_apostle',  31),   # 대사도 (장보스)
    # ── 7장 지옥성 (si 32~34) ──
    ('boss_si32_dark_guardian',   32),   # 검은 성의 수호자
    ('boss_si33_killu',          33),   # Killu (스토리보스)
    ('boss_si34_hell_lord',      34),   # 지옥 군주 (최종보스, 128px)
]

# PixelLab 애니메이션 → 게임 상태 매핑
# _getBossAnimState 반환값: idle, attack, rage_attack, windup, rage_windup, stagger, breath, death, rage
ANIM_MAP = {
    'fight-stance-idle-8-frames': 'idle',
    'breathing-idle': 'idle',  # 대체 idle (fight-stance 없을 때)
    'cross-punch': 'attack',
    'high-kick': 'windup',
    'taking-punch': 'stagger',
    'walking-4-frames': 'walk',
    'walking': 'walk',  # 폴백 (walking-4-frames 없을 때)
    'falling-back-death': 'death',
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

        # 애니 없어도 rotations/south.png가 있으면 idle 1프레임으로 사용
        if 'idle' not in states:
            rot_path = os.path.join(boss_dir, 'rotations', 'south.png')
            if not os.path.exists(rot_path):
                rot_path = os.path.join(boss_dir, 'rotations', 'east.png')
            if os.path.exists(rot_path):
                img = Image.open(rot_path).convert('RGBA')
                states['idle'] = [img]
                print(f'  [{folder}] idle: rotations 폴백 (1 frame)')

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

        for state_name in ['idle', 'walk', 'attack', 'windup', 'stagger', 'death']:
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
        # death가 없으면 idle로 fallback
        if 'death' not in json_data[boss_key] and 'idle' in json_data[boss_key]:
            json_data[boss_key]['death'] = json_data[boss_key]['idle']

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
