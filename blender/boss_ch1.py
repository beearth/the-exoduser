"""
HELL: EXODUSER CH1 Boss v2 — Corrupted Stag Apostle
=====================================================
부패한 숲의 거대 사슴 사도 (베르세르크 식육귀 레퍼런스)
셀셰이딩 + Freestyle 아웃라인 + Armature 리깅 + 7종 애니메이션

실행: blender --background --python boss_ch1.py --render-anim
GUI: Scripting 탭 → Open → Alt+P → Ctrl+F12
"""

import bpy
import math
import bmesh
from mathutils import Vector, Euler

# ═══════════════════════════════════════════════
# 0. 씬 초기화
# ═══════════════════════════════════════════════
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for c in list(bpy.data.collections):
    bpy.data.collections.remove(c)
for m in list(bpy.data.meshes):
    bpy.data.meshes.remove(m)
for mat in list(bpy.data.materials):
    bpy.data.materials.remove(mat)
for a in list(bpy.data.armatures):
    bpy.data.armatures.remove(a)

scene = bpy.context.scene
scene.frame_start = 0
scene.frame_end = 95
scene.render.fps = 24


# ═══════════════════════════════════════════════
# 유틸리티
# ═══════════════════════════════════════════════
def deselect_all():
    bpy.ops.object.select_all(action='DESELECT')

def select_only(obj):
    deselect_all()
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

def add_subsurf(obj, levels=2, render_levels=2):
    mod = obj.modifiers.new('Subsurf', 'SUBSURF')
    mod.levels = levels
    mod.render_levels = render_levels

def make_cel_mat(name, base_color, dark_color, mid_color, light_color, emission=None, em_strength=0):
    """셀셰이딩 머티리얼: Diffuse BSDF → Shader to RGB → ColorRamp (3단계)"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    nodes = tree.nodes
    links = tree.links
    # 기존 노드 제거
    for n in list(nodes):
        nodes.remove(n)
    # Diffuse BSDF
    diffuse = nodes.new('ShaderNodeBsdfDiffuse')
    diffuse.inputs['Color'].default_value = (*base_color, 1.0)
    diffuse.location = (-400, 300)
    # Shader to RGB
    s2rgb = nodes.new('ShaderNodeShaderToRGB')
    s2rgb.location = (-200, 300)
    links.new(diffuse.outputs['BSDF'], s2rgb.inputs['Shader'])
    # ColorRamp (3단계 셀셰이딩)
    ramp = nodes.new('ShaderNodeValToRGB')
    ramp.location = (0, 300)
    cr = ramp.color_ramp
    cr.interpolation = 'CONSTANT'
    # 3 stops: dark / mid / light
    cr.elements[0].position = 0.0
    cr.elements[0].color = (*dark_color, 1.0)
    cr.elements[1].position = 0.4
    cr.elements[1].color = (*mid_color, 1.0)
    e2 = cr.elements.new(0.7)
    e2.color = (*light_color, 1.0)
    links.new(s2rgb.outputs['Color'], ramp.inputs['Fac'])
    # Output
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (400, 300)
    if emission:
        # Mix emission with cel shade
        emit = nodes.new('ShaderNodeEmission')
        emit.inputs['Color'].default_value = (*emission, 1.0)
        emit.inputs['Strength'].default_value = em_strength
        emit.location = (0, 50)
        add_sh = nodes.new('ShaderNodeAddShader')
        add_sh.location = (200, 200)
        # Diffuse path → shader output (need another diffuse for shader input)
        diffuse2 = nodes.new('ShaderNodeBsdfDiffuse')
        diffuse2.location = (0, 150)
        links.new(ramp.outputs['Color'], diffuse2.inputs['Color'])
        links.new(diffuse2.outputs['BSDF'], add_sh.inputs[0])
        links.new(emit.outputs['Emission'], add_sh.inputs[1])
        links.new(add_sh.outputs['Shader'], output.inputs['Surface'])
    else:
        # Cel shade only → diffuse output
        diffuse_out = nodes.new('ShaderNodeBsdfDiffuse')
        diffuse_out.inputs['Color'].default_value = (1, 1, 1, 1)
        diffuse_out.location = (200, 300)
        links.new(ramp.outputs['Color'], diffuse_out.inputs['Color'])
        links.new(diffuse_out.outputs['BSDF'], output.inputs['Surface'])
    return mat


# ═══════════════════════════════════════════════
# 1. 머티리얼 생성
# ═══════════════════════════════════════════════
# 몸통: 짙은 암갈색~검정, 부패감
mat_body = make_cel_mat('Cel_Body',
    base_color=(0.08, 0.04, 0.03),
    dark_color=(0.02, 0.01, 0.01),
    mid_color=(0.08, 0.04, 0.03),
    light_color=(0.15, 0.08, 0.06))

# 갈비뼈/뿔: 뼈 색상
mat_bone = make_cel_mat('Cel_Bone',
    base_color=(0.2, 0.15, 0.1),
    dark_color=(0.08, 0.05, 0.03),
    mid_color=(0.2, 0.15, 0.1),
    light_color=(0.35, 0.28, 0.2))

# 균열 발광: 붉은 내부광
mat_crack = make_cel_mat('Cel_Crack',
    base_color=(0.8, 0.1, 0.02),
    dark_color=(0.4, 0.05, 0.01),
    mid_color=(0.8, 0.1, 0.02),
    light_color=(1.0, 0.3, 0.05),
    emission=(1.0, 0.15, 0.02), em_strength=8)

# 눈: 강렬한 단안 발광
mat_eye = make_cel_mat('Cel_Eye',
    base_color=(1.0, 0.3, 0.0),
    dark_color=(0.8, 0.1, 0.0),
    mid_color=(1.0, 0.4, 0.0),
    light_color=(1.0, 0.8, 0.3),
    emission=(1.0, 0.25, 0.0), em_strength=15)

# 다리: 몸통보다 약간 밝은 갈색
mat_leg = make_cel_mat('Cel_Leg',
    base_color=(0.06, 0.03, 0.02),
    dark_color=(0.02, 0.01, 0.01),
    mid_color=(0.06, 0.03, 0.02),
    light_color=(0.12, 0.06, 0.04))


# ═══════════════════════════════════════════════
# 2. 메시 생성 — 부패한 사슴 사도
# ═══════════════════════════════════════════════

# --- 몸통 (늘어진 타원체, X 방향이 길이) ---
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=1.0, location=(0, 0, 1.8))
body = bpy.context.active_object
body.name = 'Boss_Body'
body.scale = (1.6, 0.7, 0.9)
bpy.ops.object.shade_smooth()
add_subsurf(body, 2, 2)
body.data.materials.append(mat_body)

# --- 머리 (작은 사슴 두개골) ---
bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.35, location=(1.6, 0, 2.2))
head = bpy.context.active_object
head.name = 'Boss_Head'
head.scale = (1.3, 0.8, 0.9)
bpy.ops.object.shade_smooth()
add_subsurf(head, 2, 2)
head.data.materials.append(mat_bone)

# 턱 (아래로 늘어진 삼각)
bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.2, radius2=0.05, depth=0.35,
    location=(1.75, 0, 1.95))
jaw = bpy.context.active_object
jaw.name = 'Boss_Jaw'
jaw.rotation_euler = (math.radians(160), 0, 0)
bpy.ops.object.shade_smooth()
jaw.data.materials.append(mat_bone)

# --- 뿔 (거대, 갈라진 사슴뿔) ---
horns = []
for side_idx, side in enumerate([-1, 1]):
    # 메인 뿔 줄기
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.12, radius2=0.02, depth=1.4,
        location=(1.5, side * 0.25, 2.7))
    horn = bpy.context.active_object
    horn.name = f'Boss_Horn_{"L" if side == -1 else "R"}'
    horn.rotation_euler = (math.radians(-15), math.radians(side * 25), math.radians(side * 10))
    bpy.ops.object.shade_smooth()
    add_subsurf(horn, 1, 1)
    horn.data.materials.append(mat_bone)
    horns.append(horn)

    # 뿔 가지 1 (중간에서 갈라짐)
    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.06, radius2=0.015, depth=0.6,
        location=(1.45, side * 0.4, 3.0))
    branch1 = bpy.context.active_object
    branch1.name = f'Boss_HornBranch1_{"L" if side == -1 else "R"}'
    branch1.rotation_euler = (math.radians(-40), math.radians(side * 45), 0)
    bpy.ops.object.shade_smooth()
    branch1.data.materials.append(mat_bone)
    branch1.parent = horn

    # 뿔 가지 2 (위쪽)
    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.05, radius2=0.01, depth=0.45,
        location=(1.55, side * 0.15, 3.3))
    branch2 = bpy.context.active_object
    branch2.name = f'Boss_HornBranch2_{"L" if side == -1 else "R"}'
    branch2.rotation_euler = (math.radians(10), math.radians(side * 35), 0)
    bpy.ops.object.shade_smooth()
    branch2.data.materials.append(mat_bone)
    branch2.parent = horn

# --- 노출된 갈비뼈 (좌측면 3개) ---
ribs = []
for i in range(3):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.5 + i * 0.05, minor_radius=0.035,
        major_segments=16, minor_segments=6,
        location=(0.3 - i * 0.4, -0.55, 1.7 + i * 0.08))
    rib = bpy.context.active_object
    rib.name = f'Boss_Rib_{i}'
    rib.scale = (0.6, 1.0, 0.8)
    rib.rotation_euler = (math.radians(10), math.radians(15 + i * 5), math.radians(-20))
    bpy.ops.object.shade_smooth()
    rib.data.materials.append(mat_bone)
    ribs.append(rib)

# --- 균열 발광 (몸통 양쪽 2개) ---
cracks = []
for i, xpos in enumerate([0.4, -0.3]):
    bpy.ops.mesh.primitive_plane_add(size=0.3, location=(xpos, -0.65, 1.8 + i * 0.15))
    crack = bpy.context.active_object
    crack.name = f'Boss_Crack_{i}'
    crack.rotation_euler = (math.radians(80), math.radians(10 * (i * 2 - 1)), 0)
    crack.scale = (0.4, 1.2, 1.0)
    crack.data.materials.append(mat_crack)
    cracks.append(crack)

# --- 눈 (한쪽만 발광 — 오른쪽) ---
bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.07,
    location=(1.8, -0.15, 2.25))
eye_r = bpy.context.active_object
eye_r.name = 'Boss_Eye_R'
eye_r.data.materials.append(mat_eye)
# 왼쪽은 꺼진 눈 (빈 소켓)
bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.06,
    location=(1.8, 0.15, 2.25))
eye_l = bpy.context.active_object
eye_l.name = 'Boss_Eye_L'
eye_l.data.materials.append(mat_body)  # 어둡게

# --- 다리 4개 (가늘고 긴 사슴 다리, 역관절 느낌) ---
leg_data = [
    ('FL', ( 0.8, -0.35, 0.0), ( 0.8, -0.35, 1.0)),  # 앞왼
    ('FR', ( 0.8,  0.35, 0.0), ( 0.8,  0.35, 1.0)),  # 앞오른
    ('BL', (-0.8, -0.35, 0.0), (-0.8, -0.35, 1.0)),  # 뒤왼
    ('BR', (-0.8,  0.35, 0.0), (-0.8,  0.35, 1.0)),  # 뒤오른
]
legs = []
for name, foot_pos, hip_pos in leg_data:
    # 상부 (허벅지)
    mid_z = (hip_pos[2] + foot_pos[2]) / 2 + 0.2  # 역관절 무릎
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.08, depth=0.7,
        location=(hip_pos[0], hip_pos[1], mid_z + 0.3))
    upper = bpy.context.active_object
    upper.name = f'Boss_Leg_{name}_Upper'
    upper.rotation_euler = (math.radians(10 if 'F' in name else -10), 0, 0)
    bpy.ops.object.shade_smooth()
    upper.data.materials.append(mat_leg)

    # 하부 (정강이 — 더 가늘게)
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.05, depth=0.8,
        location=(hip_pos[0], hip_pos[1], mid_z - 0.35))
    lower = bpy.context.active_object
    lower.name = f'Boss_Leg_{name}_Lower'
    bpy.ops.object.shade_smooth()
    lower.data.materials.append(mat_leg)
    lower.parent = upper

    # 발굽
    bpy.ops.mesh.primitive_uv_sphere_add(segments=6, ring_count=4, radius=0.06,
        location=(hip_pos[0], hip_pos[1], 0.06))
    hoof = bpy.context.active_object
    hoof.name = f'Boss_Hoof_{name}'
    hoof.scale = (1.2, 0.8, 0.6)
    hoof.data.materials.append(mat_body)
    hoof.parent = lower

    legs.append(upper)

# --- 꼬리 (길고 가는, 끝이 갈라짐) ---
bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.15, radius2=0.03, depth=1.2,
    location=(-1.5, 0, 1.7))
tail = bpy.context.active_object
tail.name = 'Boss_Tail'
tail.rotation_euler = (0, math.radians(70), 0)
bpy.ops.object.shade_smooth()
tail.data.materials.append(mat_body)

# ═══════════════════════════════════════════════
# 3. 부모 계층 (메시 → Body)
# ═══════════════════════════════════════════════
children = [head, jaw, tail, eye_r, eye_l] + horns + ribs + cracks + legs
for child in children:
    if child.parent is None:
        child.parent = body


# ═══════════════════════════════════════════════
# 4. Armature 리깅
# ═══════════════════════════════════════════════
bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
armature_obj = bpy.context.active_object
armature_obj.name = 'Boss_Armature'
arm = armature_obj.data
arm.name = 'Boss_Rig'

# 기본 본 삭제
for b in list(arm.edit_bones):
    arm.edit_bones.remove(b)

def add_bone(name, head_pos, tail_pos, parent_name=None):
    bone = arm.edit_bones.new(name)
    bone.head = Vector(head_pos)
    bone.tail = Vector(tail_pos)
    if parent_name and parent_name in arm.edit_bones:
        bone.parent = arm.edit_bones[parent_name]
    return bone

# 본 계층
add_bone('Root',      (0, 0, 1.8),    (0, 0, 2.2))
add_bone('Spine',     (0, 0, 1.8),    (0.8, 0, 1.9),  'Root')
add_bone('Head',      (1.3, 0, 2.0),  (1.8, 0, 2.3),  'Spine')
add_bone('HornL',     (1.5, -0.25, 2.5), (1.5, -0.4, 3.2), 'Head')
add_bone('HornR',     (1.5, 0.25, 2.5),  (1.5, 0.4, 3.2),  'Head')
add_bone('Jaw',       (1.6, 0, 2.0),  (1.8, 0, 1.7),  'Head')
add_bone('Tail',      (-1.2, 0, 1.7), (-2.0, 0, 1.9),  'Root')
add_bone('Leg_FL',    (0.8, -0.35, 1.8), (0.8, -0.35, 0.0), 'Spine')
add_bone('Leg_FR',    (0.8, 0.35, 1.8),  (0.8, 0.35, 0.0),  'Spine')
add_bone('Leg_BL',    (-0.8, -0.35, 1.8),(-0.8, -0.35, 0.0), 'Root')
add_bone('Leg_BR',    (-0.8, 0.35, 1.8), (-0.8, 0.35, 0.0),  'Root')

bpy.ops.object.mode_set(mode='OBJECT')

# 메시를 Armature에 페어런트 + 자동 웨이트
select_only(body)
armature_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.parent_set(type='ARMATURE_AUTO')


# ═══════════════════════════════════════════════
# 5. 카메라 (사이드뷰 — 2D 횡스크롤 시점)
# ═══════════════════════════════════════════════
bpy.ops.object.camera_add(location=(0.3, -6, 2.2))
cam = bpy.context.active_object
cam.name = 'Boss_Camera'
cam.rotation_euler = (math.radians(78), 0, 0)
cam.data.lens = 35  # 광각으로 전신 포착
cam.data.clip_end = 50
scene.camera = cam


# ═══════════════════════════════════════════════
# 6. 조명 (셀셰이딩용 — 강한 단일 방향광)
# ═══════════════════════════════════════════════
bpy.ops.object.light_add(type='SUN', location=(3, -2, 5))
sun = bpy.context.active_object
sun.name = 'Key_Sun'
sun.data.energy = 3.0
sun.data.color = (1.0, 0.9, 0.8)
sun.rotation_euler = (math.radians(45), math.radians(15), math.radians(-30))

# 약한 필라이트 (그림자 완전 검은색 방지)
bpy.ops.object.light_add(type='SUN', location=(-3, 2, 3))
fill = bpy.context.active_object
fill.name = 'Fill_Sun'
fill.data.energy = 0.5
fill.data.color = (0.6, 0.7, 1.0)
fill.rotation_euler = (math.radians(60), 0, math.radians(150))

# 균열 발광용 포인트 라이트 (몸통 안쪽)
bpy.ops.object.light_add(type='POINT', location=(0.1, -0.4, 1.8))
crack_light = bpy.context.active_object
crack_light.name = 'Crack_Light'
crack_light.data.energy = 30
crack_light.data.color = (1.0, 0.15, 0.02)
crack_light.data.shadow_soft_size = 0.3


# ═══════════════════════════════════════════════
# 7. 렌더 설정 (EEVEE + Freestyle)
# ═══════════════════════════════════════════════
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 512
scene.render.resolution_y = 512
scene.render.resolution_percentage = 100

# 배경 투명
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.compression = 15

# Freestyle 아웃라인
scene.render.use_freestyle = True
vl = bpy.context.view_layer
vl.use_freestyle = True
# 라인셋 설정
if vl.freestyle_settings.linesets:
    ls = vl.freestyle_settings.linesets[0]
else:
    ls = vl.freestyle_settings.linesets.new('Outline')
ls.select_silhouette = True
ls.select_border = True
ls.select_crease = True
ls.select_edge_mark = False
# 라인 스타일
style = ls.linestyle
style.color = (0.01, 0.01, 0.01)  # 거의 검정
style.thickness = 2.0  # 512px 기준 → 64px에서 ~0.25px 효과
style.alpha = 1.0

# 출력 경로
output_path = r"G:\hell\blender\sprites\boss_ch1_"
scene.render.filepath = output_path


# ═══════════════════════════════════════════════
# 8. 애니메이션 키프레임 (Armature Pose Bones)
# ═══════════════════════════════════════════════
select_only(armature_obj)
bpy.ops.object.mode_set(mode='POSE')
pbones = armature_obj.pose.bones

def kf_bone(bone_name, frame, loc=None, rot=None):
    """포즈 본에 키프레임 삽입 (loc: (x,y,z), rot: (x,y,z) 라디안)"""
    pb = pbones.get(bone_name)
    if not pb:
        return
    if rot is not None:
        pb.rotation_mode = 'XYZ'
        pb.rotation_euler = Euler(rot)
        pb.keyframe_insert(data_path='rotation_euler', frame=frame)
    if loc is not None:
        pb.location = Vector(loc)
        pb.keyframe_insert(data_path='location', frame=frame)

def kf_all_rest(frame):
    """모든 본을 쉬는 자세로 키프레임"""
    for pb in pbones:
        pb.rotation_mode = 'XYZ'
        pb.rotation_euler = Euler((0, 0, 0))
        pb.location = Vector((0, 0, 0))
        pb.keyframe_insert(data_path='rotation_euler', frame=frame)
        pb.keyframe_insert(data_path='location', frame=frame)

R = math.radians

# ── IDLE (0~23f): 숨쉬기 + 미세 체중이동 ──
for f in range(0, 24):
    t = f / 23.0
    s = math.sin(t * math.pi * 2)
    s2 = math.sin(t * math.pi * 4)
    # 몸통 상하
    kf_bone('Root', f, loc=(0, 0, s * 0.04))
    # 머리 미세 끄덕임
    kf_bone('Head', f, rot=(s * 0.05, s2 * 0.02, 0))
    # 다리 미세 체중이동
    kf_bone('Leg_FL', f, rot=(s * 0.08, 0, 0))
    kf_bone('Leg_FR', f, rot=(-s * 0.06, 0, 0))
    kf_bone('Leg_BL', f, rot=(-s * 0.07, 0, 0))
    kf_bone('Leg_BR', f, rot=(s * 0.05, 0, 0))
    # 꼬리 느린 흔들림
    kf_bone('Tail', f, rot=(0, s * 0.08, s2 * 0.05))
    # 턱 미세 벌어짐
    kf_bone('Jaw', f, rot=(s * 0.03, 0, 0))

# ── WALK (24~39f): 4족 대각선 교차 보행 ──
for f in range(24, 40):
    t = (f - 24) / 16.0
    s = math.sin(t * math.pi * 2)
    c = math.cos(t * math.pi * 2)
    # 다리 교차 (대각선 쌍)
    amp = 0.5
    kf_bone('Leg_FL', f, rot=(s * amp, 0, 0))
    kf_bone('Leg_BR', f, rot=(s * amp * 0.9, 0, 0))
    kf_bone('Leg_FR', f, rot=(-s * amp, 0, 0))
    kf_bone('Leg_BL', f, rot=(-s * amp * 0.9, 0, 0))
    # 몸통 상하 바운스
    kf_bone('Root', f, loc=(0, 0, abs(s) * 0.03), rot=(0, 0, s * 0.02))
    # 머리 전후 관성
    kf_bone('Head', f, rot=(c * 0.06, 0, 0))
    # 꼬리 반대 방향
    kf_bone('Tail', f, rot=(0, -s * 0.15, c * 0.08))

# ── WINDUP (40~51f): 무기(뿔) 뒤로 — 모션 리딩 시그널 ──
kf_all_rest(40)
# 천천히 웅크리기 (40~47)
for f in range(40, 48):
    t = (f - 40) / 7.0
    # 몸 뒤로 숙임
    kf_bone('Root', f, loc=(t * -0.15, 0, t * -0.06), rot=(t * -0.15, 0, 0))
    # 머리 들어올림 (포효 준비)
    kf_bone('Head', f, rot=(t * 0.35, 0, 0))
    # 뿔 벌어짐
    kf_bone('HornL', f, rot=(t * 0.1, 0, t * -0.15))
    kf_bone('HornR', f, rot=(t * 0.1, 0, t * 0.15))
    # 앞다리 웅크림
    kf_bone('Leg_FL', f, rot=(t * -0.3, 0, 0))
    kf_bone('Leg_FR', f, rot=(t * -0.3, 0, 0))
    # 뒷다리 힘 모으기
    kf_bone('Leg_BL', f, rot=(t * 0.15, 0, 0))
    kf_bone('Leg_BR', f, rot=(t * 0.15, 0, 0))
    kf_bone('Tail', f, rot=(0, t * -0.2, 0))
    # 턱 벌림
    kf_bone('Jaw', f, rot=(t * 0.2, 0, 0))
# 정점 유지 (47~51)
for f in range(48, 52):
    t = 1.0 + math.sin((f - 48) * 2.0) * 0.03  # 미세 떨림
    kf_bone('Root', f, loc=(-0.15, 0, -0.06), rot=(-0.15 * t, 0, 0))
    kf_bone('Head', f, rot=(0.35 * t, 0, 0))
    kf_bone('HornL', f, rot=(0.1, 0, -0.15))
    kf_bone('HornR', f, rot=(0.1, 0, 0.15))
    kf_bone('Leg_FL', f, rot=(-0.3, 0, 0))
    kf_bone('Leg_FR', f, rot=(-0.3, 0, 0))
    kf_bone('Leg_BL', f, rot=(0.15, 0, 0))
    kf_bone('Leg_BR', f, rot=(0.15, 0, 0))
    kf_bone('Tail', f, rot=(0, -0.2, 0))
    kf_bone('Jaw', f, rot=(0.2 * t, 0, 0))

# ── ATTACK (52~63f): 뿔 찍기 — 빠른 전방 돌진 ──
# 돌진 (52~55) — 빠르게
for f in range(52, 56):
    t = (f - 52) / 3.0
    # 머리 내려찍기
    kf_bone('Root', f, loc=(t * 0.2, 0, t * 0.05), rot=(t * 0.25, 0, 0))
    kf_bone('Head', f, rot=(0.35 - t * 0.7, 0, 0))  # 0.35 → -0.35
    kf_bone('HornL', f, rot=(0.1 - t * 0.3, 0, -0.15 + t * 0.1))
    kf_bone('HornR', f, rot=(0.1 - t * 0.3, 0, 0.15 - t * 0.1))
    kf_bone('Leg_FL', f, rot=(-0.3 + t * 0.6, 0, 0))  # 앞으로 뻗기
    kf_bone('Leg_FR', f, rot=(-0.3 + t * 0.6, 0, 0))
    kf_bone('Leg_BL', f, rot=(0.15 - t * 0.4, 0, 0))
    kf_bone('Leg_BR', f, rot=(0.15 - t * 0.4, 0, 0))
    kf_bone('Tail', f, rot=(0, -0.2 + t * 0.5, 0))
    kf_bone('Jaw', f, rot=(0.2 + t * 0.15, 0, 0))  # 입 더 벌림
# 임팩트 (55)
kf_bone('Root', 55, loc=(0.2, 0, 0.05), rot=(0.25, 0, 0))
kf_bone('Head', 55, rot=(-0.4, 0, 0))  # 최저점
# 반동 + 복귀 (56~63)
for f in range(56, 64):
    t = (f - 56) / 7.0
    recoil = math.sin(t * math.pi) * 0.1 * (1 - t)  # 감쇠 반동
    kf_bone('Root', f, loc=(0.2 * (1 - t), 0, 0.05 * (1 - t)),
            rot=(0.25 * (1 - t) + recoil, 0, 0))
    kf_bone('Head', f, rot=(-0.4 * (1 - t), 0, 0))
    kf_bone('HornL', f, rot=(-0.2 * (1 - t), 0, -0.05 * (1 - t)))
    kf_bone('HornR', f, rot=(-0.2 * (1 - t), 0, 0.05 * (1 - t)))
    kf_bone('Leg_FL', f, rot=(0.3 * (1 - t), 0, 0))
    kf_bone('Leg_FR', f, rot=(0.3 * (1 - t), 0, 0))
    kf_bone('Leg_BL', f, rot=(-0.25 * (1 - t), 0, 0))
    kf_bone('Leg_BR', f, rot=(-0.25 * (1 - t), 0, 0))
    kf_bone('Tail', f, rot=(0, 0.3 * (1 - t), 0))
    kf_bone('Jaw', f, rot=(0.35 * (1 - t), 0, 0))

# ── STAGGER (64~73f): 경직 — 비틀거림 ──
kf_all_rest(64)
for f in range(64, 74):
    t = (f - 64) / 9.0
    decay = 1.0 - t * 0.6
    shake = math.sin(t * math.pi * 6) * decay
    # 몸통 흔들림
    kf_bone('Root', f, loc=(0, shake * 0.06, 0), rot=(shake * 0.1, shake * 0.08, 0))
    kf_bone('Head', f, rot=(shake * 0.2, -shake * 0.15, 0))
    kf_bone('Tail', f, rot=(0, -shake * 0.25, shake * 0.15))
    # 다리 비틀
    kf_bone('Leg_FL', f, rot=(shake * 0.15, 0, 0))
    kf_bone('Leg_FR', f, rot=(-shake * 0.12, 0, 0))
    kf_bone('Leg_BL', f, rot=(-shake * 0.1, 0, 0))
    kf_bone('Leg_BR', f, rot=(shake * 0.13, 0, 0))

# ── DEATH (74~95f): 쓰러짐 ──
kf_all_rest(74)
# 비틀거리며 무릎 꿇기 (74~82)
for f in range(74, 83):
    t = (f - 74) / 8.0
    wobble = math.sin(t * 5) * (1 - t) * 0.08
    kf_bone('Root', f, loc=(0, wobble, -t * 0.25), rot=(t * 0.15, wobble * 2, 0))
    kf_bone('Head', f, rot=(-t * 0.2, 0, 0))
    kf_bone('Leg_FL', f, rot=(t * 0.6, 0, 0))
    kf_bone('Leg_FR', f, rot=(t * 0.5, 0, 0))
    kf_bone('Leg_BL', f, rot=(t * 0.4, 0, 0))
    kf_bone('Leg_BR', f, rot=(t * 0.45, 0, 0))
    kf_bone('Tail', f, rot=(0, t * 0.1, 0))
    kf_bone('Jaw', f, rot=(t * 0.3, 0, 0))
# 완전히 쓰러짐 (83~90)
for f in range(83, 91):
    t = (f - 83) / 7.0
    kf_bone('Root', f, loc=(0, 0, -0.25 - t * 0.5),
            rot=(0.15 + t * 1.2, 0, t * 0.3))
    kf_bone('Head', f, rot=(-0.2 - t * 0.4, t * 0.2, 0))
    kf_bone('Leg_FL', f, rot=(0.6 + t * 0.3, 0, t * 0.2))
    kf_bone('Leg_FR', f, rot=(0.5 + t * 0.4, 0, -t * 0.15))
    kf_bone('Leg_BL', f, rot=(0.4 + t * 0.3, t * 0.1, 0))
    kf_bone('Leg_BR', f, rot=(0.45 + t * 0.35, -t * 0.1, 0))
    kf_bone('Tail', f, rot=(t * 0.2, 0.1 + t * 0.3, 0))
    kf_bone('Jaw', f, rot=(0.3 + t * 0.2, 0, 0))
    kf_bone('HornL', f, rot=(t * 0.15, 0, 0))
    kf_bone('HornR', f, rot=(t * 0.1, 0, 0))
# 바닥 충돌 후 정지 (90~95)
for f in range(91, 96):
    t = (f - 91) / 4.0
    settle = math.sin(t * math.pi) * 0.02 * (1 - t)
    kf_bone('Root', f, loc=(0, 0, -0.75 + settle), rot=(1.35 + settle, 0, 0.3))
    kf_bone('Head', f, rot=(-0.6, 0.2, 0))
    kf_bone('Jaw', f, rot=(0.5, 0, 0))

bpy.ops.object.mode_set(mode='OBJECT')


# ═══════════════════════════════════════════════
# 9. 키프레임 보간 Bezier
# ═══════════════════════════════════════════════
def set_bezier(obj):
    if not obj.animation_data or not obj.animation_data.action:
        return
    action = obj.animation_data.action
    curves = []
    if hasattr(action, 'fcurves') and not action.is_action_layered:
        curves = list(action.fcurves)
    else:
        for layer in action.layers:
            for strip in layer.strips:
                for slot in action.slots:
                    cb = strip.channelbag(slot)
                    if cb:
                        curves.extend(cb.fcurves)
    for fc in curves:
        for kf in fc.keyframe_points:
            kf.interpolation = 'BEZIER'
            kf.handle_left_type = 'AUTO_CLAMPED'
            kf.handle_right_type = 'AUTO_CLAMPED'

for obj in bpy.data.objects:
    set_bezier(obj)


# ═══════════════════════════════════════════════
# 10. 완료
# ═══════════════════════════════════════════════
print("=" * 55)
print("  HELL: EXODUSER CH1 Boss v2 — Setup Complete!")
print("  Corrupted Stag Apostle (Cel-shaded + Freestyle)")
print("=" * 55)
print(f"  Frames: {scene.frame_start} ~ {scene.frame_end}")
print(f"  Resolution: {scene.render.resolution_x}x{scene.render.resolution_y}")
print(f"  Engine: {scene.render.engine} + Freestyle")
print(f"  FPS: {scene.render.fps}")
print(f"  Output: {output_path}####.png")
print("")
print("  Animations:")
print("    idle    :  0 ~ 23f  (breathing + weight shift)")
print("    walk    : 24 ~ 39f  (quadruped diagonal gait)")
print("    windup  : 40 ~ 51f  (rear up, motion read)")
print("    attack  : 52 ~ 63f  (antler slam)")
print("    stagger : 64 ~ 73f  (groggy shake)")
print("    death   : 74 ~ 95f  (collapse + settle)")
print("")
print("  Render: Ctrl+F12 or --render-anim")
print("=" * 55)
