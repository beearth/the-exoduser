"""스캔 주간의 전면에 실제 속빈 부패 공간을 판다. 시험본만 변경."""
import bpy,math
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');bpy.ops.wm.open_mainfile(filepath=str(R/'source/실물주간_형태시험.blend'));S=bpy.context.scene
body=bpy.data.objects['RF_Ancient_Rotten_Tree_High'];band=[v.co for v in body.data.vertices if 1.6<v.co.z<2.8];cx=sorted(p.x for p in band)[len(band)//2];cy=sorted(p.y for p in band)[len(band)//2];print('몸통 중간값',cx,cy,flush=True)
m=bpy.data.materials.new('검게썩은속목질');m.use_nodes=True;bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.023,.012,.005,1);bs.inputs['Roughness'].default_value=.95
for suff in ['', '_High']:
 o=bpy.data.objects['RF_Ancient_Rotten_Tree'+suff];o.hide_set(False);o.data.materials.append(m)
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,location=(cx+.54*.85,cy-.84*.85,2.05));cut=bpy.context.object;cut.name='시험_속빈절삭';cut.scale=(.72,1.7,2.20);cut.rotation_euler.z=math.radians(32.7);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for q in o.data.materials:cut.data.materials.append(q)
 for f in cut.data.polygons:f.material_index=len(cut.data.materials)-1
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;mo=o.modifiers.new('썩어빈기하','BOOLEAN');mo.operation='DIFFERENCE';mo.solver='EXACT';mo.object=cut;before=len(o.data.polygons);bpy.ops.object.modifier_apply(modifier=mo.name);bpy.data.objects.remove(cut,do_unlink=True);assert len(o.data.polygons)>500,'절삭 기하 소실';print('실제 속빈 절삭',suff,before,len(o.data.polygons),flush=True);o.hide_set(True);o.hide_render=True
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/실물주간_형태시험.blend'))
