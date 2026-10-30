"""그루터기 위로 뜬 군락을 제거하고 실제 목질 옆면의 낮은 위치에 부착."""
import bpy,math,json,shutil
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;src=bpy.data.objects['RF3_Fungal_Colony'];main=bpy.data.objects['배치_RF3_Root_Stump'];removed=[]
for o in list(S.objects):
 if o.type=='MESH'and not o.hide_render and o.data==src.data and(o.location.xy-main.location.xy).length<4:removed.append(o.name);bpy.data.objects.remove(o,do_unlink=True)
bvh=BVHTree.FromPolygons([main.matrix_world@v.co for v in main.data.vertices],[tuple(f.vertices)for f in main.data.polygons]);placed=[]
for i,(ang,z,scale)in enumerate([(-1.12,.50,.35),(-.20,.92,.32)]):
 direction=Vector((math.cos(ang),math.sin(ang),0));center=Vector((main.location.x,main.location.y,z));hit,n,idx,d=bvh.ray_cast(center+direction*5,-direction,10)
 if hit is None:continue
 o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='접지확정_그루터기균류';o.rotation_mode='XYZ';o.location=hit+Vector((n.x*.015,n.y*.015,-.035));o.rotation_euler=(0,0,math.atan2(n.y,n.x)+math.pi/2);o.scale=(scale,)*3;o.hide_render=False;o.hide_set(False);top=max((o.matrix_world@v.co).z for v in o.data.vertices);placed.append({'이름':o.name,'목질접점':list(hit),'배율':scale,'원래모듈최고Z':max(v.co.z for v in src.data.vertices)})
(R/'source/균류-실제목질접지.json').write_text(json.dumps({'제거한기존군락':removed,'새부착':placed,'의도':'군락 원점을 낮춰 모든 층이 목질의 높이 안에 들도록 측면 Ray 부착. 허공/말뚝 상단 부착 제외','모델UV텍스처변경':0},ensure_ascii=False,indent=2),encoding='utf8');old=R/'renders/승인구도_납품동일_1920x1080.png'
if old.exists():shutil.copyfile(old,R/'renders/FAIL_균류상단부유_1920.png')
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));print('균류 실제 목질 측면 접지',removed,placed,flush=True)
