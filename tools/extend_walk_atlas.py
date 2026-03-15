"""
atlas_walk.png 확장 스크립트
- 기존 아틀라스 하단에 새 etype 행 추가
- 각 행 = 20열 x 48px (idle4 + walk4 + atk6 + hit6)
- walk 프레임이 있으면 사용, 없으면 south rotation 반복
"""
from PIL import Image
import os, sys

CELL = 48
COLS = 20  # idle(4) + walk(4) + attack(6) + hit(6)
BASE = os.path.join(os.path.dirname(__file__), '..', 'img', 'monsters')
ATLAS_PATH = os.path.join(os.path.dirname(__file__), '..', 'img', 'mobs', 'atlas_walk.png')

# 새로 추가할 etype 목록 (순서대로 행 추가)
NEW_ETYPES = [50, 51, 52, 53, 54, 57, 58, 59]

def load_and_resize(path, size=CELL):
    """이미지 로드 후 CELL x CELL로 리사이즈 (NEAREST로 픽셀아트 보존)"""
    img = Image.open(path).convert('RGBA')
    if img.width != size or img.height != size:
        img = img.resize((size, size), Image.NEAREST)
    return img

def get_walk_frames(etype_dir):
    """walking-4-frames/south 폴더에서 4프레임 로드"""
    walk_dir = os.path.join(etype_dir, 'animations', 'walking-4-frames', 'south')
    if not os.path.isdir(walk_dir):
        return None
    frames = sorted([f for f in os.listdir(walk_dir) if f.endswith('.png')])
    if len(frames) < 4:
        return None
    return [load_and_resize(os.path.join(walk_dir, f)) for f in frames[:4]]

def get_south_rotation(etype_dir):
    """south rotation 이미지 로드"""
    south = os.path.join(etype_dir, 'rotations', 'south.png')
    if os.path.isfile(south):
        return load_and_resize(south)
    return None

def build_row(et):
    """한 etype의 20프레임 행 생성"""
    etype_dir = os.path.join(BASE, f'etype{et}_full')
    south = get_south_rotation(etype_dir)
    walk_frames = get_walk_frames(etype_dir)

    if south is None:
        print(f'  [WARN] etype{et}: south.png 없음, 빈 행')
        return Image.new('RGBA', (COLS * CELL, CELL), (0, 0, 0, 0))

    row = Image.new('RGBA', (COLS * CELL, CELL), (0, 0, 0, 0))

    # idle (col 0-3): south 반복
    for i in range(4):
        row.paste(south, (i * CELL, 0))

    # walk (col 4-7): walk frames 또는 south 반복
    if walk_frames:
        for i, wf in enumerate(walk_frames):
            row.paste(wf, ((4 + i) * CELL, 0))
        print(f'  etype{et}: walk 애니메이션 적용')
    else:
        for i in range(4):
            row.paste(south, ((4 + i) * CELL, 0))
        print(f'  etype{et}: walk 없음 → south 반복')

    # attack (col 8-13): south 반복
    for i in range(6):
        row.paste(south, ((8 + i) * CELL, 0))

    # hit (col 14-19): south 반복
    for i in range(6):
        row.paste(south, ((14 + i) * CELL, 0))

    return row

def main():
    # 기존 아틀라스 로드
    if not os.path.isfile(ATLAS_PATH):
        print(f'아틀라스 없음: {ATLAS_PATH}')
        sys.exit(1)

    atlas = Image.open(ATLAS_PATH).convert('RGBA')
    print(f'기존 아틀라스: {atlas.width}x{atlas.height} ({atlas.height // CELL}행)')

    # 새 행들 생성
    new_rows = []
    for et in NEW_ETYPES:
        row = build_row(et)
        new_rows.append(row)

    # 아틀라스 확장
    new_height = atlas.height + len(new_rows) * CELL
    new_atlas = Image.new('RGBA', (atlas.width, new_height), (0, 0, 0, 0))
    new_atlas.paste(atlas, (0, 0))

    for i, row in enumerate(new_rows):
        y = atlas.height + i * CELL
        new_atlas.paste(row, (0, y))

    # 저장
    new_atlas.save(ATLAS_PATH)
    print(f'\n새 아틀라스: {new_atlas.width}x{new_atlas.height} ({new_atlas.height // CELL}행)')

    # _WA_ROW 업데이트 정보 출력
    existing_rows = atlas.height // CELL
    print(f'\n_WA_ROW 업데이트:')
    for i, et in enumerate(NEW_ETYPES):
        print(f'  {et}:{existing_rows + i}')

    wa_entries = ','.join(f'{et}:{existing_rows + i}' for i, et in enumerate(NEW_ETYPES))
    print(f'\n추가할 코드: {wa_entries}')

if __name__ == '__main__':
    main()
