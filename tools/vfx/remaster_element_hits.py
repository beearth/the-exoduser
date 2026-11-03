"""U-VFX-06: deterministic retiming, contact cores and palette/island cleanup.

C:/Python314/python.exe -B tools/vfx/remaster_element_hits.py < NUL
Original PNG/meta files are read-only. No generation API or Unity process.
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
REVIEW = ROOT / 'tmp/design-review/vfx-elhit'
WEIGHTS = np.array([.299, .587, .114])
CONNECT = np.ones((3, 3), dtype=bool)
PALETTES = [
    ('efe6d2', '9a8a72', '2a2220'),
    ('ffd9a0', 'd8562a', '4a1610'),
    ('e8f3f8', '5f98c0', '1a2a36'),
    ('cdb2e0', '5e3478', '170c20'),
    ('fff4d0', 'c8a848', '2e2814'),
    ('fff2d6', 'c9a45e', '3a2c18'),
]


def palette(el):
    return np.array([[int(h[i:i+2], 16) for i in (0, 2, 4)] for h in PALETTES[el]], dtype=float)


def hsv(rgb):
    """Vectorized hue in degrees and saturation, including every visible pixel."""
    rgb = rgb.astype(float)
    hi, lo = rgb.max(axis=-1), rgb.min(axis=-1)
    delta = hi - lo
    safe = np.maximum(delta, 1e-12)
    hue = np.select([hi == rgb[..., 0], hi == rgb[..., 1]],
                    [(rgb[..., 1] - rgb[..., 2]) / safe % 6,
                     (rgb[..., 2] - rgb[..., 0]) / safe + 2],
                    default=(rgb[..., 0] - rgb[..., 1]) / safe + 4) * 60
    return hue, delta / np.maximum(hi, 1e-12)


def hue_bounds(el):
    # §2.2 has explicit 198..212 for ice. Other rows define their
    # ranges by their three swatches; allow 2 degrees for 8-bit rounding.
    if el == 2:
        return 198., 212.
    hues = hsv(palette(el))[0]
    return float(hues.min() - 2), float(hues.max() + 2)


def constrain_hue(rgb, el):
    rgb = np.clip(np.rint(rgb), 0, 255).astype(np.uint8)
    lo, hi = hue_bounds(el)
    hue, sat = hsv(rgb)
    bad = (sat > .05) & ((hue < lo) | (hue > hi))
    if not bad.any():
        return rgb
    # Project the hue toward the middle swatch without lowering value or
    # abruptly increasing saturation. Mixing absolute RGB with the mid swatch
    # darkened isolated near-white rounding cases, producing dotted cores.
    mid_hue = float(hsv(palette(el)[1])[0])
    unit = np.array(colorsys.hsv_to_rgb(mid_hue / 360, 1, 1))
    values = rgb[bad].astype(float)
    high, low = values.max(axis=-1), values.min(axis=-1)
    pending = np.ones(len(values), dtype=bool)
    for _ in range(16):
        base = low[:, None] + (high - low)[:, None] * unit
        for rounded in (np.rint(base), np.floor(base), np.ceil(base)):
            candidate = rounded.astype(np.uint8)
            hue, _ = hsv(candidate)
            valid = pending & (hue >= lo) & (hue <= hi)
            values[valid] = candidate[valid]
            pending[valid] = False
        if not pending.any():
            rgb[bad] = values.astype(np.uint8)
            return rgb
        # A narrow hue interval can fall between two representable 8-bit
        # hues. Expand chroma one level, retaining the maximum channel.
        low[pending] = np.maximum(0, low[pending] - 1)
    raise ValueError(f'could not constrain element {el} hue')


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


def cleanup(frame):
    alpha = frame[..., 3]
    # Original Lanczos downsampling left alpha 1..4 at some cell boundaries.
    # Remove only those sub-2% edge traces; never crop a visible silhouette.
    border = np.zeros(alpha.shape, dtype=bool)
    border[[0, -1], :] = True
    border[:, [0, -1]] = True
    if np.any(alpha[border] > 4):
        raise ValueError('visible source silhouette touches a cell edge')
    alpha[border] = 0
    while True:
        remove = small_islands(alpha, 0) | small_islands(alpha, 20)
        if not remove.any():
            break
        alpha[remove] = 0
    frame[alpha == 0, :3] = 0
    return frame


def frame_metrics(frames):
    alpha = frames[..., 3].astype(float) / 255
    light = frames[..., :3] @ WEIGHTS
    return {'alpha_area': alpha.sum(axis=(1, 2)),
            'energy': (light * alpha).sum(axis=(1, 2))}


def latest_peak(frames):
    return max(int(v.argmax()) for v in frame_metrics(frames).values())


def frame_map(frames, limit, anchor=None):
    """Compress growth and hold existing decay frames; never invent a frame."""
    count = len(frames)
    peak = latest_peak(frames) if anchor is None else anchor
    contact = min(peak, limit)
    growth = np.rint(np.linspace(0, peak, contact + 1)).astype(int).tolist()
    tail = [i for i in range(peak + 1, count) if frames[i, ..., 3].any()]
    remaining = count - len(growth)
    if not tail:
        tail = [peak]
    # The last original nonempty decay cell occupies the final output cell.
    growth.extend(tail[i] for i in np.floor(np.linspace(0, len(tail) - 1, remaining)).astype(int))
    return growth


def mixed_mid(el):
    core, mid, _ = palette(el)
    mixed = core * .45 + mid * .55
    light = mixed.mean()
    return constrain_hue(light + (mixed - light) * 2., el).astype(float)


def recolor(frames, el):
    """Retain silhouettes/alpha and luminance structure, use the §2.2 ramp."""
    core, _, shadow = palette(el)
    light = frames[..., :3] @ WEIGHTS
    peak = max(1., float(light[frames[..., 3] > 0].max()))
    ramp = np.array([shadow, mixed_mid(el), core])
    rgb = np.stack([np.interp(light / peak, [0., .65, 1.], ramp[:, ch])
                    for ch in range(3)], axis=-1)
    dst = frames.copy()
    dst[..., :3] = constrain_hue(rgb, el)
    return np.stack([cleanup(f) for f in dst])


def core_diameters(boss):
    return (.30, .26, .22) if boss else (.30, .24)


def add_core(frame, el, fraction, index):
    size = frame.shape[1]
    yy, xx = np.mgrid[:size, :size]
    distance = np.hypot(xx - (size - 1) / 2, yy - (size - 1) / 2)
    radius = size * fraction / 2
    r = distance / radius
    core, _, _ = palette(el)
    ramp = np.array([[255., 255., 255.], [255., 255., 255.], core, mixed_mid(el)])
    rgb = np.stack([np.interp(r, [0., .12, .55, 1.], ramp[:, ch])
                    for ch in range(3)], axis=-1)
    rgb *= (1., .96, .90)[index]
    # Opaque central point; smoothstep feather in the outer half-radius.
    t = np.clip((r - .5) / .5, 0, 1)
    a = 1 - t * t * (3 - 2 * t)
    old_a = frame[..., 3] / 255.
    combined = a + old_a * (1 - a)
    composed = (rgb * a[..., None] + frame[..., :3] * (old_a * (1 - a))[..., None]) / np.maximum(combined[..., None], 1e-12)
    frame[..., :3] = constrain_hue(composed, el)
    frame[..., 3] = np.rint(combined * 255).astype(np.uint8)
    return cleanup(frame)


def remaster(frames, el, boss):
    base = recolor(frames, el)
    anchor = max(latest_peak(frames), latest_peak(base))
    mapping = frame_map(base, 2 if boss else 1, anchor)
    dst = base[mapping].copy()
    for index, diameter in enumerate(core_diameters(boss)):
        dst[index] = add_core(dst[index], el, diameter, index)
    return dst, mapping


def copy_meta(raw, name):
    guid = uuid.uuid5(uuid.NAMESPACE_URL, 'exoduser/vfx-elhit/' + name).hex.encode()
    result, count = re.subn(rb'(?m)^guid: [0-9a-f]{32}(?=\r?$)', b'guid: ' + guid, raw, count=1)
    if count != 1:
        raise ValueError('source meta must have exactly one GUID line')
    return result


def hue_report(frames, el):
    hue, sat = hsv(frames[..., :3])
    chromatic = (frames[..., 3] > 0) & (sat > .05)
    lo, hi = hue_bounds(el)
    values = hue[chromatic]
    return {'hue_bounds': [round(lo, 3), round(hi, 3)],
            'hue_min': round(float(values.min()), 3) if len(values) else None,
            'hue_max': round(float(values.max()), 3) if len(values) else None,
            'outside_hue_pixels': int((chromatic & ((hue < lo) | (hue > hi))).sum())}


def read_frames(path, count):
    pixels = np.array(Image.open(path).convert('RGBA'))
    if pixels.shape[1] != pixels.shape[0] * count:
        raise ValueError(f'{path.name}: expected {count} square horizontal cells')
    return np.stack(np.split(pixels, count, axis=1))


def metrics_report(frames):
    return {key: {'peak': int(value.argmax()), 'values': np.round(value, 3).tolist()}
            for key, value in frame_metrics(frames).items()}


def validate(source, target, src, dst, el, boss):
    expected, mapping = remaster(src, el, boss)
    before, after = metrics_report(src), metrics_report(dst)
    size = src.shape[1]
    center = size // 2
    original_peak = before['energy']['peak']
    original_light = src[original_peak, ..., :3] @ WEIGHTS
    original_max = float(original_light[src[original_peak, ..., 3] > 0].max())
    center_light = float(dst[0, center, center, :3] @ WEIGHTS)
    specks = sum(int(small_islands(f[..., 3], t).sum()) for f in dst for t in (0, 20))
    yy, xx = np.mgrid[:size, :size]
    radius = np.hypot(xx - (size - 1) / 2, yy - (size - 1) / 2)
    white_outside = 0
    for index, frame in enumerate(dst):
        allowed = radius <= size * core_diameters(boss)[index] / 2 * .25 if index < len(core_diameters(boss)) else np.zeros((size, size), dtype=bool)
        white_outside += int(((frame[..., :3] == 255).all(axis=-1) & (frame[..., 3] > 0) & ~allowed).sum())
    raw = source.with_suffix('.png.meta').read_bytes()
    meta = target.with_suffix('.png.meta').read_bytes()
    guid_match = re.search(rb'(?m)^guid: ([0-9a-f]{32})', meta)
    guid = guid_match[1].decode() if guid_match else None
    identical_settings = re.sub(rb'guid: [0-9a-f]{32}', b'guid:', meta) == re.sub(rb'guid: [0-9a-f]{32}', b'guid:', raw)
    border = np.concatenate([dst[:, 0, :, 3].ravel(), dst[:, -1, :, 3].ravel(),
                             dst[:, :, 0, 3].ravel(), dst[:, :, -1, 3].ravel()])
    hues = hue_report(dst, el)
    report = {'sheet': target.stem, 'cell': size, 'frames': len(dst), 'mapping': mapping,
              'before': before, 'after': after, 'core_diameter_fraction': core_diameters(boss),
              'core_diameter_pixels': [round(size * d, 2) for d in core_diameters(boss)],
              'first_center_luminance': round(center_light, 3), 'original_peak_max_luminance': round(original_max, 3),
              'core_present': center_light >= original_max and int(dst[0, center, center, 3]) == 255,
              'specks_left': specks, 'white_outside_inner_core': white_outside,
              'border_alpha_pixels': int((border > 0).sum()),
              'empty_frames': [i for i, f in enumerate(dst) if not f[..., 3].any()],
              'same_import_settings': identical_settings, 'guid': guid,
              'new_deterministic_guid': guid is not None and guid.encode() not in raw and meta == copy_meta(raw, target.stem),
              'deterministic_pixels': bool(np.array_equal(dst, expected)), **hues}
    report['pass'] = bool(report['deterministic_pixels'] and report['core_present'] and identical_settings
                          and report['new_deterministic_guid'] and specks == white_outside == 0
                          and hues['outside_hue_pixels'] == 0 and not report['empty_frames']
                          and report['border_alpha_pixels'] == 0
                          and all(m['peak'] <= (2 if boss else 1) for m in after.values()))
    return report


def comparison(src, dst, report, path):
    # Native sheet pixels on both sides, with source/output peaks independently
    # labelled (not a downscaled contact sheet). Every crop uses NEAREST 3x.
    sheet_w = src.shape[1] * len(src)
    size = src.shape[1]
    column = max(sheet_w, size * 3) + 24
    top = size + 92
    board = Image.new('RGB', (column * 2 + 12, top + 3 * (size * 3 + 32) + 12), '#262a22')
    draw = ImageDraw.Draw(board)
    for col, frames in enumerate((src, dst)):
        x = 12 + col * column
        label = 'ORIGINAL' if col == 0 else 'V2'
        info = report['before' if col == 0 else 'after']
        draw.text((x, 10), f"{report['sheet']} | {label} | native 1x sheet / alpha over #262a22", fill='#efe6d2')
        draw.text((x, 28), f"energy peak={info['energy']['peak']}; alpha area peak={info['alpha_area']['peak']}", fill='#efe6d2')
        strip = Image.fromarray(np.concatenate(list(frames), axis=1))
        board.paste(strip, (x, 50), strip)
        for row, index in enumerate((0, 1, info['energy']['peak'])):
            y = top + row * (size * 3 + 32)
            draw.text((x, y - 20), f'frame {index} | {"peak" if row == 2 else "contact"} | 3x NEAREST', fill='#efe6d2')
            crop = Image.fromarray(frames[index]).resize((size * 3, size * 3), Image.Resampling.NEAREST)
            board.paste(crop, (x, y), crop)
    board.save(path, optimize=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    REVIEW.mkdir(parents=True, exist_ok=True)
    reports = []
    for el in range(6):
        for boss in (False, True):
            name = f'impact_el{el}' + ('_boss_sheet' if boss else '_sheet')
            source, target = ART / (name + '.png'), ART / (name + '_v2.png')
            try:
                src = read_frames(source, 16 if boss else 9)
                if not args.check_only:
                    dst, _ = remaster(src, el, boss)
                    Image.fromarray(np.concatenate(list(dst), axis=1)).save(target, optimize=True)
                    target.with_suffix('.png.meta').write_bytes(copy_meta(source.with_suffix('.png.meta').read_bytes(), target.stem))
                dst = read_frames(target, 16 if boss else 9)
                report = validate(source, target, src, dst, el, boss)
                if not args.check_only:
                    comparison(src, dst, report, REVIEW / (f'compare_el{el}' + ('_boss' if boss else '') + '.png'))
            except (OSError, ValueError) as error:
                report = {'sheet': target.stem, 'pass': False, 'error': str(error)}
            reports.append(report)
    guids = [r.get('guid') for r in reports]
    unique = None not in guids and len(set(guids)) == 12
    ok = all(r['pass'] for r in reports) and unique
    result = {'pass': ok, 'unique_guids': unique, 'sheets': reports}
    (REVIEW / 'checks.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    failed = [r['sheet'] for r in reports if not r['pass']]
    print(f'element-hits: {sum(r["pass"] for r in reports)}/12 PASS; unique_guids={unique}; failures={failed}')
    return 0 if ok else 1


if __name__ == '__main__':
    raise SystemExit(main())
