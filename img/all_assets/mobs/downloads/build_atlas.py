"""
atlas_walk.png 업데이트 스크립트
- 기존 아틀라스를 읽고, 새로운 몬스터 행을 교체/추가
- 행 구조: idle(4) + walk(4) + attack(6) + hit(6) = 20열, 각 48px
- south 방향 우선, 없으면 east 대체
"""
from PIL import Image
import os, sys

CELL = 48
COLS = 20  # idle4 + walk4 + atk6 + hit6

# etype → atlas row (from _WA_ROW, last-wins for duplicates)
ROW_MAP = {
    85:95, 86:96, 87:97, 88:98, 89:99,
    90:100, 91:101, 92:102, 93:88, 94:89,
    95:103, 96:104, 97:92, 98:93, 99:94
}

# 애니메이션 매핑: (폴더명, 시작열, 프레임수)
ANIM_SLOTS = [
    ('breathing-idle', 0, 4),
    ('walking-4-frames', 4, 4),
    ('cross-punch', 8, 6),
    ('taking-punch', 14, 6),
]

ETYPES = [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99]
DL_DIR = os.path.dirname(os.path.abspath(__file__))
ATLAS_PATH = os.path.join(DL_DIR, '..', 'atlas_walk.png')

def get_frames(etype_dir, anim_name, count):
    """south 우선, 없으면 east 대체로 프레임 로드"""
    frames = []
    for d in ['south', 'east', 'west', 'north']:
        path = os.path.join(etype_dir, 'animations', anim_name, d)
        pngs = sorted([f for f in os.listdir(path) if f.endswith('.png')]) if os.path.isdir(path) else []
        if len(pngs) >= count:
            for i in range(count):
                img = Image.open(os.path.join(path, pngs[i])).convert('RGBA')
                # 48px로 리사이즈 (필요시)
                if img.width != CELL or img.height != CELL:
                    img = img.resize((CELL, CELL), Image.NEAREST)
                frames.append(img)
            return frames
    # 프레임 부족 → 빈 프레임으로 채움
    print(f"  WARNING: {anim_name} no valid direction found, using blank")
    blank = Image.new('RGBA', (CELL, CELL), (0,0,0,0))
    return [blank] * count

def main():
    # 기존 아틀라스 로드
    if os.path.exists(ATLAS_PATH):
        atlas = Image.open(ATLAS_PATH).convert('RGBA')
        print(f"기존 아틀라스 로드: {atlas.width}x{atlas.height}")
    else:
        print("기존 아틀라스 없음, 새로 생성")
        atlas = Image.new('RGBA', (COLS * CELL, 1), (0,0,0,0))

    # 필요한 최대 행 계산
    max_row = max(ROW_MAP[et] for et in ETYPES)
    needed_h = (max_row + 1) * CELL
    if atlas.height < needed_h:
        new_atlas = Image.new('RGBA', (COLS * CELL, needed_h), (0,0,0,0))
        new_atlas.paste(atlas, (0, 0))
        atlas = new_atlas
        print(f"아틀라스 확장: {atlas.width}x{atlas.height}")

    # 각 etype 행 빌드
    for et in ETYPES:
        row = ROW_MAP[et]
        etype_dir = os.path.join(DL_DIR, f'etype{et}')
        if not os.path.isdir(etype_dir):
            print(f"etype{et}: 폴더 없음, 스킵")
            continue

        print(f"etype{et} → row {row}:")
        for anim_name, start_col, frame_count in ANIM_SLOTS:
            frames = get_frames(etype_dir, anim_name, frame_count)
            for i, fr in enumerate(frames):
                x = (start_col + i) * CELL
                y = row * CELL
                # 기존 영역 클리어 후 붙이기
                atlas.paste(Image.new('RGBA', (CELL, CELL), (0,0,0,0)), (x, y))
                atlas.paste(fr, (x, y), fr)
            print(f"  {anim_name}: {len(frames)} frames @ col {start_col}")

    # 저장
    out_path = ATLAS_PATH
    # 백업
    bak = ATLAS_PATH + '.bak3'
    if os.path.exists(ATLAS_PATH):
        import shutil
        shutil.copy2(ATLAS_PATH, bak)
        print(f"백업: {bak}")

    atlas.save(out_path, 'PNG', optimize=True)
    print(f"저장 완료: {out_path} ({atlas.width}x{atlas.height}, {os.path.getsize(out_path)//1024}KB)")

if __name__ == '__main__':
    main()
