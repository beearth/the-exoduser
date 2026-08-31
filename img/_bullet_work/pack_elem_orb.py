"""Pack user elemental-orb sheet: 6x6, overlap crop, largest blob, face-right, head-centered."""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

WORK = Path(__file__).resolve().parent
ROOT = WORK.parent
SRC = WORK / "src_elem_orb.png"
OUT = ROOT / "proj_elem_orb.png"
COLS, ROWS = 6, 6
CELL_W, CELL_H = 512, 256
PAD = 8


def punch_gradient(im: Image.Image) -> np.ndarray:
    """Keep high-frequency plasma + bright cores; drop smooth row wash."""
    rgba = im.convert("RGBA")
    rgb = np.array(rgba)[:, :, :3].astype(np.float32)
    blur = np.array(rgba.filter(ImageFilter.GaussianBlur(radius=18)))[:, :, :3].astype(np.float32)
    h, w, _ = rgb.shape
    diff = np.linalg.norm(rgb - blur, axis=2)
    lum = 0.3 * rgb[:, :, 0] + 0.59 * rgb[:, :, 1] + 0.11 * rgb[:, :, 2]
    mx = np.max(rgb, axis=2)
    mn = np.min(rgb, axis=2)
    sat = (mx - mn) / np.maximum(mx, 1.0)
    keep = (diff > 22) | (lum > 130)
    alpha = np.zeros((h, w), np.uint8)
    alpha[keep] = np.clip((diff[keep] - 10) * 8, 50, 255).astype(np.uint8)
    alpha[lum > 130] = np.maximum(alpha[lum > 130], np.clip((lum[lum > 130] - 90) * 3, 90, 255).astype(np.uint8))
    alpha = np.array(Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(radius=0.6)))
    out = np.array(rgba)
    out[:, :, 3] = alpha
    return out


def largest_blob(px: np.ndarray, min_area: int = 180):
    a = px[:, :, 3] > 24
    h, w = a.shape
    vis = np.zeros((h, w), np.uint8)
    best = None
    best_area = 0
    for y in range(h):
        row = a[y]
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
                    if 0 <= nx < w and 0 <= ny < h and a[ny, nx] and not vis[ny, nx]:
                        vis[ny, nx] = 1
                        q.append((nx, ny))
            if area > best_area:
                best_area = area
                best = (miny, minx, maxy + 1, maxx + 1, area)
    if not best or best_area < min_area:
        return None
    return best


def head_xy(crop: Image.Image):
    px = np.array(crop)
    a = px[:, :, 3] > 28
    lum = 0.3 * px[:, :, 0] + 0.59 * px[:, :, 1] + 0.11 * px[:, :, 2]
    ys, xs = np.where(a)
    if len(xs) < 12:
        return crop.size[0] * 0.72, crop.size[1] * 0.5
    x0, x1 = int(xs.min()), int(xs.max())
    cut = x0 + (x1 - x0) * 0.48
    wgt = (lum > 48) & a & (np.arange(px.shape[1])[None, :] >= cut)
    wys, wxs = np.where(wgt)
    if len(wxs) < 8:
        wgt = a & (np.arange(px.shape[1])[None, :] >= cut)
        wys, wxs = np.where(wgt)
    if len(wxs) < 8:
        return float(xs.mean()), float(ys.mean())
    ww = (lum[wys, wxs] + 8) * (px[:, :, 3][wys, wxs] / 255.0)
    return float(np.average(wxs, weights=ww)), float(np.average(wys, weights=ww))


def main():
    src = Image.open(SRC).convert("RGBA")
    W, H = src.size
    full = Image.fromarray(punch_gradient(src))
    sheet = Image.new("RGBA", (CELL_W * COLS, CELL_H * ROWS), (0, 0, 0, 0))
    n = 0
    for r in range(ROWS):
        y0 = int(round(r * H / ROWS))
        y1 = int(round((r + 1) * H / ROWS))
        # overlap down a bit; tails go right
        ey0 = max(0, y0 - 8)
        ey1 = min(H, y1 + 8)
        for c in range(COLS):
            x0 = int(round(c * W / COLS))
            x1 = int(round((c + 1) * W / COLS))
            ex0 = max(0, x0 - 12)
            ex1 = min(W, x1 + 110)  # catch rightward tail
            crop = full.crop((ex0, ey0, ex1, ey1))
            px = np.array(crop)
            blob = largest_blob(px)
            if blob:
                by0, bx0, by1, bx1, _ = blob
                sprite = crop.crop((bx0, by0, bx1, by1))
            else:
                sprite = full.crop((x0, y0, x1, y1))
            sprite = sprite.transpose(Image.FLIP_LEFT_RIGHT)
            hx, hy = head_xy(sprite)
            cw, ch = sprite.size
            scale = min((CELL_W - PAD * 2) / max(cw, 1), (CELL_H - PAD * 2) / max(ch, 1), 1.35)
            nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
            sprite = sprite.resize((nw, nh), Image.Resampling.LANCZOS)
            hx *= scale
            hy *= scale
            dst = Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))
            dx = int(CELL_W * 0.5 - hx)
            dy = int(CELL_H * 0.5 - hy)
            dst.alpha_composite(sprite, (dx, dy))
            sheet.paste(dst, (c * CELL_W, r * CELL_H))
            n += 1
    sheet.save(OUT, "PNG")
    preview = sheet.copy()
    preview.thumbnail((1200, 800), Image.Resampling.LANCZOS)
    preview.save(WORK / "preview_elem_orb.png", "PNG")
    print("wrote", OUT, sheet.size, "cells", n)


if __name__ == "__main__":
    main()
