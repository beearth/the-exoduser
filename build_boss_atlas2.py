"""
그록 보스 이미지 → 게임용 아틀라스 (체크무늬 배경 제거)
"""
from PIL import Image
import numpy as np
import os, shutil

BASE = 'G:/hell/img/grok_gen'
OUT = 'G:/hell/img/mobs/atlas_boss_si0_dir.png'
CELL = 128
COLS = 32
ROWS = 4

DIR_FILES = {
    0: os.path.join(BASE, 'boss_south.png'),
    1: os.path.join(BASE, 'boss_east.png'),
    2: os.path.join(BASE, 'boss_north.png'),
    3: os.path.join(BASE, 'boss_west.png'),
}

ANIM_MAP = {
    0:0,1:1,2:0,3:1,
    4:2,5:3,6:2,7:3,
    8:4,9:5,10:6,11:7,12:6,13:7,
    14:0,15:1,16:0,17:1,18:0,19:1,
    20:6,21:7,22:6,23:7,24:6,25:7,
    26:4,27:5,28:4,29:5,30:4,31:5,
}

def remove_checker_bg(img):
    """체크무늬 배경을 투명으로 변환"""
    arr = np.array(img.convert('RGBA'), dtype=np.float32)
    # 체크무늬 색상: 밝은 회색(~200,200,200) + 어두운 회색(~170,170,170)
    # 피부/갑옷은 주로 어두운 색상(< 100) 또는 보라색
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # 회색 체크무늬 감지: R≈G≈B 이고 밝기 140~220 범위
    gray_mask = (np.abs(r - g) < 15) & (np.abs(g - b) < 15) & (r > 130) & (r < 230)
    
    # 회색 배경 → 투명
    arr[gray_mask, 3] = 0
    
    # 약간 투명한 경계 부드럽게
    edge_mask = (np.abs(r - g) < 20) & (np.abs(g - b) < 20) & (r > 110) & (r < 240)
    # 캐릭터에 가까운 회색은 반투명으로
    brightness = (r + g + b) / 3
    semi_mask = edge_mask & (brightness > 120) & (brightness < 250) & (arr[:,:,3] > 0)
    arr[semi_mask, 3] = np.clip(arr[semi_mask, 3] * 0.3, 0, 255)
    
    return Image.fromarray(arr.astype(np.uint8))

def extract_frames(img_path, num_frames=8):
    img = Image.open(img_path).convert('RGBA')
    img = remove_checker_bg(img)
    w, h = img.size
    fw = w // num_frames
    frames = []
    for i in range(num_frames):
        frame = img.crop((i * fw, 0, (i + 1) * fw, h))
        frame = frame.resize((CELL, CELL), Image.LANCZOS)
        frames.append(frame)
    return frames

atlas = Image.new('RGBA', (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))

for row, src_path in DIR_FILES.items():
    print(f'처리: {src_path}')
    frames = extract_frames(src_path)
    for col in range(COLS):
        src_idx = ANIM_MAP.get(col, 0)
        frame = frames[min(src_idx, len(frames)-1)]
        atlas.paste(frame, (col * CELL, row * CELL))

atlas.save(OUT)
print(f'아틀라스 저장: {OUT} ({atlas.size[0]}x{atlas.size[1]})')
