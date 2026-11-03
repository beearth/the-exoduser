"""Incremental assembly in the real worktree. Rejected reference mesh is deleted.
Never run inside Unity or launch Player. Blender -b only.
"""
import argparse
import bpy
import json
import math
from mathutils import Vector, Matrix
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))
from modular_bind import (fit_static, import_part, rigid_bind, soft_bind_body, auxiliary,
                          duplicate, face_part, fit_limb, cloth_weights)

p = argparse.ArgumentParser()
p.add_argument("--source-rig", type=Path, required=True)
p.add_argument("--parts", type=Path, required=True)
p.add_argument("--blend", type=Path, required=True)
p.add_argument("--receipt", type=Path, required=True)
a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.import_scene.fbx(filepath=str(a.source_rig))
rigs = [o for o in bpy.context.scene.objects if o.type == "ARMATURE"]
if len(rigs) != 1:
    raise RuntimeError("expected one source skeleton")
rig = rigs[0]
original = {b.name: (b.parent.name if b.parent else None, b.matrix_local.copy()) for b in rig.data.bones if not b.name.startswith("Cape_")}
# The old full-body surface is never reused, split, weighted, or adopted.
for obj in list(bpy.context.scene.objects):
    if obj.type == "MESH":
        bpy.data.objects.remove(obj, do_unlink=True)
for action in list(bpy.data.actions):
    bpy.data.actions.remove(action)
bpy.data.orphans_purge(do_recursive=True)
assembled = []
if (a.parts / "body" / "model.glb").is_file():
    body = import_part(a.parts / "body" / "model.glb", "Warrior_Underbody")
    fit_static(body, (0, 0, .8), (1.3, .35, 1.6))
    # Match the reference's long legs/shorter torso before skinning.
    source_z = (0, .08, .47, .85, 1.22, 1.42, 1.6)
    target_z = (0, .08, .58, 1.055, 1.31, 1.51, 1.6)
    for vertex in body.data.vertices:
        z = vertex.co.z
        for index in range(len(source_z) - 1):
            if z <= source_z[index + 1]:
                t = max(0, min(1, (z - source_z[index]) / (source_z[index + 1] - source_z[index])))
                vertex.co.z = target_z[index] * (1 - t) + target_z[index + 1] * t
                break
        if vertex.co.z < 1.055:
            vertex.co.x += math.copysign(.07 * (1 - vertex.co.z / 1.055) * min(1, abs(vertex.co.x) / .06), vertex.co.x)
        elif abs(vertex.co.x) > .22:
            vertex.co.x = math.copysign(.22 + (abs(vertex.co.x) - .22) * .8, vertex.co.x)
    if (a.parts / "gauntlet" / "model.glb").is_file() or (a.parts / "boot" / "model.glb").is_file():
        has_gloves = (a.parts / "gauntlet" / "model.glb").is_file()
        has_boots = (a.parts / "boot" / "model.glb").is_file()
        covered = body
        body = face_part(covered, "Warrior_Underbody", lambda point: not
                         (has_gloves and abs(point.x) > .48 and point.z > .85) and not
                         (has_boots and point.z < .16))
        bpy.data.objects.remove(covered, do_unlink=True)
    soft_bind_body(body, rig)
    assembled.append(body)
if (a.parts / "cuirass" / "model.glb").is_file():
    chest = import_part(a.parts / "cuirass" / "model.glb", "Warrior_Cuirass")
    fit_static(chest, (0, -.015, 1.27), (.48, .32, .50))
    for index, (low, high, bone) in enumerate(((1.245, 1.54, "Spine"), (1.165, 1.27, "Spine01"),
                                              (1.085, 1.19, "Spine02"), (1.00, 1.11, "Hips"))):
        plate = face_part(chest, "Warrior_Cuirass_" + str(index), lambda point, low=low, high=high: low <= point.z <= high)
        rigid_bind(plate, rig, bone)
        assembled.append(plate)
    bpy.data.objects.remove(chest, do_unlink=True)
if (a.parts / "head" / "model.glb").is_file():
    head = import_part(a.parts / "head" / "model.glb", "Warrior_Head")
    fit_static(head, (0, -.016, 1.66), (.235, .23, .32))
    rigid_bind(head, rig, "Head")
    assembled.append(head)
if (a.parts / "hair" / "model.glb").is_file():
    hair = import_part(a.parts / "hair" / "model.glb", "Warrior_Hair")
    fit_static(hair, (0, -.016, 1.75), (.25, .25, .20))
    centers = {}
    parent = "Head"
    for index in range(3):
        name = "RigHair_Fringe_" + str(index)
        head = (0, -.08 - index * .025, 1.79 - index * .045)
        tail = (0, -.105 - index * .025, 1.745 - index * .045)
        auxiliary(rig, name, head, tail, parent)
        centers[name] = tuple((Vector(head) + Vector(tail)) / 2)
        parent = name
    cloth_weights(hair, rig, centers, fixed_top=(1.76, "Head"))
    assembled.append(hair)

if (a.parts / "pauldron" / "model.glb").is_file():
    source = import_part(a.parts / "pauldron" / "model.glb", "New_Pauldron_Source")
    for side, sign in (("Left", 1), ("Right", -1)):
        plate = duplicate(source, "Warrior_Pauldron_" + side, mirror=sign < 0)
        arm = rig.matrix_world @ rig.data.bones[side + "Arm"].head_local
        fit_static(plate, arm + Vector((.025 * sign, 0, .035)), (.29, .30, .25))
        name = "Modular_Pauldron_" + side
        auxiliary(rig, name, arm, arm + Vector((0, 0, -.2)), side + "Shoulder")
        rigid_bind(plate, rig, name)
        assembled.append(plate)
    bpy.data.objects.remove(source, do_unlink=True)

for key, suffix, width, depth, extra in (("arm", "Arm", .145, .16, .07), ("greave", "Leg", .17, .19, .07)):
    path = a.parts / key / "model.glb"
    if not path.is_file():
        continue
    source = import_part(path, "New_" + key + "_Source")
    for side, sign in (("Left", 1), ("Right", -1)):
        plate = duplicate(source, "Warrior_" + key.capitalize() + "_" + side, mirror=sign < 0)
        fit_limb(plate, rig, side + suffix, width, depth, extra)
        rigid_bind(plate, rig, side + suffix)
        assembled.append(plate)
    bpy.data.objects.remove(source, do_unlink=True)

if (a.parts / "gauntlet" / "model.glb").is_file():
    source = import_part(a.parts / "gauntlet" / "model.glb", "New_Gauntlet_Source")
    for side, sign in (("Left", 1), ("Right", -1)):
        part = duplicate(source, "New_Gauntlet_" + side, mirror=sign < 0)
        b = rig.data.bones[side + "ForeArm"]
        h = rig.data.bones[side + "Hand"]
        head, wrist = rig.matrix_world @ b.head_local, rig.matrix_world @ h.head_local
        direction = (wrist - head).normalized()
        distal = wrist + direction * .12
        fit_static(part, (0, 0, 0), (.13, .15, (distal - head).length))
        rotation = Vector((0, 0, 1)).rotation_difference(-direction)
        for vertex in part.data.vertices:
            vertex.co = rotation @ vertex.co + (head + distal) / 2
        seam = (wrist - head).length - .015
        cuff = face_part(part, "Warrior_Vambrace_" + side, lambda point: (point - head).dot(direction) < seam + .018)
        hand = face_part(part, "Warrior_Gauntlet_" + side, lambda point: (point - head).dot(direction) > seam - .018)
        for obj, bone in ((cuff, side + "ForeArm"), (hand, side + "Hand")):
            rigid_bind(obj, rig, bone)
            assembled.append(obj)
        bpy.data.objects.remove(part, do_unlink=True)
    bpy.data.objects.remove(source, do_unlink=True)

if (a.parts / "boot" / "model.glb").is_file():
    source = import_part(a.parts / "boot" / "model.glb", "New_Boot_Source")
    for side, sign in (("Left", 1), ("Right", -1)):
        boot = duplicate(source, "Warrior_Boot_" + side, mirror=sign < 0)
        foot = rig.matrix_world @ rig.data.bones[side + "Foot"].head_local
        fit_static(boot, (foot.x, foot.y - .06, .095), (.15, .31, .19))
        rigid_bind(boot, rig, side + "Foot")
        assembled.append(boot)
    bpy.data.objects.remove(source, do_unlink=True)

if (a.parts / "tassets" / "model.glb").is_file():
    source = import_part(a.parts / "tassets" / "model.glb", "New_Tassets_Source")
    fit_static(source, (0, 0, .91), (.51, .39, .45))
    belt = face_part(source, "Warrior_Belt", lambda point: point.z >= 1.045)
    rigid_bind(belt, rig, "Hips")
    assembled.append(belt)
    for side, sx in (("Left", 1), ("Right", -1)):
        for front, sy in (("Front", -1), ("Back", 1)):
            plate = face_part(source, "Warrior_Tasset_" + side + front,
                              lambda point, sx=sx, sy=sy: point.z < 1.067 and point.x * sx >= -.012 and point.y * sy >= -.012)
            name = "Modular_Tasset_" + side + front
            auxiliary(rig, name, (.14 * sx, .12 * sy, 1.075), (.14 * sx, .12 * sy, .78), "Hips")
            rigid_bind(plate, rig, name)
            assembled.append(plate)
    bpy.data.objects.remove(source, do_unlink=True)

if (a.parts / "cape" / "model.glb").is_file():
    cape = import_part(a.parts / "cape" / "model.glb", "Warrior_CapeScarf")
    fit_static(cape, (0, .12, .925), (.78, .38, 1.25))
    centers = {}
    for col, x in (("L", .19), ("C", 0), ("R", -.19)):
        parent = "Spine"
        for index in range(4):
            name = "Cape_" + col + "_" + str(index)
            head = (x, .19, 1.50 - index * .28)
            tail = (x, .22, 1.22 - index * .28)
            auxiliary(rig, name, head, tail, parent)
            centers[name] = tuple((Vector(head) + Vector(tail)) / 2)
            parent = name
    cloth_weights(cape, rig, centers, fixed_top=(1.49, "neck"))
    assembled.append(cape)

for name, (parent, matrix) in original.items():
    bone = rig.data.bones[name]
    assert (bone.parent.name if bone.parent else None) == parent
    assert max(abs(bone.matrix_local[i][j] - matrix[i][j]) for i in range(4) for j in range(4)) < 1e-7
for obj in assembled:
    if obj["char_modular_role"] != "rigid":
        continue
    assert len(obj.vertex_groups) == 1
    assert all(len(v.groups) == 1 and abs(v.groups[0].weight - 1) < 1e-7 for v in obj.data.vertices)
bpy.data.orphans_purge(do_recursive=True)
for image in bpy.data.images:
    if image.users and image.source == "FILE" and not image.packed_file:
        image.pack()
a.blend.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(a.blend), compress=True)
receipt = {"scope": "partial new-parts assembly, not a complete character or runtime adoption",
           "sourceSkeleton": str(a.source_rig), "sourceGeometryReused": False,
           "referenceBoneCount": len(original), "referenceBonesPreserved": True,
           "totalBoneCount": len(rig.data.bones),
           "parts": [{"name": o.name, "role": o["char_modular_role"], "bone": o.get("char_modular_bone", "soft skin"),
                      "triangles": sum(len(poly.vertices) - 2 for poly in o.data.polygons)} for o in assembled],
           "blend": str(a.blend), "runtimeApplied": False, "visualPassed": False}
a.receipt.parent.mkdir(parents=True, exist_ok=True)
a.receipt.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("MODULAR_ASSEMBLY", len(assembled), "parts; reference bones preserved", len(original))
