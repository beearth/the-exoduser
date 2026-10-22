# SWEEP-B PC 비교판 생성: 왼쪽 웹 · 오른쪽 Godot.
# python sweep_b_pc_cmp.py <part> [name ...] [--crop x,y,w,h] [--scale 0.5] [--suffix _x] [--stack]
# --stack: 위(웹)/아래(Godot)로 쌓는다(가로가 긴 크롭용).
import sys, os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.environ.get('SWEEPB_OUT', 'G:/exoduser-wt/_out/pc-sweep-b')

def font(sz):
    for f in ['C:/Windows/Fonts/malgun.ttf', 'C:/Windows/Fonts/arial.ttf']:
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    return ImageFont.load_default()

def load(p):
    if not os.path.exists(p):
        im = Image.new('RGB', (1920, 1080), (40, 10, 10)); ImageDraw.Draw(im).text((80, 500), 'MISSING ' + os.path.basename(p), fill=(255, 200, 200), font=font(48)); return im
    return Image.open(p).convert('RGB')

def make(part, name, crop, scale, suffix, stack, wdir=None, gdir=None):
    a = load(os.path.join(wdir or os.path.join(ROOT, 'web', part), name + '.png'))
    b = load(os.path.join(gdir or os.path.join(ROOT, 'godot', part), name + '.png'))
    if crop:
        x, y, w, h = crop; a = a.crop((x, y, x + w, y + h)); b = b.crop((x, y, x + w, y + h))
    if scale != 1.0:
        a = a.resize((max(1, int(a.width * scale)), max(1, int(a.height * scale))), Image.LANCZOS)
        b = b.resize((max(1, int(b.width * scale)), max(1, int(b.height * scale))), Image.LANCZOS)
    if stack:
        W = max(a.width, b.width); H = a.height + b.height + 60
        S = Image.new('RGB', (W, H), (18, 16, 14)); d = ImageDraw.Draw(S)
        d.text((6, 4), 'WEB  ' + name, fill=(190, 235, 190), font=font(18)); S.paste(a, (0, 26))
        d.text((6, a.height + 32), 'GODOT', fill=(235, 190, 190), font=font(18)); S.paste(b, (0, a.height + 56))
    else:
        W = a.width + b.width + 10; H = max(a.height, b.height) + 28
        S = Image.new('RGB', (W, H), (18, 16, 14)); d = ImageDraw.Draw(S)
        d.text((6, 3), 'WEB  ' + name, fill=(190, 235, 190), font=font(18))
        d.text((a.width + 16, 3), 'GODOT', fill=(235, 190, 190), font=font(18))
        S.paste(a, (0, 28)); S.paste(b, (a.width + 10, 28))
    od = os.path.join(ROOT, 'cmp', part); os.makedirs(od, exist_ok=True)
    o = os.path.join(od, name + suffix + '.png'); S.save(o); print(o)

if __name__ == '__main__':
    args = sys.argv[1:]; part = args.pop(0)
    crop = None; scale = 0.5; suffix = ''; names = []; stack = False; wdir = gdir = None
    i = 0
    while i < len(args):
        a = args[i]
        if a == '--crop': crop = tuple(int(v) for v in args[i + 1].split(',')); i += 2; continue
        if a == '--scale': scale = float(args[i + 1]); i += 2; continue
        if a == '--suffix': suffix = args[i + 1]; i += 2; continue
        if a == '--wdir': wdir = args[i + 1]; i += 2; continue
        if a == '--gdir': gdir = args[i + 1]; i += 2; continue
        if a == '--stack': stack = True; i += 1; continue
        names.append(a); i += 1
    if not names:
        w = set(f[:-4] for f in os.listdir(wdir or os.path.join(ROOT, 'web', part)) if f.endswith('.png'))
        g = set(f[:-4] for f in os.listdir(gdir or os.path.join(ROOT, 'godot', part)) if f.endswith('.png'))
        names = sorted(w & g)
    for n in names: make(part, n, crop, scale, suffix, stack, wdir, gdir)
