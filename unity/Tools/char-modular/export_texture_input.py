"""A-pose rest GLB for texturing: the 24 body groups (greatsword excluded), part names kept, one grey material.
Blender headless only. The authoring file is opened, evaluated at the rest pose and never saved.
Output: Y-up metres (glTF), identity object transforms (vertices baked to world), no skin, no animation.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import bpy

p = argparse.ArgumentParser()
p.add_argument("--blend", type=Path, required=True)
p.add_argument("--out", type=Path, required=True)
a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
bpy.ops.wm.open_mainfile(filepath=str(a.blend.resolve()))
scene = bpy.context.scene
rig = next(o for o in scene.objects if o.type == "ARMATURE")
for bone in rig.pose.bones:
    bone.matrix_basis.identity()
bpy.context.view_layer.update()
meshes = [o for o in scene.objects if o.type == "MESH" and o.get("char_modular_role") in ("rigid", "soft")]
sword = [o for o in meshes if o.get("char_modular_group") == "W25"]
parts = [o for o in meshes if o not in sword]
assert len(sword) == 1 and len({o["char_modular_group"] for o in parts}) == 24
grey = bpy.data.materials.new("TextureInput_Grey")
grey.diffuse_color = (.5, .5, .5, 1)
grey.use_nodes = True
grey.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (.5, .5, .5, 1)
deps = bpy.context.evaluated_depsgraph_get()
collection = bpy.data.collections.new("TextureInput")
scene.collection.children.link(collection)
staged = []
triangles = 0
for obj in sorted(parts, key=lambda o: o.name):
    evaluated = obj.evaluated_get(deps)
    mesh = bpy.data.meshes.new_from_object(evaluated, depsgraph=deps)
    mesh.transform(obj.matrix_world)          # world metres at the rest pose
    mesh.materials.clear()
    mesh.materials.append(grey)
    for polygon in mesh.polygons:
        polygon.material_index = 0
    for layer in list(mesh.uv_layers):
        mesh.uv_layers.remove(layer)          # untextured A parts have none; head/hair UVs are not needed for grey input
    staged.append((obj.name, mesh))
    triangles += sum(len(f.vertices) - 2 for f in mesh.polygons)
# Remove the authoring objects (in this unsaved session) so the exported nodes keep the exact part names.
for obj in list(scene.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
exported = []
for name, mesh in staged:
    copy = bpy.data.objects.new(name, mesh)
    collection.objects.link(copy)
    assert copy.name == name, copy.name
    exported.append(copy)
bpy.ops.object.select_all(action="DESELECT")
for obj in exported:
    obj.select_set(True)
bpy.context.view_layer.objects.active = exported[0]
low = [min((o.matrix_world @ v.co)[i] for o in exported for v in o.data.vertices) for i in range(3)]
high = [max((o.matrix_world @ v.co)[i] for o in exported for v in o.data.vertices) for i in range(3)]
a.out.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(a.out.resolve()), export_format="GLB", use_selection=True, export_yup=True,
    export_apply=False, export_skins=False, export_animations=False, export_materials="EXPORT",
    export_image_format="NONE", export_cameras=False, export_lights=False, export_extras=False)
data = a.out.read_bytes()
summary = {"file": str(a.out), "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "triangles": triangles,
           "objects": len(exported), "logicalGroups": 24, "greatswordIncluded": False,
           "heightMetres": high[2] - low[2], "bboxZUpMetres": {"min": low, "max": high},
           "upAxis": "Y (glTF export_yup)", "pose": "A-pose rest (all pose bones identity)", "material": "single grey",
           "partNames": [o.name for o in exported]}
a.out.with_name(a.out.stem + "-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("TEXTURE_INPUT_GLB", len(exported), "objects", triangles, "triangles", len(data), "bytes", summary["sha256"], "height", summary["heightMetres"])
