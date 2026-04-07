"""Build atlas_boss_si0_dir.png from boss_ch1_stag individual PNGs.
4 rows (S/E/N/W) x 32 cols, cell=128px, scaled from 256px source.
States: idle(4) walk(4) attack(6) hit(6) death(6) windup(6) = 32
"""
from PIL import Image
import os

CELL = 128
COLS = 32
ROWS = 4
SRC = 'G:/hell/img/bosses/boss_si0/animations'
OUT = 'G:/hell/img/mobs/atlas_boss_si0_dir.png'

DIRS = ['south', 'east', 'north', 'west']

# state -> (anim_folder, needed_frames, frame_indices or None=sequential)
STATES = [
    ('idle',   'idle-shaking-head', 4, [0, 3, 6, 9]),
    ('walk',   'running-6-frames',  4, [0, 1, 2, 3]),
    ('attack', 'attack',            6, [0, 1, 2, 3, 4, 5]),
    ('hit',    'hit-left',          6, None),  # 4 frames, pad to 6
    ('death',  'dying',             6, [0, 1, 2, 3, 4, 5]),
    ('windup', 'idle-shaking-head', 6, [0, 1, 2, 3, 4, 5]),
]

atlas = Image.new('RGBA', (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))

for row, direction in enumerate(DIRS):
    col = 0
    for state_name, anim_folder, need, indices in STATES:
        anim_dir = os.path.join(SRC, anim_folder, direction)
        if not os.path.isdir(anim_dir):
            print(f'WARN: missing {anim_dir}, skipping')
            col += need
            continue

        frames = sorted([f for f in os.listdir(anim_dir) if f.endswith('.png')])

        if indices:
            pick = [frames[min(i, len(frames)-1)] for i in indices]
        else:
            # pad last frame to fill
            pick = []
            for i in range(need):
                pick.append(frames[min(i, len(frames)-1)])

        for fname in pick:
            fpath = os.path.join(anim_dir, fname)
            img = Image.open(fpath).convert('RGBA')
            img = img.resize((CELL, CELL), Image.LANCZOS)
            atlas.paste(img, (col * CELL, row * CELL), img)
            col += 1

atlas.save(OUT)
print(f'Saved {OUT}: {atlas.size[0]}x{atlas.size[1]}')
