import bpy,sys,math,json
d=sys.argv[sys.argv.index('--')+1];out={}
J=['Hips','Spine2','Head','LeftShoulder','LeftForeArm','LeftHand','RightShoulder','RightForeArm','RightHand','LeftUpLeg','LeftLeg','LeftFoot','RightUpLeg','RightLeg','RightFoot']
for f in ['roll_stand','roll_quick_to_run','roll_sprint_forward','chain_falling_to_roll']:
    bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=f'{d}/{f}.fbx')
    a=[o for o in bpy.data.objects if o.type=='ARMATURE'][0];s=bpy.context.scene;fr=a.animation_data.action.frame_range;m=a.matrix_world;b=lambda k:[x for x in a.pose.bones if x.name.endswith(':'+k)][0]
    fs=[]
    for i in range(int(fr[0]),int(fr[1])+1):
        s.frame_set(i);fs.append({k:list((m@b(k).head)) for k in J})
    out[f]=fs
json.dump(out,open(sys.argv[-1] if False else d+'/../rollx.json','w'))
