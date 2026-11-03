"""Headless shape receipt for a newly generated independent part, not game QA."""
import argparse
import bpy
import json
import math
from mathutils import Vector
from pathlib import Path
import sys

p = argparse.ArgumentParser()
p.add_argument("--model", type=Path, required=True)
p.add_argument("--out", type=Path, required=True)
a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(a.model))
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
points = [o.matrix_world @ Vector(v) for o in meshes for v in o.bound_box]
low = Vector([min(v[i] for v in points) for i in range(3)])
high = Vector([max(v[i] for v in points) for i in range(3)])
center = (low + high) / 2
size = max(high - low)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 8
scene.cycles.use_denoising = True
scene.render.resolution_x = 640
scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.world = bpy.data.worlds.new("Neutral studio")
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.2, .2, .2, 1)
scene.world.node_tree.nodes["Background"].inputs[1].default_value = .6
for label, offset, energy, light_size in (("Key", (-2, -3, 4), 350, 3), ("Fill", (3, 1, 2), 180, 3)):
    data = bpy.data.lights.new(label, "AREA")
    data.energy = energy * size * size
    data.shape = "DISK"
    data.size = light_size * size
    obj = bpy.data.objects.new(label, data)
    scene.collection.objects.link(obj)
    obj.location = center + Vector(offset) * size
    obj.rotation_euler = (center - obj.location).to_track_quat("-Z", "Y").to_euler()
cam = bpy.data.objects.new("Part review", bpy.data.cameras.new("Part review"))
scene.collection.objects.link(cam)
scene.camera = cam
cam.data.type = "ORTHO"
cam.data.ortho_scale = size * 1.3
a.out.mkdir(parents=True, exist_ok=True)
for label, yaw, pitch in (("front", 0, 0), ("side", 90, 0), ("back", 180, 0), ("pitch34", 25, 34)):
    yaw = math.radians(yaw)
    pitch = math.radians(pitch)
    cam.location = center + Vector((math.sin(yaw) * math.cos(pitch), -math.cos(yaw) * math.cos(pitch), math.sin(pitch))) * size * 4
    cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = str(a.out / (label + ".png"))
    bpy.ops.render.render(write_still=True)
receipt = {"scope": "isolated generated part; not Unity renderer/game silhouette QA", "model": str(a.model),
           "blender": bpy.app.version_string, "objects": len(meshes),
           "triangles": sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes),
           "boundsMin": list(low), "boundsMax": list(high), "dimensions": list(high - low),
           "materials": [m.name for o in meshes for m in o.data.materials if m]}
(a.out / "receipt.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("PART_RECEIPT", receipt["triangles"], "triangles", len(meshes), "objects")
