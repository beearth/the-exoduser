"""C3b: a Humanoid-ready deform skeleton: DEF bones only, one connected hierarchy, standard names, a root bone. Parts follow it. Twist bones stay children.
blender -b --factory-startup --disable-autoexec EXO_Warrior_C1.blend --python c3b.py -- <outdir>"""
import bpy,sys,os,json
from mathutils import Vector
OUT=sys.argv[sys.argv.index('--')+1];os.makedirs(OUT,exist_ok=True)
sc=bpy.context.scene;src=bpy.data.objects['EXO_Warrior_Rig'];parts=[o for o in sc.objects if o.name.startswith('P_') or '.eye.' in o.name]
NAMES={'DEF-spine':'Hips','DEF-spine.001':'Spine','DEF-spine.002':'Chest','DEF-spine.003':'UpperChest','DEF-spine.004':'Neck','DEF-spine.005':'Neck2','DEF-spine.006':'Head'}
for sd,w in (('L','Left'),('R','Right')):
    NAMES.update({f'DEF-shoulder.{sd}':w+'Shoulder',f'DEF-upper_arm.{sd}':w+'UpperArm',f'DEF-upper_arm.{sd}.001':w+'UpperArmTwist1',f'DEF-upper_arm.{sd}.002':w+'UpperArmTwist2',f'DEF-forearm.{sd}':w+'LowerArm',f'DEF-forearm.{sd}.001':w+'LowerArmTwist1',f'DEF-forearm.{sd}.002':w+'LowerArmTwist2',f'DEF-hand.{sd}':w+'Hand',f'DEF-thigh.{sd}':w+'UpperLeg',f'DEF-thigh.{sd}.001':w+'UpperLegTwist1',f'DEF-thigh.{sd}.002':w+'UpperLegTwist2',f'DEF-shin.{sd}':w+'LowerLeg',f'DEF-shin.{sd}.001':w+'LowerLegTwist1',f'DEF-shin.{sd}.002':w+'LowerLegTwist2',f'DEF-foot.{sd}':w+'Foot',f'DEF-toe.{sd}':w+'Toes'})
PARENT={'Hips':'Root','Spine':'Hips','Chest':'Spine','UpperChest':'Chest','Neck':'UpperChest','Neck2':'Neck','Head':'Neck2'}
for w in ('Left','Right'):
    PARENT.update({w+'Shoulder':'UpperChest',w+'UpperArm':w+'Shoulder',w+'UpperArmTwist1':w+'UpperArm',w+'UpperArmTwist2':w+'UpperArm',w+'LowerArm':w+'UpperArm',w+'LowerArmTwist1':w+'LowerArm',w+'LowerArmTwist2':w+'LowerArm',w+'Hand':w+'LowerArm',w+'UpperLeg':'Hips',w+'UpperLegTwist1':w+'UpperLeg',w+'UpperLegTwist2':w+'UpperLeg',w+'LowerLeg':w+'UpperLeg',w+'LowerLegTwist1':w+'LowerLeg',w+'LowerLegTwist2':w+'LowerLeg',w+'Foot':w+'LowerLeg',w+'Toes':w+'Foot'})
defs=[b.name for b in src.data.bones if b.use_deform];unknown=[d for d in defs if d not in NAMES];print('DEF',len(defs),'UNKNOWN',unknown,flush=True)
g=src.copy();g.data=src.data.copy();g.name='EXO_Game_Rig';g.data.name='EXO_Game_Rig';g.animation_data_clear();sc.collection.objects.link(g);g.hide_viewport=False;g.hide_render=True
g.pose.bones.foreach_get if False else None
bpy.ops.object.select_all(action='DESELECT');g.select_set(True);bpy.context.view_layer.objects.active=g;bpy.ops.object.mode_set(mode='EDIT');eb=g.data.edit_bones
for b in list(eb):
    if b.name not in NAMES:eb.remove(b)
for b in eb:b.use_connect=False;b.parent=None
for old,new in NAMES.items():
    if old in eb:eb[old].name=new
r=eb.new('Root');r.head=(0,0,0);r.tail=(0,0,.2)
for c,p in PARENT.items():
    if c in eb:eb[c].parent=eb[p]
bpy.ops.object.mode_set(mode='OBJECT')
for pb in g.pose.bones:
    for c in list(pb.constraints):pb.constraints.remove(c)
    pb.rotation_mode='QUATERNION';pb.rotation_quaternion=(1,0,0,1) if False else pb.rotation_quaternion
    pb.lock_location=(False,)*3;pb.lock_rotation=(False,)*3;pb.lock_scale=(False,)*3
    pb.location=(0,0,0);pb.rotation_quaternion=(1,0,0,0);pb.scale=(1,1,1)
    if pb.name=='Root':continue
    old=[k for k,v in NAMES.items() if v==pb.name][0];c=pb.constraints.new('COPY_TRANSFORMS');c.target=src;c.subtarget=old
for b in g.data.bones:b.use_deform=b.name!='Root'
# drop drivers/custom shapes copied from the control rig
if g.data.animation_data:g.data.animation_data_clear()
new=[]
for o in parts:
    oo=o.copy();oo.data=o.data.copy();oo.name='G_'+o.name.replace('P_','').replace('GEO-body_male_realistic.','');sc.collection.objects.link(oo);oo.hide_render=False;oo.hide_viewport=False;oo.parent=g
    for vg in oo.vertex_groups:
        if vg.name in NAMES:vg.name=NAMES[vg.name]
    for m in oo.modifiers:
        if m.type=='ARMATURE':m.object=g
        elif m.type=='DATA_TRANSFER':oo.modifiers.remove(m)
    new.append(oo)
rec={'def':len(defs),'unknown':unknown,'bones':len(g.data.bones),'parts':len(new)}
# check: same result as the source rig in each test frame
import numpy as np
def ev(o):
    d=bpy.context.evaluated_depsgraph_get();e=o.evaluated_get(d);m=e.to_mesh();a=np.zeros(len(m.vertices)*3);m.vertices.foreach_get('co',a);e.to_mesh_clear();return a.reshape(-1,3)
pair=[(o,n) for o,n in zip(parts,new)];res={}
for f in (1,2,3):
    sc.frame_set(f);bpy.context.view_layer.update();res[f]=round(max(float(np.linalg.norm(ev(a)-ev(b),axis=1).max()) for a,b in pair)*1000,3);print('FRAME',f,'maxDeltaMm',res[f],flush=True)
rec['max_delta_vs_rigify_mm']=res;json.dump(rec,open(f'{OUT}/c3b.json','w'),indent=1)
sc.frame_set(1);bpy.ops.object.select_all(action='DESELECT')
for o in new:o.select_set(True)
g.select_set(True);bpy.context.view_layer.objects.active=g
bpy.ops.export_scene.fbx(filepath=f'{OUT}/H_C3b.fbx',use_selection=True,object_types={'ARMATURE','MESH'},add_leaf_bones=False,use_armature_deform_only=False,bake_anim=False,mesh_smooth_type='FACE',use_custom_props=False)
bpy.ops.wm.save_as_mainfile(filepath=f'{OUT}/EXO_Warrior_C3b.blend',compress=True,copy=True);print('C3B_DONE',flush=True)
