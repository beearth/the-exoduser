# HUD PBR 맵 미리보기 재조명 (Unity HudLitFrame 셰이더와 같은 식). Blender -b 안의 numpy만 쓴다.
#   blender.exe -b --factory-startup --python hud_relight.py -- --part skillbar --dir <bake 폴더> --out <png> [--bg <게임 캡처 png>]
import bpy, sys, os, math
import numpy as np

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(n, d): return argv[argv.index(n) + 1] if n in argv else d
PART = arg("--part", "skillbar"); D = arg("--dir", "I:/EXODUSER-Storage/hud/bake"); OUT = arg("--out", os.path.join(D, PART + "_relight.png"))
BG = arg("--bg", "")

def load(path):
    img = bpy.data.images.load(path); img.colorspace_settings.name = "Non-Color"
    a = np.array(img.pixels[:], dtype=np.float32).reshape(img.size[1], img.size[0], 4); bpy.data.images.remove(img); return a

def s2l(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def l2s(c): c = np.clip(c, 0, 1); return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)

al = load(os.path.join(D, PART + "_albedo.png")); nm = load(os.path.join(D, PART + "_normal.png")); pb = load(os.path.join(D, PART + "_pbr.png"))
alpha = al[..., 3:4]; albedo = s2l(al[..., :3])
N = nm[..., :3] * 2 - 1; N /= np.maximum(np.linalg.norm(N, axis=-1, keepdims=True), 1e-4)
eye = nm[..., 3:4]; ao = pb[..., 0:1]; rough = np.clip(pb[..., 1:2], 0.08, 1); metal = pb[..., 2:3]
V = np.array([0, 0, 1.0])

def ggx(N, L, rough, F0):
    H = (L + V); H /= np.linalg.norm(H)
    nl = np.clip((N * L).sum(-1, keepdims=True), 0, 1); nv = np.clip(N[..., 2:3], 1e-3, 1); nh = np.clip((N * H).sum(-1, keepdims=True), 0, 1)
    vh = max(float(np.dot(V, H)), 1e-3)
    a = rough * rough; a2 = a * a
    Dd = a2 / (math.pi * (nh * nh * (a2 - 1) + 1) ** 2)
    k = (rough + 1) ** 2 / 8; G = (nl / (nl * (1 - k) + k)) * (nv / (nv * (1 - k) + k))
    F = F0 + (1 - F0) * (1 - vh) ** 5
    return Dd * G * F / np.maximum(4 * nl * nv, 1e-3) * nl, nl

def shade(lights, env_top, env_bot, exposure=1.0):
    F0 = 0.04 * (1 - metal) + np.clip(albedo * 1.35, 0, 1) * metal
    diff = albedo * (1 - metal)
    col = np.zeros_like(albedo)
    for d, c in lights:
        L = np.array(d, dtype=np.float32); L /= np.linalg.norm(L)
        spec, nl = ggx(N, L, rough, F0)
        col += (diff / math.pi * nl + spec) * np.array(c)
    # 금속 환경 반사: 반사 벡터의 위(y)/아래로 단순 그라데이션, 거칠수록 평균색
    R = 2 * N[..., 2:3] * N - V
    t = np.clip(R[..., 1:2] * 0.5 + 0.5, 0, 1)
    env = np.array(env_bot) * (1 - t) + np.array(env_top) * t
    envAvg = (np.array(env_top) + np.array(env_bot)) / 2
    env = env * (1 - rough) + envAvg * rough
    col += env * F0 * (1 - 0.6 * rough) + diff * envAvg * 0.6
    col *= ao
    col += eye * np.array([0.55, 0.04, 0.02]) * 0.25   # 눈동자 약한 자체 발광
    return l2s(col * exposure)

variants = [
    ("달빛 왼쪽 위", [((-0.5, 0.6, 0.62), (2.6, 2.75, 3.0)), ((0.6, -0.3, 0.5), (0.35, 0.33, 0.32))]),
    ("달빛 오른쪽 위", [((0.55, 0.55, 0.62), (2.6, 2.75, 3.0)), ((-0.6, -0.3, 0.5), (0.35, 0.33, 0.32))]),
    ("저체력 붉은 빛(왼쪽 낮게)", [((-0.5, 0.6, 0.62), (1.6, 1.7, 1.9)), ((-0.9, -0.1, 0.35), (2.4, 0.35, 0.22))]),
]
rows = []
for name, lights in variants:
    c = shade(lights, (0.16, 0.17, 0.19), (0.015, 0.015, 0.018))
    bg = np.full_like(c, 0.04)
    if BG:
        b = load(BG)[..., :3]
        h, w = c.shape[:2]
        # 캡처 아래 가운데를 잘라 2배로 키워 배경으로(미리보기 전용)
        H0, W0 = b.shape[:2]
        sub = b[:h // 2, W0 // 2 - w // 4: W0 // 2 - w // 4 + w // 2]
        bg = np.repeat(np.repeat(sub, 2, 0), 2, 1)[:h, :w]
    rows.append(c * alpha + bg * (1 - alpha))
out = np.concatenate(rows[::-1], 0)   # Blender 이미지는 아래→위 순서
h, w = out.shape[:2]
img = bpy.data.images.new("relight", w, h, alpha=True); img.colorspace_settings.name = "Non-Color"
img.pixels[:] = np.concatenate([out, np.ones((h, w, 1), np.float32)], -1).ravel().tolist()
img.filepath_raw = OUT; img.file_format = "PNG"; img.save()
print("[hud_relight]", OUT, [v[0] for v in variants], flush=True)
