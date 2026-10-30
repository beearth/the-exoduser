"""스캔의 바닥 받침 제거와 전경 가림·이끼 카드 비례를 납품 전에 정리."""
import bpy,bmesh,math,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_베이크입력.blend'));S=bpy.context.scene
fix=[]
for name in ['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B','RF3_Root_Stump']:
 for suff in ['', '_High']:
  o=bpy.data.objects[name+suff];bm=bmesh.new();bm.from_mesh(o.data);bm.normal_update();bad=[f for f in bm.faces if f.calc_center_median().z<1.25 and f.normal.z>.32 and math.hypot(f.calc_center_median().x,f.calc_center_median().y)>1.45]
  if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
  loose=[v for v in bm.verts if not v.link_faces]
  if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')
  bm.to_mesh(o.data);bm.free();fix.append({'id':name+suff,'스캔바닥면제거':len(bad)})
for o in S.objects:
 if o.name.startswith('배치_RF3_Root_Stump'):o.scale=(.80,.80,.72);o.location.z=.03
# 식물 잎 같은 과장된 카드 폭을 축소하고 늘어지는 섬유 비례를 보존한다.
o=bpy.data.objects['RF3_Hanging_Moss'];bm=bmesh.new();bm.from_mesh(o.data);seen=set()
for v in bm.verts:
 if v in seen:continue
 todo=[v];seen.add(v);part=[]
 while todo:
  q=todo.pop();part.append(q)
  for e in q.link_edges:
   w=e.other_vert(q)
   if w not in seen:seen.add(w);todo.append(w)
 cx=sum(q.co.x for q in part)/len(part);cy=sum(q.co.y for q in part)/len(part)
 for q in part:q.co.x=cx+(q.co.x-cx)*.40;q.co.y=cy+(q.co.y-cy)*.40
bm.to_mesh(o.data);bm.free()
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_베이크입력.blend'))
(R/'source/납품전_접지정리.json').write_text(json.dumps(fix,ensure_ascii=False,indent=2),encoding='utf8');print('스캔 받침/전경 가림/카드 폭 정리 완료',flush=True)
