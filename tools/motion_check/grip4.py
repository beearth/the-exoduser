import bpy,sys,math
d=sys.argv[sys.argv.index('--')+1]
for f in ['club_combo_2h','sword_combo_2h','slash_combo_gs']:
    bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=f'{d}/{f}.fbx')
    a=[o for o in bpy.data.objects if o.type=='ARMATURE'][0];s=bpy.context.scene;fr=a.animation_data.action.frame_range
    b=lambda k:[x for x in a.pose.bones if x.name.endswith(k)][0];m=a.matrix_world;prev=None;print('G4',f,int(fr[0]),int(fr[1]))
    for i in range(int(fr[0]),int(fr[1])+1):
        s.frame_set(i);P=lambda k:m@b(k).head
        v=(P('RightHandIndex1')-P('RightHandPinky1')).normalized();r=P('RightHand');h=P('Hips');t=r+v*1.7;spd=(t-prev).length if prev is not None else 0;prev=t.copy()
        if i%3==0:print('G4 %3d tipF=%+.2f tipU=%+.2f tipS=%+.2f blade=%+.0f tipSpd=%.2f handU=%+.2f hip=(%+.2f,%+.2f,%+.2f)'%(i,-(t.y-h.y),t.z-h.z,t.x-h.x,math.degrees(math.asin(max(-1,min(1,v.z)))),spd,r.z-h.z,h.x,-h.y,h.z))
