"""Export assembled authoring parts to one draw mesh with rigid plate weights.
The native .blend keeps every independent part. Original part GLBs retain 2K maps.
"""
import argparse
from array import array
import bpy
import json
from pathlib import Path
import sys

p = argparse.ArgumentParser()
p.add_argument("--blend", type=Path, required=True)
p.add_argument("--out", type=Path, required=True)
p.add_argument("--weapon", type=Path, required=True)
a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
bpy.ops.wm.open_mainfile(filepath=str(a.blend.resolve()))
rig = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")
parts = [o for o in bpy.context.scene.objects if o.type == "MESH" and o.get("char_modular_role") in ("rigid", "soft")]
names = [o.name for o in parts]
for required in ("Warrior_Underbody", "Warrior_Head", "Warrior_Hair", "Warrior_Belt", "Warrior_CapeScarf", "Warrior_Boot_Left", "Warrior_Gauntlet_Right"):
    if required not in names:
        raise RuntimeError("incomplete assembly: " + required)
if len([b for b in rig.data.bones if b.name.startswith("Cape_")]) != 12:
    raise RuntimeError("expected cape 3x4 chain")

def family(obj):
    if "Hair" in obj.name:
        return "Hair"
    if "Underbody" in obj.name:
        return "Leather"
    if "CapeScarf" in obj.name:
        return "Cloth"
    if "Head" in obj.name:
        return "Skin"
    if "Belt" in obj.name:
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

materials = {}
images = []
mapping = {}
for obj in parts:
    for material in obj.data.materials:
        if material in mapping:
            continue
        image = base_image(material)
        if image and image not in images:
            images.append(image)
        mapping[material] = images.index(image) if image else -1
if len(images) > 16:
    raise RuntimeError("atlas capacity exceeded")
side, tile, padding, inner = 2048, 512, 8, 496
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
atlas = bpy.data.images.new("Warrior_Modular_BaseColor", width=side, height=side, alpha=False)
atlas.pixels.foreach_set(pixels)
atlas.update()
a.out.mkdir(parents=True, exist_ok=True)
atlas.filepath_raw = str((a.out / "Warrior_Modular_BaseColor.png").resolve())
atlas.file_format = "PNG"
atlas.save()
families = ("Iron", "Leather", "Cloth", "Skin", "Hair")
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
    if not uv:
        raise RuntimeError("UV missing: " + obj.name)
    for face in obj.data.polygons:
        index = mapping[old[face.material_index]]
        if index < 0:
            raise RuntimeError("base color missing: " + obj.name)
        for loop in face.loop_indices:
            source_uv = uv.data[loop].uv.copy()
            uv.data[loop].uv = (((index % 4) * tile + padding + source_uv.x * inner) / side,
                                ((index // 4) * tile + padding + source_uv.y * inner) / side)
    obj.data.materials.clear()
    for name in families:
        obj.data.materials.append(materials[name])
    for face in obj.data.polygons:
        kind = family(obj)
        if "Underbody" in obj.name:
            center = sum((obj.data.vertices[v].co for v in face.vertices), obj.data.vertices[face.vertices[0]].co * 0) / len(face.vertices)
            if center.z > 1.52 and abs(center.x) < .12:
                kind = "Skin"
        face.material_index = families.index(kind)
before = sum(sum(len(face.vertices) - 2 for face in obj.data.polygons) for obj in parts)
bpy.ops.object.select_all(action="DESELECT")
for obj in parts:
    obj.select_set(True)
bpy.context.view_layer.objects.active = next(o for o in parts if o.name == "Warrior_Underbody")
bpy.ops.object.join()
body = bpy.context.object
body.name = "Warrior_Modular_DrawMesh"
after = sum(len(face.vertices) - 2 for face in body.data.polygons)
assert before == after
rig.select_set(True)
for obj in bpy.context.scene.objects:
    if obj.type == "EMPTY":
        obj.select_set(True)
bpy.ops.export_scene.fbx(filepath=str((a.out / "Warrior_Modular.fbx").resolve()), use_selection=True,
    object_types={"ARMATURE", "MESH", "EMPTY"}, add_leaf_bones=False, bake_anim=False,
    path_mode="STRIP", axis_forward="-Z", axis_up="Y")
receipt = {"scope": "modular authoring parts -> combined draw mesh; not automatic whole-body rigging",
           "parts": names, "triangles": after, "bones": len(rig.data.bones), "materials": list(families),
           "materialTriangles": [sum(len(face.vertices) - 2 for face in body.data.polygons if face.material_index == index) for index in range(len(families))],
           "baseColorAtlas": [side, side], "atlasSources": len(images), "runtimeApplied": False}

# The existing separately generated sword is reduced without changing its master.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(a.weapon))
swords = [o for o in bpy.context.scene.objects if o.type == "MESH"]
for obj in swords:
    count = sum(len(face.vertices) - 2 for face in obj.data.polygons)
    if count > 3000:
        bpy.context.view_layer.objects.active = obj
        modifier = obj.modifiers.new("Runtime sword triangle budget", "DECIMATE")
        modifier.ratio = 3000 / count
        bpy.ops.object.modifier_apply(modifier=modifier.name)
receipt["swordTriangles"] = sum(sum(len(face.vertices) - 2 for face in obj.data.polygons) for obj in swords)
bpy.ops.object.select_all(action="DESELECT")
for obj in swords:
    obj.select_set(True)
bpy.ops.export_scene.fbx(filepath=str((a.out / "Warrior_Modular_Sword.fbx").resolve()), use_selection=True,
    object_types={"MESH"}, add_leaf_bones=False, bake_anim=False, axis_forward="-Z", axis_up="Y")
receipt["totalTriangles"] = receipt["triangles"] + receipt["swordTriangles"]
if not 25000 <= receipt["totalTriangles"] <= 40000:
    raise RuntimeError("whole hero triangle budget failed: %s" % receipt["totalTriangles"])
(a.out / "assembly-contract.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("UNITY_EXPORT", receipt["totalTriangles"], "triangles; 4 families plus black hair, 2K atlas; no Player")
