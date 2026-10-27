"""아케인·독 시트 5종 재채색 (VFX 총괄, 2026-10-27, VFX-02 2차 3묶음 · A안). 비용 0, AI 생성 없음.

원료(모두 게임에서 이미 쓰는 승인 에셋, 읽기 전용):
  assets/vfx/Fire_MediumImpact.png   512x512 4x4 (1묶음 C2 적용본, regrid_fire_pack.py 산출)
  assets/vfx/Fire_BasicImpact.png    256x256 3x3 (1묶음 C2 적용본)
  Arcane_Arcane_FBF_6x6.png 교체 전 마젠타 원본 — git blob 5621aee0 (교체 후에는 이 파일이 결과물이라 원료로 못 씀 → git 객체에서 읽음)
출력(원본 파일명·크기·격자 그대로 → game.html 수정 없이 교체):
  Poison_MediumImpact.png   512 4x4  휘도 → 독 램프(#1c2810/#5f8a2e/#c8e8a8, 0~1프레임만 #eef8e0) + 프레임마다 좌우 반전
  Poison_BasicImpact.png    256 3x3  같은 재채색·좌우 반전
  Arcane_MediumImpact.png   512 4x4  휘도 → 마력 램프(#161226/#6a56a8/#e4dcf4, 0~1프레임만 #f6f2fc) + 프레임마다 90° 회전
  Arcane_BasicImpact.png    256 3x3  같은 재채색·90° 회전
  Arcane_Arcane_FBF_6x6.png 512 6x6(셀 85) 마젠타 원본 형태 유지 → 알파=밀도로 #6a56a8→#e4dcf4, 5x5 미만 잔 얼룩은 알파 열기로 제거, 최대 알파 .85
알파는 직선 알파(알파 4배 인코딩 없음). 점·디더링 없음(임팩트의 4~6px 방울은 승인된 화염 팩 원료에서 이어진 것).
반려: FBF B안(Dark_Smoke_BW_6x6 → 마력 연기, 언덕 윤곽이 남아 탈락)
사용: python tools/vfx/regrid_arcpoi_pack.py [출력폴더=assets/vfx]
"""
import os
import subprocess
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.ndimage import gaussian_filter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VFX = os.path.join(ROOT, 'assets', 'vfx')
DST = sys.argv[1] if len(sys.argv) > 1 else VFX
ARC_FBF_ORIG_BLOB = '5621aee0fa292ae275c850f5e6cf1997cf4363ec'   # 교체 전 마젠타 Arcane_Arcane_FBF_6x6.png


def hexc(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255


POI = [(0.0, hexc('#1c2810')), (0.30, hexc('#5f8a2e')), (0.62, hexc('#c8e8a8')), (1.0, hexc('#eef8e0'))]
ARC = [(0.0, hexc('#161226')), (0.30, hexc('#6a56a8')), (0.62, hexc('#e4dcf4')), (1.0, hexc('#f6f2fc'))]


def ss(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def ramp(t, stops):
    out = np.zeros(t.shape + (3,), np.float32)
    ps = [p for p, _ in stops]
    for ch in range(3):
        out[..., ch] = np.interp(t, ps, [c[ch] for _, c in stops])
    return out


def load(name):
    return np.asarray(Image.open(os.path.join(VFX, name)).convert('RGBA')).astype(np.float32) / 255


def to_u8(a):
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')


def recolor_impact(src, cols, cs, stops, mode):
    im = load(src)
    out = np.zeros_like(im)
    for n in range(cols * cols):
        r, c = divmod(n, cols)
        cell = im[r * cs:(r + 1) * cs, c * cs:(c + 1) * cs]
        L = 0.299 * cell[..., 0] + 0.587 * cell[..., 1] + 0.114 * cell[..., 2]
        gain = 1.0 if n <= 1 else (0.8 if n == 2 else 0.66)   # 최고 휘도는 0~1프레임만
        rgb = ramp(np.clip(L * gain, 0, 1), stops)
        f = np.dstack([rgb, cell[..., 3]])
        if mode == 'flip':
            f = f[:, ::-1]                    # 좌우 반전
        elif mode == 'rot':
            f = np.rot90(f, 1)                # 90° 회전(반시계)
        out[r * cs:(r + 1) * cs, c * cs:(c + 1) * cs] = f
    return to_u8(out)


# ───────── Arcane FBF 6x6 (512², 셀 85px, 오프셋 i*85) ─────────
def arc_fbf_A():
    import io
    raw = subprocess.run(['git', '-C', ROOT, 'cat-file', 'blob', ARC_FBF_ORIG_BLOB], capture_output=True, check=True).stdout
    src = np.asarray(Image.open(io.BytesIO(raw)).convert('RGBA')).astype(np.float32) / 255
    out = np.zeros_like(src)
    kept_stats = []
    for n in range(36):
        r, c = divmod(n, 6)
        y0, x0 = r * 85, c * 85
        a = src[y0:y0 + 85, x0:x0 + 85, 3].copy()
        mask = a > 0.08
        opened = ndi.binary_opening(mask, structure=np.ones((5, 5), bool))
        lab, nl = ndi.label(mask, structure=np.ones((3, 3)))
        keep_ids = np.unique(lab[opened]); keep_ids = keep_ids[keep_ids > 0]
        keep = np.isin(lab, keep_ids)
        # 5x5 미만 잔 얼룩 제거 + 가장자리 살리기(keep 팽창 1px 안에서만 원 알파 유지)
        keep = ndi.binary_dilation(keep, iterations=1) & (a > 0.02)
        a2 = np.where(keep, a, 0)
        removed = int(mask.sum() - (a2 > 0.08).sum())
        kept_stats.append(removed)
        a2 = np.clip(gaussian_filter(a2, 0.6), 0, 1)
        al = 0.85 * a2
        rgb = ramp(np.clip(a2, 0, 1), [(0.0, hexc('#6a56a8')), (0.45, hexc('#6a56a8')), (1.0, hexc('#e4dcf4'))])
        out[y0:y0 + 85, x0:x0 + 85] = np.dstack([rgb, al])
    print('A removed px per frame sum', sum(kept_stats))
    return to_u8(out)


def main():
    os.makedirs(DST, exist_ok=True)
    jobs = [
        ('Poison_MediumImpact.png', lambda: recolor_impact('Fire_MediumImpact.png', 4, 128, POI, 'flip')),
        ('Poison_BasicImpact.png', lambda: recolor_impact('Fire_BasicImpact.png', 3, 85, POI, 'flip')),
        ('Arcane_MediumImpact.png', lambda: recolor_impact('Fire_MediumImpact.png', 4, 128, ARC, 'rot')),
        ('Arcane_BasicImpact.png', lambda: recolor_impact('Fire_BasicImpact.png', 3, 85, ARC, 'rot')),
        ('Arcane_Arcane_FBF_6x6.png', arc_fbf_A),
    ]
    for n, fn in jobs:
        im = fn()
        im.save(os.path.join(DST, n), optimize=True)
        print(os.path.join(DST, n), im.size)


if __name__ == '__main__':
    main()
