"""한 줄기의 허브 대신 실제 식생5개를 비대칭 낮은 덤불 모듈로 묶는다."""
import bpy,json,math
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));o=bpy.data.objects['RF_Withered_Shrub']
if len(o.data.polygons)==11925:print('덤불5개 군락 이미 적용',flush=True);raise SystemExit(0)
assert len(o.data.polygons)==2385,'기존 군락을 중복 복제하지 않는다';copies=[o]
for j,(x,y,sc) in enumerate([(-.38,.10,.95),(.36,.12,.82),(.08,-.40,1.05),(-.08,.37,.88)]):
 q=o.copy();q.data=o.data.copy();bpy.context.scene.collection.objects.link(q);q.location=(x,y,0);q.rotation_euler.z=j*1.5+.35;q.scale=(sc,)*3;copies.append(q)
bpy.ops.object.select_all(action='DESELECT')
for q in copies:q.hide_set(False);q.select_set(True)
bpy.context.view_layer.objects.active=o;bpy.ops.object.join();o.hide_render=True;o.hide_set(True);rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for row in rows:
 if row['id']==o.name:row.update({'역할':'CC0 실제 줄기·잎·씨앗5개를 묶은 비대칭 시든 적갈색 덤불','정점':len(o.data.vertices),'삼각형':len(o.data.polygons),'범위XYZ최소최대':[min(v.co[k] for v in o.data.vertices) for k in range(3)]+[max(v.co[k] for v in o.data.vertices) for k in range(3)]})
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));print('실제 식생5개 비대칭 군락',len(o.data.polygons),'삼각형',flush=True)
