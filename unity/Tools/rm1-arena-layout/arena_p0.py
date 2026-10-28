# A1 RM1 arena P0 -- port of Core BossArenaLayout.Generate(si=0) + pillar / channel / wedge numbers. No Unity.
# Source of truth for the port: unity/Assets/Exoduser/Runtime/Core/BossArena.cs (circle branch) and DruidBoss.Pillars.cs.
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw

OUT = sys.argv[1]
W, H, T = 128, 108, 40


def generate():
    mw, mh = W, H
    m = np.ones((mh, mw), dtype=np.int8)
    cx, cy = mw // 2, mh // 2
    il, it, ir, ib = 2, 2, mw - 2, mh - 2
    rr = min(ir - il, ib - it) / 2.0 - 1
    for y in range(it, ib):
        for x in range(il, ir):
            if (x - cx) ** 2 + (y - cy) ** 2 <= rr * rr:
                m[y, x] = 4
    before_entry = m.copy()
    ent_y = ib - 3
    for dy in range(-2, 2):
        for dx in range(-3, 4):
            ty, tx = ent_y + dy, cx + dx
            if 0 <= ty < mh and 0 <= tx < mw:
                m[ty, tx] = 4
    entry_added = int((m != before_entry).sum())
    before_boss = m.copy()
    for dy in range(-2, 3):
        for dx in range(-3, 4):
            ty, tx = cy + dy, cx + dx
            if 0 <= ty < mh and 0 <= tx < mw and m[ty, tx] == 1:
                m[ty, tx] = 4
    boss_added = int((m != before_boss).sum())
    exit_y = it
    for y in range(it, cy):
        if m[y, cx] == 4:
            exit_y = y - 1
            break
    if exit_y < 1:
        exit_y = 1
    for y in range(it, ib):
        for x in range(il, ir):
            if m[y, x] != 4:
                continue
            if (y > 0 and m[y - 1, x] == 1) or (y < mh - 1 and m[y + 1, x] == 1) or (x > 0 and m[y, x - 1] == 1) or (x < mw - 1 and m[y, x + 1] == 1):
                m[y, x] = 5
    return m, dict(cx=cx, cy=cy, il=il, it=it, ir=ir, ib=ib, rr=rr, exit_x=cx, exit_y=exit_y, entry_x=cx, entry_y=ent_y,
                   boss_x=cx, boss_y=cy, entry_added=entry_added, boss_added=boss_added)


tiles, L = generate()
walk = tiles != 1
n_wall, n_floor, n_rune = int((tiles == 1).sum()), int((tiles == 4).sum()), int((tiles == 5).sum())

# Core arena centre (DruidBoss.ArenaCx/Cy = ArenaW/2, ArenaH/2) and radius (min(W,H)/2 - 3 tiles)
ARENA_W, ARENA_H = W * T, H * T
ACX, ACY = ARENA_W / 2, ARENA_H / 2
AR = min(ARENA_W, ARENA_H) / 2 - 3 * T
PILLAR_N, PILLAR_RING, PILLAR_R, PILLAR_START = 4, 0.55, 80.0, 45.0
pillars = []
for k in range(PILLAR_N):
    a = math.radians(PILLAR_START + 360.0 * k / PILLAR_N)
    px, py = ACX + math.cos(a) * AR * PILLAR_RING, ACY + math.sin(a) * AR * PILLAR_RING
    # footprint tiles all walkable?
    ok = True
    for ang in range(0, 360, 5):
        qx, qy = px + math.cos(math.radians(ang)) * PILLAR_R, py + math.sin(math.radians(ang)) * PILLAR_R
        if not walk[int(qy // T), int(qx // T)]:
            ok = False
    pillars.append(dict(index=k, deg=PILLAR_START + 360.0 * k / PILLAR_N, px=round(px, 3), py=round(py, 3), radius_px=PILLAR_R,
                        unity_x=round(px / 100, 4), unity_z=round(-py / 100, 4), unity_radius=PILLAR_R / 100, footprint_on_walk_tiles=ok,
                        dir=["SE", "SW", "NW", "NE"][k]))

# ---- distance (px) from a point to the nearest walkable tile rectangle, evaluated on a 10 px grid over the world around the grid
RES = 10
PAD = 400  # px beyond the Core grid, the outer forest lives out there
X0, Y0 = -PAD, -PAD
GW, GH = (ARENA_W + 2 * PAD) // RES, (ARENA_H + 2 * PAD) // RES
xs = X0 + (np.arange(GW) + 0.5) * RES
ys = Y0 + (np.arange(GH) + 0.5) * RES
# boundary walkable tiles only (a walkable tile with a wall 4-neighbour)
edge = []
for ty in range(H):
    for tx in range(W):
        if not walk[ty, tx]:
            continue
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = ty + dy, tx + dx
            if ny < 0 or ny >= H or nx < 0 or nx >= W or not walk[ny, nx]:
                edge.append((tx, ty))
                break
dist = np.full((GH, GW), 1e9, dtype=np.float32)
for (tx, ty) in edge:
    rx0, rx1, ry0, ry1 = tx * T, tx * T + T, ty * T, ty * T + T
    dx = np.maximum(np.maximum(rx0 - xs, xs - rx1), 0)[None, :]
    dy = np.maximum(np.maximum(ry0 - ys, ys - ry1), 0)[:, None]
    np.minimum(dist, np.sqrt(dx * dx + dy * dy), out=dist)
# cells inside walkable tiles get 0 (rect distance already 0 there)
XX, YY = np.meshgrid(xs, ys)
RAD_ARENA = np.sqrt((XX - ACX) ** 2 + (YY - ACY) ** 2)
inside_walk = np.zeros((GH, GW), dtype=bool)
gx = ((XX - 0) // T).astype(int)
gy = ((YY - 0) // T).astype(int)
inb = (gx >= 0) & (gx < W) & (gy >= 0) & (gy < H)
inside_walk[inb] = walk[gy[inb], gx[inb]]

# ---- channel: spec annulus r 2060..2200 about the Core arena centre, and the recommended staircase-offset band (20..160 px outside the walkable tiles)
BAND_IN, BAND_OUT = 20.0, 160.0
GAP_HALF = 200.0
GAP_CX = L["entry_x"] * T + T / 2  # 2580
gap_mask = (np.abs(XX - GAP_CX) <= GAP_HALF)  # entry (south) and exit (north) gap; the middle is floor anyway
spec_ring = (RAD_ARENA >= 2060) & (RAD_ARENA <= 2200)
spec_on_walk = spec_ring & (dist < 1.0)
spec_touch_lip = spec_ring & (dist < BAND_IN) & ~inside_walk
spec_ring_cells = int(spec_ring.sum())
band = (dist >= BAND_IN) & (dist <= BAND_OUT) & ~inside_walk
band_gapped = band & ~gap_mask
band_on_walk = band & inside_walk  # zero by construction
# spec ring vs recommended band: how far apart (px) the spec ring is from the walkable edge, per direction
dirs = {}
for name, ang in (("E", 0), ("SE", 45), ("S", 90), ("SW", 135), ("W", 180), ("NW", 225), ("N", 270), ("NE", 315)):
    c, s = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    last = None
    for r in range(1800, 2400):
        x, y = ACX + c * r, ACY + s * r
        gxx, gyy = int(x // T), int(y // T)
        if 0 <= gxx < W and 0 <= gyy < H and walk[gyy, gxx]:
            last = r
    dirs[name] = last  # farthest walkable radius along that ray from the Core arena centre
# per ray, distance from arena centre to the inside edge of the recommended band == farthest walkable + 20 (ray, approx)

# ---- sight wedge: camera sits south of the map (world -z), pitch 0.85 rad. A wall mass at distance D (u) in front (south) of the nearest walkable cell north of it
TAN = math.tan(0.85)
wedge_bins = [dict(D_u=round(D, 2), hmax_wedge_u=round(0.9 + TAN * D, 3)) for D in (0.0, 0.2, 0.4, 0.8, 1.2, 1.6, 2.4, 3.2, 4.8, 6.4)]
# wall tiles that have a walkable tile within 16 tiles to their north in the same column
wedge_tiles = 0
wedge_dist_hist = {}
for tx in range(W):
    for ty in range(H):
        if walk[ty, tx]:
            continue
        for k in range(1, 17):
            ny = ty - k  # north = smaller row index
            if ny < 0:
                break
            if walk[ny, tx]:
                wedge_tiles += 1
                wedge_dist_hist[k] = wedge_dist_hist.get(k, 0) + 1
                break

centre_tile_px = (L["cx"] * T + T / 2, L["cy"] * T + T / 2)
result = dict(
    source="Core BossArenaLayout.Generate(0) ported 1:1 (python, no Unity) + DruidBoss.Pillars.cs placement; unity = x px/100, z -py/100 (same rule as RM1_Slice)",
    grid=dict(width=W, height=H, tile_px=T, world_px=[ARENA_W, ARENA_H], unity_world_u=[ARENA_W / 100, ARENA_H / 100], tile_u=T / 100),
    tiles=dict(wall=n_wall, floor=n_floor, rune=n_rune, walkable=n_floor + n_rune),
    circle=dict(centre_tile=[L["cx"], L["cy"]], radius_tiles=L["rr"], centre_of_tile_px=list(centre_tile_px), core_arena_centre_px=[ACX, ACY],
                offset_between_the_two_px=[centre_tile_px[0] - ACX, centre_tile_px[1] - ACY], core_arena_radius_px=AR,
                unity_core_arena_centre=[ACX / 100, -ACY / 100], farthest_walkable_radius_from_core_centre_px=dirs),
    entry=dict(tiles_x=[L["entry_x"] - 3, L["entry_x"] + 3], tiles_y=[L["entry_y"] - 2, L["entry_y"] + 1], px_x=[(L["entry_x"] - 3) * T, (L["entry_x"] + 4) * T],
               px_y=[(L["entry_y"] - 2) * T, (L["entry_y"] + 2) * T], tiles_added_to_floor=L["entry_added"],
               note="entry rectangle lies fully inside the 51-tile circle: it adds 0 tiles, there is no corridor in the Core data"),
    boss_spot=dict(tile=[L["boss_x"], L["boss_y"]], tiles_added_to_floor=L["boss_added"]),
    exit=dict(x_tile=L["exit_x"], y_tile=L["exit_y"], px_centre=[L["exit_x"] * T + T / 2, L["exit_y"] * T + T / 2],
              unity=[round((L["exit_x"] * T + T / 2) / 100, 3), round(-(L["exit_y"] * T + T / 2) / 100, 3)],
              note="Rebuild() opens |tx-exitX|<=1 at row ExitY (3 tiles wide); read ExitY from Generate, never hard-code"),
    pillars=dict(count=PILLAR_N, ring_fraction=PILLAR_RING, ring_radius_px=AR * PILLAR_RING, start_deg=PILLAR_START, radius_px=PILLAR_R,
                 positions=pillars, tolerance_px=8, rise=dict(param="_Rise", underground=0.0, risen=1.0, note="Timeline (boss side) drives it")),
    channel=dict(
        spec_annulus_px=[2060, 2200], spec_annulus_about=[ACX, ACY],
        spec_annulus_cells_10px=spec_ring_cells,
        spec_annulus_cells_on_walkable_tiles=int(spec_on_walk.sum()),
        spec_annulus_cells_closer_than_20px_to_walkable=int(spec_touch_lip.sum()),
        recommended=dict(rule="band of wall-side points whose distance to the nearest walkable tile rectangle is 20..160 px (follows the tile staircase)",
                         inner_px=BAND_IN, outer_px=BAND_OUT, cells_10px=int(band.sum()), cells_after_gaps=int(band_gapped.sum()),
                         cells_on_walkable_tiles=int(band_on_walk.sum()),
                         gap=dict(centre_x_px=GAP_CX, half_width_px=GAP_HALF, applies_to="entry (south) and exit (north)")),
        width_px=BAND_OUT - BAND_IN, material="Remodel/CH1_1/Materials/M_ToxicFlow.mat (shader EXODUSER/ToxicFlow)",
        level_param=dict(name="_Level", range=[0.0, 1.0], note="0 = P1/P2 low water, 1 = P3 high; height only, no collision change; Timeline connection is boss side")),
    outside=dict(layers=["lip (0..20 px, low mass, roots rim, h<=0.9u)", "channel (20..160 px)", "thorn forest x3 (>160 px)"],
                 grid_margin_px=dict(north=int(min(np.where(walk.any(axis=1))[0]) * T), south=int((H - 1 - max(np.where(walk.any(axis=1))[0])) * T),
                                     west=int(min(np.where(walk.any(axis=0))[0]) * T), east=int((W - 1 - max(np.where(walk.any(axis=0))[0])) * T),
                                     note="north and south the walkable disc is only 120 / 80 px from the grid edge (west / east 520 / 480): channel and forest must extend beyond the Core grid in world space"),
                 wedge=dict(pitch_rad=0.85, tan=round(TAN, 4), rule="h <= 0.9 + tan(0.85) * D, D = distance (u) from the wall mass north to the nearest walkable cell",
                            table=wedge_bins, wall_tiles_with_walkable_within_16_tiles_north=wedge_tiles,
                            note="RM1 field used the stricter flat 0.9u for the camera-side mass; the arena spec asks for the wedge formula")),
)
with open(OUT + "/rm1_arena_layout.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=1)

# ---- top-down picture, 1/4 scale, world from -PAD to size+PAD
S = 4
IW, IH = (ARENA_W + 2 * PAD) // S, (ARENA_H + 2 * PAD) // S
img = Image.new("RGB", (IW, IH), (14, 14, 18))
d = ImageDraw.Draw(img, "RGBA")


def P(x, y):
    return ((x - X0) / S, (y - Y0) / S)


for ty in range(H):
    for tx in range(W):
        v = tiles[ty, tx]
        if v == 1:
            continue
        c = (62, 40, 32) if v == 4 else (120, 58, 34)
        x0, y0 = P(tx * T, ty * T)
        d.rectangle([x0, y0, x0 + T / S, y0 + T / S], fill=c)
# recommended band
bm = (band_gapped.astype(np.uint8) * 255)
bimg = Image.fromarray(bm, "L").resize((IW, IH), Image.NEAREST)
img.paste(Image.new("RGB", (IW, IH), (92, 82, 12)), (0, 0), bimg)
# gaps
for (gx0, gx1) in ((GAP_CX - GAP_HALF, GAP_CX + GAP_HALF),):
    for yy0, yy1 in ((ACY + 1900, ACY + 2300), (ACY - 2300, ACY - 1900)):
        a = P(gx0, yy0)
        b = P(gx1, yy1)
        d.rectangle([a[0], a[1], b[0], b[1]], outline=(255, 255, 255, 140))
# spec annulus (thin magenta) -- shows where the spec ring sits against the staircase
for r in (2060, 2200):
    a, b = P(ACX - r, ACY - r), P(ACX + r, ACY + r)
    d.ellipse([a[0], a[1], b[0], b[1]], outline=(220, 40, 200, 200))
# world grid border
a, b = P(0, 0), P(ARENA_W, ARENA_H)
d.rectangle([a[0], a[1], b[0], b[1]], outline=(90, 90, 100, 255))
# entry rect + exit
ex0, ey0 = P((L["entry_x"] - 3) * T, (L["entry_y"] - 2) * T)
ex1, ey1 = P((L["entry_x"] + 4) * T, (L["entry_y"] + 2) * T)
d.rectangle([ex0, ey0, ex1, ey1], outline=(60, 220, 90, 255), width=2)
xa, ya = P((L["exit_x"] - 1) * T, L["exit_y"] * T)
xb, yb = P((L["exit_x"] + 2) * T, (L["exit_y"] + 1) * T)
d.rectangle([xa, ya, xb, yb], outline=(255, 150, 40, 255), width=2)
# pillars (visual footprint 80px) + Core centre cross
for p in pillars:
    cx_, cy_ = P(p["px"], p["py"])
    r = PILLAR_R / S
    d.ellipse([cx_ - r, cy_ - r, cx_ + r, cy_ + r], fill=(223, 214, 194, 255), outline=(200, 40, 30, 255), width=2)
    d.text((cx_ + r + 3, cy_ - 5), "P%d %s" % (p["index"], p["dir"]), fill=(223, 214, 194, 255))
cc = P(ACX, ACY)
d.line([cc[0] - 8, cc[1], cc[0] + 8, cc[1]], fill=(255, 255, 255, 255))
d.line([cc[0], cc[1] - 8, cc[0], cc[1] + 8], fill=(255, 255, 255, 255))
# legend
lg = ["A1 RM1 arena top-down (1px = 4 world px). tiles: floor brown / rune rim orange",
      "olive = recommended channel band (20..160 px outside walkable tiles, gaps at entry/exit)",
      "magenta = spec annulus r 2060 / 2200 about Core centre | green = entry rect | orange = exit | cream = pillars (r 80)"]
for i, t in enumerate(lg):
    d.text((10, 8 + 14 * i), t, fill=(223, 214, 194, 255))
img.save(OUT + "/rm1_arena_top.png")
print(json.dumps({k: result[k] for k in ("tiles", "entry", "boss_spot", "exit")}, ensure_ascii=False))
print("circle", json.dumps(result["circle"]))
print("channel", json.dumps({k: v for k, v in result["channel"].items() if k != "recommended"}))
print("recommended", json.dumps(result["channel"]["recommended"]))
print("outside", json.dumps(result["outside"]["grid_margin_px"]), "wedge tiles", wedge_tiles)
print("pillars", [(p["dir"], p["px"], p["py"], p["footprint_on_walk_tiles"]) for p in pillars])
