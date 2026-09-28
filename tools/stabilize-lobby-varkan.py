"""Build a quiet idle from the accepted keyed Grok sprite, preserving rigid anatomy.

Run from the project root with Python, Pillow and numpy. Source and rejected
full-body motion remain in v1; only cloth and heart light move in the v2 atlas.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import json
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'assets/lobby'
WIDTH, HEIGHT, COUNT, FPS = 384, 624, 48, 12
base = Image.open(ART / 'varkan_idle_v1.png').convert('RGBA').crop((0, 0, WIDTH, HEIGHT))
rgba = np.asarray(base).astype(np.float32) / 255
alpha = rgba[:, :, 3:4]
premultiplied = rgba[:, :, :3] * alpha
y, x = np.mgrid[:HEIGHT, :WIDTH]
red = (rgba[:, :, 0] > rgba[:, :, 1] * 1.25) & (rgba[:, :, 0] > rgba[:, :, 2] * 1.15) & (rgba[:, :, 0] > .095)
red &= (y >= 260) & (y < 553) & (alpha[:, :, 0] > .05)
cloth = np.asarray(Image.fromarray((red * 255).astype('uint8')).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1))).astype(np.float32) / 255
cloth[(y < 260) | (y >= 553)] = 0
envelope = np.sin(np.clip((y - 260) / 293, 0, 1) * np.pi)
heart = (rgba[:, :, 2] > np.maximum(rgba[:, :, 0], rgba[:, :, 1]) + .10) & (y >= 151) & (y < 230) & (x >= 130) & (x < 215)
heart = np.asarray(Image.fromarray((heart * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1))).astype(np.float32) / 255
heart[(y < 151) | (y >= 230)] = 0

def sample(a, position):
    left = np.floor(position).astype(int)
    mix = (position - left)[:, :, None] if a.ndim == 3 else position - left
    return a[y, np.clip(left, 0, WIDTH - 1)] * (1 - mix) + a[y, np.clip(left + 1, 0, WIDTH - 1)] * mix

cells = []
for index in range(COUNT):
    phase = 2 * np.pi * index / COUNT
    displacement = 1.2 * np.sin(phase) * envelope
    sample_x = x - displacement
    mask = np.maximum(cloth, sample(cloth, sample_x))[:, :, None]
    moved_alpha = alpha * (1 - mask) + sample(alpha, sample_x) * mask
    moved_color = premultiplied * (1 - mask) + sample(premultiplied, sample_x) * mask
    rgb = np.divide(moved_color, moved_alpha, out=np.zeros_like(moved_color), where=moved_alpha > 0)
    rgb *= 1 + .04 * np.sin(phase) * heart[:, :, None]
    output = np.concatenate([np.clip(rgb, 0, 1), moved_alpha], axis=2)
    cell = Image.fromarray(np.round(output * 255).astype('uint8'))
    cells.append(cell)

# These regions must be pixel-identical, not merely aligned by a bounding box.
for box in [(0, 0, WIDTH, 151), (0, 230, WIDTH, 260), (0, 562, WIDTH, HEIGHT)]:
    anchor = np.asarray(cells[0].crop(box))
    assert all(np.array_equal(anchor, np.asarray(cell.crop(box))) for cell in cells)
assert not np.array_equal(np.asarray(cells[0]), np.asarray(cells[12]))
sheet = Image.new('RGBA', (WIDTH * 8, HEIGHT * 6))
for index, cell in enumerate(cells):
    sheet.alpha_composite(cell, ((index % 8) * WIDTH, (index // 8) * HEIGHT))
sheet.save(ART / 'varkan_idle_v2.png', optimize=True)
cells[0].save(ART / 'varkan_idle_first_v2.png', optimize=True)
preview = []
for cell in cells:
    canvas = Image.new('RGBA', (WIDTH, HEIGHT), '#151923')
    canvas.alpha_composite(cell)
    preview.append(canvas.convert('RGB'))
preview[0].save(ART / 'varkan_idle_preview_v2.gif', save_all=True, append_images=preview[1:], duration=83, loop=0, optimize=False)
contact = Image.new('RGB', (WIDTH * 4, HEIGHT * 3), '#151923')
for k, index in enumerate(range(0, COUNT, 4)):
    contact.paste(preview[index], ((k % 4) * WIDTH, (k // 4) * HEIGHT))
contact.resize((1152, 1404), Image.Resampling.LANCZOS).save(ART / 'varkan_idle_contact_v2.jpg', quality=90)
metadata = json.loads((ART / 'varkan_idle_v1.json').read_text(encoding='utf-8'))
metadata.update(frame_count=COUNT, rows=6, fps=FPS, sequence=list(range(COUNT)), duration_seconds=COUNT/FPS,
                alpha_zero_ratio=float(np.mean(np.asarray(sheet)[:, :, 3] == 0)), frame_bboxes=[cell.getbbox() for cell in cells],
                source_selection='v1 frame0 keyed Grok anchor; full-body generated motion rejected due to temporal shape jitter',
                motion={'cloth_horizontal_amplitude_px':1.2, 'cloth_y_range':[260,553], 'heart_brightness_amplitude':0.04, 'rigid_head_sword_body_boots':True},
                postprocess='tools/stabilize-lobby-varkan.py', visual_verdict='STABILIZED_ASSET_VERIFIED; RUNTIME_PENDING')
(ART / 'varkan_idle_v2.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'atlas':sheet.size,'frames':COUNT,'fps':FPS,'duration':COUNT/FPS,'rigid_pixels':'PASS','alpha_zero_ratio':metadata['alpha_zero_ratio']}))
