"""U-VFX-14: bring the Blender-made angler (kraken) water-orb sheets into the Unity field art folder (no generation / API / Unity).

C:\\Python314\\python.exe -B tools/vfx/import_angler_water.py < NUL
C:\\Python314\\python.exe -B tools/vfx/import_angler_water.py --check-only < NUL

Source (outside the repo): I:/EXODUSER-Storage/vfx-angler-water/{water_orb_loop,water_hit_crown,water_parry_split}.png.
  water_orb_loop    6x4, 24 frames, 256 px cells. Body contrast x0.7 inside the rim (bright rim and the one specular highlight are kept).
  water_hit_crown   4x4 source, frames 0 and 1 (the star-shaped discs) are dropped; frames 2..15 are repacked into cells 0..13 (14 frames).
  water_parry_split same: 14 frames, source frames 0 and 1 dropped.
  water_muzzle      FAIL by the impact lead: not imported (the launch spray is drawn in code).
Output: unity/Assets/Exoduser/Resources/Art/vfx/field/<name>.png + .meta (import settings copied from proj_elem_orb_v3.png.meta, new GUID).
--check-only needs no source: it checks size, frame occupancy, the dropped-frame rule, the SHA-256 and the content boxes the C# constants rely on.
"""
import argparse
import hashlib
import re
import sys
import uuid
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2]
SRC = Path('I:/EXODUSER-Storage/vfx-angler-water')
OUT = ROOT / 'unity/Assets/Exoduser/Resources/Art/vfx/field'
SETTINGS_FROM = OUT / 'proj_elem_orb_v3.png.meta'
CELL = 256
WEIGHTS = np.array([.299, .587, .114])
BODY_CONTRAST = .7          # brief: orb body contrast x0.7
RIM_PX = 6                  # the outer 6 px (the bright 1 px rim and its fade) are not touched
DROP = (0, 1)               # crown / split: star-shaped discs, the contact flash belongs to the game core layer

SHEETS = {
    'water_orb_loop': {'cols': 6, 'rows': 4, 'frames': 24, 'drop': ()},
    'water_hit_crown': {'cols': 4, 'rows': 4, 'frames': 14, 'drop': DROP},
    'water_parry_split': {'cols': 4, 'rows': 4, 'frames': 14, 'drop': DROP},
}
# Union alpha (>12) box of the used frames inside a 256 px cell: x0, x1, y0, y1. The C# draw sizes are derived from these.
CONTENT_BOX = {'water_orb_loop': (13, 195, 60, 195), 'water_hit_crown': (47, 208, 25, 229), 'water_parry_split': (48, 207, 25, 229)}
EXPECTED_SHA256 = {
    'water_orb_loop': '22b5e720f07f42795c0d40ec4ff79ccea74125708d804522e9f8626d08be6d0f',
    'water_hit_crown': '2313a2336db01745a9bf7ba1e3a2f80e9bb3476ab572999ce3af72c53ce7eff6',
    'water_parry_split': '822fc21627c3ab97329d0e088bbdfeeafbc736fbbf631240d9007071460577ad',
}


def cells(arr, cols, rows):
    return [arr[r * CELL:(r + 1) * CELL, c * CELL:(c + 1) * CELL] for r in range(rows) for c in range(cols)]


def smooth(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def soften_orb_body(cell):
    """Contrast x0.7 of the body inside the rim; alpha is never touched."""
    rgb = cell[..., :3].astype(float)
    alpha = cell[..., 3]
    solid = alpha > 128
    dist = ndi.distance_transform_edt(solid)
    inner = np.clip((dist - RIM_PX) / RIM_PX, 0, 1)                      # 0 on the rim, 1 deep inside
    lum = rgb @ WEIGHTS
    keep_spec = 1 - smooth(lum, 150, 200)                                # the specular highlight stays
    w = (inner * keep_spec)[..., None]
    sel = (inner * keep_spec) > .5
    mean = rgb[sel].mean(axis=0) if sel.any() else rgb[solid].mean(axis=0)
    out = rgb + (mean - rgb) * (1 - BODY_CONTRAST) * w
    res = cell.copy()
    res[..., :3] = np.clip(np.rint(out), 0, 255).astype(np.uint8)
    return res


def build(name, src):
    spec = SHEETS[name]
    parts = cells(src, spec['cols'], spec['rows'])
    if name == 'water_orb_loop':
        parts = [soften_orb_body(p) for p in parts]
        used = parts
    else:
        used = [p for i, p in enumerate(parts) if i not in spec['drop']]
    sheet = np.zeros((spec['rows'] * CELL, spec['cols'] * CELL, 4), dtype=np.uint8)
    for i, p in enumerate(used):
        r, c = divmod(i, spec['cols'])
        sheet[r * CELL:(r + 1) * CELL, c * CELL:(c + 1) * CELL] = p
    return sheet


def occupancy(sheet, cols, rows):
    return [int((c[..., 3] > 12).sum()) for c in cells(sheet, cols, rows)]


def content_box(sheet, spec):
    box = [1e9, -1, 1e9, -1]
    for c in cells(sheet, spec['cols'], spec['rows'])[:spec['frames']]:
        ys, xs = np.where(c[..., 3] > 12)
        if len(xs):
            box = [min(box[0], xs.min()), max(box[1], xs.max()), min(box[2], ys.min()), max(box[3], ys.max())]
    return tuple(int(v) for v in box)


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write_meta(name):
    raw = SETTINGS_FROM.read_bytes()
    guid = uuid.uuid5(uuid.NAMESPACE_URL, 'exoduser/vfx-angler-water/' + name).hex
    (OUT / (name + '.png.meta')).write_bytes(re.sub(rb'guid: [0-9a-f]{32}', b'guid: ' + guid.encode(), raw, count=1))


def validate(name, source_available):
    spec = SHEETS[name]
    target = OUT / (name + '.png')
    errors = []
    if not target.exists():
        return ['missing ' + str(target)]
    img = Image.open(target)
    arr = np.array(img.convert('RGBA'))
    if img.size != (spec['cols'] * CELL, spec['rows'] * CELL):
        errors.append('size %s' % (img.size,))
    occ = occupancy(arr, spec['cols'], spec['rows'])
    filled = sum(1 for v in occ if v > 0)
    if name == 'water_orb_loop':
        if filled != 24 or min(occ) < 10000:
            errors.append('orb frames %d min %d' % (filled, min(occ)))
    else:
        if any(v == 0 for v in occ[:spec['frames'] - 1]):
            errors.append('empty frame before the last used cell (the source fade ends on an empty frame 15 of the split) %s' % occ)
        if any(v != 0 for v in occ[spec['frames']:]):
            errors.append('cells past frame 14 must stay empty')
        if occ[0] < 1000:
            errors.append('first cell must be a body frame (old frames 0/1 dropped), got %d px' % occ[0])
        if spec['drop'] and source_available:
            first = cells(np.array(Image.open(SRC / (name + '.png')).convert('RGBA')), spec['cols'], spec['rows'])
            if np.array_equal(cells(arr, spec['cols'], spec['rows'])[0], first[0]) or np.array_equal(cells(arr, spec['cols'], spec['rows'])[0], first[1]):
                errors.append('dropped star disc is still in cell 0')
    if content_box(arr, spec) != CONTENT_BOX[name]:
        errors.append('content box %s != %s' % (content_box(arr, spec), CONTENT_BOX[name]))
    if source_available:
        expected = build(name, np.array(Image.open(SRC / (name + '.png')).convert('RGBA')))
        if not np.array_equal(expected, arr):
            errors.append('differs from a fresh build of the source')
    if EXPECTED_SHA256[name] and sha(target) != EXPECTED_SHA256[name]:
        errors.append('sha256 %s' % sha(target))
    meta = OUT / (name + '.png.meta')
    if not meta.exists():
        errors.append('missing meta')
    else:
        raw = meta.read_bytes()
        old = SETTINGS_FROM.read_bytes()
        if re.sub(rb'guid: [0-9a-f]+', b'guid:', raw) != re.sub(rb'guid: [0-9a-f]+', b'guid:', old):
            errors.append('import settings differ from proj_elem_orb_v3.png.meta')
        if re.search(rb'guid: ([0-9a-f]{32})', raw)[1] == re.search(rb'guid: ([0-9a-f]{32})', old)[1]:
            errors.append('guid reused')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-only', action='store_true')
    parser.add_argument('--hashes', action='store_true')
    args = parser.parse_args()
    source_available = SRC.exists() and all((SRC / (n + '.png')).exists() for n in SHEETS)
    if not args.check_only:
        if not source_available:
            print('angler-water: source folder missing: ' + str(SRC))
            return 1
        for name in SHEETS:
            sheet = build(name, np.array(Image.open(SRC / (name + '.png')).convert('RGBA')))
            Image.fromarray(sheet).save(OUT / (name + '.png'), optimize=True)
            write_meta(name)
    bad = 0
    parts = []
    for name in SHEETS:
        errors = validate(name, source_available and not args.check_only)
        bad += len(errors)
        parts.append('%s ok=%s sha=%s' % (name, not errors, sha(OUT / (name + '.png'))[:12] if (OUT / (name + '.png')).exists() else '-'))
        for e in errors:
            print('angler-water FAIL ' + name + ': ' + e)
    print('angler-water: ' + ', '.join(parts))
    if args.hashes:
        for name in SHEETS:
            print(name, sha(OUT / (name + '.png')))
    return 0 if bad == 0 else 1


if __name__ == '__main__':
    raise SystemExit(main())
