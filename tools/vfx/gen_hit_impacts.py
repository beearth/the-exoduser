"""원소 피격 임팩트 시트 절차 생성 (VFX 총괄, 2026-10-26).

대상: assets/vfx/impact_el{0..5}_sheet.png (9프레임, 85px 가로 한 줄)
      assets/vfx/impact_el{0..5}_boss_sheet.png (16프레임, 128px)
      assets/vfx/impact_basic_sheet.png (9프레임, 128px)
게임은 'lighter'(가산) 합성으로 그리므로 발광 성분만 만든다. 색은
docs/5.1임펙트디자인/VFX_LEAD_MASTER_20261026.md §2.2 원소 팔레트.

사용: python tools/vfx/gen_hit_impacts.py <출력폴더>
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

SS = 4  # 슈퍼샘플 배율

# el: (코어, 중간, 그림자) — VFX_LEAD_MASTER §2.2
PAL = {
    0: ('#efe6d2', '#9a8a72', '#2a2220'),  # 물리
    1: ('#ffd9a0', '#d8562a', '#4a1610'),  # 화염
    2: ('#e8f3f8', '#5f98c0', '#1a2a36'),  # 빙결 (게임 내 회색화 보정)
    3: ('#cdb2e0', '#5e3478', '#170c20'),  # 암흑
    4: ('#fff4d0', '#c8a848', '#2e2814'),  # 번개
    5: ('#fff2d6', '#c9a45e', '#3a2c18'),  # 신성
}
BASIC = ('#f4e2bc', '#b8864a', '#3a2614')  # 범용 폴백 = 뼈색+그을린 금


def hexc(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def env(t, a, peak, b):
    """a에서 시작해 peak에서 1, b에서 0."""
    if t <= a or t >= b:
        return 0.0
    if t < peak:
        return (t - a) / max(1e-6, peak - a)
    return (1 - (t - peak) / max(1e-6, b - peak)) ** 1.6


class Canvas:
    def __init__(self, size):
        self.n = size * SS
        self.buf = np.zeros((self.n, self.n, 3), np.float32)
        yy, xx = np.mgrid[0:self.n, 0:self.n].astype(np.float32)
        c = (self.n - 1) / 2
        self.dx, self.dy = xx - c, yy - c
        self.r = np.hypot(self.dx, self.dy)
        self.a = np.arctan2(self.dy, self.dx)

    def add(self, mask, col, k=1.0):
        self.buf += mask[..., None] * col[None, None, :] * k


def noise_field(n, seed, cells):
    """큰 덩어리 값 노이즈(cells×cells 격자 보간) — 가장자리만 불규칙하게, 잔점 금지."""
    rng = np.random.default_rng(seed)
    g = max(2, cells)
    small = rng.random((g, g)).astype(np.float32)
    im = Image.fromarray((small * 255).astype(np.uint8)).resize((n, n), Image.BICUBIC)
    return np.asarray(im, np.float32) / 255


def streak_mask(cv, ang, r0, r1, w, jag=0.0, seed=0):
    """중심에서 바깥으로 뻗는 가늘어지는 줄기. jag>0이면 번개처럼 꺾임."""
    if r1 <= r0:
        return np.zeros_like(cv.r)
    ca, sa = math.cos(ang), math.sin(ang)
    along = cv.dx * ca + cv.dy * sa
    perp = -cv.dx * sa + cv.dy * ca
    if jag > 0:
        rng = np.random.default_rng(seed)
        knots = rng.uniform(-1, 1, 7).astype(np.float32) * jag
        u = np.clip((along - r0) / (r1 - r0), 0, 1)
        perp = perp - np.interp(u, np.linspace(0, 1, 7), knots) * (r1 - r0) * 0.12
    u = (along - r0) / (r1 - r0)
    inside = (u >= 0) & (u <= 1)
    taper = np.clip(1 - u, 0, 1) ** 0.8 * np.clip(u * 6, 0, 1)
    width = w * (0.25 + 0.75 * taper)
    m = np.exp(-(perp / np.maximum(width, 1e-3)) ** 2) * taper
    return np.where(inside, m, 0).astype(np.float32)


def render_frame(size, t, el, pal, boss, seed):
    cv = Canvas(size)
    core, mid, shadow = (hexc(c) for c in pal)
    core = core * 0.45 + mid * 0.55  # 흰 코어가 원소색을 덮지 않게(게임 내 실측 2026-10-26)
    R = cv.n * 0.5
    rng = np.random.default_rng(seed)  # 프레임 간 같은 시드 → 형태 연속
    nz = noise_field(cv.n, seed + 7, 5)
    nz2 = noise_field(cv.n, seed + 11, 9)

    # 1) 코어 섬광: 0.12에서 정점, 0.4까지 소멸
    e = env(t, -0.01, 0.10, 0.42)
    if e > 0:
        cr = R * (0.06 + 0.12 * ease_out(t / 0.3))
        m = np.exp(-(cv.r / cr) ** 2) * e
        cv.add(m, core, 1.2)
        cv.add(np.exp(-(cv.r / (cr * 2.4)) ** 2) * e, mid, 0.9)

    # 2) 파편 줄기
    n_st = (13 if boss else 8) + (4 if el in (1, 5) else 0)
    bias = rng.uniform(0, 2 * math.pi)  # 분사 방향 쏠림(대칭 별 모양 회피)
    angs = bias + rng.normal(0, 1.1, n_st)
    lens = rng.uniform(0.55, 0.98, n_st)
    widths = rng.uniform(0.6, 1.0, n_st)
    delays = rng.uniform(0.0, 0.08, n_st)
    jag = 1.0 if el == 4 else 0.0
    w_base = R * (0.045 if el in (2, 4) else 0.055)
    for i in range(n_st):
        tt = (t - delays[i]) / 0.62
        if tt <= 0 or tt >= 1:
            continue
        grow = ease_out(tt * 1.4)
        r1 = R * lens[i] * (0.25 + 0.75 * grow)
        r0 = R * lens[i] * max(0.0, tt - 0.25) * 1.1  # 뒤꼬리가 따라 나가며 떨어짐
        fade = (1 - tt) ** 1.3
        w = w_base * widths[i] * (1.6 if el == 2 else 1.0)
        m = streak_mask(cv, angs[i], r0, r1, w, jag, seed * 31 + i)
        cv.add(m * fade, core, 0.4)
        cv.add(m * fade, mid, 2.3)

    # 3) 충격 링 (얇고 흐림, 노이즈로 끊김)
    e = env(t, 0.02, 0.10, 0.40)
    if e > 0:
        rr = R * (0.20 + 0.55 * ease_out((t - 0.02) / 0.38))
        th = R * (0.035 if boss else 0.028)
        brk = np.clip((nz2 - 0.35) * 2.5, 0, 1)  # 링을 큰 조각으로 끊음
        m = np.exp(-((cv.r - rr) / th) ** 2) * e * brk
        cv.add(m, mid, 0.45 if boss else 0.3)

    # 4) 원소 잔광 (가산이라 어두운 연기 대신 낮은 발광)
    e = env(t, 0.12, 0.35, 1.0)
    if e > 0:
        rr = R * (0.22 + 0.38 * ease_out(t))
        cloud = np.exp(-(cv.r / rr) ** 2) * (0.25 + 0.75 * nz) ** 1.5
        k = {3: 0.6, 1: 0.45}.get(el, 0.25) * (0.6 if boss else 1.0)
        cv.add(cloud * e, mid, k)
        cv.add(cloud * e, shadow, 0.6)

    # 5) 화염: 위로 솟는 혀 / 신성: 십자 광선
    if el == 1:
        for i in range(4 if not boss else 6):
            tt = (t - 0.05 - i * 0.03) / 0.7
            if 0 < tt < 1:
                a = -math.pi / 2 + rng.uniform(-0.9, 0.9)
                r1 = R * (0.35 + 0.35 * ease_out(tt))
                m = streak_mask(cv, a, R * 0.08 + r1 * tt * 0.5, r1, R * 0.07)
                m *= 0.5 + 0.5 * nz
                cv.add(m * (1 - tt) ** 1.5, mid, 0.9)
    if el == 5:
        e = env(t, -0.01, 0.12, 0.5)
        if e > 0:
            for a in (0, math.pi / 2, math.pi, 3 * math.pi / 2):
                m = streak_mask(cv, a, 0, R * (0.5 + 0.35 * ease_out(t / 0.4)), R * 0.018)
                cv.add(m * e, core, 1.3)

    img = cv.buf
    # 발광 번짐(글로우) — 블러 사본 가산
    pil = Image.fromarray(np.clip(img * 255, 0, 255).astype(np.uint8))
    glow = np.asarray(pil.filter(ImageFilter.GaussianBlur(cv.n * 0.03)), np.float32) / 255
    img = img + glow * 0.3
    # 톤 매핑: 코어만 밝고 채도 과포화 방지
    img = 1 - np.exp(-img * 1.6)
    # 게임은 알파 0.45 가산으로 그려 색이 묽어짐 → 중간톤 채도 보정(네온 수준 아님)
    lum = img.mean(axis=2, keepdims=True)
    img = np.clip(lum + (img - lum) * 2.0, 0, 1)
    # 다운샘플
    out = Image.fromarray(np.clip(img * 255, 0, 255).astype(np.uint8)).resize((size, size), Image.LANCZOS)
    rgb = np.asarray(out, np.float32) / 255
    # 가장자리 비네트(셀 밖으로 잘리는 것 방지)
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    rr = np.hypot(xx - (size - 1) / 2, yy - (size - 1) / 2) / (size / 2)
    rgb *= np.clip((1.0 - rr) / 0.12, 0, 1)[..., None]
    # 알파 인코딩: 게임 GL 경로는 업로드 시 프리멀티플라이(game.html UNPACK_PREMULTIPLY_ALPHA) 후
    # blendFunc(SRC_ALPHA, ONE)으로 그려 알파가 두 번 곱해진다. 알파를 4배로 올려 색 픽셀은 a=1에 가깝게 두고,
    # 색은 rgb/a로 보정 → GL(이중)에서 ≈rgb, Canvas2D 'lighter'(단일)에서 =rgb.
    a = np.clip(rgb.max(axis=2) * 4.0, 0, 1)
    col = np.where(a[..., None] > 1e-4, rgb / np.maximum(a[..., None], 1e-4), 0)
    col = np.clip(col, 0, 1)
    rgba = np.dstack([col, a])
    return Image.fromarray(np.clip(rgba * 255, 0, 255).astype(np.uint8), 'RGBA')


def sheet(size, frames, el, pal, boss, seed):
    out = Image.new('RGBA', (size * frames, size), (0, 0, 0, 0))
    for f in range(frames):
        t = f / (frames - 1) * 0.92 + 0.06  # 첫 프레임부터 섬광
        out.paste(render_frame(size, t, el, pal, boss, seed), (f * size, 0))
    return out


def main():
    dst = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(dst, exist_ok=True)
    for el, pal in PAL.items():
        # 원본 규격 유지(el5만 128px) — 게임은 프레임 크기에 비례해 그린다
        sheet(128 if el == 5 else 85, 9, el, pal, False, 100 + el).save(os.path.join(dst, f'impact_el{el}_sheet.png'), optimize=True)
        sheet(128, 16, el, pal, True, 200 + el).save(os.path.join(dst, f'impact_el{el}_boss_sheet.png'), optimize=True)
        print('el', el)
    sheet(128, 9, 0, BASIC, False, 99).save(os.path.join(dst, 'impact_basic_sheet.png'), optimize=True)
    print('done')


if __name__ == '__main__':
    main()
