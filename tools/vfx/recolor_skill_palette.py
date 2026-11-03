"""U-VFX-12: deterministic palette copies; no generation, Unity or source edits.

C:/Python314/python.exe -B tools/vfx/recolor_skill_palette.py < NUL
C:/Python314/python.exe -B tools/vfx/recolor_skill_palette.py --check-only < NUL
Light_ImpactLight_Sheet is deliberately deferred: cartoon stars/arrows/rings
need new artwork, not a palette copy. Dark smoke is audited without writing it.
"""
import argparse
import json
import re
import uuid
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from recolor_parry_water import small_islands

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'unity/Assets/Exoduser/Resources/Art/vfx'
REVIEW = ROOT / 'tmp/design-review/vfx-skillpal'
RUNTIME = ROOT / 'unity/Assets/Exoduser/Runtime'
WEIGHTS = np.array([.299, .587, .114])
PALETTES = {
    'ice': ('#1a2a36', '#5f98c0', '#e8f3f8'),
    'arcane': ('#161226', '#6a56a8', '#e4dcf4'),
    'physical': ('#2a2220', '#9a8a72', '#efe6d2'),
    'poison': ('#1c2810', '#5f8a2e', '#c8e8a8'),
}
HUES = {'ice': (198, 212), 'arcane': (248, 272), 'physical': (16, 46), 'poison': (88, 90), 'dark': (268, 280)}
JOBS = [
    ('skill_ice_orb_sheet', 'ice', 3, 3),
    ('skill_malice_impact', 'arcane', 3, 3),
    ('skill_spike_thorn', 'physical', 1, 1),
    ('combat/Poison_MediumImpact', 'poison', 4, 4),
    ('combat/Ice_ImpactIce_Sheet', 'ice', 4, 4),
]
DARK = 'combat/Dark_DarkSmoke_FBF_4x4'
DEFERRED = 'combat/Light_ImpactLight_Sheet'


def palette(element):
    return np.array([[int(s[i:i+2], 16) for i in (1, 3, 5)] for s in PALETTES[element]], dtype=float)


def cells(array, cols, rows):
    h, w = array.shape[:2]
    for f in range(cols * rows):
        y, x = divmod(f, cols)
        yield array[y*(h//rows):(y+1)*(h//rows), x*(w//cols):(x+1)*(w//cols)]


def clean_alpha(src, cols, rows):
    alpha = src[..., 3].copy()
    for cell in cells(alpha, cols, rows):
        while True:
            remove = small_islands(cell, 0) | small_islands(cell, 20)
            if not remove.any():
                break
            cell[remove] = 0
    return alpha


def hsv(rgb):
    rgb = rgb.astype(float) / 255
    hi, lo = rgb.max(-1), rgb.min(-1)
    delta = hi - lo
    hue = np.zeros_like(hi)
    for ch, offset in [(0, 0), (1, 2), (2, 4)]:
        mask = (rgb.argmax(-1) == ch) & (delta > 0)
        hue[mask] = ((rgb[..., (ch+1)%3] - rgb[..., (ch+2)%3])[mask] / delta[mask] + offset) * 60
    return hue % 360, delta / np.maximum(hi, 1e-9)


def statistics(px):
    visible = px[..., 3] > 12
    rgb = px[..., :3][visible]
    hue, sat = hsv(rgb)
    selected = hue[sat >= .35]
    light = rgb @ WEIGHTS / 255
    return {'hue_sat035': [round(float(selected.min()), 3), round(float(selected.max()), 3)] if len(selected) else None,
            'median_luminance': round(float(np.median(light)), 6),
            'max_luminance': round(float(light.max()), 6)}


ICE_LIGHT = np.array([0xa8, 0xc8, 0xdc], dtype=float)   # frost highlight between ice mid and core
ICE_STOPS = [0, .5, .85, 1]


def ice_ramp(t, ramp):
    colours = np.array([ramp[0], ramp[1], ICE_LIGHT, ramp[2]])
    return np.stack([np.interp(t, ICE_STOPS, colours[:, ch]) for ch in range(3)], axis=-1)


def ice_orb(src, dst, normalized, visible, front, ramp):
    """Ice orb (lead RETOUCH 11-04): a single shadow->mid ramp flattened the orb into a matte grey disc.
    Keep the source's full value range on four stops (shadow, mid, frost highlight #a8c8dc, core): facet
    edges keep their highlight in every frame, the core colour only in frames 0-1, and the visible median
    stays at .45 (bullets read through it) by solving one global gamma. The returned mask marks every pixel
    allowed above the ice mid colour."""
    capped = np.where(front, normalized, np.minimum(normalized, ICE_STOPS[2]))
    lo, hi = .2, 5.0
    for _ in range(40):
        gamma = (lo + hi) / 2
        lum = ice_ramp(capped[visible] ** gamma, ramp) @ WEIGHTS / 255
        lo, hi = (gamma, hi) if np.median(lum) > .45 else (lo, gamma)
    t = capped ** gamma
    dst[..., :3] = np.clip(ice_ramp(t, ramp), 0, 255).round().astype(np.uint8)
    return dst, t > ICE_STOPS[1], gamma


def transform(src, name, element, cols, rows):
    dst = src.copy()
    dst[..., 3] = clean_alpha(src, cols, rows)
    light = src[..., :3] @ WEIGHTS / 255
    visible = dst[..., 3] > 12
    peak = max(float(light[visible].max()), 1e-6)
    normalized = light / peak
    # Only the source's brightest 3% in frames 0-1 may enter mid->core.
    cut = float(np.quantile(normalized[visible], .97))
    front = np.zeros(light.shape, dtype=bool)
    for frame, cell in enumerate(cells(front, cols, rows)):
        if frame < min(2, cols*rows):
            cell[:] = True
    core = (normalized > cut) & front
    ramp = palette(element)
    if name == 'skill_ice_orb_sheet':
        return ice_orb(src, dst, normalized, visible, front, ramp)
    # A global gamma preserves the source's shading; no spatial noise/dither.
    gamma = 1.6
    t =np.minimum(normalized / max(cut, 1e-6), 1) ** gamma
    if element == 'physical':
        t = np.maximum(t, .10)  # stay inside the bone/rust ramp, outside red-warning hue
    out = ramp[0] + t[..., None] * (ramp[1]-ramp[0])
    blend = np.clip((normalized-cut) / max(1-cut, 1e-6), 0, 1)
    out[core] = ramp[1] + blend[core, None] * (ramp[2]-ramp[1])
    dst[..., :3] = np.clip(out, 0, 255).round().astype(np.uint8)
    if element == 'poison':
        # 8-bit RGB interpolation can drift to 87.5/90.5 degrees. Project
        # only G onto 88..90 degrees; R/B and the three-color ramp stay intact.
        rgb = dst[..., :3].astype(int)
        delta = rgb[..., 0] - rgb[..., 2]
        # G is dominant: H = 120 - 60*(R-B)/(G-B).
        low = rgb[..., 2] + np.ceil(delta * (60/32)).astype(int)
        high = rgb[..., 2] + 2*delta
        dst[..., 1] = np.clip(rgb[..., 1], low, high).astype(np.uint8)
    return dst, core, gamma


def grid_contracts():
    skill = (RUNTIME / 'NativeSkillView.cs').read_text(encoding='utf-8')
    malice = (RUNTIME / 'NativeSkillView.Malice.cs').read_text(encoding='utf-8')
    timeline = (RUNTIME / 'Vfx/CombatImpactTimeline.cs').read_text(encoding='utf-8')
    return bool(re.search(r'orbTex.width / 3, fh = orbTex.height / 3', skill)
                and re.search(r'spike = Whole\("Art/vfx/skill_spike_thorn(?:_pal)?"\)', skill)
                and 'int[] columns = { 4, 6, 3 }, rows = { 4, 6, 3 }' in malice
                and 'Sheet=sheet,Cols=4,Rows=4,Frames=frames' in timeline)


def validate(name, element, cols, rows, src, dst, expected, core, gamma):
    target = ART / (name + '_pal.png')
    old = (ART / (name + '.png.meta')).read_bytes()
    raw = target.with_suffix('.png.meta').read_bytes()
    guid = uuid.uuid5(uuid.NAMESPACE_URL, 'exoduser/vfx-skillpal/' + name + '_pal').hex.encode()
    meta_equal = raw == re.sub(rb'guid: [0-9a-f]{32}', b'guid: ' + guid, old, count=1)
    same_size = src.shape == dst.shape
    if not same_size:
        return {'sheet': name, 'pass': False, 'error': 'dimensions differ'}
    changed = src[..., 3] != dst[..., 3]
    visible = dst[..., 3] > 12
    hue, sat = hsv(dst[..., :3][visible])
    chromatic = sat >= .35
    lo, hi = HUES[element]
    outside = int((chromatic & ((hue < lo-1e-6) | (hue > hi+1e-6))).sum())
    banned = {label: int((chromatic & (hue >= a) & (hue <= b)).sum())
              for label, a, b in [('lime', 65, 80), ('magenta', 300, 360), ('neon_cyan', 170, 195)]}
    red = int(((sat >= .2) & ((hue >= 345) | (hue <= 15))).sum()) if element == 'physical' else 0
    specks = sum(int(small_islands(a, 0).sum() + small_islands(a, 20).sum()) for a in cells(dst[..., 3], cols, rows))
    brighter = (dst[..., :3] @ WEIGHTS) > palette(element)[1] @ WEIGHTS + .6
    stray_core = int((brighter & ~core & (dst[..., 3] > 0)).sum())
    alpha_ok = bool(np.all(dst[..., 3][changed] == 0) and np.array_equal(src[..., 3][~changed], dst[..., 3][~changed]))
    after = statistics(dst)
    median_ok = name != 'skill_ice_orb_sheet' or .43 <= after['median_luminance'] <= .47
    report = {'sheet': name + '_pal', 'grid': [cols, rows], 'size': [src.shape[1], src.shape[0]],
              'element': element, 'palette_shadow_mid_core': PALETTES[element], 'gamma': round(gamma, 6),
              'before': statistics(src), 'after': after, 'hue_range': [lo, hi], 'hue_outside_pixels': outside,
              'banned_pixels': banned, 'red_warning_pixels': red, 'specks_left': specks,
              'alpha_pixels_removed': int(changed.sum()), 'only_removed_alpha_and_retained_equal': alpha_ok,
              'core_outside_brightest_front_pixels': stray_core, 'same_import_settings_and_line_endings': meta_equal,
              'deterministic_new_guid': guid.decode(), 'guid_changed': guid not in old,
              'runtime_grid_contract': grid_contracts()}
    report['pass'] = bool(np.array_equal(dst, expected) and meta_equal and guid not in old and alpha_ok
                          and outside == red == specks == stray_core == 0 and not any(banned.values())
                          and median_ok and report['runtime_grid_contract'])
    return report


def comparison(name, src, dst, cols, rows):
    h, w = src.shape[:2]
    cw, ch = w//cols, h//rows
    # For the one-cell trap use a representative center patch, at native 3x.
    # Other sheets show the whole first cell plus a late cell at 3x.
    crops = [(0, 0, cw, ch), (0, ch*(rows-1), cw, ch*rows)] if cols > 1 else [(w//2-160, h//2-160, w//2+160, h//2+160)]
    col_width = max(w, 3*(crops[0][2]-crops[0][0])) + 24
    top = h+74
    board = Image.new('RGB', (col_width*2+24, top + sum((b[3]-b[1])*3+30 for b in crops)), '#262a22')
    draw = ImageDraw.Draw(board)
    draw.text((12, 8), name + ' | original LEFT / palette RIGHT | whole sheet 1x', fill='#efe6d2')
    for col, pixels in enumerate((src, dst)):
        im = Image.fromarray(pixels)
        x = 12+col*col_width
        board.paste(im, (x, 34), im)
        y = top
        for i, box in enumerate(crops):
            crop = im.crop(box).resize(((box[2]-box[0])*3, (box[3]-box[1])*3), Image.Resampling.NEAREST)
            draw.text((x, y-20), f'3x nearest / crop {box}', fill='#efe6d2')
            board.paste(crop, (x, y), crop)
            y += crop.height+30
    board.save(REVIEW / ('compare_' + Path(name).name + '.png'))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    REVIEW.mkdir(parents=True, exist_ok=True)
    reports = []
    for name, element, cols, rows in JOBS:
        src = np.array(Image.open(ART / (name+'.png')).convert('RGBA'))
        dst, core, gamma = transform(src, name, element, cols, rows)
        target = ART / (name+'_pal.png')
        if not args.check_only:
            Image.fromarray(dst).save(target, optimize=True)
            raw = (ART / (name+'.png.meta')).read_bytes()
            guid = uuid.uuid5(uuid.NAMESPACE_URL, 'exoduser/vfx-skillpal/' + name + '_pal').hex.encode()
            target.with_suffix('.png.meta').write_bytes(re.sub(rb'guid: [0-9a-f]{32}', b'guid: '+guid, raw, count=1))
            comparison(name, src, dst, cols, rows)
        try:
            actual = np.array(Image.open(target).convert('RGBA'))
            reports.append(validate(name, element, cols, rows, src, actual, dst, core, gamma))
        except (OSError, ValueError) as error:
            reports.append({'sheet': name, 'pass': False, 'error': str(error)})
    dark = np.array(Image.open(ART / (DARK+'.png')).convert('RGBA'))
    hue, sat = hsv(dark[..., :3][dark[..., 3] > 12])
    chromatic = sat >= .35
    dark_ok = bool(np.all((hue[chromatic] >= 268) & (hue[chromatic] <= 280)))
    reports.append({'sheet': DARK, 'audit_only': True, 'before': statistics(dark), 'after': statistics(dark),
                    'hue_range': HUES['dark'], 'magenta_pixels': int((chromatic & (hue >= 300)).sum()), 'pass': dark_ok})
    if not args.check_only:
        comparison(DARK, dark, dark, 4, 4)
        light = np.array(Image.open(ART / (DEFERRED+'.png')).convert('RGBA'))
        comparison(DEFERRED, light, light, 4, 4)
    result = {'checks': reports, 'deferred': [{'sheet': DEFERRED, 'status': 'ARTWORK_REQUIRED',
               'reason': 'Cartoon stars, arrows and rings survive recoloring; original and runtime reference unchanged.'}],
              'pass': all(r['pass'] for r in reports), 'game_qa': 'RETOUCH_GAME_QA_PENDING'}
    (REVIEW / 'checks.json').write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
    print('skill-palette: ' + ', '.join(f"{r['sheet']}={r['pass']}" for r in reports) + '; deferred=1 (Light artwork); game QA pending')
    return 0 if result['pass'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
