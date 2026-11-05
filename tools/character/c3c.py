"""Slot structure: fixed body parts + items listing the parts they cover, on the Humanoid skeleton. Also: mask coverage recount, vertex delta cause.
blender -b --factory-startup --disable-autoexec EXO_Warrior_C3_structure.blend --python c3c.py -- <outdir>"""
import bpy,bmesh,sys,os,json
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
OUT=sys.argv[sys.argv.index('--')+1];os.makedirs(OUT,exist_ok=True)
sc=bpy.context.scene;col=sc.collection;src=bpy.data.objects['EXO_Warrior_Rig'];body=bpy.data.objects['Body'];me=body.data;rec={}
def save():json.dump(rec,open(f'{OUT}/c3c.json','w'),indent=1,ensure_ascii=False)
V=np.zeros(len(me.vertices)*3);me.vertices.foreach_get('co',V);V=V.reshape(-1,3);FN=np.zeros(len(me.vertices)*3);me.vertex_normals.foreach_get('vector',FN);FN=FN.reshape(-1,3)
fs=np.zeros(len(me.polygons),dtype=np.int32);me.attributes['.sculpt_face_set'].data.foreach_get('value',fs);fc=np.array([tuple(p.center) for p in me.polygons]);fvs=[list(p.vertices) for p in me.polygons];hz=V[:,2].max();brow=hz-.085
head=np.isin(fs,[17,2,3,4,5,7,8,22]);skull=np.isin(fs,[17,2,3,4,5,7,8])&((fc[:,1]>-.045)|(fc[:,2]>brow));PM={'skull':skull,'face':head&~skull,'chest':fs==1,'pelvis':np.isin(fs,[18,19])}
for sd,sg,fu,ff,fh,ft,fsn,fft in (('L',1,21,12,9,24,15,14),('R',-1,20,11,10,23,16,13)):
    PM['upperarm.'+sd]=fs==fu;PM['forearm.'+sd]=fs==ff;PM['hand.'+sd]=(fs==fh)|((fs>=64)&(fc[:,2]>.6)&(np.sign(fc[:,0])==sg));PM['thigh.'+sd]=fs==ft;PM['shin.'+sd]=fs==fsn;PM['foot.'+sd]=(fs==fft)|((fs>=25)&(fs<=63)&(fc[:,2]<.12)&(np.sign(fc[:,0])==sg))
tot=np.zeros(len(fvs),dtype=int)
for m in PM.values():tot+=m.astype(int)
rec['parts']={'count':len(PM),'unassigned_faces':int((tot==0).sum()),'double_faces':int((tot>1).sum())};print('PARTS',rec['parts'],flush=True);save()
# ---- Humanoid rig (same procedure as c3b.py)
NAMES={'DEF-spine':'Hips','DEF-spine.001':'Spine','DEF-spine.002':'Chest','DEF-spine.003':'UpperChest','DEF-spine.004':'Neck','DEF-spine.005':'Neck2','DEF-spine.006':'Head'}
PARENT={'Hips':'Root','Spine':'Hips','Chest':'Spine','UpperChest':'Chest','Neck':'UpperChest','Neck2':'Neck','Head':'Neck2'}
for sd,w in (('L','Left'),('R','Right')):
    NAMES.update({f'DEF-shoulder.{sd}':w+'Shoulder',f'DEF-upper_arm.{sd}':w+'UpperArm',f'DEF-upper_arm.{sd}.001':w+'UpperArmTwist1',f'DEF-upper_arm.{sd}.002':w+'UpperArmTwist2',f'DEF-forearm.{sd}':w+'LowerArm',f'DEF-forearm.{sd}.001':w+'LowerArmTwist1',f'DEF-forearm.{sd}.002':w+'LowerArmTwist2',f'DEF-hand.{sd}':w+'Hand',f'DEF-thigh.{sd}':w+'UpperLeg',f'DEF-thigh.{sd}.001':w+'UpperLegTwist1',f'DEF-thigh.{sd}.002':w+'UpperLegTwist2',f'DEF-shin.{sd}':w+'LowerLeg',f'DEF-shin.{sd}.001':w+'LowerLegTwist1',f'DEF-shin.{sd}.002':w+'LowerLegTwist2',f'DEF-foot.{sd}':w+'Foot',f'DEF-toe.{sd}':w+'Toes'})
    PARENT.update({w+'Shoulder':'UpperChest',w+'UpperArm':w+'Shoulder',w+'UpperArmTwist1':w+'UpperArm',w+'UpperArmTwist2':w+'UpperArm',w+'LowerArm':w+'UpperArm',w+'LowerArmTwist1':w+'LowerArm',w+'LowerArmTwist2':w+'LowerArm',w+'Hand':w+'LowerArm',w+'UpperLeg':'Hips',w+'UpperLegTwist1':w+'UpperLeg',w+'UpperLegTwist2':w+'UpperLeg',w+'LowerLeg':w+'UpperLeg',w+'LowerLegTwist1':w+'LowerLeg',w+'LowerLegTwist2':w+'LowerLeg',w+'Foot':w+'LowerLeg',w+'Toes':w+'Foot'})
# vertex delta cause: b-bones on the source DEF bones?
bb={b.name:b.bbone_segments for b in src.data.bones if b.use_deform};rec['source_bbone_segments']={'max':max(bb.values()),'with_bbone':[k for k,v in bb.items() if v>1]};save();print('BBONE',rec['source_bbone_segments'],flush=True)
g=src.copy();g.data=src.data.copy();g.name='EXO_Game_Rig';g.animation_data_clear();col.objects.link(g);g.hide_viewport=False;g.hide_render=True;g.hide_set(False)
bpy.ops.object.select_all(action='DESELECT');g.select_set(True);bpy.context.view_layer.objects.active=g;bpy.ops.object.mode_set(mode='EDIT');eb=g.data.edit_bones
rest_before={b.name:(tuple(b.head),tuple(b.tail),b.roll) for b in eb if b.name in NAMES}
for b in list(eb):
    if b.name not in NAMES:eb.remove(b)
for b in eb:b.use_connect=False;b.parent=None;b.bbone_segments=1
for o,n in NAMES.items():
    if o in eb:eb[o].name=n
r=eb.new('Root');r.head=(0,0,0);r.tail=(0,0,.2)
for c,p in PARENT.items():
    if c in eb:eb[c].parent=eb[p]
bpy.ops.object.mode_set(mode='OBJECT')
for pb in g.pose.bones:
    for c in list(pb.constraints):pb.constraints.remove(c)
    pb.rotation_mode='QUATERNION';pb.lock_location=(False,)*3;pb.lock_rotation=(False,)*3;pb.lock_scale=(False,)*3;pb.location=(0,0,0);pb.rotation_quaternion=(1,0,0,0);pb.scale=(1,1,1)
for b in g.data.bones:b.use_deform=b.name!='Root'
if g.data.animation_data:g.data.animation_data_clear()
def regroup(o):
    for vg in o.vertex_groups:
        if vg.name in NAMES:vg.name=NAMES[vg.name]
    for m in list(o.modifiers):
        if m.type=='ARMATURE':m.object=g
        elif m.type=='DATA_TRANSFER':o.modifiers.remove(m)
    o.parent=g;o.hide_render=False;o.hide_viewport=False;o.hide_set(False)
# fixed body parts from the weighted body
def part(nm,mask):
    o=body.copy();o.data=me.copy();o.name='P_'+nm+'_slot';col.objects.link(o);bm=bmesh.new();bm.from_mesh(o.data);bm.faces.ensure_lookup_table();il=bm.verts.layers.int.new('orig2')
    for v in bm.verts:v[il]=v.index
    bmesh.ops.delete(bm,geom=[f for f in bm.faces if not mask[f.index]],context='FACES_ONLY');bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS');bm.to_mesh(o.data);bm.free();o.data.update();ov=np.zeros(len(o.data.vertices),dtype=np.int32);o.data.attributes['orig2'].data.foreach_get('value',ov);o.data.normals_split_custom_set_from_vertices([tuple(FN[i]) for i in ov]);regroup(o);o.name='Body_'+nm;return o
BP={k:part(k,m) for k,m in PM.items()}
for k,o in BP.items():o.data.materials.clear()
eyes=[o for o in col.all_objects if '.eye.' in o.name]
for o in eyes:
    for m in list(o.modifiers):
        if m.type=='ARMATURE':m.object=g
    for vg in o.vertex_groups:
        if vg.name in NAMES:vg.name=NAMES[vg.name]
    o.parent=g;o.hide_set(False);o.hide_render=False
ITEMS={'A_helm':('helmet','A',['skull']),'A_chest':('armor','A',['chest']),'A_pauldron.L':('armor','A',[]),'A_pauldron.R':('armor','A',[]),'A_glove.L':('gloves','A',['hand.L']),'A_glove.R':('gloves','A',['hand.R']),'A_greave.L':('boots','A',['shin.L']),'A_greave.R':('boots','A',['shin.R']),
 'B_helm':('helmet','B',['skull']),'B_coat':('armor','B',['chest','pelvis','thigh.L','thigh.R']),'B_shoulder.L':('armor','B',[]),'B_shoulder.R':('armor','B',[]),'B_bracer.L':('gloves','B',[]),'B_bracer.R':('gloves','B',[]),'B_boot.L':('boots','B',['foot.L']),'B_boot.R':('boots','B',['foot.R'])}
objs={k:bpy.data.objects[k] for k in ITEMS}
for o in objs.values():regroup(o)
# ---- coverage: old strict ray vs nearest-surface, per covered part
cov={}
for k,(slot,st,parts) in ITEMS.items():
    o=objs[k];bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.triangulate(bm,faces=bm.faces);tr=BVHTree.FromBMesh(bm);bm.free()
    for p in parts:
        vs=sorted({v for i in np.where(PM[p])[0] for v in fvs[int(i)]});rm=0;nm=0
        for v in vs:
            h=tr.ray_cast(Vector(V[v]),Vector(FN[v]),.4);rm+=h[0] is None
            n=tr.find_nearest(Vector(V[v]));nm+=(n[0] is None) or n[3]>.09
        cov[f'{k}>{p}']={'verts':len(vs),'ray_miss_share':round(rm/len(vs),3),'farther_than_9cm_share':round(nm/len(vs),3)}
rec['coverage']=cov;save();print('COV',{k:(v['ray_miss_share'],v['farther_than_9cm_share']) for k,v in cov.items()},flush=True)
# ---- table + exports
table={'slots_core':['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','ossuary','headband2'],'items':{k:{'slot':v[0],'set':v[1],'covers':v[2]} for k,v in ITEMS.items()},'body_parts':sorted(PM)}
json.dump(table,open(f'{OUT}/slot_table.json','w'),indent=1)
rec['tris']={'body':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in BP.values()),'A':sum(sum(len(p.vertices)-2 for p in objs[k].data.polygons) for k in ITEMS if k[0]=='A'),'B':sum(sum(len(p.vertices)-2 for p in objs[k].data.polygons) for k in ITEMS if k[0]=='B')};save()
for a in [o for o in bpy.data.objects if o.name.startswith(('MA_','MB_','P_','Body')) and o not in BP.values()]:a.hide_set(True)
def exp(ol,path):
    bpy.ops.object.select_all(action='DESELECT')
    for o in ol:o.hide_set(False);o.select_set(True)
    g.select_set(True);bpy.context.view_layer.objects.active=g
    bpy.ops.export_scene.fbx(filepath=path,use_selection=True,object_types={'ARMATURE','MESH'},add_leaf_bones=False,use_armature_deform_only=False,bake_anim=False,mesh_smooth_type='FACE',use_custom_props=False)
exp(list(BP.values())+eyes,f'{OUT}/H_Body.fbx');exp([objs[k] for k in ITEMS if k[0]=='A'],f'{OUT}/S_SetA.fbx');exp([objs[k] for k in ITEMS if k[0]=='B'],f'{OUT}/S_SetB.fbx')
rec['exports']={n:os.path.getsize(f'{OUT}/{n}.fbx') for n in('H_Body','S_SetA','S_SetB')};save()
# ---- delta cause: same frames, same rig shape, with and without b-bones on the Rigify source
for pb in g.pose.bones:
    if pb.name=='Root':continue
    old=[k for k,v in NAMES.items() if v==pb.name][0];c=pb.constraints.new('COPY_TRANSFORMS');c.target=src;c.subtarget=old
def ev(o):
    d=bpy.context.evaluated_depsgraph_get();e=o.evaluated_get(d);m=e.to_mesh();a=np.zeros(len(m.vertices)*3);m.vertices.foreach_get('co',a);e.to_mesh_clear();return a.reshape(-1,3)
def deltas(tag):
    out={}
    for f in (1,3):
        sc.frame_set(f);bpy.context.view_layer.update();A=ev(body);ma=0
        for o in BP.values():
            ov=np.zeros(len(o.data.vertices),dtype=np.int32);o.data.attributes['orig2'].data.foreach_get('value',ov);ma=max(ma,float(np.linalg.norm(A[ov]-ev(o),axis=1).max()))
        out[f]=round(ma*1000,3)
    rec.setdefault('delta_mm',{})[tag]=out;save();print('DELTA',tag,out,flush=True)
body.hide_viewport=False;body.hide_set(False);deltas('source as is')
for b in src.data.bones:
    if b.use_deform:b.bbone_segments=1
bpy.context.view_layer.update();deltas('source bbones off')
print('C3C_DONE',flush=True)
