"""Unity RETOUCH 1/2: existing art -> luminance ramp; no generation or alpha edits.

Run with Python 3.14 (numpy, Pillow, scipy), stdin closed:
  C:\\Python314\\python.exe tools/vfx/recolor_combat_retouch.py < NUL
  ... --check-only --strict < NUL
Fixed outputs: four new runtime PNG/meta pairs and tmp/design-review/vfx-retouch.
Like origin/main:tools/vfx/regrid_arcpoi_pack.py, use .299/.587/.114
luminance, linear np.interp RGB ramps, and round-to-nearest uint8.
No regrid/rotation/morphology: preserve the original dimensions and alpha bytes.
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
REVIEW = ROOT / 'tmp/design-review/vfx-retouch'
JOBS = [
    ('Blood_FBF_4x4', 'Blood_FBF_4x4_matte', 4, 4, ['#2a0a08', '#6e1e16', '#c0503a'], (0, 20)),
    ('Lightning_ImpactLightning_Sheet', 'Lightning_ImpactLightning_Sheet_el4', 4, 4, ['#2e2814', '#c8a848', '#fff4d0'], (40, 55)),
    ('Lightning_Lightning_FBF_4x3', 'Lightning_Lightning_FBF_4x3_el4', 4, 3, ['#2e2814', '#c8a848', '#fff4d0'], (40, 55)),
    ('Lightning_BasicImpact', 'Lightning_BasicImpact_el4', 3, 3, ['#2e2814', '#c8a848', '#fff4d0'], (40, 55)),
]


def hexc(s):
    return np.array([int(s[i:i+2], 16) for i in (1, 3, 5)], np.float32) / 255


def luminance(rgb):
    return rgb @ np.array([.299, .587, .114], np.float32)


def ramp(t, stops, colors):
    return np.stack([np.interp(t, stops, [c[ch] for c in colors]) for ch in range(3)], axis=-1)


def recolor(src, colors, blood):
    rgb = src[..., :3].astype(np.float32) / 255
    light = luminance(rgb)
    visible = src[..., 3] > 0
    if blood:
        # Dark red source has low raw luminance: normalize to its brightest
        # visible source pixel, then cap even that at the matte blood core.
        peak = float(light[visible].max())
        out = ramp(light / max(peak, 1e-6), [0, .45, 1], colors)
    else:
        # Strict > percentile excludes tied pixels instead of introducing
        # a spatial rank mask/dither to force exactly three percent.
        cut = float(np.quantile(light[visible], .97))
        peak = float(light[visible].max())
        out = ramp(light, [0, max(cut, 1e-6), max(peak, cut + 1e-6)], colors)
    dst = src.copy()
    dst[..., :3] = (np.clip(out, 0, 1) * 255 + .5).astype(np.uint8)
    return dst


def hsv(rgb):
    high, low = rgb.max(axis=-1), rgb.min(axis=-1)
    delta = high - low
    hue = np.zeros_like(high)
    for ch, offset in [(0, 0), (1, 2), (2, 4)]:
        mask = (rgb.argmax(axis=-1) == ch) & (delta > 0)
        hue[mask] = ((rgb[..., (ch+1)%3] - rgb[..., (ch+2)%3])[mask] / delta[mask] + offset) * 60
    return hue % 360, delta / np.maximum(high, 1e-6)


def components(alpha, cols, rows, threshold):
    h, w = alpha.shape
    stats = []
    for frame in range(cols * rows):
        y, x = divmod(frame, cols)
        cell = alpha[y*(h//rows):(y+1)*(h//rows), x*(w//cols):(x+1)*(w//cols)]
        labels, count = ndi.label(cell > threshold, structure=np.ones((3, 3)))
        sizes = np.bincount(labels.ravel())[1:]
        stats.append({'frame': frame, 'components': count,
                      'outside_largest': max(0, count-1),
                      'tiny_le4px': int((sizes <= 4).sum())})
    return stats


def validate(src, dst, cols, rows, palette, hue_range, blood):
    visible = dst[..., 3] > 0
    rgb = dst[..., :3].astype(np.float32) / 255
    hue, sat = hsv(rgb[visible])
    _, old_sat = hsv(src[..., :3][visible].astype(np.float32) / 255)
    max_sat = float(hsv(np.array(palette))[1].max())
    report = {
        'size': [dst.shape[1], dst.shape[0]], 'grid': [cols, rows],
        'alpha_bytes_equal': bool(np.array_equal(src[..., 3], dst[..., 3])),
        'hue_degrees': [float(hue.min()), float(hue.max())],
        'hue_outside_pixels': int(((hue < hue_range[0]) | (hue > hue_range[1])).sum()),
        'saturation_mean_before_after': [float(old_sat.mean()), float(sat.mean())],
        'saturation_max': float(sat.max()),
    }
    if blood:
        report['above_blood_core_pixels'] = int((luminance(rgb[visible]) > luminance(palette[-1]) + 1e-6).sum())
        report['palette_saturation_cap_ok'] = bool(sat.max() <= max_sat + 1/255)
        report['mean_saturation_reduced'] = bool(sat.mean() < old_sat.mean())
    else:
        # All brighter-than-mid colors may occur only in the source's top 3%.
        old_light = luminance(src[..., :3].astype(np.float32) / 255)
        cut = float(np.quantile(old_light[visible], .97))
        bright = luminance(rgb) > luminance(palette[1]) + .5/255
        report['above_mid_fraction'] = float(bright[visible].mean())
        report['bright_outside_source_top3_pixels'] = int((bright & visible & (old_light <= cut)).sum())
    report['components_alpha_gt0'] = components(dst[..., 3], cols, rows, 0)
    report['components_alpha_gt20'] = components(dst[..., 3], cols, rows, 20)
    report['new_components'] = sum(b['components']-a['components'] for a,b in zip(components(src[...,3],cols,rows,0), report['components_alpha_gt0']))
    report['strict_zero_detached_pass'] = all(x['outside_largest'] == 0 for x in report['components_alpha_gt0'])
    report['recolor_pass'] = report['alpha_bytes_equal'] and report['hue_outside_pixels'] == 0 and report['new_components'] == 0
    if blood:
        report['recolor_pass'] &= report['above_blood_core_pixels'] == 0 and report['palette_saturation_cap_ok'] and report['mean_saturation_reduced']
    else:
        report['recolor_pass'] &= report['above_mid_fraction'] <= .03 and report['bright_outside_source_top3_pixels'] == 0
    return report


def comparison(src, dst, name, cols, rows):
    w, h = src.size
    cw, ch = w//cols, h//rows
    frame = 0
    x, y = frame % cols * cw, frame // cols * ch
    crop = (x, y, x+cw, y+ch)
    board = Image.new('RGB', (max(w*2+48, 840), h+3*ch+94), '#181510')
    draw = ImageDraw.Draw(board)
    draw.text((12, 8), f'{name} | ORIGINAL / RETOUCH | sheet 1x, frame 0 crop 3x', fill='#efe6d2')
    for col, im in enumerate([src, dst]):
        board.paste(im, (12+col*(w+24), 32), im)
        c = im.crop(crop).resize(((crop[2]-crop[0])*3,(crop[3]-crop[1])*3), Image.Resampling.NEAREST)
        board.paste(c, (12+col*(w+24), h+66), c)
    draw.text((12,h+42),'3x nearest crop; inherited alpha islands are preserved (not a zero-speck pass)',fill='#efe6d2')
    board.save(REVIEW/f'{name}_compare.png')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-only', action='store_true')
    parser.add_argument('--strict', action='store_true', help='Fail on inherited detached components, too')
    args = parser.parse_args()
    REVIEW.mkdir(parents=True, exist_ok=True)
    reports = {}
    for original, target, cols, rows, colors, hue_range in JOBS:
        source = Image.open(ART/f'{original}.png').convert('RGBA')
        src = np.array(source)
        palette = [hexc(c) for c in colors]
        blood = target.endswith('_matte')
        if not args.check_only:
            dst = recolor(src, palette, blood)
            Image.fromarray(dst).save(ART/f'{target}.png', optimize=True)
            meta = (ART/f'{original}.png.meta').read_text(encoding='utf-8')
            guid = uuid.uuid5(uuid.NAMESPACE_URL, f'exoduser/combat-retouch/{target}').hex
            (ART/f'{target}.png.meta').write_text(re.sub(r'(?m)^guid: [0-9a-f]+$', 'guid: '+guid, meta), encoding='utf-8', newline='\n')
        output = Image.open(ART/f'{target}.png').convert('RGBA')
        report = validate(src, np.array(output), cols, rows, palette, hue_range, blood)
        old_meta = (ART/f'{original}.png.meta').read_text(encoding='utf-8')
        new_meta = (ART/f'{target}.png.meta').read_text(encoding='utf-8')
        report['meta_settings_equal'] = re.sub(r'guid: [0-9a-f]+', 'guid:', old_meta) == re.sub(r'guid: [0-9a-f]+', 'guid:', new_meta)
        report['new_guid'] = re.search(r'guid: ([0-9a-f]+)', new_meta)[1]
        report['guid_changed'] = report['new_guid'] != re.search(r'guid: ([0-9a-f]+)', old_meta)[1]
        report['recolor_pass'] &= report['meta_settings_equal'] and report['guid_changed']
        reports[target] = report
        comparison(source, output, target, cols, rows)
        detached = sum(x['outside_largest'] for x in report['components_alpha_gt0'])
        print(f'{target}: recolor={report["recolor_pass"]}, hue={report["hue_degrees"]}, alpha_equal={report["alpha_bytes_equal"]}, inherited_detached={detached}, strict_zero={report["strict_zero_detached_pass"]}')
    (REVIEW/'checks.json').write_text(json.dumps(reports, indent=2)+'\n', encoding='utf-8')
    ok = all(r['recolor_pass'] and (not args.strict or r['strict_zero_detached_pass']) for r in reports.values())
    return 0 if ok else 1


if __name__ == '__main__':
    raise SystemExit(main())
