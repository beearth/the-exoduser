import bpy,sys
from mathutils import Vector,Matrix
import numpy as np
a=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=a[0])
H=[o for o in bpy.context.scene.objects if o.type=='MESH'][0]
bpy.context.view_layer.objects.active=H;H.select_set(True)
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM');bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
co=np.array([tuple(v.co) for v in H.data.vertices]);mn,mx=co.min(0),co.max(0)
H.data.transform(Matrix.Translation(-Vector(((mn[0]+mx[0])/2,(mn[1]+mx[1])/2,mn[2]))));H.data.update()
H.data.remesh_voxel_size=.012;H.data.use_remesh_preserve_attributes=False;bpy.ops.object.voxel_remesh()
print("VOX",len(H.data.vertices),len(H.data.polygons))
bpy.ops.wm.obj_export(filepath=a[1],export_selected_objects=True,export_uv=False,export_normals=False,export_materials=False,forward_axis='Y',up_axis='Z')

