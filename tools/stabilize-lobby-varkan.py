"""Build readable, smooth breathing from the accepted keyed Grok sprite.

Run from the project root with Python, Pillow and numpy. Source and rejected
full-body motion remain in v1. v3 uses a coherent breathing rig, never generated
frame-to-frame shape variation. Feet and the independent background stay fixed.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import json
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'assets/lobby'
WIDTH, HEIGHT, COUNT, FPS = 384, 624, 96, 24
base = Image.open(ART / 'varkan_idle_v1.png').convert('RGBA').crop((0, 0, WIDTH, HEIGHT))
rgba = np.asarray(base).astype(np.float32) / 255
alpha = rgba[:, :, 3:4]
premultiplied = rgba[:, :, :3] * alpha
y, x = np.mgrid[:HEIGHT, :WIDTH]
red = (rgba[:, :, 0] > rgba[:, :, 1] * 2.0) & (rgba[:, :, 0] > rgba[:, :, 2] * 1.8) & (rgba[:, :, 0] > .095)
red &= (y >= 260) & (y < 553) & (alpha[:, :, 0] > .05)
cloth = np.asarray(Image.fromarray((red * 255).astype('uint8')).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1))).astype(np.float32) / 255
cloth[(y < 260) | (y >= 553)] = 0
envelope = np.sin(np.clip((y - 260) / 293, 0, 1) * np.pi)
heart = (rgba[:, :, 2] > np.maximum(rgba[:, :, 0], rgba[:, :, 1]) + .10) & (y >= 151) & (y < 230) & (x >= 130) & (x < 215)
heart = np.asarray(Image.fromarray((heart * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1))).astype(np.float32) / 255
heart[(y < 151) | (y >= 230)] = 0

def smoothstep(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)

upper = 1 - smoothstep((y - 245) / 175)
chest = np.exp(-((x - 182.43863179074447) / 48)**4 - ((y - 196) / 53)**4)
relics = smoothstep((y - 191) / 89) * (1 - smoothstep((y - 268) / 14))
relics *= smoothstep((x - 249) / 9) * (1 - smoothstep((x - 311) / 9))

def sample(a, sx, sy):
    left, top = np.floor(sx).astype(int), np.floor(sy).astype(int)
    tx, ty = sx - left, sy - top
    if a.ndim == 3:
        tx, ty = tx[:, :, None], ty[:, :, None]
    x0, x1 = np.clip(left, 0, WIDTH-1), np.clip(left+1, 0, WIDTH-1)
    y0, y1 = np.clip(top, 0, HEIGHT-1), np.clip(top+1, 0, HEIGHT-1)
    return (a[y0, x0]*(1-tx)+a[y0, x1]*tx)*(1-ty)+(a[y1, x0]*(1-tx)+a[y1, x1]*tx)*ty

cells = []
for index in range(COUNT):
    phase = 2 * np.pi * index / COUNT
    breath = (1 - np.cos(phase)) / 2
    # Sword, mask and shoulders travel together by one smooth translation.
    # Pelvis motion tapers to zero; the complete feet remain anchored.
    source_y = y + 4.0 * breath * upper
    source_x = x - (x - 182.43863179074447) * .035 * breath * chest - 3.0 * np.sin(phase+.35) * relics
    posed_alpha = sample(alpha, source_x, source_y)
    posed_color = sample(premultiplied, source_x, source_y)
    posed_cloth = sample(cloth, source_x, source_y)
    displacement = 6.0 * np.sin(phase) * envelope
    cloth_x = x - displacement
    mask = np.maximum(posed_cloth, sample(posed_cloth, cloth_x, y))[:, :, None]
    moved_alpha = posed_alpha * (1 - mask) + sample(posed_alpha, cloth_x, y) * mask
    moved_color = posed_color * (1 - mask) + sample(posed_color, cloth_x, y) * mask
    rgb = np.divide(moved_color, moved_alpha, out=np.zeros_like(moved_color), where=moved_alpha > 0)
    posed_heart = sample(heart, source_x, source_y)
    rgb *= 1 + .10 * (2 * breath - 1) * posed_heart[:, :, None]
    output = np.concatenate([np.clip(rgb, 0, 1), moved_alpha], axis=2)
    cell = Image.fromarray(np.round(output * 255).astype('uint8'))
    cells.append(cell)

# Feet must be pixel-identical; upper motion must remain visible and loop smoothly.
for box in [(0, 562, WIDTH, HEIGHT)]:
    anchor = np.asarray(cells[0].crop(box))
    assert all(np.array_equal(anchor, np.asarray(cell.crop(box))) for cell in cells)
assert not np.array_equal(np.asarray(cells[0]), np.asarray(cells[12]))
tops = [cell.getbbox()[1] for cell in cells]
assert max(tops) - min(tops) >= 3
changes = [float(np.abs(np.asarray(cells[i], dtype=float)-np.asarray(cells[(i+1)%COUNT], dtype=float)).mean()) for i in range(COUNT)]
assert changes[-1] <= max(changes[:-1]) * 1.05
sheet = Image.new('RGBA', (WIDTH * 8, HEIGHT * 12))
for index, cell in enumerate(cells):
    sheet.alpha_composite(cell, ((index % 8) * WIDTH, (index // 8) * HEIGHT))
sheet.save(ART / 'varkan_idle_v3.png', optimize=True)
cells[0].save(ART / 'varkan_idle_first_v3.png', optimize=True)
preview = []
for cell in cells:
    canvas = Image.new('RGBA', (WIDTH, HEIGHT), '#151923')
    canvas.alpha_composite(cell)
    preview.append(canvas.convert('RGB'))
preview[0].save(ART / 'varkan_idle_preview_v3.gif', save_all=True, append_images=preview[1:], duration=42, loop=0, optimize=False)
contact = Image.new('RGB', (WIDTH * 4, HEIGHT * 3), '#151923')
for k, index in enumerate(range(0, COUNT, 8)):
    contact.paste(preview[index], ((k % 4) * WIDTH, (k // 4) * HEIGHT))
contact.resize((1152, 1404), Image.Resampling.LANCZOS).save(ART / 'varkan_idle_contact_v3.jpg', quality=90)
metadata = json.loads((ART / 'varkan_idle_v1.json').read_text(encoding='utf-8'))
metadata.update(frame_count=COUNT, rows=12, fps=FPS, sequence=list(range(COUNT)), duration_seconds=COUNT/FPS,
                alpha_zero_ratio=float(np.mean(np.asarray(sheet)[:, :, 3] == 0)), frame_bboxes=[cell.getbbox() for cell in cells],
                source_selection='v1 frame0 keyed Grok anchor; full-body generated motion rejected due to temporal shape jitter',
                motion={'upper_breath_rise_px':4.0, 'upper_rigid_until_y':245, 'upper_fade_end_y':420, 'chest_expansion':0.035, 'relic_horizontal_amplitude_px':3.0, 'cloth_horizontal_amplitude_px':6.0, 'cloth_y_range':[260,553], 'heart_brightness_amplitude':0.10, 'boots_fixed':True, 'head_sword_shoulders_coherent':True},
                verification={'alpha_top_range_px':max(tops)-min(tops), 'loop_seam_mean_rgba_delta':changes[-1], 'largest_neighbor_mean_rgba_delta':max(changes)},
                postprocess='tools/stabilize-lobby-varkan.py', runtime_qa='captures/ancestor_grok_review/idle-v3/runtime-report.json', visual_verdict='RIGGED_MOTION_VERIFIED; RUNTIME_PENDING')
(ART / 'varkan_idle_v3.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'atlas':sheet.size,'frames':COUNT,'fps':FPS,'duration':COUNT/FPS,'feet_pixels':'PASS','upper_motion_px':max(tops)-min(tops),'alpha_zero_ratio':metadata['alpha_zero_ratio']}))
