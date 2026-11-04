"""34-degree Blender check renders of the textured A+B warrior (NOT Animator/Unity game captures).
Same camera as render_pose_review.py (1920x1080, pitch 34, vertical FOV 46.9453, distance 16.5, 1.31/1.85 scale, native 320x320 crop).
Rows: idle front, idle rear, run, strike1-3, roll_mid. The baked atlas is applied to the 5 family materials of the authoring blend."""
import argparse
import json
import math
import sys
from pathlib import Path
import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Matrix, Quaternion, Vector

p = argparse.ArgumentParser()
p.add_argument("--blend", type=Path, required=True)
p.add_argument("--atlas", type=Path, required=True)
p.add_argument("--out", type=Path, required=True)
p.add_argument("--samples", type=int, default=24)
p.add_argument("--light", type=float, default=1.0)
a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
bpy.ops.wm.open_mainfile(filepath=str(a.blend.resolve()))
scene = bpy.context.scene
rig = next(o for o in scene.objects if o.type == "ARMATURE")
SOFT = {"W03", "W16", "W23", "W24"}
atlas = bpy.data.images.load(str(a.atlas.resolve()), check_existing=False)
mats = {}
for name in ("Iron", "Leather", "Cloth", "Skin", "Hair"):
    m = bpy.data.materials.new("Check_" + name)
    m.use_nodes = True
    n = m.node_tree.nodes.new("ShaderNodeTexImage"); n.image = atlas; n.interpolation = "Linear"
    b = m.node_tree.nodes["Principled BSDF"]
    m.node_tree.links.new(n.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Metallic"].default_value = 0.0
    b.inputs["Roughness"].default_value = .7
    mats[name] = m
body = []
for o in scene.objects:
    if o.type == "MESH" and o.get("char_modular_role") in ("rigid", "soft"):
        g = o["char_modular_group"]
        if g == "W25":
            continue
        fam = "Skin" if g == "W01" else "Hair" if g == "W02" else "Cloth" if g in SOFT else "Leather" if g == "W14" else "Iron"
        o.data.materials.clear(); o.data.materials.append(mats[fam])
        body.append(o)
root = bpy.data.objects.new("Comparison scale 1.31u", None)
bpy.context.collection.objects.link(root)
for obj in list(scene.objects):
    if obj is not root and obj.parent is None:
        world = obj.matrix_world.copy()
        obj.parent = root
        obj.matrix_world = world
root.scale = (1.31 / 1.85,) * 3
bpy.context.view_layer.update()
rest_dirs = {}
for side in ("Left", "Right"):
    for suffix, end in (("Arm", "ForeArm"), ("UpLeg", "Leg")):
        rest_dirs[side + suffix] = (rig.data.bones[side + end].head_local - rig.data.bones[side + suffix].head_local).normalized()


def world_head(name):
    return rig.matrix_world @ rig.pose.bones[name].head


def turn(name, angle, axis):
    bone = rig.pose.bones[name]
    world = rig.matrix_world @ bone.matrix
    at = world.translation
    rotation = Quaternion(Vector(axis), math.radians(angle)).to_matrix().to_4x4()
    bone.matrix = rig.matrix_world.inverted() @ Matrix.Translation(at) @ rotation @ Matrix.Translation(-at) @ world
    bpy.context.view_layer.update()


def move(name, delta):
    bone = rig.pose.bones[name]
    world = rig.matrix_world @ bone.matrix
    world.translation += Vector(delta) * root.scale.x
    bone.matrix = rig.matrix_world.inverted() @ world
    bpy.context.view_layer.update()


def aim(name, old, new):
    bone = rig.pose.bones[name]
    world = rig.matrix_world @ bone.matrix
    at = world.translation
    rotation = old.rotation_difference(new).to_matrix().to_4x4()
    bone.matrix = rig.matrix_world.inverted() @ Matrix.Translation(at) @ rotation @ Matrix.Translation(-at) @ world
    bpy.context.view_layer.update()


def ik(upper, lower, end, target, hint):
    target = root.matrix_world @ Vector(target)
    start, middle, finish = world_head(upper), world_head(lower), world_head(end)
    first, second = (middle - start).length, (finish - middle).length
    direction = target - start
    length = max(.001, min(direction.length, first + second - .0001))
    direction.normalize()
    side = Vector(hint) - direction * Vector(hint).dot(direction)
    side.normalize()
    along = (first * first - second * second + length * length) / (2 * length)
    elbow = start + direction * along + side * math.sqrt(max(0, first * first - along * along))
    aim(upper, middle - start, elbow - start)
    aim(lower, world_head(end) - world_head(lower), target - world_head(lower))


def follow():
    for side in ("Left", "Right"):
        for name, suffix, parent, alpha in (("Modular_Pauldron_" + side, "Arm", side + "Shoulder", .45),
                ("Modular_Tasset_" + side + "Front", "UpLeg", "Hips", .9),
                ("Modular_Tasset_" + side + "Back", "UpLeg", "Hips", .35)):
            bone = rig.pose.bones.get(name)
            if not bone:
                continue
            end = "ForeArm" if suffix == "Arm" else "Leg"
            parent_delta = rig.pose.bones[parent].matrix @ rig.data.bones[parent].matrix_local.inverted()
            baseline = parent_delta.to_3x3() @ rest_dirs[side + suffix]
            current = rig.pose.bones[side + end].head - rig.pose.bones[side + suffix].head
            delta = Quaternion().slerp(baseline.rotation_difference(current.normalized()), alpha)
            matrix = bone.matrix.copy()
            pivot = matrix.translation
            bone.matrix = Matrix.Translation(pivot) @ delta.to_matrix().to_4x4() @ Matrix.Translation(-pivot) @ matrix
    bpy.context.view_layer.update()


def pose(label):
    for bone in rig.pose.bones:
        bone.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()
    ik("LeftArm", "LeftForeArm", "LeftHand", (.30, -.12, 1.10), (1, 0, 0))
    ik("RightArm", "RightForeArm", "RightHand", (-.30, -.12, 1.10), (-1, 0, 0))
    if label == "run":
        turn("LeftUpLeg", -30, (1, 0, 0)); turn("RightUpLeg", 25, (1, 0, 0))
        turn("RightLeg", 45, (1, 0, 0)); turn("Spine", 10, (1, 0, 0))
    elif label.startswith("strike"):
        index = int(label[-1])
        turn("Spine", (35, -40, 10)[index - 1], (0, 0, 1))
        ik("RightArm", "RightForeArm", "RightHand", (-.18, -.40, (1.3, 1.1, .95)[index - 1]), (-1, 0, 0))
        ik("LeftArm", "LeftForeArm", "LeftHand", (.10, -.40, (1.25, 1.05, .9)[index - 1]), (1, 0, 0))
    elif label == "roll_mid":
        turn("Hips", 90, (1, 0, 0))
        move("Hips", (0, 0, -.2))
        turn("LeftLeg", 80, (1, 0, 0)); turn("RightLeg", 80, (1, 0, 0))
    follow()


scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = a.samples
scene.cycles.use_denoising = True
scene.render.resolution_x = 1920; scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.use_border = True; scene.render.use_crop_to_border = True
scene.render.border_min_x = 800 / 1920; scene.render.border_max_x = 1120 / 1920
scene.render.border_min_y = 380 / 1080; scene.render.border_max_y = 700 / 1080
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.film_transparent = True
scene.view_settings.view_transform = "Standard"
scene.world = bpy.data.worlds.new("Neutral comparison")
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.30, .30, .30, 1)
scene.world.node_tree.nodes["Background"].inputs[1].default_value = .5 * a.light
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -.01))
floor = bpy.context.object
fm = bpy.data.materials.new("Neutral comparison floor"); fm.diffuse_color = (.12, .12, .12, 1)
fm.use_nodes = True; fm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (.12, .12, .12, 1)
floor.data.materials.append(fm)
floor.is_shadow_catcher = True
for name, pos, power in (("Key", (-3, -4, 6), 450 * a.light), ("Fill", (4, 1, 3), 200 * a.light)):
    light = bpy.data.objects.new(name, bpy.data.lights.new(name, "AREA"))
    scene.collection.objects.link(light)
    light.data.energy = power; light.data.size = 4
    light.location = pos; light.rotation_euler = (Vector((0, 0, .7)) - light.location).to_track_quat("-Z", "Y").to_euler()
camera = bpy.data.objects.new("34-degree perspective", bpy.data.cameras.new("34-degree perspective"))
scene.collection.objects.link(camera)
scene.camera = camera
camera.data.sensor_fit = "VERTICAL"; camera.data.sensor_height = 24
camera.data.lens = 24 / (2 * math.tan(math.radians(46.9453 / 2)))
target = Vector((0, 0, .7))
distance = 16.5
a.out.mkdir(parents=True, exist_ok=True)
rows = (("idle_front", "idle", 0), ("idle_rear", "idle", 180), ("run", "run", 0), ("strike1", "strike1", 0),
        ("strike2", "strike2", 0), ("strike3", "strike3", 0), ("roll_mid", "roll_mid", 0))
meta = {}
for rowname, label, azimuth in rows:
    pose(label)
    radians = math.radians(azimuth)
    camera.location = target + Vector((math.sin(radians) * math.cos(math.radians(34)), -math.cos(radians) * math.cos(math.radians(34)),
                                       math.sin(math.radians(34)))) * distance
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.view_layer.update()
    if rowname == "idle_front":
        deps = bpy.context.evaluated_depsgraph_get()
        ys = []
        for o in body:
            ev = o.evaluated_get(deps)
            for v in ev.data.vertices:
                c = world_to_camera_view(scene, camera, o.matrix_world @ v.co)
                ys.append(c.y)
        # full frame is 1080 rows; the crop starts at row 380 (from the bottom) -> crop row 0 is the bottom
        top = (max(ys) * 1080 - 380); bottom = (min(ys) * 1080 - 380)
        meta["idle_front_crop_rows_from_bottom"] = {"head_top": top, "feet_bottom": bottom, "height_px": top - bottom}
    scene.render.filepath = str(a.out / (rowname + ".png"))
    bpy.ops.render.render(write_still=True)
(a.out / "tex_compare_meta.json").write_text(json.dumps(meta, indent=1), encoding="utf-8")
print("TEX_COMPARE", json.dumps(meta))
