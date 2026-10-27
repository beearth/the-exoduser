"""빙결·물 시트 6종 재채색 (VFX 총괄, 2026-10-27, VFX-02 2차 4묶음 · 빙결 A/B + 물 W2). 비용 0, AI 생성 없음.

원료(모두 게임에서 이미 쓰는 승인 에셋, 읽기 전용):
  assets/vfx/Fire_MediumImpact.png  512x512 4x4 (1묶음 C2 적용본)   assets/vfx/Fire_BasicImpact.png 256x256 3x3 (1묶음 C2)
  assets/vfx/Fire_FBF_4x4.png       512x512 4x4 (1묶음 C2, 찢긴 불혀)
  tools/vfx/src/Ice_MistSmoke_FBF_4x4_orig.png  교체 전 원본(균일 청색 반투명 안개, 알파 최대 .48)
출력(원본 파일명·크기·격자 그대로 → game.html 수정 없이 교체):
  Ice_BasicImpact.png         256 3x3  Fire_BasicImpact 휘도 → 빙결 램프(#1a2a36/#5f98c0/#e8f3f8) + 좌우 반전
  Ice_MediumImpact.png        512 4x4  Fire_MediumImpact → 빙결 램프 + 상하 반전 (2D에서는 로드 안 됨, 3D _V3_SHEETS iceMed 전용)
  Ice_ImpactIce_Sheet.png     512 4x4  Fire_MediumImpact → 빙결 램프 + 180° 회전
  Ice_MistSmoke_FBF_4x4.png   512 4x4  자기 형태 유지 — 밀도=알파(최대 .58, 감마 1.3), #4f8ab8→#9ccbe6
  Water_ImpactWater_Sheet.png 512 4x4  Fire_MediumImpact → 물 램프(#0f1c26/#3a6a88/#8db4c8/#dcebf0, 감마 1.6, 코어색은 0~1프레임만) + 90° 회전
  Water_Water_FBF_4x4.png     512 4x4  Fire_FBF_4x4(찢긴 불혀) → 같은 물 램프(감마 1.6, 상한 .70) + 프레임마다 좌우 반전, 최대 알파 .85
색상각: 6장 모두 채도 0.35 이상 픽셀 100%가 198~212°, 네온 시안·원색 파랑 0. 알파는 직선 알파(4배 인코딩 없음). 점·디더링 없음.
반려: 물 W1(Water_Water_FBF 자기 형태 + 알파 블러 2.5px — 탁한 덩어리), 물 1차(빙결과 같은 창백한 서리색, 원본 각진 블록 잔존)
Water_Water_FBF_4x4 교체 전 원본은 tools/vfx/src/Water_Water_FBF_4x4_orig.png 에 보존(현재 출력은 이 원본을 쓰지 않는다 — 기록용).
사용: python tools/vfx/regrid_icewater_pack.py [출력폴더=assets/vfx]
"""
import os
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VFX = os.path.join(ROOT, 'assets', 'vfx')
SRC = os.path.join(ROOT, 'tools', 'vfx', 'src')
DST = sys.argv[1] if len(sys.argv) > 1 else VFX


def hexc(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255


ICE = [(0.0, hexc('#1a2a36')), (0.30, hexc('#5f98c0')), (0.62, hexc('#e8f3f8')), (1.0, hexc('#f6fbfd'))]
WAT = [(0.0, hexc('#0f1c26')), (0.40, hexc('#3a6a88')), (0.70, hexc('#8db4c8')), (1.0, hexc('#dcebf0'))]


def ramp(t, stops):
    out = np.zeros(t.shape + (3,), np.float32)
    ps = [p for p, _ in stops]
    for ch in range(3):
        out[..., ch] = np.interp(t, ps, [c[ch] for _, c in stops])
    return out


def load(folder, name):
    return np.asarray(Image.open(os.path.join(folder, name)).convert('RGBA')).astype(np.float32) / 255


def to_u8(a):
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')


def recolor_impact(src, cols, cs, stops, mode, gam=1.0):
    im = load(VFX, src)
    out = np.zeros_like(im)
    for n in range(cols * cols):
        r, c = divmod(n, cols)
        cell = im[r * cs:(r + 1) * cs, c * cs:(c + 1) * cs]
        L = 0.299 * cell[..., 0] + 0.587 * cell[..., 1] + 0.114 * cell[..., 2]
        gain = 1.0 if n <= 1 else (0.8 if n == 2 else 0.66)   # 최고 휘도는 0~1프레임만
        tt = np.clip(L * gain, 0, 1) ** gam
        if gam != 1.0 and n > 1:
            tt = np.minimum(tt, 0.70)                          # 물: 코어색은 0~1프레임만
        f = np.dstack([ramp(tt, stops), cell[..., 3]])
        f = {'flip': lambda x: x[:, ::-1], 'vflip': lambda x: x[::-1], 'rot180': lambda x: x[::-1, ::-1], 'rot': lambda x: np.rot90(x, 1)}[mode](f)
        out[r * cs:(r + 1) * cs, c * cs:(c + 1) * cs] = f
    return to_u8(out)


def ice_mist():
    im = load(SRC, 'Ice_MistSmoke_FBF_4x4_orig.png')
    out = np.zeros_like(im)
    for n in range(16):
        r, c = divmod(n, 4)
        sl = (slice(r * 128, (r + 1) * 128), slice(c * 128, (c + 1) * 128))
        a = np.clip(gaussian_filter(im[sl][..., 3], 1.0) / 0.48, 0, 1)
        out[sl] = np.dstack([ramp(a, [(0.0, hexc('#4f8ab8')), (1.0, hexc('#9ccbe6'))]), 0.58 * a ** 1.3])
    return to_u8(out)


def water_fbf():
    im = load(VFX, 'Fire_FBF_4x4.png')
    out = np.zeros_like(im)
    for n in range(16):
        r, c = divmod(n, 4)
        sl = (slice(r * 128, (r + 1) * 128), slice(c * 128, (c + 1) * 128))
        cell = im[sl]
        L = 0.299 * cell[..., 0] + 0.587 * cell[..., 1] + 0.114 * cell[..., 2]
        tt = np.minimum(np.clip(L, 0, 1) ** 1.6, 0.70)
        f = np.dstack([ramp(tt, WAT), np.minimum(cell[..., 3], 0.85)])
        out[sl] = f[:, ::-1]
    return to_u8(out)


JOBS = [
    ('Ice_BasicImpact.png', lambda: recolor_impact('Fire_BasicImpact.png', 3, 85, ICE, 'flip')),
    ('Ice_MediumImpact.png', lambda: recolor_impact('Fire_MediumImpact.png', 4, 128, ICE, 'vflip')),
    ('Ice_ImpactIce_Sheet.png', lambda: recolor_impact('Fire_MediumImpact.png', 4, 128, ICE, 'rot180')),
    ('Ice_MistSmoke_FBF_4x4.png', ice_mist),
    ('Water_ImpactWater_Sheet.png', lambda: recolor_impact('Fire_MediumImpact.png', 4, 128, WAT, 'rot', 1.6)),
    ('Water_Water_FBF_4x4.png', water_fbf),
]

if __name__ == '__main__':
    os.makedirs(DST, exist_ok=True)
    for n, fn in JOBS:
        im = fn()
        im.save(os.path.join(DST, n), optimize=True)
        print(os.path.join(DST, n), im.size)
