# 1-1 패치 데칼 시트(우리 바닥 텍스처에서 잘라 만든다, 레퍼런스 원본 0). 2048² = 2×2 패치(각 1024).
# 0 이끼(FieldMoss) 1 젖은 흙(ForestSoil 어둡게) 2 낙엽(ForestFloor) 3 뿌리흙(ExposedRoots). 색은 회갈·올리브로(채도 .7배), 알파는 부드러운 덩어리 ×.85.
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
G = 'G:/exoduser-wt/claude-map11/unity/Assets/Exoduser/Resources/Art/map/a2/ground/'; O = sys.argv[1]; os.makedirs(O, exist_ok=True)
LUM = np.array([.299, .587, .114], np.float32)
def load(n, mode='RGB'):
    im = Image.open(G + n).convert(mode)
    return np.asarray(im.resize((1024, 1024), Image.LANCZOS) if im.size[0] != 1024 else im).astype(np.float32) / 255
def blob(seed, size=1024):
    r = np.random.default_rng(seed); yy, xx = np.mgrid[0:size, 0:size] / size * 2 - 1
    ang = np.arctan2(yy, xx); rad = np.sqrt(xx * xx + yy * yy)
    k = sum(r.random() * .12 * np.cos(f * ang + r.random() * 6.28) for f in (2, 3, 5, 7))
    low = ndimage.zoom(ndimage.gaussian_filter(r.random((32, 32)), 1), 32, order=1)
    m = 1 - np.clip((rad + k + (low - low.mean()) * 1.2 - .55) / .38, 0, 1)
    return (m ** 1.6) * .85
# 틴트 = 게임 바닥 셰이더(HellGroundPBR _FullField)의 층 틴트와 같게: 패치가 바닥보다 밝게 뜨지 않는다
spec = [('A2_FieldMoss', (.47, .53, .35), 1.0), ('A2_ForestSoil', (.60, .52, .41), .75), ('A2_ForestFloor', (.58, .49, .36), 1.0), ('A2_ExposedRoots', (.62, .52, .40), 1.0)]
cols, nrms, hs = [], [], []
for i, (n, tint, bright) in enumerate(spec):
    c = load(n + '_BaseColor.jpg'); l = (c @ LUM)[..., None]; c = (l + (c - l) * .9) * np.array(tint) * bright
    a = blob(11 + i); cols.append(np.dstack([np.clip(c, 0, 1), a]))
    nrms.append(load(n + '_Normal.png'))
    h = np.asarray(Image.fromarray(((c @ LUM) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))).astype(np.float32) / 255
    hs.append(np.repeat(((h - h.mean()) / (h.std() + 1e-4) * .15 + .5).clip(0, 1)[..., None], 3, 2))
def grid(t): return np.vstack([np.hstack(t[:2]), np.hstack(t[2:])])
Image.fromarray((grid(cols) * 255).astype(np.uint8), 'RGBA').save(O + '/patch_col.png')
Image.fromarray((grid(nrms) * 255).astype(np.uint8), 'RGB').save(O + '/patch_nrm.png')
print('ok')
