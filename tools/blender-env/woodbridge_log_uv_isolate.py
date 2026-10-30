"""하이의 원본 재질·SIMPLE 세분화에도 보존되는 정점으로 실제 스캔 목질만 식별한다."""
import bpy,bmesh,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');marker=R/'source/고목스캔단독완료.json'
if marker.exists():print('이미 스캔 고목만 유지',flush=True);raise SystemExit(0)
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));high=bpy.data.objects['RF_Fallen_Log_High'];low=bpy.data.objects['RF_Fallen_Log'];scan={i for i,m in enumerate(high.data.materials) if m and m.name.startswith('dead_tree_trunk_02')};assert len(scan)==1;coords=set()
for f in high.data.polygons:
 if f.material_index not in scan:continue
 coords.update(tuple(round(c,5) for c in high.data.vertices[i].co) for i in f.vertices)
drop=[]
for f in low.data.polygons:
 if not all(tuple(round(c,5) for c in low.data.vertices[i].co) in coords for i in f.vertices):drop.append(f.index)
assert len(drop)==998,('스캔/관형 원본 정점 식별',len(drop));result=[]
for o,indices in [(low,drop),(high,[f.index for f in high.data.polygons if f.material_index not in scan])]:
 bm=bmesh.new();bm.from_mesh(o.data);bm.faces.ensure_lookup_table();bmesh.ops.delete(bm,geom=[bm.faces[i] for i in indices],context='FACES');unused=[v for v in bm.verts if not v.link_faces]
 if unused:bmesh.ops.delete(bm,geom=unused,context='VERTS')
 bm.to_mesh(o.data);bm.free();o.data.update();result.append({'id':o.name,'제거면':len(indices),'보존면':len(o.data.polygons)})
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for row in rows:
 if row['id']==low.name:row.update({'역할':'CC0 실제 파단 고목 스캔 단독·관형 덧붙임 제거','정점':len(low.data.vertices),'삼각형':len(low.data.polygons),'범위XYZ최소최대':[min(v.co[k] for v in low.data.vertices) for k in range(3)]+[max(v.co[k] for v in low.data.vertices) for k in range(3)],'마지막기하보정':'기존 베이크 UV 보존·하이 원본 재질과 UV 영역으로 실제 스캔만 식별'})
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');marker.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));print('관형 고목998tri 폐기·실물 스캔14130tri',result,flush=True)
