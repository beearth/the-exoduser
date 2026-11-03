# Cross-check of the facing direction of the 9 non-human rigs (read-only: nothing is written). Run: Blender -b --factory-startup -P this_file.py -- <key> </dev/null
# Prints how the body-mesh centroid moves from idle to the attack_tele peak (wind-up) and to the attack_act/dive_act end (strike), in Blender world raw metres
# of the SOURCE glb (before the +90 degree turn of import-anim-v1.py). Wind-up pulls back (+X), strike goes forward (-X) when the front is world -X.
import bpy, sys, math
from mathutils import Vector
A=sys.argv[sys.argv.index('--')+1:]
key=A[0]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps=60
bpy.ops.import_scene.gltf(filepath='I:/EXODUSER-Storage/boss/enemy3d-20261104/anim/%s_anim_v1.glb'%key)
sc=bpy.context.scene
arm=[o for o in sc.objects if o.type=='ARMATURE'][0]
mesh=[o for o in sc.objects if o.type=='MESH' and o.parent==arm and len(o.data.vertices)>=200][0]
dg=bpy.context.evaluated_depsgraph_get()
def cen(act,f):
    ad=arm.animation_data; ad.action=bpy.data.actions[act]
    if ad.action.slots: ad.action_slot=ad.action.slots[0]
    sc.frame_set(f); e=mesh.evaluated_get(dg); m=e.to_mesh(); mw=e.matrix_world
    pts=[mw@v.co for v in m.vertices]; e.to_mesh_clear()
    c=sum(pts,Vector())/len(pts); 
    # front-most extent: mean of the 5% vertices with min x / min y etc
    return c
tele='attack_tele' if 'attack_tele' in bpy.data.actions else 'dive_tele'
act='attack_act' if 'attack_act' in bpy.data.actions else 'dive_act'
c0=cen('idle',0); c1=cen(tele,int(bpy.data.actions[tele].frame_range[1])); c2=cen(act,int(bpy.data.actions[act].frame_range[1]))
d1=c1-c0; d2=c2-c0
print('LUNGE',key,'tele_peak_shift(x,y)=(%.3f,%.3f)'%(d1.x,d1.y),'act_end_shift(x,y)=(%.3f,%.3f)'%(d2.x,d2.y))
