"""03:20 + character lead: fixed B head, scarf-only fit, local topology fixes."""
import argparse
from collections import defaultdict
import json
import math
from pathlib import Path
import sys
import bpy
import bmesh
import numpy as np
from mathutils import Vector, Matrix
sys.path.insert(0,str(Path(__file__).parent))
from geometry_metrics import Snapshot
from hybrid_poses import Poses
from modular_bind import rigid_bind

p=argparse.ArgumentParser();p.add_argument("--blend",type=Path,required=True);p.add_argument("--out",type=Path,required=True)
a=p.parse_args(sys.argv[sys.argv.index("--")+1:])
bpy.ops.wm.open_mainfile(filepath=str(a.blend.resolve()))
assert bpy.context.scene.get("char_modular_variant")=="A+B_G0_20261104"
rig=next(o for o in bpy.context.scene.objects if o.type=="ARMATURE")
poses=Poses(rig);poses.apply("rest")
head=bpy.data.objects["Warrior_Head"]
head_before=[head.matrix_world@v.co for v in head.data.vertices]
head_matrix=head.matrix_world.copy();hair=bpy.data.objects["Warrior_Hair"]
hair_before=[hair.matrix_world@v.co for v in hair.data.vertices]
assert len([b for b in rig.data.bones if b.name.startswith("RigHair_")])==6
topology=[]

def mend(obj,remove_outliers=False):
    scale=min(abs(s) for s in obj.matrix_world.to_scale())
    bone=obj["char_modular_bone"]
    bm=bmesh.new();bm.from_mesh(obj.data)
    removed=0
    if remove_outliers:
        # Proven 4.38m solidify miter spike; do not move legitimate plate vertices.
        if obj.name=="W15_A_018":
            bad=[v for v in bm.verts if (obj.matrix_world@v.co).z<.70 or (obj.matrix_world@v.co).z>1.16]
        else:
            bad=[v for v in bm.verts if not(-.20<=(obj.matrix_world@v.co).x<=.02 and -.19<=(obj.matrix_world@v.co).y<=.12 and 1.23<=(obj.matrix_world@v.co).z<=1.53)]
        removed=len(bad);bmesh.ops.delete(bm,geom=bad,context="VERTS")
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-6/scale)
    bmesh.ops.dissolve_degenerate(bm,edges=list(bm.edges),dist=1e-7/scale)
    excess=0
    for edge in list(bm.edges):
        while edge.is_valid and len(edge.link_faces)>2:
            face=min(edge.link_faces,key=lambda f:f.calc_area())
            bmesh.ops.delete(bm,geom=[face],context="FACES_ONLY");excess+=1
    boundary=[e for e in bm.edges if e.is_boundary]
    filled=bmesh.ops.holes_fill(bm,edges=boundary,sides=0).get("faces",[]) if boundary else []
    if filled:bmesh.ops.triangulate(bm,faces=filled)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    bm.to_mesh(obj.data);bm.free();rigid_bind(obj,rig,bone)
    snap=Snapshot(obj)
    topology.append({"object":obj.name,"removedOutlierVertices":removed,"removedExcessFaces":excess,
                     "closed":snap.closed,"boundaryVertices":len(snap.boundary_indices),"nonmanifoldEdges":snap.nonmanifold_edges})
    snap.close()

for name in ("W15_A_018","W04_A_042","W11_A_041","W13_A_104"):
    mend(bpy.data.objects[name],name in ("W15_A_018","W04_A_042"))

# Remove disconnected sub-3cm thread-like cape fragments; broad original tears stay.
thin=[]
for obj in [o for o in bpy.context.scene.objects if o.type=="MESH" and o.get("char_modular_group")=="W24"]:
    bm=bmesh.new();bm.from_mesh(obj.data);pending=set(bm.verts);discard=[]
    while pending:
        seed=pending.pop();component={seed};stack=[seed]
        while stack:
            v=stack.pop()
            for edge in v.link_edges:
                other=edge.other_vert(v)
                if other in pending:pending.remove(other);component.add(other);stack.append(other)
        points=np.array([tuple(obj.matrix_world@v.co) for v in component])
        if len(points)<3:continue
        centered=points-points.mean(axis=0)
        _,axes=np.linalg.eigh(centered.T@centered)
        spans=np.ptp(centered@axes,axis=0);spans.sort()
        if spans[-1]>.08 and spans[-2]<.03:
            discard.extend(component);thin.append({"object":obj.name,"vertices":len(component),"widthMm":float(spans[-2]*1000),"lengthMm":float(spans[-1]*1000)})
    if discard:bmesh.ops.delete(bm,geom=discard,context="VERTS")
    bm.to_mesh(obj.data);bm.free()

# Build the fixed-head clearance envelope at the lead's exact head poses.
envelope=[]
for label,axis,degrees in (("rest",None,0),("head_left",(0,0,1),35),("head_right",(0,0,1),-35),("head_bow",(1,0,0),20)):
    poses.apply("rest")
    if axis:poses.turn("Head",degrees,axis)
    envelope.append((label,Snapshot(head)))
poses.apply("rest")
renamed={}
for index in range(3):
    old="scarf_0_"+str(index);new="scarf_"+str(index)
    if old in rig.data.bones:rig.data.bones[old].name=new;renamed[old]=new

scarf_rows=[];removed_objects=[]
rest_head=envelope[0][1]
for obj in [o for o in bpy.context.scene.objects if o.type=="MESH" and o.get("char_modular_group")=="W23"]:
    bm=bmesh.new();bm.from_mesh(obj.data)
    inside_faces=[]
    for face in bm.faces:
        center=obj.matrix_world@face.calc_center_median()
        inside,_=rest_head.inside(center)
        if inside:inside_faces.append(face)
    removed_faces=len(inside_faces)
    if inside_faces:bmesh.ops.delete(bm,geom=inside_faces,context="FACES")
    bm.to_mesh(obj.data);bm.free()
    if not obj.data.polygons:
        removed_objects.append(obj.name);bpy.data.objects.remove(obj,do_unlink=True);continue
    inverse=obj.matrix_world.inverted();pushed=0;ring_count=0;clearances=[]
    for v in obj.data.vertices:
        point=obj.matrix_world@v.co
        if point.z<1.46:continue
        ring_count+=1
        # Expose chin/lips in the fixed rest silhouette, retain a high neck wrap.
        if point.y<-.055 and point.z>1.555:point.z=1.555
        changed=False
        for iteration in range(24):
            worst=None
            for _,snap in envelope:
                hit,normal,_,distance=snap.tree.find_nearest(point)
                inside,_=snap.inside(point)
                signed=-distance if inside else distance
                if worst is None or signed<worst[0]:worst=(signed,hit,normal)
            if worst[0]>=.0065:break
            point=worst[1]+worst[2].normalized()*.0075;changed=True
        if changed:pushed+=1
        v.co=inverse@point
        clearances.append(min(snap.tree.find_nearest(point)[3] for _,snap in envelope))
    for group in list(obj.vertex_groups):obj.vertex_groups.remove(group)
    groups={n:obj.vertex_groups.new(name=n) for n in ("neck","Spine","scarf_0","scarf_1","scarf_2")}
    centers={n:rig.matrix_world@rig.data.bones[n].head_local for n in ("scarf_0","scarf_1","scarf_2")}
    for v in obj.data.vertices:
        point=obj.matrix_world@v.co
        if point.z>=1.46:
            groups["neck"].add([v.index],.75,"REPLACE");groups["Spine"].add([v.index],.25,"REPLACE")
        else:
            near=sorted(((point-c).length,n) for n,c in centers.items())[:2]
            values=[1/max(.025,d)**4 for d,_ in near]
            for (_,name),weight in zip(near,values):groups[name].add([v.index],weight/sum(values),"REPLACE")
    obj.data.update()
    scarf_rows.append({"object":obj.name,"removedInsideFaces":removed_faces,"ringVertices":ring_count,"pushedVertices":pushed,
                       "minimumVertexEnvelopeClearanceMm":min(clearances)*1000 if clearances else None,"headWeight":0,"ringWeights":{"neck":.75,"Spine":.25}})
for _,snap in envelope:snap.close()
poses.apply("rest")
head_error=max((head.matrix_world@v.co-before).length for v,before in zip(head.data.vertices,head_before))
hair_error=max((hair.matrix_world@v.co-before).length for v,before in zip(hair.data.vertices,hair_before))
assert head_error<1e-9 and hair_error<1e-9
assert all(len(v.groups)==1 and abs(v.groups[0].weight-1)<1e-6 for o in bpy.context.scene.objects if o.type=="MESH" and o.get("char_modular_role")=="rigid" for v in o.data.vertices)
bpy.context.preferences.filepaths.save_version=0
bpy.context.scene["char_modular_revision"]="0320_rest_growth"
bpy.ops.wm.save_as_mainfile(filepath=str(a.blend.resolve()),compress=True)
parts=[o for o in bpy.context.scene.objects if o.type=="MESH"]
result={"scope":"03:20 + character lead cleanup; new rest-growth test not yet run","headGeometryMaxChangeMm":head_error*1000,
 "headTransformMaxChange":max(abs(head.matrix_world[i][j]-head_matrix[i][j]) for i in range(4) for j in range(4)),
 "hairGeometryMaxChangeMm":hair_error*1000,"hairChains":6,"topologyRepairs":topology,"removedThinCapeComponents":thin,
 "scarf":scarf_rows,"removedScarfObjects":removed_objects,"renamedScarfBones":renamed,
 "triangles":sum(sum(len(f.vertices)-2 for f in o.data.polygons) for o in parts),"bones":len(rig.data.bones),"objects":len(parts),
 "newTextures":False,"paidCalls":0,"playerRun":False,"unityRun":False}
a.out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("CLEANUP_0320_SAVED",result["triangles"],"triangles; B head change",head_error,"scarf deleted objects",removed_objects)
