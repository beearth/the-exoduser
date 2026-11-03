"""A parts + B head/hair, G0 A-rest alignment, reduction and broad cape tears.
Writes the actual authoring file. No texture generation, Unity or Player.
"""
import argparse
from collections import defaultdict
import bpy
import bmesh
import json
import math
from mathutils import Matrix, Vector
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent))
from hybrid_contract import GROUPS, LATEST_ALIASES, HAND_IDS, TASSETS, SOFT_GROUPS
from modular_bind import auxiliary, rigid_bind, cloth_weights, import_part, fit_static, face_part

p=argparse.ArgumentParser()
p.add_argument("--a", type=Path, required=True)
p.add_argument("--b", type=Path, required=True)
p.add_argument("--rig", type=Path, required=True)
p.add_argument("--joints", type=Path, required=True)
p.add_argument("--weapon", type=Path, required=True)
p.add_argument("--out", type=Path, required=True)
p.add_argument("--receipt", type=Path, required=True)
args=p.parse_args(sys.argv[sys.argv.index("--")+1:])
bpy.ops.wm.open_mainfile(filepath=str(args.b.resolve()))
bpy.context.preferences.filepaths.save_version=0
heads=[o for o in bpy.context.scene.objects if o.name in ("Warrior_Head","Warrior_Hair")]
assert len(heads)==2
for obj in heads:
    world=obj.matrix_world.copy()
    obj.parent=None; obj.matrix_world=world
    for mod in list(obj.modifiers): obj.modifiers.remove(mod)
for obj in list(bpy.context.scene.objects):
    if obj not in heads: bpy.data.objects.remove(obj,do_unlink=True)
bpy.ops.import_scene.fbx(filepath=str(args.rig))
rig=next(o for o in bpy.context.scene.objects if o.type=="ARMATURE")
for obj in list(bpy.context.scene.objects):
    if obj is not rig and obj not in heads:
        bpy.data.objects.remove(obj, do_unlink=True)
rig.animation_data_clear()
for bone in rig.pose.bones:
    for con in list(bone.constraints): bone.constraints.remove(con)
    bone.matrix_basis=Matrix.Identity(4)
bpy.context.view_layer.update()
data=json.loads(args.joints.read_text(encoding="utf-8"))
targets={n:Vector((v[0],-v[2],v[1])) for n,v in zip(data["joints"], data["joint_pos_rest"])}
before_bones={n:list(rig.matrix_world@rig.data.bones[n].head_local) for n in targets}
# Preserve the original A-pose hierarchy/roll. The JSON landmarks are exact G0
# source values; the published table rounds them to millimetres.
bpy.context.view_layer.objects.active=rig
rig.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
for bone in rig.data.edit_bones:
    name=bone.name
    if name not in targets: continue
    head=rig.matrix_world.inverted()@targets[name]
    child=next((c.name for c in bone.children if c.name in targets and c.name!="headfront"), None)
    if child: tail=rig.matrix_world.inverted()@targets[child]
    else:
        delta=bone.tail-bone.head
        tail=head+delta
    bone.head=head; bone.tail=tail
bpy.ops.object.mode_set(mode="OBJECT")
bpy.context.view_layer.update()
bone_rows=[{"bone":n,"beforeErrorMm":(Vector(before_bones[n])-point).length*1000,
            "afterErrorMm":(rig.matrix_world@rig.data.bones[n].head_local-point).length*1000}
           for n,point in targets.items()]

old=set(bpy.context.scene.objects)
bpy.ops.import_scene.gltf(filepath=str(args.a))
raw=[o for o in bpy.context.scene.objects if o not in old and o.type=="MESH"]
assert len(raw)==107, len(raw)
points=[o.matrix_world@Vector(c) for o in raw for c in o.bound_box]
low=Vector(tuple(min(v[i] for v in points) for i in range(3)))
high=Vector(tuple(max(v[i] for v in points) for i in range(3)))
factor=1.85/(high.z-low.z)
center=Vector(((low.x+high.x)/2,(low.y+high.y)/2,low.z))
source_map={i:gid for gid,(_,ids,_) in GROUPS.items() for i in ids}
neutral={}
for family,color in (("Iron",(.18,.19,.20,1)),("Leather",(.14,.12,.10,1)),("Cloth",(.24,.07,.07,1))):
    mat=bpy.data.materials.new("Hybrid_Untextured_"+family); mat.diffuse_color=color; neutral[family]=mat
kept=[]
for obj in raw:
    index=int(obj.name.split("tripo_part_")[1].split(".")[0])
    if index in (3,27):
        bpy.data.objects.remove(obj,do_unlink=True); continue
    transform=obj.matrix_world.copy(); obj.parent=None; obj.matrix_world=Matrix.Identity(4)
    for v in obj.data.vertices: v.co=(transform@v.co-center)*factor
    gid=source_map[index]
    obj.name=gid+"_A_"+str(index).zfill(3)
    obj["char_modular_source"]="A"; obj["char_modular_source_id"]=index
    obj["char_modular_group"]=gid
    family="Cloth" if gid in SOFT_GROUPS else "Leather" if gid=="W14" else "Iron"
    obj.data.materials.clear(); obj.data.materials.append(neutral[family])
    for face in obj.data.polygons: face.material_index=0
    kept.append(obj)
raw=kept

def segment_map(obj, raw_start, raw_end, target_start, target_end):
    first,second=Vector(raw_start),Vector(raw_end)
    target_first,target_second=targets[target_start],targets[target_end]
    old=second-first; new=target_second-target_first
    rotation=old.normalized().rotation_difference(new.normalized())
    for v in obj.data.vertices:
        delta=v.co-first
        along=old*delta.dot(old)/old.length_squared
        v.co=target_first+rotation@(delta-along+along*(new.length/old.length))

for obj in raw:
    gid=obj["char_modular_group"]; index=obj["char_modular_source_id"]
    if gid in ("W06","W08","W10","W12","W17","W19","W21"): side,sign="Left",1
    elif gid in ("W07","W09","W11","W13","W18","W20","W22"): side,sign="Right",-1
    else: continue
    if gid in ("W06","W07","W08","W09"):
        segment_map(obj,(sign*.225,0,1.465),(sign*.282,0,1.265),side+"Arm",side+"ForeArm")
    elif gid in ("W10","W11","W12","W13"):
        if index in HAND_IDS:
            # Retain the generated hand proportions; align wrist without
            # inventing finger bones or a new grip animation.
            offset=targets[side+"Hand"]-Vector((sign*.392,-.07,.975))
            for v in obj.data.vertices: v.co+=offset
        else:
            segment_map(obj,(sign*.282,0,1.265),(sign*.392,-.07,.975),side+"ForeArm",side+"Hand")
    elif gid in ("W17","W18"):
        segment_map(obj,(sign*.155,0,.98),(sign*.183,0,.575),side+"UpLeg",side+"Leg")
    elif gid in ("W19","W20"):
        segment_map(obj,(sign*.183,0,.575),(sign*.250,0,.14),side+"Leg",side+"Foot")
    else:
        offset=targets[side+"Foot"]-Vector((sign*.250,0,.14))
        for v in obj.data.vertices: v.co+=offset

# Remove thin lower fringe by horizontal 30mm silhouette opening and trim
# to ten broad, flat-ended tears. This edits A's cape, not a synthetic cape.
cape=[o for o in raw if o["char_modular_group"]=="W24"]
cape_low=min(v.co.x for o in cape for v in o.data.vertices)
cape_high=max(v.co.x for o in cape for v in o.data.vertices)
grid=.005; intervals=defaultdict(list)
for obj in cape:
    obj.data.calc_loop_triangles()
    for tri in obj.data.loop_triangles:
        coords=[obj.data.vertices[i].co for i in tri.vertices]
        z0,z1=min(v.z for v in coords),max(v.z for v in coords)
        for row in range(math.floor(z0/grid),math.ceil(z1/grid)+1):
            z=row*grid; xs=[]
            for i in range(3):
                u,v=coords[i],coords[(i+1)%3]
                if min(u.z,v.z)<=z<=max(u.z,v.z) and abs(v.z-u.z)>1e-9:
                    xs.append(u.x+(v.x-u.x)*(z-u.z)/(v.z-u.z))
            if len(xs)>=2: intervals[row].append((min(xs),max(xs)))
runs={}
for row, values in intervals.items():
    values.sort(); merged=[]
    for start,end in values:
        if merged and start<=merged[-1][1]+grid: merged[-1][1]=max(end,merged[-1][1])
        else: merged.append([start,end])
    runs[row]=[v for v in merged if v[1]-v[0]>=.03]
removed=0
for obj in cape:
    mesh=bmesh.new(); mesh.from_mesh(obj.data); discard=[]
    for face in mesh.faces:
        c=face.calc_center_median()
        width=(cape_high-cape_low)/10
        u=(c.x-cape_low)/width; tooth=min(9,max(0,int(u))); fraction=u-math.floor(u)
        tip=(.24,.29,.22,.31,.25,.27,.21,.30,.23,.28)[tooth]
        # At least a 30mm flat tip remains before sloping into each notch.
        flat=min(.8,max(.5,.030/width)); edge=(1-flat)/2
        ramp=max(0,(edge-fraction)/max(edge,1e-6),(fraction-(1-edge))/max(edge,1e-6))
        hem=tip+(.43-tip)*min(1,ramp)
        broad=any(a-.005<=c.x<=b+.005 for a,b in runs.get(round(c.z/grid),[]))
        if c.z<hem or (c.z<.95 and not broad): discard.append(face)
    removed+=len(discard)
    bmesh.ops.delete(mesh,geom=discard,context="FACES")
    mesh.to_mesh(obj.data); mesh.free()
removed_cape_ids=[]
kept=[]
for obj in raw:
    if not obj.data.polygons:
        removed_cape_ids.append(obj["char_modular_source_id"])
        bpy.data.objects.remove(obj,do_unlink=True)
    else: kept.append(obj)
raw=kept

# G0 auxiliary chains. All metal pieces remain rigid to exactly one bone.
for side in ("Left","Right"):
    head=targets[side+"Arm"]
    auxiliary(rig,"Modular_Pauldron_"+side,head,head+Vector((0,0,-.2)),side+"Shoulder")
for key,pos in (("fl",(.12,-.12,1.06)),("fr",(-.12,-.12,1.06)),("sl",(.18,0,1.06)),("sr",(-.18,0,1.06)),("b",(0,.12,1.06))):
    auxiliary(rig,"tasset_"+key,pos,Vector(pos)+Vector((0,0,-.23)),"Hips")
chains={}
for group,prefix,columns,origin,step,parent in (
    ("W24","Cape_",3,(0,.17,1.49),(0,.015,-.28),"Spine"),
    ("W16","apron_",2,(0,-.13,1.06),(0,-.01,-.23),"Hips"),
    ("W23","scarf_",1,(0,-.05,1.54),(0,-.01,-.065),"neck"),
    ("W02","RigHair_",2,(0,-.06,1.79),(0,-.02,-.045),"Head")):
    centers={}; count=4 if group=="W24" else 3
    for col in range(columns):
        last=parent
        for row in range(count):
            name=prefix+str(col)+"_"+str(row)
            x=(col-(columns-1)/2)*(.20 if group=="W24" else .10)
            h=Vector(origin)+Vector(step)*row+Vector((x,0,0)); t=h+Vector(step)
            auxiliary(rig,name,h,t,last); centers[name]=(h+t)/2; last=name
    chains[group]=centers

def skin_body(obj):
    for group in list(obj.vertex_groups): obj.vertex_groups.remove(group)
    names=[n for n in targets if n not in ("head_end","headfront")]
    groups={n:obj.vertex_groups.new(name=n) for n in names}
    segments={n:(rig.matrix_world@rig.data.bones[n].head_local,rig.matrix_world@rig.data.bones[n].tail_local) for n in names}
    for v in obj.data.vertices:
        def distance(name):
            start,end=segments[name]; d=end-start
            return (v.co-(start+d*max(0,min(1,(v.co-start).dot(d)/max(d.length_squared,1e-10))))).length
        near=sorted((distance(n),n) for n in names)[:2]
        weights=[1/max(.02,d)**4 for d,_ in near]
        for (_,n),weight in zip(near,weights): groups[n].add([v.index],weight/sum(weights),"REPLACE")
    world=obj.matrix_world.copy(); obj.parent=rig; obj.matrix_world=world
    obj.modifiers.new("A cloth and skin only","ARMATURE").object=rig
    obj["char_modular_role"]="soft"

for obj in heads:
    gid="W01" if obj.name=="Warrior_Head" else "W02"
    obj["char_modular_group"]=gid; obj["char_modular_source"]="B"
    obj["char_modular_source_id"]=-1
    if gid=="W01": rigid_bind(obj,rig,"Head")
    else: cloth_weights(obj,rig,chains[gid],fixed_top=(1.76,"Head"))

min_budget=24; weights={o.name:math.sqrt(len(o.data.polygons)) for o in raw}
for obj in raw:
    index=obj["char_modular_source_id"]; gid=obj["char_modular_group"]
    if gid in ("W06","W07"): weights[obj.name]*=2.0
    if gid in ("W23","W24"): weights[obj.name]*=1.25
budget_total=28000
total_weight=sum(weights.values())
for obj in raw:
    target=max(min_budget,round((budget_total-len(raw)*min_budget)*weights[obj.name]/total_weight)+min_budget)
    count=sum(len(f.vertices)-2 for f in obj.data.polygons)
    if count>target:
        bpy.context.view_layer.objects.active=obj
        mod=obj.modifiers.new("Preserve separate A plate boundaries","DECIMATE")
        mod.ratio=target/count; mod.use_collapse_triangulate=True
        bpy.ops.object.modifier_apply(modifier=mod.name)
    gid=obj["char_modular_group"]; index=obj["char_modular_source_id"]
    bone=GROUPS[gid][2]
    if gid=="W15": bone="tasset_"+TASSETS[index]
    elif gid in ("W12","W13") and index in HAND_IDS: bone=("Left" if gid=="W12" else "Right")+"Hand"
    elif gid=="W21" and index==15: bone="LeftToeBase"
    elif gid=="W22" and index==30:
        tip=face_part(obj,"W22_A_030_toe",lambda c:c.y<-.12)
        tip["char_modular_source_id"]=30
        rigid_bind(tip,rig,"RightToeBase")
        keep=face_part(obj,"W22_A_030_heel",lambda c:c.y>=-.122)
        keep["char_modular_source_id"]=30
        rigid_bind(keep,rig,"RightFoot")
        bpy.data.objects.remove(obj,do_unlink=True)
        continue
    if gid=="W03": skin_body(obj)
    elif gid in chains:
        fixed={"W24":(1.49,"Spine"),"W16":(1.02,"Hips"),"W23":(1.52,"neck")}[gid]
        cloth_weights(obj,rig,chains[gid],fixed_top=fixed)
    else: rigid_bind(obj,rig,bone)

hand=targets["RightHand"]
auxiliary(rig,"hand_r_weapon",hand,hand+Vector((0,0,-.1)),"RightHand")
weapon=import_part(args.weapon,"W25_UCH03a_Greatsword")
fit_static(weapon,(0,0,0),(.24,.055,1.6))
rotation=Vector((0,0,1)).rotation_difference(Vector((0,-.82,-.55)).normalized())
for v in weapon.data.vertices: v.co=rotation@(v.co-Vector((0,0,-.6)))+hand
bpy.context.view_layer.objects.active=weapon
count=sum(len(f.vertices)-2 for f in weapon.data.polygons)
mod=weapon.modifiers.new("Existing sword budget","DECIMATE"); mod.ratio=min(1,3000/count); mod.use_collapse_triangulate=True
bpy.ops.object.modifier_apply(modifier=mod.name)
weapon["char_modular_group"]="W25"; weapon["char_modular_source"]="UCH03a"; weapon["char_modular_source_id"]=-1
rigid_bind(weapon,rig,"hand_r_weapon")

parts=[o for o in bpy.context.scene.objects if o.type=="MESH"]
alignment=[]
for obj in parts:
    gid=obj["char_modular_group"]
    bone=obj.get("char_modular_bone",GROUPS[gid][2])
    frame=rig.matrix_world@rig.data.bones[bone].matrix_local
    world=obj.matrix_world.copy(); obj.data.transform(frame.inverted()@world); obj.matrix_world=frame
    origin_error=(obj.matrix_world.translation-frame.translation).length*1000
    angle=math.degrees(obj.matrix_world.to_quaternion().rotation_difference(frame.to_quaternion()).angle)
    alignment.append({"group":gid,"object":obj.name,"bone":bone,"originErrorMm":origin_error,"rotationErrorDeg":angle})
    obj["char_modular_hybrid"]=True
for gid,(name,ids,bone) in GROUPS.items():
    group=bpy.data.objects.new(gid+"_"+name,None); bpy.context.collection.objects.link(group)
    group["char_modular_logical_group"]=gid; group["char_modular_source_ids"]=json.dumps(ids)
    group.parent=rig; group.matrix_world=rig.matrix_world@rig.data.bones[bone].matrix_local
bpy.context.scene["char_modular_variant"]="A+B_G0_20261104"
bpy.context.scene["char_modular_numeric_pass"]=False
bpy.context.view_layer.update()
triangles=sum(sum(len(f.vertices)-2 for f in o.data.polygons) for o in parts)
assert 25000<=triangles<=40000, triangles
assert all(row["afterErrorMm"]<.01 for row in bone_rows)
args.out.parent.mkdir(parents=True,exist_ok=True)
bpy.data.orphans_purge(do_recursive=True)
receipt={"scope":"A+B authoring assembly before BVH test, not a numeric/design/runtime PASS",
 "variant":"A+B_G0_20261104","rawA":str(args.a),"rawPieces":107,"excludedAHeadHair":[3,27],
 "groups":{k:{"label":v[0],"sourceIds":v[1]} for k,v in GROUPS.items()},"latestBriefAliases":LATEST_ALIASES,
 "logicalGroups":25,"meshObjects":len(parts),"triangles":triangles,"bones":len(rig.data.bones),
 "aScale":factor,"capeRemovedFaces":removed,"capeRemovedSourceIds":removed_cape_ids,"capeBroadTears":10,"capeMinimumFringeWidthMm":30,
 "capeTearScope":"30mm horizontal silhouette opening + ten flat-tip hem cuts; visual judgment pending",
 "boneAlignment":bone_rows,"partAlignment":alignment,
 "texturesGenerated":False,"paidCalls":0,"runtimeApplied":False,"numericPassed":False,
 "weaponScope":"Existing UCH-03a geometry, manually placed grip fixture; not Unity Animator grip validation",
 "parts":[{"name":o.name,"group":o["char_modular_group"],"source":o["char_modular_source"],
           "sourceId":o["char_modular_source_id"],"role":o["char_modular_role"],"bone":o.get("char_modular_bone","soft"),
           "triangles":sum(len(f.vertices)-2 for f in o.data.polygons)} for o in parts]}
args.receipt.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
bpy.ops.wm.save_as_mainfile(filepath=str(args.out.resolve()),compress=True)
print("HYBRID_AUTHORING_SAVED",triangles,"triangles",len(parts),"objects",len(rig.data.bones),"bones; NO BVH PASS YET")
