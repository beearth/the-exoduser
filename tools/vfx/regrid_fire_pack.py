"""화염 팩 시트 4종 재격자 (VFX 총괄, 2026-10-27, VFX-02 2차 1묶음 · C2안).

원본: assets/vfx/fieldboss/boss_fire_impact_24_20261010.png (3840x2560, 6x4, 640px 셀 24프레임, 승인 필드보스 화염 임팩트). 읽기 전용.
출력(원본 파일명·크기·격자 그대로 → game.html 수정 없이 교체):
  Fire_ImpactFire_Sheet.png 512x512 4x4 : 프레임 F16, 변형 없음
  Fire_MediumImpact.png     512x512 4x4 : 프레임 F16, 좌우 반전 + 90도 회전 (같은 위치에 겹쳐 나올 때 똑같아 보이지 않게)
  Fire_FBF_4x4.png          512x512 4x4 : 프레임 F16, 180도 회전
  Fire_BasicImpact.png      256x256 3x3 : 프레임 F9 (셀 85px)
프레임(원본 인덱스 = 행*6+열): F16 = [0*,3,5,6,7,8,9,10,11,13,15,17,19,21,22,23], F9 = [0*,3,5,7,9,12,15,19,22]
  0* = 원본 0프레임(백열 코어 별)을 셀 중심 기준 2.4배 확대(코어 지름이 셀의 약 35%) — 정점 +0.033~0.067초 원칙(VFX_LEAD_MASTER §2.7)
       셀 밖으로 잘리는 부분은 셀 경계 6px 안쪽에서 0, 12px 안쪽에서 1로 부드럽게 페이드(128px 셀 기준, 다른 셀 크기는 비례).
알파: 원본 직선 알파 그대로. 축소는 프리멀티플라이 상태 LANCZOS 후 되돌림(어두운 가장자리 방지). 밝기 보정·알파 재인코딩 없음.
  (_tvfx2는 'lighter', _addBoom은 source-over 이므로 알파 4배 인코딩은 쓰지 않는다 — 어두운 링·탁한 덩어리가 생김)
사용: python tools/vfx/regrid_fire_pack.py [출력폴더=assets/vfx]
"""
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'assets', 'vfx', 'fieldboss', 'boss_fire_impact_24_20261010.png')
DST = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'assets', 'vfx')
CW = 640  # 원본 셀
F16 = ['0*', 3, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 21, 22, 23]
F9 = ['0*', 3, 5, 7, 9, 12, 15, 19, 22]
ZOOM0 = 2.4


def load_src():
    return Image.open(SRC).convert('RGBA')


def cell(src, i):
    r, c = divmod(i, 6)
    return src.crop((c * CW, r * CW, (c + 1) * CW, (r + 1) * CW))


def down(im, s):
    a = np.asarray(im).astype(np.float32) / 255
    al = a[..., 3:4]
    pm = Image.fromarray((np.dstack([a[..., :3] * al, al]) * 255).clip(0, 255).astype(np.uint8), 'RGBA')
    sm = np.asarray(pm.resize((s, s), Image.LANCZOS)).astype(np.float32) / 255
    sa = sm[..., 3:4]
    col = np.where(sa > 1e-4, sm[..., :3] / np.maximum(sa, 1e-4), 0)
    return Image.fromarray((np.dstack([np.clip(col, 0, 1), sa]) * 255 + 0.5).astype(np.uint8), 'RGBA')


def cell0_big(src, cs):
    big = src.crop((0, 0, CW, CW))
    m = int(round(CW / ZOOM0))
    o = (CW - m) // 2
    big = big.crop((o, o, o + m, o + m)).resize((CW, CW), Image.LANCZOS)
    a = np.asarray(down(big, cs)).astype(np.float32)
    yy, xx = np.mgrid[0:cs, 0:cs]
    d = np.minimum(np.minimum(xx, cs - 1 - xx), np.minimum(yy, cs - 1 - yy)).astype(np.float32)
    e0, e1 = 6.0 * cs / 128, 12.0 * cs / 128
    t = np.clip((d - e0) / (e1 - e0), 0, 1)
    a[..., 3] *= t * t * (3 - 2 * t)
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')


def xf(im, mode):
    if mode == 'flip_rot90':
        return im.transpose(Image.FLIP_LEFT_RIGHT).transpose(Image.ROTATE_90)
    if mode == 'rot180':
        return im.transpose(Image.ROTATE_180)
    return im


def build(src, frames, cols, cs, canvas, mode, out):
    sh = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0))
    for n, f in enumerate(frames):
        c = cell0_big(src, cs) if f == '0*' else down(cell(src, f), cs)
        sh.paste(xf(c, mode), ((n % cols) * cs, (n // cols) * cs))
    sh.save(out, optimize=True)
    print(out, sh.size)


def main():
    os.makedirs(DST, exist_ok=True)
    src = load_src()
    build(src, F16, 4, 128, 512, None, os.path.join(DST, 'Fire_ImpactFire_Sheet.png'))
    build(src, F16, 4, 128, 512, 'flip_rot90', os.path.join(DST, 'Fire_MediumImpact.png'))
    build(src, F16, 4, 128, 512, 'rot180', os.path.join(DST, 'Fire_FBF_4x4.png'))
    build(src, F9, 3, 85, 256, None, os.path.join(DST, 'Fire_BasicImpact.png'))


if __name__ == '__main__':
    main()
