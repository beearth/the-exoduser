"""Front orthographic grey render of the warrior authoring file for the proportion comparison board.
Blender headless, Cycles CPU, no texture, greatsword hidden. Pose: rest (A pose) or arm_down (each arm chain turned about the
shoulder joint so shoulder->wrist points straight down, a static fixture, not an Animator clip). Also writes a json with the
pixel rows of the landmarks (shoulder, elbow, wrist, fingertip, hip, knee) so the board can draw the same lines in every column.
"""
import argparse
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).parent))
from hybrid_poses import Poses
import measure_proportion as mp

p = argparse.ArgumentParser()
p.add_argument("--blend", type=Path, required=True)
p.add_argument("--pose", choices=("rest", "arm_down"), required=True)
p.add_argument("--out", type=Path, required=True)
a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
scene, rig = mp.open_scene(a.blend)
Poses(rig).apply(a.pose)
for o in scene.objects:
    if o.type == "MESH" and o.get("char_modular_group") == "W25":
        o.hide_render = True
mat = bpy.data.materials.new("grey")
mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (.55, .55, .56, 1)
mat.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = .8
for o in scene.objects:
    if o.type == "MESH":
        o.data.materials.clear()
        o.data.materials.append(mat)
        for f in o.data.polygons:
            f.material_index = 0
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 24
scene.cycles.use_denoising = False
SIZE = 1000
scene.render.resolution_x = SIZE
scene.render.resolution_y = SIZE
scene.render.film_transparent = True
CENTRE_Z, SCALE = 0.925, 2.1
cam = bpy.data.objects.new("front", bpy.data.cameras.new("front"))
scene.collection.objects.link(cam)
scene.camera = cam
cam.data.type = "ORTHO"
cam.data.ortho_scale = SCALE
cam.location = (0, -6, CENTRE_Z)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.world = bpy.data.worlds.new("w")
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.55, .55, .56, 1)
scene.world.node_tree.nodes["Background"].inputs[1].default_value = .9
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
scene.collection.objects.link(sun)
sun.data.energy = 2.6
sun.rotation_euler = (math.radians(55), 0, math.radians(-30))
a.out.parent.mkdir(parents=True, exist_ok=True)
scene.render.filepath = str(a.out)
bpy.ops.render.render(write_still=True)
# landmark rows (pixel y from the top) of the posed rig, pixel x of the figure centre
bpy.context.view_layer.update()
m = rig.matrix_world


def head(name):
    return m @ rig.pose.bones[name].head


def px(z):
    return SIZE / 2 - (z - CENTRE_Z) / SCALE * SIZE


def pxx(x):
    return SIZE / 2 + x / SCALE * SIZE


info = {"pose": a.pose, "pxPerMetre": SIZE / SCALE, "rowFloor": px(0.0), "rowTop": px(1.85), "centreX": pxx(0)}
for side in ("Left", "Right"):
    info[side] = {"shoulderRow": px(head(side + "Arm").z), "elbowRow": px(head(side + "ForeArm").z), "wristRow": px(head(side + "Hand").z),
                  "hipRow": px(head(side + "UpLeg").z), "kneeRow": px(head(side + "Leg").z)}
deps = bpy.context.evaluated_depsgraph_get()
low = {}
for side in ("Left", "Right"):
    zs = []
    for o in scene.objects:
        if o.type == "MESH" and o.get("char_modular_role") == "rigid" and o.get("char_modular_bone") == side + "Hand":
            ev = o.evaluated_get(deps)
            zs += [(ev.matrix_world @ v.co).z for v in ev.data.vertices]
    low[side] = min(zs)
    info[side]["fingertipRow"] = px(low[side])
    info[side]["fingertipHeightH"] = low[side] / 1.85
a.out.with_suffix(".json").write_text(json.dumps(info, indent=1), encoding="utf-8")
print("FRONT_RENDER_DONE", a.pose, json.dumps({s: info[s]["fingertipHeightH"] for s in ("Left", "Right")}))
