"""Read-only A/B shape evidence. Neutral material deliberately removes texture bias.
No input is edited or adopted; Tripo raw components remain unmerged/unrigged.
"""
import argparse
import bpy
import json
import math
from mathutils import Vector
from pathlib import Path
import sys

p = argparse.ArgumentParser()
p.add_argument("--a", type=Path, required=True)
p.add_argument("--b", type=Path, required=True)
p.add_argument("--out", type=Path, required=True)
a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
a.out.mkdir(parents=True, exist_ok=True)
receipt = {"scope": "A/B neutral shape review only; no source edits, adoption, rigging or game validation", "variants": {}}
for variant, source in (("A_Tripo", a.a), ("B_Meshy_assembled", a.b)):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if source.suffix == ".blend":
        bpy.ops.wm.open_mainfile(filepath=str(source.resolve()))
    else:
        bpy.ops.import_scene.gltf(filepath=str(source.resolve()))
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    points = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    low = Vector(tuple(min(v[i] for v in points) for i in range(3)))
    high = Vector(tuple(max(v[i] for v in points) for i in range(3)))
    factor = 1.85 / (high.z - low.z)
    center = Vector(((low.x + high.x) / 2, (low.y + high.y) / 2, low.z))
    holder = bpy.data.objects.new("Shape normalization only", None)
    bpy.context.collection.objects.link(holder)
    for obj in list(bpy.context.scene.objects):
        if obj is not holder and obj.parent is None:
            world = obj.matrix_world.copy()
            obj.parent = holder
            obj.matrix_world = world
    holder.scale = (factor,) * 3
    holder.location = -center * factor
    bpy.context.view_layer.update()
    mat = bpy.data.materials.new("Neutral geometry inspection")
    mat.diffuse_color = (.25, .27, .28, 1)
    catalog = []
    for obj in meshes:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
        points = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
        catalog.append({"name": obj.name, "triangles": sum(len(f.vertices) - 2 for f in obj.data.polygons),
                        "low": [min(v[i] for v in points) for i in range(3)],
                        "high": [max(v[i] for v in points) for i in range(3)]})
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 8
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 640; scene.render.resolution_y = 640
    scene.render.resolution_percentage = 100
    scene.world = bpy.data.worlds.new("Neutral world")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.12, .12, .12, 1)
    scene.world.node_tree.nodes["Background"].inputs[1].default_value = .8
    for name, location, energy in (("Key", (-3, -4, 6), 600), ("Fill", (4, 2, 4), 400)):
        light = bpy.data.objects.new(name, bpy.data.lights.new(name, "AREA"))
        scene.collection.objects.link(light)
        light.location = location
        light.data.energy = energy; light.data.size = 4
        light.rotation_euler = (Vector((0, 0, .95)) - light.location).to_track_quat("-Z", "Y").to_euler()
    camera = bpy.data.objects.new("Shape review camera", bpy.data.cameras.new("Shape review camera"))
    scene.collection.objects.link(camera); scene.camera = camera
    camera.data.type = "ORTHO"; camera.data.ortho_scale = 2.25
    target = Vector((0, 0, .95))
    for view, yaw in (("front34", 0), ("side34", 90), ("back34", 180)):
        yaw = math.radians(yaw); pitch = math.radians(34)
        camera.location = target + Vector((math.sin(yaw) * math.cos(pitch), -math.cos(yaw) * math.cos(pitch), math.sin(pitch))) * 5
        camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = str(a.out / (variant + "_" + view + ".png"))
        bpy.ops.render.render(write_still=True)
    receipt["variants"][variant] = {"source": str(source), "originalHeight": high.z-low.z,
        "inspectionScale": factor, "meshes": catalog, "totalTriangles": sum(c["triangles"] for c in catalog)}
receipt["camera"] = {"pitch": 34, "projection": "orthographic shape review, not game camera", "orthoScale": 2.25}
(a.out / "receipt.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("AB_SHAPE_REVIEW_DONE", {k: len(v["meshes"]) for k, v in receipt["variants"].items()})
