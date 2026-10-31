"""스캔의 최하단 평평한 촬영 바닥을 실제로 절단한다. 보이는 목질 UV는 보존."""
import bpy,bmesh,json
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');marker=R/'source/촬영바닥절단완료.json'
if marker.exists():print('이미 바닥 절단됨. 중복 절단 없음',flush=True);raise SystemExit(0)
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));result=[]
for id in ['RF_Ancient_Rotten_Tree','RF_Gnarled_Split_Trunk','RF_Fractured_Stump','RF_Foreground_Roots']:
 for suffix in ['', '_High']:
  o=bpy.data.objects[id+suffix];before=len(o.data.polygons);bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.00001,plane_co=Vector((0,0,.35)),plane_no=Vector((0,0,1)),clear_inner=True,clear_outer=False)
  for v in bm.verts:v.co.z-=.35
  # 지면 아래 단면은 열린 환경 메시로 둔다. 가짜 원형 받침을 다시 만들지 않는다.
  bmesh.ops.triangulate(bm,faces=list(bm.faces));bad=[f for f in bm.faces if f.calc_area()<1e-9]
  if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
  loose=[v for v in bm.verts if not v.link_faces]
  if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')
  bm.to_mesh(o.data);bm.free();o.data.update();result.append({'id':id+suffix,'전':before,'후':len(o.data.polygons)})
 low=bpy.data.objects[id]
 for row in rows:
  if row['id']==id:row.update({'정점':len(low.data.vertices),'삼각형':len(low.data.polygons),'범위XYZ최소최대':[min(v.co[k] for v in low.data.vertices) for k in range(3)]+[max(v.co[k] for v in low.data.vertices) for k in range(3)],'마지막기하보정':'베이크 이후 최하단 촬영판 .35m 절단·상부 기존UV 보존, 단면은 지면 아래 열린 환경 메시'})
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');marker.write_text(json.dumps({'절단높이':.35,'검사':result},ensure_ascii=False,indent=2),encoding='utf8');bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));print('촬영 바닥 실제 기하 절단4종',result,flush=True)
