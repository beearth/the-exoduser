# EXODUSER HUD 3D 부조 굽기 (11-08) — Blender 5.x 배치 모드 전용
#   blender.exe -b --factory-startup --python hud_bake.py -- --part skillbar --out <폴더> [--scale 2]
# 1 Blender 단위 = 1080p 화면 1px. 정사영 카메라로 위에서 찍어 PBR 맵을 만든다.
# 결과: <part>_albedo.png(sRGB, 알파=윤곽), <part>_normal.png(접선 노멀, 알파=눈동자 마스크),
#       <part>_pbr.png(R=AO, G=거칠기, B=금속, A=높이) — 모두 선형 값(albedo 제외).
# 콘셉트: 지옥문 봉인 장치. 스킬바 = 봉인문 쇠 문턱, 칸 = 봉인 쐐기 자리, 버팀 기둥, 가운데 M1 지옥의 눈.
import bpy, bmesh, math, sys, os
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(name, default):
    return argv[argv.index(name) + 1] if name in argv else default
PART = arg("--part", "skillbar")
OUT = arg("--out", "I:/EXODUSER-Storage/hud/bake")
SCALE = float(arg("--scale", "2"))
os.makedirs(OUT, exist_ok=True)

# ---------- 장면 초기화 ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.render.film_transparent = True
scene.cycles.use_denoising = False
scene.render.filter_size = 1.2

# ---------- 재질: 값 표 ----------
# kind: iron(어두운 강철, 모서리 은빛 마모), floor(칸 바닥 비금속), eye(진홍 홍채), pupil(검은 세로 틈)
MAT_SPECS = {
    "iron":   dict(base=(0.045, 0.046, 0.05), metal=1.0, rough=0.74, wear=0.35, height_mask=0.0),
    "iron_hi":dict(base=(0.16, 0.162, 0.168),  metal=1.0, rough=0.38, wear=0.6, height_mask=0.0),
    "floor":  dict(base=(0.008, 0.008, 0.009),  metal=0.0, rough=0.9, wear=0.0,  height_mask=0.0),
    "eye":    dict(base=(0.50, 0.035, 0.02),   metal=0.0, rough=0.35, wear=0.0,  height_mask=1.0),
    "pupil":  dict(base=(0.01, 0.005, 0.004),  metal=0.0, rough=0.30, wear=0.0,  height_mask=0.0),
}
SILVER = (0.62, 0.615, 0.60)
PASS = {"name": "albedo"}   # 렌더할 맵 이름 — 재질 노드가 이 값을 내보낸다
MATS = {}

def build_material(kind):
    spec = MAT_SPECS[kind]
    m = bpy.data.materials.new(kind)
    m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    N = nt.nodes.new; L = nt.links.new
    out = N("ShaderNodeOutputMaterial")
    emit = N("ShaderNodeEmission"); emit.inputs["Strength"].default_value = 1.0
    L(emit.outputs[0], out.inputs["Surface"])
    geo = N("ShaderNodeNewGeometry")
    bev = N("ShaderNodeBevel"); bev.samples = 16; bev.inputs["Radius"].default_value = 1.1
    # 모서리 마모 = 기하 노멀과 둥근(베벨) 노멀의 차이
    dot = N("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"
    L(geo.outputs["Normal"], dot.inputs[0]); L(bev.outputs["Normal"], dot.inputs[1])
    inv = N("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
    L(dot.outputs["Value"], inv.inputs[1])
    edge = N("ShaderNodeMath"); edge.operation = "MULTIPLY"; edge.use_clamp = True; edge.inputs[1].default_value = 9.0
    L(inv.outputs[0], edge.inputs[0])
    # 위를 향한 넓은 면 마모(밟고 닦인 윗면) — 아주 약하게
    sep = N("ShaderNodeSeparateXYZ"); L(bev.outputs["Normal"], sep.inputs[0])
    # 큰 얼룩(점 금지: 주파수 낮게, 디테일 1)
    tc = N("ShaderNodeTexCoord")
    noise = N("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 0.035; noise.inputs["Detail"].default_value = 1.0
    noise.inputs["Roughness"].default_value = 0.3
    L(tc.outputs["Object"], noise.inputs["Vector"])
    mott = N("ShaderNodeMapRange"); mott.inputs["To Min"].default_value = 0.82; mott.inputs["To Max"].default_value = 1.12
    L(noise.outputs["Fac"], mott.inputs["Value"])
    basec = N("ShaderNodeRGB"); basec.outputs[0].default_value = (*spec["base"], 1)
    mottc = N("ShaderNodeVectorMath"); mottc.operation = "SCALE"
    L(basec.outputs[0], mottc.inputs[0]); L(mott.outputs["Result"], mottc.inputs["Scale"])
    wearf = N("ShaderNodeMath"); wearf.operation = "MULTIPLY"; wearf.inputs[1].default_value = spec["wear"]
    L(edge.outputs[0], wearf.inputs[0])
    silver = N("ShaderNodeRGB"); silver.outputs[0].default_value = (*SILVER, 1)
    mix = N("ShaderNodeMix"); mix.data_type = "RGBA"
    L(wearf.outputs[0], mix.inputs["Factor"]); L(mottc.outputs[0], mix.inputs[6]); L(silver.outputs[0], mix.inputs[7])
    # 거칠기: 모서리는 닦여서 낮다
    rough = N("ShaderNodeMapRange"); rough.inputs["From Min"].default_value = 0; rough.inputs["From Max"].default_value = 1
    rough.inputs["To Min"].default_value = spec["rough"]; rough.inputs["To Max"].default_value = max(0.28, spec["rough"] - 0.3)
    L(wearf.outputs[0], rough.inputs["Value"])
    # 노멀 → 0..1
    ncol = N("ShaderNodeVectorMath"); ncol.operation = "MULTIPLY_ADD"
    L(bev.outputs["Normal"], ncol.inputs[0]); ncol.inputs[1].default_value = (0.5, 0.5, 0.5); ncol.inputs[2].default_value = (0.5, 0.5, 0.5)
    # AO
    ao = N("ShaderNodeAmbientOcclusion"); ao.samples = 32; ao.inputs["Distance"].default_value = 9.0
    # 높이(월드 Z / 24)
    posz = N("ShaderNodeSeparateXYZ"); L(geo.outputs["Position"], posz.inputs[0])
    hz = N("ShaderNodeMath"); hz.operation = "DIVIDE"; hz.inputs[1].default_value = 24.0; hz.use_clamp = True
    L(posz.outputs["Z"], hz.inputs[0])
    val = lambda v: (v, v, v, 1)
    sources = {
        "albedo": mix.outputs[2],
        "normal": ncol.outputs[0],
        "ao": ao.outputs["AO"],
        "rough": rough.outputs["Result"],
        "height": hz.outputs[0],
    }
    m["sources"] = list(sources.keys())
    MATS[kind] = (m, sources, emit, spec)
    return m

def set_pass(name):
    for kind, (m, sources, emit, spec) in MATS.items():
        nt = m.node_tree
        for l in list(emit.inputs["Color"].links): nt.links.remove(l)
        if name in sources:
            nt.links.new(sources[name], emit.inputs["Color"])
        elif name == "metal":
            emit.inputs["Color"].default_value = (spec["metal"],) * 3 + (1,)
        elif name == "eye":
            emit.inputs["Color"].default_value = (spec["height_mask"],) * 3 + (1,)

for k in MAT_SPECS: build_material(k)

# ---------- 형상 도우미 ----------
def link(obj):
    bpy.context.collection.objects.link(obj); return obj

def prism(name, outline, z0, z1, mat, bevel=1.2, segs=3):
    """2D 윤곽(반시계)을 z0..z1로 밀어 올린 기둥 + 베벨."""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    vb = [bm.verts.new((x, y, z0)) for x, y in outline]
    f = bm.faces.new(vb)
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    top = [v for v in r["geom"] if isinstance(v, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=top, vec=(0, 0, z1 - z0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); o.data.materials.append(MATS[mat][0])
    if bevel > 0:
        b = o.modifiers.new("bev", "BEVEL"); b.width = bevel; b.segments = segs; b.limit_method = "ANGLE"
        b.angle_limit = math.radians(30); b.harden_normals = False
    return o

def box(name, x0, y0, x1, y1, z0, z1, mat, bevel=0.0):
    return prism(name, [(x0, y0), (x1, y0), (x1, y1), (x0, y1)], z0, z1, mat, bevel)

def cut(target, cutter):
    m = target.modifiers.new("cut_" + cutter.name, "BOOLEAN"); m.operation = "DIFFERENCE"; m.object = cutter; m.solver = "EXACT"
    cutter.hide_render = True

def add_bevel(o, width, segs=3):
    b = o.modifiers.new("bev", "BEVEL"); b.width = width; b.segments = segs; b.limit_method = "ANGLE"
    b.angle_limit = math.radians(30)

def rod(name, pts, z, radius, mat, cap=True):
    cu = bpy.data.curves.new(name, "CURVE"); cu.dimensions = "3D"
    sp = cu.splines.new("POLY"); sp.points.add(len(pts) - 1)
    for i, (x, y) in enumerate(pts): sp.points[i].co = (x, y, z, 1)
    cu.bevel_depth = radius; cu.bevel_resolution = 4; cu.use_fill_caps = cap
    o = link(bpy.data.objects.new(name, cu)); o.data.materials.append(MATS[mat][0]); return o

def cone(name, base, tip, r, mat, verts=12):
    d = Vector(tip) - Vector(base); L = d.length
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=0, depth=L, location=(Vector(base) + Vector(tip)) / 2)
    o = bpy.context.active_object; o.name = name
    o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d)
    o.data.materials.append(MATS[mat][0])
    bpy.ops.object.shade_smooth(); return o

def sphere(name, loc, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1, location=loc)
    o = bpy.context.active_object; o.name = name; o.scale = scale; o.data.materials.append(MATS[mat][0])
    bpy.ops.object.shade_smooth(); return o

def torus(name, loc, R, r, mat):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=64, minor_segments=12, location=loc)
    o = bpy.context.active_object; o.name = name; o.data.materials.append(MATS[mat][0])
    bpy.ops.object.shade_smooth(); return o

def annulus(name, cx, cy, r0, r1, z0, z1, mat, bevel=1.0, verts=96):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=False, radius=r1, segments=verts)
    outer = list(bm.verts)
    bmesh.ops.create_circle(bm, cap_ends=False, radius=r0, segments=verts)
    inner = [v for v in bm.verts if v not in outer]
    bm.verts.ensure_lookup_table()
    for i in range(verts):
        bm.faces.new([outer[i], outer[(i + 1) % verts], inner[(i + 1) % verts], inner[i]])
    for v in bm.verts: v.co.z = z0
    r = bmesh.ops.extrude_face_region(bm, geom=list(bm.faces))
    top = [v for v in r["geom"] if isinstance(v, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=top, vec=(0, 0, z1 - z0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); o.location = (cx, cy, 0); o.data.materials.append(MATS[mat][0])
    if bevel > 0: add_bevel(o, bevel, 2)
    return o

def arch_points(cx, base_y, half_w, peak_y, n=10):
    """고딕 뾰족 아치(두 원호). 왼쪽 밑 → 꼭대기 → 오른쪽 밑."""
    # 각 원호 중심은 반대편 밑점 근처, 반지름은 꼭대기를 지나게
    h = peak_y - base_y
    R = (half_w * half_w + h * h) / (2 * half_w)
    pts = []
    cxl = cx - half_w + R  # 왼쪽 호의 중심(오른쪽에 있음)
    a0 = math.pi; a1 = math.atan2(h, -(R - half_w)) if R != half_w else math.pi / 2
    a1 = math.atan2(h, (cx - cxl))
    for i in range(n + 1):
        a = a0 + (a1 - a0) * i / n
        pts.append((cxl + R * math.cos(a), base_y + R * math.sin(a)))
    right = [(2 * cx - x, y) for x, y in reversed(pts[:-1])]
    return pts + right

# ---------- 스킬바 ----------
SLOT, GAP, GROUP_GAP = 46, 6, 22
GROUPS = [6, 2, 5]
def slot_xs():
    xs = []; x = -(sum(GROUPS) * SLOT + (sum(GROUPS) - len(GROUPS)) * GAP + (len(GROUPS) - 1) * GROUP_GAP) / 2
    gaps = []
    for gi, n in enumerate(GROUPS):
        for i in range(n):
            xs.append(x); x += SLOT + (GAP if i < n - 1 else 0)
        if gi < len(GROUPS) - 1:
            gaps.append(x + GROUP_GAP / 2); x += GROUP_GAP
    return xs, gaps

def build_skillbar():
    HW = 372; TOP = 76; BOT = 2
    CY = 54; R = 23                      # 소켓 중심 y, 안쪽 반지름(지름 46)
    LABEL_Y0, LABEL_Y1 = 9, 25
    xs, gaps = slot_xs()
    cxs = [x + SLOT / 2 for x in xs]
    # 판 윤곽: 양 끝은 위아래로 꺾인 쇠 꺾쇠, 가운데 위는 뾰족 아치(눈 자리)
    arch = arch_points(0, TOP, 34, 112, 14)
    top_edge = [(HW - 10, TOP)] + [(x, y) for x, y in reversed(arch)] + [(-HW + 10, TOP)]
    outline = [(-HW + 22, BOT), (HW - 22, BOT), (HW - 6, BOT + 10), (HW + 8, BOT + 4), (HW + 2, BOT + 22),
               (HW, TOP - 16), (HW + 10, TOP + 2)] + top_edge + [(-HW - 10, TOP + 2), (-HW, TOP - 16),
               (-HW - 2, BOT + 22), (-HW - 8, BOT + 4), (-HW + 6, BOT + 10)]
    plate = prism("plate", outline, 0, 6, "iron_hi", bevel=0)
    face = prism("face", [(-HW + 26, BOT + 6), (HW - 26, BOT + 6), (HW - 7, BOT + 24), (HW - 7, TOP - 7), (-HW + 7, TOP - 7), (-HW + 7, BOT + 24)], 0, 3.7, "iron", bevel=0)
    # 안쪽 판(한 단 낮게): 테두리 6px가 솟은 틀로 읽힌다
    inner = [(-HW + 26, BOT + 6), (HW - 26, BOT + 6), (HW - 7, BOT + 24), (HW - 7, TOP - 7), (-HW + 7, TOP - 7), (-HW + 7, BOT + 24)]
    ic = prism("innercut", inner, 3.6, 20, "iron", bevel=0); cut(plate, ic)
    # 소켓 구멍
    for i, cx in enumerate(cxs):
        bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=R + 0.5, depth=20, location=(cx, CY, 11.5))
        c = bpy.context.active_object; c.name = f"sockcut{i}"; cut(plate, c); cut(face, c)
    add_bevel(plate, 1.5); add_bevel(face, 0.8, 2)
    # 키 글자 홈(무리마다 한 줄) — 안쪽 판보다 한 번 더 낮게
    idx = 0
    for gi, n in enumerate(GROUPS):
        x0 = xs[idx] + 2; x1 = xs[idx + n - 1] + SLOT - 2; idx += n
        g = prism(f"labelband{gi}", [(x0, LABEL_Y0), (x1, LABEL_Y0), (x1, LABEL_Y1), (x0, LABEL_Y1)], 3.0, 4.0, "floor", bevel=0)
    # 소켓 바닥(무광 비금속) + 은빛 원형 테(봉인 쐐기 고리) + 네 방위 작은 못
    for i, cx in enumerate(cxs):
        bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=R + 1, depth=1.6, location=(cx, CY, 0.8))
        f = bpy.context.active_object; f.data.materials.append(MATS["floor"][0])
        # 단조 고리: 납작한 띠(윗면 평평, 모서리 깎임) + 안쪽 가는 턱
        ring = annulus(f"rim{i}", cx, CY, R + 0.6, R + 5.0, 4.0, 8.2, "iron_hi", bevel=1.1)
        torus(f"rimin{i}", (cx, CY, 4.4), R + 0.1, 0.8, "iron")
        for k in range(4):
            a = math.pi / 4 + k * math.pi / 2
            sphere(f"stud{i}{k}", (cx + (R + 4.6) * math.cos(a), CY + (R + 4.6) * math.sin(a), 6.0), (1.5, 1.5, 1.3), "iron_hi")
    # 성문 창살 끝: 같은 무리 안 이웃 소켓 사이 윗선에 짧은 이빨(지옥문 문턱의 창살)
    idx = 0
    for gi, n in enumerate(GROUPS):
        for i in range(n - 1):
            mx = (cxs[idx + i] + cxs[idx + i + 1]) / 2
            prism(f"tooth{gi}{i}", [(mx - 2.6, TOP - 4), (mx + 2.6, TOP - 4), (mx, TOP + 7)], 5.5, 9.0, "iron_hi", bevel=0.7, segs=2)
            # 아래 사이에는 작은 마름모(M3 가운데 마름모)
            prism(f"diam{gi}{i}", [(mx, CY - R - 1), (mx + 2.4, CY - R - 4.5), (mx, CY - R - 8), (mx - 2.4, CY - R - 4.5)], 4.6, 7.4, "iron_hi", bevel=0.6, segs=2)
        idx += n
    # 버팀 기둥: 무리 사이, 위로 뾰족탑, 아래로 짧은 가시
    for gi, gx in enumerate(gaps):
        prism(f"buttress{gi}", [(gx - 4.5, BOT + 2), (gx, BOT - 7), (gx + 4.5, BOT + 2), (gx + 4.5, TOP - 1), (gx, TOP + 13), (gx - 4.5, TOP - 1)],
              5.0, 11.0, "iron_hi", bevel=1.3, segs=3)
        cone(f"finial{gi}", (gx, TOP + 11, 8.0), (gx, TOP + 21, 8.0), 1.9, "iron_hi")
    # 위 몰딩: 아치를 따라 오른다. 양 끝은 M3 가시
    top_rod = [(-HW + 6, TOP - 2.6), (-37, TOP - 2.6)] + [(x, y - 3.2) for x, y in arch_points(0, TOP - 2.6, 35, 108.5, 14)] + [(37, TOP - 2.6), (HW - 6, TOP - 2.6)]
    rod("toprod", top_rod, 6.5, 1.8, "iron_hi")
    cone("spikeL", (-HW + 6, TOP - 2.6, 6.5), (-HW - 16, TOP + 3, 6.5), 1.8, "iron_hi")
    cone("spikeR", (HW - 6, TOP - 2.6, 6.5), (HW + 16, TOP + 3, 6.5), 1.8, "iron_hi")
    rod("botrod", [(-HW + 24, BOT + 3.2), (HW - 24, BOT + 3.2)], 6.0, 2.4, "iron")
    cone("bspikeL", (-HW + 24, BOT + 3.2, 6.0), (-HW - 4, BOT - 1, 6.0), 2.4, "iron")
    cone("bspikeR", (HW - 24, BOT + 3.2, 6.0), (HW + 4, BOT - 1, 6.0), 2.4, "iron")
    # 끝 꺾쇠의 리벳(구슬 받침과 이어질 자리)
    for sx in (-1, 1):
        for y in (22, 52):
            sphere(f"rivet{sx}{y}", (sx * (HW - 1), y, 6.0), (2.8, 2.8, 2.0), "iron_hi")
    # M1 지옥의 눈: 가시 고리 + 진홍 홍채 + 세로 눈동자 (주공격 LMB 칸 바로 위)
    ec = (0, 98.5)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=10.5, depth=2.0, location=(ec[0], ec[1], 6.5))
    disc = bpy.context.active_object; disc.data.materials.append(MATS["floor"][0])
    torus("eyering", (ec[0], ec[1], 8.0), 11.6, 1.8, "iron_hi")
    for k in range(16):
        a = math.pi / 2 + k * 2 * math.pi / 16
        if k in (7, 8, 9):  # 아래 가시는 문턱에 묻힌다
            continue
        L = 6.5 if k % 2 == 0 else 3.6
        b = (ec[0] + 12.6 * math.cos(a), ec[1] + 12.6 * math.sin(a), 8.0)
        t = (ec[0] + (12.6 + L) * math.cos(a), ec[1] + (12.6 + L) * math.sin(a), 8.0)
        cone(f"eyespike{k}", b, t, 1.4 if k % 2 == 0 else 1.0, "iron_hi", 8)
    sphere("iris", (ec[0], ec[1], 7.4), (7.6, 4.2, 1.8), "eye")
    sphere("pupil", (ec[0], ec[1], 8.6), (1.2, 3.5, 1.0), "pupil")
    return (800, 128, 0, 60)   # 화면 폭, 높이, 중심 x, 중심 y (Blender 단위)

# ---------- 렌더 ----------
def render_maps(canvas):
    W, H, cx, cy = canvas
    cam_data = bpy.data.cameras.new("cam"); cam_data.type = "ORTHO"; cam_data.ortho_scale = W
    cam = link(bpy.data.objects.new("cam", cam_data)); cam.location = (cx, cy, 200); scene.camera = cam
    scene.render.resolution_x = int(W * SCALE); scene.render.resolution_y = int(H * SCALE); scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"; scene.render.image_settings.color_mode = "RGBA"; scene.render.image_settings.color_depth = "16"
    world = bpy.data.worlds.new("w"); scene.world = world
    results = {}
    for name, samples, view in [("albedo", 24, "Standard"), ("normal", 24, "Raw"), ("rough", 16, "Raw"), ("metal", 16, "Raw"), ("height", 16, "Raw"), ("ao", 96, "Raw"), ("eye", 16, "Raw")]:
        set_pass(name)
        scene.cycles.samples = samples
        scene.view_settings.view_transform = view; scene.view_settings.look = "None"
        scene.view_settings.exposure = 0; scene.view_settings.gamma = 1
        path = os.path.join(OUT, f"{PART}_{name}_raw.png"); scene.render.filepath = path
        bpy.ops.render.render(write_still=True)
        img = bpy.data.images.load(path); img.colorspace_settings.name = "Non-Color"
        a = np.array(img.pixels[:], dtype=np.float32).reshape(img.size[1], img.size[0], 4)
        results[name] = a; bpy.data.images.remove(img)
        print("[hud_bake] rendered", name, a.shape, flush=True)
    return results

def save_png(path, arr, srgb=False):
    h, w, _ = arr.shape
    img = bpy.data.images.new(os.path.basename(path), w, h, alpha=True, float_buffer=False)
    img.colorspace_settings.name = "sRGB" if srgb else "Non-Color"
    img.pixels[:] = np.clip(arr, 0, 1).ravel().tolist()
    img.filepath_raw = path; img.file_format = "PNG"; img.save(); bpy.data.images.remove(img)

def pack(results):
    al = results["albedo"]; alpha = al[..., 3:4]
    def premul_fix(a):
        # 가장자리 반투명 픽셀은 알파로 나눠 원래 값 복원(투명 렌더는 곱해진 값)
        c = a[..., :3] / np.maximum(alpha, 1e-4)
        return np.where(alpha > 1e-4, c, 0)
    albedo = np.concatenate([premul_fix(al), alpha], -1)
    normal = np.concatenate([premul_fix(results["normal"]), premul_fix(results["eye"])[..., :1]], -1)
    normal[..., :3] = np.where(alpha > 1e-4, normal[..., :3], np.array([0.5, 0.5, 1.0]))
    pbr = np.concatenate([premul_fix(results["ao"])[..., :1], premul_fix(results["rough"])[..., :1],
                          premul_fix(results["metal"])[..., :1], premul_fix(results["height"])[..., :1]], -1)
    # 곡률 마모: 높이의 라플라시안으로 볼록 모서리는 은빛·매끈, 오목 틈은 어둡게(점 없이 흐리게)
    hgt = pbr[..., 3] * 24.0
    def blur(a, r=2):
        k = 2 * r + 1; p = np.pad(a, r, mode="edge"); c = np.cumsum(np.cumsum(p, 0), 1)
        c = np.pad(c, ((1, 0), (1, 0)))
        return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)
    hb = blur(hgt, 1)
    lap = (np.roll(hb, 1, 0) + np.roll(hb, -1, 0) + np.roll(hb, 1, 1) + np.roll(hb, -1, 1) - 4 * hb)
    lap = blur(lap, 1)
    convex = np.clip(-lap * 0.55, 0, 1) * (alpha[..., 0] > 0.5)
    concave = np.clip(lap * 0.35, 0, 1) * (alpha[..., 0] > 0.5)
    met = pbr[..., 2]
    silver = np.array([0.80, 0.795, 0.78])   # sRGB
    w = (convex * 0.85 * met)[..., None]
    albedo[..., :3] = albedo[..., :3] * (1 - w) + silver * w
    albedo[..., :3] *= (1 - 0.45 * concave)[..., None]
    pbr[..., 1] = np.clip(pbr[..., 1] - 0.32 * convex * met, 0.2, 1)
    save_png(os.path.join(OUT, f"{PART}_curv.png"), np.stack([convex, concave, np.zeros_like(convex), alpha[..., 0]], -1))
    save_png(os.path.join(OUT, f"{PART}_albedo.png"), albedo, srgb=True)
    save_png(os.path.join(OUT, f"{PART}_normal.png"), normal)
    save_png(os.path.join(OUT, f"{PART}_pbr.png"), pbr)
    # 통계: 알베도 명도, 금속 비율
    m = alpha[..., 0] > 0.5
    lum = (0.2126 * albedo[..., 0] + 0.7152 * albedo[..., 1] + 0.0722 * albedo[..., 2])[m]
    print("[hud_bake] albedo luminance p50=%.3f p90=%.3f p99=%.3f metal=%.2f rough_p50=%.2f" % (
        np.percentile(lum, 50), np.percentile(lum, 90), np.percentile(lum, 99), pbr[..., 2][m].mean(), np.percentile(pbr[..., 1][m], 50)), flush=True)

BUILDERS = {"skillbar": build_skillbar}
canvas = BUILDERS[PART]()
bpy.context.view_layer.update()
res = render_maps(canvas)
pack(res)
for n in res:
    try: os.remove(os.path.join(OUT, f"{PART}_{n}_raw.png"))
    except OSError: pass
print("[hud_bake] done", OUT, flush=True)
