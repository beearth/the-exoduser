"""A+B_G0 export: 24 body groups -> one draw mesh, single-bone metal, baked 4K atlas; sword separate.
11-04 Sonnet revision; 11-04 texture-bake revision (flat colour tiles replaced by the baked atlas, --atlas).

The native .blend stays the authoring SSOT. This script never saves it. It
 - joins W01..W24 (everything except the W25 greatsword) into one skinned draw mesh,
 - uses the part UVs stored in the blend (family regions of one 4096 atlas) with the baked atlas image as base colour,
 - adds the runtime sockets Socket_Weapon_R / Grip_L as bone children (blade = -local Y = Unity up),
 - exports the sword as a world-aligned rest mesh (Unity places it at world identity under the socket).
Blender runs headless only. The couter Copy Rotation constraints are not exported; Unity builds
RotationConstraints on elbow_l_couter / elbow_r_couter in the import step.
"""
import argparse
from array import array
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Matrix, Vector

p = argparse.ArgumentParser()
p.add_argument("--blend", type=Path, required=True)
p.add_argument("--out", type=Path, required=True)
p.add_argument("--weapon", type=Path, required=False)  # legacy argument; the sword now comes from the authoring file
p.add_argument("--atlas", type=Path, required=True)    # final baked 4096 base colour atlas
a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
bpy.ops.wm.open_mainfile(filepath=str(a.blend.resolve()))
scene = bpy.context.scene
rig = next(o for o in scene.objects if o.type == "ARMATURE")
all_meshes = [o for o in scene.objects if o.type == "MESH" and o.get("char_modular_role") in ("rigid", "soft")]
sword = next(o for o in all_meshes if o.get("char_modular_group") == "W25")
parts = [o for o in all_meshes if o is not sword]
names = [o.name for o in parts]
groups_present = {o["char_modular_group"] for o in parts}
missing = ["W%02d" % i for i in range(1, 25) if "W%02d" % i not in groups_present]
if missing:
    raise RuntimeError("incomplete assembly, missing groups: %s" % missing)
for required in ("Warrior_Head", "Warrior_Hair"):
    if required not in names:
        raise RuntimeError("incomplete assembly: " + required)
cape_bones = [b for b in rig.data.bones if b.name.startswith("Cape_")]
hair_bones = [b for b in rig.data.bones if b.name.startswith("RigHair_")]
if len(cape_bones) != 12 or len(hair_bones) != 6:
    raise RuntimeError("expected cape 3x4 and hair 2x3 chains: %d/%d" % (len(cape_bones), len(hair_bones)))
for needed in ("elbow_l_couter", "elbow_r_couter", "hand_r_weapon"):
    if needed not in rig.data.bones:
        raise RuntimeError("missing bone: " + needed)
if scene.get("char_modular_revision") != "0320_rest_growth":
    raise RuntimeError("unexpected authoring revision")

SOFT = {"W03", "W16", "W23", "W24"}


def family(obj):
    group = obj["char_modular_group"]
    if group == "W01":
        return "Skin"
    if group == "W02":
        return "Hair"
    if group in SOFT:
        return "Cloth"
    if group == "W14":
        return "Leather"
    return "Iron"


# ----------------------------------------------------------------------------- baked atlas (11-04 texture bake; replaces the flat colour tiles)
atlas_src = a.atlas.resolve()
if not atlas_src.exists():
    raise RuntimeError("baked atlas missing: %s" % atlas_src)
a.out.mkdir(parents=True, exist_ok=True)
import shutil
shutil.copyfile(str(atlas_src), str((a.out / "Warrior_Modular_BaseColor.png").resolve()))
atlas = bpy.data.images.load(str((a.out / "Warrior_Modular_BaseColor.png").resolve()), check_existing=False)
side = atlas.size[0]
if atlas.size[0] != atlas.size[1] or side < 4096:
    raise RuntimeError("expected a 4096 atlas, got %s" % (tuple(atlas.size),))
families = ("Iron", "Leather", "Cloth", "Skin", "Hair")
materials = {}
for name in families:
    material = bpy.data.materials.new("WarriorModular_" + name)
    material.use_nodes = True
    node = material.node_tree.nodes.new("ShaderNodeTexImage")
    node.image = atlas
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    material.node_tree.links.new(node.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = .85 if name == "Iron" else 0
    bsdf.inputs["Roughness"].default_value = .4 if name == "Iron" else .75
    materials[name] = material

for obj in parts:
    kind_family = family(obj)
    uv = obj.data.uv_layers.active
    if uv is None or len(obj.data.uv_layers) != 1:
        raise RuntimeError("part must carry exactly the baked UVMap: " + obj.name)
    uv.name = "UVMap"
    obj.data.materials.clear()
    for name in families:
        obj.data.materials.append(materials[name])
    for face in obj.data.polygons:
        face.material_index = families.index(kind_family)

# ----------------------------------------------------------------------------- sockets (blade = -local Y = Unity up)
bpy.context.view_layer.update()
grip_world = rig.matrix_world @ rig.data.bones["hand_r_weapon"].head_local
sword_world = [sword.matrix_world @ v.co for v in sword.data.vertices]
ranked = sorted(sword_world, key=lambda point: (point - grip_world).length, reverse=True)
tip = sum(ranked[:max(8, len(ranked) // 100)], Vector()) / max(8, len(ranked) // 100)
blade = (tip - grip_world).normalized()
expected = Vector((0, -.82, -.55)).normalized()
if blade.angle(expected) > math.radians(3):
    raise RuntimeError("blade direction differs from the authored fixture: %.2f deg" % math.degrees(blade.angle(expected)))
up = -blade   # pommel direction; Unity keeps the empty's local axes, so this must be the local +Y (Unity up), not Blender's +Z
x_axis = (Vector((1, 0, 0)) - up * Vector((1, 0, 0)).dot(up)).normalized()
z_axis = x_axis.cross(up).normalized()
socket_world = Matrix(((x_axis.x, up.x, z_axis.x, grip_world.x), (x_axis.y, up.y, z_axis.y, grip_world.y),
                       (x_axis.z, up.z, z_axis.z, grip_world.z), (0, 0, 0, 1)))
mirror = Matrix.Diagonal((-1, 1, 1, 1))
grip_left_world = mirror @ socket_world @ mirror   # reflected position and axes, x flipped back so the rotation stays proper (det +1)


def make_empty(name, bone, world):
    empty = bpy.data.objects.new(name, None)
    scene.collection.objects.link(empty)
    empty.empty_display_type = "ARROWS"
    empty.empty_display_size = .05
    empty.parent = rig
    empty.parent_type = "BONE"
    empty.parent_bone = bone
    bpy.context.view_layer.update()
    empty.matrix_world = world
    bpy.context.view_layer.update()
    return empty


socket = make_empty("Socket_Weapon_R", "RightHand", socket_world)
grip_left = make_empty("Grip_L", "LeftHand", grip_left_world)
if (socket.matrix_world.translation - grip_world).length > 1e-6:
    raise RuntimeError("socket placement failed")

# ----------------------------------------------------------------------------- sword (world-aligned rest mesh)
sword_tris = sum(len(f.vertices) - 2 for f in sword.data.polygons)
deps = bpy.context.evaluated_depsgraph_get()
evaluated = sword.evaluated_get(deps)
mesh = bpy.data.meshes.new_from_object(evaluated, depsgraph=deps)
mesh.transform(sword.matrix_world)
sword_copy = bpy.data.objects.new("Warrior_Modular_Sword", mesh)
scene.collection.objects.link(sword_copy)
sword_copy.matrix_world = Matrix.Identity(4)

# ----------------------------------------------------------------------------- body join
before = sum(sum(len(face.vertices) - 2 for face in obj.data.polygons) for obj in parts)
bpy.ops.object.select_all(action="DESELECT")
for obj in parts:
    obj.select_set(True)
bpy.context.view_layer.objects.active = next(o for o in parts if o.name == "Warrior_Head")
bpy.ops.object.join()
body = bpy.context.object
body.name = "Warrior_Modular_DrawMesh"
after = sum(len(face.vertices) - 2 for face in body.data.polygons)
assert before == after
# Metal single-bone check on the joined mesh.
iron_index = families.index("Iron")
group_names = {g.index: g.name for g in body.vertex_groups}
iron_vertices = {v for face in body.data.polygons if face.material_index == iron_index for v in face.vertices}
for index in iron_vertices:
    weights = [g.weight for g in body.data.vertices[index].groups if g.weight > 0]
    if len(weights) != 1 or abs(weights[0] - 1.0) > 1e-6:
        raise RuntimeError("metal vertex %d is not single-bone 100%%" % index)

bpy.ops.object.select_all(action="DESELECT")
for obj in (rig, body, socket, grip_left):
    obj.select_set(True)
bpy.ops.export_scene.fbx(filepath=str((a.out / "Warrior_Modular.fbx").resolve()), use_selection=True,
    object_types={"ARMATURE", "MESH", "EMPTY"}, add_leaf_bones=False, bake_anim=False,
    path_mode="STRIP", axis_forward="-Z", axis_up="Y")
bpy.ops.object.select_all(action="DESELECT")
sword_copy.select_set(True)
bpy.ops.export_scene.fbx(filepath=str((a.out / "Warrior_Modular_Sword.fbx").resolve()), use_selection=True,
    object_types={"MESH"}, add_leaf_bones=False, bake_anim=False, axis_forward="-Z", axis_up="Y")

receipt = {"scope": "A+B_G0 authoring parts -> combined draw mesh (24 groups) + separate sword; not automatic whole-body rigging",
           "variant": scene.get("char_modular_variant"), "authoringFix": scene.get("char_modular_sonnet_fix"),
           "parts": names, "triangles": after, "swordTriangles": sword_tris, "totalTriangles": after + sword_tris,
           "bones": len(rig.data.bones), "capeBones": len(cape_bones), "hairBones": len(hair_bones),
           "materials": list(families),
           "materialTriangles": [sum(len(face.vertices) - 2 for face in body.data.polygons if face.material_index == index) for index in range(len(families))],
           "baseColorAtlas": [side, side], "atlasSource": atlas_src.name,
           "atlasNote": "11-04 Tripo texture bake (selected-to-active Diffuse Color), iron graded to LOCK, cloth despeckled; UVs live in the authoring blend",
           "couterBones": ["elbow_l_couter", "elbow_r_couter"], "sockets": ["Socket_Weapon_R", "Grip_L"],
           "bladeDirectionWorld": [float(x) for x in blade], "gripWorld": [float(x) for x in grip_world],
           "metalVerticesSingle100": len(iron_vertices), "runtimeApplied": False}
if not 25000 <= receipt["totalTriangles"] <= 40000:
    raise RuntimeError("whole hero triangle budget failed: %s" % receipt["totalTriangles"])
(a.out / "assembly-contract.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("UNITY_EXPORT", receipt["totalTriangles"], "triangles; baked 4K atlas; no Player")
