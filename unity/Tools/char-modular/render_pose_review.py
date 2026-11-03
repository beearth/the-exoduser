"""34-degree perspective geometry fixtures. These are NOT Animator/game captures."""
import argparse
import bpy
import json
import math
from mathutils import Matrix, Quaternion, Vector
from pathlib import Path
import sys

p = argparse.ArgumentParser()
p.add_argument("--model", type=Path, required=True)
p.add_argument("--out", type=Path, required=True)
p.add_argument("--variant", choices=("modular", "legacy"), required=True)
a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
if a.model.suffix.lower() == ".blend":
    bpy.ops.wm.open_mainfile(filepath=str(a.model.resolve()))
else:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=str(a.model))
rig = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")
sys.path.insert(0, str(Path(__file__).parent))
from modular_bind import import_part, fit_static, rigid_bind
prop = import_part("I:/EXODUSER-Storage/Meshy/warrior_weapon_20261027_2254/model.glb", "Shared sword geometry fixture")
fit_static(prop, (0, 0, 0), (.24, .055, 1.6))
direction = Vector((0, -.82, -.55)).normalized()
rotation = Vector((0, 0, 1)).rotation_difference(direction)
hand = rig.matrix_world @ rig.data.bones["RightHand"].head_local
for vertex in prop.data.vertices:
    vertex.co = rotation @ (vertex.co - Vector((0, 0, -.6))) + hand
rigid_bind(prop, rig, "RightHand")
prop["char_modular_role"] = "weapon_reference"
root = bpy.data.objects.new("Comparison scale 1.31u", None)
bpy.context.collection.objects.link(root)
for obj in list(bpy.context.scene.objects):
    if obj is not root and obj.parent is None:
        world = obj.matrix_world.copy()
        obj.parent = root
        obj.matrix_world = world
root.scale = (1.31 / 1.85,) * 3
bpy.context.view_layer.update()
rest_foot = {side: (rig.matrix_world @ rig.pose.bones[side + "Foot"].matrix).copy() for side in ("Left", "Right")}
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
    if label != "arm90":
        ik("LeftArm", "LeftForeArm", "LeftHand", (.30, -.12, 1.10), (1, 0, 0))
        ik("RightArm", "RightForeArm", "RightHand", (-.30, -.12, 1.10), (-1, 0, 0))
    if label == "elbow140":
        for bone in rig.pose.bones:
            bone.matrix_basis = Matrix.Identity(4)
        bpy.context.view_layer.update()
        turn("LeftForeArm", -140, (0, 0, 1))
        turn("RightForeArm", 140, (0, 0, 1))
    elif label == "knee120":
        turn("LeftLeg", 120, (1, 0, 0))
    elif label == "crouch":
        move("Hips", (0, 0, -.35))
        turn("Spine", 28, (1, 0, 0))
        for side in ("Left", "Right"):
            target = root.matrix_world.inverted() @ rest_foot[side].translation
            ik(side + "UpLeg", side + "Leg", side + "Foot", target, (0, -1, 0))
    elif label == "twist45":
        turn("Spine", 45, (0, 0, 1))
    elif label == "run":
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

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 8
scene.cycles.use_denoising = True
scene.render.resolution_x = 1920; scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.use_border = True; scene.render.use_crop_to_border = True
scene.render.border_min_x = 800 / 1920; scene.render.border_max_x = 1120 / 1920
scene.render.border_min_y = 380 / 1080; scene.render.border_max_y = 700 / 1080
scene.render.image_settings.file_format = "PNG"
scene.world = bpy.data.worlds.new("Neutral comparison")
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.10, .12, .13, 1)
scene.world.node_tree.nodes["Background"].inputs[1].default_value = .8
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -.01))
floor = bpy.context.object
material = bpy.data.materials.new("Neutral comparison floor")
material.diffuse_color = (.055, .06, .055, 1)
floor.data.materials.append(material)
for name, pos, power in (("Key", (-3, -4, 6), 600), ("Fill", (4, 1, 3), 300)):
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
camera.location = target + Vector((0, -math.cos(math.radians(34)), math.sin(math.radians(34)))) * 16.5
camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
labels = ("idle", "run", "arm90", "elbow140", "knee120", "crouch", "twist45", "strike1", "strike2", "strike3", "roll_mid")
a.out.mkdir(parents=True, exist_ok=True)
rigid = [o for o in bpy.context.scene.objects if o.type == "MESH" and o.get("char_modular_role") == "rigid"]
base_lengths = {o.name: [(o.data.vertices[e.vertices[0]].co - o.data.vertices[e.vertices[1]].co).length for e in o.data.edges] for o in rigid}
metrics = []
for label in labels:
    pose(label)
    worst = 0
    for obj in rigid:
        evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
        # Compare in the object's own space; source/object scale is constant over poses.
        for edge, original in zip(evaluated.data.edges, base_lengths[obj.name]):
            length = (evaluated.data.vertices[edge.vertices[0]].co - evaluated.data.vertices[edge.vertices[1]].co).length
            worst = max(worst, abs(length - original))
    scene.render.filepath = str(a.out / (label + ".png"))
    bpy.ops.render.render(write_still=True)
    metrics.append({"pose": label, "maxRigidEdgeError": worst})
receipt = {"scope": "Blender geometry validation poses, NOT existing Animator clips or Unity/game renders",
           "variant": a.variant, "pitch": 34, "verticalFov": 46.9453, "distance": 16.5,
           "viewport": [1920, 1080], "nativeCrop": [320, 320], "scale": 1.31 / 1.85,
           "poses": metrics, "rigidNumericalPass": all(m["maxRigidEdgeError"] < 2e-5 for m in metrics),
           "visualPassed": False, "animatorVerified": False}
receipt["weaponScope"] = "same separately generated sword fixture; game socket/orientation require Animator QA"
receipt["nativeCropNominal"] = receipt.pop("nativeCrop")
measured = bpy.data.images.load(str((a.out / "idle.png").resolve()), check_existing=False)
receipt["nativeCropActual"] = list(measured.size)
bpy.data.images.remove(measured)
(a.out / "receipt.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("POSE_REVIEW", a.variant, len(metrics), "poses; rigid numerical", receipt["rigidNumericalPass"])
