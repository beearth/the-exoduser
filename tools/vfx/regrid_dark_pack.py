"""암흑 팩 시트 4종 재채색·재격자 (VFX 총괄, 2026-10-27, VFX-02 2차 2묶음 · F안). 비용 0, AI 생성 없음.

원료(모두 게임에서 이미 쓰는 승인 에셋, 읽기 전용):
  assets/vfx/Dark_Smoke_BW_6x6.png      1024x1024 6x6 (RGB 전부 검정, 알파=연기 밀도) — 사망 연기
  assets/vfx/Ice_MistSmoke_FBF_4x4.png  512x512 4x4 (균일 청색, 알파 최대 0.48의 반투명 안개)
  assets/vfx/Fire_MediumImpact.png      512x512 4x4 (1묶음 C2 적용본, regrid_fire_pack.py 산출)
  assets/vfx/Fire_BasicImpact.png       256x256 3x3 (1묶음 C2 적용본)
출력(원본 파일명·크기·격자 그대로 → game.html 수정 없이 교체):
  Dark_Smoke_Sheet_6x6.png    1024 6x6  BW 36프레임 → 밀도를 어두움이 아니라 알파로(최대 0.58, 감마 1.6), 한 가지 중간 보라
  Dark_DarkSmoke_FBF_4x4.png  512 4x4   Ice 안개 16프레임을 같은 램프로 재채색(알파 0.58*밀도^1.3), 코어 없음
  Dark_MediumImpact.png       512 4x4   Fire_MediumImpact 휘도 → 암흑 램프(0~1프레임만 #f4ecff까지)
  Dark_BasicImpact.png        256 3x3   Fire_BasicImpact 같은 재채색
색: 바깥 #5e3478 → 안쪽 #4a3066, 림 하이라이트 없음, 알파에만 블러(시그마 1.8px). 임팩트 램프 #170c20→#5e3478→#cdb2e0→#f4ecff.
알파는 직선 알파(알파 4배 인코딩 없음, _tvfx2='lighter'·_addBoom=source-over 두 합성 모두 대응). 점·디더링 없음.
반복: D1(단일 줄기·불투명 검보라 → 바위·쐐기로 읽힘, 반려) · D2(3방향 회전 겹침 → 삼각 윤곽, 폐기) → E(알파 표현, 알파 0.47) → F(알파 0.58·안쪽 #4a3066).
사용: python tools/vfx/regrid_dark_pack.py [출력폴더=assets/vfx]
"""
import os
import sys

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VFX = os.path.join(ROOT, 'assets', 'vfx')
DST = sys.argv[1] if len(sys.argv) > 1 else VFX


def hexc(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255


C_OUT, C_IN = hexc('#5e3478'), hexc('#4a3066')
C_DEEP, C_LAV, C_WHITE = hexc('#170c20'), hexc('#cdb2e0'), hexc('#f4ecff')
AMAX = 0.58
LUM_STOPS = [(0.0, C_DEEP), (0.30, C_OUT), (0.62, C_LAV), (1.0, C_WHITE)]


def ss(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def ramp(t, stops):
    out = np.zeros(t.shape + (3,), np.float32)
    ps = [p for p, _ in stops]
    for ch in range(3):
        out[..., ch] = np.interp(t, ps, [c[ch] for _, c in stops])
    return out


def premult(col, al):
    return np.concatenate([np.moveaxis(col * al[..., None], -1, 0), al[None]], 0)


# ───────── 연기 6x6: BW 알파 → 알파 표현 ─────────
BW = np.asarray(Image.open(os.path.join(VFX, 'Dark_Smoke_BW_6x6.png')))[..., 3].astype(np.float32) / 255
B6 = [round(i * 1024 / 6) for i in range(7)]  # 0,171,341,512,683,853,1024


def smoke_frame(i):
    r, c = divmod(i, 6)
    a = BW[B6[r]:B6[r + 1], B6[c]:B6[c + 1]].copy()
    # 원본의 8x8 블록형 저알파 얼룩·바닥 호선 제거: 블러 밀도가 낮은 곳은 걷어낸다
    a = a * ss(gaussian_filter(a, 2.0), 0.07, 0.19)
    # 원본 연기는 셀 바닥(y≈163)에서 평평하게 잘려 삼각 덩어리로 읽힌다 → 바닥 쪽을 부드럽게 페이드
    yy = np.arange(a.shape[0], dtype=np.float32)[:, None]
    a = a * (1 - ss(yy, 118, 165))
    a = np.clip(gaussian_filter(a, 1.8), 0, 1)          # 가장자리는 알파에만 반경 3~4px 블러
    al = AMAX * a ** 1.6                                 # 밀도→알파 감마 1.6, 몸체 최대 알파 0.58
    return premult(ramp(a, [(0, C_OUT), (1.0, C_IN)]), al)


def mist_frames():
    """Ice_MistSmoke_FBF_4x4(균일 청색 반투명 안개)를 같은 램프로 재채색 → 128px 프레임 16개(프리멀티플라이)"""
    im = np.asarray(Image.open(os.path.join(VFX, 'Ice_MistSmoke_FBF_4x4.png')).convert('RGBA')).astype(np.float32) / 255
    out = []
    for n in range(16):
        r, c = divmod(n, 4)
        a = np.clip(gaussian_filter(im[r * 128:(r + 1) * 128, c * 128:(c + 1) * 128, 3], 1.0) / 0.48, 0, 1)
        out.append(premult(ramp(a, [(0, C_OUT), (1.0, C_IN)]), AMAX * a ** 1.3))
    return out


def bbox(frames, thr):
    x0 = y0 = 1e9
    x1 = y1 = -1e9
    for f in frames:
        ys, xs = np.where(f[3] > thr)
        if len(xs):
            x0, x1, y0, y1 = min(x0, xs.min()), max(x1, xs.max()), min(y0, ys.min()), max(y1, ys.max())
    return x0, x1, y0, y1


def render(f, cell, k, cs, SS=2):
    """프리멀티플라이 f(4,h,w) → cell×cell. 원본 점 cs가 셀 중심, k=배율. SS배 슈퍼샘플 후 박스 축소"""
    n = cell * SS
    kk = k * SS
    c = cs[0] - n / 2 / kk
    fy = cs[1] - n / 2 / kk
    out = np.zeros((4, cell, cell), np.float32)
    for ch in range(4):
        im = Image.fromarray(f[ch], 'F').transform((n, n), Image.AFFINE, (1 / kk, 0, c, 0, 1 / kk, fy), Image.BICUBIC)
        out[ch] = np.asarray(im, np.float32).reshape(cell, SS, cell, SS).mean((1, 3))
    return np.clip(out, 0, 1)


def to_img(sheet_p):
    a = sheet_p[3]
    rgb = np.where(a[None] > 1e-4, sheet_p[:3] / np.maximum(a[None], 1e-4), 0)
    arr = np.dstack([np.moveaxis(np.clip(rgb, 0, 1), 0, -1), a]) * 255 + 0.5
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')


def smoke6():
    fr = [smoke_frame(i) for i in range(36)]
    x0, x1, y0, y1 = bbox(fr, 0.05)
    cs = ((x0 + x1) / 2, (y0 + y1) / 2)
    k = min(0.85 * 170 / max(x1 - x0, y1 - y0), 1.4)   # 합집합 bbox를 셀 85% 이내로(잘림 금지)
    sh = np.zeros((4, 1024, 1024), np.float32)
    for i in range(36):
        r, c = divmod(i, 6)
        h, w = B6[r + 1] - B6[r], B6[c + 1] - B6[c]
        sh[:, B6[r]:B6[r + 1], B6[c]:B6[c + 1]] = render(fr[i], 171, k, cs)[:, :h, :w]
    return to_img(sh)


def fbf4():
    fr = mist_frames()
    x0, x1, y0, y1 = bbox(fr, 0.04)
    cs = ((x0 + x1) / 2, (y0 + y1) / 2)
    k = 0.85 * 128 / max(x1 - x0, y1 - y0)
    sh = np.zeros((4, 512, 512), np.float32)
    for n, f in enumerate(fr):
        r, c = divmod(n, 4)
        sh[:, r * 128:(r + 1) * 128, c * 128:(c + 1) * 128] = render(f, 128, k, cs)
    return to_img(sh)


def recolor_impact(name, cols, cs):
    im = np.asarray(Image.open(os.path.join(VFX, name)).convert('RGBA')).astype(np.float32) / 255
    H, W = im.shape[:2]
    L = 0.299 * im[..., 0] + 0.587 * im[..., 1] + 0.114 * im[..., 2]
    yy, xx = np.mgrid[0:H, 0:W]
    fr = np.minimum(yy // cs, cols - 1) * cols + np.minimum(xx // cs, cols - 1)
    gain = np.where(fr <= 1, 1.0, np.where(fr == 2, 0.8, 0.66)).astype(np.float32)   # 최고 휘도 #f4ecff는 0~1프레임만
    out = np.dstack([ramp(np.clip(L * gain, 0, 1), LUM_STOPS), im[..., 3]])
    return Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGBA')


def main():
    os.makedirs(DST, exist_ok=True)
    jobs = [('Dark_Smoke_Sheet_6x6.png', smoke6), ('Dark_DarkSmoke_FBF_4x4.png', fbf4),
            ('Dark_MediumImpact.png', lambda: recolor_impact('Fire_MediumImpact.png', 4, 128)),
            ('Dark_BasicImpact.png', lambda: recolor_impact('Fire_BasicImpact.png', 3, 85))]
    for n, fn in jobs:
        im = fn()
        im.save(os.path.join(DST, n), optimize=True)
        print(os.path.join(DST, n), im.size)


if __name__ == '__main__':
    main()
