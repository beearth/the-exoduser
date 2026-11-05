import bpy,math,sys,json,os
import numpy as np
from mathutils import Euler,Vector
OUT=sys.argv[sys.argv.index('--')+1]
sc=bpy.context.scene;rig=bpy.data.objects['EXO_Warrior_Rig'];pb=rig.pose.bones;body=bpy.data.objects['Body'];parts=[o for o in sc.objects if o.name.startswith('P_')]
# 1. shared vertices: same rest position, same stored normal, same weights?
wn=np.zeros(len(body.data.vertices)*3);body.data.vertex_normals.foreach_get('vector',wn);wn=wn.reshape(-1,3)
gn={g.index:g.name for g in body.vertex_groups}
W=[{gn[e.group]:e.weight for e in v.groups} for v in body.data.vertices]
seen={};maxw=0.0;maxp=0.0;shared=0
for o in parts:
    me=o.data;orig=np.zeros(len(me.vertices),dtype=np.int32);me.attributes['orig'].data.foreach_get('value',orig);gp={g.index:g.name for g in o.vertex_groups}
    for v,i in zip(me.vertices,orig):
        i=int(i);w={gp[e.group]:e.weight for e in v.groups}
        if i in seen:
            shared+=1;maxp=max(maxp,(seen[i][0]-v.co).length);ks=set(w)|set(seen[i][1]);maxw=max(maxw,max(abs(w.get(k,0)-seen[i][1].get(k,0)) for k in ks))
        else:seen[i]=(v.co.copy(),w)
print('SHARED',shared,'maxPosDelta',maxp,'maxWeightDelta',maxw)
# 2. same stress pose, parts take their shading normal from the deformed whole body (what a skinning engine does with one shared normal per vertex)
def setr(n,x=0,y=0,z=0):
    b=pb[n];b.rotation_mode='XYZ';b.rotation_euler=Euler((math.radians(x),math.radians(y),math.radians(z)))
for n,r in {'upper_arm_fk.L':(75,0,45),'forearm_fk.L':(105,0,0),'upper_arm_fk.R':(-35,0,-55),'forearm_fk.R':(85,0,0),'thigh_fk.L':(-85,0,12),'shin_fk.L':(105,0,0),'foot_fk.L':(-15,0,0),'thigh_fk.R':(35,0,-10),'shin_fk.R':(55,0,0),'spine_fk.001':(10,0,0),'spine_fk.002':(12,15,0),'spine_fk.003':(10,15,0)}.items():setr(n,*r)
for sd in 'LR':
    for n in (f'upper_arm_parent.{sd}',f'thigh_parent.{sd}'):
        if n in pb and 'IK_FK' in pb[n]:pb[n]['IK_FK']=1.0
body.hide_viewport=False;body.hide_render=True;
for o in parts:
    m=o.modifiers.new('dt','DATA_TRANSFER');m.object=body;m.use_object_transform=True;m.use_loop_data=True;m.data_types_loops={'CUSTOM_NORMAL'};m.loop_mapping='NEAREST_POLYNOR'
cam=sc.camera;P=33;dist=26.14;t=Vector((0,0,.75));y=60;dv=Vector((math.sin(math.radians(y))*math.cos(math.radians(P)),-math.cos(math.radians(y))*math.cos(math.radians(P)),math.sin(math.radians(P))));cam.location=t+dv*dist;cam.rotation_euler=(-dv).to_track_quat('-Z','Y').to_euler()
sc.render.resolution_percentage=500;sc.render.use_border=True;sc.render.use_crop_to_border=True;sc.cycles.samples=32;sc.render.filepath=f'{OUT}/cmp-transfer.png';bpy.ops.render.render(write_still=True);print('DT_DONE')
