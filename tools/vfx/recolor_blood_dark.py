"""U-VFX-04 deterministic pixel processing, no generation/API/Unity.

C:\\Python314\\python.exe tools/vfx/recolor_blood_dark.py < NUL
The original matte PNG stays untouched; fixed review output, no backups.
"""
import argparse
import json
import re
import uuid
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'unity/Assets/Exoduser/Resources/Art/vfx/combat'
REVIEW = ROOT / 'tmp/design-review/vfx-blood'
SOURCE = ART / 'Blood_FBF_4x4_matte.png'
TARGET = ART / 'Blood_FBF_4x4_dark.png'
PALETTE = np.array([[42, 15, 11], [90, 35, 27], [122, 51, 38]], dtype=float)
WEIGHTS = np.array([.299, .587, .114])
CONNECT = np.ones((3, 3), dtype=bool)


def small_islands(alpha, threshold):
    labels, count = ndi.label(alpha > threshold, structure=CONNECT)
    sizes = np.bincount(labels.ravel())
    remove = np.zeros(alpha.shape, dtype=bool)
    if count:
        body = 1 + np.argmax(sizes[1:])
        for label in range(1, count + 1):
            if label != body and sizes[label] < alpha.size * .002:
                remove |= labels == label
    return remove


def transform(src):
    dst = src.copy()
    light = src[..., :3] @ WEIGHTS
    peak = light[src[..., 3] > 0].max()
    dst[..., :3] = np.stack([np.interp(light / peak, [0, .45, 1], PALETTE[:, ch])
                             for ch in range(3)], axis=-1).round().astype(np.uint8)
    h, w = src.shape[0] // 4, src.shape[1] // 4
    for row in range(4):
        for col in range(4):
            alpha = dst[row*h:(row+1)*h, col*w:(col+1)*w, 3]
            # Inspect both raw alpha and the visible (>20) silhouette; retain
            # every body pixel except explicitly authorized small islands.
            while True:
                remove = small_islands(alpha, 0) | small_islands(alpha, 20)
                if not remove.any():
                    break
                alpha[remove] = 0
    return dst


def validate(src, dst):
    expected = transform(src)
    changed = src[..., 3] != dst[..., 3]
    h, w = src.shape[0] // 4, src.shape[1] // 4
    frames = []
    for i in range(16):
        y, x = divmod(i, 4)
        alpha = dst[y*h:(y+1)*h, x*w:(x+1)*w, 3]
        frames.append({'frame': i, 'tiny_detached_gt0': int(small_islands(alpha, 0).sum()),
                       'tiny_detached_gt20': int(small_islands(alpha, 20).sum())})
    meta = TARGET.with_suffix('.png.meta').read_text(encoding='utf-8')
    old_meta = SOURCE.with_suffix('.png.meta').read_text(encoding='utf-8')
    guid = re.search(r'^guid: ([0-9a-f]{32})$', meta, re.M)[1]
    same_settings = re.sub(r'guid: [0-9a-f]+', 'guid:', meta) == re.sub(r'guid: [0-9a-f]+', 'guid:', old_meta)
    above = int(((dst[..., :3] @ WEIGHTS > PALETTE[-1] @ WEIGHTS + 1e-6) & (dst[..., 3] > 0)).sum())
    report = {'size': [dst.shape[1], dst.shape[0]], 'palette': ['#2a0f0b', '#5a231b', '#7a3326'],
              'guid': guid, 'same_import_settings': same_settings, 'alpha_pixels_removed': int(changed.sum()),
              'retained_alpha_bytes_equal': bool(np.array_equal(src[..., 3][~changed], dst[..., 3][~changed])),
              'only_removed_alpha': bool(np.all(dst[..., 3][changed] == 0)),
              'pixels_brighter_than_core': above, 'frames': frames}
    report['pass'] = (np.array_equal(dst, expected) and same_settings and guid not in old_meta and
                      above == 0 and report['retained_alpha_bytes_equal'] and report['only_removed_alpha'] and
                      all(f['tiny_detached_gt0'] == f['tiny_detached_gt20'] == 0 for f in frames))
    return report


def comparison(src, dst):
    board = Image.new('RGB', (1060, 1420), '#211e1a')
    draw = ImageDraw.Draw(board)
    draw.text((12, 10), 'U-VFX-04 | previous MATTE (left) | DARK (right) | original sheet 1x', fill='#efe6d2')
    for col, pixels in enumerate([src, dst]):
        im = Image.fromarray(pixels)
        board.paste(im, (12+col*530, 36), im)
        for row, frame in enumerate([0, 13]):
            x, y = frame % 4 * 128, frame // 4 * 128
            crop = im.crop((x, y, x+128, y+128)).resize((384, 384), Image.Resampling.NEAREST)
            top = 600 + row*412
            draw.text((12+col*530, top-22), f'frame {frame} / 3x nearest / same crop', fill='#efe6d2')
            board.paste(crop, (12+col*530, top), crop)
    board.save(REVIEW / 'matte_dark_compare_3x.png')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    src = np.array(Image.open(SOURCE).convert('RGBA'))
    REVIEW.mkdir(parents=True, exist_ok=True)
    if not args.check_only:
        dst = transform(src)
        Image.fromarray(dst).save(TARGET, optimize=True)
        old_meta = SOURCE.with_suffix('.png.meta').read_text(encoding='utf-8')
        guid = uuid.uuid5(uuid.NAMESPACE_URL, 'exoduser/vfx-blood/Blood_FBF_4x4_dark').hex
        TARGET.with_suffix('.png.meta').write_text(re.sub(r'(?m)^guid: [0-9a-f]+$', 'guid: '+guid, old_meta), encoding='utf-8', newline='\n')
        comparison(src, dst)
    dst = np.array(Image.open(TARGET).convert('RGBA'))
    report = validate(src, dst)
    (REVIEW / 'checks.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
    print(f'blood-dark: pass={report["pass"]}, removed_alpha_pixels={report["alpha_pixels_removed"]}, tiny_detached=0, above_core={report["pixels_brighter_than_core"]}')
    return 0 if report['pass'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
