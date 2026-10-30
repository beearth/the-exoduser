"""실제 전체 그루터기의 비례와 접지 식생을 마감하고 북쪽 중경의 큰 형태를 연결한다."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));main=bpy.data.objects.get('배치_RF3_Root_Stump')
if main:main.scale.x=main.scale.y=1.0
for o in list(S.objects):
 if o.name.startswith('중경복귀_'):bpy.data.objects.remove(o,do_unlink=True)
terrain=bpy.data.objects['RF3_Continuous_Bank_Terrain'];ground=BVHTree.FromPolygons([v.co for v in terrain.data.vertices],[tuple(f.vertices)for f in terrain.data.polygons]);x,y=-4.8,11.8;hit,n,ix,d=ground.ray_cast(Vector((x,y,20)),Vector((0,0,-1)),40);src=bpy.data.objects['RF3_Ancient_Tree_A'];q=src.copy();q.data=src.data;S.collection.objects.link(q);q.name='중경복귀_실제거목';q.rotation_mode='XYZ';q.rotation_euler=(0,0,math.radians(25));q.location=(x,y,hit.z);q.scale=(.70,)*3;q.hide_render=False;q.hide_set(False)
wood={bpy.data.objects[r['id']].data for r in rows if any(t in r['id']for t in ['Ancient_Tree','Root_Stump','Fallen_Log','Foreground_Branch','River_Stake','Rotten_Wood_Bridge'])};vs=[];fs=[]
bpy.context.view_layer.update()
for obj in S.objects:
 if obj.type=='MESH'and not obj.hide_render and obj.data in wood:
  a=len(vs);vs.extend(obj.matrix_world@v.co for v in obj.data.vertices);fs.extend(tuple(a+i for i in f.vertices)for f in obj.data.polygons)
bvh=BVHTree.FromPolygons(vs,fs);moss=bpy.data.objects['RF3_Hanging_Moss'].data;fungal=bpy.data.objects['RF3_Fungal_Colony'].data;top=max(v.co.z for v in moss.vertices)
for obj in S.objects:
 if obj.type!='MESH'or obj.hide_render or obj.data not in {moss,fungal}:continue
 anchor=obj.matrix_world@Vector((0,0,top))if obj.data==moss else obj.location.copy();p,no,ix,d=bvh.find_nearest(anchor)
 if p is not None and d<1.5:
  if math.hypot(no.x,no.y)>.1:obj.rotation_euler.z=math.atan2(no.y,no.x)+math.pi/2
  obj.location=p+Vector((no.x*.12,no.y*.12,-top*obj.scale.z))if obj.data==moss else p+Vector((no.x*.015,no.y*.015,-.04))
S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/실제스캔_최종접지구도.png');bpy.ops.render.render(write_still=True)
