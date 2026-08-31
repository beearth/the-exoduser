"""Pack user-provided organic-mouth physical bullet sheets into uniform cells."""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

WORK = Path(__file__).resolve().parent
ROOT = WORK.parent
CELL_W, CELL_H = 768, 384
PAD = 12

SRCS = [
    WORK / "src_phys_1.png",  # 8-frame horizontal fly
    WORK / "src_phys_2.png",  # 6-frame open / angled
    WORK / "src_phys_3.png",  # 6-frame curved
]


def key_black(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = np.array(im)
    r, g, b, a = px[:, :, 0], px[:, :, 1], px[:, :, 2], px[:, :, 3]
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    a = a.astype(np.int16)
    a[lum < 10] = 0
    fade = (lum >= 10) & (lum < 22)
    a[fade] = (a[fade] * (lum[fade] - 10) / 12).astype(np.int16)
    px[:, :, 3] = np.clip(a, 0, 255).astype(np.uint8)
    return Image.fromarray(px)


def blobs(mask: np.ndarray, min_area: int = 2500):
    h, w = mask.shape
    vis = np.zeros((h, w), np.uint8)
    out = []
    for y in range(h):
        row = mask[y]
        for x in range(w):
            if not row[x] or vis[y, x]:
                continue
            q = deque([(x, y)])
            vis[y, x] = 1
            minx = maxx = x
            miny = maxy = y
            area = 0
            while q:
                cx, cy = q.popleft()
                area += 1
                if cx < minx:
                    minx = cx
                if cx > maxx:
                    maxx = cx
                if cy < miny:
                    miny = cy
                if cy > maxy:
                    maxy = cy
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < w and 0 <= ny < h and mask[ny, nx] and not vis[ny, nx]:
                        vis[ny, nx] = 1
                        q.append((nx, ny))
            if area >= min_area:
                out.append((miny, minx, maxy + 1, maxx + 1, area))
    out.sort(key=lambda b: (b[0] // 220, b[1]))
    return out


def head_xy(crop: Image.Image):
    px = np.array(crop)
    a = px[:, :, 3] > 24
    ys, xs = np.where(a)
    if len(xs) < 8:
        return crop.size[0] * 0.72, crop.size[1] * 0.5
    x0, x1 = xs.min(), xs.max()
    cut = x0 + (x1 - x0) * 0.62
    sel = xs >= cut
    return float(xs[sel].mean()), float(ys[sel].mean())


def fit_cell(crop: Image.Image) -> Image.Image:
    crop = key_black(crop)
    a = crop.split()[-1]
    bb = a.point(lambda v: 255 if v > 16 else 0).getbbox()
    out = Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))
    if not bb:
        return out
    crop = crop.crop(bb)
    hx, hy = head_xy(crop)
    cw, ch = crop.size
    max_w, max_h = CELL_W - PAD * 2, CELL_H - PAD * 2
    s = min(max_w / max(cw, 1), max_h / max(ch, 1))
    nw, nh = max(1, int(cw * s)), max(1, int(ch * s))
    crop = crop.resize((nw, nh), Image.Resampling.LANCZOS)
    ox = int(CELL_W * 0.5 - hx * s)
    oy = int(CELL_H * 0.5 - hy * s)
    out.paste(crop, (ox, oy), crop)
    return out


def extract(path: Path):
    im = Image.open(path).convert("RGBA")
    mask = np.array(im)[:, :, 3] > 20
    frames = []
    for miny, minx, maxy, maxx, _ in blobs(mask):
        frames.append(im.crop((minx, miny, maxx, maxy)))
    return frames


def main():
    rows = [extract(p) for p in SRCS]
    ncols = max(len(r) for r in rows)
    sheet = Image.new("RGBA", (CELL_W * ncols, CELL_H * len(rows)), (0, 0, 0, 0))
    for ri, frs in enumerate(rows):
        print(f"row {ri}: {len(frs)} frames from {SRCS[ri].name}")
        for ci, fr in enumerate(frs):
            cell = fit_cell(fr)
            sheet.paste(cell, (ci * CELL_W, ri * CELL_H), cell)
            cell.save(WORK / f"phys_r{ri}_f{ci}.png")
    out = ROOT / "proj_phys_mouth.png"
    sheet.save(out, "PNG")
    print("wrote", out, sheet.size)


if __name__ == "__main__":
    main()
