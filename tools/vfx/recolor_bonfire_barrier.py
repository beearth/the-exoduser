"""Startup guide barrier (bonfire_barrier) -> Silver Hell palette copy; no generation, no Unity, no source edits.

C:/Python314/python.exe -B tools/vfx/recolor_bonfire_barrier.py < NUL
C:/Python314/python.exe -B tools/vfx/recolor_bonfire_barrier.py --check-only < NUL

Reads Resources/Art/Startup/bonfire_barrier.png (gold original, left untouched) and writes
bonfire_barrier_silver.png:
  silver #dfe3e6..#b9c0c6 for rim, runes, outer nodes and the centre star,
  crimson #7a1e22..#a8302f for one inner ring band (the pulse band),
  dome shell alpha scaled to <= .18 of the original, hero body column alpha capped,
  speckle islands removed (no dots), luminance peak capped. No grain, no dither.
"""
import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2]
DIR = ROOT / 'unity/Assets/Exoduser/Resources/Art/Startup'
SRC = DIR / 'bonfire_barrier.png'
DST = DIR / 'bonfire_barrier_silver.png'
WEIGHTS = np.array([.2126, .7152, .0722])

SILVER_LO, SILVER_HI = np.array([0xb9, 0xc0, 0xc6], float), np.array([0xdf, 0xe3, 0xe6], float)
SILVER_SHADOW = np.array([0x30, 0x34, 0x38], float)
CRIMSON_LO, CRIMSON_HI = np.array([0x7a, 0x1e, 0x22], float), np.array([0xa8, 0x30, 0x2f], float)
CRIMSON_SHADOW = np.array([0x2a, 0x0a, 0x0c], float)

# Ellipse of the circle inside the 1536x1024 sheet (measured from the rim).
CX, CY, RX, RY = 770.0, 645.0, 560.0, 290.0
CRIMSON_BAND = (.28, .46)     # elliptical radius of the single inner crimson band
DOME_ALPHA = .18              # dome shell alpha ceiling (texture alpha, drawn at 1.0)
TEXTURE_PEAK = .90            # silver ramp is entered only up to this t
SPECK_PIXELS = 700            # connected alpha islands smaller than this are removed
FRINGE_R = .80                # elliptical radius from which the rim fringe is rebuilt as one continuous soft line
OPEN_RADIUS = 9               # grey opening radius (px): features thinner than 2*radius (sparks, tendrils) vanish
SOFT_SIGMA = 2.2              # soft edge of the rebuilt rim line
SILVER_ALPHA = .60            # silver part drawn at .5 * .6 = .3 overlay alpha; crimson keeps 1.0 (= .5 overlay)

# hero body column (texture px): the lesson hero stands at the sheet centre; alpha <= .12 inside
HERO_HALF_W, HERO_TOP, HERO_BOTTOM, HERO_ALPHA = 190.0, 215.0, 690.0, .12


def smooth(x, lo, hi):
    t = np.clip((x - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def build(src):
    h, w = src.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    nx, ny = (xx - CX) / RX, (yy - CY) / RY
    r = np.sqrt(nx * nx + ny * ny)
    alpha = src[..., 3].astype(float) / 255
    # speckle: drop tiny alpha islands (spark dust around the rim)
    labels, count = ndi.label(alpha > .04, structure=np.ones((3, 3)))
    sizes = np.bincount(labels.ravel())
    small = np.isin(labels, np.nonzero(sizes < SPECK_PIXELS)[0]) & (labels > 0)
    alpha[small] = 0
    # rim fringe: replace spark/tendril particles by a continuous soft line (grey opening + gaussian), no point particles
    disk = (np.hypot(*np.mgrid[-OPEN_RADIUS:OPEN_RADIUS + 1, -OPEN_RADIUS:OPEN_RADIUS + 1]) <= OPEN_RADIUS)
    opened = ndi.grey_dilation(ndi.grey_erosion(alpha, footprint=disk), footprint=disk)
    opened = ndi.gaussian_filter(opened, SOFT_SIGMA)
    fringe = smooth(r, FRINGE_R, FRINGE_R + .04)
    alpha = alpha * (1 - fringe) + np.minimum(alpha, opened) * fringe
    alpha *= 1 - smooth(r, 1.04, 1.10)   # dust outside the ring fades out
    lab2, n2 = ndi.label(alpha > .1, structure=np.ones((3, 3)))
    sz2 = np.bincount(lab2.ravel())
    for i in range(1, n2 + 1):   # leftover tiny islands on the rim fringe
        if sz2[i] < 120 and r[lab2 == i].mean() > .88:
            alpha[lab2 == i] = 0
    # dome shell = everything above the upper edge of the ellipse
    edge = CY - RY * np.sqrt(np.clip(1 - nx * nx, 0, 1))
    dome = 1 - smooth(yy, edge - 12, edge + 6)
    alpha *= 1 - dome * (1 - DOME_ALPHA)
    # hero column
    hx = 1 - smooth(np.abs(xx - CX), HERO_HALF_W * .7, HERO_HALF_W)
    hy = smooth(yy, HERO_TOP - 40, HERO_TOP) * (1 - smooth(yy, HERO_BOTTOM, HERO_BOTTOM + 40))
    hero = hx * hy
    alpha = np.minimum(alpha, 1 - hero * (1 - HERO_ALPHA))
    # luminance -> ramps
    light = src[..., :3].astype(float) @ WEIGHTS / 255
    peak = light[src[..., 3] > 12].max()
    t = np.clip(light / peak, 0, 1) ** 1.35 * TEXTURE_PEAK
    def ramp(shadow, lo, hi):
        a = np.clip(t / .55, 0, 1)[..., None]
        b = np.clip((t - .55) / .45, 0, 1)[..., None]
        base = shadow + a * (lo - shadow)
        return base + b * (hi - lo)
    silver, crimson = ramp(SILVER_SHADOW, SILVER_LO, SILVER_HI), ramp(CRIMSON_SHADOW, CRIMSON_LO, CRIMSON_HI)
    wc = (smooth(r, CRIMSON_BAND[0] - .04, CRIMSON_BAND[0] + .02) * (1 - smooth(r, CRIMSON_BAND[1] - .02, CRIMSON_BAND[1] + .04)))[..., None]
    rgb = silver * (1 - wc) + crimson * wc
    out = np.zeros((h, w, 4), np.uint8)
    out[..., :3] = np.clip(rgb.round(), 0, 255).astype(np.uint8)
    alpha = alpha * (SILVER_ALPHA * (1 - wc[..., 0]) + wc[..., 0])
    out[..., 3] = np.clip((alpha * 255).round(), 0, 255).astype(np.uint8)
    out[out[..., 3] == 0, :3] = 0
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-only', action='store_true', help='compare bytes; never write')
    args = parser.parse_args()
    out = build(np.array(Image.open(SRC).convert('RGBA')))
    img = Image.fromarray(out, 'RGBA')
    if args.check_only:
        if not DST.exists():
            print('MISSING', DST)
            return 1
        same = np.array_equal(np.array(Image.open(DST).convert('RGBA')), out)
        print('OK identical' if same else 'DIFFERENT')
        return 0 if same else 1
    img.save(DST, optimize=False)
    print('wrote', DST, out.shape)
    return 0


if __name__ == '__main__':
    sys.exit(main())
