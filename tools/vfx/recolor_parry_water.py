"""RETOUCH 4: water-bean shield/Q parry sheets in the VFX master water ramp (no generation/API/Unity).

C:\\Python314\\python.exe -B tools/vfx/recolor_parry_water.py < NUL
C:\\Python314\\python.exe -B tools/vfx/recolor_parry_water.py --check-only < NUL

The ice sheets copied from the web read as bright cartoon cyan with scattered droplet specks. The water row of
VFX_LEAD_MASTER §2.2 (#0f1c26 -> #3a6a88 -> #8db4c8 -> #dcebf0, hue 198~212, core only in frames 0~1, gamma 1.6)
is the palette for waterImpact (blue-bean hit and parry). Originals stay untouched; output is two new PNG/meta pairs.
"""
import argparse
import colorsys
import json
import re
import uuid
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'unity/Assets/Exoduser/Resources/Art/vfx/combat'
REVIEW = ROOT / 'tmp/design-review/vfx-retouch4'
SHEETS = {'Ice_ImpactIce_Sheet': 'Ice_ImpactIce_Sheet_water', 'Ice_MistSmoke_FBF_4x4': 'Ice_MistSmoke_FBF_4x4_water'}
RAMP = np.array([[15, 28, 38], [58, 106, 136], [141, 180, 200], [220, 235, 240]], dtype=float)
STOPS = [0, .45, .85, 1]
MID_CAP = .85            # frames 2..15 (and all smoke) stop at #8db4c8
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


def transform(src, core_frames):
    dst = src.copy()
    light = src[..., :3] @ WEIGHTS
    peak = light[src[..., 3] > 0].max()
    t = (light / peak) ** 1.6
    h, w = src.shape[0] // 4, src.shape[1] // 4
    cap = np.full(t.shape, MID_CAP)
    for frame in core_frames:
        y, x = divmod(frame, 4)
        cap[y*h:(y+1)*h, x*w:(x+1)*w] = 1
    t = np.minimum(t, cap)
    dst[..., :3] = np.stack([np.interp(t, STOPS, RAMP[:, ch]) for ch in range(3)], axis=-1).round().astype(np.uint8)
    for row in range(4):
        for col in range(4):
            alpha = dst[row*h:(row+1)*h, col*w:(col+1)*w, 3]
            while True:
                remove = small_islands(alpha, 0) | small_islands(alpha, 20)
                if not remove.any():
                    break
                alpha[remove] = 0
    return dst


def hue_report(dst):
    px = dst[dst[..., 3] > 12][:, :3].astype(float) / 255
    hsv = np.array([colorsys.rgb_to_hsv(*p) for p in px[::max(1, len(px) // 20000)]])
    sat = hsv[hsv[:, 1] > .2]
    hues = sat[:, 0] * 360
    return {'hue_min': round(float(hues.min()), 2) if len(hues) else None,
            'hue_max': round(float(hues.max()), 2) if len(hues) else None,
            'max_saturation': round(float(hsv[:, 1].max()), 3), 'max_rgb': [int(v) for v in dst[..., :3][dst[..., 3] > 0].max(0)]}


def validate(name, src, dst, core_frames):
    target = ART / (SHEETS[name] + '.png')
    expected = transform(src, core_frames)
    changed = src[..., 3] != dst[..., 3]
    h, w = src.shape[0] // 4, src.shape[1] // 4
    specks = 0
    for i in range(16):
        y, x = divmod(i, 4)
        alpha = dst[y*h:(y+1)*h, x*w:(x+1)*w, 3]
        specks += int(small_islands(alpha, 0).sum() + small_islands(alpha, 20).sum())
    raw = target.with_suffix('.png.meta').read_bytes()
    old = (ART / (name + '.png.meta')).read_bytes()
    guid = re.search(rb'guid: ([0-9a-f]{32})', raw)[1].decode()
    same_settings = re.sub(rb'guid: [0-9a-f]+', b'guid:', raw) == re.sub(rb'guid: [0-9a-f]+', b'guid:', old)
    hues = hue_report(dst)
    core = RAMP[-1]
    late = np.ones(dst.shape[:2], dtype=bool)
    for frame in core_frames:
        y, x = divmod(frame, 4)
        late[y*h:(y+1)*h, x*w:(x+1)*w] = False
    over_mid = int(((dst[..., :3].astype(float) @ WEIGHTS > RAMP[2] @ WEIGHTS + .5) & (dst[..., 3] > 0) & late).sum())
    report = {'sheet': SHEETS[name], 'guid': guid, 'same_import_settings': same_settings,
              'alpha_pixels_removed': int(changed.sum()), 'only_removed_alpha': bool(np.all(dst[..., 3][changed] == 0)),
              'retained_alpha_equal': bool(np.array_equal(src[..., 3][~changed], dst[..., 3][~changed])),
              'specks_left': specks, 'late_frames_above_mid': over_mid, **hues}
    report['pass'] = bool(np.array_equal(dst, expected) and same_settings and guid.encode() not in old and specks == 0
                          and report['only_removed_alpha'] and report['retained_alpha_equal'] and over_mid == 0
                          and hues['hue_min'] is not None and 195 <= hues['hue_min'] and hues['hue_max'] <= 212
                          and all(v <= c for v, c in zip(hues['max_rgb'], core)))
    return report


def comparison(pairs):
    board = Image.new('RGB', (1084, 36 + 540 * len(pairs)), '#262a22')
    draw = ImageDraw.Draw(board)
    draw.text((12, 10), 'RETOUCH 4 water parry | original (left) | water ramp (right) | 1x over swamp ground', fill='#efe6d2')
    for i, (src, dst) in enumerate(pairs):
        for col, px in enumerate([src, dst]):
            im = Image.fromarray(px)
            board.paste(im, (12 + col * 540, 36 + i * 540), im)
    board.save(REVIEW / 'water_parry_compare.png')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    REVIEW.mkdir(parents=True, exist_ok=True)
    reports, pairs = [], []
    for name, out in SHEETS.items():
        core_frames = (0, 1) if name == 'Ice_ImpactIce_Sheet' else ()
        src = np.array(Image.open(ART / (name + '.png')).convert('RGBA'))
        target = ART / (out + '.png')
        if not args.check_only:
            Image.fromarray(transform(src, core_frames)).save(target, optimize=True)
            raw = (ART / (name + '.png.meta')).read_bytes()
            guid = uuid.uuid5(uuid.NAMESPACE_URL, 'exoduser/vfx-retouch4/' + out).hex
            target.with_suffix('.png.meta').write_bytes(re.sub(rb'guid: [0-9a-f]{32}', b'guid: ' + guid.encode(), raw, count=1))
        dst = np.array(Image.open(target).convert('RGBA'))
        reports.append(validate(name, src, dst, core_frames))
        pairs.append((src, dst))
    if not args.check_only:
        comparison(pairs)
    (REVIEW / 'checks.json').write_text(json.dumps(reports, indent=2) + '\n', encoding='utf-8')
    ok = all(r['pass'] for r in reports)
    print('parry-water: ' + ', '.join(f"{r['sheet']} pass={r['pass']} hue={r['hue_min']}~{r['hue_max']} specks={r['specks_left']} removed={r['alpha_pixels_removed']}" for r in reports))
    return 0 if ok else 1


if __name__ == '__main__':
    raise SystemExit(main())
