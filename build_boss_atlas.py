"""
그록 생성 보스 이미지 → 게임용 아틀라스 변환
형식: 4행(S/E/N/W) × 32열(idle4 + walk4 + attack6 + hit6 + death6 + windup6)
셀 크기: 128×128
출력: 4096×512
"""
from PIL import Image
import os, shutil

BASE = 'G:/hell/img/grok_gen'
OUT = 'G:/hell/img/mobs/atlas_boss_si0_dir.png'
BACKUP = 'G:/hell/img/mobs/atlas_boss_si0_dir_backup.png'
CELL = 128
COLS = 32
ROWS = 4

DIR_FILES = {
    0: os.path.join(BASE, 'boss_south.png'),
    1: os.path.join(BASE, 'boss_east.png'),
    2: os.path.join(BASE, 'boss_north.png'),
    3: os.path.join(BASE, 'boss_west.png'),
}

# 소스 8프레임: 0,1=idle, 2,3=walk, 4,5=windup, 6,7=attack
ANIM_MAP = {
    0:0,1:1,2:0,3:1,        # idle 4f
    4:2,5:3,6:2,7:3,        # walk 4f
    8:4,9:5,10:6,11:7,12:6,13:7,  # attack 6f
    14:0,15:1,16:0,17:1,18:0,19:1, # hit 6f
    20:6,21:7,22:6,23:7,24:6,25:7, # death 6f
    26:4,27:5,28:4,29:5,30:4,31:5, # windup 6f
}

def extract_frames(img_path, num_frames=8):
    img = Image.open(img_path).convert('RGBA')
    w, h = img.size
    fw = w // num_frames
    frames = []
    for i in range(num_frames):
        frame = img.crop((i * fw, 0, (i + 1) * fw, h))
        frame = frame.resize((CELL, CELL), Image.LANCZOS)
        frames.append(frame)
    return frames

if os.path.exists(OUT):
    shutil.copy2(OUT, BACKUP)
    print(f'백업: {BACKUP}')

atlas = Image.new('RGBA', (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))

for row, src_path in DIR_FILES.items():
    print(f'처리: {src_path}')
    frames = extract_frames(src_path)
    for col in range(COLS):
        src_idx = ANIM_MAP.get(col, 0)
        if src_idx < len(frames):
            frame = frames[src_idx]
        else:
            frame = frames[0]
        atlas.paste(frame, (col * CELL, row * CELL))

atlas.save(OUT)
print(f'아틀라스 저장: {OUT} ({atlas.size[0]}x{atlas.size[1]})')
