"""U-VFX-07b element orb v3: chroma-keyed generated art -> 6x6 field orb sheet.

Build:  C:/Python314/python.exe -B tools/vfx/make_elem_orb_v3.py <raw_dir>
Check:  C:/Python314/python.exe -B tools/vfx/make_elem_orb_v3.py --check-only
Raw art (one side-view projectile per element, head right, tail left, solid chroma background) is generated
outside the repo; only the baked sheet is committed. Numeric gates here do not replace the 1x/3x eye check.
"""
import sys, colorsys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2]
SHEET = ROOT / 'unity/Assets/Exoduser/Resources/Art/vfx/field/proj_elem_orb_v3.png'
CW, CH, COLS = 512, 256, 6
HEAD, CX, CY = 124.0, 268.0, 128.0          # old sheet head 112-139 px, front edge ~x325: same hit read
LUMA = np.array([.2126, .7152, .0722], np.float32)
KEYS = {'cyan': (0, 255, 255), 'magenta': (255, 0, 255), 'green': (0, 255, 0)}
# row order = FieldBullets ElemOrbRow {F,I,D,L,H,E}; palette = VFX master 2.2 (shadow, mid, core); hue band for the check
ELEMENTS = [
    ('fire', 'cyan', '#4a1610', '#d8562a', '#ffd9a0', (0, 40)),
    ('ice', 'magenta', '#1a2a36', '#5f98c0', '#e8f3f8', (190, 216)),
    ('dark', 'green', '#170c20', '#5e3478', '#cdb2e0', (262, 292)),
    ('lightning', 'cyan', '#2e2814', '#c8a848', '#fff4d0', (35, 62)),
    ('holy', 'cyan', '#3a2c18', '#c9a45e', '#fff2d6', (28, 52)),
    ('earth', 'cyan', '#241a10', '#7e6236', '#dcc8a4', (22, 48)),
]


def hexc(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255.0


def sat_of(c):
    mx, mn = c.max(-1), c.min(-1)
    return np.where(mx > 1e-3, (mx - mn) / np.maximum(mx, 1e-3), 0)


def rgb2hsv(c):
    mx, mn = c.max(-1), c.min(-1)
    d = mx - mn
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    h = np.where(d < 1e-6, 0, np.where(mx == r, ((g - b) / np.maximum(d, 1e-6)) % 6,
                 np.where(mx == g, (b - r) / np.maximum(d, 1e-6) + 2, (r - g) / np.maximum(d, 1e-6) + 4))) * 60
    return np.stack([h % 360, np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0), mx], -1)


def hsv2rgb(hsv):
    h, s, v = hsv[..., 0] / 60, hsv[..., 1], hsv[..., 2]
    i = np.floor(h).astype(int) % 6
    f = h - np.floor(h)
    p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    sel = [np.stack(x, -1) for x in ((v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q))]
    out = np.zeros_like(hsv)
    for k in range(6):
        out = np.where((i == k)[..., None], sel[k], out)
    return out


def hue_into(hue, lo, hi):
    """nearest point of the [lo, hi] band on the hue circle"""
    if lo <= hue <= hi:
        return hue
    dl, dh = (lo - hue) % 360, (hue - hi) % 360
    return lo if dl < dh else hi


def biggest(alpha, thr=.05):
    lab, n = ndi.label(alpha > thr, np.ones((3, 3)))
    if n <= 1:
        return alpha
    sizes = ndi.sum(np.ones_like(alpha), lab, range(1, n + 1))
    return np.where(lab == np.argmax(sizes) + 1, alpha, 0)


def key_cell(raw_path, key, shadow, mid, core, band):
    """Return a 256x512 RGBA float cell with the head centred on the projectile point."""
    bg = np.array(KEYS[key], np.float32) / 255.0
    im = np.asarray(Image.open(raw_path).convert('RGB'), np.float32) / 255.0
    d = np.linalg.norm(im - bg, axis=2) / np.linalg.norm(bg)
    x = np.clip((d - .14) / (.60 - .14), 0, 1)
    a = x * x * (3 - 2 * x)
    a = ndi.gaussian_filter(ndi.grey_erosion(a, size=(7, 7)), 1.5)       # choke the key-lit rim
    col = np.clip((im - (1 - a[..., None]) * bg) / np.maximum(a, 1e-3)[..., None], 0, 1)
    # despill along the key: remove what the key channels have beyond the other channel
    on = bg > .5
    spill = np.clip(col[..., on].min(-1) - col[..., ~on].max(-1), 0, 1)
    col[..., on] -= spill[..., None]
    # edge pixels follow the element ramp by luminance
    sh, md, co = hexc(shadow), hexc(mid), hexc(core)
    L = np.clip(col @ LUMA, 0, 1)[..., None]
    ramp = np.where(L < .5, sh + (md - sh) * np.clip(L / .5, 0, 1), md + (co - md) * np.clip((L - .5) / .5, 0, 1))
    w = np.clip((.75 - a) / .55, 0, 1)[..., None]
    col = col * (1 - w) + ramp * w
    # saturation toward the palette mid (never above the source)
    body = a > .6
    target = float(sat_of(md[None])[0])
    have = float(np.median(sat_of(col[body]))) if body.any() else target
    k = float(np.clip((target + .07) / max(have, 1e-3), .6, 1.0))
    Lc = (col @ LUMA)[..., None]
    col = np.clip(Lc + (col - Lc) * k, 0, 1)
    # grey rim -> shadow colour
    g = (np.clip((.35 - sat_of(col)) / .35, 0, 1) * np.clip((.95 - a) / .6, 0, 1))[..., None]
    col = col * (1 - g) + sh * g
    # hue discipline: whole body into the element band (keeps the palette row honest, kills key-tinted rims),
    # thin edges to the mid hue, highlights no more saturated than the palette core allows (no magenta/neon cores)
    hsv = rgb2hsv(col)
    lo, hi = band
    mid_h = float(rgb2hsv(md[None])[0, 0])
    h0, l2, h2 = hsv[..., 0], lo + 3, hi - 3
    inside = (h0 >= l2) & (h0 <= h2)
    tgt = np.where(inside, h0, np.where((l2 - h0) % 360 < (h0 - h2) % 360, l2, h2))
    dh = ((tgt - hsv[..., 0] + 180) % 360) - 180
    hsv[..., 0] = (hsv[..., 0] + dh) % 360
    e = np.clip((.9 - a) / .5, 0, 1)
    dm = ((mid_h - hsv[..., 0] + 180) % 360) - 180
    hsv[..., 0] = (hsv[..., 0] + dm * e) % 360
    if 180 <= mid_h <= 320:          # cool elements only: a saturated bright core reads neon/magenta
        core_h, core_s = (float(v) for v in rgb2hsv(co[None])[0, :2])
        bright = np.clip((hsv[..., 2] - .5) / .3, 0, 1)
        dc = ((core_h - hsv[..., 0] + 180) % 360) - 180
        hsv[..., 0] = (hsv[..., 0] + dc * bright) % 360
        hsv[..., 1] = np.minimum(hsv[..., 1], core_s + .12 + (1 - bright) * .6)
    col = hsv2rgb(hsv)
    a = biggest(a)
    # head = columns whose solid height is >= 60 % of the tallest column
    solid = (a > .35).sum(0)
    cols = np.nonzero(solid >= solid.max() * .6)[0]
    rows = np.nonzero((a[:, cols.min():cols.max() + 1] > .35).any(1))[0]
    head_d = max(cols.max() - cols.min(), rows.max() - rows.min())
    hcx, hcy = (cols.min() + cols.max()) / 2, (rows.min() + rows.max()) / 2
    s = HEAD / head_d
    pm = np.dstack([col * a[..., None], a])
    nw, nh = round(im.shape[1] * s), round(im.shape[0] * s)
    small = np.asarray(Image.fromarray((pm * 255 + .5).astype(np.uint8), 'RGBA').resize((nw, nh), Image.LANCZOS), np.float32) / 255.0
    cell = np.zeros((CH, CW, 4), np.float32)
    ox, oy = round(CX - hcx * s), round(CY - hcy * s)
    sx, sy, dx, dy = max(0, -ox), max(0, -oy), max(0, ox), max(0, oy)
    w_, h_ = min(CW - dx, nw - sx), min(CH - dy, nh - sy)
    cell[dy:dy + h_, dx:dx + w_] = small[sy:sy + h_, sx:sx + w_]
    al = cell[..., 3]
    cell[..., :3] = np.where(al[..., None] > 1e-3, cell[..., :3] / np.maximum(al, 1e-3)[..., None], 0)
    al = np.where(al < .03, 0, al)
    cell[..., 3] = biggest(al)
    return np.clip(cell, 0, 1)


def frames(cell):
    """6 loop frames: the body pattern flows (colour-only warp inside the matte), core breathes +-8 %.
    The alpha (silhouette, hit read) is identical in every frame."""
    out = []
    yy, xx = np.mgrid[0:CH, 0:CW].astype(np.float32)
    inner = ndi.gaussian_filter((ndi.grey_erosion(cell[..., 3], size=(5, 5)) > .5).astype(np.float32), 2)
    core = np.exp(-(((xx - CX) / (HEAD * .22)) ** 2 + ((yy - CY) / (HEAD * .22)) ** 2))
    for f in range(COLS):
        ph = 2 * np.pi * f / COLS
        dxm = 2.0 * np.sin(yy / 9.0 + ph) * inner
        dym = 1.5 * np.sin(xx / 11.0 - ph) * inner
        rgb = np.stack([ndi.map_coordinates(cell[..., c], [yy + dym, xx + dxm], order=1, mode='nearest') for c in range(3)], -1)
        rgb = np.clip(rgb * (1 + .08 * np.sin(ph) * core)[..., None], 0, 1)
        out.append(np.dstack([rgb, cell[..., 3]]))
    return out


def build(raw_dir):
    sheet = np.zeros((CH * len(ELEMENTS), CW * COLS, 4), np.float32)
    for r, (name, key, sh, md, co, band) in enumerate(ELEMENTS):
        cell = key_cell(Path(raw_dir) / (name + '.png'), key, sh, md, co, band)
        for c, fr in enumerate(frames(cell)):
            sheet[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW] = fr
    Image.fromarray((sheet * 255 + .5).astype(np.uint8), 'RGBA').save(SHEET, optimize=True)
    print('wrote', SHEET.relative_to(ROOT))


def check():
    a = np.asarray(Image.open(SHEET).convert('RGBA'))
    assert a.shape == (CH * len(ELEMENTS), CW * COLS, 4), a.shape
    fails = []
    for r, (name, *_, band) in enumerate(ELEMENTS):
        for c in range(COLS):
            cell = a[r * CH:(r + 1) * CH, c * CW:(c + 1) * CW]
            al = cell[..., 3]
            if al.max() < 200:
                fails.append(f'{name}[{c}] empty')
            big = np.repeat(np.repeat(al, 3, 0), 3, 1)
            n = ndi.label(big > 255 * .05, np.ones((3, 3)))[1]
            if n != 1:
                fails.append(f'{name}[{c}] components={n}')
            if max(al[0].max(), al[-1].max(), al[:, 0].max(), al[:, -1].max()) > 13:
                fails.append(f'{name}[{c}] touches cell edge')
            body = cell[..., :3][al > 153].astype(np.float32) / 255
            hue = np.median([colorsys.rgb_to_hsv(*p)[0] * 360 for p in body[::max(1, len(body) // 3000)]])
            if not band[0] <= hue <= band[1]:
                fails.append(f'{name}[{c}] hue {hue:.0f} outside {band}')
            if c == 0:
                print(f'{name}: hue {hue:.0f} band {band} components {n}')
    if fails:
        print('FAIL', *fails, sep='\n  ')
        return 1
    print('PASS elem orb v3', SHEET.name, a.shape[1], 'x', a.shape[0])
    return 0


if __name__ == '__main__':
    if sys.argv[1:] == ['--check-only']:
        sys.exit(check())
    build(sys.argv[1])
    sys.exit(check())
