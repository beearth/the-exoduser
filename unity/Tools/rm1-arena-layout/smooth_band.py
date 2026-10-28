# A1 arena: smooth inner edge of the channel band: polar envelope of walkable tile extents about the tile-circle centre (2580,2180).
import math, sys
import numpy as np
W, H, T = 128, 108, 40
tiles = np.ones((H, W), dtype=np.int8)
cx, cy = 64, 54
for y in range(2, H - 2):
    for x in range(2, W - 2):
        if (x - cx) ** 2 + (y - cy) ** 2 <= 51 * 51:
            tiles[y, x] = 4
walk = tiles != 1
C = (cx * T + T / 2, cy * T + T / 2)
N = 720
rmax = np.zeros(N)
for ty in range(H):
    for tx in range(W):
        if not walk[ty, tx]:
            continue
        for (px, py) in ((tx * T, ty * T), (tx * T + T, ty * T), (tx * T, ty * T + T), (tx * T + T, ty * T + T)):
            dx, dy = px - C[0], py - C[1]
            r = math.hypot(dx, dy)
            a = math.atan2(dy, dx) % (2 * math.pi)
            i = int(a / (2 * math.pi) * N) % N
            rmax[i] = max(rmax[i], r)
# every bin must be covered by an outer extent at least as large as the staircase corner in neighbouring bins (a corner affects its own bin; use +-2 bin max filter then box smooth)
k = 6
env = np.array([max(rmax[(i + j) % N] for j in range(-k, k + 1)) for i in range(N)])
sm = np.array([env[[(i + j) % N for j in range(-12, 13)]].mean() for i in range(N)])
sm = np.maximum(sm, rmax)  # never inside a corner
# worst-case: smoothed envelope vs raw corner extent
print("rmax min/max", rmax[rmax > 0].min(), rmax.max())
print("smooth min/max", sm.min(), sm.max())
print("max(sm - rmax)", (sm - rmax).max(), "mean gap", (sm - rmax).mean())
# second-difference roughness of the smoothed curve (px per bin^2)
d2 = np.abs(sm - 2 * np.roll(sm, 1) + np.roll(sm, -1))
print("max 2nd diff (px/bin^2)", d2.max(), "raw", np.abs(rmax - 2 * np.roll(rmax, 1) + np.roll(rmax, -1)).max())
# fixed circle alternative
print("circle R containing all corners about", C, "=", rmax.max())
