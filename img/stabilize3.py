"""
Stabilize v3: Use rotation images for missing directions.
Only mirror east←west. For truly missing dirs (north etc),
use the rotation static image as single-frame fallback so direction is correct.
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

# Only mirror left↔right, NOT north↔south
MIRROR = {
    'east':       ('west', True),
    'south-east': ('south-west', True),
    'north-east': ('north-west', True),
}

def load_frames(anim_dir, direction):
    d = os.path.join(anim_dir, direction)
    if not os.path.isdir(d):
        return None
    files = sorted([f for f in os.listdir(d) if f.endswith('.png')])
    if not files: return None
    return [Image.open(os.path.join(d, f)).convert('RGBA') for f in files]

def flip_h(frames):
    return [f.transpose(Image.FLIP_LEFT_RIGHT) for f in frames]

def load_rotation(dname):
    """Load rotation static image for a direction."""
    p = os.path.join(BASE, 'rotations', f'{dname}.png')
    if os.path.exists(p):
        return Image.open(p).convert('RGBA')
    return None

def get_frames_strict(anim_dir, dname):
    """Get frames: real data or mirror only. No wrong-direction fallback."""
    # Direct
    frames = load_frames(anim_dir, dname)
    if frames: return frames, True
    # Mirror (left↔right only)
    if dname in MIRROR:
        src, do_flip = MIRROR[dname]
        frames = load_frames(anim_dir, src)
        if frames: return (flip_h(frames) if do_flip else frames), True
    return None, False

def get_bbox(img):
    arr = np.array(img)
    alpha = arr[:,:,3]
    ys, xs = np.where(alpha > 10)
    if len(xs) == 0: return None
    return int(np.min(xs)), int(np.min(ys)), int(np.max(xs)), int(np.max(ys))

def align_to_anchor(frames, acx, aby):
    result = []
    for f in frames:
        bbox = get_bbox(f)
        if bbox is None:
            result.append(f)
            continue
        x0, y0, x1, y1 = bbox
        cx = (x0 + x1) // 2
        by = y1
        dx = acx - cx
        dy = aby - by
        if dx == 0 and dy == 0:
            result.append(f)
            continue
        new_f = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
        new_f.paste(f, (max(-SIZE, min(SIZE, dx)), max(-SIZE, min(SIZE, dy))))
        result.append(new_f)
    return result

# Phase 1: Global anchors from rotations (all 8 dirs available)
print("=== Phase 1: Global anchors from rotations ===")
global_anchors = {}
rot_imgs = {}
for dname in DIRS_FULL:
    img = load_rotation(dname)
    if img:
        rot_imgs[dname] = img
        bbox = get_bbox(img)
        if bbox:
            x0, y0, x1, y1 = bbox
            cx = (x0 + x1) // 2
            by = y1
            global_anchors[dname] = (cx, by)
            print(f"  {dname}: anchor=({cx},{by})")
        else:
            global_anchors[dname] = (SIZE//2, SIZE-4)
    else:
        global_anchors[dname] = (SIZE//2, SIZE-4)

# Phase 2: Build animations
print("\n=== Phase 2: Building atlas ===")
anim_data = []
for raw_folder, game_name in ANIMS:
    anim_dir = os.path.join(BASE, 'animations', raw_folder)
    if not os.path.isdir(anim_dir):
        print(f'SKIP {raw_folder}')
        continue
    rows = []
    n_frames = 0
    missing = []
    for di, dname in enumerate(DIRS_FULL):
        frames, real = get_frames_strict(anim_dir, dname)
        if frames is None:
            # Use rotation image as static fallback (correct direction!)
            rot = rot_imgs.get(dname)
            if rot:
                # For walk: create fake walk bob from rotation
                if game_name == 'run':
                    bframes = []
                    for fi in range(8):
                        bob = int(round(np.sin(fi * np.pi / 4) * 1.5))
                        nf = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
                        nf.paste(rot, (0, bob))
                        bframes.append(nf)
                    frames = bframes
                else:
                    frames = [rot.copy()]
                missing.append(dname)
            else:
                frames = [Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))]
                missing.append(dname+'(EMPTY)')

        acx, aby = global_anchors[dname]
        frames = align_to_anchor(frames, acx, aby)
        n_frames = max(n_frames, len(frames))
        rows.append(frames)

    anim_data.append((game_name, rows, n_frames))
    if missing:
        print(f'{game_name}: {n_frames}f x 8dirs (rotation fallback: {",".join(missing)})')
    else:
        print(f'{game_name}: {n_frames}f x 8dirs (all real)')

# Phase 3: Build atlas image + JSON
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
            # For shorter animations, repeat last frame
            elif len(frames) > 0:
                lf = frames[-1]
                if lf.size != (SIZE, SIZE):
                    lf = lf.resize((SIZE, SIZE), Image.NEAREST)
                atlas.paste(lf, (ax, ay))
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
print('Done!')
