"""
Stabilize v2: Use foot-bottom-center anchor with STRICT alignment.
For each direction strip across ALL animations, find a consistent anchor
so the character doesn't shift when switching animations either.
"""
import os, json
from PIL import Image
import numpy as np

BASE = os.path.join(os.path.dirname(__file__), 'warrior_v2_raw')
OUT_DIR = os.path.join(os.path.dirname(__file__), '..')
SIZE = 48

DIRS_FULL = ['south','south-west','west','north-west','north','north-east','east','south-east']
DIR_CODES = ['s','sw','w','nw','n','ne','e','se']

ANIMS = [
    ('breathing-idle',             'idle'),
    ('walking-8-frames',           'run'),
    ('lead-jab',                   'atk1'),
    ('cross-punch',                'atk2'),
    ('surprise-uppercut',          'atk3'),
    ('fireball',                   'crossbow'),
    ('pushing',                    'bash'),
    ('crouching',                  'charge_start'),
    ('fight-stance-idle-8-frames', 'charge_hold'),
    ('hurricane-kick',             'charge_release'),
    ('taking-punch',               'hurt'),
    ('falling-back-death',         'die'),
]

MIRROR = {
    'east':       ('west', True),
    'south-east': ('south-west', True),
    'north-east': ('north-west', True),
}
FALLBACK = {
    'north': ['north-west','north-east','west','south'],
    'west':  ['south-west','north-west','south'],
    'south': ['south-west','south-east','west'],
    'north-west': ['west','north','south-west'],
    'south-west': ['west','south','north-west'],
}

def load_frames(anim_dir, direction):
    d = os.path.join(anim_dir, direction)
    if not os.path.isdir(d):
        return None
    files = sorted([f for f in os.listdir(d) if f.endswith('.png')])
    return [Image.open(os.path.join(d, f)).convert('RGBA') for f in files]

def flip_h(frames):
    return [f.transpose(Image.FLIP_LEFT_RIGHT) for f in frames]

def get_frames(anim_dir, dname, avail):
    frames = load_frames(anim_dir, dname)
    if frames: return frames
    if dname in MIRROR:
        src, do_flip = MIRROR[dname]
        frames = load_frames(anim_dir, src)
        if frames: return flip_h(frames) if do_flip else frames
    if dname in FALLBACK:
        for fb in FALLBACK[dname]:
            frames = load_frames(anim_dir, fb)
            if frames:
                if (dname.endswith('east') and fb.endswith('west')) or \
                   (dname.endswith('west') and fb.endswith('east')):
                    return flip_h(frames)
                return frames
    for a in avail:
        frames = load_frames(anim_dir, a)
        if frames: return frames
    return None

def get_bbox(img):
    """Get bounding box of non-transparent pixels."""
    arr = np.array(img)
    alpha = arr[:,:,3]
    ys, xs = np.where(alpha > 10)
    if len(xs) == 0:
        return None
    return int(np.min(xs)), int(np.min(ys)), int(np.max(xs)), int(np.max(ys))

def align_to_anchor(frames, anchor_cx, anchor_by):
    """Shift all frames so their bottom-center aligns to the given anchor."""
    result = []
    for f in frames:
        bbox = get_bbox(f)
        if bbox is None:
            result.append(f)
            continue
        x0, y0, x1, y1 = bbox
        cx = (x0 + x1) // 2
        by = y1
        dx = anchor_cx - cx
        dy = anchor_by - by
        if dx == 0 and dy == 0:
            result.append(f)
            continue
        new_f = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
        # Clamp paste position to stay within canvas
        new_f.paste(f, (max(-SIZE, min(SIZE, dx)), max(-SIZE, min(SIZE, dy))))
        result.append(new_f)
    return result

# STEP 1: Collect all frames per direction across ALL animations
# Find the global anchor per direction from idle animation (most stable)
print("=== Phase 1: Computing global anchors from idle ===")
idle_dir = os.path.join(BASE, 'animations', 'breathing-idle')
idle_avail = [d for d in os.listdir(idle_dir) if os.path.isdir(os.path.join(idle_dir, d))]

global_anchors = {}  # dir_name -> (cx, by)
for dname in DIRS_FULL:
    frames = get_frames(idle_dir, dname, idle_avail)
    if not frames:
        global_anchors[dname] = (SIZE//2, SIZE-4)
        continue
    # Use first frame of idle as the reference anchor
    bbox = get_bbox(frames[0])
    if bbox:
        x0, y0, x1, y1 = bbox
        cx = (x0 + x1) // 2
        by = y1
        global_anchors[dname] = (cx, by)
        print(f"  {dname}: anchor=({cx}, {by})")
    else:
        global_anchors[dname] = (SIZE//2, SIZE-4)

# STEP 2: Build all animations aligned to global anchors
print("\n=== Phase 2: Building stabilized atlas ===")
anim_data = []
for raw_folder, game_name in ANIMS:
    anim_dir = os.path.join(BASE, 'animations', raw_folder)
    if not os.path.isdir(anim_dir):
        print(f'SKIP {raw_folder}')
        continue
    avail = [d for d in os.listdir(anim_dir) if os.path.isdir(os.path.join(anim_dir, d))]
    rows = []
    n_frames = 0
    for di, dname in enumerate(DIRS_FULL):
        frames = get_frames(anim_dir, dname, avail)
        if frames is None:
            frames = [Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))]
        # Align all frames to the global anchor for this direction
        acx, aby = global_anchors[dname]
        frames = align_to_anchor(frames, acx, aby)
        n_frames = max(n_frames, len(frames))
        rows.append(frames)
    anim_data.append((game_name, rows, n_frames))
    print(f'{game_name}: {n_frames}f x 8dirs')

# STEP 3: Build atlas
max_cols = max(nf for _, _, nf in anim_data)
total_rows = len(anim_data) * 8
atlas_w = max_cols * SIZE
atlas_h = total_rows * SIZE
atlas = Image.new('RGBA', (atlas_w, atlas_h), (0,0,0,0))
frame_map = {}

y_off = 0
for game_name, rows, n_frames in anim_data:
    for di, (dcode, frames) in enumerate(zip(DIR_CODES, rows)):
        fr_list = []
        for fi in range(n_frames):
            ax, ay = fi * SIZE, y_off + di * SIZE
            if fi < len(frames):
                frame = frames[fi]
                if frame.size != (SIZE, SIZE):
                    frame = frame.resize((SIZE, SIZE), Image.NEAREST)
                atlas.paste(frame, (ax, ay))
            fr_list.append({'x': ax, 'y': ay, 'w': SIZE, 'h': SIZE})
        frame_map[f'{game_name}_{dcode}'] = fr_list
    frame_map[game_name] = frame_map[f'{game_name}_s']
    y_off += 8 * SIZE

# Aliases
aliases = {
    'attack': 'atk1',
    'dodge': 'run',
    'block': 'idle',
    'shield': 'bash',
    'whirlwind': 'atk2',
    'stun': 'hurt',
    'cast': 'crossbow',
    'ghost': 'run',
}
for alias, src in aliases.items():
    for dc in DIR_CODES:
        sk = f'{src}_{dc}'
        if sk in frame_map:
            frame_map[f'{alias}_{dc}'] = frame_map[sk]
    if src in frame_map:
        frame_map[alias] = frame_map[src]

atlas.save(os.path.join(OUT_DIR, 'atlas_player.png'))
with open(os.path.join(OUT_DIR, 'atlas_player.json'), 'w') as f:
    json.dump(frame_map, f)

print(f'\natlas_player.png: {atlas_w}x{atlas_h}')
print(f'atlas_player.json: {len(frame_map)} entries')
print('Done! All animations anchored to idle foot position.')
