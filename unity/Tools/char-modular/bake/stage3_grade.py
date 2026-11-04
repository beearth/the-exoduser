"""Stage 3: iron grade (value/saturation multipliers only) + cloth despeckle (median, once). System python (PIL+numpy)."""
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
W = "I:/EXODUSER-Storage/char-modular/bake/work/"
S = 4096
raw = np.array(Image.open(W + "atlas_raw.png").convert("RGB"))
d = np.load(W + "uv_tris.npz")
tris = d["tris"]
st1 = json.load(open(W + "stage1.json"))
lock = json.load(open(W + "lock_measure.json"))["combined"]
FAMS = list(d["fams"])


def mask_for(fam):
    im = Image.new("L", (S, S), 0)
    dr = ImageDraw.Draw(im)
    for t in tris[tris[:, 6] == FAMS.index(fam)]:
        pts = [(t[0], S - t[1]), (t[2], S - t[3]), (t[4], S - t[5])]
        dr.polygon(pts, fill=255)
    return np.array(im) > 0


def hsv(rgb):
    a = rgb.astype(np.float32) / 255
    mx = a.max(-1); mn = a.min(-1); dlt = np.maximum(mx - mn, 1e-9)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    h = np.where(mx == r, ((g - b) / dlt) % 6, np.where(mx == g, (b - r) / dlt + 2, (r - g) / dlt + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-9), 0)
    return h, s, mx


def from_hsv(h, s, v):
    c = v * s; hp = (h / 60) % 6; x = c * (1 - np.abs(hp % 2 - 1)); m = v - c
    z = np.zeros_like(c)
    conds = [(hp < 1), (hp < 2), (hp < 3), (hp < 4), (hp < 5), (hp >= 5)]
    rs = [c, x, z, z, x, c]; gs = [x, c, c, x, z, z]; bs = [z, z, x, c, c, x]
    r = np.select(conds, rs); g = np.select(conds, gs); b = np.select(conds, bs)
    return np.stack([r + m, g + m, b + m], -1)


report = {"lockTarget": {"meanV": lock["meanV"], "meanS": lock["meanS"], "pixels": lock["pixels"]}}
# -------------------------------------------------------------- iron grade
iron_mask = mask_for("Iron")
h, s, v = hsv(raw)
red = ((h < 15) | (h > 340)) & (s > .6) & (raw[..., 0] > 70)
sel = iron_mask & ~red
before = (float(v[sel].mean()), float(s[sel].mean()), int(sel.sum()))
fv = lock["meanV"] / before[0]; fs = lock["meanS"] / before[1]
r = st1["regions"]["Iron"]
x0, y0, side = r["x"], r["y"], r["side"]
ys0, ys1 = S - (y0 + side), S - y0     # image rows (flip)
reg = raw[ys0:ys1, x0:x0 + side]
hh, ss, vv = hsv(reg)
out = from_hsv(hh, np.clip(ss * fs, 0, 1), np.clip(vv * fv, 0, 1))
graded = raw.copy()
graded[ys0:ys1, x0:x0 + side] = np.clip(out * 255 + .5, 0, 255).astype(np.uint8)
h2, s2, v2 = hsv(graded)
red2 = ((h2 < 15) | (h2 > 340)) & (s2 > .6) & (graded[..., 0] > 70)
sel2 = iron_mask & ~red2
after = (float(v2[sel2].mean()), float(s2[sel2].mean()), int(sel2.sum()))
report["iron"] = {"before": {"meanV": before[0], "meanS": before[1], "pixels": before[2]}, "factorV": fv, "factorS": fs,
                  "after": {"meanV": after[0], "meanS": after[1], "pixels": after[2]},
                  "clippedHighV": float(((vv * fv) > 1).mean()), "rule": "multiply HSV V and S only; hue unchanged; red stains excluded from the mean (same rule as LOCK)"}
# -------------------------------------------------------------- cloth despeckle
cloth_mask = mask_for("Cloth")
rc = st1["regions"]["Cloth"]
cx0, cy0, cside = rc["x"], rc["y"], rc["side"]
cys0, cys1 = S - (cy0 + cside), S - cy0


def speckles(img):
    L = (img[..., 0] * .2126 + img[..., 1] * .7152 + img[..., 2] * .0722).astype(np.uint8)
    Lm = np.array(Image.fromarray(L).filter(ImageFilter.MedianFilter(7)))
    bright = (L.astype(np.int16) - Lm.astype(np.int16)) > 20
    return int((bright & cloth_mask).sum())


cloth_before = speckles(graded)
region = Image.fromarray(graded[cys0:cys1, cx0:cx0 + cside])
cand = {}
for radius in (1, 2):
    t = graded.copy()
    t[cys0:cys1, cx0:cx0 + cside] = np.array(region.filter(ImageFilter.MedianFilter(2 * radius + 1)))
    cand[radius] = speckles(t)
radius = 1 if cand[1] <= .3 * cloth_before else 2
final = graded.copy()
final[cys0:cys1, cx0:cx0 + cside] = np.array(region.filter(ImageFilter.MedianFilter(2 * radius + 1)))
report["cloth"] = {"speckleMetric": "bright px where L - median7(L) > 20/255, inside cloth UV mask", "before": cloth_before,
                   "candidates": {str(k): v for k, v in cand.items()}, "radiusApplied": radius, "filterSize": 2 * radius + 1,
                   "after": speckles(final), "clothMaskPixels": int(cloth_mask.sum()), "appliedOnce": True,
                   "region": {"x": cx0, "y": cy0, "side": cside}}
Image.fromarray(final).save(W + "atlas_final.png", optimize=False)
Image.fromarray(graded).save(W + "atlas_graded_only.png")
json.dump(report, open(W + "stage3.json", "w"), indent=1)
print(json.dumps(report, indent=1))
