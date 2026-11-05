import bpy,sys,math
from mathutils import Vector
d=sys.argv[sys.argv.index('--')+1]
for f,fr_list in [('idle_61f',[1,30]),('slash_low_56f',[1,23]),('slash_downward_39f',[1,14,18,21,25])]:
    bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=f'{d}/{f}.fbx')
    a=[o for o in bpy.data.objects if o.type=='ARMATURE'][0];s=bpy.context.scene
    b=lambda k:[x for x in a.pose.bones if x.name.endswith(k)][0]
    locs=[]
    for i in fr_list:
        s.frame_set(i);m=a.matrix_world
        P=lambda k:m@b(k).head
        kr=(P('RightHandIndex1')-P('RightHandPinky1')).normalized();kl=(P('LeftHandIndex1')-P('LeftHandPinky1')).normalized()
        cr=(P('RightHandMiddle1')+P('RightHand'))/2;cl=(P('LeftHandMiddle1')+P('LeftHand'))/2;g=(cr-cl);gl=g.length;g=g.normalized()
        fmt=lambda v:'fwd=%.2f up=%.2f side=%.2f (ang %.0f)'%(-v.y,v.z,v.x,math.degrees(math.atan2(v.z,-v.y)))
        print('G2',f,i,'knuckR',fmt(kr),'| knuckL',fmt(kl),'| palmLine',fmt(g),'len=%.2f'%gl,'R-L dot=%.2f'%kr.dot(kl))
        mr=(a.matrix_world@b('RightHand').matrix).to_3x3().inverted()
        locs.append((mr@kr).normalized())
    avg=sum(locs,Vector())/len(locs)
    print('G2',f,'R-hand local knuckle',tuple(round(c,3) for c in avg.normalized()),'maxdev deg',round(max(math.degrees(l.angle(avg)) for l in locs),2))
