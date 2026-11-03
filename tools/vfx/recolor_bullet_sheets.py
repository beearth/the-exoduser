"""Cost-zero Unity recolor; run with Python + Pillow, numpy, scipy.

Writes only inside this checkout. No image generation, Unity, git mutation,
original-source overwrite, alpha multiplication, or external output directories.
Reference: origin/main tools/vfx/regrid_arcpoi_pack.py (luma/palette/opening).
"""
import json
from pathlib import Path
import re
import uuid
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'unity/Assets/Exoduser/Resources/Art/vfx'
REVIEW = ROOT / 'tmp/design-review/bullet-remaster'
WEIGHTS = np.array([.299, .587, .114])
ORB_SOURCE_ROWS = [0, 2, 1, 3, 5, 4]

PALETTES = [
    ("physical", "#2a2220", "#9a8a72", "#efe6d2", "#fff4d0"),
    ("fire", "#4a1610", "#d8562a", "#ffd9a0", "#fff4d0"),
    ("ice", "#1a2a36", "#5f98c0", "#e8f3f8", "#fff4d0"),
    ("dark", "#170c20", "#5e3478", "#cdb2e0", "#fff4d0"),
    ("lightning", "#2e2814", "#c8a848", "#fff4d0", "#fff4d0"),
    ("holy", "#3a2c18", "#c9a45e", "#fff2d6", "#fff4d0"),
    ("earth", "#241a10", "#7e6236", "#dcc8a4", "#fff4d0"),
    ("poison", "#1c2810", "#5f8a2e", "#c8e8a8", "#eef8e0"),
]


def recolor_frame(src, palette):
    out = src.copy()
    visible = src[..., 3] > 20
    if not visible.any():
        return out
    luminance = src[..., :3] @ WEIGHTS
    # Higher avoids ceil(N*.03) hot pixels exceeding the exact 3% budget.
    shoulder = float(np.quantile(luminance[visible], .97, method='higher'))
    peak = float(luminance[visible].max())
    colors = np.array([list(bytes.fromhex(c[1:])) for c in palette[1:]], float)
    # No synthetic core/spark in flat or empty frames. Stops are per frame,
    # not per sheet: animation hue and brightness stay independent of rows.
    stops = [0, max(.001, shoulder * .30), max(.002, shoulder), max(.003, shoulder + .001, peak)]
    rgb = np.stack([np.interp(luminance, stops, colors[:, ch]) for ch in range(3)], axis=-1)
    # Keep 240+ luma strictly within the brightest 3% of visible source pixels,
    # including byte-rounding at the ice/lightning/holy palette shoulders.
    hot = visible & (luminance > shoulder)
    light = rgb @ WEIGHTS
    cap = (~hot) & (light > 239)
    rgb[cap] *= (239 / light[cap])[..., None]
    out[..., :3] = np.clip(rgb + .5, 0, 255).astype(np.uint8)
    return out


def clean_orb_alpha(alpha):
    mask = alpha > 20
    opened = ndi.binary_opening(mask, structure=np.ones((5, 5), bool))
    labels, _ = ndi.label(mask, structure=np.ones((3, 3), bool))
    keep_ids = np.unique(labels[opened])
    keep_ids = keep_ids[keep_ids != 0]
    # Remove entire detached specks; do not erode the connected thin tail.
    keep = np.isin(labels, keep_ids)
    keep = ndi.binary_dilation(keep, structure=np.ones((3, 3), bool))
    return np.where(keep, alpha, 0).astype(np.uint8)


def load(relative):
    return np.array(Image.open(ART / relative).convert('RGBA'))


def clean_detached_alpha(alpha, comet=False):
    """Remove small 8-connected alpha>.05 components and their soft halos.

    Nearest-seed ownership keeps the body's alpha exact, even for a speck
    separated from the body by only one pixel. No dilation joins components.
    """
    labels, count = ndi.label(alpha > 255 * .05, structure=np.ones((3, 3), bool))
    if not count:
        return alpha.copy()
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    body = int(sizes.argmax())
    remove = []
    for label, box in enumerate(ndi.find_objects(labels), 1):
        if label == body or box is None:
            continue
        diameter = max(s.stop-s.start for s in box)
        if sizes[label] < alpha.size * .005 or (comet and diameter < 6):
            remove.append(label)
    if not remove:
        return alpha.copy()
    nearest = ndi.distance_transform_edt(labels == 0, return_distances=False, return_indices=True)
    owner = labels[tuple(nearest)]
    out = alpha.copy()
    out[np.isin(owner, remove)] = 0
    assert np.array_equal(out[labels == body], alpha[labels == body])
    return out


def component_count(alpha):
    return ndi.label(alpha > 255*.05, structure=np.ones((3, 3), bool))[1]


def save_sheet(relative, pixels, original):
    destination = ART / relative
    Image.fromarray(pixels).save(destination, optimize=True)
    src_meta = Path(str(ART / original) + '.meta').read_text(encoding='utf-8')
    meta = Path(str(destination) + '.meta')
    guid = (re.search(r'^guid: ([0-9a-f]{32})$', meta.read_text(encoding='utf-8'), re.M).group(1)
            if meta.exists() else uuid.uuid5(uuid.NAMESPACE_URL, 'exoduser/unity/bullet-remaster/' + relative).hex)
    meta.write_text(re.sub(r'^guid: [0-9a-f]{32}$', 'guid: ' + guid, src_meta, flags=re.M), encoding='utf-8')


def frame_metrics(original, output):
    visible = output[..., 3] > 20
    luma = output[..., :3] @ WEIGHTS
    # Both source and composited luma are recorded: alpha can hide a bright RGB.
    composited = luma * output[..., 3] / 255
    return {
        'alpha_changed_pixels': int(np.count_nonzero(original[..., 3] != output[..., 3])),
        'visible_pixels': int(visible.sum()),
        'bright240_fraction': float(((luma >= 240) & visible).sum() / max(1, visible.sum())),
        'max_rgb_luma': round(float(luma[visible].max()), 3) if visible.any() else 0,
        'max_composited_luma_black': round(float(composited.max()), 3),
    }


def panel(original, output, label, width=960):
    scale = width / output.shape[1]
    size = (width, round(output.shape[0] * scale))
    board = Image.new('RGB', (width * 2 + 24, size[1] + 48), '#101616')
    draw = ImageDraw.Draw(board)
    draw.text((8, 8), 'ORIGINAL | ' + label + ' | RECOLORED (same scale)', fill='#e8e0ce')
    for x, pixels in ((0, original), (width + 24, output)):
        im = Image.fromarray(pixels).resize(size, Image.Resampling.LANCZOS)
        board.paste(im, (x, 40), im)
    return board


def comparison(original, baseline, output, label, rows, cols):
    """Same-scale sheet pair + a source-pixel 3x crop (never a game claim)."""
    upper = panel(original, output, label)
    ch, cw = output.shape[0]//rows, output.shape[1]//cols
    offset_y = output.shape[0]-rows*ch if label.startswith('DRUID') else 0
    cells = [(r, c) for r in range(rows) for c in range(cols)]
    r, c = max(cells, key=lambda rc: component_count(baseline[offset_y+rc[0]*ch:offset_y+(rc[0]+1)*ch, rc[1]*cw:(rc[1]+1)*cw, 3]))
    a = baseline[offset_y+r*ch:offset_y+(r+1)*ch,c*cw:(c+1)*cw]
    b = output[offset_y+r*ch:offset_y+(r+1)*ch,c*cw:(c+1)*cw]
    ys, xs = np.where((a[...,3] > 255*.05) | (b[...,3] > 255*.05))
    box = (max(0,int(xs.min())-3),max(0,int(ys.min())-3),min(cw,int(xs.max())+4),min(ch,int(ys.max())+4))
    crop_size = ((box[2]-box[0])*3, (box[3]-box[1])*3)
    width = max(upper.width, crop_size[0]*2+48)
    board = Image.new('RGB', (width, upper.height+crop_size[1]+68), '#101616')
    board.paste(upper,(0,0))
    draw=ImageDraw.Draw(board)
    draw.text((8,upper.height+8),f'STATIC ASSET 3x NEAREST / row {r} frame {c} / BEFORE 1b | AFTER 1b (same crop)',fill='#e8e0ce')
    if label.startswith('DRUID'):
        draw.text((8,upper.height+27),'BEFORE = original cell grayscale x #66dd22; source top padding = 2px',fill='#e8e0ce')
    for x,pixels in [(8,a),(width//2+8,b)]:
        im=Image.fromarray(pixels).crop(box).resize(crop_size,Image.Resampling.NEAREST)
        board.paste(im,(x,upper.height+52),im)
    return board


def main():
    REVIEW.mkdir(parents=True, exist_ok=True)
    metrics = {'scope': 'STATIC_ASSET_ONLY; Unity/07e/11a NOT RUN', 'frames': []}
    comet = load('field/proj_bolt_comet.png')
    h, w = comet.shape[:2]
    assert (w, h) == (2032, 137) and w % 8 == 0
    result = np.zeros((h * 8, w, 4), np.uint8)
    comet_before = np.zeros_like(result)
    for row, palette in enumerate(PALETTES):
        for f in range(8):
            frame = comet[:, f * (w // 8):(f + 1) * (w // 8)]
            output = recolor_frame(frame, palette)
            comet_before[row*h:(row+1)*h,f*(w//8):(f+1)*(w//8)] = output
            output[...,3] = clean_detached_alpha(output[...,3], comet=True)
            result[row * h:(row + 1) * h, f * (w // 8):(f + 1) * (w // 8)] = output
            m = frame_metrics(frame, output)
            # Cleanup reduces the denominator. Keep approved RGB exactly;
            # the 3% emission budget is measured against pre-clean visibility.
            bright = ((output[...,:3] @ WEIGHTS >= 240) & (output[...,3] > 20)).sum()
            assert component_count(output[...,3]) == 1 and bright <= int((frame[...,3] > 20).sum()*.03)
            m['outside_before'] = component_count(frame[...,3])-1
            m['outside_after_3x'] = component_count(np.repeat(np.repeat(output[...,3],3,0),3,1))-1
            metrics['frames'].append(dict(sheet='comet', row=row, frame=f, **m))
    save_sheet('field/proj_bolt_comet_el.png', result, 'field/proj_bolt_comet.png')
    comparison(np.tile(comet, (8, 1, 1)), comet_before, result, 'COMET P F I D L H E POISON',8,8).save(REVIEW / 'comet_compare.png')

    orb = load('field/proj_elem_orb.png')
    assert orb.shape == (1536, 3072, 4)
    orb_result = np.zeros_like(orb)
    orb_before = np.zeros_like(orb)
    orb_baseline = np.zeros_like(orb)
    for row, source_row in enumerate(ORB_SOURCE_ROWS):
        for f in range(6):
            frame = orb[source_row * 256:(source_row + 1) * 256, f * 512:(f + 1) * 512].copy()
            original = frame.copy()
            frame[..., 3] = clean_orb_alpha(frame[..., 3])
            output = recolor_frame(frame, PALETTES[row + 1])
            orb_baseline[row*256:(row+1)*256,f*512:(f+1)*512] = output
            output[...,3] = clean_detached_alpha(output[...,3])
            orb_result[row * 256:(row + 1) * 256, f * 512:(f + 1) * 512] = output
            orb_before[row * 256:(row + 1) * 256, f * 512:(f + 1) * 512] = original
            m = frame_metrics(original, output)
            bright = ((output[...,:3] @ WEIGHTS >= 240) & (output[...,3] > 20)).sum()
            assert np.all(output[...,3] <= original[...,3]) and bright <= int((frame[...,3] > 20).sum()*.03)
            assert component_count(output[...,3]) == 1
            m['outside_before'] = component_count(frame[...,3])-1
            m['outside_after_3x'] = component_count(np.repeat(np.repeat(output[...,3],3,0),3,1))-1
            metrics['frames'].append(dict(sheet='orb', row=row, source_row=source_row, frame=f, **m))
    save_sheet('field/proj_elem_orb_el.png', orb_result, 'field/proj_elem_orb.png')
    comparison(orb_before, orb_baseline, orb_result, 'ORB F I D L H E',6,6).save(REVIEW / 'orb_compare.png')

    poison = load('boss/proj_firedevil_orb.png')
    h, w = poison.shape[:2]
    # NativeDruidArt.PoisonShot uses integer division. No size assert/regrid.
    cw, ch = w // 4, h // 4
    poison_result = poison.copy()
    for f in range(16):
        row, col = divmod(f, 4)
        # Old GetPixels32 origin is bottom-up: two unused rows are at TOP,
        # not bottom. Preserve exactly the old 313x313 frame sampling.
        sy = h - (4 - row) * ch
        frame = poison[sy:sy + ch, col * cw:(col + 1) * cw]
        output = recolor_frame(frame, PALETTES[7])
        poison_result[sy:sy + ch, col * cw:(col + 1) * cw] = output
        m = frame_metrics(frame, output)
        assert m['alpha_changed_pixels'] == 0 and m['bright240_fraction'] <= .03
        metrics['frames'].append(dict(sheet='poison', frame=f, **m))
    save_sheet('boss/druid_poison_orb.png', poison_result, 'boss/proj_firedevil_orb.png')
    poison_baseline = poison.copy()
    gray = poison[...,:3] @ WEIGHTS / 255
    poison_baseline[...,:3] = np.clip(gray[...,None]*[0x66,0xdd,0x22]+.5,0,255).astype(np.uint8)
    comparison(poison, poison_baseline, poison_result, 'DRUID POISON',4,4).save(REVIEW / 'poison_compare.png')

    # Explicit asset-only samples at unchanged draw sizes, never labelled M1.
    board = Image.new('RGB', (1200, 1050), '#101616')
    draw = ImageDraw.Draw(board)
    draw.text((12, 8), 'STATIC ASSET ONLY - frame 0 at draw size | 3x (not game capture)', fill='#eee6d2')
    for i, (name, source, target, size) in enumerate([
        ('COMET FIRE L=123.2*.65', comet[:, :254], result[137:274, :254], (80, 43)),
        ('ORB FIRE H=96', orb_before[:256, :512], orb_result[:256, :512], (192, 96)),
        ('POISON H=192', poison[h-4*ch:h-3*ch, :cw], poison_result[h-4*ch:h-3*ch, :cw], (192, 192)),
    ]):
        y = 48 + i * 324
        draw.text((12, y), name + ' ORIGINAL / AFTER', fill='#eee6d2')
        for x, array in ((12, source), (236, target)):
            im = Image.fromarray(array).resize(size, Image.Resampling.BILINEAR)
            board.paste(im, (x, y + 26), im)
        im = Image.fromarray(target).resize(size, Image.Resampling.BILINEAR)
        crop = im.crop((max(0, size[0] - 96), 0, size[0], min(size[1], 96)))
        large = crop.resize((crop.width * 3, crop.height * 3), Image.Resampling.NEAREST)
        board.paste(large, (590, y + 26), large)
    board.save(REVIEW / 'asset_1x_3x.png')
    metrics['poison_dimensions'] = [w, h]
    metrics['original_comet_max_luma'] = round(float((comet[..., :3] @ WEIGHTS).max()), 3)
    (REVIEW / 'asset_checks.json').write_text(json.dumps(metrics, indent=2), encoding='utf-8')
    print('Generated 3 sheets + copied importer settings; checked', len(metrics['frames']), 'frames')
    print('Static review:', REVIEW)


if __name__ == '__main__':
    main()
