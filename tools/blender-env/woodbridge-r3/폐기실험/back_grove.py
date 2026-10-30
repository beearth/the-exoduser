"""원화 대비 비어 있던 북쪽 중경을 두 거목과 안개 층으로 연결. 중앙 접근축은 비운다."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene
for o in list(S.objects):
 if o.name.startswith('중경복귀_'):bpy.data.objects.remove(o,do_unlink=True)
terrain=bpy.data.objects['RF3_Continuous_Bank_Terrain'];ground=BVHTree.FromPolygons([v.co for v in terrain.data.vertices],[tuple(f.vertices)for f in terrain.data.polygons])
for j,(id,x,y,sc,yaw)in enumerate([('RF3_Ancient_Tree_A',-5,18.5,.70,25),('RF3_Ancient_Tree_B',4.8,22,.72,200)]):
 h,n,k,d=ground.ray_cast(Vector((x,y,20)),Vector((0,0,-1)),40);src=bpy.data.objects[id];o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='중경복귀_'+id;o.rotation_mode='XYZ';o.rotation_euler=(0,0,math.radians(yaw));o.location=(x,y,h.z if h else .5);o.scale=(sc,sc,sc);o.hide_render=False;o.hide_set(False)
 for i,off in enumerate([(-1.0,-1.0,2.6),(.7,-1.1,4.0)]):
  src=bpy.data.objects['RF3_Hanging_Moss'];q=src.copy();q.data=src.data;S.collection.objects.link(q);q.name='중경복귀_이끼';q.rotation_mode='XYZ';q.location=(x+off[0],y+off[1],off[2]-.9);q.scale=(.8,.8,.8);q.rotation_euler=(0,0,.6+i);q.hide_render=False;q.hide_set(False)
S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/중경숲_검수후보.blend'));S.render.filepath=str(R/'renders/중경숲_밀도복귀검수.png');bpy.ops.render.render(write_still=True)
