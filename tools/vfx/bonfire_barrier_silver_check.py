"""Pure checks for the silver startup barrier (no Unity). C:/Python314/python.exe -B tools/vfx/bonfire_barrier_silver_check.py < NUL"""
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

import recolor_bonfire_barrier as rb

ROOT = rb.ROOT
CS = ROOT / 'unity/Assets/Exoduser/Runtime/NativeLobby.StartupPresentation.cs'
fails = []


def check(ok, label):
    print(('PASS ' if ok else 'FAIL ') + label)
    if not ok:
        fails.append(label)


text = CS.read_text(encoding='utf-8')
px = np.array(Image.open(rb.DST).convert('RGBA'))
vis = px[..., 3] > 12
rgb = px[..., :3][vis].astype(float)
mx, mn = rgb.max(-1), rgb.min(-1)
sat = (mx - mn) / np.maximum(mx, 1)
r, g, b = rgb[:, 0], rgb[:, 1], rgb[:, 2]
# gold/brass/lime = yellow-orange-green hue with saturation: R>=B and G>=B*1.25 with real chroma
gold = (sat > .18) & (g > b * 1.25) & (r > b * 1.25)
check(int(gold.sum()) == 0, 'gold/brass/lime pixels = 0 (found %d)' % int(gold.sum()))
red_dom = (sat > .5) & (r > g * 2) & (r > b * 2)
check(rgb[red_dom, 0].max() <= 0xb0 if red_dom.any() else True, 'crimson R stays <= #b0 (max R %d)' % (rgb[red_dom, 0].max() if red_dom.any() else 0))
check(red_dom.any(), 'crimson inner band exists (%d px)' % int(red_dom.sum()))
chromatic = sat > .18
check(bool(np.all(r[chromatic] >= g[chromatic] * 1.2)) and bool(np.all(r[chromatic] >= b[chromatic])), 'every chromatic pixel is red-dominant (silver/crimson only)')
check(px[..., :3][vis].max() <= 0xe6, 'channel peak <= #e6 (%d)' % px[..., :3][vis].max())
# dome shell alpha
h, w = px.shape[:2]
yy, xx = np.mgrid[0:h, 0:w].astype(float)
nx = (xx - rb.CX) / rb.RX
edge = rb.CY - rb.RY * np.sqrt(np.clip(1 - nx * nx, 0, 1))
dome = (yy < edge - 14)
check(px[..., 3][dome].max() / 255 <= .18 + .005, 'dome shell alpha <= .18 (%.3f)' % (px[..., 3][dome].max() / 255))
hero = (np.abs(xx - rb.CX) <= rb.HERO_HALF_W * .7) & (yy >= rb.HERO_TOP) & (yy <= rb.HERO_BOTTOM)
check(px[..., 3][hero].max() / 255 <= .12 + .005, 'hero body column alpha <= .12 (%.3f)' % (px[..., 3][hero].max() / 255))
# code constants
size = float(re.search(r'BarrierSize=([\d.]+)', text).group(1))
alpha = float(re.search(r'BarrierAlpha=([\d.]+)f', text).group(1))
ring_old = 560 * 1110 / 1536
ring_new = size * 1.03 * 1110 / 1536
check(size / 560 <= .6, 'size ratio %.3f <= .6' % (size / 560))
check(ring_new <= 240, 'ring diameter with pulse %.1f px <= 240' % ring_new)
check(alpha <= .6, 'overlay alpha %.2f' % alpha)
check('BarrierLegacyQa?"Art/Startup/bonfire_barrier":"Art/Startup/bonfire_barrier_silver"' in text, 'code loads the silver sheet unless the QA legacy flag is set')
check(subprocess.run([sys.executable, '-B', str(Path(__file__).with_name('recolor_bonfire_barrier.py')), '--check-only'], stdin=subprocess.DEVNULL).returncode == 0, 'recolor --check-only identical')
print('failures', len(fails))
sys.exit(1 if fails else 0)
