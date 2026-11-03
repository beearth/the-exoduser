"""Actual new cloth body: inverse A-pose skinning must reconstruct every vertex."""
import bpy
from mathutils import Matrix
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent))
from modular_bind import import_part, fit_static, soft_bind_body

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath="unity/Assets/Exoduser/Art/Characters/Warrior/RemasterR7/Warrior_R7.fbx")
rig = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")
for obj in list(bpy.context.scene.objects):
    if obj.type == "MESH":
        bpy.data.objects.remove(obj, do_unlink=True)
body = import_part("I:/EXODUSER-Storage/char-modular/meshy/body/model.glb", "NewClothBody")
fit_static(body, (0, 0, .8), (1.3, .35, 1.6))
before = [body.matrix_world @ v.co for v in body.data.vertices]
offsets = soft_bind_body(body, rig)
for name, transform in offsets.items():
    rig.pose.bones[name].matrix = rig.matrix_world.inverted() @ transform @ rig.matrix_world @ rig.data.bones[name].matrix_local
bpy.context.view_layer.update()
evaluated = body.evaluated_get(bpy.context.evaluated_depsgraph_get())
after = [evaluated.matrix_world @ v.co for v in evaluated.data.vertices]
error = max((x - y).length for x, y in zip(before, after))
assert error < 2e-5, error
assert all(1 <= len(v.groups) <= 2 and abs(sum(g.weight for g in v.groups) - 1) < 1e-6 for v in body.data.vertices)
assert body["char_modular_role"] == "soft"
print("SOFT_BIND_PASS: actual cloth vertices", len(before), "A-pose roundtrip max_error", error)
