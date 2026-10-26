"""Offline bake of the web ossuary page art (PC-U04b). No generated images: every pixel comes from the web source PNGs
plus the CSS filters/gradients of ui-refinement.css (#invOssuaryPanel rules, .oss-altar zoom 1.35), applied once here.
Run: python -X utf8 bake.py <web-root> <out-dir>   (web-root = G:/exoduser, out-dir = .../Resources/Art/ui/inventory/ossuary)
"""
import sys, os
from PIL import Image, ImageFilter, ImageChops, ImageDraw
import numpy as np

web, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)

def load(p): return Image.open(os.path.join(web, p)).convert('RGBA')
def arr(im): return np.asarray(im, dtype=np.float32) / 255.0
def img(a): return Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8), 'RGBA')

def brightness_saturate(im, b=1.0, s=1.0, gray=False, contrast=1.0):
    a = arr(im); rgb = a[..., :3]
    lum = (rgb * np.array([.2126, .7152, .0722], dtype=np.float32)).sum(-1, keepdims=True)
    if gray:
        rgb = np.repeat(lum, 3, -1)
    elif s != 1.0:
        m = np.array([[.213 + .787 * s, .715 - .715 * s, .072 - .072 * s],
                      [.213 - .213 * s, .715 + .285 * s, .072 - .072 * s],
                      [.213 - .213 * s, .715 - .715 * s, .072 + .928 * s]], dtype=np.float32)
        rgb = rgb @ m.T
    rgb = rgb * b
    if contrast != 1.0:
        rgb = (rgb - .5) * contrast + .5
    a[..., :3] = np.clip(rgb, 0, 1)
    return img(a)

def scale_alpha(im, k):
    a = arr(im); a[..., 3] *= k; return img(a)

def shadow_under(layer, dx, dy, blur, alpha=1.0):
    """CSS drop-shadow(dx dy blur #000): blurred alpha, offset, composited under the layer."""
    w, h = layer.size
    a = layer.split()[3]
    sh = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sh.putalpha(a.point(lambda v: int(v * alpha)))
    sh = ImageChops.offset(sh, int(round(dx)), int(round(dy)))
    sh = sh.filter(ImageFilter.GaussianBlur(blur / 2))
    return Image.alpha_composite(sh, layer)

def paste_center(canvas, im, cx, cy):
    canvas.alpha_composite(im, (int(round(cx - im.width / 2)), int(round(cy - im.height / 2))))

def circle_mask(size, cx, cy, r):
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    d = np.sqrt((xx + .5 - cx) ** 2 + (yy + .5 - cy) ** 2)
    return np.clip(r - d + .5, 0, 1)

# ---- ritual ring: 480x480 canvas centred on the ring centre (design 1230,556) ----
N = 480; c = N / 2
yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
dist = np.sqrt((xx + .5 - c) ** 2 + (yy + .5 - c) ** 2)
R = 185 * 2 ** .5
t = dist / R
stops = [(0, (18, 20, 20)), (.22, (18, 20, 20)), (.44, (102, 81, 50)), (.69, (20, 22, 23)), (10, (20, 22, 23))]
disk = np.zeros((N, N, 4), np.float32)
for ch in range(3):
    disk[..., ch] = np.interp(t, [s[0] for s in stops], [s[1][ch] for s in stops]) / 255
disk[..., 3] = circle_mask(N, c, c, 185)
canvas = Image.new('RGBA', (N, N), (0, 0, 0, 0))
sh = Image.new('RGBA', (N, N), (0, 0, 0, 0))
sh.putalpha(Image.fromarray((circle_mask(N, c, c + 10.8, 185) * .667 * 255).astype(np.uint8)))
sh = sh.filter(ImageFilter.GaussianBlur(32.4 / 2))
canvas = Image.alpha_composite(canvas, sh)
canvas = Image.alpha_composite(canvas, img(disk))
altar = load('img/ui/ossuary_altar_hf_v2.png').resize((402, 402), Image.LANCZOS)
altar = brightness_saturate(altar, .72, .7)
aa = arr(altar)
gy4, gx4 = np.mgrid[0:402, 0:402].astype(np.float32)
at = np.sqrt((gx4 + .5 - 201) ** 2 + (gy4 + .5 - 201) ** 2) / (201 * 2 ** .5)
aa[..., 3] = np.interp(at, [0, .62, .66, .71, 10], [1, 1, .6, 0, 0])
canvas.alpha_composite(img(aa), (int(c - 201), int(c - 201)))
r2 = 370 * .36 / 2
ey = np.sqrt((xx + .5 - c) ** 2 + (yy + .5 - c) ** 2) / (r2 * 2 ** .5)
glow = np.zeros((N, N, 4), np.float32)
glow[..., 0], glow[..., 1], glow[..., 2] = 200 / 255, 163 / 255, 82 / 255
cm = circle_mask(N, c, c, r2)
glow[..., 3] = np.clip(1 - ey / .67, 0, 1) * (0x16 / 255) * cm
inside = Image.fromarray((cm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(40.5 / 2))
inner_sh = (1 - np.asarray(inside, np.float32) / 255) * .6 * cm
canvas = Image.alpha_composite(canvas, img(glow))
sd = np.zeros((N, N, 4), np.float32); sd[..., 3] = inner_sh
canvas = Image.alpha_composite(canvas, img(sd))
canvas.save(os.path.join(out, 'ring_baked.png'))

# ---- socket frames ----
socket = load('img/ui/ossuary_socket_hf_v2.png')

# bone node (uncollected): socket 155.5x145.4 (125%x112% of 124.4x129.8), diamond ::after, drop-shadow(0 6.75 5.4 #000)
cv = Image.new('RGBA', (200, 200), (0, 0, 0, 0))
sk = brightness_saturate(socket.resize((156, 145), Image.LANCZOS), .6, .4)
paste_center(cv, sk, 100, 100)
dia = Image.new('RGBA', (40, 40), (0, 0, 0, 0)); dd = ImageDraw.Draw(dia)
k = 1.414
for hw, col in ((4.05, (0x7d, 0x69, 0x4a, 255)), (2.7, (0x39, 0x36, 0x2d, 255))):
    dd.polygon([(20, 20 - hw * k), (20 + hw * k, 20), (20, 20 + hw * k), (20 - hw * k, 20)], fill=col)
paste_center(cv, dia, 100, 100 + 59.5 - 8.1)
shadow_under(cv, 0, 6.75, 5.4).save(os.path.join(out, 'node_frame_baked.png'))

# centre urn socket: box 122x135 (glow ellipse at 50% 64%), socket 166x169, drop-shadow(0 8.1 9.45 #000)
cw, ch = 220, 250; cx, cy = 110, 125
by0 = cy - 67.5; bx0 = cx - 61
gy, gx = np.mgrid[0:ch, 0:cw].astype(np.float32)
ox, oy = bx0 + 61, by0 + 135 * .64
rx, ry = 61 * 2 ** .5, 135 * .64 * 2 ** .5
q = np.sqrt(((gx + .5 - ox) / rx) ** 2 + ((gy + .5 - oy) / ry) ** 2)
bg = np.zeros((ch, cw, 4), np.float32)
bg[..., 0], bg[..., 1], bg[..., 2] = 0xbe / 255, 0xa4 / 255, 0x63 / 255
inbox = ((gx + .5 >= bx0) & (gx + .5 <= bx0 + 122) & (gy + .5 >= by0) & (gy + .5 <= by0 + 135)).astype(np.float32)
bg[..., 3] = np.clip(1 - q / .67, 0, 1) * (0x18 / 255) * inbox
cv = img(bg)
paste_center(cv, brightness_saturate(socket.resize((166, 169), Image.LANCZOS), .82, .7), cx, cy)
shadow_under(cv, 0, 8.1, 9.45).save(os.path.join(out, 'center_frame_baked.png'))

# urn image: object-fit contain 78x78 in 78x89, drop-shadow(0 4.05 5.4 #000) brightness(1.2); canvas padded 20px
urn = load('output/imagegen/item-skins/ossuary_phys.png').resize((78, 78), Image.LANCZOS)
cv = Image.new('RGBA', (78 + 40, 89 + 40), (0, 0, 0, 0)); cv.alpha_composite(urn, (20, 25))
cv = brightness_saturate(shadow_under(cv, 0, 4.05, 5.4), 1.2)
cv.save(os.path.join(out, 'urn_lit_baked.png'))

# bone images 51x51: grayscale brightness(.42) opacity .7
for part in ('skull', 'arms', 'torso', 'legs'):
    im = load('output/imagegen/item-skins/bone_%s.png' % part).resize((51, 51), Image.LANCZOS)
    scale_alpha(brightness_saturate(im, .42, gray=True), .7).save(os.path.join(out, 'bone_%s_dim.png' % part))

# portrait: 880x1168 -> 720x958 (2x of the 360x479 slot), contrast(1.04) saturate(.93)
por = Image.open(os.path.join(web, 'img/vfx_ancestor/iron_warlord_portrait.png')).convert('RGBA').resize((720, 958), Image.LANCZOS)
brightness_saturate(por, 1.0, .93, contrast=1.04).save(os.path.join(out, 'portrait_baked.png'))

# sigil (pbox background, drawn 620px): 2048 -> 1024 copy
load('img/ui/blackiron/sigil.png').resize((1024, 1024), Image.LANCZOS).save(os.path.join(out, 'sigil_1024.png'))
print('baked', sorted(os.listdir(out)))
