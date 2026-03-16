"""
Combine PixelLab individual frame PNGs into spritesheets.
Each sheet = 8 rows (directions) x N cols (frames), 48x48 per cell.
Missing directions are mirrored from their counterpart.
"""
import os, glob
from PIL import Image

BASE = os.path.join(os.path.dirname(__file__), 'warrior_raw')
OUT = os.path.dirname(__file__)
SIZE = 48

# Animation name → output filename, frame count
ANIMS = {
    'breathing-idle':    ('warrior_idle.png',   4),
    'walking-8-frames':  ('warrior_walk.png',   8),
    'cross-punch':       ('warrior_attack.png', 6),
    'taking-punch':      ('warrior_hurt.png',   6),
    'falling-back-death':('warrior_death.png',  7),
}

# 8 directions in order (row index)
DIRS = ['south','south-west','west','north-west','north','north-east','east','south-east']

# Mirror map: missing dir → (source dir, flip_horizontal)
MIRROR = {
    'east':       ('west', True),
    'south-east': ('south-west', True),
    'north-east': ('north-west', True),
}

# Fallback chain for completely missing directions
FALLBACK = {
    'north': ['north-west','north-east','west','east','south'],
    'west':  ['south-west','north-west','south','north'],
    'south': ['south-west','south-east','west','east','north'],
}

def load_frames(anim_dir, direction, n_frames):
    """Load frames for a direction, return list of PIL Images."""
    d = os.path.join(anim_dir, direction)
    if not os.path.isdir(d):
        return None
    frames = []
    for i in range(n_frames):
        p = os.path.join(d, f'frame_{i:03d}.png')
        if os.path.exists(p):
            frames.append(Image.open(p).convert('RGBA'))
        else:
            # pad with empty
            frames.append(Image.new('RGBA', (SIZE, SIZE), (0,0,0,0)))
    return frames

def flip_frames(frames):
    """Horizontally flip all frames."""
    return [f.transpose(Image.FLIP_LEFT_RIGHT) for f in frames]

for anim_name, (out_name, n_frames) in ANIMS.items():
    anim_dir = os.path.join(BASE, 'animations', anim_name)
    if not os.path.isdir(anim_dir):
        print(f'SKIP {anim_name}: dir not found')
        continue

    # Available directions
    avail = set(os.listdir(anim_dir))

    # Build rows
    rows = []
    for di, dname in enumerate(DIRS):
        frames = load_frames(anim_dir, dname, n_frames)
        if frames is None:
            # Try mirror
            if dname in MIRROR:
                src, do_flip = MIRROR[dname]
                frames = load_frames(anim_dir, src, n_frames)
                if frames and do_flip:
                    frames = flip_frames(frames)
            # Try fallback
            if frames is None and dname in FALLBACK:
                for fb in FALLBACK[dname]:
                    frames = load_frames(anim_dir, fb, n_frames)
                    if frames:
                        # flip if it's a left-right counterpart
                        if (dname.endswith('east') and fb.endswith('west')) or \
                           (dname.endswith('west') and fb.endswith('east')):
                            frames = flip_frames(frames)
                        break
            # Last resort: use any available direction
            if frames is None:
                for a in avail:
                    frames = load_frames(anim_dir, a, n_frames)
                    if frames:
                        break
            if frames is None:
                frames = [Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))] * n_frames
        rows.append(frames)

    # Create spritesheet
    sheet = Image.new('RGBA', (SIZE * n_frames, SIZE * 8), (0,0,0,0))
    for ri, frames in enumerate(rows):
        for fi, frame in enumerate(frames):
            # Resize if needed
            if frame.size != (SIZE, SIZE):
                frame = frame.resize((SIZE, SIZE), Image.NEAREST)
            sheet.paste(frame, (fi * SIZE, ri * SIZE))

    out_path = os.path.join(OUT, out_name)
    sheet.save(out_path)
    print(f'OK {out_name}: {sheet.size[0]}x{sheet.size[1]} ({n_frames} frames x 8 dirs)')

# Also save rotation sheet (static poses, 8 dirs in a row)
rot_dir = os.path.join(BASE, 'rotations')
if os.path.isdir(rot_dir):
    rot_sheet = Image.new('RGBA', (SIZE * 8, SIZE), (0,0,0,0))
    for di, dname in enumerate(DIRS):
        p = os.path.join(rot_dir, f'{dname}.png')
        if os.path.exists(p):
            img = Image.open(p).convert('RGBA')
            if img.size != (SIZE, SIZE):
                img = img.resize((SIZE, SIZE), Image.NEAREST)
            rot_sheet.paste(img, (di * SIZE, 0))
    rot_sheet.save(os.path.join(OUT, 'warrior_rotations.png'))
    print(f'OK warrior_rotations.png: {rot_sheet.size[0]}x{rot_sheet.size[1]}')

print('Done!')
