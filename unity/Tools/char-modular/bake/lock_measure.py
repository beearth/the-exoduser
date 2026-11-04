"""Mean HSV value/saturation of plate regions in the LOCK front/side sheets (mask boxes recorded in the output)."""
import json, colorsys
import numpy as np
from PIL import Image
D = "I:/EXODUSER-Storage/archive/E/exoduser-wt/_out/unity-charsheet/warrior/views/"
BOXES = {
    "front": [("pauldron_L", 375, 215, 440, 300), ("pauldron_R", 590, 215, 655, 300),
              ("arm_L", 310, 330, 420, 470), ("arm_R", 600, 330, 700, 470),
              ("thigh_knee_shin_L", 385, 600, 455, 790), ("thigh_knee_shin_R", 565, 600, 635, 790),
              ("boot_L", 340, 840, 430, 945), ("boot_R", 590, 840, 685, 945)],
    "side": [("pauldron_arm", 470, 200, 570, 460), ("shin_knee", 470, 630, 580, 790), ("boot", 465, 850, 620, 945)],
}


def hsv_arrays(rgb):
    a = rgb.astype(np.float64) / 255
    mx = a.max(-1); mn = a.min(-1)
    v = mx
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-9), 0)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = np.maximum(mx - mn, 1e-9)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, s, v


def plate_mask(rgb):
    h, s, v = hsv_arrays(rgb)
    bg = (np.abs(rgb[..., 0].astype(int) - rgb[..., 1]) < 7) & (np.abs(rgb[..., 1].astype(int) - rgb[..., 2]) < 7) & (v > .42) & (v < .58)
    red = ((h < 15) | (h > 340)) & (s > .6) & (rgb[..., 0] > 70)   # deep red cloth / blood
    return ~bg & ~red


out = {}
allv = []; alls = []
for view, boxes in BOXES.items():
    rgb = np.array(Image.open(D + "warrior_body_%s.png" % view).convert("RGB"))
    vs = []; ss = []
    for name, x0, y0, x1, y1 in boxes:
        sub = rgb[y0:y1, x0:x1]
        m = plate_mask(sub)
        h, s, v = hsv_arrays(sub)
        vs.append(v[m]); ss.append(s[m])
    v = np.concatenate(vs); s = np.concatenate(ss)
    out[view] = {"pixels": int(len(v)), "meanV": float(v.mean()), "meanS": float(s.mean()), "boxes": [list(b) for b in boxes]}
    allv.append(v); alls.append(s)
v = np.concatenate(allv); s = np.concatenate(alls)
out["combined"] = {"pixels": int(len(v)), "meanV": float(v.mean()), "meanS": float(s.mean())}
out["maskRule"] = "boxes in 1024px sheet coords; excluded: grey background (|R-G|,|G-B|<7, V .42-.58) and deep red (H<15 or >340, S>.6, R>70)"
json.dump(out, open("I:/EXODUSER-Storage/char-modular/bake/work/lock_measure.json", "w"), indent=1)
print(json.dumps({k: (v if k == "maskRule" else {kk: vv for kk, vv in v.items() if kk != "boxes"}) for k, v in out.items()}, indent=1))
