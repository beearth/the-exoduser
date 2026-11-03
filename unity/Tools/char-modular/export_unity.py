"""A+B_G0 export: 24 body groups -> one draw mesh, single-bone metal, flat colour atlas; sword separate.
11-04 Sonnet revision (replaces the B-only exporter).

The native .blend stays the authoring SSOT. This script never saves it. It
 - joins W01..W24 (everything except the W25 greatsword) into one skinned draw mesh,
 - gives the textured B head/hair their own atlas tiles and every untextured A part a flat
   family colour tile (Iron/Leather/Cloth); no texture is generated or painted,
 - adds the runtime sockets Socket_Weapon_R / Grip_L as bone children (blade = -up),
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


def base_image(material):
    if not material or not material.use_nodes:
        return None
    principal = next((n for n in material.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if not principal:
        return None

    def walk(socket, visited):
        for link in socket.links:
            node = link.from_node
            if node in visited:
                continue
            visited.add(node)
            if node.type == "TEX_IMAGE" and node.image:
                return node.image
            for inp in node.inputs:
                found = walk(inp, visited)
                if found:
                    return found
        return None
    return walk(principal.inputs["Base Color"], set())


# ----------------------------------------------------------------------------- atlas
FLAT_COLORS = {"Iron": (.20, .21, .23, 1), "Leather": (.19, .14, .10, 1), "Cloth": (.34, .09, .08, 1)}
images = []
mapping = {}
for obj in parts:
    for material in obj.data.materials:
        if material in mapping:
            continue
        image = base_image(material)
        if image is None:
            mapping[material] = -1
            continue
        if image not in images:
            images.append(image)
        mapping[material] = images.index(image)
flat_tile = {name: len(images) + i for i, name in enumerate(FLAT_COLORS)}
side, tile, padding, inner = 2048, 512, 8, 496
if len(images) + len(flat_tile) > 16:
    raise RuntimeError("atlas capacity exceeded")
pixels = array("f", [.12, .12, .12, 1]) * (side * side)
for index, image in enumerate(images):
    image.scale(inner, inner)
    source = array("f", [0]) * (inner * inner * 4)
    image.pixels.foreach_get(source)
    x, y = (index % 4) * tile + padding, (index // 4) * tile + padding
    for row in range(inner):
        start = ((y + row) * side + x) * 4
        pixels[start:start + inner * 4] = source[row * inner * 4:(row + 1) * inner * 4]
        for offset in range(1, padding + 1):
            pixels[start - offset * 4:start - offset * 4 + 4] = source[row * inner * 4:row * inner * 4 + 4]
            right = start + (inner - 1 + offset) * 4
            pixels[right:right + 4] = source[((row + 1) * inner - 1) * 4:(row + 1) * inner * 4]
    for offset in range(1, padding + 1):
        length = tile * 4
        begin = (y * side + x - padding) * 4
        pixels[begin - offset * side * 4:begin - offset * side * 4 + length] = pixels[begin:begin + length]
        end = ((y + inner - 1) * side + x - padding) * 4
        pixels[end + offset * side * 4:end + offset * side * 4 + length] = pixels[end:end + length]
for name, index in flat_tile.items():
    color = array("f", FLAT_COLORS[name])
    x0, y0 = (index % 4) * tile, (index // 4) * tile
    for row in range(tile):
        start = ((y0 + row) * side + x0) * 4
        pixels[start:start + tile * 4] = color * tile
atlas = bpy.data.images.new("Warrior_Modular_BaseColor", width=side, height=side, alpha=False)
atlas.pixels.foreach_set(pixels)
atlas.update()
a.out.mkdir(parents=True, exist_ok=True)
atlas.filepath_raw = str((a.out / "Warrior_Modular_BaseColor.png").resolve())
atlas.file_format = "PNG"
atlas.save()

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
    old = list(obj.data.materials)
    uv = obj.data.uv_layers.active
    kind_family = family(obj)
    if uv is None:
        uv = obj.data.uv_layers.new(name="UVMap")
        center = flat_tile[kind_family]
        flat_uv = (((center % 4) * tile + tile / 2) / side, ((center // 4) * tile + tile / 2) / side)
        for loop in obj.data.loops:
            uv.data[loop.index].uv = flat_uv
    else:
        uv.name = "UVMap"
        for face in obj.data.polygons:
            index = mapping[old[face.material_index]]
            if index < 0:
                raise RuntimeError("base color missing: " + obj.name)
            for loop in face.loop_indices:
                source_uv = uv.data[loop].uv.copy()
                uv.data[loop].uv = (((index % 4) * tile + padding + source_uv.x * inner) / side,
                                    ((index // 4) * tile + padding + source_uv.y * inner) / side)
    while len(obj.data.uv_layers) > 1:
        obj.data.uv_layers.remove(next(l for l in obj.data.uv_layers if l.name != "UVMap"))
    obj.data.materials.clear()
    for name in families:
        obj.data.materials.append(materials[name])
    for face in obj.data.polygons:
        face.material_index = families.index(kind_family)

# ----------------------------------------------------------------------------- sockets (blade = -up)
bpy.context.view_layer.update()
grip_world = rig.matrix_world @ rig.data.bones["hand_r_weapon"].head_local
sword_world = [sword.matrix_world @ v.co for v in sword.data.vertices]
ranked = sorted(sword_world, key=lambda point: (point - grip_world).length, reverse=True)
tip = sum(ranked[:max(8, len(ranked) // 100)], Vector()) / max(8, len(ranked) // 100)
blade = (tip - grip_world).normalized()
expected = Vector((0, -.82, -.55)).normalized()
if blade.angle(expected) > math.radians(3):
    raise RuntimeError("blade direction differs from the authored fixture: %.2f deg" % math.degrees(blade.angle(expected)))
up = -blade
x_axis = (Vector((1, 0, 0)) - up * Vector((1, 0, 0)).dot(up)).normalized()
y_axis = up.cross(x_axis).normalized()
socket_world = Matrix(((x_axis.x, y_axis.x, up.x, grip_world.x), (x_axis.y, y_axis.y, up.y, grip_world.y),
                       (x_axis.z, y_axis.z, up.z, grip_world.z), (0, 0, 0, 1)))
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
           "baseColorAtlas": [side, side], "atlasTexturedSources": [i.name for i in images], "flatTiles": flat_tile,
           "flatColorsNote": "untextured A parts use solid family tiles; no texture generated",
           "couterBones": ["elbow_l_couter", "elbow_r_couter"], "sockets": ["Socket_Weapon_R", "Grip_L"],
           "bladeDirectionWorld": [float(x) for x in blade], "gripWorld": [float(x) for x in grip_world],
           "metalVerticesSingle100": len(iron_vertices), "runtimeApplied": False}
if not 25000 <= receipt["totalTriangles"] <= 40000:
    raise RuntimeError("whole hero triangle budget failed: %s" % receipt["totalTriangles"])
(a.out / "assembly-contract.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("UNITY_EXPORT", receipt["totalTriangles"], "triangles; 3 flat tiles + textured head/hair, 2K atlas; no Player")
