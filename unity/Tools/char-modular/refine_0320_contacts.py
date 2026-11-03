"""One correction after new-criterion attempt1: scarf curvature + three plates."""
import bpy
import bmesh
import json
from pathlib import Path
import sys
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).parent))
from geometry_metrics import Snapshot
from hybrid_poses import Poses

folder=Path(__file__).parent
bpy.ops.wm.open_mainfile(filepath=str((folder/"Warrior_Modular.blend").resolve()))
rig=next(o for o in bpy.context.scene.objects if o.type=="ARMATURE")
poses=Poses(rig);poses.apply("rest")
head=bpy.data.objects["Warrior_Head"];hair=bpy.data.objects["Warrior_Hair"]
frozen={o.name:[o.matrix_world@v.co for v in o.data.vertices] for o in (head,hair)}
envelope=[]
for label in ("rest","head_left","head_right","head_bow"):
    poses.apply(label);envelope.append(Snapshot(head))
poses.apply("rest")

def clearance(point):
    result=None
    for snap in envelope:
        hit,normal,_,distance=snap.tree.find_nearest(point)
        inside,_=snap.inside(point);signed=-distance if inside else distance
        if result is None or signed<result[0]:result=(signed,hit,normal)
    return result

scarf_rows=[]
for obj in [o for o in bpy.context.scene.objects if o.type=="MESH" and o.get("char_modular_group")=="W23"]:
    bm=bmesh.new();bm.from_mesh(obj.data);inverse=obj.matrix_world.inverted();before=len(bm.faces);splits=0
    for iteration in range(3):
        edges=set()
        for face in bm.faces:
            center=obj.matrix_world@face.calc_center_median()
            if center.z<1.46:continue
            samples=[center]+[(obj.matrix_world@e.verts[0].co+obj.matrix_world@e.verts[1].co)/2 for e in face.edges]
            if min(clearance(v)[0] for v in samples)<.0065:
                edges.update(e for e in face.edges if (obj.matrix_world@e.verts[0].co-obj.matrix_world@e.verts[1].co).length>.012)
        if edges:
            splits+=len(edges);bmesh.ops.subdivide_edges(bm,edges=list(edges),cuts=1,use_grid_fill=True)
            bmesh.ops.triangulate(bm,faces=list(bm.faces))
        for v in bm.verts:
            point=obj.matrix_world@v.co
            if point.z<1.46:continue
            for _ in range(32):
                signed,hit,normal=clearance(point)
                if signed>=.0074:break
                point=hit+normal.normalized()*.008
            v.co=inverse@point
        if not edges and iteration>0:break
    bm.to_mesh(obj.data);bm.free()
    # Reapply the lead's ring weights; no Head influence.
    for group in list(obj.vertex_groups):obj.vertex_groups.remove(group)
    groups={n:obj.vertex_groups.new(name=n) for n in ("neck","Spine","scarf_0","scarf_1","scarf_2")}
    centers={n:rig.matrix_world@rig.data.bones[n].head_local for n in ("scarf_0","scarf_1","scarf_2")}
    for v in obj.data.vertices:
        point=obj.matrix_world@v.co
        if point.z>=1.46:
            groups["neck"].add([v.index],.75,"REPLACE");groups["Spine"].add([v.index],.25,"REPLACE")
        else:
            near=sorted(((point-c).length,n) for n,c in centers.items())[:2];raw=[1/max(.025,d)**4 for d,_ in near]
            for (_,name),weight in zip(near,raw):groups[name].add([v.index],weight/sum(raw),"REPLACE")
    scarf_rows.append({"object":obj.name,"facesBefore":before,"facesAfter":len(obj.data.polygons),"splitEdges":splits})
for snap in envelope:snap.close()

def deepest(moving,other):
    pairs=moving.tree.overlap(other.tree);best=(0.,Vector())
    for source,target,indices,sign in ((moving,other,{i for i,_ in pairs},1),(other,moving,{j for _,j in pairs},-1)):
        if not target.closed:continue
        ids={j for i in indices for j in source.triangles[i]};points=[source.vertices[i] for i in ids]
        for i in indices:
            vertices=[source.vertices[j] for j in source.triangles[i]]
            points.append(sum(vertices,Vector())/3);points.extend((vertices[k]+vertices[(k+1)%3])/2 for k in range(3))
        for point in points:
            if not target.in_box(point):continue
            inside,_=target.inside(point)
            if inside:
                _,normal,_,distance=target.tree.find_nearest(point)
                if distance>best[0]:best=(distance,normal.normalized()*sign)
    return best

shifts=[]
for label,moving_name,other_name in (("arm90","W07_A_007","W09_A_040"),("strike3","W11_A_041","W09_A_076"),("strike1","W05_A_014","W25_UCH03a_Greatsword")):
    poses.apply(label);obj=bpy.data.objects[moving_name];other=bpy.data.objects[other_name]
    one,two=Snapshot(obj),Snapshot(other);distance,direction=deepest(one,two);one.close();two.close()
    amount=max(.001,distance-.0025+.001)
    bone=rig.pose.bones[obj["char_modular_bone"]]
    deform=rig.matrix_world@bone.matrix@rig.data.bones[bone.name].matrix_local.inverted()@rig.matrix_world.inverted()
    delta_rest=deform.to_3x3().inverted()@(direction*amount)
    delta_local=obj.matrix_world.inverted().to_3x3()@delta_rest
    for v in obj.data.vertices:v.co+=delta_local
    obj.data.update()
    shifts.append({"pose":label,"moved":moving_name,"other":other_name,"measuredDepthBeforeMm":distance*1000,"offsetMm":amount*1000,"restOffset":[float(v) for v in delta_rest]})
poses.apply("rest")
for obj in (head,hair):assert max((obj.matrix_world@v.co-p).length for v,p in zip(obj.data.vertices,frozen[obj.name]))<1e-9
triangles=sum(sum(len(f.vertices)-2 for f in o.data.polygons) for o in bpy.context.scene.objects if o.type=="MESH")
assert 25000<=triangles<=40000,triangles
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str((folder/"Warrior_Modular.blend").resolve()),compress=True)
Path("I:/EXODUSER-Storage/char-modular/refine-0320-current.json").write_text(json.dumps({"scope":"one fix after 0320 attempt1, recheck required","scarfAdaptiveCurvature":scarf_rows,"plateOffsets":shifts,"triangles":triangles,"BHeadHairChangeMm":0,"headWeightInScarf":0},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("REFINE_0320_SAVED",triangles,"triangles",shifts)
