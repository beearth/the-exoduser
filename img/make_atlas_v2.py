"""
Build atlas_player.png + atlas_player.json from Exoduser v2 raw frames.
12 animations, 8 directions each (mirror missing dirs).
"""
import os, json
from PIL import Image

BASE = os.path.join(os.path.dirname(__file__), 'warrior_v2_raw')
OUT_DIR = os.path.join(os.path.dirname(__file__), '..')
SIZE = 48

DIRS = ['south','south-west','west','north-west','north','north-east','east','south-east']
DIR_CODES = ['s','sw','w','nw','n','ne','e','se']

# (raw_folder, game_anim_name)
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

# Mirror: missing → (source, flip?)
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
    """Get frames for direction, with mirroring/fallback."""
    frames = load_frames(anim_dir, dname)
    if frames: return frames
    # Mirror
    if dname in MIRROR:
        src, do_flip = MIRROR[dname]
        frames = load_frames(anim_dir, src)
        if frames: return flip_h(frames) if do_flip else frames
    # Fallback
    if dname in FALLBACK:
        for fb in FALLBACK[dname]:
            frames = load_frames(anim_dir, fb)
            if frames:
                if (dname.endswith('east') and fb.endswith('west')) or \
                   (dname.endswith('west') and fb.endswith('east')):
                    return flip_h(frames)
                return frames
    # Any available
    for a in avail:
        frames = load_frames(anim_dir, a)
        if frames: return frames
    return None

# First pass: determine frame counts and collect all data
anim_data = []
for raw_folder, game_name in ANIMS:
    anim_dir = os.path.join(BASE, 'animations', raw_folder)
    if not os.path.isdir(anim_dir):
        print(f'SKIP {raw_folder}')
        continue
    avail = [d for d in os.listdir(anim_dir) if os.path.isdir(os.path.join(anim_dir, d))]
    rows = []
    n_frames = 0
    for di, dname in enumerate(DIRS):
        frames = get_frames(anim_dir, dname, avail)
        if frames is None:
            frames = [Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))]
        n_frames = max(n_frames, len(frames))
        rows.append(frames)
    anim_data.append((game_name, rows, n_frames))
    print(f'{game_name}: {n_frames}f x 8dirs (from {raw_folder})')

# Calculate atlas size
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
    # Default (non-directional) = south
    frame_map[game_name] = frame_map[f'{game_name}_s']
    y_off += 8 * SIZE

# Aliases for fallback animations
aliases = {
    'attack': 'atk1',       # generic attack fallback
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
