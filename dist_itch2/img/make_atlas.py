"""
Combine 5 warrior spritesheets into a single atlas_player.png + atlas_player.json
for the SpriteAnimator system.

Spritesheet layout: each sheet has 8 rows (directions) x N cols (frames), 48x48 per cell
Row order: south(0), south-west(1), west(2), north-west(3), north(4), north-east(5), east(6), south-east(7)
Game dir codes: s, sw, w, nw, n, ne, e, se
"""
import os, json
from PIL import Image

IMG_DIR = os.path.dirname(__file__)
OUT_DIR = os.path.join(IMG_DIR, '..')  # project root
SIZE = 48

# Direction names matching row index
DIRS = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se']

# Animation definitions: (filename, game_anim_name, frame_count)
ANIMS = [
    ('warrior_idle.png',   'idle',   4),
    ('warrior_walk.png',   'run',    8),
    ('warrior_attack.png', 'attack', 6),
    ('warrior_hurt.png',   'hurt',   6),
    ('warrior_death.png',  'die',    7),
]

# Load all sheets
sheets = []
for fname, anim_name, n_frames in ANIMS:
    path = os.path.join(IMG_DIR, fname)
    img = Image.open(path).convert('RGBA')
    sheets.append((img, anim_name, n_frames))

# Calculate atlas dimensions
# Stack animations vertically, each has 8 rows
total_rows = sum(8 for _ in ANIMS)
max_cols = max(n for _, _, n in ANIMS)
atlas_w = max_cols * SIZE
atlas_h = total_rows * SIZE

atlas = Image.new('RGBA', (atlas_w, atlas_h), (0, 0, 0, 0))
frame_map = {}

y_offset = 0
for sheet_img, anim_name, n_frames in sheets:
    for dir_idx, dir_name in enumerate(DIRS):
        frames = []
        for fi in range(n_frames):
            sx = fi * SIZE
            sy = dir_idx * SIZE
            # Paste frame into atlas
            frame = sheet_img.crop((sx, sy, sx + SIZE, sy + SIZE))
            ax = fi * SIZE
            ay = y_offset + dir_idx * SIZE
            atlas.paste(frame, (ax, ay))
            frames.append({'x': ax, 'y': ay, 'w': SIZE, 'h': SIZE})

        # Register as anim_dir (e.g., idle_s, run_nw)
        key = f'{anim_name}_{dir_name}'
        frame_map[key] = frames

    # Also register non-directional version using 'south' as default
    frame_map[anim_name] = frame_map[f'{anim_name}_s']

    y_offset += 8 * SIZE

# Add aliases for missing animations (fallback to closest)
aliases = {
    'dodge': 'run',
    'block': 'idle',
    'shield': 'attack',
    'whirlwind': 'attack',
    'stun': 'hurt',
    'cast': 'attack',
    'ghost': 'run',
}
for alias, src in aliases.items():
    for dir_name in DIRS:
        src_key = f'{src}_{dir_name}'
        if src_key in frame_map:
            frame_map[f'{alias}_{dir_name}'] = frame_map[src_key]
    if src in frame_map:
        frame_map[alias] = frame_map[src]

# Save atlas
atlas_path = os.path.join(OUT_DIR, 'atlas_player.png')
atlas.save(atlas_path)
print(f'atlas_player.png: {atlas_w}x{atlas_h}')

# Save JSON
json_path = os.path.join(OUT_DIR, 'atlas_player.json')
with open(json_path, 'w') as f:
    json.dump(frame_map, f)
print(f'atlas_player.json: {len(frame_map)} entries')
print('Done!')
