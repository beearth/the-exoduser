"""Read existing rig dimensions/names without editing or adopting its mesh.
Run with Blender -b --python ... -- --source ... --out ...
"""
import argparse
import bpy
import json
from mathutils import Vector
from pathlib import Path
import sys

parser = argparse.ArgumentParser()
parser.add_argument("--source", type=Path, required=True)
parser.add_argument("--out", type=Path, required=True)
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(args.source))
rigs = [o for o in bpy.context.scene.objects if o.type == "ARMATURE"]
if len(rigs) != 1:
    raise RuntimeError("expected one reference armature")
rig = rigs[0]
meshes = []
for obj in bpy.context.scene.objects:
    if obj.type != "MESH":
        continue
    corners = [obj.matrix_world @ Vector(p) for p in obj.bound_box]
    meshes.append({"name": obj.name, "vertices": len(obj.data.vertices),
                   "triangles": sum(len(p.vertices) - 2 for p in obj.data.polygons),
                   "min": [min(p[i] for p in corners) for i in range(3)],
                   "max": [max(p[i] for p in corners) for i in range(3)],
                   "materials": [s.name for s in obj.data.materials if s],
                   "vertexGroups": [g.name for g in obj.vertex_groups]})
result = {"scope": "reference skeleton only; existing rejected mesh is not reused",
          "blender": bpy.app.version_string, "source": str(args.source), "armature": rig.name,
          "boneCount": len(rig.data.bones),
          "bones": [{"name": b.name, "parent": b.parent.name if b.parent else None,
                     "head": list(b.head_local), "tail": list(b.tail_local),
                     "matrix": [list(row) for row in b.matrix_local]} for b in rig.data.bones],
          "armatureMatrix": [list(row) for row in rig.matrix_world], "meshes": meshes,
          "actions": [a.name for a in bpy.data.actions]}
args.out.parent.mkdir(parents=True, exist_ok=True)
args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("REFERENCE_RIG", len(rig.data.bones), "bones; meshes", len(meshes), "; no mesh edits/output")
