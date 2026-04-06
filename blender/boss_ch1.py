"""
HELL: EXODUSER CH1 Boss — Blender Python Script
=================================================
보스 메시 생성 + 5종 애니메이션 키프레임 + 렌더 설정

실행: Blender 열고 → Edit > Preferences > Python에서 확인 후
      상단 메뉴 Scripting 탭 → 이 파일 열기 → Run Script (Alt+P)
또는: blender --background --python boss_ch1.py
"""

import bpy
import math
import os


def get_bsdf(mat):
    """언어 무관하게 Principled BSDF 노드를 타입으로 찾기"""
    for node in mat.node_tree.nodes:
        if node.type == 'BSDF_PRINCIPLED':
            return node
    return None

# ─────────────────────────────────────────────
# 0. 씬 초기화
# ─────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# 컬렉션 정리
for col in bpy.data.collections:
    bpy.data.collections.remove(col)

scene = bpy.context.scene
scene.frame_start = 0
scene.frame_end = 66
scene.render.fps = 24

# ─────────────────────────────────────────────
# 1. 보스 메시 생성
# ─────────────────────────────────────────────

# --- 몸통 (타원형, Z축 0.8 스케일) ---
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(0, 0, 1.2))
body = bpy.context.active_object
body.name = "Boss_Body"
body.scale = (1.2, 0.8, 0.8)
bpy.ops.object.shade_smooth()

# 다크 판타지 머티리얼
mat_body = bpy.data.materials.new(name="Mat_DarkBody")
mat_body.use_nodes = True
bsdf = get_bsdf(mat_body)
bsdf.inputs["Base Color"].default_value = (0.08, 0.02, 0.02, 1.0)  # 짙은 암적색
bsdf.inputs["Roughness"].default_value = 0.7
bsdf.inputs["Metallic"].default_value = 0.3
body.data.materials.append(mat_body)

# --- 뿔 2개 ---
horn_mat = bpy.data.materials.new(name="Mat_Horn")
horn_mat.use_nodes = True
horn_bsdf = get_bsdf(horn_mat)
horn_bsdf.inputs["Base Color"].default_value = (0.15, 0.08, 0.03, 1.0)  # 어두운 뼈색
horn_bsdf.inputs["Roughness"].default_value = 0.4

horns = []
for side in [-1, 1]:
    bpy.ops.mesh.primitive_cone_add(
        radius1=0.15, radius2=0.02, depth=1.2,
        location=(side * 0.4, -0.1, 2.2)
    )
    horn = bpy.context.active_object
    horn.name = f"Boss_Horn_{'L' if side == -1 else 'R'}"
    horn.rotation_euler = (math.radians(-20), math.radians(side * 15), 0)
    horn.data.materials.append(horn_mat)
    bpy.ops.object.shade_smooth()
    horns.append(horn)

# --- 다리 4개 ---
leg_mat = bpy.data.materials.new(name="Mat_Leg")
leg_mat.use_nodes = True
leg_bsdf = get_bsdf(leg_mat)
leg_bsdf.inputs["Base Color"].default_value = (0.06, 0.01, 0.01, 1.0)
leg_bsdf.inputs["Roughness"].default_value = 0.8

leg_positions = [
    (-0.7, -0.4, 0.5),   # 왼앞
    ( 0.7, -0.4, 0.5),   # 오른앞
    (-0.7,  0.4, 0.5),   # 왼뒤
    ( 0.7,  0.4, 0.5),   # 오른뒤
]
leg_names = ["FL", "FR", "BL", "BR"]
legs = []

for i, (pos, name) in enumerate(zip(leg_positions, leg_names)):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=1.0, location=pos)
    leg = bpy.context.active_object
    leg.name = f"Boss_Leg_{name}"
    leg.data.materials.append(leg_mat)
    bpy.ops.object.shade_smooth()
    legs.append(leg)

# --- 꼬리 ---
bpy.ops.mesh.primitive_cone_add(
    radius1=0.25, radius2=0.05, depth=1.8,
    location=(0, 1.2, 1.0)
)
tail = bpy.context.active_object
tail.name = "Boss_Tail"
tail.rotation_euler = (math.radians(80), 0, 0)
tail.data.materials.append(mat_body)
bpy.ops.object.shade_smooth()

# --- 눈 (장식) ---
eye_mat = bpy.data.materials.new(name="Mat_Eye")
eye_mat.use_nodes = True
eye_bsdf = get_bsdf(eye_mat)
eye_bsdf.inputs["Base Color"].default_value = (1.0, 0.15, 0.0, 1.0)  # 붉은 오렌지
eye_bsdf.inputs["Emission Color"].default_value = (1.0, 0.2, 0.0, 1.0)
eye_bsdf.inputs["Emission Strength"].default_value = 5.0

for side in [-1, 1]:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(side * 0.3, -0.7, 1.5))
    eye = bpy.context.active_object
    eye.name = f"Boss_Eye_{'L' if side == -1 else 'R'}"
    eye.data.materials.append(eye_mat)

# --- 모든 파트를 Body에 부모 설정 ---
all_parts = horns + legs + [tail]
for obj in bpy.data.objects:
    if obj.name.startswith("Boss_Eye"):
        all_parts.append(obj)

for part in all_parts:
    part.parent = body

# ─────────────────────────────────────────────
# 2. 카메라 설정
# ─────────────────────────────────────────────
bpy.ops.object.camera_add(location=(0, -8, 6))
cam = bpy.context.active_object
cam.name = "Boss_Camera"
cam.rotation_euler = (math.radians(55), 0, 0)
cam.data.lens = 50
scene.camera = cam

# ─────────────────────────────────────────────
# 3. 조명 (다크 판타지 분위기)
# ─────────────────────────────────────────────
# 메인 키 라이트 (약간 붉은 톤)
bpy.ops.object.light_add(type='AREA', location=(3, -4, 6))
key_light = bpy.context.active_object
key_light.name = "Key_Light"
key_light.data.energy = 200
key_light.data.color = (1.0, 0.85, 0.7)
key_light.data.size = 3
key_light.rotation_euler = (math.radians(55), 0, math.radians(30))

# 림 라이트 (뒤에서 실루엣)
bpy.ops.object.light_add(type='AREA', location=(-2, 4, 4))
rim_light = bpy.context.active_object
rim_light.name = "Rim_Light"
rim_light.data.energy = 100
rim_light.data.color = (0.4, 0.5, 1.0)  # 푸른 톤
rim_light.data.size = 2

# ─────────────────────────────────────────────
# 4. 렌더 설정
# ─────────────────────────────────────────────
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.resolution_x = 512
scene.render.resolution_y = 512
scene.render.resolution_percentage = 100

# 배경 투명 (알파)
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.compression = 15

# 출력 경로
output_path = r"G:\hell\blender\sprites\boss_ch1_"
scene.render.filepath = output_path

# ─────────────────────────────────────────────
# 5. 애니메이션 키프레임
# ─────────────────────────────────────────────

# === IDLE (0~16f): 몸통 Z축 ±0.05 상하 숨쉬기 ===
body_z_base = body.location.z  # 1.2

for f in range(0, 17):
    scene.frame_set(f)
    # 사인파로 부드러운 상하 운동
    t = f / 16.0
    offset = math.sin(t * math.pi * 2) * 0.05
    body.location.z = body_z_base + offset
    body.keyframe_insert(data_path="location", index=2, frame=f)

# === WALK (17~26f): 다리 교차 회전 ===
# FL/BR = 한 쌍, FR/BL = 한 쌍 (대각선 교차)
walk_amplitude = math.radians(25)

for f in range(17, 27):
    scene.frame_set(f)
    t = (f - 17) / 10.0
    angle_a = math.sin(t * math.pi * 2) * walk_amplitude
    angle_b = -angle_a  # 반대 위상

    # FL, BR 쌍
    legs[0].rotation_euler.x = angle_a
    legs[3].rotation_euler.x = angle_a
    # FR, BL 쌍
    legs[1].rotation_euler.x = angle_b
    legs[2].rotation_euler.x = angle_b

    # 몸통 약간 전진 (Y축)
    body.location.y = (f - 17) * 0.08
    body.location.z = body_z_base + abs(math.sin(t * math.pi * 2)) * 0.03
    body.keyframe_insert(data_path="location", frame=f)

    for leg in legs:
        leg.keyframe_insert(data_path="rotation_euler", index=0, frame=f)

# walk 끝 위치 저장
walk_end_y = body.location.y

# === ATTACK (27~38f): 앞발 들어올렸다 내려치기 ===
# 몸통 위치 리셋
body.location.y = 0
body.location.z = body_z_base
body.keyframe_insert(data_path="location", frame=27)

# 다리 리셋
for leg in legs:
    leg.rotation_euler.x = 0
    leg.keyframe_insert(data_path="rotation_euler", index=0, frame=27)

# 앞다리 = legs[0](FL), legs[1](FR)
attack_frames = {
    27: (0, 0),                            # 시작 (앞발 내림)
    30: (math.radians(-60), 0.15),         # 앞발 들어올림, 몸 약간 뒤로
    33: (math.radians(-70), 0.18),         # 최고점
    35: (math.radians(15), -0.1),          # 내려치기!
    36: (math.radians(10), -0.12),         # 임팩트
    38: (0, 0),                            # 복귀
}

for f, (leg_angle, body_offset_z) in attack_frames.items():
    scene.frame_set(f)
    legs[0].rotation_euler.x = leg_angle
    legs[1].rotation_euler.x = leg_angle
    legs[0].keyframe_insert(data_path="rotation_euler", index=0, frame=f)
    legs[1].keyframe_insert(data_path="rotation_euler", index=0, frame=f)

    body.location.z = body_z_base + body_offset_z
    body.keyframe_insert(data_path="location", index=2, frame=f)

    # 몸통 기울기 (앞으로 숙이기)
    if f <= 33:
        body.rotation_euler.x = leg_angle * 0.15
    else:
        body.rotation_euler.x = math.radians(-5) if f < 38 else 0
    body.keyframe_insert(data_path="rotation_euler", index=0, frame=f)

# === DEATH (39~58f): X축 90도 쓰러지기 ===
# 초기 상태
body.location.z = body_z_base
body.location.y = 0
body.rotation_euler = (0, 0, 0)
body.keyframe_insert(data_path="location", frame=39)
body.keyframe_insert(data_path="rotation_euler", frame=39)

for leg in legs:
    leg.rotation_euler.x = 0
    leg.keyframe_insert(data_path="rotation_euler", index=0, frame=39)

# 비틀거림 (39~46)
for f in [41, 43, 45]:
    scene.frame_set(f)
    wobble = math.sin((f - 39) * 1.2) * math.radians(8)
    body.rotation_euler.y = wobble
    body.keyframe_insert(data_path="rotation_euler", index=1, frame=f)

# 쓰러지기 시작 (46~54)
death_fall = {
    46: (math.radians(10), body_z_base),
    48: (math.radians(30), body_z_base - 0.1),
    50: (math.radians(55), body_z_base - 0.3),
    52: (math.radians(75), body_z_base - 0.5),
    54: (math.radians(90), 0.4),           # 바닥에 눕기
}

for f, (rot_x, loc_z) in death_fall.items():
    scene.frame_set(f)
    body.rotation_euler.x = rot_x
    body.rotation_euler.y = 0
    body.location.z = loc_z
    body.keyframe_insert(data_path="rotation_euler", frame=f)
    body.keyframe_insert(data_path="location", index=2, frame=f)

# 바운스 (54~58) — 바닥 충돌 후 미세 바운스
bounce = {
    55: (math.radians(85), 0.45),
    56: (math.radians(92), 0.38),
    58: (math.radians(90), 0.4),
}
for f, (rot_x, loc_z) in bounce.items():
    scene.frame_set(f)
    body.rotation_euler.x = rot_x
    body.location.z = loc_z
    body.keyframe_insert(data_path="rotation_euler", index=0, frame=f)
    body.keyframe_insert(data_path="location", index=2, frame=f)

# === STUNNED (59~66f): 머리(몸통) Y축 흔들기 ===
# 쓰러진 상태에서 다시 일어남 (리셋)
body.rotation_euler = (0, 0, 0)
body.location.z = body_z_base
body.keyframe_insert(data_path="rotation_euler", frame=59)
body.keyframe_insert(data_path="location", index=2, frame=59)

for f in range(59, 67):
    scene.frame_set(f)
    t = (f - 59) / 8.0
    # 감쇠 흔들기
    decay = 1.0 - (t * 0.7)
    shake = math.sin(t * math.pi * 4) * math.radians(12) * decay
    body.rotation_euler.y = shake
    body.keyframe_insert(data_path="rotation_euler", index=1, frame=f)

# ─────────────────────────────────────────────
# 6. 모든 키프레임 보간을 Bezier로
# ─────────────────────────────────────────────
for obj in bpy.data.objects:
    if obj.animation_data and obj.animation_data.action:
        action = obj.animation_data.action
        # Blender 5.x: action.fcurves → action.layers[].strips[].channels[].fcurves
        if hasattr(action, 'fcurves'):
            curves = action.fcurves
        else:
            curves = []
            for layer in action.layers:
                for strip in layer.strips:
                    for ch in strip.channels:
                        curves.extend(ch.fcurves)
        for fcurve in curves:
            for kf in fcurve.keyframe_points:
                kf.interpolation = 'BEZIER'
                kf.handle_left_type = 'AUTO_CLAMPED'
                kf.handle_right_type = 'AUTO_CLAMPED'

# ─────────────────────────────────────────────
# 7. 완료 메시지
# ─────────────────────────────────────────────
print("=" * 50)
print("  HELL: EXODUSER CH1 Boss — Setup Complete!")
print("=" * 50)
print(f"  Frames: {scene.frame_start} ~ {scene.frame_end}")
print(f"  Resolution: {scene.render.resolution_x}x{scene.render.resolution_y}")
print(f"  FPS: {scene.render.fps}")
print(f"  Output: {output_path}####.png")
print("")
print("  Animations:")
print("    idle    :  0 ~ 16f  (breathing)")
print("    walk    : 17 ~ 26f  (quadruped gait)")
print("    attack  : 27 ~ 38f  (front legs slam)")
print("    death   : 39 ~ 58f  (fall over)")
print("    stunned : 59 ~ 66f  (head shake)")
print("")
print("  To render all frames:")
print("    Render > Render Animation (Ctrl+F12)")
print("=" * 50)
