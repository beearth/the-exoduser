# Visual QA for CH1_MASTER_16x9.jpg — no image rewrite of the master
import json, os
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(r"G:\exoduser")
SRC = ROOT / "assets/map/ch1/master/CH1_MASTER_16x9.jpg"
FIELD = ROOT / "assets/map/ch1/master/CH1_FIELD_ONE.png"
OUT = Path(__file__).resolve().parent
OUT.mkdir(parents=True, exist_ok=True)

im = Image.open(SRC).convert("RGB")
W, H = im.size
arr = np.asarray(im, dtype=np.int16)
R, G, B = arr[:,:,0], arr[:,:,1], arr[:,:,2]
L = (0.2126*R + 0.7152*G + 0.0722*B)
mx = np.maximum(np.maximum(R, G), B)
mn = np.minimum(np.minimum(R, G), B)
sat = np.where(mx > 0, (mx - mn) / mx.astype(np.float32), 0.0)

# --- classification (heuristic, documented) ---
# swamp: green-dominant olive/toxic water
swamp = (G > R + 8) & (G > B + 8) & (G > 55) & (L < 140)
# bone: pale cream
bone = (L > 145) & (sat < 0.28) & (R > 140) & (G > 120)
# hellfire / lava cracks
fire = (R > 120) & (R > G + 25) & (R > B + 40) & (L > 40)
# tree / dark silhouette (very dark, not dirt)
dark = (L < 38) & ~swamp
# shrine-ish: mid stone + red cavity already in fire/dark
# dirt/playable: remaining mid-low brown/gray, not swamp/bone/tree
dirt = ~swamp & ~bone & ~dark & (L > 28) & (L < 145)

# refine dirt: exclude obvious fence sticks (thin bright) already in bone
playable = dirt.copy()

n = W * H
def pct(mask):
    return float(mask.mean() * 100.0)

# center 65% / 70% boxes (area)
def center_box(frac):
    # frac = linear scale so area ~= frac? user asked area 65-70%.
    # Use a box whose area is `frac` of image: side scale = sqrt(frac)
    s = np.sqrt(frac)
    cw, ch = int(W * s), int(H * s)
    x0, y0 = (W - cw)//2, (H - ch)//2
    return x0, y0, x0+cw, y0+ch

# visual basin: largest connected-ish dirt in middle — use ellipse fit by dirt density
# scan concentric ellipses
def ellipse_dirt_frac(rx, ry):
    yy, xx = np.ogrid[:H, :W]
    m = ((xx - W/2)**2) / (rx*rx) + ((yy - H/2)**2) / (ry*ry) <= 1
    return pct(playable[m]), pct(m), m

best = None
for ry in range(int(H*0.28), int(H*0.48), 4):
    for rx in range(int(W*0.30), int(W*0.48), 6):
        dfrac, apct, m = ellipse_dirt_frac(rx, ry)
        # want ellipse mostly dirt, area near 65-70
        score = -abs(apct - 67.5) + (dfrac - 80) * 0.15
        if best is None or score > best[0]:
            best = (score, rx, ry, dfrac, apct, m)

# invasion: large structures inside inner 50% box
ix0, iy0, ix1, iy1 = int(W*0.25), int(H*0.25), int(W*0.75), int(H*0.75)
inner = np.zeros((H, W), dtype=bool)
inner[iy0:iy1, ix0:ix1] = True
inner_nonplay = inner & ~playable
inner_bone = inner & bone
inner_swamp = inner & swamp
inner_dark = inner & dark
inner_fire = inner & fire

# vignette: corner 8% boxes vs center 20%
cw, ch = int(W*0.08), int(H*0.08)
corners = {
    "TL": L[:ch, :cw].mean(),
    "TR": L[:ch, -cw:].mean(),
    "BL": L[-ch:, :cw].mean(),
    "BR": L[-ch:, -cw:].mean(),
}
cen = L[int(H*0.4):int(H*0.6), int(W*0.4):int(W*0.6)].mean()
edge_strip = np.concatenate([
    L[:int(H*0.04), :].ravel(),
    L[-int(H*0.04):, :].ravel(),
    L[:, :int(W*0.04)].ravel(),
    L[:, -int(W*0.04):].ravel(),
]).mean()

# 2x2 crop / reassemble
hw, hh = W//2, H//2
quads = {
    "NW": im.crop((0, 0, hw, hh)),
    "NE": im.crop((hw, 0, W, hh)),
    "SW": im.crop((0, hh, hw, H)),
    "SE": im.crop((hw, hh, W, H)),
}
canvas = Image.new("RGB", (W, H))
canvas.paste(quads["NW"], (0, 0))
canvas.paste(quads["NE"], (hw, 0))
canvas.paste(quads["SW"], (0, hh))
canvas.paste(quads["SE"], (hw, hh))
diff = np.abs(np.asarray(canvas, dtype=np.int16) - np.asarray(im, dtype=np.int16))
max_diff = int(diff.max())
mean_diff = float(diff.mean())
n_mismatch = int((diff.sum(axis=2) > 0).sum())

# content seam along midlines (not crop math — visual discontinuity)
vseam = arr[:, hw-2:hw+2, :].astype(np.float32)
hseam = arr[hh-2:hh+2, :, :].astype(np.float32)
v_jump = float(np.abs(arr[:, hw-1].astype(np.float32) - arr[:, hw].astype(np.float32)).mean())
h_jump = float(np.abs(arr[hh-1].astype(np.float32) - arr[hh].astype(np.float32)).mean())
# typical neighbor jump for comparison
v_typ = float(np.abs(arr[:, W//3].astype(np.float32) - arr[:, W//3+1].astype(np.float32)).mean())
h_typ = float(np.abs(arr[H//3].astype(np.float32) - arr[H//3+1].astype(np.float32)).mean())

for name, q in quads.items():
    q.save(OUT / f"crop_{name}.jpg", quality=95)
canvas.save(OUT / f"reassembled.jpg", quality=95)

# overlay mask preview
ov = arr.copy().astype(np.uint8)
ov[swamp] = (40, 90, 50)
ov[playable] = (90, 80, 70)
ov[bone] = (200, 190, 160)
ov[dark] = (20, 10, 10)
ov[fire] = (180, 50, 20)
Image.fromarray(ov).save(OUT / "class_mask.jpg", quality=90)

# FIELD_ONE comparison
field_info = None
if FIELD.exists():
    fim = Image.open(FIELD).convert("RGB")
    fw, fh = fim.size
    fa = np.asarray(fim, dtype=np.int16)
    fR, fG, fB = fa[:,:,0], fa[:,:,1], fa[:,:,2]
    fL = 0.2126*fR + 0.7152*fG + 0.0722*fB
    fsw = (fG > fR + 6) & (fG > fB + 4) & (fG > 45) & (fL < 150)
    fdark = (fL < 38) & ~fsw
    fdirt = ~fsw & ~fdark & (fL > 35) & (fL < 160)
    field_info = {
        "px": [fw, fh],
        "ar": round(fw/fh, 6),
        "dirt_pct": round(float(fdirt.mean()*100), 2),
        "swamp_pct": round(float(fsw.mean()*100), 2),
        "dark_pct": round(float(fdark.mean()*100), 2),
        "bytes": FIELD.stat().st_size,
        "rgba_mb": round(fw*fh*4/1024/1024, 3),
    }

# kit field walkable tiles (from game.html _buildKitFieldTest)
mw, mh = 36, 27
cx, cy, rx, ry = 18, 13, 14, 9
walk = 0
for y in range(1, mh-1):
    for x in range(1, mw-1):
        dx, dy = x-cx, y-cy
        if (dx*dx)/(rx*rx) + (dy*dy)/(ry*ry) <= 1:
            walk += 1
for y in range(13, 26):
    for x in range(12, 22):
        walk += 1  # may double-count; use set
# recount with set
cells = set()
for y in range(1, mh-1):
    for x in range(1, mw-1):
        dx, dy = x-cx, y-cy
        if (dx*dx)/(rx*rx) + (dy*dy)/(ry*ry) <= 1:
            cells.add((x,y))
for y in range(13, 26):
    for x in range(12, 22):
        cells.add((x,y))
for y in range(2, 14):
    for x in range(18, 28):
        cells.add((x,y))
kit_walk = len(cells)
kit_total = mw * mh
kit_walk_px = kit_walk * 40 * 40

# production 200x200 field: walkable ~ interior minus rim. Approximate 190x190 if 5-tile wall
prod_tiles = 200*200
prod_walk_est = 190*190  # typical open field with thin wall
prod_walk_px = prod_walk_est * 40 * 40

report = {
    "file": str(SRC),
    "bytes": SRC.stat().st_size,
    "px": [W, H],
    "ar": round(W/H, 6),
    "ar_16_9": round(16/9, 6),
    "format": "JPEG 24bpp",
    "class_pct": {
        "playable_dirt": round(pct(playable), 2),
        "swamp": round(pct(swamp), 2),
        "bone": round(pct(bone), 2),
        "dark_tree": round(pct(dark), 2),
        "hellfire": round(pct(fire), 2),
    },
    "center_box_65area": None,
    "center_box_70area": None,
    "best_ellipse": {
        "rx": int(best[1]), "ry": int(best[2]),
        "area_pct": round(best[4], 2),
        "dirt_inside_pct": round(best[3], 2),
    },
    "inner_50_box": {
        "bbox": [ix0, iy0, ix1, iy1],
        "nonplay_pct": round(pct(inner_nonplay) / (0.25) , 2) if False else round(float(inner_nonplay.sum()) / ((ix1-ix0)*(iy1-iy0)) * 100, 2),
        "bone_px": int(inner_bone.sum()),
        "swamp_px": int(inner_swamp.sum()),
        "dark_px": int(inner_dark.sum()),
        "fire_px": int(inner_fire.sum()),
    },
    "vignette": {
        "center_L": round(float(cen), 2),
        "corners_L": {k: round(float(v), 2) for k,v in corners.items()},
        "corner_vs_center": {k: round(float(v - cen), 2) for k,v in corners.items()},
        "edge_strip_L": round(float(edge_strip), 2),
        "edge_minus_center": round(float(edge_strip - cen), 2),
    },
    "seam_math": {
        "max_diff": max_diff,
        "mean_diff": mean_diff,
        "mismatch_px": n_mismatch,
        "pixel_identical": n_mismatch == 0,
    },
    "seam_content": {
        "vertical_mid_jump": round(v_jump, 3),
        "horizontal_mid_jump": round(h_jump, 3),
        "typical_v_jump": round(v_typ, 3),
        "typical_h_jump": round(h_typ, 3),
    },
    "field_one": field_info,
    "playable_compare": {
        "master_dirt_px": int(playable.sum()),
        "master_native_playable_px": int(playable.sum()),
        "kit36x27_walk_tiles": kit_walk,
        "kit36x27_walk_px": kit_walk_px,
        "kit_walk_pct": round(kit_walk / kit_total * 100, 2),
        "prod200_walk_tiles_est": prod_walk_est,
        "prod200_walk_px_est": prod_walk_px,
    },
    "memory": {
        "jpeg_kb": round(SRC.stat().st_size/1024, 1),
        "gpu_rgba_1280x720_mb": round(W*H*4/1024/1024, 3),
        "gpu_pot_2048x1024_mb": round(2048*1024*4/1024/1024, 3),
        "gpu_if_stretch_1440x1080_mb": round(1440*1080*4/1024/1024, 3),
        "gpu_if_1920x1080_mb": round(1920*1080*4/1024/1024, 3),
        "gpu_if_8000x8000_mb": round(8000*8000*4/1024/1024, 3),
        "gpu_if_4chunk_1024_mb": round(4*1024*1024*4/1024/1024, 3),
    }
}

x0,y0,x1,y1 = center_box(0.65)
report["center_box_65area"] = {
    "bbox": [x0,y0,x1,y1],
    "dirt_pct_inside": round(float(playable[y0:y1, x0:x1].mean()*100), 2),
    "swamp_pct_inside": round(float(swamp[y0:y1, x0:x1].mean()*100), 2),
    "bone_pct_inside": round(float(bone[y0:y1, x0:x1].mean()*100), 2),
    "dark_pct_inside": round(float(dark[y0:y1, x0:x1].mean()*100), 2),
}
x0,y0,x1,y1 = center_box(0.70)
report["center_box_70area"] = {
    "bbox": [x0,y0,x1,y1],
    "dirt_pct_inside": round(float(playable[y0:y1, x0:x1].mean()*100), 2),
    "swamp_pct_inside": round(float(swamp[y0:y1, x0:x1].mean()*100), 2),
    "bone_pct_inside": round(float(bone[y0:y1, x0:x1].mean()*100), 2),
    "dark_pct_inside": round(float(dark[y0:y1, x0:x1].mean()*100), 2),
}

(OUT / "metrics.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
print(json.dumps(report, indent=2, ensure_ascii=False))
