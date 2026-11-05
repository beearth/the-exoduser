import bpy,sys,glob,os,math
d=sys.argv[sys.argv.index('--')+1]
for f in ['slash_downward_39f','slash_power_55f','slash_low_56f','melee_horizontal_axe_73f']:
    bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=f'{d}/{f}.fbx')
    a=[o for o in bpy.data.objects if o.type=='ARMATURE'][0];s=bpy.context.scene;fr=a.animation_data.action.frame_range
    bn=lambda k:[b for b in a.pose.bones if b.name.endswith(k)][0]
    R,L,H=bn('RightHand'),bn('LeftHand'),bn('Hips');rows=[]
    for i in range(int(fr[0]),int(fr[1])+1):
        s.frame_set(i);m=a.matrix_world;r,l,h=m@R.head,m@L.head,m@H.head;v=r-l
        # Mixamo forward = -Y in Blender; hand forward of hips
        rows.append((i,-(r.y-h.y),r.z-h.z,-v.y/(v.length or 1),v.z/(v.length or 1),v.x/(v.length or 1),v.length))
    print('CLIP',f)
    for rr in rows[::2]:print('CLIP %3d handFwd=%.2f handUp=%.2f gripFwd=%.2f gripUp=%.2f gripSide=%.2f len=%.2f'%rr)
