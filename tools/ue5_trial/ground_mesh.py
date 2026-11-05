import bpy,bmesh,sys,math
from mathutils import noise,Vector
out=sys.argv[sys.argv.index('--')+1]
bpy.ops.wm.read_factory_settings(use_empty=True)
N=480;S=120.0;bm=bmesh.new();bmesh.ops.create_grid(bm,x_segments=N,y_segments=N,size=S/2)
for v in bm.verts:
    p=v.co*0.12;h=noise.fractal(Vector((p.x,p.y,1.7)),.8,2.1,4,noise_basis='PERLIN_ORIGINAL')*.16
    q=v.co*0.9;h+=noise.fractal(Vector((q.x,q.y,5.1)),.7,2.2,3,noise_basis='PERLIN_ORIGINAL')*.018
    v.co.z=h
me=bpy.data.meshes.new('EXO_Ground');bm.to_mesh(me);bm.free();ob=bpy.data.objects.new('EXO_Ground',me);bpy.context.collection.objects.link(ob)
for p in me.polygons:p.use_smooth=True
ob.select_set(True);bpy.context.view_layer.objects.active=ob
bpy.ops.export_scene.fbx(filepath=out,use_selection=True,object_types={'MESH'},mesh_smooth_type='FACE',axis_forward='-Y',axis_up='Z',apply_scale_options='FBX_SCALE_NONE')
print('GROUND',len(me.vertices),len(me.polygons))
