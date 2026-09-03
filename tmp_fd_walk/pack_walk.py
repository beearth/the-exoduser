"""Pack ChatGPT fire-devil walk sheets into 4-frame 1200x300 strips."""
from PIL import Image
import os

SRC = r"G:\exoduser\tmp_fd_walk"
OUT = r"G:\exoduser\img"
CELL = 300
PAD = 10

# visual clock assignment (not download-list order)
JOBS = [
    (3, "c_104718.png", "row4"),
    (5, "a_110642.png", "row4"),
    (6, "e_083926.png", "grid2"),
    (7, "d_104704.png", "row4"),
    (9, "b_104734.png", "row4"),
]


def alpha_bbox(im, thresh=8):
    a = im.split()[-1]
    return a.point(lambda p: 255 if p > thresh else 0).getbbox()


def crop_frame(im, box):
    x0, y0, x1, y1 = box
    cell = im.crop((x0, y0, x1, y1))
    bb = alpha_bbox(cell)
    if not bb:
        return None
    return cell.crop(bb)


def place(src):
    out = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    inner = CELL - PAD * 2
    w, h = src.size
    sc = min(inner / w, inner / h)
    nw, nh = max(1, int(w * sc)), max(1, int(h * sc))
    rs = src.resize((nw, nh), Image.Resampling.LANCZOS)
    out.paste(rs, ((CELL - nw) // 2, (CELL - nh) // 2), rs)
    return out


def frames_row4(im):
    w, h = im.size
    # prefer alpha column runs if we get 4
    a = im.split()[-1]
    pix = a.load()
    col_hit = []
    for x in range(w):
        hit = False
        for y in range(0, h, 3):
            if pix[x, y] > 8:
                hit = True
                break
        col_hit.append(hit)
    runs = []
    i = 0
    while i < w:
        if col_hit[i]:
            j = i
            while j < w and col_hit[j]:
                j += 1
            if j - i > 40:
                runs.append((i, j))
            i = j
        else:
            i += 1
    boxes = []
    if len(runs) == 4:
        for x0, x1 in runs:
            boxes.append((x0, 0, x1, h))
    else:
        cw = w / 4
        extra = int(cw * 0.18)
        for i in range(4):
            x0 = max(0, int(i * cw) - extra // 3)
            x1 = min(w, int((i + 1) * cw) + extra)
            boxes.append((x0, 0, x1, h))
    out = []
    for b in boxes:
        fr = crop_frame(im, b)
        if fr:
            out.append(fr)
    return out


def frames_grid2(im):
    w, h = im.size
    a = im.split()[-1]
    pix = a.load()
    col_hit = [any(pix[x, y] > 8 for y in range(0, h, 3)) for x in range(w)]
    row_hit = [any(pix[x, y] > 8 for x in range(0, w, 3)) for y in range(h)]

    def runs(hit, minw):
        r, i, n = [], 0, len(hit)
        while i < n:
            if hit[i]:
                j = i
                while j < n and hit[j]:
                    j += 1
                if j - i > minw:
                    r.append((i, j))
                i = j
            else:
                i += 1
        return r

    cs, rs = runs(col_hit, 40), runs(row_hit, 40)
    out = []
    if len(cs) == 2 and len(rs) == 2:
        for y0, y1 in rs:
            for x0, x1 in cs:
                fr = crop_frame(im, (x0, y0, x1, y1))
                if fr:
                    out.append(fr)
    return out


for clock, fn, kind in JOBS:
    im = Image.open(os.path.join(SRC, fn)).convert("RGBA")
    frs = frames_grid2(im) if kind == "grid2" else frames_row4(im)
    if len(frs) != 4:
        raise SystemExit(f"{fn} clock {clock}: got {len(frs)} frames")
    sheet = Image.new("RGBA", (CELL * 4, CELL), (0, 0, 0, 0))
    for i, fr in enumerate(frs):
        sheet.paste(place(fr), (i * CELL, 0))
    dest = os.path.join(OUT, f"fieldboss_firedevil_walk_{clock}.png")
    sheet.save(dest, "PNG")
    print("wrote", dest, sheet.size, "from", fn)
