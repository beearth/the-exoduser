# whole body vs split parts in the same stress pose: is the crease from the weights or from splitting?
import bpy,math,os,sys,json
import numpy as np
from mathutils import Euler,Vector
OUT=sys.argv[sys.argv.index('--')+1]
sc=bpy.context.scene;rig=bpy.data.objects['EXO_Warrior_Rig'];pb=rig.pose.bones
def setr(n,x=0,y=0,z=0):
    b=pb[n];b.rotation_mode='XYZ';b.rotation_euler=Euler((math.radians(x),math.radians(y),math.radians(z)))
P={'upper_arm_fk.L':(75,0,45),'forearm_fk.L':(105,0,0),'upper_arm_fk.R':(-35,0,-55),'forearm_fk.R':(85,0,0),'thigh_fk.L':(-85,0,12),'shin_fk.L':(105,0,0),'foot_fk.L':(-15,0,0),'thigh_fk.R':(35,0,-10),'shin_fk.R':(55,0,0),'spine_fk.001':(10,0,0),'spine_fk.002':(12,15,0),'spine_fk.003':(10,15,0)}
for n,r in P.items():setr(n,*r)
for sd in 'LR':
    for n in (f'upper_arm_parent.{sd}',f'thigh_parent.{sd}'):
        if n in pb and 'IK_FK' in pb[n]:pb[n]['IK_FK']=1.0
body=bpy.data.objects['Body'];parts=[o for o in sc.objects if o.name.startswith('P_')]
mat=bpy.data.materials['body_clay']
cam=sc.camera;PITCH=33;dist=26.14;t=Vector((0,0,.75));yaw=60
dv=Vector((math.sin(math.radians(yaw))*math.cos(math.radians(PITCH)),-math.cos(math.radians(yaw))*math.cos(math.radians(PITCH)),math.sin(math.radians(PITCH))));cam.location=t+dv*dist;cam.rotation_euler=(-dv).to_track_quat('-Z','Y').to_euler()
sc.render.resolution_percentage=500;sc.render.use_border=True;sc.render.use_crop_to_border=True;sc.cycles.samples=32
body.hide_render=False;body.data.materials.clear();body.data.materials.append(mat)
for o in parts:o.hide_render=True
sc.render.filepath=f'{OUT}/cmp-whole.png';bpy.ops.render.render(write_still=True)
body.hide_render=True
for o in parts:o.hide_render=False
sc.render.filepath=f'{OUT}/cmp-split.png';bpy.ops.render.render(write_still=True);print('CMP_DONE')
# per-seam dominant weight check at knee border
