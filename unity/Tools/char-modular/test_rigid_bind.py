"""Blender headless: check actual deformed geometry, not source-text assertions."""
import bpy
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))
from modular_bind import rigid_bind

bpy.ops.wm.read_factory_settings(use_empty=True)
data = bpy.data.armatures.new("fixture")
rig = bpy.data.objects.new("fixture", data)
bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
root = data.edit_bones.new("Spine")
root.head = (0, 0, 0)
root.tail = (0, 0, 1)
child = data.edit_bones.new("LeftArm")
child.head = (0, 0, 1)
child.tail = (1, 0, 1)
child.parent = root
bpy.ops.object.mode_set(mode="OBJECT")
bpy.ops.mesh.primitive_cube_add(size=.25, location=(.3, 0, 1))
plate = bpy.context.object
# Regression: an inherited unwanted weight must be removed.
plate.vertex_groups.new(name="LeftArm").add(list(range(8)), .5, "REPLACE")
rigid_bind(plate, rig, "Spine")
assert len(plate.vertex_groups) == 1
assert all(len(v.groups) == 1 and abs(v.groups[0].weight - 1) < 1e-7 for v in plate.data.vertices)

def points():
    bpy.context.view_layer.update()
    obj = plate.evaluated_get(bpy.context.evaluated_depsgraph_get())
    return [obj.matrix_world @ v.co for v in obj.data.vertices]

before = points()
rig.pose.bones["Spine"].rotation_mode = "XYZ"
rig.pose.bones["Spine"].rotation_euler = (.8, .4, .7)
rig.pose.bones["LeftArm"].rotation_mode = "XYZ"
rig.pose.bones["LeftArm"].rotation_euler = (2.443461, 0, 0)
after = points()
error = max(abs((before[i] - before[j]).length - (after[i] - after[j]).length)
            for i in range(8) for j in range(i))
assert error < 1e-6, error
try:
    rigid_bind(plate, rig, "missing")
except ValueError:
    pass
else:
    raise AssertionError("missing target bone accepted")
print("RIGID_BIND_PASS: weight cleanup, unit weights, pose distance invariance, missing bone refusal; max_error=", error)
