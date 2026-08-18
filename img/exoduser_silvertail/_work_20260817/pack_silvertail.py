"""Pack silvertail 8-dir sheets: idle2 + walk4 + atk4 = 480x48."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

WORK = Path(__file__).resolve().parent
OUT = WORK.parent
CELL = 48
IDLE_N, WALK_N, ATK_N = 2, 4, 4
TOTAL = IDLE_N + WALK_N + ATK_N
GREEN = (0, 255, 0)
# clock file names used by game.html
DIR_FILES = {
    "s": "6.png",
    "se": "5.png",
    "e": "3.png",
    "ne": "1.png",
    "n": "12.png",
    "nw": "11.png",
    "w": "9.png",
    "sw": "7.png",
}
# optional named aliases (not loaded for silvertail)
ALIASES = {
    "s": "south.png",
    "se": "south-east.png",
    "e": "east.png",
    "ne": "north-east.png",
    "n": "north.png",
    "nw": "north-west.png",
    "w": "west.png",
    "sw": "south-west.png",
}


def chroma(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # key #00FF00 and near-green fringe
            if g > 140 and g > r + 50 and g > b + 50:
                px[x, y] = (0, 0, 0, 0)
            elif g > 90 and g > r + 30 and g > b + 30:
                px[x, y] = (r, g, b, max(0, 255 - (g - 90) * 4))
    return im


def bbox(im: Image.Image):
    a = im.split()[-1]
    # slight dilate to keep outline
    bb = a.point(lambda v: 255 if v > 16 else 0).getbbox()
    return bb


def fit_cell(im: Image.Image, cell: int, feet_pad: int = 1) -> Image.Image:
    im = chroma(im)
    bb = bbox(im)
    if not bb:
        return Image.new("RGBA", (cell, cell), (0, 0, 0, 0))
    x0, y0, x1, y1 = bb
    crop = im.crop((x0, y0, x1, y1))
    cw, ch = crop.size
    # Fill cell height so the body reads at 48px; clip extreme skirt width.
    max_h = cell - 1 - feet_pad
    scale = max_h / ch
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    crop = crop.resize((nw, nh), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (cell, cell), (0, 0, 0, 0))
    ox = (cell - nw) // 2
    oy = cell - feet_pad - nh
    out.paste(crop, (ox, oy), crop)
    return out


def numbered(d: str, prefix: str, n: int, idle: Path) -> list[Path]:
    found = []
    for i in range(n):
        p = WORK / f"{prefix}_{d}_{i}.jpg"
        if p.exists():
            found.append(p)
    if not found:
        return [idle] * n
    # 0,1,2,1 when only 3 unique — still a 4-beat cycle
    out = []
    while len(out) < n:
        out.append(found[len(out) % len(found)])
    return out[:n]


def load_seq(d: str) -> list[Image.Image]:
    idle = WORK / f"idle_{d}.jpg"
    if not idle.exists():
        raise FileNotFoundError(idle)
    frames = [idle, idle]
    frames.extend(numbered(d, "walk", WALK_N, idle))
    frames.extend(numbered(d, "atk", ATK_N, idle))
    return [Image.open(p) for p in frames]


def pack_dir(d: str) -> Image.Image:
    srcs = load_seq(d)
    cells = [fit_cell(s, CELL) for s in srcs]
    sheet = Image.new("RGBA", (CELL * TOTAL, CELL), (0, 0, 0, 0))
    for i, c in enumerate(cells):
        sheet.paste(c, (i * CELL, 0), c)
    return sheet


def main():
    for d, fname in DIR_FILES.items():
        sheet = pack_dir(d)
        dest = OUT / fname
        sheet.save(dest, "PNG")
        alias = ALIASES[d]
        sheet.save(OUT / alias, "PNG")
        print("wrote", dest.name, sheet.size, sheet.mode)


if __name__ == "__main__":
    main()
