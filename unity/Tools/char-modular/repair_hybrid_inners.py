"""One evidence-driven repair: close missing inner faces of flagged A plates.
No bulk part translation, no new mesh generation, no A silhouette replacement.
"""
import argparse
import csv
import json
from pathlib import Path
import sys
import bpy
import bmesh
sys.path.insert(0,str(Path(__file__).parent))
from hybrid_contract import SOFT_GROUPS
from modular_bind import rigid_bind
from geometry_metrics import Snapshot

p=argparse.ArgumentParser()
p.add_argument("--blend",type=Path,required=True)
p.add_argument("--audit",type=Path,required=True)
p.add_argument("--out",type=Path,required=True)
args=p.parse_args(sys.argv[sys.argv.index("--")+1:])
record=json.loads((args.audit/"receipt.json").read_text(encoding="utf-8"))
assert record["attempt"]==1 and not record["numericPassed"]
bpy.ops.wm.open_mainfile(filepath=str(args.blend.resolve()))
assert bpy.context.scene.get("char_modular_variant")=="A+B_G0_20261104"
assert not bpy.context.scene.get("char_modular_inner_repair"),"Only one repair after first numeric failure"
rig=next(o for o in bpy.context.scene.objects if o.type=="ARMATURE")
pair_rows=list(csv.DictReader((args.audit/"pairs.csv").open(encoding="utf-8-sig")))
seam_rows=list(csv.DictReader((args.audit/"seams.csv").open(encoding="utf-8-sig")))
flagged_names={r[n] for r in pair_rows if r["status"]=="FAIL" and int(r["overlapTrianglePairs"])>0 for n in ("a","b")}
flagged_groups={r[n].split("_")[0] for r in seam_rows if r["status"]=="FAIL" for n in ("a","b")}
rows=[]
for obj in list(bpy.context.scene.objects):
    if obj.type!="MESH" or obj.get("char_modular_source")!="A":continue
    gid=obj["char_modular_group"]
    if gid in SOFT_GROUPS|{"W14"}:continue
    if obj.name not in flagged_names and gid not in flagged_groups:continue
    snap=Snapshot(obj)
    before={"closed":snap.closed,"boundaryVertices":len(snap.boundary_indices),"nonmanifoldEdges":snap.nonmanifold_edges}
    snap.close()
    if before["closed"]:continue
    bone=obj["char_modular_bone"]
    original=sum(len(f.vertices)-2 for f in obj.data.polygons)
    scale=min(abs(s) for s in obj.matrix_world.to_scale())
    for mod in list(obj.modifiers):obj.modifiers.remove(mod)
    mesh=bmesh.new();mesh.from_mesh(obj.data)
    bmesh.ops.remove_doubles(mesh,verts=list(mesh.verts),dist=1e-6/scale)
    bmesh.ops.recalc_face_normals(mesh,faces=list(mesh.faces))
    mesh.to_mesh(obj.data);mesh.free()
    bpy.ops.object.select_all(action="DESELECT");obj.select_set(True);bpy.context.view_layer.objects.active=obj
    mod=obj.modifiers.new("Measured open inner face repair 1.2mm","SOLIDIFY")
    mod.thickness=.0012/scale;mod.offset=-1;mod.use_even_offset=True;mod.use_quality_normals=True
    bpy.ops.object.modifier_apply(modifier=mod.name)
    now=sum(len(f.vertices)-2 for f in obj.data.polygons)
    if now>original:
        mod=obj.modifiers.new("Keep approved whole-hero triangle budget","DECIMATE")
        mod.ratio=original/now;mod.use_collapse_triangulate=True
        bpy.ops.object.modifier_apply(modifier=mod.name)
    rigid_bind(obj,rig,bone)
    obj["char_modular_inner_repair_mm"]=1.2
    snap=Snapshot(obj)
    after={"closed":snap.closed,"boundaryVertices":len(snap.boundary_indices),"nonmanifoldEdges":snap.nonmanifold_edges}
    snap.close()
    rows.append({"object":obj.name,"group":gid,"before":before,"after":after,"innerThicknessMm":1.2,
                 "trianglesBefore":original,"trianglesAfter":sum(len(f.vertices)-2 for f in obj.data.polygons)})
all_parts=[o for o in bpy.context.scene.objects if o.type=="MESH"]
triangles=sum(sum(len(f.vertices)-2 for f in o.data.polygons) for o in all_parts)
assert 25000<=triangles<=40000,triangles
bpy.context.scene["char_modular_inner_repair"]=True
bpy.context.scene["char_modular_numeric_pass"]=False
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(args.blend.resolve()),compress=True)
result={"scope":"Flagged A hard-plate missing-inner-face repair only; numeric recheck required",
        "sourceVariant":"A+B_G0_20261104","plates":rows,"triangles":triangles,"partPlacementChanged":False,
        "BHeadHairChanged":False,"greatswordChanged":False,"texturesGenerated":False,"paidCalls":0}
args.out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("HYBRID_INNER_REPAIR_SAVED",len(rows),"plates; closed",sum(r["after"]["closed"] for r in rows),"triangles",triangles)
