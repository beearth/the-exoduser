# 접촉 시트·비교 격자 생성 도구 (임시)
# sheet: python sheet.py sheet <out.png> <cols> <thumbW> img1 img2 ...
# compare: python sheet.py compare <out.png> <title> <web.png> <godot.png> [--crop x,y,w,h] [--wlabel ..] [--glabel ..]
import sys, os
from PIL import Image, ImageDraw, ImageFont

def font(sz):
    for f in ['C:/Windows/Fonts/malgun.ttf', 'C:/Windows/Fonts/arial.ttf']:
        if os.path.exists(f):
            return ImageFont.truetype(f, sz)
    return ImageFont.load_default()

def sheet(out, cols, tw, files):
    ims = []
    for f in files:
        im = Image.open(f).convert('RGB')
        h = int(im.height * tw / im.width)
        ims.append((os.path.basename(f), im.resize((tw, h), Image.LANCZOS)))
    th = max(i.height for _, i in ims) + 26
    rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * (tw + 8) + 8, rows * (th + 8) + 8), (24, 22, 20))
    d = ImageDraw.Draw(S); fn = font(16)
    for k, (n, im) in enumerate(ims):
        x = 8 + (k % cols) * (tw + 8); y = 8 + (k // cols) * (th + 8)
        S.paste(im, (x, y + 24)); d.text((x + 2, y + 2), n[:60], fill=(230, 220, 190), font=fn)
    S.save(out)

def compare(out, title, web, god, crop=None, wl='WEB (game.html / index.html)', gl='GODOT (INTEG-10 9133e2782)', scale=1.0):
    def load(p):
        if p == '-' or not os.path.exists(p):
            im = Image.new('RGB', (1920, 1080), (40, 10, 10))
            dd = ImageDraw.Draw(im); dd.text((80, 500), 'NOT AVAILABLE / 진입 불가', fill=(255, 200, 200), font=font(64))
            return im
        return Image.open(p).convert('RGB')
    a, b = load(web), load(god)
    if crop:
        x, y, w, h = crop
        a = a.crop((x, y, x + w, y + h)); b = b.crop((x, y, x + w, y + h))
    if scale != 1.0:
        a = a.resize((int(a.width * scale), int(a.height * scale)), Image.LANCZOS)
        b = b.resize((int(b.width * scale), int(b.height * scale)), Image.LANCZOS)
    W = a.width + b.width + 12; H = max(a.height, b.height) + 90
    S = Image.new('RGB', (W, H), (18, 16, 14)); d = ImageDraw.Draw(S)
    d.text((10, 6), title, fill=(240, 225, 190), font=font(30))
    d.text((10, 48), wl, fill=(200, 230, 200), font=font(22))
    d.text((a.width + 22, 48), gl, fill=(230, 200, 200), font=font(22))
    S.paste(a, (0, 86)); S.paste(b, (a.width + 12, 86))
    S.save(out)

if __name__ == '__main__':
    m = sys.argv[1]
    if m == 'sheet':
        sheet(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5:])
    else:
        args = sys.argv[2:]
        crop = None; wl = None; gl = None; sc = 1.0; pos = []
        i = 0
        while i < len(args):
            if args[i] == '--crop': crop = tuple(int(v) for v in args[i + 1].split(',')); i += 2
            elif args[i] == '--wlabel': wl = args[i + 1]; i += 2
            elif args[i] == '--glabel': gl = args[i + 1]; i += 2
            elif args[i] == '--scale': sc = float(args[i + 1]); i += 2
            else: pos.append(args[i]); i += 1
        kw = {}
        if wl: kw['wl'] = wl
        if gl: kw['gl'] = gl
        compare(pos[0], pos[1], pos[2], pos[3], crop, scale=sc, **kw)
